import ol = require("openlayers");
import Directions = require("./mapquest-directions-proxy");
import Traffic = require("./mapquest-traffic-proxy");
import Geocoding = require("./mapquest-geocoding-proxy");
import Search = require("./mapquest-search-proxy");
import PolylineEncoder = require("./google-polyline");
import Osrm = require("./osrm-proxy");

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

    polylineEncoder() {
        let encoder = new PolylineEncoder();
        console.log("_p~iF~ps|U_ulLnnqC_mqNvxq`@", encoder.encode([[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]]));
        console.log("decode", encoder.decode("_p~iF~ps|U_ulLnnqC_mqNvxq`@"));
    }
}

function run() {
    console.log("ol3 playground");
    //let tests = new Tests();
    //tests.polylineEncoder();
    //tests.heatmap();
    Osrm.test();
    //Search.test();
    //Geocoding.test();
    //Traffic.test();
    //Directions.test();
}

export = run;