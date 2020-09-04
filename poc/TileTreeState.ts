import type { Extent } from "@ol/extent";

export type TileTreeState<T> = {
  extent: Extent;
  data: Array<[number, number, number, T]>;
};
