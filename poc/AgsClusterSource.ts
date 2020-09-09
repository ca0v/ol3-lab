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

  constructor(options: {
    tileSize: number;
    url: string;
    maxRecordCount: number;
    minRecordCount: number;
    treeTileState?: TileTreeState<T>;
  }) {
    const { url, maxRecordCount, minRecordCount, tileSize } = options;
    const tileGrid = createXYZ({ tileSize });
    const strategy = tileStrategy(tileGrid);

    const tree = new TileTree<T>({
      extent: tileGrid.getExtent(),
    });

    options.treeTileState && tree.load(options.treeTileState);

    super({ strategy });
    this.tree = new TileTreeExt(tree, { minZoom: 5, maxZoom: 16 });
    this.tileSize = tileSize;
    this.loadingStrategy = strategy;
    this.isFirstDraw = true;
    this.priorResolution = 0;

    this.minRecordCount = minRecordCount;
    this.maxRecordCount = maxRecordCount;

    this.featureLoader = new AgsFeatureLoader({
      tree: this.tree,
      url,
      minRecordCount,
      maxRecordCount,
    });
  }

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
      this.renderTree(tree, Z, projection);
    }

    if (resolution === this.priorResolution) {
      return;
    }
    this.priorResolution = resolution;

    extentsToLoad.forEach(async (tileIdentifier) => {
      await this.loadTile(tileIdentifier, projection);

      const nodes = await this.loadDescendantsUntil(
        tileIdentifier,
        projection,
        (nodeId) => {
          const mass = tree.getMass(nodeId) || 0;
          const tooVagueTest = mass > this.maxRecordCount;
          const tooSmallTest = mass < this.minRecordCount;
          const tooDeepTest = nodeId.Z >= Z + LOOKAHEAD_THRESHOLD;
          const allowLoad = tooVagueTest || (!tooDeepTest && !tooSmallTest);
          return !allowLoad;
        }
      );

      if (nodes.length) {
        this.renderTree(this.tree, Z, projection);
      }
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

  private renderTree(tree: TileTreeExt, Z: number, projection: Projection) {
    const leafNodes = [] as Array<XYZ>;
    tree.tree.visit((a, tileIdentifier) => {
      if (0 === tree.tree.children(tileIdentifier).length) {
        leafNodes.push(tileIdentifier);
      }
    }, {} as any);

    this.getFeatures().forEach((f) => f.setProperties({ visible: false }));

    const [keep, remove] = split(leafNodes, (tileIdentifier) => {
      const node = tree.tree.findByXYZ(tileIdentifier);
      if (!node.data) return false;
      const mass = tree.getMass(tileIdentifier) || 0;
      if (0 >= mass) return false;
      if (!tree.getCenter(tileIdentifier)) return false;
      return true;
    });

    // anything to render needs to be checked for density issues
    // and pushed into parent as needed
    this.reduce(keep, Z).forEach((id) => this.render(tree, id, Z));
    remove.forEach((id) => this.unrender(tree, id));
    keep
      .filter((tileIdentifier) => !!tree.getFeatures(tileIdentifier))
      .forEach((id) => this.render(tree, id, Z));

    // turn on all "feature" features for testing
    this.getFeatures()
      .filter((f) => f.getProperties().type === "feature")
      .forEach((f) => f.setProperties({ visible: true }));
  }

  private reduce(keep: Array<XYZ>, Z: number) {
    const { tree } = this;

    keep.forEach((nodeId) => {
      tree.tree.decorate(nodeId, { yieldToParent: false });
    });

    keep.forEach((nodeId) => {
      if (nodeId.Z > Z + LOOKAHEAD_THRESHOLD) {
        if (
          !tree.tree.decorate<{ yieldToParent: boolean }>(nodeId).yieldToParent
        ) {
          const parentIdentifier = tree.tree.parent(nodeId);
          tree.tree
            .children(parentIdentifier)
            .forEach((id) => tree.tree.decorate(id, { yieldToParent: true }));
        }
      }
    });

    let [leaf, parent] = split(keep, (nodeId) => {
      const { yieldToParent } = tree.tree.decorate<{ yieldToParent: boolean }>(
        nodeId
      );
      return !yieldToParent;
    });

    parent = parent.filter(onlyUnique).map((id) => tree.tree.parent(id));

    if (parent.length) {
      parent = this.reduce(parent, Z);
    }
    return parent.concat(leaf);
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
    const count = await this.featureLoader.loader(tileIdentifier, projection);
    this.tree.setMass(tileIdentifier, count);
  }

  private tileDensity(currentZoomLevel: number, tileIdentifier: XYZ) {
    const { Z } = tileIdentifier;
    return Math.pow(4, currentZoomLevel - Z);
  }

  private unrender(tree: TileTreeExt, tileIdentifier: XYZ) {
    const { feature } = tree.tree.decorate<{ feature: Feature<Geometry> }>(
      tileIdentifier
    );
    if (!feature) return;
    feature.setProperties({ visible: false });
  }

  private render(tree: TileTreeExt, tileIdentifier: XYZ, Z: number) {
    let { feature } = tree.tree.decorate<{ feature: Feature<Geometry> }>(
      tileIdentifier
    );
    if (feature) {
      feature.setProperties({ visible: true });
      return;
    }
    if (!tree.getMass(tileIdentifier)) return;

    const features = tree.getFeatures(tileIdentifier);

    if (features) {
      features.forEach((f) =>
        f.setProperties({ visible: true, type: "feature", tileIdentifier })
      );
      this.addFeatures(features);
      return;
    }

    const point = new Point(tree.getCenter(tileIdentifier));
    feature = new Feature();
    const mass = tree.getMass(tileIdentifier);

    feature.setGeometry(point);
    feature.setProperties({
      visible: true,
      tileIdentifier,
      text:
        tree.tree.decorate<{ text: string }>(tileIdentifier).text || `${mass}`,
      type:
        tree.tree.decorate<{ type: "err" | "cluster" }>(tileIdentifier).type ||
        "cluster",
      mass,
      density: this.tileDensity(Z, tileIdentifier),
    });
    this.addFeature(feature);
    tree.tree.decorate(tileIdentifier, { feature });
  }
}
