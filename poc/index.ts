import type { Extent } from "@ol/extent";
import { containsExtent, containsXY } from "@ol/extent";
import type { Coordinate } from "@ol/coordinate";

export type TileNode = {
  extent: Extent;
  quad: [TileNode | null, TileNode | null, TileNode | null, TileNode | null];
};

function explode(extent: Extent) {
  const [xmin, ymin, xmax, ymax] = extent;
  const [w, h] = [xmax - xmin, ymax - ymin];
  const [xmid, ymid] = [xmin + w / 2, ymin + h / 2];
  return { xmin, ymin, xmax, ymax, w, h, xmid, ymid };
}

const TINY = 0.00000001;
function isInt(value: number) {
  return TINY > Math.abs(value - Math.round(value));
}

function isEq(v1: number, v2: number) {
  return TINY > Math.abs(v1 - v2);
}

function isLt(v1: number, v2: number) {
  return TINY < v2 - v1;
}

function isGt(v1: number, v2: number) {
  return TINY < v1 - v2;
}

export class TileTree<T extends TileNode> {
  asTileNode(extent: Extent): T {
    return { extent, quad: [null, null, null, null] } as T;
  }

  private root: T;

  constructor(options: { extent: Extent }) {
    this.root = this.asTileNode(options.extent);
  }

  public findByPoint(
    args: { point: Coordinate; zoom: number },
    root = this.root
  ): T {
    const { point, zoom: depth } = args;
    const [x, y] = point;
    if (depth < 0) throw "invalid depth";
    if (!containsXY(root.extent, x, y)) {
      throw "point is outside of extent";
    }
    if (0 === depth) return root;
    const rootInfo = explode(root.extent);
    const isRightQuad = x >= rootInfo.xmid;
    const isTopQuad = y >= rootInfo.ymid;
    const quadIndex = (isTopQuad ? 2 : 0) + (isRightQuad ? 1 : 0);
    if (null === root.quad[quadIndex]) {
      this.defineAllQuads(root);
    }
    return this.findByPoint(
      { point, zoom: depth - 1 },
      root.quad[quadIndex] as T
    );
  }

  private defineAllQuads(root: T) {
    const rootInfo = explode(root.extent);
    for (let i = 0; i < 4; i++) {
      if (root.quad[i]) break;
      const isTop = 2 === (i & 2);
      const isRight = 1 === (i & 1);
      root.quad[i] = this.asTileNode([
        !isRight ? rootInfo.xmin : rootInfo.xmid,
        !isTop ? rootInfo.ymin : rootInfo.ymid,
        !isRight ? rootInfo.xmid : rootInfo.xmax,
        !isTop ? rootInfo.ymid : rootInfo.ymax,
      ]);
    }
  }

  public find(extent: Extent) {
    const info = explode(extent);
    const rootInfo = explode(this.root.extent);

    if (!containsExtent(this.root.extent, extent)) {
      if (isLt(info.xmin, rootInfo.xmin)) throw "xmin too small";
      if (isLt(info.ymin, rootInfo.ymin)) throw "ymin too small";
      if (isGt(info.xmax, rootInfo.xmax))
        throw `xmax too large: ${info.xmax} > ${rootInfo.xmax}`;
      if (isGt(info.ymax, rootInfo.ymax)) throw "ymax too large";
    }

    if (!isEq(info.w, info.h)) throw "not square";
    if (isEq(info.w, 0)) throw "too small";

    if (!isInt(Math.log2(rootInfo.w / info.w))) {
      throw "wrong power";
    }

    return this.findNode(this.root, this.asTileNode(extent));
  }

  private findNode(root: T, child: T): T {
    const info = explode(child.extent);
    const rootInfo = explode(root.extent);

    if (!containsExtent(root.extent, child.extent)) {
      if (isLt(info.xmin, rootInfo.xmin)) throw "xmin too small";
      if (isLt(info.ymin, rootInfo.ymin)) throw "ymin too small";
      if (isGt(info.xmax, rootInfo.xmax))
        throw `xmax too large: ${info.xmax} > ${rootInfo.xmax}`;
      if (isGt(info.ymax, rootInfo.ymax)) throw "ymax too large";
    }

    if (isEq(info.w, rootInfo.w)) return root;

    const isLeftQuad = isLt(info.xmin, rootInfo.xmid) ? 1 : 0;
    const isBottomQuad = isLt(info.ymin, rootInfo.ymid) ? 1 : 0;
    const quadIndex = (1 - isLeftQuad) * 1 + (1 - isBottomQuad) * 2;

    if (!root.quad[quadIndex]) {
      this.defineAllQuads(root);
    }
    return this.findNode(root.quad[quadIndex] as T, child);
  }
}
