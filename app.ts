import ol = require("openlayers");
import Directions = require("./mapquest-directions-proxy");
import Route = require("./mapquest-optimized-route-proxy");
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

        return map;
    }

    polylineEncoder() {
        let encoder = new PolylineEncoder();
        console.log("_p~iF~ps|U_ulLnnqC_mqNvxq`@", encoder.encode([[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]]));
        console.log("decode", encoder.decode("_p~iF~ps|U_ulLnnqC_mqNvxq`@"));
    }

    renderRoute(map: ol.Map, result: MapQuestDirections.Response) {

        let lr = result.route.boundingBox.lr;
        let ul = result.route.boundingBox.ul;
        // lon,lat <==> x,y;
        // ul => max y, min x; 
        // lr => min y, max x
        map.getView().fit([ul.lng, lr.lat, lr.lng, ul.lat], map.getSize());

        let points = <ol.Coordinate[]>[];

        for (let i = 0; i < result.route.shape.shapePoints.length; i += 2) {
            let [lat, lon] = [result.route.shape.shapePoints[i], result.route.shape.shapePoints[i + 1]];
            points.push([lon, lat]);
        }

        console.log("points", points);

        let geom = new ol.geom.LineString(points);

        let route = new ol.Feature({
            geometry: geom
        });

        route.setStyle(new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "red",
                width: 5
            })
        }));

        let source = new ol.source.Vector({
            features: [route]
        });

        let routeLayer = new ol.layer.Vector({
            source: source
        });

        result.route.locations.forEach(l => {
            let location = new ol.Feature({
                geometry: new ol.geom.Point([l.latLng.lng, l.latLng.lat])
            });
            source.addFeature(location);
        });

        map.addLayer(routeLayer);

        result.route.legs.forEach(leg => {
            console.log(leg.destNarrative, leg.maneuvers.map(m => m.narrative).join("\n\t"));
        });

    }
}

function run() {
    console.log("ol3 playground");
    let tests = new Tests();
    //tests.polylineEncoder();
    let map = tests.heatmap();
    //Osrm.test();
    //Search.test();
    //Geocoding.test();
    //Traffic.test();
    true && Route.test({
        from: "50 Datastream Plaza, Greenville, SC",
        to: "50 Datastream Plaza, Greenville, SC",
        locations: [
            "550 S Main St 101, Greenville, SC 29601",
            "207 N Main St, Greenville, SC 29601",
            "100 S Main St 101, Greenville, SC 29601", ]
    }).then(result => tests.renderRoute(map, result));

    false && Directions.test({
        from: "50 Datastream Plaza, Greenville, SC",
        to: ["550 S Main St 101, Greenville, SC 29601", "207 N Main St, Greenville, SC 29601"]
    }).then(result => tests.renderRoute(map, result));
}

export = run;