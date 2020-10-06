/***
 * This is a data source that utilizes a "count" loading strategy to prevent
 * loading too many fetures into the source and onto the map
 */
import { Extent } from "@ol/extent";
import { Projection } from "@ol/proj";
import { TileTree } from "./TileTree";
import { TileTreeExt } from "./TileTreeExt";
import VectorSource, { LoadingStrategy } from "@ol/source/Vector";
import Geometry from "@ol/geom/Geometry";
import { AgsFeatureLoader } from "./AgsFeatureLoader";
import type { XYZ } from "./types/XYZ";
import Feature from "@ol/Feature";
import Point from "@ol/geom/Point";
import { createXYZ } from "@ol/tilegrid";
import { tile as tileStrategy } from "@ol/loadingstrategy";
import type { TileTreeState } from "./TileTreeState";
import { split } from "./fun/split";
import type { XY } from "./types/XY";

const LOOKAHEAD_THRESHOLD = 3; // a zoom offset for cluster data

function onlyUnique<T>(value: T, index: number, self: Array<T>) {
  return self.indexOf(value) === index;
}

interface AgsClusterSourceOptions {
  /**
   * the width and height of of the tile to query, in pixels
   */
  tileSize: number;
  /**
   * A AGS-compatible FeatureServer endpoint identifing a query service
   * e.g. http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Petroleum/KSFields/FeatureServer/0/query
   */
  url: string;
  /**
   * How deep are you willing to look ahead?  This grows to the power of 4 so be careful...good for ensuring
   * all features get loaded but can result in server timeouts without proper throttling
   */
  maxDepth: number;
  /**
   * By default services have a maxRecordCount of 1000, this is that value but renamed because it represents
   * the minimum count necessary before invoking a feature query.
   */
  minRecordCount: number;
  /**
   * This is the minimum zoom level for this source, constraining queries beyond this
   * 2D features that cover multiple tiles at this level can still be assigned to levels >= 0
   */
  minZoom: number;
  /**
   * This is the maximum zoom level for this source, constraining queries beyond this
   * Point features will be assigned to tiles at this level
   */
  maxZoom: number;
}

/**
 * Vector Source for managing cluster features and actual features
 * to present the user with a performant layer when large amounts of data
 * reside in the feature service
 */
export class AgsClusterSource<
  T extends { count: number; center: XY }
> extends VectorSource<Geometry> {
  private tileSize: number;
  private featureLoader: AgsFeatureLoader;
  private loadingStrategy: LoadingStrategy;
  private tree: TileTreeExt;
  private isFirstDraw: boolean;
  private priorResolution: number;
  private maxRecordCount: number;
  private minRecordCount: number;

  constructor(
    options: AgsClusterSourceOptions & { treeTileState?: TileTreeState<T> }
  ) {
    const {
      url,
      minRecordCount,
      tileSize,
      maxDepth,
      minZoom,
      maxZoom,
    } = options;

    // this is the built-in strategy for determining which tiles to query
    const tileGrid = createXYZ({ tileSize });
    const strategy = tileStrategy(tileGrid);

    // this is the ol-independent tiling system for managing cluster and feature data
    const tree = new TileTree<T>({
      extent: tileGrid.getExtent(),
    });

    // tree state can be cached to pre-populate light but expensive query results
    options.treeTileState && tree.load(options.treeTileState);

    super({ strategy });

    // this is a helper extension to the tree that manages "weight" related computations/data
    this.tree = new TileTreeExt(tree, { minZoom, maxZoom });
    this.tileSize = tileSize;
    this.loadingStrategy = strategy;
    this.isFirstDraw = true;
    this.priorResolution = 0;

    this.minRecordCount = minRecordCount;
    this.maxRecordCount = minRecordCount;

    // this is the loader that actually queries the feature service and adds features
    // to tiles that spatially contain them...by "tile" I mean a TileTree data container
    // and not a visual tile on the map.
    this.featureLoader = new AgsFeatureLoader({
      tree: this.tree,
      url,
      maxDepth,
      minRecordCount,
    });
  }

  /**
   * Loads features into this source to be rendered on a map
   * The resolution and projection are convenient ways of specifying the Z level
   * but I would rather be providing a Z level.
   * @param extent load TileTree tiles within this extent
   * @param resolution for this resolution
   * @param projection for this spatial referencing system
   */
  async loadFeatures(
    extent: Extent,
    resolution: number,
    projection: Projection
  ) {
    const { tree } = this;
    const extentsToLoad = this.loadingStrategy(
      extent,
      resolution
    ).map((extent) => tree.tree.asXyz(extent));

    if (!extentsToLoad.length) {
      return;
    }
    const Z = extentsToLoad[0].Z;

    if (this.isFirstDraw) {
      this.isFirstDraw && console.log("rendering 1st tree");
      this.isFirstDraw = false;
      this.renderTree(tree);
    }

    if (resolution === this.priorResolution) {
      return;
    }
    this.priorResolution = resolution;

    extentsToLoad.forEach(async (tileIdentifier) => {
      await this.loadTile(tileIdentifier, projection);

      await this.loadDescendantsUntil(tileIdentifier, projection, (nodeId) => {
        const mass = tree.getMass(nodeId) || 0;
        const tooVagueTest = mass > this.maxRecordCount;
        const tooSmallTest = mass < this.minRecordCount;
        const tooDeepTest = nodeId.Z >= Z + LOOKAHEAD_THRESHOLD;
        const allowLoad = tooVagueTest || (!tooDeepTest && !tooSmallTest);
        return !allowLoad;
      });
    });
  }

  private async loadDescendantsUntil(
    tileIdentifier: XYZ,
    projection: Projection,
    stop: (tileIdentifier: XYZ) => boolean
  ): Promise<XYZ[]> {
    if (stop(tileIdentifier)) return [] as XYZ[];

    const allChildren = this.tree.tree.quads(tileIdentifier);

    const unloadedChildren = allChildren.filter(
      (c) => typeof this.tree.getMass(c) !== "number"
    );

    await this.loadAllChildren(this.tree, tileIdentifier, projection);

    const grandChildren = await Promise.all(
      allChildren.map((c) => this.loadDescendantsUntil(c, projection, stop))
    );
    return unloadedChildren.concat(...grandChildren);
  }

  /**
   * TODO...
   * Not sure what I was thinking...the tiles contain the features and also represent the clusters
   * but why am I waiting until now to add them to the source?  And where am I creating the cluster
   * markers?  I thought I already coded this but I guess I was thinking of my test code.
   * So...who manages actually adding features to the source...the loader puts them in tiles
   * but what puts them in source?  Why not the loader?  For now I will just populate
   * the features each time a tile loads...
   */
  private renderTree(tree: TileTreeExt) {
    const tileNodes = tree.tree.descendants();
    tileNodes.forEach((id) => {
      const features = tree.getFeatures(id);
      if (features.length) {
        features.forEach((f) => f.set("visible", true));
        this.addFeatures(features);
      }
    });
  }

  private async loadAllChildren(
    tree: TileTreeExt,
    tileIdentifier: XYZ,
    projection: Projection
  ) {
    return Promise.all(
      tree.tree.quads(tileIdentifier).map((id) => this.loadTile(id, projection))
    );
  }

  public async loadTile(tileIdentifier: XYZ, projection: Projection) {
    await this.featureLoader.loader(tileIdentifier, projection);
    this.renderTree(this.tree);
  }
}
