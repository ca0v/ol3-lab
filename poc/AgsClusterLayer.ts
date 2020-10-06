import VectorLayer from "@ol/layer/Vector";
import { AgsClusterSource } from "./AgsClusterSource";
import { createStyleFactory } from "./fun/createStyleFactory";
import { TileTreeState } from "./TileTreeState";
import type { XY } from "./types/XY";

export class AgsClusterLayer<
  T extends { count: number; center: XY }
> extends VectorLayer {
  constructor(options: {
    url: string;
    tileSize: number;
    minRecordCount: number;
    maxDepth: number;
    minZoom: number;
    maxZoom: number;
    treeTileState?: TileTreeState<T>;
  }) {
    super();
    const {
      url,
      tileSize,
      minRecordCount,
      treeTileState,
      maxDepth,
      minZoom,
      maxZoom,
    } = options;

    const source = new AgsClusterSource({
      tileSize,
      url,
      minRecordCount,
      treeTileState,
      maxDepth,
      maxZoom,
      minZoom,
    });

    this.setStyle(<any>createStyleFactory());
    this.setSource(source);
  }
}
