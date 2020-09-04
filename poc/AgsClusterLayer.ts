import VectorLayer from "@ol/layer/Vector";
import { AgsClusterSource } from "./AgsClusterSource";
import { createStyleFactory } from "./createStyleFactory";
import { TileTreeState } from "./TileTreeState";

export class AgsClusterLayer<
  T extends { count: number; center: [number, number] }
> extends VectorLayer {
  constructor(options: {
    url: string;
    tileSize: number;
    maxFetchCount: number;
    maxRecordCount: number;
    treeTileState?: TileTreeState<T>;
  }) {
    super();
    const {
      url,
      tileSize,
      maxFetchCount,
      maxRecordCount,
      treeTileState,
    } = options;

    const source = new AgsClusterSource({
      tileSize,
      url,
      maxFetchCount,
      maxRecordCount,
      treeTileState,
    });

    this.setStyle(<any>createStyleFactory());
    this.setSource(source);

    source.on("changed:state", () => {
      this.dispatchEvent("changed:state");
    });
  }
}
