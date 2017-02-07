import ol = require("openlayers");

import Serializer = require("./serializer");

/**
{
    "color": [
        0,
        0,
        0,
        64
    ],
    "outline": {
        "color": [
            0,
            0,
            0,
            255
        ],
        "width": 1.5,
        "type": "esriSLS",
        "style": "esriSLSDashDotDot"
    },
    "type": "esriSFS",
    "style": "esriSFSBackwardDiagonal"
}
 */
export module SimpleFillSymbol {
    export type Color = string | number[];

    export interface Outline {
        color: Color;
        width: number;
        type: string;
        style: string;
    }

    export interface Style {
        type: "esriSFS";
        style: "esriSFSBackwardDiagonal"|"esriSFS"|"esriSFSCross"|"esriSFSDiagonalCross"|"esriSFSForwardDiagonal"|"esriSFSHorizontal"|"esriSFSSolid"|"esriSFSVertical";
        color: Color;
        outline: Outline;
    }
}

export class SimpleFillConverter implements Serializer.IConverter<SimpleFillSymbol.Style> {

    toJson(): SimpleFillSymbol.Style {
        return null;
    }

    fromJson(json: SimpleFillSymbol.Style): ol.style.Style {
        return null;
    }

}