import ol = require("openlayers");

declare namespace WebMap {

    export interface Outline {
        style: string;
        color: number[];
        width: number;
        type: string;
    }

    export interface Font {
        weight: string;
        style: string;
        family: string;
        size: number;
    }

    export interface Symbol {
        style: string;
        color: number[];
        outline: Outline;
        type: string;
        width?: number;
        horizontalAlignment: string;
        verticalAlignment: string;
        font: Font;
        height?: number;
        xoffset?: number;
        yoffset?: number;
        contentType: string;
        url: string;
        size?: number;
    }
}

/** 
 * TODO: should have formatter for simplestyle (serializer/deserializer) 
*/
declare namespace MapBox {

    export interface Geometry {
        type: string;
        coordinates: number[];
    }

    export interface Properties {
        // A title to show when this item is clicked or hovered over
        title?: string;

        // A description to show when this item is clicked or hovered over
        description?: string;

        // specify the size of the marker. sizes can be different pixel sizes in different implementations
        "marker-size": "small" | "medium" | "large";

        // a symbol to position in the center of this icon
        // if not provided or "", no symbol is overlaid
        // and only the marker is shown
        // Allowed values include
        // - Icon ID from the Maki project at http://mapbox.com/maki/
        // - An integer 0 through 9
        // - A lowercase character "a" through "z"
        "marker-symbol": string;
        "marker-color": string;
        stroke: string;
        "stroke-opacity": number;
        "stroke-width": number;
        fill: string;
        "fill-opacity": number;
    }

    export interface Feature {
        type: string;
        geometry: Geometry;
        properties: Properties;
    }

    export interface FeatureCollection {
        type: string;
        features: Feature[];
    }

}

/**
 * implemented by all style serializers
 */
export interface IConverter<T> {
    fromJson: (json: T) => ol.style.Style;
    toJson(style: ol.style.Style): T;
}

const geoJsonSimpleStyle: MapBox.FeatureCollection = {
    "type": "FeatureCollection",
    "features": [{
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [0, 0]
        },
        "properties": {
            "title": "A title",

            "description": "A description",

            // OPTIONAL: default "medium"
            // Value must be one of
            // "small"
            // "medium"
            // "large"
            "marker-size": "medium",

            // OPTIONAL: default ""
            "marker-symbol": "bus",

            // OPTIONAL: default "7e7e7e"
            // the marker's color
            //
            // value must follow COLOR RULES
            "marker-color": "#fff",

            // OPTIONAL: default "555555"
            // the color of a line as part of a polygon, polyline, or
            // multigeometry
            //
            // value must follow COLOR RULES
            "stroke": "#555555",

            // OPTIONAL: default 1.0
            // the opacity of the line component of a polygon, polyline, or
            // multigeometry
            //
            // value must be a floating point number greater than or equal to
            // zero and less or equal to than one
            "stroke-opacity": 1.0,

            // OPTIONAL: default 2
            // the width of the line component of a polygon, polyline, or
            // multigeometry
            //
            // value must be a floating point number greater than or equal to 0
            "stroke-width": 2,

            // OPTIONAL: default "555555"
            // the color of the interior of a polygon
            //
            // value must follow COLOR RULES
            "fill": "#555555",

            // OPTIONAL: default 0.6
            // the opacity of the interior of a polygon. Implementations
            // may choose to set this to 0 for line features.
            //
            // value must be a floating point number greater than or equal to
            // zero and less or equal to than one
            "fill-opacity": 0.5
        }
    }]
};

