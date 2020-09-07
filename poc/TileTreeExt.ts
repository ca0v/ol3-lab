import { getCenter, Extent } from "@ol/extent";
import type { XYZ } from "./types/XYZ";
import { TileTree } from "./TileTree";
import type { XY, Z } from "./types/XY";
import { explode } from "./fun/explode";
import Feature from "@ol/Feature";
import Geometry from "@ol/geom/Geometry";

export class TileTreeExt {
  public readonly minZoom: Z;
  public readonly maxZoom: Z;

  constructor(
    public tree: TileTree<{}>,
    options?: { minZoom: number; maxZoom: number }
  ) {
    this.minZoom = options?.minZoom || 0;
    this.maxZoom = options?.maxZoom || 10;
  }

  setVisible(feature: Feature<Geometry>, visible = true) {
    const { tileIdentifier, visible: wasVisible } = <
      { tileIdentifier: XYZ; visible: boolean }
    >feature.getProperties();
    if (!tileIdentifier)
      throw "feature has no tile identifier, register using addFeature";
    if (wasVisible === visible) return;
    feature.setProperties({ visible }, true);
    this.setStale(tileIdentifier, true);
  }

  addFeature(feature: Feature<Geometry>) {
    const extent = feature.getGeometry()?.getExtent();
    if (!extent) throw "unable to compute extent of feature";

    const tileIdentifier = this.findByExtent(extent);
    let { features } = this.tree.decorate<{ features: Feature<Geometry>[] }>(
      tileIdentifier
    );
    if (!features) {
      features = [];
      this.tree.decorate(tileIdentifier, { features });
    }
    feature.setProperties({
      tileIdentifier,
      Z: this.findZByExtent(extent),
      type: "feature",
    });
    features.push(feature);
    this.setStale(tileIdentifier);
  }

  getFeatures(tileIdentifier: XYZ) {
    return this.tree.decorate<{ features: Feature<Geometry>[] }>(tileIdentifier)
      .features;
  }

  findZByExtent(extent: Extent): Z {
    const find = explode(extent);
    const root = explode(this.tree.asExtent());
    const Zw = Math.floor(Math.log2(root.w / find.w));
    const Zh = Math.floor(Math.log2(root.h / find.h));
    return Math.max(this.minZoom, Math.min(this.maxZoom, Math.min(Zw, Zh)));
  }

  findByExtent(extent: Extent): XYZ {
    const find = explode(extent);
    const root = explode(this.tree.asExtent());

    let Z = this.findZByExtent(extent);
    while (0 <= Z) {
      const pow = Math.pow(2, Z);
      const X = Math.floor((pow * (find.xmin - root.xmin)) / root.w);
      const Y = Math.floor((pow * (find.ymin - root.ymin)) / root.h);
      const Xmax = Math.floor((pow * (find.xmax - root.xmin)) / root.w);
      const Ymax = Math.floor((pow * (find.ymax - root.ymin)) / root.h);
      if (X === Xmax && Y === Ymax) return { X, Y, Z };
      Z--;
    }

    throw "out of bounds";
  }

  getCenter(tileIdentifier: XYZ) {
    return this.tree.decorate<{ center: XY }>(tileIdentifier).center;
  }

  setCenter(tileIdentifier: XYZ, [cx, cy]: XY) {
    this.tree.decorate(tileIdentifier, { center: [cx, cy] });
    this.setStale(tileIdentifier, true);
  }

  getMass(tileIdentifier: XYZ) {
    return this.tree.decorate<{ mass: number }>(tileIdentifier).mass;
  }

  setMass(tileIdentifier: XYZ, mass: number) {
    this.tree.decorate(tileIdentifier, { mass });
    this.setStale(tileIdentifier, true);
  }

  areChildrenLoaded(node: XYZ) {
    const { tree } = this;
    return 4 === tree.children(node).length;
  }

  centerOfMass(tileIdentifier: XYZ): { center: XY; mass: number } {
    const tree = this.tree;

    const rootNode = tree.findByXYZ(tileIdentifier, { force: true });
    if (!rootNode) {
      const center = getCenter(tree.asExtent(tileIdentifier)) as [
        number,
        number
      ];
      const mass = 0;
      return { center, mass };
    }

    if (rootNode && !this.isStale(tileIdentifier)) {
      return {
        center: this.getCenter(tileIdentifier),
        mass: this.getMass(tileIdentifier),
      };
    }

    // compute all children
    const childIdentifiers = tree.children(tileIdentifier);
    const comValues = childIdentifiers.map((c) => this.centerOfMass(c));
    // get mass of non-visible features
    const comFeatures = this.getFeatureCenterOfMass(tileIdentifier);

    // need to loop through all nodes under this root backward, updating parent
    let center = [0, 0] as XY;
    let mass = 0;

    [...comFeatures, ...comValues].forEach((com) => {
      center.forEach((v, i) => (center[i] = v + com.center[i] * com.mass));
      mass += com.mass;
    });

    if (mass === 0) {
      mass = this.getMass(tileIdentifier) || 0;
      center = tree.asCenter(tileIdentifier);
    } else {
      center.forEach((v, i) => (center[i] = v / mass));
    }
    this.setCenter(tileIdentifier, center);
    this.setMass(tileIdentifier, mass);
    this.setStale(tileIdentifier, false);
    return { mass, center };
  }

  getFeatureCenterOfMass(
    tileIdentifier: XYZ
  ): Array<{ mass: number; center: XY }> {
    const features = this.getFeatures(tileIdentifier);
    if (!features) return [];

    // only want mass of hidden features
    const hiddenFeatures = features.filter(
      (f) => false === f.getProperties().visible
    );

    return hiddenFeatures.map((f) => {
      const center = getCenter(f.getGeometry()!.getExtent()) as XY;
      const mass = 1;
      return { center, mass };
    });
  }

  isStale(nodeIdentifier: XYZ) {
    return (
      this.tree.decorate<{ stale: boolean }>(nodeIdentifier).stale !== false
    );
  }

  setStale(nodeIdentifier: XYZ, stale = true) {
    const wasStale = this.tree.decorate<any>(nodeIdentifier).stale;
    if (wasStale === stale) return;
    this.tree.decorate(nodeIdentifier, { stale });
    if (!stale) return;
    const parent = this.tree.parent(nodeIdentifier);
    if (parent.Z < this.minZoom) return;
    this.setStale(parent, true);
  }

  public density(tileIdentifier: XYZ, currentZoomLevel = 0) {
    const { mass } = this.centerOfMass(tileIdentifier);
    return mass * Math.pow(4, tileIdentifier.Z - currentZoomLevel);
  }
}
