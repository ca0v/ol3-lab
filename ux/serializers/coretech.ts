import ol = require("openlayers");
import Serializer = require("./serializer");
import coretech_flower_json = require("../styles/star/flower");
import {doif, mixin} from "../../labs/common/common";

/**
 * TODO: should have formatter for ol3 (serializer/deserializer) 
*/
export namespace Coretech {

    export interface Fill {
        color?: string;
    }

    export interface Stroke {
        color?: string;
        width?: number;
    }

    export interface Circle {
        fill?: Fill;
        opacity?: number;
        stroke?: Stroke;
        radius?: number;
    }

    export interface Star {
        fill?: Fill;
        opacity?: number;
        stroke?: Stroke;
        radius?: number;
        radius2?: number;
        angle?: number;
        roatation?: number;
        points?: number;
    }

    export interface Icon {
        anchor?: number[];
        anchorOrigin?: string;
        anchorXUnits?: string;
        anchorYUnits?: string;
        crossOrigin?: string;
        //img?: ol.Image | HTMLCanvasElement;
        offset?: Array<number>;
        offsetOrigin?: string;
        opacity?: number;
        scale?: number;
        snapToPixel?: boolean;
        rotateWithView?: boolean;
        rotation?: number;
        size?: ol.Size;
        imgSize?: ol.Size;
        src?: string;
    }

    export interface Text {
        fill?: Fill;
        stroke?: Stroke;
        text?: string;
        "offset-x"?: number;
        "offset-y"?: number;
        font?: string;
    }

    export interface Style {
        icon?: Icon;
        star?: Star;
        circle?: Circle;
        text?: Text;
        fill?: Fill;
        stroke?: Stroke;
    }

}

/**
 * See also, leaflet styles:
  	weight: 2,
    color: "#999",
    opacity: 1,
    fillColor: "#B0DE5C",
    fillOpacity: 0.8

 * mapbox styles (https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0)
 * mapbox svg symbols: https://github.com/mapbox/maki
 */
export class CoretechConverter implements Serializer.IConverter<Coretech.Style> {

    fromJson(json: Coretech.Style) {
        return this.deserializeStyle(json);
    }

    toJson(style: ol.style.Style) {
        return <Coretech.Style>this.serializeStyle(style);
    }

    private assign(obj: any, prop: string, value: Object) {
        //let getter = prop[0].toUpperCase() + prop.substring(1);
        if (value === null) return;
        if (value === undefined) return;
        if (typeof value === "object") {
            if (Object.keys(value).length === 0) return;
        }
        if (prop === "image") {
            if (value.hasOwnProperty("radius")) {
                prop = "circle";
            }
            if (value.hasOwnProperty("points")) {
                prop = "star";
            }
        }
        obj[prop] = value;
    }

    private serializeStyle(style: ol.style.Style & any) {
        let s = <any>{};
        if (!style) return null;

        if (typeof style === "string") return style;
        if (typeof style === "number") return style;

        if (style.getColor) mixin(s, this.serializeColor(style.getColor()));
        if (style.getImage) this.assign(s, "image", this.serializeStyle(style.getImage()));
        if (style.getFill) this.assign(s, "fill", this.serializeFill(style.getFill()));
        if (style.getOpacity) this.assign(s, "opacity", style.getOpacity());
        if (style.getStroke) this.assign(s, "stroke", this.serializeStyle(style.getStroke()));
        if (style.getText) this.assign(s, "text", this.serializeStyle(style.getText()));
        if (style.getWidth) this.assign(s, "width", style.getWidth());
        if (style.getOffsetX) this.assign(s, "offset-x", style.getOffsetX());
        if (style.getOffsetY) this.assign(s, "offset-y", style.getOffsetY());
        if (style.getWidth) this.assign(s, "width", style.getWidth());
        if (style.getFont) this.assign(s, "font", style.getFont());
        if (style.getRadius) this.assign(s, "radius", style.getRadius());
        if (style.getRadius2) this.assign(s, "radius2", style.getRadius2());
        if (style.getPoints) this.assign(s, "points", style.getPoints());
        if (style.getAngle) this.assign(s, "angle", style.getAngle());
        if (style.getRotation) this.assign(s, "rotation", style.getRotation());
        if (s.points && s.radius !== s.radius2) s.points /= 2; // ol3 defect doubles point count when r1 <> r2  
        return s;
    }

    private serializeColor(color: string | number[] | CanvasGradient | CanvasPattern): Object {
        if (color instanceof Array) {
            return {
                color: ol.color.asString(color)
            };
        }
        else if (color instanceof CanvasGradient) {
            return {
                gradient: color
            };
        }
        else if (color instanceof CanvasPattern) {
            return {
                pattern: color
            };
        }
        else if (typeof color === "string") {
            return {
                color: color
            };
        }
        throw "unknown color type";
    }

    private serializeFill(fill: ol.style.Fill) {
        return this.serializeStyle(fill);
    }

    private deserializeStyle(json: Coretech.Style) {
        let image: ol.style.Image;
        let text: ol.style.Text;
        let fill: ol.style.Fill;
        let stroke: ol.style.Stroke;

        if (json.circle) image = this.deserializeCircle(json.circle);
        else if (json.star) image = this.deserializeStar(json.star);
        else if (json.icon) image = this.deserializeIcon(json.icon);
        if (json.text) text = this.deserializeText(json.text);
        if (json.fill) fill = this.deserializeFill(json.fill);
        if (json.stroke) stroke = this.deserializeStroke(json.stroke);

        let s = new ol.style.Style({
            image: image,
            text: text,
            fill: fill,
            stroke: stroke
        });
        return s;
    }

    private deserializeText(json: Coretech.Text) {
        return new ol.style.Text({
            fill: this.deserializeFill(json.fill),
            stroke: this.deserializeStroke(json.stroke),
            text: json.text,
            font: json.font,
            offsetX: json["offset-x"],
            offsetY: json["offset-y"],
        });
    }

    private deserializeCircle(json: Coretech.Circle) {
        let image = new ol.style.Circle({
            radius: json.radius,
            fill: this.deserializeFill(json.fill),
            stroke: this.deserializeStroke(json.stroke)
        });
        image.setOpacity(json.opacity);
        return image;
    }

    private deserializeStar(json: Coretech.Star) {
        let image = new ol.style.RegularShape({
            radius: json.radius,
            radius2: json.radius2,
            points: json.points,
            angle: json.angle,
            fill: this.deserializeFill(json.fill),
            stroke: this.deserializeStroke(json.stroke)
        });

        doif(json.rotation, v => image.setRotation(v));
        doif(json.opacity, v => image.setOpacity(v));

        return image;
    }

    private deserializeIcon(json: Coretech.Icon) {
        let image = new ol.style.Icon(mixin({
        }, json));
        image.load();
        return image;
    }

    private deserializeFill(json: any) {
        let fill = new ol.style.Fill({
            color: this.deserializeColor(json)
        });
        return fill;
    }

    private deserializeStroke(json: any) {
        let stroke = new ol.style.Stroke();
        doif(json.color, v => stroke.setColor(v));
        doif(json.lineCap, v => stroke.setLineCap(v));
        doif(json.lineDash, v => stroke.setLineDash(v));
        doif(json.lineJoin, v => stroke.setLineJoin(v));
        doif(json.miterLimit, v => stroke.setMiterLimit(v));
        doif(json.width, v => stroke.setWidth(v));
        return stroke;
    }

    private deserializeColor(fill: any) {
        if (fill.color) {
            return fill.color;
        }
        if (fill.gradient) {
            let type = <string>fill.gradient.type;
            let gradient: CanvasGradient;

            if (0 === type.indexOf("linear(")) {
                gradient = this.deserializeLinearGradient(fill.gradient);
            }
            else if (0 === type.indexOf("radial(")) {
                gradient = this.deserializeRadialGradient(fill.gradient);
            }

            if (fill.gradient.stops) {
                // preserve
                mixin(gradient, {
                    stops: fill.gradient.stops
                });

                let stops = <string[]>fill.gradient.stops.split(";");
                stops = stops.map(v => v.trim());

                let colorStops = stops.forEach(colorstop => {
                    let stop = colorstop.match(/ \d+%/m)[0];
                    let color = colorstop.substr(0, colorstop.length - stop.length);
                    gradient.addColorStop(parseInt(stop) / 100, color);
                });
            }

            return gradient;
        }

        if (fill.pattern) {
            let repitition = fill.pattern.repitition;
            let canvas = <HTMLCanvasElement>document.createElement('canvas');

            let spacing = canvas.width = canvas.height = fill.pattern.spacing | 6;

            let context = canvas.getContext('2d');
            context.fillStyle = fill.pattern.color;

            switch (fill.pattern.orientation) {
                case "horizontal":
                    for (var i = 0; i < spacing; i++) {
                        context.fillRect(i, 0, 1, 1);
                    }
                    break;
                case "vertical":
                    for (var i = 0; i < spacing; i++) {
                        context.fillRect(0, i, 1, 1);
                    }
                    break;
                case "cross":
                    for (var i = 0; i < spacing; i++) {
                        context.fillRect(i, 0, 1, 1);
                        context.fillRect(0, i, 1, 1);
                    }
                    break;
                case "forward":
                    for (var i = 0; i < spacing; i++) {
                        context.fillRect(i, i, 1, 1);
                    }
                    break;
                case "backward":
                    for (var i = 0; i < spacing; i++) {
                        context.fillRect(spacing - 1 - i, i, 1, 1);
                    }
                    break;
                case "diagonal":
                    for (var i = 0; i < spacing; i++) {
                        context.fillRect(i, i, 1, 1);
                        context.fillRect(spacing - 1 - i, i, 1, 1);
                    }
                    break;
            }

            return mixin(context.createPattern(canvas, repitition), fill.pattern);
        }

        throw "invalid color configuration";
    }

    private deserializeLinearGradient(json: any) {
        let rx = /\w+\((.*)\)/m;
        let [x0, y0, x1, y1] = JSON.parse(json.type.replace(rx, "[$1]"));

        let canvas = document.createElement('canvas');

        // not correct, assumes points reside on edge
        canvas.width = Math.max(x0, x1);
        canvas.height = Math.max(y0, y1);

        var context = canvas.getContext('2d');

        let gradient = context.createLinearGradient(x0, y0, x1, y1);
        mixin(gradient, {
            type: `linear(${[x0, y0, x1, y1].join(",")})`
        });
        return gradient;
    }

    private deserializeRadialGradient(json: any) {
        let rx = /radial\((.*)\)/m;
        let [x0, y0, r0, x1, y1, r1] = JSON.parse(json.type.replace(rx, "[$1]"));

        let canvas = document.createElement('canvas');

        // not correct, assumes radial centered
        canvas.width = 2 * Math.max(x0, x1);
        canvas.height = 2 * Math.max(y0, y1);

        var context = canvas.getContext('2d');

        let gradient = context.createRadialGradient(x0, y0, r0, x1, y1, r1);
        mixin(gradient, {
            type: `radial(${[x0, y0, r0, x1, y1, r1].join(",")})`
        });

        return gradient;
    }

}
