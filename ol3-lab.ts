import ol = require("openlayers");
import Directions = require("./ol3-lab/ux/mapquest-directions-proxy");
import Route = require("./ol3-lab/ux/mapquest-optimized-route-proxy");
import $ = require("jquery");
import ResizeSensor = require("css-element-queries/src/ResizeSensor");
import { MapQuestDirections } from "./d.ts/mapquest";

class Tests {
	heatmap() {
		let map = new ol.Map({
			target: "map",
			view: new ol.View({
				projection: "EPSG:4326",
				center: [-82.4, 34.85],
				zoom: 15,
			}),
			layers: [
				new ol.layer.Tile({
					source: new ol.source.OSM(<any>{
						layer: "sat",
					}),
				}),
			],
		});

		return map;
	}

	renderRoute(map: ol.Map, result: MapQuestDirections.Response) {
		let lr = result.route.boundingBox.lr;
		let ul = result.route.boundingBox.ul;
		// lon,lat <==> x,y;
		// ul => max y, min x;
		// lr => min y, max x
		map.getView().fit([ul.lng, lr.lat, lr.lng, ul.lat]);

		let points = <ol.Coordinate[]>[];

		for (let i = 0; i < result.route.shape.shapePoints.length; i += 2) {
			let [lat, lon] = [result.route.shape.shapePoints[i], result.route.shape.shapePoints[i + 1]];
			points.push([lon, lat]);
		}

		console.log("points", points);

		let geom = new ol.geom.LineString(points);

		let route = new ol.Feature({
			geometry: geom,
		});

		route.setStyle(
			new ol.style.Style({
				stroke: new ol.style.Stroke({
					color: "red",
					width: 5,
				}),
			}),
		);

		let source = new ol.source.Vector({
			features: [route],
		});

		let routeLayer = new ol.layer.Vector({
			source: source,
		});

		result.route.locations.forEach(l => {
			let location = new ol.Feature({
				geometry: new ol.geom.Point([l.latLng.lng, l.latLng.lat]),
			});
			source.addFeature(location);
		});

		map.addLayer(routeLayer);

		result.route.legs.forEach(leg => {
			console.log(leg.destNarrative, leg.maneuvers.map(m => m.narrative).join("\n\t"));
		});
	}

	resize(map: ol.Map) {
		console.log("map should become portrait in 3 seconds");
		setTimeout(() => $(".map").addClass("portrait"), 3000);

		console.log("map should become landscape in 5 seconds");
		setTimeout(() => $(".map").removeClass("portrait"), 5000);

		console.log("map should become resize aware in 7 seconds");
		setTimeout(() => {
			//$(".map").resize(() => map.updateSize());
			new ResizeSensor($(".map")[0], () => map.updateSize());
		}, 7000);

		console.log("map should become portrait in 9 seconds");
		setTimeout(() => $(".map").addClass("portrait"), 9000);
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
	let l1 = [
		"550 S Main St 101, Greenville, SC 29601",
		"207 N Main St, Greenville, SC 29601",
		"100 S Main St 101, Greenville, SC 29601",
	];

	let l2 = ["34.845546,-82.401672", "34.845547,-82.401674"];

	false &&
		Route.test({
			from: "50 Datastream Plaza, Greenville, SC",
			to: "50 Datastream Plaza, Greenville, SC",
			locations: l2,
		}).then(result => tests.renderRoute(map, result));

	false &&
		Directions.test({
			from: "50 Datastream Plaza, Greenville, SC",
			to: ["550 S Main St 101, Greenville, SC 29601", "207 N Main St, Greenville, SC 29601"],
		}).then(result => tests.renderRoute(map, result));

	tests.resize(map);
}

export = run;

/**
{
    "route": {
        "hasTollRoad": false,
        "computedWaypoints": [],
        "fuelUsed": 0.09,
        "hasUnpaved": false,
        "hasHighway": false,
        "realTime": 267,
        "boundingBox": {
            "ul": {
                "lng": -82.401672,
                "lat": 34.852664
            },
            "lr": {
                "lng": -82.398078,
                "lat": 34.845546
            }
        },
        "distance": 0.757,
        "time": 231,
        "locationSequence": [0, 1, 2],
        "hasSeasonalClosure": false,
        "sessionId": "56e1ae99-0021-0006-02b7-1818-00163eaddb46",
        "locations": [{
            "latLng": {
                "lng": -82.401674,
                "lat": 34.845547
            },
            "adminArea4": "Greenville",
            "adminArea5Type": "City",
            "adminArea4Type": "County",
            "adminArea5": "Greenville",
            "street": "550 S Main St, 101",
            "adminArea1": "US",
            "adminArea3": "SC",
            "type": "s",
            "displayLatLng": {
                "lng": -82.401672,
                "lat": 34.845546
            },
            "linkId": 48042149,
            "postalCode": "29601-2503",
            "sideOfStreet": "R",
            "dragPoint": false,
            "adminArea1Type": "Country",
            "geocodeQuality": "POINT",
            "geocodeQualityCode": "P1AAA",
            "adminArea3Type": "State"
        },
        {
            "latLng": {
                "lng": -82.398078,
                "lat": 34.852666
            },
            "adminArea4": "Greenville",
            "adminArea5Type": "City",
            "adminArea4Type": "County",
            "adminArea5": "Greenville",
            "street": "207 N Main St",
            "adminArea1": "US",
            "adminArea3": "SC",
            "type": "s",
            "displayLatLng": {
                "lng": -82.398078,
                "lat": 34.852664
            },
            "linkId": 48131299,
            "postalCode": "29601-2115",
            "sideOfStreet": "L",
            "dragPoint": false,
            "adminArea1Type": "Country",
            "geocodeQuality": "POINT",
            "geocodeQualityCode": "P1AAA",
            "adminArea3Type": "State"
        },
        {
            "latLng": {
                "lng": -82.39947,
                "lat": 34.849629
            },
            "adminArea4": "Greenville",
            "adminArea5Type": "City",
            "adminArea4Type": "County",
            "adminArea5": "Greenville",
            "street": "100 S Main St, 101",
            "adminArea1": "US",
            "adminArea3": "SC",
            "type": "s",
            "displayLatLng": {
                "lng": -82.399467,
                "lat": 34.849628
            },
            "linkId": 47781149,
            "postalCode": "29601-2748",
            "sideOfStreet": "R",
            "dragPoint": false,
            "adminArea1Type": "Country",
            "geocodeQuality": "ADDRESS",
            "geocodeQualityCode": "L1AAA",
            "adminArea3Type": "State"
        }],
        "hasCountryCross": false,
        "legs": [{
            "hasTollRoad": false,
            "index": 0,
            "roadGradeStrategy": [
                []
            ],
            "hasHighway": false,
            "hasUnpaved": false,
            "distance": 0.533,
            "time": 159,
            "origIndex": -1,
            "hasSeasonalClosure": false,
            "origNarrative": "",
            "hasCountryCross": false,
            "formattedTime": "00:02:39",
            "destNarrative": "",
            "destIndex": -1,
            "maneuvers": [{
                "signs": [],
                "index": 0,
                "maneuverNotes": [],
                "direction": 3,
                "narrative": "Start out going northeast on S Main St toward E Broad St.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-start_sm.gif",
                "distance": 0.533,
                "time": 159,
                "linkIds": [],
                "streets": ["S Main St"],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:02:39",
                "directionName": "Northeast",
                "mapUrl": "http://www.mapquestapi.com/staticmap/v4/getmap?key=cwm3pF5yuEGNp54sh96TF0irs5kCLd5y&type=map&size=225,160&pois=purple-1,34.845546,-82.40167199999999,0,0|purple-2,34.852664,-82.398078,0,0|&center=34.849104999999994,-82.399875&zoom=10&rand=1940271945&session=56e1ae99-0021-0006-02b7-1818-00163eaddb46",
                "startPoint": {
                    "lng": -82.401672,
                    "lat": 34.845546
                },
                "turnType": 6
            },
            {
                "signs": [],
                "index": 1,
                "maneuverNotes": [],
                "direction": 0,
                "narrative": "207 N MAIN ST is on the left.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-end_sm.gif",
                "distance": 0,
                "time": 0,
                "linkIds": [],
                "streets": [],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:00:00",
                "directionName": "",
                "startPoint": {
                    "lng": -82.398078,
                    "lat": 34.852664
                },
                "turnType": -1
            }],
            "hasFerry": false
        },
        {
            "hasTollRoad": false,
            "index": 1,
            "roadGradeStrategy": [
                []
            ],
            "hasHighway": false,
            "hasUnpaved": false,
            "distance": 0.224,
            "time": 72,
            "origIndex": -1,
            "hasSeasonalClosure": false,
            "origNarrative": "",
            "hasCountryCross": false,
            "formattedTime": "00:01:12",
            "destNarrative": "",
            "destIndex": -1,
            "maneuvers": [{
                "signs": [],
                "index": 2,
                "maneuverNotes": [],
                "direction": 4,
                "narrative": "Start out going south on N Main St toward W North St/SC-183.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-start_sm.gif",
                "distance": 0.224,
                "time": 72,
                "linkIds": [],
                "streets": ["N Main St"],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:01:12",
                "directionName": "South",
                "mapUrl": "http://www.mapquestapi.com/staticmap/v4/getmap?key=cwm3pF5yuEGNp54sh96TF0irs5kCLd5y&type=map&size=225,160&pois=purple-3,34.852664,-82.398078,0,0|purple-4,34.84962,-82.399475,0,0|&center=34.851141999999996,-82.3987765&zoom=11&rand=1940271945&session=56e1ae99-0021-0006-02b7-1818-00163eaddb46",
                "startPoint": {
                    "lng": -82.398078,
                    "lat": 34.852664
                },
                "turnType": 2
            },
            {
                "signs": [],
                "index": 3,
                "maneuverNotes": [],
                "direction": 0,
                "narrative": "100 S MAIN ST, 101 is on the right.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-end_sm.gif",
                "distance": 0,
                "time": 0,
                "linkIds": [],
                "streets": [],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:00:00",
                "directionName": "",
                "startPoint": {
                    "lng": -82.399475,
                    "lat": 34.84962
                },
                "turnType": -1
            }],
            "hasFerry": false
        }],
        "formattedTime": "00:03:51",
        "routeError": {
            "message": "",
            "errorCode": -400
        },
        "options": {
            "mustAvoidLinkIds": [],
            "drivingStyle": 2,
            "countryBoundaryDisplay": true,
            "generalize": -1,
            "narrativeType": "text",
            "locale": "en_US",
            "avoidTimedConditions": false,
            "destinationManeuverDisplay": true,
            "enhancedNarrative": false,
            "filterZoneFactor": -1,
            "timeType": 0,
            "maxWalkingDistance": -1,
            "routeType": "FASTEST",
            "transferPenalty": -1,
            "stateBoundaryDisplay": true,
            "walkingSpeed": -1,
            "maxLinkId": 0,
            "arteryWeights": [],
            "tryAvoidLinkIds": [],
            "unit": "M",
            "routeNumber": 0,
            "shapeFormat": "raw",
            "maneuverPenalty": -1,
            "useTraffic": false,
            "returnLinkDirections": false,
            "avoidTripIds": [],
            "manmaps": "true",
            "highwayEfficiency": 22,
            "sideOfStreetDisplay": true,
            "cyclingRoadFactor": 1,
            "urbanAvoidFactor": -1
        },
        "hasFerry": false
    },
    "info": {
        "copyright": {
            "text": "© 2015 MapQuest, Inc.",
            "imageUrl": "http://api.mqcdn.com/res/mqlogo.gif",
            "imageAltText": "© 2015 MapQuest, Inc."
        },
        "statuscode": 0,
        "messages": []
    }
}
 */
