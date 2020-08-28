import { TileTree } from "./TileTree";
import { createXYZ } from "@ol/tilegrid";
import { tile as tileStrategy } from "@ol/loadingstrategy";
import Feature from "@ol/Feature";
import Geometry from "@ol/geom/Geometry";
import VectorLayer from "@ol/layer/Vector";
import { buildLoader } from "./fun/buildLoader";
import { Style, Fill, Stroke, Text } from "@ol/style";
import Circle from "@ol/style/Circle";
export class AgsClusterLayer extends VectorLayer {
  constructor(options: { url: string }) {
    const { url } = options;
    const tileGrid = createXYZ({ tileSize: 256 });
    const strategy = tileStrategy(tileGrid);

    const tree = new TileTree<{ count: number; feature: Feature<Geometry> }>({
      extent: tileGrid.getExtent(),
    });

    const source = buildLoader({ tree, url, strategy });
    const style = (feature: Feature<Geometry>) => {
      const { text, count } = feature.getProperties();
      const style = new Style({
        image: new Circle({
          radius: 10 + Math.sqrt(count) / 2,
          fill: new Fill({ color: "rgba(200,0,0,0.2)" }),
          stroke: new Stroke({ color: "white", width: 1 }),
        }),
        text: new Text({
          text: (text || count) + "",
          stroke: new Stroke({ color: "black", width: 1 }),
          fill: new Fill({ color: "white" }),
        }),
      });
      const vector = new Style({
        fill: new Fill({ color: "rgba(200,200,0,0.2)" }),
      });
      return [style, vector];
    };

    super({ source, style: <any>style });
  }
}
