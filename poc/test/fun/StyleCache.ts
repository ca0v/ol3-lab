import { Style, Fill, Stroke } from "@ol/style";
import Circle from "@ol/style/Circle";
import Text from "@ol/style/Text";

const rules = {
  TEXT_SCALE: 4,
  RADIUS_SCALE: 64,
  CLUSTER_OPACITY: 0.5,
  FEATURE_COLOR: { r: 0, g: 0, b: 255 },
  STROKE_COLOR: { r: 255, g: 255, b: 255 },
};

export class StyleCache {
  readonly #styleCache = {} as any;

  styleMaker({
    type,
    zoffset,
    mass,
    text,
  }: {
    type: string;
    zoffset: number;
    mass: number;
    text: string;
  }) {
    const massLevel = Math.floor(Math.pow(2, Math.floor(Math.log2(mass))));
    const styleKey = `${type}.${zoffset}.${massLevel}`;
    // zoffset increases as feature gets larger
    let style = this.#styleCache[styleKey] as Style;
    if (!style) {
      switch (type) {
        case "cluster": {
          const radius = Math.max(
            1,
            rules.RADIUS_SCALE * Math.pow(2, -zoffset)
          );
          style = new Style({
            image: new Circle({
              radius: radius,
              fill: new Fill({
                color: `rgba(${rules.FEATURE_COLOR.r},${rules.FEATURE_COLOR.g},${rules.FEATURE_COLOR.b},${rules.CLUSTER_OPACITY})`,
              }),
              stroke: new Stroke({
                color: `rgba(${rules.STROKE_COLOR.r},${rules.STROKE_COLOR.g},${rules.STROKE_COLOR.b},${rules.CLUSTER_OPACITY})`,
                width: 1,
              }),
            }),
            text: new Text({
              text: (text || mass || "") + "",
              scale: rules.TEXT_SCALE * Math.pow(2, -zoffset),
              fill: new Fill({
                color: `rgba(${rules.FEATURE_COLOR.r},${
                  rules.FEATURE_COLOR.g
                },${rules.FEATURE_COLOR.b},${0.8})`,
              }),
              stroke: new Stroke({
                color: `rgba(${rules.STROKE_COLOR.r},${rules.STROKE_COLOR.g},${
                  rules.STROKE_COLOR.b
                },${0.8})`,
                width: 1,
              }),
            }),
          });
          break;
        }
        default: {
          const opacity = 0.8 * Math.pow(Math.SQRT2, -Math.abs(zoffset));
          style = new Style({
            fill: new Fill({
              color: `rgba(${rules.FEATURE_COLOR.r},${rules.FEATURE_COLOR.g},${rules.FEATURE_COLOR.b},${opacity})`,
            }),
            stroke: new Stroke({
              color: `rgba(${rules.STROKE_COLOR.r},${rules.STROKE_COLOR.g},${rules.STROKE_COLOR.b},${opacity})`,
              width: 1,
            }),
          });
          break;
        }
      }
      this.#styleCache[styleKey] = style;
    }
    switch (type) {
      case "cluster": {
        if (style.getText()) {
          style.getText().setText(text || mass + "");
        }
        break;
      }
    }
    return style;
  }
}
