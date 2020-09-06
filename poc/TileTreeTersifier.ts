import { TileTree } from "./TileTree";
import { getCenter } from "@ol/extent";
import type { TileTreeEncoder } from "./types/TileTreeEncoder";
import { TileTreeState } from "./TileTreeState";
import { Extent } from "@ol/extent";
import type { XY } from "./types/XY";

type InternalTileTreeState = {
  extent: Extent;
  data: Array<[number, number, number, number, number, number]>;
};

export class TileTreeTersifier<T extends { count: number; center: XY }>
  implements TileTreeEncoder<T> {
  // convert a stringified tile tree into a tile tree state
  unstringify(treestate: string): TileTreeState<T> {
    const { extent, data } = JSON.parse(treestate) as InternalTileTreeState;
    const tree = new TileTree<T>({ extent });
    const outputData = data.map((d) => {
      const [X, Y, Z, count, dx, dy] = d;
      const extent = tree.asExtent({ X, Y, Z });
      const [cx, cy] = getCenter(extent);
      return [X, Y, Z, <T>{ count, center: [cx + dx / 10, cy + dy / 10] }];
    });
    return { extent, data: <any>outputData };
  }

  stringify(treestate: TileTreeState<T>) {
    const { extent, data } = treestate;
    const tree = new TileTree<T>({ extent });
    const outData = data.map(([X, Y, Z, d]) => {
      const center = getCenter(tree.asExtent({ X, Y, Z }));
      return [
        X,
        Y,
        Z,
        d.count,
        ...d.center.map((v, i) => Math.round((v - center[i]) * 10)),
      ];
    });
    return JSON.stringify({ extent, data: outData });
  }
}
