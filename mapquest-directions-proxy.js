/**
 * http://www.mapquestapi.com/directions/v2/route?key=cwm3pF5yuEGNp54sh96TF0irs5kCLd5y&from=Lancaster,PA&to=York,PA&callback=define
 * http://www.mapquestapi.com/directions/v2/route?key=cwm3pF5yuEGNp54sh96TF0irs5kCLd5y?from=Lancaster,PA&to=York,PA&callback=define
 * http://www.mapquestapi.com/directions/v2/route?key=cwm3pF5yuEGNp54sh96TF0irs5kCLd5y?from=Lancaster,PA&to=York,PA&callback=define
 */
define(["require", "exports", "./ajax"], function (require, exports, ajax) {
    var MapQuestKey = "cwm3pF5yuEGNp54sh96TF0irs5kCLd5y";
    var Directions = (function () {
        function Directions() {
            this.sessionId = "";
        }
        Directions.prototype.directions = function (url, data) {
            var _this = this;
            var req = $.extend({
                outFormat: "json",
                unit: "m",
                routeType: "fastest",
                avoidTimedConditions: false,
                doReverseGeocode: true,
                narrativeType: "text",
                enhancedNarrative: false,
                maxLinkId: 0,
                locale: "en_US",
                // no way to handle multiple avoids without hand-coding url?
                // [toll road, unpaved, ferry, limited access, approximate seasonal closure, country border crossing]
                inFormat: "kvp",
                avoids: "unpaved",
                stateBoundaryDisplay: true,
                countryBoundaryDisplay: true,
                sideOfStreetDisplay: false,
                destinationManeuverDisplay: false,
                fullShape: false,
                shapeFormat: "raw",
                inShapeFormat: "raw",
                outShapeFormat: "raw",
                generalize: 10,
                drivingStyle: "normal",
                highwayEfficiency: 20,
                manMaps: false
            }, data);
            if (this.sessionId)
                req.sessionId = this.sessionId;
            return ajax.jsonp(url, req).then(function (response) {
                _this.sessionId = response.route.sessionId;
                return response;
            });
        };
        Directions.test = function () {
            var serviceUrl = "http://www.mapquestapi.com/directions/v2/route";
            var request = {
                key: MapQuestKey,
                from: "50 Datastream Plaza, Greenville, SC",
                to: "550 S Main St 101, Greenville, SC 29601"
            };
            return new Directions().directions(serviceUrl, request).then(function (result) {
                console.log("directions", result);
                result.route.legs.forEach(function (leg) {
                    console.log(leg.destNarrative, leg.maneuvers.map(function (m) { return m.narrative; }).join("\n\t"));
                });
                return result;
            });
        };
        return Directions;
    })();
    return Directions;
});
/**
 * Response
 *
 define({
    "route": {
        "hasTollRoad": false,
        "computedWaypoints": [],
        "fuelUsed": 1.28,
        "hasUnpaved": false,
        "hasHighway": true,
        "realTime": 2149,
        "boundingBox": {
            "ul": {
                "lng": -76.735382,
                "lat": 40.061412
            },
            "lr": {
                "lng": -76.307075,
                "lat": 39.960338
            }
        },
        "distance": 25.972,
        "time": 2077,
        "locationSequence": [0, 1],
        "hasSeasonalClosure": false,
        "sessionId": "569d2d38-029f-0008-02b7-0ec7-00163eb7a452",
        "locations": [{
            "latLng": {
                "lng": -76.307078,
                "lat": 40.039401
            },
            "adminArea4": "Lancaster County",
            "adminArea5Type": "City",
            "adminArea4Type": "County",
            "adminArea5": "Lancaster",
            "street": "",
            "adminArea1": "US",
            "adminArea3": "PA",
            "type": "s",
            "displayLatLng": {
                "lng": -76.307075,
                "lat": 40.039402
            },
            "linkId": 37195054,
            "postalCode": "",
            "sideOfStreet": "N",
            "dragPoint": false,
            "adminArea1Type": "Country",
            "geocodeQuality": "CITY",
            "geocodeQualityCode": "A5XAX",
            "adminArea3Type": "State"
        },
        {
            "latLng": {
                "lng": -76.734668,
                "lat": 39.960339
            },
            "adminArea4": "York County",
            "adminArea5Type": "City",
            "adminArea4Type": "County",
            "adminArea5": "York",
            "street": "",
            "adminArea1": "US",
            "adminArea3": "PA",
            "type": "s",
            "displayLatLng": {
                "lng": -76.734664,
                "lat": 39.960338
            },
            "linkId": 37840561,
            "postalCode": "",
            "sideOfStreet": "N",
            "dragPoint": false,
            "adminArea1Type": "Country",
            "geocodeQuality": "CITY",
            "geocodeQualityCode": "A5XAX",
            "adminArea3Type": "State"
        }],
        "hasCountryCross": false,
        "legs": [{
            "hasTollRoad": false,
            "index": 0,
            "roadGradeStrategy": [
                []
            ],
            "hasHighway": true,
            "hasUnpaved": false,
            "distance": 25.972,
            "time": 2077,
            "origIndex": 3,
            "hasSeasonalClosure": false,
            "origNarrative": "Go west on US-30 W.",
            "hasCountryCross": false,
            "formattedTime": "00:34:37",
            "destNarrative": "Proceed to YORK, PA.",
            "destIndex": 5,
            "maneuvers": [{
                "signs": [{
                    "text": "462",
                    "extraText": "",
                    "direction": 0,
                    "type": 537,
                    "url": "http://icons.mqcdn.com/icons/rs537.png?n=462"
                }],
                "index": 0,
                "maneuverNotes": [],
                "direction": 7,
                "narrative": "Start out going west on W Orange St/PA-462 toward N Prince St/US-222 S/PA-272.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-start_sm.gif",
                "distance": 0.596,
                "time": 103,
                "linkIds": [],
                "streets": ["W Orange St", "PA-462"],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:01:43",
                "directionName": "West",
                "mapUrl": "http://www.mapquestapi.com/staticmap/v4/getmap?key=X2CL1j8ekBW6g0U80tP0OogXILAQWkG4&type=map&size=225,160&pois=purple-1,40.039401999999995,-76.307075,0,0|purple-2,40.038227,-76.318206,0,0|&center=40.0388145,-76.3126405&zoom=11&rand=1366408039&session=569d2d38-029f-0008-02b7-0ec7-00163eb7a452",
                "startPoint": {
                    "lng": -76.307075,
                    "lat": 40.039402
                },
                "turnType": 0
            },
            {
                "signs": [],
                "index": 1,
                "maneuverNotes": [],
                "direction": 7,
                "narrative": "Turn slight right onto Marietta Ave.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_slight_right_sm.gif",
                "distance": 2.46,
                "time": 341,
                "linkIds": [],
                "streets": ["Marietta Ave"],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:05:41",
                "directionName": "West",
                "mapUrl": "http://www.mapquestapi.com/staticmap/v4/getmap?key=X2CL1j8ekBW6g0U80tP0OogXILAQWkG4&type=map&size=225,160&pois=purple-2,40.038227,-76.318206,0,0|purple-3,40.052859999999995,-76.360023,0,0|&center=40.045543499999994,-76.3391145&zoom=9&rand=1366408039&session=569d2d38-029f-0008-02b7-0ec7-00163eb7a452",
                "startPoint": {
                    "lng": -76.318206,
                    "lat": 40.038227
                },
                "turnType": 1
            },
            {
                "signs": [{
                    "text": "741",
                    "extraText": "",
                    "direction": 0,
                    "type": 537,
                    "url": "http://icons.mqcdn.com/icons/rs537.png?n=741"
                }],
                "index": 2,
                "maneuverNotes": [],
                "direction": 1,
                "narrative": "Turn right onto Rohrerstown Rd/PA-741.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_right_sm.gif",
                "distance": 0.597,
                "time": 78,
                "linkIds": [],
                "streets": ["Rohrerstown Rd", "PA-741"],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:01:18",
                "directionName": "North",
                "mapUrl": "http://www.mapquestapi.com/staticmap/v4/getmap?key=X2CL1j8ekBW6g0U80tP0OogXILAQWkG4&type=map&size=225,160&pois=purple-3,40.052859999999995,-76.360023,0,0|purple-4,40.061412,-76.35960299999999,0,0|&center=40.057136,-76.359813&zoom=10&rand=1366408039&session=569d2d38-029f-0008-02b7-0ec7-00163eb7a452",
                "startPoint": {
                    "lng": -76.360023,
                    "lat": 40.05286
                },
                "turnType": 2
            },
            {
                "signs": [{
                    "text": "30",
                    "extraText": "",
                    "direction": 7,
                    "type": 2,
                    "url": "http://icons.mqcdn.com/icons/rs2.png?n=30&d=WEST"
                }],
                "index": 3,
                "maneuverNotes": [],
                "direction": 7,
                "narrative": "Merge onto US-30 W via the ramp on the left toward York.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_merge_left_sm.gif",
                "distance": 19.964,
                "time": 1187,
                "linkIds": [],
                "streets": ["US-30 W"],
                "attributes": 128,
                "transportMode": "AUTO",
                "formattedTime": "00:19:47",
                "directionName": "West",
                "mapUrl": "http://www.mapquestapi.com/staticmap/v4/getmap?key=X2CL1j8ekBW6g0U80tP0OogXILAQWkG4&type=map&size=225,160&pois=purple-4,40.061412,-76.35960299999999,0,0|purple-5,39.982459999999996,-76.708152,0,0|&center=40.021936,-76.53387749999999&zoom=6&rand=1366408039&session=569d2d38-029f-0008-02b7-0ec7-00163eb7a452",
                "startPoint": {
                    "lng": -76.359603,
                    "lat": 40.061412
                },
                "turnType": 11
            },
            {
                "signs": [],
                "index": 4,
                "maneuverNotes": [],
                "direction": 4,
                "narrative": "Turn left onto N Sherman St.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_left_sm.gif",
                "distance": 0.906,
                "time": 116,
                "linkIds": [],
                "streets": ["N Sherman St"],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:01:56",
                "directionName": "South",
                "mapUrl": "http://www.mapquestapi.com/staticmap/v4/getmap?key=X2CL1j8ekBW6g0U80tP0OogXILAQWkG4&type=map&size=225,160&pois=purple-5,39.982459999999996,-76.708152,0,0|purple-6,39.970058,-76.712593,0,0|&center=39.976259,-76.7103725&zoom=9&rand=1366023290&session=569d2d38-029f-0008-02b7-0ec7-00163eb7a452",
                "startPoint": {
                    "lng": -76.708152,
                    "lat": 39.98246
                },
                "turnType": 6
            },
            {
                "signs": [{
                    "text": "462",
                    "extraText": "",
                    "direction": 0,
                    "type": 537,
                    "url": "http://icons.mqcdn.com/icons/rs537.png?n=462"
                }],
                "index": 5,
                "maneuverNotes": [],
                "direction": 6,
                "narrative": "Turn right onto E Philadelphia St/PA-462.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_right_sm.gif",
                "distance": 1.346,
                "time": 224,
                "linkIds": [],
                "streets": ["E Philadelphia St", "PA-462"],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:03:44",
                "directionName": "Southwest",
                "mapUrl": "http://www.mapquestapi.com/staticmap/v4/getmap?key=X2CL1j8ekBW6g0U80tP0OogXILAQWkG4&type=map&size=225,160&pois=purple-6,39.970058,-76.712593,0,0|purple-7,39.961726999999996,-76.735382,0,0|&center=39.965892499999995,-76.72398749999999&zoom=10&rand=1366023290&session=569d2d38-029f-0008-02b7-0ec7-00163eb7a452",
                "startPoint": {
                    "lng": -76.712593,
                    "lat": 39.970058
                },
                "turnType": 2
            },
            {
                "signs": [],
                "index": 6,
                "maneuverNotes": [],
                "direction": 5,
                "narrative": "Turn left onto N Newberry St.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_left_sm.gif",
                "distance": 0.103,
                "time": 28,
                "linkIds": [],
                "streets": ["N Newberry St"],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:00:28",
                "directionName": "Southeast",
                "mapUrl": "http://www.mapquestapi.com/staticmap/v4/getmap?key=X2CL1j8ekBW6g0U80tP0OogXILAQWkG4&type=map&size=225,160&pois=purple-7,39.961726999999996,-76.735382,0,0|purple-8,39.960338,-76.734664,0,0|&center=39.9610325,-76.735023&zoom=13&rand=1366023290&session=569d2d38-029f-0008-02b7-0ec7-00163eb7a452",
                "startPoint": {
                    "lng": -76.735382,
                    "lat": 39.961727
                },
                "turnType": 6
            },
            {
                "signs": [],
                "index": 7,
                "maneuverNotes": [],
                "direction": 0,
                "narrative": "Welcome to YORK, PA.",
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
                    "lng": -76.734664,
                    "lat": 39.960338
                },
                "turnType": -1
            }],
            "hasFerry": false
        }],
        "formattedTime": "00:34:37",
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
});
 */ 
