import { Extent } from "@ol/extent";

export type TileNode<T> = {
  extent: Extent;
  data: T;
};
