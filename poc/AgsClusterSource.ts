import { Extent } from "@ol/extent";
import { Projection } from "@ol/proj";
import { TileTree, TileTreeExt } from "./TileTree";
import VectorSource, { LoadingStrategy } from "@ol/source/Vector";
import Geometry from "@ol/geom/Geometry";
import { AgsFeatureLoader } from "./AgsFeatureLoader";
import { XYZ } from "./XYZ";
import Feature from "@ol/Feature";
import Point from "@ol/geom/Point";
import { TileNode } from "./TileNode";
import { createXYZ } from "@ol/tilegrid";
import { tile as tileStrategy } from "@ol/loadingstrategy";

const LOOKAHEAD_THRESHOLD = 3; // a zoom offset for cluster data
const MINIMAL_PARENTAL_MASS = 100; // do not fetch children if parent below this mass threshold

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function split<T>(list: Array<T>, splitter: (item: T) => boolean) {
  const yesno = [[], []] as Array<Array<T>>;
  list.forEach((item) => yesno[splitter(item) ? 0 : 1].push(item));
  return yesno;
}

export class AgsClusterSource<
  T extends { count: number; center: [number, number] }
> extends VectorSource<Geometry> {
  private tileSize: number;
  private featureLoader: AgsFeatureLoader<T>;
  private loadingStrategy: LoadingStrategy;
  private tree: TileTree<T>;
  private isFirstDraw: boolean;
  private priorResolution: number;
  private maxRecordCount: number;

  constructor(options: {
    tileSize: number;
    url: string;
    maxRecordCount: number;
    maxFetchCount: number;
    treeTileState: Array<[number, number, number, T]>;
  }) {
    const tileGrid = createXYZ({ tileSize: 512 });
    const strategy = tileStrategy(tileGrid);

    const tree = new TileTree<T>({
      extent: tileGrid.getExtent(),
    });

    const { url, maxRecordCount, maxFetchCount, tileSize } = options;
    super({ strategy });
    this.tree = tree;
    this.tileSize = tileSize;
    this.loadingStrategy = strategy;
    this.isFirstDraw = true;
    this.priorResolution = 0;
    this.maxRecordCount = maxRecordCount;

    this.featureLoader = new AgsFeatureLoader({
      tree,
      url,
      maxRecordCount,
      maxFetchCount,
    });

    tree.load(options.treeTileState);
  }

  async loadFeatures(
    extent: Extent,
    resolution: number,
    projection: Projection
  ) {
    const { tree } = this;
    console.log("request to load features in ", extent, resolution);
    const extentsToLoad = this.loadingStrategy(
      extent,
      resolution
    ).map((extent) => tree.asXyz(extent));

    if (!extentsToLoad.length) {
      console.log("no extents need to be loaded");
      return;
    }
    console.log(extentsToLoad);
    const Z = extentsToLoad[0].Z;

    if (this.isFirstDraw || resolution !== this.priorResolution) {
      console.log("rendering 1st tree");
      this.priorResolution = resolution;
      this.isFirstDraw = false;
      this.renderTree(tree, Z, projection);
    }

    extentsToLoad.forEach(async (tileIdentifier) => {
      if (!tree.findByXYZ(tileIdentifier)) {
        console.log("loading", tileIdentifier);
        await this.loadTile(tileIdentifier, projection);
      }

      const nodes = await this.loadDescendantsUntil(
        tileIdentifier,
        projection,
        (nodeId) => {
          const node = tree.findByXYZ(nodeId);

          const smallEnoughTest = node.data.count < this.maxRecordCount;

          if (!smallEnoughTest) {
            console.log("fetching for more resolution");
          }

          const tooSmallTest = node.data.count < MINIMAL_PARENTAL_MASS;

          if (!tooSmallTest) {
            console.log("lookahead fetching allowed");
          }

          const lookaheadTest = nodeId.Z > Z + LOOKAHEAD_THRESHOLD;

          if (!lookaheadTest) {
            console.log("lookahead fetching", Z, nodeId);
          }

          return smallEnoughTest && (lookaheadTest || tooSmallTest);
        }
      );

      if (nodes.length) {
        console.log("new nodes", nodes);
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
    tree.visit((a, b) => {
      const nodeIdentifier = tree.asXyz(b);
      if (0 === tree.children(nodeIdentifier).length) {
        leafNodes.push(nodeIdentifier);
      }
    }, {} as any);

    this.getFeatures().forEach((f) => f.setProperties({ visible: false }));

    let [keep, remove] = split(leafNodes, (nodeIdentifier) => {
      const node = tree.findByXYZ(nodeIdentifier);
      if (!node.data) return false;
      const mass = node.data.count;
      if (0 >= mass) return false;
      if (!node.data.center) return false;
      return true;
    });

    // anything to render needs to be checked for density issues
    // and pushed into parent as needed
    keep = this.reduce(keep, Z);
    keep.forEach((nodeIdentifier) => this.render(tree, nodeIdentifier, Z));
    remove.forEach((nodeIdentifier) => this.unrender(tree, nodeIdentifier, Z));
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
            .forEach((id) =>
              tree.decorate(tree.asXyz(id), { yieldToParent: true })
            );
        }
      }
    });

    let [leaf, parent] = split(keep, (nodeId) => {
      const { yieldToParent } = tree.decorate<{ yieldToParent: boolean }>(
        nodeId
      );
      if (yieldToParent) {
        console.log(nodeId, "yields to parent");
      }
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

  private async createSyntheticParent(
    tree: TileTree<T>,
    parentIdentifier: { X: number; Y: number; Z: number },
    projection: Projection
  ) {
    let siblings = tree.children(parentIdentifier);
    if (4 === siblings.length) {
      console.log(parentIdentifier, "can be created from", siblings);
      const parentNode = tree.findByXYZ(parentIdentifier, {
        force: true,
      });
      const helper = new TileTreeExt(tree);
      const com = helper.centerOfMass(parentIdentifier);
      parentNode.data.count = parentNode.data.count || com.mass;
      parentNode.data.center = com.center;
      return true;
    }

    await this.loadAllChildren(tree, parentIdentifier, projection);
    siblings = tree.children(parentIdentifier);
    if (4 === siblings.length) {
      return this.createSyntheticParent(tree, parentIdentifier, projection);
    }
    console.warn(parentIdentifier, "cannot have children", siblings);
    return false;
  }

  private async loadAllChildren(
    tree: TileTree<T>,
    nodeIdentifier: XYZ,
    projection: Projection
  ) {
    return Promise.all(
      tree.quads(nodeIdentifier).map((id) => this.loadTile(id, projection))
    );
  }

  public async loadTile(tileIdentifier: XYZ, projection: Projection) {
    return this.featureLoader.loader(tileIdentifier, projection);
  }

  private tileDensity(currentZoomLevel: number, tileIdentifier: XYZ) {
    const { Z } = tileIdentifier;
    return Math.pow(4, currentZoomLevel - Z);
  }

  private unrender(tree: TileTree<T>, nodeIdentifier: XYZ, Z: number) {
    const node = tree.findByXYZ(nodeIdentifier);
    const feature = node.data["feature"] as Feature<Geometry>;
    if (!feature) return;
    feature.setProperties({ visible: false });
  }

  private render(tree: TileTree<T>, nodeIdentifier: XYZ, Z: number) {
    const node = tree.findByXYZ(nodeIdentifier);
    let feature = node.data["feature"] as Feature<Geometry>;
    if (feature) {
      feature.setProperties({ visible: true });
      return;
    }
    if (0 === node.data.count) return;

    const point = new Point(node.data.center);
    feature = new Feature();
    const mass = node.data.count;

    feature.setGeometry(point);
    feature.setProperties({
      visible: true,
      tileInfo: nodeIdentifier,
      text: `${mass}`,
      mass,
      density: this.tileDensity(Z, nodeIdentifier),
    });
    this.addFeature(feature);
    node.data["feature"] = feature;
    console.log("created feature");
  }
}
