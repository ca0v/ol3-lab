import ol = require("openlayers");
import coretech_flower_json = require("./styles/flower");

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
 * TODO: should have formatter for ol3 (serializer/deserializer) 
*/
declare namespace Coretech {

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

    export interface Text {
        fill?: Fill;
        stroke?: Stroke;
        text?: string;
        "offset-x"?: number;
        "offset-y"?: number;
        font?: string;
    }

    export interface Style {
        star?: any;
        circle?: Circle;
        text?: Text;
    }

}

interface IConverter<T> {
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
export class CoretechConverter implements IConverter<Coretech.Style> {

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

        if (style.getColor) this.assign(s, "color", this.serializeColor(style.getColor()));
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
        if (style.getPoints) this.assign(s, "points", style.getPoints() / 2);
        return s;
    }

    private serializeColor(color: ol.Color) {
        return typeof color === "string" ? color : ol.color.asString(ol.color.asArray(color));
    }

    private serializeFill(fill: ol.style.Fill) {
        return this.serializeStyle(fill);
    }

    private deserializeStyle(json: Coretech.Style) {
        let image: ol.style.Image;
        let text: ol.style.Text;

        if (json.circle) image = this.deserializeCircle(json.circle);
        else if (json.star) image = this.deserializeStar(json.star);
        if (json.text) text = this.deserializeText(json.text);

        let s = new ol.style.Style({
            image: image,
            text: text
        });
        return s;
    }

    private deserializeText(json: any) {
        return new ol.style.Text({
            fill: this.deserializeFill(json.fill),
            stroke: this.deserializeStroke(json.stroke),
            text: json.text,
            font: json.font,
            offsetX: json["offset-x"],
            offsetY: json["offset-y"],
        });
    }

    private deserializeCircle(json: any) {
        let image = new ol.style.Circle({
            radius: json.radius,
            fill: this.deserializeFill(json.fill),
            stroke: this.deserializeStroke(json.stroke)
        });
        image.setOpacity(json.opacity);
        return image;
    }

    private deserializeStar(json: any) {
        let image = new ol.style.RegularShape({
            radius: json.radius,
            radius2: json.radius2,
            points: json.points,
            fill: this.deserializeFill(json.fill),
            stroke: this.deserializeStroke(json.stroke)
        });
        image.setOpacity(json.opacity);
        return image;
    }

    private deserializeFill(json: any) {
        let fill = new ol.style.Fill({
            color: json.color
        });
        return fill;
    }

    private deserializeStroke(json: any) {
        let stroke = new ol.style.Stroke();
        stroke.setColor(json.color);
        stroke.setWidth(json.width);
        return stroke;
    }
}

{
    let coretechConverter = new CoretechConverter();
    let expect = JSON.stringify(coretech_flower_json);
    let actual = JSON.stringify(coretech_flower_json.map(json => coretechConverter.toJson(coretechConverter.fromJson(json))));
    if (expect !== actual) {
        throw "CoretechConverter failure coretech_flower_json";
    };
}