import ol = require("openlayers");
import Formatter = require("./serializers/ags-simplemarkersymbol");
import StyleGenerator = require("./style-generator");

import circleSymbol = require("./styles/ags/simplemarkersymbol-circle");
import crossSymbol = require("./styles/ags/simplemarkersymbol-cross");
import squareSymbol = require("./styles/ags/simplemarkersymbol-square");
import diamondSymbol = require("./styles/ags/simplemarkersymbol-diamond");
import pathSymbol = require("./styles/ags/simplemarkersymbol-path");
import xSymbol = require("./styles/ags/simplemarkersymbol-x");

const center = [-82.4, 34.85];

export function run() {

    let formatter = new Formatter.SimpleMarkerConverter();

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
        xStyle
    ];

    layer.getSource().getFeatures().forEach((f, i) => f.setStyle([styles[i % styles.length]]));
}