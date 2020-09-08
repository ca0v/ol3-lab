import { Extent, getCenter } from "@ol/extent";
import { containsXY } from "@ol/extent";
import { Coordinate } from "@ol/coordinate";
import { explode } from "./fun/explode";
import { asXYZ } from "./fun/asXYZ";
import { asExtent } from "./fun/asExtent";
import type { TileNode } from "./types/TileNode";
import type { XYZ } from "./types/XYZ";
import type { TileTreeState } from "./TileTreeState";
import type { XY } from "./types/XY";

export class TileTree<T> {
  private readonly extent: Extent;
  private readonly root: XYZ;
  private readonly tileCache: Array<Array<Array<TileNode<T>>>>;

  public static create<T extends any>({ extent, data }: TileTreeState<T>) {
    const result = new TileTree<T>({ extent });
    result.load({ extent, data });
    return result;
  }

  constructor(options: { extent: Extent }) {
    this.extent = options.extent;
    this.root = { X: 0, Y: 0, Z: 0 };
    this.tileCache = [[[this.asTileNode()]]];
  }

  asCenter(nodeIdentifier: XYZ): XY {
    return getCenter(this.asExtent(nodeIdentifier)) as XY;
  }

  decorate<Q>(nodeId: XYZ, values?: Q) {
    const result = this.findByXYZ(nodeId, { force: true }).data as T & Q;
    values && Object.assign(result, values);
    return result;
  }

  public load<T>({ extent, data }: TileTreeState<T>) {
    const treeExtent = this.asExtent({ X: 0, Y: 0, Z: 0 });
    if (extent.some((v, i) => v != treeExtent[i])) {
      throw `extent mismatch: ${extent}, ${treeExtent}`;
    }
    data.forEach(([X, Y, Z, data]) => {
      Object.assign(this.findByXYZ({ X, Y, Z }, { force: true }).data, data);
    });
  }

  public save(): TileTreeState<T> {
    const extent = this.asExtent({ X: 0, Y: 0, Z: 0 });
    const data = this.descendants({ X: 0, Y: 0, Z: 0 }).map(
      (v) =>
        [v.X, v.Y, v.Z, this.findByXYZ(v).data] as [number, number, number, T]
    );
    return { extent, data };
  }

  asXyz(extent: Extent): XYZ {
    return asXYZ(this.asExtent({ X: 0, Y: 0, Z: 0 }), extent);
  }

  private asTileNode(): TileNode<T> {
    return { data: {} } as TileNode<T>;
  }

  public asExtent(tileName = { X: 0, Y: 0, Z: 0 }): Extent {
    return asExtent(this.extent, tileName);
  }

  public parent({ X, Y, Z }: XYZ) {
    return { X: Math.floor(X / 2), Y: Math.floor(Y / 2), Z: Z - 1 };
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
      this.tileCache[Z][X][Y] = this.asTileNode();
    }
    return this.tileCache[Z][X][Y] || null;
  }

  public findByPoint(args: { point: Coordinate; zoom: number }): XYZ {
    const { point, zoom: depth } = args;
    const [x, y] = point;
    if (depth < 0) throw "invalid depth";
    if (!containsXY(this.extent, x, y)) {
      throw "point is outside of extent";
    }
    if (0 === depth) return this.root;
    const rootInfo = explode(this.extent);
    const Z = depth;
    const X = Math.floor((Math.pow(2, Z) * (x - rootInfo.xmin)) / rootInfo.w);
    const Y = Math.floor((Math.pow(2, Z) * (y - rootInfo.ymin)) / rootInfo.h);
    return { X, Y, Z };
  }

  public quads({ X, Y, Z }: XYZ) {
    const x = X * 2;
    const y = Y * 2;
    const z = Z + 1;
    const q0 = { X: x, Y: y, Z: z };
    const q1 = { X: x, Y: y + 1, Z: z };
    const q2 = { X: x + 1, Y: y + 1, Z: z };
    const q3 = { X: x + 1, Y: y, Z: z };
    return [q0, q1, q2, q3];
  }

  public children(root: XYZ) {
    return this.quads(root).filter(
      (c) => !!this.findByXYZ(c, { force: false })
    );
  }

  public descendants(input = this.root) {
    const result = [] as XYZ[];
    const Zs = Object.keys(this.tileCache)
      .map((n) => parseInt(n))
      .filter((z) => z > input.Z);
    Zs.forEach((Z) => {
      const pow = Math.pow(2, Z - input.Z);
      const xmin = input.X * pow;
      const xmax = (input.X + 1) * pow;
      const ymin = input.Y * pow;
      const ymax = (input.Y + 1) * pow;

      const Xs = Object.keys(this.tileCache[Z])
        .map((n) => parseInt(n))
        .filter((x) => xmin <= x && x <= xmax);

      Xs.forEach((X) => {
        const Ys = Object.keys(this.tileCache[Z][X])
          .map((n) => parseInt(n))
          .filter((y) => ymin <= y && y <= ymax);

        Ys.forEach((Y) => {
          result.push({ X, Y, Z });
        });
      });
    });

    return result;
  }

  public ensureQuads(xyz: XYZ) {
    return this.quads(xyz).map((c) => this.findByXYZ(c, { force: true }));
  }

  public visit<Q>(cb: (a: Q, b: XYZ) => Q, init: Q): Q {
    let result = init;
    const Zs = Object.keys(this.tileCache);
    Zs.forEach((Z: any) => {
      const Xs = Object.keys(this.tileCache[Z]);
      Xs.forEach((X: any) => {
        const Ys = Object.keys(this.tileCache[Z][X]);
        Ys.forEach((Y: any) => {
          result = cb(result, { X, Y, Z });
        });
      });
    });
    return result;
  }

  public findByExtent(extent: Extent): XYZ {
    const tile = this.asXyz(extent);
    this.findByXYZ(tile, { force: true });
    return tile;
  }
}
