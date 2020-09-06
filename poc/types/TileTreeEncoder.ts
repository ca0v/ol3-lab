import type { TileTreeState } from "../TileTreeState";

export interface TileTreeEncoder<T> {
  unstringify(state: string): TileTreeState<T>;
  stringify(tree: TileTreeState<T>): string;
}
