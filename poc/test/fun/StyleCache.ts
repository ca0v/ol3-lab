import { Style, Fill, Stroke } from "@ol/style";
import Circle from "@ol/style/Circle";
import Text from "@ol/style/Text";

const rules = {
  TEXT_SCALE: 1,
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
          style = new Style({
            image: new Circle({
              radius: 0.5 * (64 * Math.pow(2, -zoffset)),
              fill: new Fill({
                color: `rgba(255,255,255,${0.05})`,
              }),
              stroke: new Stroke({
                color: `rgba(0,0,0,${0.05})`,
                width: 0.5 * (64 * Math.pow(2, -zoffset)),
              }),
            }),
            text: new Text({
              text: (text || mass || "") + "",
              scale: rules.TEXT_SCALE,
              fill: new Fill({ color: `rgba(255,255,255,${0.8})` }),
              stroke: new Stroke({
                color: `rgba(0,0,0,${0.8})`,
                width: 1,
              }),
            }),
          });
          break;
        }
        default: {
          const opacity = 0.8 * Math.pow(Math.SQRT2, -Math.abs(zoffset));
          style = new Style({
            fill: new Fill({ color: `rgba(0,0,255,${opacity})` }),
            stroke: new Stroke({
              color: `rgba(255,255,255,${opacity})`,
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
