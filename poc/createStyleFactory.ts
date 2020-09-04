import Feature from "@ol/Feature";
import Geometry from "@ol/geom/Geometry";
import { Style, Fill, Stroke, Text } from "@ol/style";
import Circle from "@ol/style/Circle";
import { XYZ } from "./XYZ";

const noop = (a: any) => a;

const STYLE_CONFIG = {
  clusterFillColor: "rgba(0, 48, 109, 0.5)",
  clusterStrokeColor: "rgba(232, 230, 227, 0.3)",
  clusterStrokeWidth: 2,
  clusterTextFillColor: "rgba(232, 230, 227, 1)",
  clusterTextStrokeColor: "rgba(0, 0, 0, 1)",
  clusterTextStrokeWidth: 1,
  clusterTextScale: 0.75,
  clusterMinimumRadius: 5,
  clusterRadiusScale: 1,
  clusterScaleOp: (v: number) => Math.pow(2, Math.ceil(Math.log10(v))),
};

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
      radius:
        STYLE_CONFIG.clusterMinimumRadius +
        STYLE_CONFIG.clusterRadiusScale *
          (STYLE_CONFIG.clusterScaleOp || noop)(count),
      fill: new Fill({ color: STYLE_CONFIG.clusterFillColor }),
      stroke: new Stroke({
        color: STYLE_CONFIG.clusterStrokeColor,
        width: STYLE_CONFIG.clusterStrokeWidth,
      }),
    });
  };

  const textMaker = (text: string) =>
    new Text({
      text: text,
      stroke: new Stroke({
        color: STYLE_CONFIG.clusterTextStrokeColor,
        width: STYLE_CONFIG.clusterTextStrokeWidth,
      }),
      scale: STYLE_CONFIG.clusterTextScale,
      fill: new Fill({ color: STYLE_CONFIG.clusterTextFillColor }),
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
