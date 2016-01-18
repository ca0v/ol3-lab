import ol = require("openlayers");
import Directions = require("./mapquest-directions-proxy");
import Traffic = require("./mapquest-traffic-proxy");
import Geocoding = require("./mapquest-geocoding-proxy");

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

}

function run() {
    console.log("ol3 playground", ol);
    //let tests = new Tests();
    //tests.heatmap();
    Geocoding.test();
    //Traffic.test();
    //Directions.test();
}

export = run;