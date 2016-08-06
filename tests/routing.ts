import ol = require("openlayers");

import Directions = require("../ux/mapquest-directions-proxy");
import Route = require("../ux/mapquest-optimized-route-proxy");

import {run as mapmaker} from '../labs/mapmaker';
import route1 = require('../tests/data/route_01');
import route2 = require('../tests/data/route_02');
import route3 = require('../tests/data/route_03');

function renderRoute(map: ol.Map, result: MapQuestDirections.Response) {

    let lr = result.route.boundingBox.lr;
    let ul = result.route.boundingBox.ul;
    // lon,lat <==> x,y;
    // ul => max y, min x; 
    // lr => min y, max x
    map.getView().fit([ul.lng, lr.lat, lr.lng, ul.lat], map.getSize());

    let points = <ol.Coordinate[]>[];

    if (result.route.shape) {
        for (let i = 0; i < result.route.shape.shapePoints.length; i += 2) {
            let [lat, lon] = [result.route.shape.shapePoints[i], result.route.shape.shapePoints[i + 1]];
            points.push([lon, lat]);
        }
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

export function run() {
    let map = mapmaker();
    //renderRoute(map, route1);
    //renderRoute(map, route2);
    renderRoute(map, route3);

    let l1 = [
        "50 Datastream Plaza, Greenville, SC",
        "550 S Main St 101, Greenville, SC 29601",
        "207 N Main St, Greenville, SC 29601",
        "100 S Main St 101, Greenville, SC 29601"];

    let l2 = [
        "34.845546,-82.401672",
        "34.845547,-82.401674"];

    false && Route.test({
        from: l1[0],
        to: l1[1],
        locations: l2
    }).then(result => renderRoute(map, result));

    Directions.test({
        from: l1[0],
        to: [l1[1], l2[2]]
    }).then(result => renderRoute(map, result));



}
