import VectorLayer from "@ol/layer/Vector";
import type View from "@ol/View";
import { AgsClusterSource } from "./AgsClusterSource";
import { createStyleFactory } from "./fun/createStyleFactory";
import { TileTreeState } from "./TileTreeState";
import type { XY } from "./types/XY";

export interface AgsClusterLayerOptions {
  view: View;
  url: string;
  tileSize: number;
  minRecordCount: number;
  maxDepth: number;
  minZoom: number;
  maxZoom: number;
  networkThrottle: number;
}

const DEFAULT_OPTIONS: Partial<AgsClusterLayerOptions> = {
  networkThrottle: 100,
};

export class AgsClusterLayer<
  T extends { count: number; center: XY }
> extends VectorLayer {
  constructor(
    options: AgsClusterLayerOptions & { treeTileState?: TileTreeState<T> }
  ) {
    super();
    const {
      view,
      url,
      tileSize,
      minRecordCount,
      treeTileState,
      maxDepth,
      minZoom,
      maxZoom,
      networkThrottle,
    } = { ...DEFAULT_OPTIONS, ...options };

    const source = new AgsClusterSource({
      tileSize,
      url,
      minRecordCount,
      treeTileState,
      maxDepth,
      maxZoom,
      minZoom,
      networkThrottle,
    });

    this.setStyle(<any>createStyleFactory(view));
    this.setSource(source);
  }
}
