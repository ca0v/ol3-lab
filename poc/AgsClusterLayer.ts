import { TileTree, TileTreeExt } from "./TileTree";
import { createXYZ } from "@ol/tilegrid";
import { tile as tileStrategy } from "@ol/loadingstrategy";
import Feature from "@ol/Feature";
import Geometry from "@ol/geom/Geometry";
import VectorLayer from "@ol/layer/Vector";
import { buildLoader } from "./fun/buildLoader";
import { Style, Fill, Stroke, Text } from "@ol/style";
import Circle from "@ol/style/Circle";
import { getCenter } from "@ol/extent";
import Point from "@ol/geom/Point";
import { XYZ } from "./XYZ";

export class AgsClusterLayer extends VectorLayer {
  private readonly tree: TileTree<{ count: number; center: [number, number] }>;

  constructor(options: { url: string }) {
    super();
    const { url } = options;
    const tileGrid = createXYZ({ tileSize: 256 });
    const strategy = tileStrategy(tileGrid);

    this.tree = new TileTree<{ count: number; center: [number, number] }>({
      extent: tileGrid.getExtent(),
    });

    const source = buildLoader({
      tree: this.tree,
      url,
      strategy,
      maxFetchCount: 100,
      maxRecordCount: 1000,
    });

    this.setStyle(<any>this.createStyleFactory());
    this.setSource(source);
  }

  private createStyleFactory() {
    const helper = new TileTreeExt(this.tree);

    // rules to be specified in configuration
    const circleMaker = (count: number) => {
      return new Circle({
        radius: 10 + Math.sqrt(count) / 2,
        fill: new Fill({ color: "rgba(200,0,0,1)" }),
        stroke: new Stroke({ color: "white", width: 1 }),
      });
    };

    const textMaker = (text: string) =>
      new Text({
        text: text,
        stroke: new Stroke({ color: "black", width: 1 }),
        fill: new Fill({ color: "white" }),
      });

    const style = (feature: Feature<Geometry>) => {
      const { tileInfo: tileIdentifier, text } = feature.getProperties() as {
        tileInfo: XYZ;
        text: string;
      };
      const result = [] as Style[];

      if (text) {
        const style = new Style({
          image: circleMaker(10),
          text: textMaker(text),
        });
        result.push(style);
      }

      if (tileIdentifier) {
        console.log(`rendering feature from ${tileIdentifier.Z}`);
        const tileNode = this.tree.findByXYZ(tileIdentifier);
        if (!tileNode) {
          // there are no stats on this
          const vector = new Style({
            fill: new Fill({ color: "rgba(200,0,200,0.2)" }),
          });
          result.push(vector);
        } else {
          // hereiam
          let { count, center } = tileNode.data;
          if (!center) {
            debugger;
            center = helper.centerOfMass(tileIdentifier);
          }
          const style = new Style({
            image: circleMaker(count),
            text: textMaker(count + ""),
          });
          if (center) {
            style.setGeometry(new Point(center));
          } else {
            style.setGeometry(
              new Point(getCenter(feature.getGeometry()!.getExtent()))
            );
          }
          result.push(style);
        }
      } else {
        // rules specified in featureserver resonse
        const vector = new Style({
          fill: new Fill({ color: "rgba(200,0,200,0.2)" }),
        });
        result.push(vector);
      }
      return result;
    };

    return style;
  }
}
