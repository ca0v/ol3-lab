import { Extent, applyTransform, getCenter } from "@ol/extent";
import { containsXY } from "@ol/extent";
import { Coordinate } from "@ol/coordinate";
import { explode } from "./explode";
import { asXYZ } from "./asXYZ";
import { asExtent } from "./asExtent";
import { TileNode } from "./TileNode";
import { isEq } from "./index";
import { XYZ } from "./XYZ";

export class TileTree<T> {
  asXyz(tile: TileNode<T>): import("poc/XYZ").XYZ {
    return asXYZ(this.root.extent, tile.extent);
  }
  private readonly root: TileNode<T>;
  private readonly tileCache: Array<Array<Array<TileNode<T>>>>;

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

  private quads({ X, Y, Z }: XYZ) {
    const x = X * 2;
    const y = Y * 2;
    const z = Z + 1;
    const q0 = { X: X, Y: Y, Z: z };
    const q1 = { X: X, Y: Y + 1, Z: z };
    const q2 = { X: X + 1, Y: Y + 1, Z: z };
    const q3 = { X: X + 1, Y: Y, Z: z };
    return [q0, q1, q2, q3];
  }

  public children(root: XYZ) {
    return this.quads(root)
      .map((c) => this.findByXYZ(c, { force: false }))
      .filter((v) => !!v);
  }

  public descendants({ X, Y, Z }: XYZ) {
    const result = [] as XYZ[];
    const Zs = Object.keys(this.tileCache)
      .map((n) => parseInt(n))
      .filter((z) => z > Z);
    Zs.forEach((Z, power) => {
      const pow = Math.pow(2, power);
      const xmin = X * pow;
      const xmax = (X + 1) * pow;
      const ymin = Y * pow;
      const ymax = (Y + 1) * pow;

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

  public ensureQuads(root: TileNode<T>) {
    const xyz = this.asXYZ(root);
    return this.quads(xyz).map((c) => this.findByXYZ(c, { force: true }));
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

export class TileTreeExt {
  centerOfMass(root: XYZ) {
    const tree = this.tree;
    const data = tree.findByXYZ(root, { force: false })?.data;
    if (data?.center) return data.center;
    // need to loop through all nodes under this root backward, updating parent
    const descendants = tree.descendants(root).reverse();
    descendants.forEach((d) => {
      const node = tree.findByXYZ(d);
      const { count: weight } = node.data;
      if (!weight) return;
      if (!node.data.center) {
        //throw `cannot compute center: X:${d.X},Y:${d.Y},Z${d.Z}`;
        node.data.center = getCenter(node.extent).map((v) => v * weight);
      }
      const parentData = tree.findByXYZ(tree.parent(d), { force: true }).data;
      if (!parentData.center) {
        parentData.center = [0, 0];
        parentData.count = 0;
      }
      node.data.center.forEach((c, i) => (parentData.center![i] += c));
      parentData.count += weight;
    });
    return data.center?.map((v) => v / data.count);
  }

  constructor(public tree: TileTree<{ count: number; center?: Coordinate }>) {}

  public density(tileInfo: { Z: number; count: number }) {
    return tileInfo.count * Math.pow(2, 2 * tileInfo.Z);
  }

  updateCount(tile: TileNode<{ count: number }>) {
    const tree = this.tree;
    if (typeof tile.data.count === "number") return tile.data.count;
    const result = tree
      .children(tree.asXyz(tile))
      .reduce((total, childTile) => total + this.updateCount(childTile), 0);
    return (tile.data.count = result);
  }

  nodeDensity(xyz: XYZ) {
    const tree = this.tree;
    const node = tree.findByXYZ(xyz);
    const count = this.updateCount(node);
    return this.density({ Z: xyz.Z, count });
  }

  tilesByDensity(tile: XYZ, maxDensity: number): XYZ[] {
    const tree = this.tree;
    if (maxDensity <= 0) return [];

    const tileData = tree.findByXYZ(tile).data;
    const density = this.density({ Z: tile.Z, count: tileData.count });

    const children = tree
      .children(tile)
      .map((c) => this.tilesByDensity(tree.asXyz(c), maxDensity))
      .filter((v) => v.length);

    // if any child has too much density then ignore all of them
    if (4 === children.length) {
      // flatten the result
      return ([] as XYZ[]).concat(...children);
    }

    // if tile has too much density then ignore it
    if (density <= maxDensity) {
      return [tile];
    }

    return [];
  }
}
