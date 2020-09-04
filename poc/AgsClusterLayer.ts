import { TileTree } from "./TileTree";
import { tile as tileStrategy } from "@ol/loadingstrategy";
import VectorLayer from "@ol/layer/Vector";
import { AgsClusterSource } from "./AgsClusterSource";
import TileGrid from "@ol/tilegrid/TileGrid";
import { createStyleFactory } from "./createStyleFactory";

export class AgsClusterLayer<
  T extends { count: number; center: [number, number] }
> extends VectorLayer {
  constructor(options: {
    url: string;
    tileSize: number;
    maxFetchCount: number;
    maxRecordCount: number;
    treeTileState: Array<[number, number, number, T]>;
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
  }
}
