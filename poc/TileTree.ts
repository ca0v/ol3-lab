import { Extent } from "@ol/extent";
import { containsXY } from "@ol/extent";
import { Coordinate } from "@ol/coordinate";
import { explode } from "./explode";
import { asXYZ } from "./asXYZ";
import { asExtent } from "./asExtent";
import { TileNode } from "./TileNode";
import { isEq } from "./index";

export class TileTree<T> {
  private root: TileNode<T>;
  private tileCache: Array<Array<Array<TileNode<T>>>>;

  constructor(options: { extent: Extent }) {
    this.root = this.asTileNode(options.extent);
    this.tileCache = [[[this.root]]];
  }

  private asTileNode(extent: Extent): TileNode<T> {
    return { extent, data: {} } as TileNode<T>;
  }

  private asXYZ(node: TileNode<T>) {
    const { X, Y, Z } = asXYZ(this.root.extent, node.extent);
    const check = asExtent(this.root.extent, { X, Y, Z });
    if (!check.every((v, i) => isEq(v, node.extent[i]))) throw "invalid extent";
    return { X, Y, Z };
  }

  private asExtent(tileName: { X: number; Y: number; Z: number }) {
    return asExtent(this.root.extent, tileName);
  }

  public parent(node: TileNode<T>) {
    let { X, Y, Z } = this.asXYZ(node);
    X = Math.floor(X / 2);
    Y = Math.floor(Y / 2);
    Z = Z - 1;
    return this.findByXYZ({ X, Y, Z });
  }

  public findByXYZ(
    point: { X: number; Y: number; Z: number },
    options?: { force?: boolean }
  ) {
    const { X, Y, Z } = point;
    if (Z < 0) throw "invalid Z";
    if (X < 0) throw "invalid X";
    if (Y < 0) throw "invalid Y";
    const scale = Math.pow(2, Z);
    if (X >= scale) throw "invalid X";
    if (Y >= scale) throw "invalid Y";

    this.tileCache[Z] = this.tileCache[Z] || [];
    this.tileCache[Z][X] = this.tileCache[Z][X] || [];
    if (!this.tileCache[Z][X][Y] && options?.force) {
      const extent = this.asExtent(point);
      this.tileCache[Z][X][Y] = this.asTileNode(extent);
    }
    return this.tileCache[Z][X][Y];
  }

  public findByPoint(args: { point: Coordinate; zoom: number }): TileNode<T> {
    const { point, zoom: depth } = args;
    const [x, y] = point;
    if (depth < 0) throw "invalid depth";
    if (!containsXY(this.root.extent, x, y)) {
      throw "point is outside of extent";
    }
    if (0 === depth) return this.root;
    const rootInfo = explode(this.root.extent);
    const Z = depth;
    const X = Math.floor((Math.pow(2, Z) * (x - rootInfo.xmin)) / rootInfo.w);
    const Y = Math.floor((Math.pow(2, Z) * (y - rootInfo.ymin)) / rootInfo.h);
    return this.findByXYZ({ X, Y, Z }, { force: true });
  }

  public ensureQuads(root: TileNode<T>) {
    const { X, Y, Z } = this.asXYZ(root);
    const x = X * 2;
    const y = Y * 2;
    const z = Z + 1;
    const q0 = this.findByXYZ({ X: X, Y: Y, Z: z }, { force: true });
    const q1 = this.findByXYZ({ X: X, Y: Y + 1, Z: z }, { force: true });
    const q2 = this.findByXYZ({ X: X + 1, Y: Y + 1, Z: z }, { force: true });
    const q3 = this.findByXYZ({ X: X + 1, Y: Y, Z: z }, { force: true });
    return [q0, q1, q2, q3];
  }

  public visit<Q>(cb: (a: Q, b: TileNode<T>) => Q, init: Q): Q {
    let result = init;
    const Zs = Object.keys(this.tileCache);
    Zs.forEach((Z) => {
      const Xs = Object.keys(this.tileCache[Z]);
      Xs.forEach((X) => {
        const Ys = Object.keys(this.tileCache[Z][X]);
        Ys.forEach((Y) => {
          const node = this.tileCache[Z][X][Y];
          result = cb(result, node);
        });
      });
    });
    return result;
  }

  public find(extent: Extent): TileNode<T> {
    const tile = this.asXYZ({ extent } as TileNode<T>);
    return this.findByXYZ(tile, { force: true });
  }
}
