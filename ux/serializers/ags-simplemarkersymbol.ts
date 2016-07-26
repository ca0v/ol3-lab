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
        color: number[];
        size: number;
        angle: number;
        xoffset: number;
        yoffset: number;
        type: string;
        style: string;
        outline: Outline;
        path: string;
    }

}

function asColor(color: number[]) {
    if (color.length == 4 && color[3] > 1) {
        color[3] /= 255.0;        
    } 
    return ol.color.asString(color);
}

export class SimpleMarkerConverter implements Serializer.IConverter<SimpleMarkerSymbol.Style> {
    fromJson(json: SimpleMarkerSymbol.Style) {

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
            stroke-width="${4 * json.outline.width / 3}" 
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

    toJson(style: ol.style.Style) {
        let result = <SimpleMarkerSymbol.Style>{};

        return result;
    }

} 