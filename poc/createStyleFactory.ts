import { TileTree, TileTreeExt } from "./TileTree";
import Feature from "@ol/Feature";
import Geometry from "@ol/geom/Geometry";
import { Style, Fill, Stroke, Text } from "@ol/style";
import Circle from "@ol/style/Circle";
import { getCenter } from "@ol/extent";
import Point from "@ol/geom/Point";
import { XYZ } from "./XYZ";

const A = 5;
const B = 3 * 0.1;

/**
 * Although using styles to control which features render is possible it is
 * better to control this in a source which actually manages which features
 * are available to style.  I will abandon this style-based approach and
 * put the feature management into a AgsClusterSource instead.
 * see @ol/source/Cluster for an implementation of client-side clustering.
 * I want to use the same technique to cluster cluster markers.
 */
export function createStyleFactory() {
  // rules to be specified in configuration
  const circleMaker = (count: number, opacity: number) => {
    return new Circle({
      radius: A + B * Math.sqrt(count),
      fill: new Fill({ color: `rgba(200,0,0,${opacity})` }),
      stroke: new Stroke({ color: `rgba(100,0,0,${opacity})`, width: 1 }),
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
      mass,
      density,
      visible,
    } = feature.getProperties() as {
      tileInfo: XYZ;
      text: string;
      density: number;
      mass: number;
      visible: boolean;
    };
    if (!tileIdentifier) return;
    if (!visible) return;

    const result = [] as Style[];

    if (tileIdentifier) {
      const style = new Style({
        image: circleMaker(mass, 1),
        text: textMaker(text),
      });

      result.push(style);
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
