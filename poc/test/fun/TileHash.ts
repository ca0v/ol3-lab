import { XYZ } from "poc/types/XYZ";

export class TileHash {
  private tileHash: any = {};
  add(id: XYZ) {
    const Z = (this.tileHash[id.Z] = this.tileHash[id.Z] || []);
    const X = (Z[id.X] = Z[id.X] || []);
    const Y = (X[id.Y] = (X[id.Y] || 0) + 1);
    return Y;
  }

  clear() {
    this.tileHash = {};
  }

  items(): Array<XYZ> {
    const result = [] as XYZ[];
    const Zs = Object.keys(this.tileHash).map((n) => parseInt(n));
    Zs.forEach((Z) => {
      const Xs = Object.keys(this.tileHash[Z]).map((n) => parseInt(n));
      Xs.forEach((X) => {
        const Ys = Object.keys(this.tileHash[Z][X]).map((n) => parseInt(n));
        Ys.forEach((Y) => {
          result.push({ X, Y, Z });
        });
      });
    });
    return result;
  }
}
