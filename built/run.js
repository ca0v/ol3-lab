define("ajax", ["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    function jsonp(url, args) {
        if (args === void 0) { args = {}; }
        var d = $.Deferred();
        {
            args["callback"] = "define";
            var uri = url + "?" + Object.keys(args).map(function (k) { return (k + "=" + args[k]); }).join('&');
            require([uri], function (data) { return d.resolve(data); });
        }
        return d;
    }
    exports.jsonp = jsonp;
});
/**
 * http://www.mapquestapi.com/directions/v2/route?key=cwm3pF5yuEGNp54sh96TF0irs5kCLd5y&from=Lancaster,PA&to=York,PA&callback=define
 * http://www.mapquestapi.com/directions/v2/route?key=cwm3pF5yuEGNp54sh96TF0irs5kCLd5y?from=Lancaster,PA&to=York,PA&callback=define
 * http://www.mapquestapi.com/directions/v2/route?key=cwm3pF5yuEGNp54sh96TF0irs5kCLd5y?from=Lancaster,PA&to=York,PA&callback=define
 */
define("mapquest-directions-proxy", ["require", "exports", "ajax"], function (require, exports, ajax) {
    "use strict";
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
            new Directions().directions(serviceUrl, request).then(function (result) {
                console.log("directions", result);
                result.route.legs.forEach(function (leg) {
                    console.log(leg.destNarrative, leg.maneuvers.map(function (m) { return m.narrative; }).join("\n\t"));
                });
            });
        };
        return Directions;
    }());
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
define("mapquest-traffic-proxy", ["require", "exports", "ajax"], function (require, exports, ajax) {
    "use strict";
    var MapQuestKey = "cwm3pF5yuEGNp54sh96TF0irs5kCLd5y";
    var Traffic = (function () {
        function Traffic() {
        }
        Traffic.prototype.incidents = function (url, data) {
            var req = $.extend({
                inFormat: "kvp",
                outFormat: "json"
            }, data);
            return ajax.jsonp(url, req).then(function (response) {
                return response;
            });
        };
        Traffic.test = function () {
            var serviceUrl = "http://www.mapquestapi.com/traffic/v2/incidents";
            var request = {
                key: MapQuestKey,
                filters: "construction,incidents",
                boundingBox: [34.85, -82.4, 35, -82]
            };
            new Traffic().incidents(serviceUrl, request).then(function (result) {
                console.log("traffic incidents", result);
                result.incidents.forEach(function (i) {
                    console.log(i.shortDesc, i.fullDesc);
                });
            });
        };
        return Traffic;
    }());
    return Traffic;
});
/**
 * Example:
 define({
    "incidents": [{
        "parameterizedDescription": {
            "crossRoad2": "SC-290 Locust Hill Rd / SC-253 Mountain View Rd",
            "crossRoad1": "",
            "position2": "",
            "direction": "both ways",
            "position1": "around",
            "eventText": "Intermittent Lane Closures, construction work",
            "toLocation": "Taylors",
            "roadName": "SC-290"
        },
        "delayFromFreeFlow": 0,
        "delayFromTypical": 0,
        "fullDesc": "Intermittent lane closures due to construction work on SC-290 Locust Hill Rd both ways around SC-253 Mountain View Rd.",
        "severity": 2,
        "lng": -82.345451,
        "shortDesc": "SC-290 Locust Hill Rd: intermittent lane closures around SC-253 Mountain View Rd",
        "type": 1,
        "endTime": "2016-12-21T23:59:00",
        "id": "343010",
        "startTime": "2015-09-23T00:01:00",
        "distance": 0.01,
        "impacting": true,
        "eventCode": 701,
        "lat": 34.993832,
        "iconURL": "http://api.mqcdn.com/mqtraffic/const_mod.png"
    },
    {
        "parameterizedDescription": {
            "crossRoad2": "US-29 Wade Hampton Blvd / SC-290 Buncombe Rd / Buncombe St",
            "crossRoad1": "SC-290 O'Neal Rd",
            "position2": "to",
            "direction": "both ways",
            "position1": "from",
            "eventText": "Intermittent Lane Closures, construction work",
            "fromLocation": "Greer",
            "toLocation": "Greer",
            "roadName": "SC-290"
        },
        "delayFromFreeFlow": 0.07999999821186066,
        "delayFromTypical": 0,
        "fullDesc": "Intermittent lane closures due to construction work on SC-101 both ways from SC-290 O'Neal Rd to US-29 Wade Hampton Blvd.",
        "severity": 2,
        "lng": -82.259537,
        "shortDesc": "SC-101: intermittent lane closures from SC-290 O'Neal Rd to US-29 Wade Hampton Blvd",
        "type": 1,
        "endTime": "2016-05-31T23:59:00",
        "id": "5274176",
        "startTime": "2015-11-26T09:37:25",
        "distance": 1.01,
        "impacting": false,
        "eventCode": 701,
        "lat": 34.94186,
        "iconURL": "http://api.mqcdn.com/mqtraffic/const_mod.png"
    },
    {
        "parameterizedDescription": {
            "crossRoad2": "US-29 Wade Hampton Blvd / SC-290 Buncombe Rd / Buncombe St",
            "crossRoad1": "",
            "position2": "",
            "direction": "both ways",
            "position1": "at",
            "eventText": "Intermittent Lane Closures, construction work",
            "toLocation": "Greer",
            "roadName": "US-29"
        },
        "delayFromFreeFlow": 0.019999999552965164,
        "delayFromTypical": 0.019999999552965164,
        "fullDesc": "Intermittent lane closures due to construction work on US-29 Wade Hampton Blvd both ways at SC-290 Buncombe Rd.",
        "severity": 2,
        "lng": -82.258942,
        "shortDesc": "US-29 Wade Hampton Blvd: intermittent lane closures at SC-290 Buncombe Rd",
        "type": 1,
        "endTime": "2016-05-31T23:59:00",
        "id": "5019586",
        "startTime": "2015-04-27T00:01:00",
        "distance": 0.01,
        "impacting": true,
        "eventCode": 701,
        "lat": 34.942001,
        "iconURL": "http://api.mqcdn.com/mqtraffic/const_mod.png"
    },
    {
        "parameterizedDescription": {
            "crossRoad2": "Leonard Rd / Mayfield Rd",
            "crossRoad1": "Abner Creek Rd / Mayfield Rd",
            "position2": "to",
            "direction": "both ways",
            "position1": "from",
            "eventText": "Road closed, construction work",
            "fromLocation": "Reidville",
            "toLocation": "Reidville",
            "roadName": "Mayfield Rd"
        },
        "delayFromFreeFlow": 0,
        "delayFromTypical": 0,
        "fullDesc": "Road closed due to construction work on Mayfield Rd both ways from Abner Creek Rd to Leonard Rd.",
        "severity": 2,
        "lng": -82.164932,
        "shortDesc": "Mayfield Rd: road closed from Abner Creek Rd to Leonard Rd",
        "type": 1,
        "endTime": "2016-02-29T23:59:00",
        "id": "5261488",
        "startTime": "2015-11-16T00:01:00",
        "distance": 0,
        "impacting": false,
        "eventCode": 401,
        "lat": 34.879845,
        "iconURL": "http://api.mqcdn.com/mqtraffic/const_mod.png"
    },
    {
        "parameterizedDescription": {
            "crossRoad2": "I-85 Exit 68 / SC-129",
            "crossRoad1": "I-85 Exit 56 / SC-14",
            "position2": "and",
            "direction": "both ways",
            "position1": "between",
            "eventText": "Intermittent Lane Closures, construction",
            "fromLocation": "Wellford",
            "toLocation": "Wellford",
            "roadName": "I-85"
        },
        "delayFromFreeFlow": 0,
        "delayFromTypical": 0,
        "fullDesc": "Intermittent lane closures due to construction on I-85 both ways between I-85 Exit 56 / SC-14 and I-85 Exit 68 / SC-129.",
        "severity": 3,
        "lng": -82.053238,
        "shortDesc": "I-85: intermittent lane closures between Exit 56 and Exit 68",
        "type": 1,
        "endTime": "2016-09-16T23:59:00",
        "id": "123533",
        "startTime": "2014-08-18T00:00:00",
        "distance": 23.69,
        "impacting": false,
        "eventCode": 701,
        "lat": 34.961029,
        "iconURL": "http://api.mqcdn.com/mqtraffic/const_mod.png"
    },
    {
        "parameterizedDescription": {
            "crossRoad2": "I-26  Exits 18A,18B / I-85  Exit 70",
            "crossRoad1": "",
            "position2": "",
            "direction": "Southbound",
            "position1": "at",
            "eventText": "Accident",
            "toLocation": "Spartanburg",
            "roadName": "I-85"
        },
        "delayFromFreeFlow": 0,
        "delayFromTypical": 0,
        "fullDesc": "Accident on I-85 Southbound at Exit 70 I-26.",
        "severity": 3,
        "lng": -82.012154,
        "shortDesc": "I-85 S/B: accident at Exit 70 I-26",
        "type": 4,
        "endTime": "2016-01-18T14:57:19",
        "id": "6381949",
        "startTime": "2016-01-18T13:21:36",
        "distance": 0.01,
        "impacting": false,
        "eventCode": 201,
        "lat": 34.978237,
        "iconURL": "http://api.mqcdn.com/mqtraffic/incid_mod.png"
    },
    {
        "parameterizedDescription": {
            "crossRoad2": "I-85 Bus  Exit 1 / College Dr",
            "crossRoad1": "",
            "position2": "",
            "direction": "Southbound",
            "position1": "at",
            "eventText": "Object in Road, approach With Care",
            "toLocation": "Spartanburg",
            "roadName": "I-85 Bus"
        },
        "delayFromFreeFlow": 0,
        "delayFromTypical": 0,
        "fullDesc": "Object in the road on I-85 Bus Southbound at Exit 1 College Dr. Approach with care.",
        "severity": 3,
        "lng": -82.011215,
        "shortDesc": "I-85 Bus S/B: object in the road at Exit 1 College Dr",
        "type": 4,
        "endTime": "2016-01-18T15:05:30",
        "id": "6383724",
        "startTime": "2016-01-18T14:02:17",
        "distance": 0.01,
        "impacting": false,
        "eventCode": 61,
        "lat": 34.96685,
        "iconURL": "http://api.mqcdn.com/mqtraffic/incid_mod.png"
    }],
    "mqURL": "http://www.mapquest.com/maps?traffic=1&latitude=34.925&longitude=-82.2000001",
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
define("mapquest-geocoding-proxy", ["require", "exports", "ajax"], function (require, exports, ajax) {
    "use strict";
    var MapQuestKey = "cwm3pF5yuEGNp54sh96TF0irs5kCLd5y";
    var Geocoding = (function () {
        function Geocoding() {
        }
        Geocoding.prototype.reverse = function (url, data) {
            var req = $.extend({
                inFormat: "kvp",
                outFormat: "json"
            }, data);
            return ajax.jsonp(url, req).then(function (response) {
                return response;
            });
        };
        Geocoding.prototype.address = function (url, data) {
            var req = $.extend({
                maxResults: 1,
                thumbMaps: false,
                ignoreLatLngInput: false,
                delimiter: ",",
                intlMode: "AUTO",
                inFormat: "kvp",
                outFormat: "json"
            }, data);
            return ajax.jsonp(url, req).then(function (response) {
                return response;
            });
        };
        Geocoding.test = function () {
            new Geocoding().address("http://www.mapquestapi.com/geocoding/v1/address", {
                key: MapQuestKey,
                location: "50 Datastream Plaza, Greenville, SC 29615",
                boundingBox: [34.85, -82.4, 35, -82]
            }).then(function (result) {
                console.log("geocoding address", result);
                result.results.forEach(function (r) { return console.log(r.providedLocation.location, r.locations.map(function (l) { return l.linkId; }).join(",")); });
            });
            new Geocoding().reverse("http://www.mapquestapi.com/geocoding/v1/reverse", {
                key: MapQuestKey,
                lat: 34.790672,
                lng: -82.407674
            }).then(function (result) {
                console.log("geocoding reverse", result);
                result.results.forEach(function (r) { return console.log(r.providedLocation.latLng, r.locations.map(function (l) { return l.linkId; }).join(",")); });
            });
        };
        return Geocoding;
    }());
    return Geocoding;
});
/**
 * Sample response:
 * reverse:
 define({
    "info": {
        "statuscode": 0,
        "copyright": {
            "text": "\u00A9 2016 MapQuest, Inc.",
            "imageUrl": "http://api.mqcdn.com/res/mqlogo.gif",
            "imageAltText": "\u00A9 2016 MapQuest, Inc."
        },
        "messages": []
    },
    "options": {
        "maxResults": 1,
        "thumbMaps": true,
        "ignoreLatLngInput": false
    },
    "results": [{
        "providedLocation": {
            "latLng": {
                "lat": 34.790672,
                "lng": -82.407674
            }
        },
        "locations": [{
            "street": "49 Datastream Plz",
            "adminArea6": "",
            "adminArea6Type": "Neighborhood",
            "adminArea5": "Greenville",
            "adminArea5Type": "City",
            "adminArea4": "Greenville",
            "adminArea4Type": "County",
            "adminArea3": "SC",
            "adminArea3Type": "State",
            "adminArea1": "US",
            "adminArea1Type": "Country",
            "postalCode": "29605-3451",
            "geocodeQualityCode": "L1AAA",
            "geocodeQuality": "ADDRESS",
            "dragPoint": false,
            "sideOfStreet": "L",
            "linkId": "0",
            "unknownInput": "",
            "type": "s",
            "latLng": {
                "lat": 34.790654,
                "lng": -82.407669
            },
            "displayLatLng": {
                "lat": 34.790654,
                "lng": -82.407669
            },
            "mapUrl": "http://www.mapquestapi.com/staticmap/v4/getmap?key=cwm3pF5yuEGNp54sh96TF0irs5kCLd5y&type=map&size=225,160&pois=purple-1,34.790654,-82.407669,0,0,|&center=34.790654,-82.407669&zoom=15&rand=1077291555"
        }]
    }]
})
 
 * address:
 
 define({
    "info": {
        "statuscode": 0,
        "copyright": {
            "text": "\u00A9 2016 MapQuest, Inc.",
            "imageUrl": "http://api.mqcdn.com/res/mqlogo.gif",
            "imageAltText": "\u00A9 2016 MapQuest, Inc."
        },
        "messages": []
    },
    "options": {
        "boundingBox": {
            "ul": {
                "lat": 34.85,
                "lng": -82.4
            },
            "lr": {
                "lat": 35.0,
                "lng": -82.0
            }
        },
        "maxResults": 1,
        "thumbMaps": false,
        "ignoreLatLngInput": false
    },
    "results": [{
        "providedLocation": {
            "location": "50 Datastream Plaza, Greenville, SC 29615"
        },
        "locations": [{
            "street": "50 Datastream Plz",
            "adminArea6": "",
            "adminArea6Type": "Neighborhood",
            "adminArea5": "Greenville",
            "adminArea5Type": "City",
            "adminArea4": "Greenville",
            "adminArea4Type": "County",
            "adminArea3": "SC",
            "adminArea3Type": "State",
            "adminArea1": "US",
            "adminArea1Type": "Country",
            "postalCode": "29605-3451",
            "geocodeQualityCode": "L1AAB",
            "geocodeQuality": "ADDRESS",
            "dragPoint": false,
            "sideOfStreet": "R",
            "linkId": "25112378i35469743r64987841",
            "unknownInput": "",
            "type": "s",
            "latLng": {
                "lat": 34.790672,
                "lng": -82.407674
            },
            "displayLatLng": {
                "lat": 34.790672,
                "lng": -82.407674
            }
        }]
    }]
})
 */ 
define("app", ["require", "exports", "openlayers", "mapquest-geocoding-proxy"], function (require, exports, ol, Geocoding) {
    "use strict";
    var Tests = (function () {
        function Tests() {
        }
        Tests.prototype.heatmap = function () {
            var map = new ol.Map({
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
        };
        return Tests;
    }());
    function run() {
        console.log("ol3 playground", ol);
        //let tests = new Tests();
        //tests.heatmap();
        Geocoding.test();
        //Traffic.test();
        //Directions.test();
    }
    return run;
});
