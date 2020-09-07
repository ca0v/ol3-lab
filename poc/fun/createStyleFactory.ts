import Feature from "@ol/Feature";
import Geometry from "@ol/geom/Geometry";
import { Style, Fill, Stroke, Text } from "@ol/style";
import Circle from "@ol/style/Circle";
import { XYZ } from "../types/XYZ";

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
  warningRadius: 24,
  warningFillColor: "rgba(255, 0, 0, 0)",
  warningStrokeColor: "rgba(255, 0, 0, 1)",
  warningStrokeWidth: 0.4,
  warningTextFillColor: "rgba(255, 255, 255, 1)",
  warningTextStrokeColor: "rgba(255, 0, 0, 1)",
  warningTextStrokeWidth: 1,
  defaultMarkerRadius: 1,
  defaultMarkerFillColor: "rgba(255, 0, 0, 1)",
  defaultMarkerStrokeColor: "rgba(0, 0, 0, 1)",
  defaultMarkerStrokeWidth: 0.4,
  defaultMarkerTextFillColor: "rgba(255, 255, 255, 1)",
  defaultMarkerTextStrokeColor: "rgba(255, 0, 0, 1)",
  defaultMarkerTextStrokeWidth: 1,
};

// rules to be specified in configuration
function makeClusterImage(count: number, opacity: number) {
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
}

// rules to be specified in configuration
function makeWarningImage() {
  return new Circle({
    radius: STYLE_CONFIG.warningRadius,
    fill: new Fill({ color: STYLE_CONFIG.warningFillColor }),
    stroke: new Stroke({
      color: STYLE_CONFIG.warningStrokeColor,
      width: STYLE_CONFIG.warningStrokeWidth,
    }),
  });
}

// rules to be specified in configuration
function makeMarkerImage() {
  return new Circle({
    radius: STYLE_CONFIG.defaultMarkerRadius,
    fill: new Fill({ color: STYLE_CONFIG.defaultMarkerFillColor }),
    stroke: new Stroke({
      color: STYLE_CONFIG.defaultMarkerStrokeColor,
      width: STYLE_CONFIG.defaultMarkerStrokeWidth,
    }),
  });
}

/**
 * Although using styles to control which features render is possible it is
 * better to control this in a source which actually manages which features
 * are available to style.  I will abandon this style-based approach and
 * put the feature management into a AgsClusterSource instead.
 * see @ol/source/Cluster for an implementation of client-side clustering.
 * I want to use the same technique to cluster cluster markers.
 */
export function createStyleFactory() {
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
      tileIdentifier,
      text,
      mass,
      density,
      visible,
      type,
    } = feature.getProperties() as {
      tileIdentifier: XYZ;
      text: string;
      density: number;
      mass: number;
      visible: boolean;
      type: "err" | "cluster" | "feature";
    };

    if (!tileIdentifier) return;
    if (!visible) return;

    const result = [] as Style[];

    switch (type) {
      case "cluster": {
        const style = new Style({
          image: makeClusterImage(mass, 1),
          text: textMaker(text),
        });
        result.push(style);
        break;
      }
      case "err": {
        const style = new Style({
          image: makeWarningImage(),
          text: textMaker(text),
        });
        result.push(style);
        break;
      }

      case "feature":
      default: {
        const style = new Style({
          fill: new Fill({ color: "white" }),
          stroke: new Stroke({ color: "black" }),
        });
        result.push(
          new Style({
            image: makeMarkerImage(),
          })
        );
        result.push(style);
      }
    }
    return result;
  };

  return style;
}