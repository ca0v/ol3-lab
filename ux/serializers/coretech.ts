/**
 * clustering: http://openlayers.org/en/latest/examples/earthquake-clusters.html?q=style
 * from dojox gfx.canvas:
	var dasharray = {
		solid:				"none",
		shortdash:			[4, 1],
		shortdot:			[1, 1],
		shortdashdot:		[4, 1, 1, 1],
		shortdashdotdot:	[4, 1, 1, 1, 1, 1],
		dot:				[1, 3],
		dash:				[4, 3],
		longdash:			[8, 3],
		dashdot:			[4, 3, 1, 3],
		longdashdot:		[8, 3, 1, 3],
		longdashdotdot:		[8, 3, 1, 3, 1, 3]
	};
     */
import ol = require("openlayers");
import Serializer = require("./serializer");
import {doif, mixin} from "../../labs/common/common";

// Class
interface Path2D {
    addPath(path: Path2D, transform?: SVGMatrix): void;
    closePath(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    /*ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;*/
    rect(x: number, y: number, w: number, h: number): void;
}

// Constructor
interface Path2DConstructor {
    new (): Path2D;
    new (d: string): Path2D;
    new (path: Path2D, fillRule?: string): Path2D;
    prototype: Path2D;
}
declare var Path2D: Path2DConstructor;

// Extend CanvasRenderingContext2D
interface CanvasRenderingContext2D {
    fill(path: Path2D): void;
    stroke(path: Path2D): void;
    clip(path: Path2D, fillRule?: string): void;
}

/**
 * TODO: should have formatter for ol3 (serializer/deserializer) 
*/
export namespace Coretech {

    type Color = number[] | string;
    export type Size = number[];
    type Offset = number[];
    type LineDash = number[];

    export interface Fill {
        color?: string;
    }

    export interface Stroke {
        color?: string;
        width?: number;
        lineCap?: string;
        lineJoin?: string;
        lineDash?: LineDash;
        miterLimit?: number;
    }

    interface Style {
        //geometry?: string | ol.geom.Geometry | ol.style.GeometryFunction;
        fill?: Fill;
        image?: Image;
        stroke?: Stroke;
        text?: Text;
        zIndex?: number;
    }

    interface Image {
        opacity?: number;
        rotateWithView?: boolean;
        rotation?: number;
        scale?: number;
        snapToPixel?: boolean;
    }

    export interface Circle {
        radius: number;
        stroke?: Stroke;
        fill?: Fill;
        snapToPixel?: boolean;
    }

    export interface Star extends Image {
        angle?: number;
        fill?: Fill;
        points?: number;
        stroke?: Stroke;
        radius?: number;
        radius2?: number;
    }

    export interface Icon extends Image {
        anchor?: Offset;
        anchorOrigin?: string;
        anchorXUnits?: string;
        anchorYUnits?: string;
        color?: Color;
        crossOrigin?: string;
        img?: string; // same as src?
        imgSize?: Size; // same as size?
        src?: string; // same as img.src?
        offset?: Offset;
        offsetOrigin?: 'top_left'|'top_right'|'bottom-left'|'bottom-right';
        size?: Size; // same as image size?
    }

    export interface Text {
        fill?: Fill;
        font?: string;
        offsetX?: number;
        offsetY?: number;
        rotation?: number;
        scale?: number;
        stroke?: Stroke;
        text?: string;
        textAlign?: string;
        textBaseline?: string;
    }

}

// these are extensions from ol3
export namespace Coretech {

    export interface Style {
        svg?: Icon & Svg;
        icon?: Icon;
        star?: Star;
        circle?: Circle;
        text?: Text;
        fill?: Fill;
        stroke?: Stroke;
    }

    export interface Icon {
        "anchor-x": number;
        "anchor-y": number;
    }

    export interface Text {
        "offset-x"?: number;
        "offset-y"?: number;
    }

    export interface Circle {
        opacity?: number;
    }

    export interface Svg {
        imgSize: Size;
        img: string;
        path?: string;
        stroke?: Stroke;
        fill?: Fill;
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
        else if (json.svg) image = this.deserializeSvg(json.svg);
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
            rotation: json.rotation || 0,
            scale: json.scale || 1
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
        if (!json.anchor) {
            json.anchor = [json["anchor-x"] || 0.5, json["anchor-y"] || 0.5];
        }

        let image = new ol.style.Icon(mixin({
        }, json));
        image.load();
        return image;
    }

    private deserializeSvg(json: Coretech.Svg & Coretech.Icon) {
        json.rotation = json.rotation || 0;
        json.scale = json.scale || 1;

        let canvas = document.createElement("canvas");
        {
            // rotate a rectangle and get the resulting extent
            let [x, y] = json.imgSize;
            let coords = [[-x, -y], [-x, y], [x, y], [x, -y]];
            let rect = new ol.geom.MultiPoint(coords);
            rect.rotate(json.rotation, [0, 0]);
            let extent = rect.getExtent();
            [canvas.width, canvas.height] = [ol.extent.getWidth(extent), ol.extent.getHeight(extent)]
                .map(v => v * json.scale * 0.5);
        }
        let ctx = canvas.getContext('2d');

        if (json.stroke && json.stroke.width) {
            ctx.translate(json.stroke.width, json.stroke.width);
        }

        if (json.img) {
            let symbol = <SVGSymbolElement><any>document.getElementById(json.img);
            if (!symbol) {
                // todo
            }
            if (symbol) {
                // but just grab the path is probably good enough
                let path = <SVGPathElement>(symbol.getElementsByTagName("path")[0]);
                if (path) {
                    json.path = (json.path || "") + path.getAttribute('d');
                }
            }
        }

        if (json.path) {
            let path2d = new Path2D(json.path);

            // rotate  before it is in the canvas (avoids pixelation)
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(json.scale, json.scale);
            ctx.rotate(json.rotation);
            ctx.translate(-json.imgSize[0] / 2, -json.imgSize[1] / 2);

            if (json.fill) {
                ctx.fillStyle = json.fill.color;
                ctx.fill(path2d);
            }
            if (json.stroke) {
                ctx.strokeStyle = json.stroke.color;
                ctx.lineWidth = json.stroke.width;
                ctx.stroke(path2d);
            }

        }
        return new ol.style.Icon(mixin(json, {
            img: canvas,
            imgSize: [canvas.width, canvas.height],
            rotation: 0,
            scale: 1
        }));

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
