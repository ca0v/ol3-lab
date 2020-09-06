import { getCenter } from "@ol/extent";
import { XYZ } from "./XYZ";
import { TileTree } from "./TileTree";
import { XY } from "./XY";

export class TileTreeExt {
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

    const rootNode = tree.findByXYZ(tileIdentifier, { force: false });
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

    // need to loop through all nodes under this root backward, updating parent
    let center = [0, 0] as XY;
    let mass = 0;

    comValues.forEach((com) => {
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
    if (parent.Z < 0) return;
    this.setStale(parent, true);
  }

  constructor(public tree: TileTree<{ count: number; center: XY }>) {}

  public density(tileIdentifier: XYZ, currentZoomLevel = 0) {
    const { mass } = this.centerOfMass(tileIdentifier);
    return mass * Math.pow(4, tileIdentifier.Z - currentZoomLevel);
  }
}
