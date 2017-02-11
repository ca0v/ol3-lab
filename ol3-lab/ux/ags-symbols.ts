/**
 * This is a test for rendering ArcGIS features
 */
import ol = require("openlayers");
import StyleGenerator = require("../labs/common/style-generator");

import circleSymbol = require("ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-circle");
import crossSymbol = require("ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-cross");
import squareSymbol = require("ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-square");
import diamondSymbol = require("ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-diamond");
import pathSymbol = require("ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-path");
import xSymbol = require("ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-x");
import iconurl = require("ol3-symbolizer/ol3-symbolizer/styles/ags/picturemarkersymbol");
import iconimagedata = require("ol3-symbolizer/ol3-symbolizer/styles/ags/picturemarkersymbol-imagedata");


import { StyleConverter } from "ol3-symbolizer/ol3-symbolizer/format/ags-symbolizer";

const center = <[number, number]>[-82.4, 34.85];

export function run() {

    let formatter = new StyleConverter();

    let generator = new StyleGenerator({
        center: center,
        fromJson: json => formatter.fromJson(json)
    });

    let layer = generator.asMarkerLayer({
        markerCount: 50,
        styleCount: 1
    });

    let map = new ol.Map({
        target: "map",
        view: new ol.View({
            projection: 'EPSG:4326',
            center: center,
            zoom: 10
        }),
        layers: [layer]
    });

    let circleStyle = formatter.fromJson(circleSymbol[0]);
    let crossStyle = formatter.fromJson(crossSymbol[0]);
    let squareStyle = formatter.fromJson(squareSymbol[0]);
    let diamondStyle = formatter.fromJson(diamondSymbol[0]);
    let pathStyle = formatter.fromJson(pathSymbol[0]);
    let xStyle = formatter.fromJson(xSymbol[0]);

    let styles = [
        circleStyle,
        crossStyle,
        diamondStyle,
        pathStyle,
        squareStyle,
        xStyle,
        formatter.fromJson(iconurl[0]),
        formatter.fromJson(iconimagedata[0])
    ];

    layer.getSource().getFeatures().forEach((f, i) => f.setStyle([styles[i % styles.length]]));
}