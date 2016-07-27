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

    toJson(style: ol.style.Style) {
        let result = <SimpleMarkerSymbol.Style>{};

        return result;
    }

    deserializePath(json: SimpleMarkerSymbol.Style) {

        let canvas = document.createElement("canvas");
        /*
        let icon = new ol.style.Icon({
            src: "https://rawgit.com/mapbox/maki/master/icons/aerialway-15.svg"
        });
         */
        let size = 2 * json.size;

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
            transform="rotate(${json.angle} ${json.xoffset + json.size} ${json.yoffset + json.size})"
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
                radius: json.size,
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