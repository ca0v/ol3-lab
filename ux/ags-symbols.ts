import ol = require("openlayers");
import Formatter = require("./serializers/ags-simplemarkersymbol");
import StyleGenerator = require("./style-generator");

import test = require("./styles/ags/simplemarkersymbol-path");

const center = [-82.4, 34.85];

export function run() {

    let formatter = new Formatter.SimpleMarkerConverter();

    let generator = new StyleGenerator({
        center: center,
        fromJson: json => formatter.fromJson(json)
    });

    let layer = generator.asMarkerLayer({
        markerCount: 10,
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

    let style = formatter.fromJson(test[0]);
    
    layer.getSource().getFeatures().forEach(f => f.setStyle([style]));
}