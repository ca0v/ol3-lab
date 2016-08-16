import ol = require("openlayers");
import Serializer = require("./base");
import {doif, mixin} from "../../labs/common/common";

export namespace Format {

    export type Color = number[] | string;
    export type Size = number[];
    export type Offset = number[];
    export type LineDash = number[];

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
        src?: string; // same as img.src?
        offset?: Offset;
        offsetOrigin?: 'top_left' | 'top_right' | 'bottom-left' | 'bottom-right';
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
export namespace Format {

    export interface Style {
        image?: Icon & Svg; // if 'image' specified must auto-detect icon or svg 
        icon?: Icon;
        svg?: Svg;
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

    // icon + path - src    
    export interface Svg {
        anchor?: Offset;
        anchorOrigin?: string;
        anchorXUnits?: string;
        anchorYUnits?: string;
        color?: Color;
        crossOrigin?: string;
        img?: string;
        imgSize?: Size;
        offset?: Offset;
        offsetOrigin?: 'top_left' | 'top_right' | 'bottom-left' | 'bottom-right';
        path?: string;
        stroke?: Stroke;
        fill?: Fill;
    }

}

export class StyleConverter implements Serializer.IConverter<Format.Style> {

    fromJson(json: Format.Style) {
        return this.deserializeStyle(json);
    }

    toJson(style: ol.style.Style) {
        return <Format.Style>this.serializeStyle(style);
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
        if (style.getOrigin) this.assign(s, "origin", style.getOrigin());
        if (style.getScale) this.assign(s, "scale", style.getScale());
        if (style.getSize) this.assign(s, "size", style.getSize());

        if (style.getAnchor) {
            this.assign(s, "anchor", style.getAnchor());
            "anchorXUnits,anchorYUnits,anchorOrigin".split(",").forEach(k => {
                this.assign(s, k, style[`${k}_`]);
            });
        }

        // "svg"
        if (style.path) {
            if (style.path) this.assign(s, "path", style.path);
            if (style.getImageSize) this.assign(s, "imgSize", style.getImageSize());
            if (style.stroke) this.assign(s, "stroke", style.stroke);
            if (style.fill) this.assign(s, "fill", style.fill);
            if (style.scale) this.assign(s, "scale", style.scale); // getScale and getImgSize are modified in deserializer               
            if (style.imgSize) this.assign(s, "imgSize", style.imgSize);
        }

        // "icon"
        if (style.getSrc) this.assign(s, "src", style.getSrc());

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

    private deserializeStyle(json: Format.Style) {
        let image: ol.style.Image;
        let text: ol.style.Text;
        let fill: ol.style.Fill;
        let stroke: ol.style.Stroke;

        if (json.circle) image = this.deserializeCircle(json.circle);
        else if (json.star) image = this.deserializeStar(json.star);
        else if (json.icon) image = this.deserializeIcon(json.icon);
        else if (json.svg) image = this.deserializeSvg(json.svg);
        else if (json.image && (json.image.img || json.image.path)) image = this.deserializeSvg(json.image);
        else if (json.image && json.image.src) image = this.deserializeIcon(json.image);
        else if (json.image) throw "unknown image type";
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
        json.rotation = json.rotation || 0;
        json.scale = json.scale || 1;

        let [x, y] = [json["offset-x"] || 0, json["offset-y"] || 0];
        {
            let p = new ol.geom.Point([x, y]);
            p.rotate(json.rotation, [0, 0]);
            p.scale(json.scale, json.scale);
            [x, y] = p.getCoordinates();
        }

        return new ol.style.Text({
            fill: this.deserializeFill(json.fill),
            stroke: this.deserializeStroke(json.stroke),
            text: json.text,
            font: json.font,
            offsetX: x,
            offsetY: y,
            rotation: json.rotation || 0,
            scale: json.scale || 1
        });
    }

    private deserializeCircle(json: Format.Circle) {
        let image = new ol.style.Circle({
            radius: json.radius,
            fill: this.deserializeFill(json.fill),
            stroke: this.deserializeStroke(json.stroke)
        });
        image.setOpacity(json.opacity);
        return image;
    }

    private deserializeStar(json: Format.Star) {
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

    private deserializeIcon(json: Format.Icon) {
        if (!json.anchor) {
            json.anchor = [json["anchor-x"] || 0.5, json["anchor-y"] || 0.5];
        }

        let image = new ol.style.Icon({
            anchor: json.anchor,
            anchorOrigin: json.anchorOrigin,
            anchorXUnits: json.anchorXUnits,
            anchorYUnits: json.anchorYUnits,
            //crossOrigin?: string;
            img: undefined,
            imgSize: undefined,
            offset: json.offset,
            offsetOrigin: json.offsetOrigin,
            opacity: json.opacity,
            scale: json.scale,
            snapToPixel: json.snapToPixel,
            rotateWithView: json.rotateWithView,
            rotation: json.rotation,
            size: json.size,
            src: json.src
        });
        image.load();
        return image;
    }

    private deserializeSvg(json: Format.Svg & Format.Icon) {
        json.rotation = json.rotation || 0;
        json.scale = json.scale || 1;

        if (json.img) {
            let symbol = <SVGSymbolElement><any>document.getElementById(json.img);
            if (!symbol) {
                throw `unable to find svg element: ${json.img}`;
            }
            if (symbol) {
                // but just grab the path is probably good enough
                let path = <SVGPathElement>(symbol.getElementsByTagName("path")[0]);
                if (path) {
                    if (symbol.viewBox) {
                        if (!json.imgSize) {
                            json.imgSize = [symbol.viewBox.baseVal.width, symbol.viewBox.baseVal.height];
                        }
                    }
                    json.path = (json.path || "") + path.getAttribute('d');
                }
            }
        }

        let canvas = document.createElement("canvas");
        if (json.path) {
            {
                // rotate a rectangle and get the resulting extent
                [canvas.width, canvas.height] = json.imgSize.map(v => v * json.scale);

                if (json.stroke && json.stroke.width) {
                    let dx = 2 * json.stroke.width * json.scale;
                    canvas.width += dx;
                    canvas.height += dx;
                }
            }

            let ctx = canvas.getContext('2d');
            let path2d = new Path2D(json.path);

            // rotate  before it is in the canvas (avoids pixelation)
            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.scale(json.scale, json.scale);
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

        let icon = new ol.style.Icon({
            img: canvas,
            imgSize: [canvas.width, canvas.height],
            rotation: json.rotation,
            scale: 1,
            anchor: json.anchor || [canvas.width / 2, canvas.height],
            anchorOrigin: json.anchorOrigin,
            anchorXUnits: json.anchorXUnits || "pixels",
            anchorYUnits: json.anchorYUnits || "pixels",
            //crossOrigin?: string;
            offset: json.offset,
            offsetOrigin: json.offsetOrigin,
            opacity: json.opacity,
            snapToPixel: json.snapToPixel,
            rotateWithView: json.rotateWithView,
            size: [canvas.width, canvas.height],
            src: undefined
        });

        return mixin(icon, {
            path: json.path,
            stroke: json.stroke,
            fill: json.fill,
            scale: json.scale,
            imgSize: json.imgSize
        });

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

                stops.forEach(colorstop => {
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
