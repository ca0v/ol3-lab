import { TileTree, TileTreeExt } from "./TileTree";
import { createXYZ } from "@ol/tilegrid";
import { tile as tileStrategy } from "@ol/loadingstrategy";
import Feature from "@ol/Feature";
import Geometry from "@ol/geom/Geometry";
import VectorLayer from "@ol/layer/Vector";
import { AgsClusterSource } from "./AgsClusterSource";
import { Style, Fill, Stroke, Text } from "@ol/style";
import Circle from "@ol/style/Circle";
import { getCenter } from "@ol/extent";
import Point from "@ol/geom/Point";
import { XYZ } from "./XYZ";
import TileGrid from "@ol/tilegrid/TileGrid";

/**
 * Although using styles to control which features render is possible it is
 * better to control this in a source which actually manages which features
 * are available to style.  I will abandon this style-based approach and
 * put the feature management into a AgsClusterSource instead.
 * see @ol/source/Cluster for an implementation of client-side clustering.
 * I want to use the same technique to cluster cluster markers.
 */
function createStyleFactory(
  tree: TileTree<{ count: number; center: [number, number] }>
) {
  const helper = new TileTreeExt(tree);

  // rules to be specified in configuration
  const circleMaker = (count: number, opacity: number) => {
    return new Circle({
      radius: 10 + Math.sqrt(count) / 2,
      fill: new Fill({ color: `rgba(200,0,0,${opacity})` }),
      stroke: new Stroke({ color: "white", width: 1 }),
    });
  };

  const textMaker = (text: string) =>
    new Text({
      text: text,
      stroke: new Stroke({ color: "black", width: 1 }),
      fill: new Fill({ color: "white" }),
    });

  // can control rendering from here by returning null styles
  const style = (feature: Feature<Geometry>, resolution: number) => {
    const {
      tileInfo: tileIdentifier,
      text,
      opacity,
    } = feature.getProperties() as {
      tileInfo: XYZ;
      text: string;
      opacity: number;
    };
    if (!tileIdentifier) return;

    const result = [] as Style[];

    if (tileIdentifier) {
      const tileNode = tree.findByXYZ(tileIdentifier);
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
          center = helper.centerOfMass(tileIdentifier).center;
        }
        const style = new Style({
          image: circleMaker(count, opacity || 1),
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

    if (text) {
      const style = new Style({
        image: circleMaker(10, opacity),
        text: textMaker(text),
      });
      result.push(style);
    }

    return result;
  };

  return style;
}

export class AgsClusterLayer<
  T extends { count: number; center: [number, number] }
> extends VectorLayer {
  private readonly tree: TileTree<T>;

  constructor(options: {
    url: string;
    tileGrid: TileGrid;
    maxFetchCount: number;
    maxRecordCount: number;
    hack: string; //[number, number, number, T]
  }) {
    super();
    const { url, tileGrid, maxFetchCount, maxRecordCount } = options;
    const strategy = tileStrategy(tileGrid);
    const tree = (this.tree = new TileTree<T>({
      extent: tileGrid.getExtent(),
    }));

    tree.destringify(options.hack);

    const source = new AgsClusterSource({
      tree,
      strategy,
      url,
      maxFetchCount,
      maxRecordCount,
    });

    this.setStyle(<any>createStyleFactory(this.tree));
    this.setSource(source);
  }
}
