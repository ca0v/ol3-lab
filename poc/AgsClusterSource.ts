import { Extent } from "@ol/extent";
import { Projection } from "@ol/proj";
import { TileTree } from "./TileTree";
import VectorSource, { LoadingStrategy } from "@ol/source/Vector";
import Geometry from "@ol/geom/Geometry";
import { AgsFeatureLoader } from "./AgsFeatureLoader";
import { XYZ } from "./XYZ";
import Feature from "@ol/Feature";
import Point from "@ol/geom/Point";
import { TileNode } from "./TileNode";

export class AgsClusterSource<
  T extends { count: number; center: [number, number] }
> extends VectorSource<Geometry> {
  private featureLoader: AgsFeatureLoader<T>;
  private loadingStrategy: LoadingStrategy;
  private tree: TileTree<T>;

  constructor(options: {
    strategy: LoadingStrategy;
    url: string;
    maxRecordCount: number;
    maxFetchCount: number;
    tree: TileTree<any>;
  }) {
    const { strategy, url, maxRecordCount, maxFetchCount, tree } = options;
    super({ strategy });
    this.tree = tree;
    this.loadingStrategy = strategy;

    this.featureLoader = new AgsFeatureLoader({
      tree,
      url,
      maxRecordCount,
      maxFetchCount,
    });
  }

  private isNotFirstDraw: true | undefined;

  async loadFeatures(
    extent: Extent,
    resolution: number,
    projection: Projection
  ) {
    const { tree } = this;

    const render = (node: TileNode<T>) => {
      const nodeIdentifier = tree.asXyz(node);
      // do not render if no weight
      //if (0 === node.data.count) return;

      const dz = Z - nodeIdentifier.Z;

      // is this tile a parent?
      if (dz < 1) {
        // do not render if any children
        if (
          !!tree.children(nodeIdentifier).filter((n) => n.data.center).length
        ) {
          //return;
        }
      }

      // is this a child?
      if (dz == 0) {
        // do not render if parent available
        const parentIdentifier = tree.parent(nodeIdentifier);
        const parentNode = tree.findByXYZ(parentIdentifier);
        if (parentNode?.data?.center) {
          //console.log(nodeIdentifier, "yields to", parentIdentifier);
          //return;
        }
      }

      const point = new Point(node.data.center);
      const feature = new Feature();
      feature.setGeometry(point);
      feature.setProperties({
        tileInfo: nodeIdentifier,
        opacity: Math.pow(4, -Math.abs(dz)),
      });
      this.addFeature(feature);
    };

    const extentsToLoad = this.loadingStrategy(
      extent,
      resolution
    ).map((extent) => tree.asXyz(this.tree.find(extent)));
    if (!extentsToLoad.length) return;
    const Z = extentsToLoad[0].Z;

    const unloadedExtents = extentsToLoad.filter(
      (tileIdentifier) => !tree.findByXYZ(tileIdentifier).data.center
    );

    if (!unloadedExtents.length && this.isNotFirstDraw) return;
    this.isNotFirstDraw = true;

    const results = unloadedExtents.map((tileIdentifier) =>
      this.loadTile(tileIdentifier, projection)
    );

    await Promise.all(results);
    this.clear(true);

    tree.visit((a, b) => {
      if (!b.data) return 0;
      if (!b.data.center) return 0;
      render(b);
      return a + 1;
    }, 0);

    console.log("tree", tree.stringify());
  }

  public async loadTile(tileIdentifier: XYZ, projection: Projection) {
    return this.featureLoader.loader(tileIdentifier, projection);
  }
}
