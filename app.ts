import ol = require("openlayers");
import Directions = require("./mapquest-directions-proxy");

class Tests {

    heatmap() {
        let map = new ol.Map({
            target: "map",
            view: new ol.View({
                projection: 'EPSG:4326',
                center: [-82.4, 34.85],
                zoom: 15
            }),
            layers: [new ol.layer.Tile({
                source: new ol.source.MapQuest({
                    layer: "sat"
                })
            })]
        });
    }

    directions() {
        Directions.test();
    }
}

function run() {
    console.log("ol3 playground", ol);
    let tests = new Tests();
    tests.directions();
    //tests.heatmap();
}

export = run;