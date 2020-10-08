import { getCenter, Extent } from "@ol/extent";
import type { XYZ } from "./types/XYZ";
import { TileTree } from "./TileTree";
import type { XY, Z } from "./types/XY";
import { explode } from "./fun/explode";
import Feature from "@ol/Feature";
import Geometry from "@ol/geom/Geometry";
import { TINY } from "./fun/tiny";

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

  public setLoaded(tileIdentifier: XYZ, loaded: boolean) {
    this.tree.decorate(tileIdentifier, { loaded });
  }

  public isLoaded(tileIdentifier: XYZ) {
    if (this.tree.decorate<{ loaded: boolean }>(tileIdentifier).loaded || false)
      return true;
    if (0 >= tileIdentifier.Z) return false;
    const loaded = this.isLoaded(this.tree.parent(tileIdentifier)) as boolean;
    this.tree.decorate(tileIdentifier, { loaded });
    return loaded;
  }

  setVisible(feature: Feature<Geometry>, visible = true) {
    debugger;
    const tileIdentifier = feature.get("tileIdentifier") as XYZ;
    if (!tileIdentifier)
      throw "feature has no tile identifier, register using addFeature";
    const wasVisible = feature.get("visible") as boolean;
    if (wasVisible === visible) return;
    feature.set("visible", visible, true);
    this.setStale(tileIdentifier, true);
  }

  addFeature(feature: Feature<Geometry>, id?: string) {
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

    // ignore if already known...a hash would be much better here
    const fid = id ? feature.getProperties()[id] : features.length;
    if (features[fid]) {
      console.warn(`feature already added: ${fid}`);
    }
    features[fid] = feature;

    feature.setProperties({
      tileIdentifier,
      Z: this.findZByExtent(extent),
      type: "feature",
      visible: false,
    });

    this.setStale(tileIdentifier, true);
    return tileIdentifier;
  }

  getFeatures(tileIdentifier: XYZ) {
    // feature "array" is actually a hash
    const { features } = this.tree.decorate<{ features: Feature<Geometry>[] }>(
      tileIdentifier
    );
    if (!features) return [];
    return Object.keys(features).map((id: any) => features[id]);
  }

  findZByExtent(extent: Extent): Z {
    const find = explode(extent);
    const root = explode(this.tree.asExtent());
    const Zw = Math.floor(Math.log2(root.w / find.w) + TINY);
    const Zh = Math.floor(Math.log2(root.h / find.h) + TINY);
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

  private setCenterOfMass(
    tileIdentifier: XYZ,
    com: { darkMass: number; lightMass: number; center: XY }
  ) {
    this.tree.decorate(tileIdentifier, { com });
  }

  private getCenterOfMass(tileIdentifier: XYZ) {
    return (
      this.tree.decorate<{
        com: { darkMass: number; lightMass: number; center: XY };
      }>(tileIdentifier)?.com || null
    );
  }

  getMass(tileIdentifier: XYZ) {
    return this.tree.decorate<{ mass: number }>(tileIdentifier)?.mass || null;
  }

  setMass(tileIdentifier: XYZ, mass: number) {
    const currentMass = this.getMass(tileIdentifier);
    if (currentMass === mass) return;
    if (!!currentMass) throw "mass cannot be destroyed";
    this.tree.decorate(tileIdentifier, { mass });
    this.setStale(tileIdentifier, true);
  }

  areChildrenLoaded(node: XYZ) {
    const { tree } = this;
    return 4 === tree.children(node).length;
  }

  centerOfMass(
    tileIdentifier: XYZ
  ): { center: XY; mass: number; featureMass: number; childMass: number } {
    const tree = this.tree;

    // force tile to exist
    tree.findByXYZ(tileIdentifier, { force: true });

    const children = tree.children(tileIdentifier);

    // get center-of-mass of all children
    const comChildren = children.map((c) => this.centerOfMass(c));

    const childMass = comChildren.reduce((a, b) => a + b.mass, 0);

    if (this.isStale(tileIdentifier)) {
      // get mass of visible child features, reported as negative mass since it takes away from the tile mass
      const massOfVisibleChildFeatures = -comChildren.reduce(
        (a, b) => a + b.featureMass,
        0
      );

      // get mass of visible features
      const massOfVisibleFeatures = this.getLightMatter(tileIdentifier).reduce(
        (a, b) => a + b.mass,
        0
      );

      // get center-of-mass of non-visible features
      const comHiddenFeatures = this.getDarkMatter(tileIdentifier);

      // compute effective center-of-mass
      let center = [0, 0] as XY;
      let mass = 0;
      [...comHiddenFeatures, ...comChildren].forEach((com) => {
        center.forEach((v, i) => (center[i] = v + com.center[i] * com.mass));
        mass += com.mass;
      });

      if (mass === 0) {
        // no sub-matter so use tile center
        center = tree.asCenter(tileIdentifier);
      } else {
        // sub-matter found, use it to define the center-of-mass
        center.forEach((v, i) => (center[i] = v / mass));
      }

      const lightMass = massOfVisibleFeatures + massOfVisibleChildFeatures;
      const hardMass = this.getMass(tileIdentifier);
      const darkMass = null === hardMass ? mass : hardMass - lightMass;
      this.setCenterOfMass(tileIdentifier, {
        darkMass,
        lightMass,
        center: center,
      });
      this.setStale(tileIdentifier, false);
    }

    // this tile is up-to-date
    const com = this.getCenterOfMass(tileIdentifier);
    return {
      center: com.center,
      mass: com.darkMass,
      featureMass: -com.lightMass,
      childMass,
    };
  }

  getFeatureMatter(
    tileIdentifier: XYZ,
    visible = false
  ): Array<{ mass: number; center: XY }> {
    const features = this.getFeatures(tileIdentifier);
    if (!features) return [];

    // only want mass of hidden features
    const hiddenFeatures = features.filter((f) => visible === f.get("visible"));

    return hiddenFeatures.map((f) => {
      const center = getCenter(f.getGeometry()!.getExtent()) as XY;
      const mass = 1;
      return { center, mass };
    });
  }

  getDarkMatter(tileIdentifier: XYZ) {
    return this.getFeatureMatter(tileIdentifier, false);
  }

  getLightMatter(tileIdentifier: XYZ) {
    return this.getFeatureMatter(tileIdentifier, true);
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
