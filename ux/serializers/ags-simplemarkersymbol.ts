import ol = require("openlayers");

import Serializer = require("./serializer");

declare module SimpleMarkerSymbol {

    export interface Outline {
        color: number[];
        width: number;
        type: string;
        style: string;
    }

    export interface Style {
        color?: number[];
        size?: number;
        angle?: number;
        xoffset?: number;
        yoffset?: number;
        type?: string;
        style?: string;
        outline?: Outline;
        path?: string;
    }

}

function doif<T>(v: T, cb: (v: T) => void) {
    if (typeof v !== "undefined") cb(v);
}

function asColor(color: number[]) {
    if (color.length == 4 && color[3] > 1) {
        color[3] /= 255.0;
    }
    return ol.color.asString(color);
}

function asWidth(value: number) {
    return value * 4 / 3;
}

export function Converter(json: SimpleMarkerSymbol.Style) {
    switch (json.type) {
        case "esriSMS": return new SimpleMarkerConverter();
    }
}
export class SimpleMarkerConverter implements Serializer.IConverter<SimpleMarkerSymbol.Style> {

    toJson(style: ol.style.Style) {
        let result = <SimpleMarkerSymbol.Style>{
            type: "esriSMS"
        };
        this.serializeStyle(style, result);
        return result;
    }

    fromJson(json: SimpleMarkerSymbol.Style) {

        if (json.type !== "esriSMS") throw `invalid symbol type: ${json.type}`;

        switch (json.style) {
            case "esriSMSPath": return this.deserializePath(json);
            case "esriSMSCircle": return this.deserializeCircle(json);
            case "esriSMSCross": return this.deserializeCross(json);
            case "esriSMSDiamond": return this.deserializeDiamond(json);
            case "esriSMSSquare": return this.deserializeSquare(json);
            case "esriSMSX": return this.deserializeX(json);
        }
        throw `unknown symbol style: ${json.style}`;
    }

    serializeStyle(style: ol.style.Circle | ol.style.Fill | ol.style.Icon | ol.style.Image | ol.style.RegularShape | ol.style.Stroke | ol.style.Text | ol.style.Style, result: SimpleMarkerSymbol.Style) {

        let s = style;

        if (s instanceof ol.style.Circle) {
            result.style = "esriSMSCircle";
            doif(s.getFill(), v => this.serializeStyle(v, result));
            doif(s.getImage(), v => this.serializeStyle(v, result));
            s.getOpacity();
            doif(s.getRotation(), v => result.angle = v);
            s.getScale();
            doif(s.getStroke(), v => this.serializeStyle(v, result));
            //s.getText();
            doif(s.getRadius(), v => result.size = v);
        }

        if (s instanceof ol.style.Fill) {
            result.color = ol.color.asArray(<any>s.getColor());
        }

        if (s instanceof ol.style.Icon) {
            debugger;
            result.style = "esriSMSPath";
            s.getFill();
            s.getImage();
            s.getOpacity();
            s.getRotation();
            s.getScale();
            s.getStroke();
            s.getText();
        }

        if (s instanceof ol.style.RegularShape) {

            let points = s.getPoints();
            let r1 = s.getRadius();
            let r2 = s.getRadius2();
            let angle = s.getAngle();

            result.style = "unknown";

            if (4 === points) {
                if (angle === 0) {
                    if (r2 === 0) {
                        result.style = "esriSMSCross";
                    } else if (r1 === r2) {
                        result.style = "esriSMSX";
                    }
                } else if (angle === 45) {
                    if (r2 === 0) {
                        result.style = "esriSMSDiamond";
                    } else if (r1 === r2) {
                        result.style = "esriSMSSquare";
                    }
                }
            }

            doif(s.getFill(), v => result.color = <any>v.getColor());
            doif(s.getImage(), v => this.serializeStyle(v, result));
            s.getOpacity();

            doif(s.getRadius(), v => result.size = v);
            // need a place for radius2; don't think ESRI has a solution for these shapes
            doif(s.getRadius2(), v => result.size2 = v);

            s.getScale();
            doif(s.getStroke(), v => this.serializeStyle(v, result));
            //s.getText();
        }

        if (s instanceof ol.style.Stroke) {
            result.outline = result.outline || <any>{};
            doif(s.getColor(), v => result.outline.color = <any>v);
            s.getLineCap();
            s.getLineDash();
            s.getLineJoin();
            //s.getMitterLimit();
            doif(s.getWidth(), v => result.outline.width = v);
        }

        if (s instanceof ol.style.Text) {
            s
            debugger;
        }

        if (s instanceof ol.style.Image) {
            s.getOpacity();
            result.angle = s.getRotation();
            s.getScale();
        }

        if (s instanceof ol.style.Style) {            
            let fill = s.getFill();
            if (fill) {
                result.color = ol.color.asArray(<any>fill.getColor());
            }
            let image = s.getImage();
            if (image) {
                this.serializeStyle(image, result);
            }
        }

    }


    deserializePath(json: SimpleMarkerSymbol.Style) {

        let canvas = document.createElement("canvas");
        /*
        let icon = new ol.style.Icon({
            src: "https://rawgit.com/mapbox/maki/master/icons/aerialway-15.svg"
        });
         */
        let size = 2 * asWidth(json.size);

        let svgdata = `
        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
            x="${json.xoffset}px" y="${json.yoffset}px" width="${size}px" height="${size}px" 
            xml:space="preserve">

        <path d="${json.path}" 
            fill="${asColor(json.color)}" 
            stroke="${asColor(json.outline.color)}" 
            stroke-width="${asWidth(json.outline.width)}" 
            stroke-linecap="butt" 
            stroke-linejoin="miter" 
            stroke-miterlimit="4"
            stroke-dasharray="none" 
            fill-rule="evenodd"
            transform="rotate(${json.angle} ${(json.xoffset + json.size)} ${(json.yoffset + json.size)})"
        />

        </svg>`;

        return new ol.style.Style({
            image: new ol.style.Icon({
                src: `data:image/svg+xml;utf8,${svgdata}`
            })
        });

    }

    deserializeCircle(json: SimpleMarkerSymbol.Style) {

        return new ol.style.Style({
            image: new ol.style.Circle({
                radius: asWidth(json.size / 2),
                fill: new ol.style.Fill({
                    color: asColor(json.color)
                }),
                stroke: new ol.style.Stroke({
                    color: asColor(json.outline.color),
                    width: json.outline.width,
                    lineJoin: "",
                    lineDash: [],
                    miterLimit: 4
                })
            })
        });

    }

    deserializeCross(json: SimpleMarkerSymbol.Style) {

        return new ol.style.Style({
            image: new ol.style.RegularShape({
                points: 4,
                angle: 0,
                radius: asWidth(json.size / 2),
                radius2: 0,
                fill: new ol.style.Fill({
                    color: asColor(json.color)
                }),
                stroke: new ol.style.Stroke({
                    color: asColor(json.outline.color),
                    width: asWidth(json.outline.width),
                    lineJoin: "",
                    lineDash: [],
                    miterLimit: 4
                })
            })
        });

    }

    deserializeDiamond(json: SimpleMarkerSymbol.Style) {

        return new ol.style.Style({
            image: new ol.style.RegularShape({
                points: 4,
                radius: asWidth(json.size / 2),
                radius2: asWidth(json.size / 2),
                angle: json.angle,
                fill: new ol.style.Fill({
                    color: asColor(json.color)
                }),
                stroke: new ol.style.Stroke({
                    color: asColor(json.outline.color),
                    width: asWidth(json.outline.width),
                    lineJoin: "",
                    lineDash: [],
                    miterLimit: 4
                })
            })
        });

    }

    deserializeSquare(json: SimpleMarkerSymbol.Style) {

        return new ol.style.Style({
            image: new ol.style.RegularShape({
                points: 4,
                radius: asWidth(json.size / Math.sqrt(2)),
                radius2: asWidth(json.size / Math.sqrt(2)),
                angle: Math.PI / 4,
                fill: new ol.style.Fill({
                    color: asColor(json.color)
                }),
                stroke: new ol.style.Stroke({
                    color: asColor(json.outline.color),
                    width: asWidth(json.outline.width),
                    lineJoin: "",
                    lineDash: [],
                    miterLimit: 4
                })
            })
        });

    }

    deserializeX(json: SimpleMarkerSymbol.Style) {

        return new ol.style.Style({
            image: new ol.style.RegularShape({
                points: 4,
                radius: asWidth(json.size / Math.sqrt(2)),
                radius2: 0,
                angle: Math.PI / 4,
                fill: new ol.style.Fill({
                    color: asColor(json.color)
                }),
                stroke: new ol.style.Stroke({
                    color: asColor(json.outline.color),
                    width: asWidth(json.outline.width),
                    lineJoin: "",
                    lineDash: [],
                    miterLimit: 4
                })
            })
        });

    }
} 