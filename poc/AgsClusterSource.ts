import { Extent } from "@ol/extent";
import { Projection } from "@ol/proj";
import { TileTree } from "./TileTree";
import { TileTreeExt } from "./TileTreeExt";
import VectorSource, { LoadingStrategy } from "@ol/source/Vector";
import Geometry from "@ol/geom/Geometry";
import { AgsFeatureLoader } from "./AgsFeatureLoader";
import type { XYZ } from "./XYZ";
import Feature from "@ol/Feature";
import Point from "@ol/geom/Point";
import { createXYZ } from "@ol/tilegrid";
import { tile as tileStrategy } from "@ol/loadingstrategy";
import type { TileTreeState } from "./TileTreeState";
import { split } from "./fun/split";
import { XY } from "./XY";

const LOOKAHEAD_THRESHOLD = 3; // a zoom offset for cluster data

function onlyUnique<T>(value: T, index: number, self: Array<T>) {
  return self.indexOf(value) === index;
}

export class AgsClusterSource<
  T extends { count: number; center: XY }
> extends VectorSource<Geometry> {
  private tileSize: number;
  private featureLoader: AgsFeatureLoader<T>;
  private loadingStrategy: LoadingStrategy;
  private tree: TileTree<T>;
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
    this.tree = tree;
    this.tileSize = tileSize;
    this.loadingStrategy = strategy;
    this.isFirstDraw = true;
    this.priorResolution = 0;

    this.minRecordCount = minRecordCount;
    this.maxRecordCount = maxRecordCount;

    this.featureLoader = new AgsFeatureLoader({
      tree,
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
    ).map((extent) => tree.asXyz(extent));

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
          const node = tree.findByXYZ(nodeId);
          const tooVagueTest = node.data.count > this.maxRecordCount;
          const tooSmallTest = node.data.count < this.minRecordCount;
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

    const allChildren = this.tree.quads(tileIdentifier);

    const unloadedChildren = allChildren.filter(
      (c) => typeof this.tree.findByXYZ(c)?.data.count !== "number"
    );

    await this.loadAllChildren(this.tree, tileIdentifier, projection);

    const grandChildren = await Promise.all(
      allChildren.map((c) => this.loadDescendantsUntil(c, projection, stop))
    );
    return unloadedChildren.concat(...grandChildren);
  }

  private renderTree(tree: TileTree<T>, Z: number, projection: Projection) {
    const leafNodes = [] as Array<XYZ>;
    tree.visit((a, tileIdentifier) => {
      if (0 === tree.children(tileIdentifier).length) {
        leafNodes.push(tileIdentifier);
      }
    }, {} as any);

    this.getFeatures().forEach((f) => f.setProperties({ visible: false }));

    const [keep, remove] = split(leafNodes, (tileIdentifier) => {
      const node = tree.findByXYZ(tileIdentifier);
      if (!node.data) return false;
      const mass = node.data.count;
      if (0 >= mass) return false;
      if (!node.data.center) return false;
      return true;
    });

    // anything to render needs to be checked for density issues
    // and pushed into parent as needed
    this.reduce(keep, Z).forEach((id) => this.render(tree, id, Z));
    remove.forEach((id) => this.unrender(tree, id));
    keep
      .filter((tileIdentifier) => !!tree.decorate<any>(tileIdentifier).features)
      .forEach((id) => this.render(tree, id, Z));

    // turn on all "feature" features for testing
    this.getFeatures()
      .filter((f) => f.getProperties().type === "feature")
      .forEach((f) => f.setProperties({ visible: true }));
  }

  private reduce(keep: Array<XYZ>, Z: number) {
    const { tree } = this;

    keep.forEach((nodeId) => {
      tree.decorate(nodeId, { yieldToParent: false });
    });

    keep.forEach((nodeId) => {
      if (nodeId.Z > Z + LOOKAHEAD_THRESHOLD) {
        if (!tree.decorate<{ yieldToParent: boolean }>(nodeId).yieldToParent) {
          const parentIdentifier = tree.parent(nodeId);
          tree
            .children(parentIdentifier)
            .forEach((id) => tree.decorate(id, { yieldToParent: true }));
        }
      }
    });

    let [leaf, parent] = split(keep, (nodeId) => {
      const { yieldToParent } = tree.decorate<{ yieldToParent: boolean }>(
        nodeId
      );
      return !yieldToParent;
    });

    parent = parent.filter(onlyUnique).map((id) => tree.parent(id));

    parent.forEach((parentIdentifier) => {
      const parentNode = tree.findByXYZ(parentIdentifier, {
        force: true,
      });
      const helper = new TileTreeExt(tree);
      const com = helper.centerOfMass(parentIdentifier);
      parentNode.data.count = parentNode.data.count || com.mass;
      parentNode.data.center = com.center;
    });

    if (parent.length) {
      parent = this.reduce(parent, Z);
    }
    return parent.concat(leaf);
  }

  private async loadAllChildren(
    tree: TileTree<T>,
    tileIdentifier: XYZ,
    projection: Projection
  ) {
    return Promise.all(
      tree.quads(tileIdentifier).map((id) => this.loadTile(id, projection))
    );
  }

  public async loadTile(tileIdentifier: XYZ, projection: Projection) {
    return this.featureLoader.loader(tileIdentifier, projection);
  }

  private tileDensity(currentZoomLevel: number, tileIdentifier: XYZ) {
    const { Z } = tileIdentifier;
    return Math.pow(4, currentZoomLevel - Z);
  }

  private unrender(tree: TileTree<T>, tileIdentifier: XYZ) {
    const { feature } = tree.decorate<{ feature: Feature<Geometry> }>(
      tileIdentifier
    );
    if (!feature) return;
    feature.setProperties({ visible: false });
  }

  private render(tree: TileTree<T>, tileIdentifier: XYZ, Z: number) {
    const node = tree.findByXYZ(tileIdentifier);
    let { feature } = tree.decorate<{ feature: Feature<Geometry> }>(
      tileIdentifier
    );
    if (feature) {
      feature.setProperties({ visible: true });
      return;
    }
    if (0 === node.data.count) return;

    const { features } = tree.decorate<{ features: Feature<Geometry>[] }>(
      tileIdentifier
    );

    if (features) {
      features.forEach((f) =>
        f.setProperties({ visible: true, type: "feature", tileIdentifier })
      );
      this.addFeatures(features);
      return;
    }

    const point = new Point(node.data.center);
    feature = new Feature();
    const mass = node.data.count;

    feature.setGeometry(point);
    feature.setProperties({
      visible: true,
      tileIdentifier,
      text: tree.decorate<{ text: string }>(tileIdentifier).text || `${mass}`,
      type:
        tree.decorate<{ type: "err" | "cluster" }>(tileIdentifier).type ||
        "cluster",
      mass,
      density: this.tileDensity(Z, tileIdentifier),
    });
    this.addFeature(feature);
    tree.decorate(tileIdentifier, { feature });
  }
}
