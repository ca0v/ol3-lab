define("ajax", ["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    function jsonp(url, args, callback) {
        if (args === void 0) { args = {}; }
        if (callback === void 0) { callback = "callback"; }
        var d = $.Deferred();
        {
            args[callback] = "define";
            var uri = url + "?" + Object.keys(args).map(function (k) { return (k + "=" + args[k]); }).join('&');
            require([uri], function (data) { return d.resolve(data); });
        }
        return d;
    }
    exports.jsonp = jsonp;
    function post(url, args) {
        if (args === void 0) { args = {}; }
        var d = $.Deferred();
        {
            false && $.post(url, args, function (data, status, XHR) {
                d.resolve(data);
            }, "json");
            var xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function () {
                if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
                    d.resolve(JSON.parse(xmlHttp.responseText));
            };
            xmlHttp.open("POST", url, true); // true for asynchronous 
            xmlHttp.send(JSON.stringify(args));
        }
        return d;
    }
    exports.post = post;
    /**
     * If "to" is an array then multiple "to" query strings should be provided (seriously)
     */
    function mapquest(url, args, callback) {
        if (args === void 0) { args = {}; }
        if (callback === void 0) { callback = "callback"; }
        var d = $.Deferred();
        {
            args[callback] = "define";
            var values_1 = [];
            Object.keys(args).forEach(function (k) {
                var value = args[k];
                if (Array.isArray(value)) {
                    var arr = value;
                    arr.forEach(function (v) { return values_1.push({ name: k, value: v }); });
                }
                else {
                    values_1.push({ name: k, value: value });
                }
            });
            var uri = url + "?" + values_1.map(function (k) { return (k.name + "=" + k.value); }).join('&');
            require([uri], function (data) { return d.resolve(data); });
        }
        return d;
    }
    exports.mapquest = mapquest;
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
            return ajax.mapquest(url, req).then(function (response) {
                _this.sessionId = response.route.sessionId;
                return response;
            });
        };
        Directions.test = function (options) {
            if (!options) {
                options = {
                    from: "50 Datastream Plaza, Greenville, SC",
                    to: "550 S Main St 101, Greenville, SC 29601"
                };
            }
            var serviceUrl = "http://www.mapquestapi.com/directions/v2/route";
            var request = {
                key: MapQuestKey,
                from: options.from,
                to: options.to
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
/*
https://www.mapquestapi.com/directions/#optimized
https://www.mapquestapi.com/common/locations.html

Location objects are either

Strings, which are assumed to be single-line addresses (as described above), or
Location objects, which are JSON objects containing the parameters described in the table below.

| Format | Example |
city (AA5), state (AA3)	Lancaster, PA
city, state, postalCode	Lancaster, PA, 17603
postalCode	17603
street, city, state	1090 N Charlotte St, Lancaster, PA
street, city, state, postalCode	1090 N Charlotte St, Lancaster, PA 17603
street, postalCode	1090 N Charlotte St, 17603
latLng	40.05323,-76.313632

REQUEST URL:

https://www.mapquestapi.com/directions/v2/optimizedroute?key=YOUR_KEY_HERE

REQUEST BODY:
{
   locations:[
      "Boalsburg, PA",
      "York, PA",
      "State College, PA",
      "Lancaster, PA"
   ]
}
*/
define("mapquest-optimized-route-proxy", ["require", "exports", "ajax"], function (require, exports, ajax) {
    "use strict";
    var MapQuestKey = "cwm3pF5yuEGNp54sh96TF0irs5kCLd5y";
    var Route = (function () {
        function Route() {
            this.sessionId = "";
        }
        /**
         * Returns
         * | locationSequence | a sequence array that can be used to determine the index in the original location object list. |
         * | locations | a collection of locations in the form of an address. The origin and destination locations remain fixed, but the intermediate locations are re-ordered as appropriate. |
         */
        Route.prototype.route = function (url, data) {
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
            /** GET + POST work with from/to but how to set locations? */
            return ajax.post(url + "?key=" + req.key, {
                // from: data.from,
                // to: data.to,
                locations: data.locations
            }).then(function (response) {
                _this.sessionId = response.route.sessionId;
                return response;
            });
        };
        Route.test = function (options) {
            var serviceUrl = "http://www.mapquestapi.com/directions/v2/optimizedRoute";
            var request = {
                key: MapQuestKey,
                from: options.from,
                to: options.to,
                locations: options.locations
            };
            return new Route().route(serviceUrl, request).then(function (result) {
                console.log("directions", result);
                result.route.legs.forEach(function (leg) {
                    console.log(leg.destNarrative, leg.maneuvers.map(function (m) { return m.narrative; }).join("\n\t"));
                });
                return result;
            });
        };
        return Route;
    }());
    return Route;
});
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
define("mapquest-geocoding-proxy", ["require", "exports", "ajax", "jquery"], function (require, exports, ajax, $) {
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
define("google-polyline", ["require", "exports"], function (require, exports) {
    "use strict";
    var PolylineEncoder = (function () {
        function PolylineEncoder() {
        }
        PolylineEncoder.prototype.encodeCoordinate = function (coordinate, factor) {
            coordinate = Math.round(coordinate * factor);
            coordinate <<= 1;
            if (coordinate < 0) {
                coordinate = ~coordinate;
            }
            var output = '';
            while (coordinate >= 0x20) {
                output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 0x3f);
                coordinate >>= 5;
            }
            output += String.fromCharCode(coordinate + 0x3f);
            return output;
        };
        PolylineEncoder.prototype.decode = function (str, precision) {
            if (precision === void 0) { precision = 5; }
            var index = 0, lat = 0, lng = 0, coordinates = [], latitude_change, longitude_change, factor = Math.pow(10, precision);
            while (index < str.length) {
                var byte = 0;
                var shift = 0;
                var result = 0;
                do {
                    byte = str.charCodeAt(index++) - 63;
                    result |= (byte & 0x1f) << shift;
                    shift += 5;
                } while (byte >= 0x20);
                var latitude_change_1 = ((result & 1) ? ~(result >> 1) : (result >> 1));
                shift = result = 0;
                do {
                    byte = str.charCodeAt(index++) - 63;
                    result |= (byte & 0x1f) << shift;
                    shift += 5;
                } while (byte >= 0x20);
                longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
                lat += latitude_change_1;
                lng += longitude_change;
                coordinates.push([lat / factor, lng / factor]);
            }
            return coordinates;
        };
        PolylineEncoder.prototype.encode = function (coordinates, precision) {
            if (precision === void 0) { precision = 5; }
            if (!coordinates.length)
                return '';
            var factor = Math.pow(10, precision), output = this.encodeCoordinate(coordinates[0][0], factor) + this.encodeCoordinate(coordinates[0][1], factor);
            for (var i = 1; i < coordinates.length; i++) {
                var a = coordinates[i], b = coordinates[i - 1];
                output += this.encodeCoordinate(a[0] - b[0], factor);
                output += this.encodeCoordinate(a[1] - b[1], factor);
            }
            return output;
        };
        return PolylineEncoder;
    }());
    return PolylineEncoder;
});
/**
 * http://www.mapquestapi.com/search/common-parameters.html
 *
 * http://www.mapquestapi.com/search/v2/search?key=cwm3pF5yuEGNp54sh96TF0irs5kCLd5y&shapePoints=34.85,-82.4
 */
define("mapquest-search-proxy", ["require", "exports", "ajax", "jquery", "google-polyline"], function (require, exports, ajax, $, G) {
    "use strict";
    var g = new G();
    var MapQuestKey = "cwm3pF5yuEGNp54sh96TF0irs5kCLd5y";
    var Search = (function () {
        function Search(url) {
            if (url === void 0) { url = "http://www.mapquestapi.com/search/v2"; }
            this.url = url;
        }
        Search.prototype.search = function (data, type, key) {
            if (type === void 0) { type = "search"; }
            if (key === void 0) { key = MapQuestKey; }
            var req = $.extend({
                key: key,
                inFormat: "json",
                outFormat: "json",
                ambiguities: "ignore",
                units: "m",
                maxMatches: 100,
                shapeFormat: "cmp6"
            }, data);
            var url = this.url + "/" + type;
            return ajax.jsonp(url, req).then(function (response) {
                g.decode; // TODO
                return response;
            });
        };
        Search.prototype.radius = function (data) {
            return this.search(data, "radius");
        };
        Search.prototype.rectangle = function (data) {
            return this.search(data, "rectangle");
        };
        Search.prototype.polygon = function (data) {
            return this.search(data, "polygon");
        };
        Search.prototype.corridor = function (data) {
            /**
    raw: 39.96488,-76.729949,41.099998,-76.305603,39.899011,-76.164335,39.099998,-78.305603
    simple: LINESTRING(-76.305603 40.099998,-76.305603 41.099998,-77.305603 41.099998,-78.305603 39.099998)
    compressed: os|rFdiisMou|Ee{qAdqiF}qZx`{C|eaL
             */
            //g.encode(data.line); // http://www.mapquestapi.com/search/geometry.html
            return this.search($.extend({
                width: 5,
                bufferWidth: 0.25
            }, data), "corridor");
        };
        Search.test = function () {
            var search = new Search();
            search.radius({ origin: [34.85, -82.4] }).then(function (result) { return console.log("radius", result); });
            search.rectangle({ boundingBox: [34.85, -82.4, 34.9, -82.35] }).then(function (result) { return console.log("rectangle", result); });
            search.polygon({ polygon: [34.85, -82.4, 34.85, -82.35, 34.9, -82.35, 34.85, -82.4] }).then(function (result) { return console.log("polygon", result); });
            search.corridor({ line: [34.85, -82.4, 34.9, -82.4], shapeFormat: "raw" }).then(function (result) { return console.log("corridor", result); });
        };
        return Search;
    }());
    return Search;
});
/**
    "searchResults": [{
        "resultNumber": 1,
        "distance": 0.0092,
        "sourceName": "mqap.ntpois",
        "name": "Bubbly",
        "shapePoints": [34.850086, -82.400124],
        "distanceUnit": "m",
        "key": "c6dace5a-1531-459d-9b60-75fa72ad115c",
        "fields": {
            "phone": "8645090101",
            "side_of_street": "R",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.400124,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "290552348",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.400124,
                    "lat": 34.850086
                }
            },
            "address": "20 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Bubbly",
            "mqap_id": "c6dace5a-1531-459d-9b60-75fa72ad115c",
            "group_sic_code_ext": "",
            "disp_lat": 34.850086,
            "lat": 34.850086,
            "disp_lng": -82.400124
        }
    },
    {
        "resultNumber": 2,
        "distance": 0.0104,
        "sourceName": "mqap.ntpois",
        "name": "Cazbah The",
        "shapePoints": [34.850147, -82.399956],
        "distanceUnit": "m",
        "key": "a9773b10-4f23-4b7e-bad8-78bacc21f2ec",
        "fields": {
            "phone": "8642419909",
            "side_of_street": "R",
            "group_sic_code": "581212",
            "state": "SC",
            "lng": -82.399956,
            "group_sic_code_name": "Caterers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Caterers",
            "id": "3579171",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399956,
                    "lat": 34.850147
                }
            },
            "address": "16 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Cazbah The",
            "mqap_id": "a9773b10-4f23-4b7e-bad8-78bacc21f2ec",
            "group_sic_code_ext": "581212",
            "disp_lat": 34.850147,
            "lat": 34.850147,
            "disp_lng": -82.399956
        }
    },
    {
        "resultNumber": 3,
        "distance": 0.0172,
        "sourceName": "mqap.ntpois",
        "name": "Schafer Advertising & Marketing",
        "shapePoints": [34.850231, -82.400116],
        "distanceUnit": "m",
        "key": "c56c3936-148d-4670-aa53-d7b556a077b8",
        "fields": {
            "phone": "8642322544",
            "side_of_street": "L",
            "group_sic_code": "731101",
            "state": "SC",
            "lng": -82.400116,
            "group_sic_code_name": "Advertising Agencies",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Advertising Agencies",
            "id": "3580179",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.400116,
                    "lat": 34.850231
                }
            },
            "address": "25 S Laurens St",
            "postal_code": "29601",
            "name": "Schafer Advertising & Marketing",
            "mqap_id": "c56c3936-148d-4670-aa53-d7b556a077b8",
            "group_sic_code_ext": "731101",
            "disp_lat": 34.850231,
            "lat": 34.850231,
            "disp_lng": -82.400116
        }
    },
    {
        "resultNumber": 4,
        "distance": 0.0205,
        "sourceName": "mqap.ntpois",
        "name": "Lincoln Energy Solutions",
        "shapePoints": [34.850246, -82.399796],
        "distanceUnit": "m",
        "key": "fe35de5c-9f30-40a0-b3be-435d9ff88118",
        "fields": {
            "phone": "8642423003",
            "side_of_street": "R",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399796,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "262760244",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399796,
                    "lat": 34.850246
                }
            },
            "address": "22 S Main St",
            "postal_code": "29601",
            "name": "Lincoln Energy Solutions",
            "mqap_id": "fe35de5c-9f30-40a0-b3be-435d9ff88118",
            "group_sic_code_ext": "",
            "disp_lat": 34.850246,
            "lat": 34.850246,
            "disp_lng": -82.399796
        }
    },
    {
        "resultNumber": 5,
        "distance": 0.0205,
        "sourceName": "mqap.ntpois",
        "name": "Harrison Group",
        "shapePoints": [34.850246, -82.399796],
        "distanceUnit": "m",
        "key": "d60506ab-f5f4-4601-bc56-ef70639fa83e",
        "fields": {
            "phone": "8642336510",
            "side_of_street": "R",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399796,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "3579693",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399796,
                    "lat": 34.850246
                }
            },
            "address": "22 S Main St",
            "postal_code": "29601",
            "name": "Harrison Group",
            "mqap_id": "d60506ab-f5f4-4601-bc56-ef70639fa83e",
            "group_sic_code_ext": "",
            "disp_lat": 34.850246,
            "lat": 34.850246,
            "disp_lng": -82.399796
        }
    },
    {
        "resultNumber": 6,
        "distance": 0.0205,
        "sourceName": "mqap.ntpois",
        "name": "Cliff Realty-Greenville",
        "shapePoints": [34.850246, -82.399796],
        "distanceUnit": "m",
        "key": "6208d713-ac42-4cc7-a328-0e0cc487b452",
        "fields": {
            "phone": "8643650701",
            "side_of_street": "R",
            "group_sic_code": "653108",
            "state": "SC",
            "lng": -82.399796,
            "group_sic_code_name": "Real Estate Management",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Real Estate Management::Real Estate Agents",
            "id": "284906318",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399796,
                    "lat": 34.850246
                }
            },
            "address": "22 S Main St",
            "postal_code": "29601",
            "name": "Cliff Realty-Greenville",
            "mqap_id": "6208d713-ac42-4cc7-a328-0e0cc487b452",
            "group_sic_code_ext": "653108::653118",
            "disp_lat": 34.850246,
            "lat": 34.850246,
            "disp_lng": -82.399796
        }
    },
    {
        "resultNumber": 7,
        "distance": 0.0206,
        "sourceName": "mqap.ntpois",
        "name": "Mary Praytor Gallery",
        "shapePoints": [34.850117, -82.399666],
        "distanceUnit": "m",
        "key": "e8c06490-156e-4767-8909-3b7a0e8cc11d",
        "fields": {
            "phone": "8642351800",
            "side_of_street": "R",
            "group_sic_code": "599969",
            "state": "SC",
            "lng": -82.399666,
            "group_sic_code_name": "Art Galleries & Dealers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Art Galleries & Dealers",
            "id": "3579543",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399666,
                    "lat": 34.850117
                }
            },
            "address": "26 S Main St",
            "postal_code": "29601",
            "name": "Mary Praytor Gallery",
            "mqap_id": "e8c06490-156e-4767-8909-3b7a0e8cc11d",
            "group_sic_code_ext": "599969",
            "disp_lat": 34.850117,
            "lat": 34.850117,
            "disp_lng": -82.399666
        }
    },
    {
        "resultNumber": 8,
        "distance": 0.021,
        "sourceName": "mqap.ntpois",
        "name": "Rache Construction Company",
        "shapePoints": [34.849836, -82.399688],
        "distanceUnit": "m",
        "key": "abc287f0-90b4-417a-93a9-4556462e87be",
        "fields": {
            "phone": "8642333462",
            "side_of_street": "R",
            "group_sic_code": "655202",
            "state": "SC",
            "lng": -82.399688,
            "group_sic_code_name": "Real Estate Developers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Real Estate Developers::Home Builders",
            "id": "3579801",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399688,
                    "lat": 34.849836
                }
            },
            "address": "18 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Rache Construction Company",
            "mqap_id": "abc287f0-90b4-417a-93a9-4556462e87be",
            "group_sic_code_ext": "655202::152112",
            "disp_lat": 34.849836,
            "lat": 34.849836,
            "disp_lng": -82.399688
        }
    },
    {
        "resultNumber": 9,
        "distance": 0.0227,
        "sourceName": "mqap.ntpois",
        "name": "Soco Finance Company",
        "shapePoints": [34.849827, -82.39966],
        "distanceUnit": "m",
        "key": "2691adf0-44d1-4057-bcee-148a6292c161",
        "fields": {
            "phone": "8642420240",
            "side_of_street": "R",
            "group_sic_code": "614101",
            "state": "SC",
            "lng": -82.39966,
            "group_sic_code_name": "Loans",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Loans",
            "id": "277899560",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.39966,
                    "lat": 34.849827
                }
            },
            "address": "14 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Soco Finance Company",
            "mqap_id": "2691adf0-44d1-4057-bcee-148a6292c161",
            "group_sic_code_ext": "614101",
            "disp_lat": 34.849827,
            "lat": 34.849827,
            "disp_lng": -82.39966
        }
    },
    {
        "resultNumber": 10,
        "distance": 0.0252,
        "sourceName": "mqap.ntpois",
        "name": "Carolina Engineering Solutions",
        "shapePoints": [34.849813, -82.399619],
        "distanceUnit": "m",
        "key": "a614c324-2a62-4391-bebd-5d50d188ceb3",
        "fields": {
            "phone": "8643709355",
            "side_of_street": "R",
            "group_sic_code": "871115",
            "state": "SC",
            "lng": -82.399619,
            "group_sic_code_name": "Engineers-Electrical",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Engineers-Electrical::Engineering",
            "id": "277835715",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399619,
                    "lat": 34.849813
                }
            },
            "address": "8 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Carolina Engineering Solutions",
            "mqap_id": "a614c324-2a62-4391-bebd-5d50d188ceb3",
            "group_sic_code_ext": "871115::871147",
            "disp_lat": 34.849813,
            "lat": 34.849813,
            "disp_lng": -82.399619
        }
    },
    {
        "resultNumber": 11,
        "distance": 0.0252,
        "sourceName": "mqap.ntpois",
        "name": "Toshiba Industrial Division",
        "shapePoints": [34.849813, -82.399619],
        "distanceUnit": "m",
        "key": "a7d0f63e-0993-4cb2-88d5-5fff092a745d",
        "fields": {
            "phone": "8642352705",
            "side_of_street": "R",
            "group_sic_code": "573117",
            "state": "SC",
            "lng": -82.399619,
            "group_sic_code_name": "Electronic Equipment & Supplies-Retail",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Electronic Equipment & Supplies-Retail::Electric Supplies-Manufacturers",
            "id": "277418147",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399619,
                    "lat": 34.849813
                }
            },
            "address": "8 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Toshiba Industrial Division",
            "mqap_id": "a7d0f63e-0993-4cb2-88d5-5fff092a745d",
            "group_sic_code_ext": "573117::362101",
            "disp_lat": 34.849813,
            "lat": 34.849813,
            "disp_lng": -82.399619
        }
    },
    {
        "resultNumber": 12,
        "distance": 0.0359,
        "sourceName": "mqap.ntpois",
        "name": "TD Ameritrade",
        "shapePoints": [34.849483, -82.399918],
        "distanceUnit": "m",
        "key": "0e69284f-568a-46ed-bd42-46d5b25974e6",
        "fields": {
            "phone": "8642713400",
            "side_of_street": "R",
            "group_sic_code": "737911",
            "state": "SC",
            "lng": -82.399918,
            "group_sic_code_name": "Computers-Support Services",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Computers-Support Services::Computer Systems Consultants",
            "id": "275283600",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399918,
                    "lat": 34.849483
                }
            },
            "address": "102 S Main St",
            "postal_code": "29601",
            "name": "TD Ameritrade",
            "mqap_id": "0e69284f-568a-46ed-bd42-46d5b25974e6",
            "group_sic_code_ext": "737911::737103",
            "disp_lat": 34.849483,
            "lat": 34.849483,
            "disp_lng": -82.399918
        }
    },
    {
        "resultNumber": 13,
        "distance": 0.0359,
        "sourceName": "mqap.ntpois",
        "name": "Carolina First Bank",
        "shapePoints": [34.849483, -82.399918],
        "distanceUnit": "m",
        "key": "a9a244a2-d508-4d92-8cbe-d536df7d5bd3",
        "fields": {
            "phone": "8642557907",
            "side_of_street": "R",
            "group_sic_code": "602101",
            "state": "SC",
            "lng": -82.399918,
            "group_sic_code_name": "Banks",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Banks::Carolina First Bank",
            "id": "3578607",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399918,
                    "lat": 34.849483
                }
            },
            "address": "102 S Main St",
            "postal_code": "29601",
            "name": "Carolina First Bank",
            "mqap_id": "a9a244a2-d508-4d92-8cbe-d536df7d5bd3",
            "group_sic_code_ext": "602101::602101F41",
            "disp_lat": 34.849483,
            "lat": 34.849483,
            "disp_lng": -82.399918
        }
    },
    {
        "resultNumber": 14,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Nmr and S LLP",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "849412b4-2a11-429c-895d-330b7c1b923e",
        "fields": {
            "phone": "8644517403",
            "side_of_street": "L",
            "group_sic_code": "738113",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "Criminologists",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Criminologists::(all) Lawyers",
            "id": "275628304",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Nmr and S LLP",
            "mqap_id": "849412b4-2a11-429c-895d-330b7c1b923e",
            "group_sic_code_ext": "738113::811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 15,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "James K Price Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "23fb2714-5014-4154-88f3-033c006b9ba9",
        "fields": {
            "phone": "8642714940",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "273869181",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "James K Price Atty",
            "mqap_id": "23fb2714-5014-4154-88f3-033c006b9ba9",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 16,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Lee Kelly N /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "d9667c5c-833b-44a4-bbc6-a9bf1cd6c189",
        "fields": {
            "phone": "8642502367",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "277863972",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Lee Kelly N /Atty",
            "mqap_id": "d9667c5c-833b-44a4-bbc6-a9bf1cd6c189",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 17,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Bateman Eva R /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "c16a9b45-9b13-454b-b6a0-0a77309f58e6",
        "fields": {
            "phone": "8642502311",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "264828885",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Bateman Eva R /Atty",
            "mqap_id": "c16a9b45-9b13-454b-b6a0-0a77309f58e6",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 18,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Elite Fitness",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "9dc0526f-b195-463c-880a-0e69ddd2fff7",
        "fields": {
            "phone": "8776299286",
            "side_of_street": "L",
            "group_sic_code": "799708",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "Baseball Clubs",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Baseball Clubs",
            "id": "273858823",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Elite Fitness",
            "mqap_id": "9dc0526f-b195-463c-880a-0e69ddd2fff7",
            "group_sic_code_ext": "799708",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 19,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Russell Hamilton E /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "e1a3e9ba-5aae-4a41-9d26-4913b3c495dc",
        "fields": {
            "phone": "8642502313",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "42536115",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Russell Hamilton E /Atty",
            "mqap_id": "e1a3e9ba-5aae-4a41-9d26-4913b3c495dc",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 20,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Gutierrez Katherine C /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "14fde11e-415c-46c6-a03c-998f82a19227",
        "fields": {
            "phone": "8642502210",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "291129987",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Gutierrez Katherine C /Atty",
            "mqap_id": "14fde11e-415c-46c6-a03c-998f82a19227",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 21,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Sherard Reid T /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "fff916f0-6953-4879-b105-102479e9977a",
        "fields": {
            "phone": "8642502219",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "21987095",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Sherard Reid T /Atty",
            "mqap_id": "fff916f0-6953-4879-b105-102479e9977a",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 22,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "U S Gov Congressman Trey Gowdy",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "b5308944-ff31-4449-852d-5f8d9d31121b",
        "fields": {
            "phone": "8642410175",
            "side_of_street": "L",
            "group_sic_code": "911101",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "Federal Government-Executive Offices",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Federal Government-Executive Offices",
            "id": "275981890",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "U S Gov Congressman Trey Gowdy",
            "mqap_id": "b5308944-ff31-4449-852d-5f8d9d31121b",
            "group_sic_code_ext": "911101",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 23,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Johnson Michael F /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "778467db-538e-418b-bc79-ef5662ac631a",
        "fields": {
            "phone": "8642502365",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "285998453",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Johnson Michael F /Atty",
            "mqap_id": "778467db-538e-418b-bc79-ef5662ac631a",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 24,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Mahnke Kymric Y /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "d6cfa418-3ace-4127-8ce1-59973594906e",
        "fields": {
            "phone": "8642502227",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "277666572",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Mahnke Kymric Y /Atty",
            "mqap_id": "d6cfa418-3ace-4127-8ce1-59973594906e",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 25,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Anderson Sarah R /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "5e5b634e-4faf-4ced-b095-41cd80d94cc6",
        "fields": {
            "phone": "8642502203",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "21987081",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Anderson Sarah R /Atty",
            "mqap_id": "5e5b634e-4faf-4ced-b095-41cd80d94cc6",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 26,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Easc Group",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "f1d53aac-ad6d-4420-9829-aaafc8a0e5fb",
        "fields": {
            "phone": "8642524502",
            "side_of_street": "L",
            "group_sic_code": "871111",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "Engineers-Consulting",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Engineers-Consulting::Business Management Consultants",
            "id": "278301836",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Easc Group",
            "mqap_id": "f1d53aac-ad6d-4420-9829-aaafc8a0e5fb",
            "group_sic_code_ext": "871111::874201",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 27,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Jones Neil C /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "18a71d76-9dfe-4913-8f7a-fbaf22ac7418",
        "fields": {
            "phone": "8642502260",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "274916650",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Jones Neil C /Atty",
            "mqap_id": "18a71d76-9dfe-4913-8f7a-fbaf22ac7418",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 28,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Burns Michael W Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "ed21cfe9-5f4d-4902-b368-0ca764ae2756",
        "fields": {
            "phone": "8642714940",
            "side_of_street": "L",
            "group_sic_code": "801104",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Clinics",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Clinics::(all) Lawyers",
            "id": "276025148",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Burns Michael W Atty",
            "mqap_id": "ed21cfe9-5f4d-4902-b368-0ca764ae2756",
            "group_sic_code_ext": "801104::811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 29,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Verdin Charles S /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "54c0c8d8-4b79-4205-85c8-ebaf0ab25fcd",
        "fields": {
            "phone": "8642502230",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "277670019",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Verdin Charles S /Atty",
            "mqap_id": "54c0c8d8-4b79-4205-85c8-ebaf0ab25fcd",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 30,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Stilwell Rivers S /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "a3b4a98c-dd76-44c3-b54b-bf628cdfa8a4",
        "fields": {
            "phone": "8642502217",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "277663675",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Stilwell Rivers S /Atty",
            "mqap_id": "a3b4a98c-dd76-44c3-b54b-bf628cdfa8a4",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 31,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Lott Harold R /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "766fb4b0-d3bf-4034-b6c0-9c5207274ddf",
        "fields": {
            "phone": "8642502323",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "43841112",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Lott Harold R /Atty",
            "mqap_id": "766fb4b0-d3bf-4034-b6c0-9c5207274ddf",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 32,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Mcalhaney Brian D /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "04315736-a8f4-4dfc-9fd9-c7bfb293571a",
        "fields": {
            "phone": "8642502248",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "275431599",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Mcalhaney Brian D /Atty",
            "mqap_id": "04315736-a8f4-4dfc-9fd9-c7bfb293571a",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 33,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Geosyntec Consultant",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "440761e6-d416-477c-8c7c-10f21504344b",
        "fields": {
            "phone": "8644384920",
            "side_of_street": "L",
            "group_sic_code": "871111",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "Engineers-Consulting",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Engineers-Consulting::Business Management Consultants",
            "id": "284388276",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Geosyntec Consultant",
            "mqap_id": "440761e6-d416-477c-8c7c-10f21504344b",
            "group_sic_code_ext": "871111::874201",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 34,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Barnhill Benjamin A /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "a28ba006-724e-4347-ab94-69cbf0aae261",
        "fields": {
            "phone": "8642502246",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "274440853",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Barnhill Benjamin A /Atty",
            "mqap_id": "a28ba006-724e-4347-ab94-69cbf0aae261",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 35,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Rustin Dowse B /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "5133a595-0fd8-46ef-b634-99afbd61d712",
        "fields": {
            "phone": "8642502320",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "27055601",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Rustin Dowse B /Atty",
            "mqap_id": "5133a595-0fd8-46ef-b634-99afbd61d712",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 36,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Campell John M /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "8de57cf3-8d72-413a-8efd-1f8b2baf4bff",
        "fields": {
            "phone": "8642502234",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "276065190",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Campell John M /Atty",
            "mqap_id": "8de57cf3-8d72-413a-8efd-1f8b2baf4bff",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 37,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Burwell Henry M /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "7a4262d1-50e2-4752-8fb3-a06fcf3db8bf",
        "fields": {
            "phone": "8642502212",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "288760115",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Burwell Henry M /Atty",
            "mqap_id": "7a4262d1-50e2-4752-8fb3-a06fcf3db8bf",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 38,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "William H Foster Attorney",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "5f3ae561-0168-48af-b364-581fbd449dc7",
        "fields": {
            "phone": "8642502222",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "276378478",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "William H Foster Attorney",
            "mqap_id": "5f3ae561-0168-48af-b364-581fbd449dc7",
            "group_sic_code_ext": "",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 39,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Two Chefs",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "9283c92f-52e7-499b-a934-297897c6fee0",
        "fields": {
            "phone": "8643709336",
            "side_of_street": "L",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "288878704",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Two Chefs",
            "mqap_id": "9283c92f-52e7-499b-a934-297897c6fee0",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 40,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Carolina First Bank",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "a6765bb1-6120-47e7-a552-d896c60c3226",
        "fields": {
            "phone": "8642396431",
            "side_of_street": "L",
            "group_sic_code": "602101",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "Banks",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Banks::Carolina First Bank",
            "id": "3580157",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Carolina First Bank",
            "mqap_id": "a6765bb1-6120-47e7-a552-d896c60c3226",
            "group_sic_code_ext": "602101::602101F41",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 41,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "John M Jennings Attorney",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "267c025b-207e-4615-a5b1-012de30dac51",
        "fields": {
            "phone": "8642502207",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "276241984",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "John M Jennings Attorney",
            "mqap_id": "267c025b-207e-4615-a5b1-012de30dac51",
            "group_sic_code_ext": "",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 42,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Sean Faulkner Attorney",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "fe3cc583-a58f-4761-a967-c6e5ef311efa",
        "fields": {
            "phone": "8642502346",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "286060129",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Sean Faulkner Attorney",
            "mqap_id": "fe3cc583-a58f-4761-a967-c6e5ef311efa",
            "group_sic_code_ext": "",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 43,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Gravessieffert",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "d1d0a994-1f40-4394-81b5-79fb8a60f5e5",
        "fields": {
            "phone": "8645272720",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "3582777",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Gravessieffert",
            "mqap_id": "d1d0a994-1f40-4394-81b5-79fb8a60f5e5",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 44,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Jennings L Graves Attorney",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "88712649-197a-4d73-bd28-994d5f8fc8c7",
        "fields": {
            "phone": "8642502220",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "275267469",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Jennings L Graves Attorney",
            "mqap_id": "88712649-197a-4d73-bd28-994d5f8fc8c7",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 45,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Hamilton Anna E /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "34035208-404c-4b75-8fe6-ccbff334ca9d",
        "fields": {
            "phone": "8642502364",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "264828886",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Hamilton Anna E /Atty",
            "mqap_id": "34035208-404c-4b75-8fe6-ccbff334ca9d",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 46,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Hughes Agency LLC",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "dc18607d-337e-48b3-acce-e46ba539ba0f",
        "fields": {
            "phone": "8642710718",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "277901739",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Hughes Agency LLC",
            "mqap_id": "dc18607d-337e-48b3-acce-e46ba539ba0f",
            "group_sic_code_ext": "",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 47,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Schanen Giles M /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "8bc02081-ecf7-434b-aa71-06b47e350df1",
        "fields": {
            "phone": "8642502296",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "276058865",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Schanen Giles M /Atty",
            "mqap_id": "8bc02081-ecf7-434b-aa71-06b47e350df1",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 48,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Winston I Marosek Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "4e680415-d8b8-4f13-8088-a87e3d66b78c",
        "fields": {
            "phone": "8642502295",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "286176018",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Winston I Marosek Atty",
            "mqap_id": "4e680415-d8b8-4f13-8088-a87e3d66b78c",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 49,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Summer Ashley B /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "b1d7f899-4c3a-4f9b-bb43-219c2b20633e",
        "fields": {
            "phone": "8642502214",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "275435698",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Summer Ashley B /Atty",
            "mqap_id": "b1d7f899-4c3a-4f9b-bb43-219c2b20633e",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 50,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Marion P Sieffert",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "8327cb75-c92b-4470-b215-128687732e3a",
        "fields": {
            "phone": "8645272720",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "289100812",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Marion P Sieffert",
            "mqap_id": "8327cb75-c92b-4470-b215-128687732e3a",
            "group_sic_code_ext": "",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 51,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Lane W Davis Attorney",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "b5cd69f4-f1fc-4f40-a7cf-4ea5be3a7065",
        "fields": {
            "phone": "8642502245",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "25914460",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Lane W Davis Attorney",
            "mqap_id": "b5cd69f4-f1fc-4f40-a7cf-4ea5be3a7065",
            "group_sic_code_ext": "",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 52,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Wilkins David H /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "e8726903-d253-474a-aca8-4f149b920096",
        "fields": {
            "phone": "8642502231",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "276270586",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Wilkins David H /Atty",
            "mqap_id": "e8726903-d253-474a-aca8-4f149b920096",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 53,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "McCall Crystal C /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "3da78a7b-64e7-4ad8-a966-0407ccade006",
        "fields": {
            "phone": "8642502343",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "21987080",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "McCall Crystal C /Atty",
            "mqap_id": "3da78a7b-64e7-4ad8-a966-0407ccade006",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 54,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Seann P Lahey Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "72bfec8b-06d5-447b-a67d-7c556b8ef58d",
        "fields": {
            "phone": "8642714940",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "288669663",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Seann P Lahey Atty",
            "mqap_id": "72bfec8b-06d5-447b-a67d-7c556b8ef58d",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 55,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "McNair Law Firm PA",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "0adc7f41-d3ff-444d-b97c-7e245aa468e1",
        "fields": {
            "phone": "8642714940",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers::(all) Clinics",
            "id": "288233779",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "McNair Law Firm PA",
            "mqap_id": "0adc7f41-d3ff-444d-b97c-7e245aa468e1",
            "group_sic_code_ext": "811103::801104",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 56,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Brown Wiliam S /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "7b768b2f-eada-43fa-83f5-0e6dfe218424",
        "fields": {
            "phone": "8642502297",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "25914455",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Brown Wiliam S /Atty",
            "mqap_id": "7b768b2f-eada-43fa-83f5-0e6dfe218424",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 57,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Neil E Grayson Attorney",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "decd474e-7eb3-4988-b620-196658f74aa9",
        "fields": {
            "phone": "8642502235",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "286185344",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Neil E Grayson Attorney",
            "mqap_id": "decd474e-7eb3-4988-b620-196658f74aa9",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 58,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Dunlap Charles E /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "29a620db-42d7-4dd6-8101-2bbf25798012",
        "fields": {
            "phone": "8642502238",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "3578717",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Dunlap Charles E /Atty",
            "mqap_id": "29a620db-42d7-4dd6-8101-2bbf25798012",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 59,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Two Chefs Deli & Market",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "ccca196d-e907-4122-9230-a561034be797",
        "fields": {
            "phone": "8643709336",
            "side_of_street": "L",
            "group_sic_code": "581208::58120868",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Restaurants::Deli",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants::Deli",
            "id": "278775802",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Two Chefs Deli & Market",
            "mqap_id": "ccca196d-e907-4122-9230-a561034be797",
            "group_sic_code_ext": "581208::58120868",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 60,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "South Financial Asset Management Inc",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "456d5e6f-7f25-415f-8342-b6872de67107",
        "fields": {
            "phone": "8642392140",
            "side_of_street": "L",
            "group_sic_code": "628205",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "Financial Planners",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Financial Planners",
            "id": "278050633",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "South Financial Asset Management Inc",
            "mqap_id": "456d5e6f-7f25-415f-8342-b6872de67107",
            "group_sic_code_ext": "628205",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 61,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Hunter S Freeman Attorney",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "9fff12ae-ce3e-4bca-af57-45817b78570b",
        "fields": {
            "phone": "8642714940",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "288620451",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Hunter S Freeman Attorney",
            "mqap_id": "9fff12ae-ce3e-4bca-af57-45817b78570b",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 62,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Nelson Elizabeth M /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "e4814741-3bba-4b7e-8a8b-540548f228da",
        "fields": {
            "phone": "8642502257",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "286131273",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Nelson Elizabeth M /Atty",
            "mqap_id": "e4814741-3bba-4b7e-8a8b-540548f228da",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 63,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Quattlebaum A Marvin /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "53356878-be79-4759-9824-139bade555bb",
        "fields": {
            "phone": "8642502209",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "275195659",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Quattlebaum A Marvin /Atty",
            "mqap_id": "53356878-be79-4759-9824-139bade555bb",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 64,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Madden Timothy E /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "c6c0cc79-a4c3-4487-a586-722f04a394b0",
        "fields": {
            "phone": "8642502300",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "42536118",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Madden Timothy E /Atty",
            "mqap_id": "c6c0cc79-a4c3-4487-a586-722f04a394b0",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 65,
        "distance": 0.0394,
        "sourceName": "mqap.ntpois",
        "name": "Ubs",
        "shapePoints": [34.84987, -82.400675],
        "distanceUnit": "m",
        "key": "9ec5fc87-cccf-4818-b982-c85f00dd7b43",
        "fields": {
            "phone": "8642328499",
            "side_of_street": "L",
            "group_sic_code": "621105",
            "state": "SC",
            "lng": -82.400675,
            "group_sic_code_name": "Investment Securities",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Investment Securities::Financial Planners::Financial Advisory Services::Ubs Financial Svc",
            "id": "3580098",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.400675,
                    "lat": 34.84987
                }
            },
            "address": "17 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Ubs",
            "mqap_id": "9ec5fc87-cccf-4818-b982-c85f00dd7b43",
            "group_sic_code_ext": "621105::628205::628203::628203F85",
            "disp_lat": 34.84987,
            "lat": 34.84987,
            "disp_lng": -82.400675
        }
    },
    {
        "resultNumber": 66,
        "distance": 0.0412,
        "sourceName": "mqap.ntpois",
        "name": "Gibbons-Peck",
        "shapePoints": [34.850597, -82.399979],
        "distanceUnit": "m",
        "key": "65cffd05-d1b1-4aba-8a78-5a8c0aa44b1e",
        "fields": {
            "phone": "8642320927",
            "side_of_street": "R",
            "group_sic_code": "731101",
            "state": "SC",
            "lng": -82.399979,
            "group_sic_code_name": "Advertising Agencies",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Advertising Agencies",
            "id": "279283150",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399979,
                    "lat": 34.850597
                }
            },
            "address": "7 S Laurens St",
            "postal_code": "29601",
            "name": "Gibbons-Peck",
            "mqap_id": "65cffd05-d1b1-4aba-8a78-5a8c0aa44b1e",
            "group_sic_code_ext": "731101",
            "disp_lat": 34.850597,
            "lat": 34.850597,
            "disp_lng": -82.399979
        }
    },
    {
        "resultNumber": 67,
        "distance": 0.0439,
        "sourceName": "mqap.ntpois",
        "name": "Pink Azalea",
        "shapePoints": [34.850422, -82.399422],
        "distanceUnit": "m",
        "key": "f7220127-972d-4f1f-bd2d-712d3eab27a3",
        "fields": {
            "phone": "8642334554",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399422,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "286157002",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399422,
                    "lat": 34.850422
                }
            },
            "address": "14 S Main St",
            "postal_code": "29601",
            "name": "Pink Azalea",
            "mqap_id": "f7220127-972d-4f1f-bd2d-712d3eab27a3",
            "group_sic_code_ext": "",
            "disp_lat": 34.850422,
            "lat": 34.850422,
            "disp_lng": -82.399422
        }
    },
    {
        "resultNumber": 68,
        "distance": 0.0439,
        "sourceName": "mqap.ntpois",
        "name": "Creative Health & Herbal Nutrition",
        "shapePoints": [34.850422, -82.399422],
        "distanceUnit": "m",
        "key": "26f4c886-cd0a-4302-8d58-29a2d7abd821",
        "fields": {
            "phone": "8642334811",
            "side_of_street": "L",
            "group_sic_code": "804917",
            "state": "SC",
            "lng": -82.399422,
            "group_sic_code_name": "Dietitians",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Dietitians::Health Food",
            "id": "278136474",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399422,
                    "lat": 34.850422
                }
            },
            "address": "14 S Main St",
            "postal_code": "29601",
            "name": "Creative Health & Herbal Nutrition",
            "mqap_id": "26f4c886-cd0a-4302-8d58-29a2d7abd821",
            "group_sic_code_ext": "804917::549901",
            "disp_lat": 34.850422,
            "lat": 34.850422,
            "disp_lng": -82.399422
        }
    },
    {
        "resultNumber": 69,
        "distance": 0.0439,
        "sourceName": "mqap.ntpois",
        "name": "Reform Bode",
        "shapePoints": [34.850422, -82.399422],
        "distanceUnit": "m",
        "key": "00057891-c5c5-4a53-b556-c458c1e50557",
        "fields": {
            "phone": "8642364468",
            "side_of_street": "L",
            "group_sic_code": "799106",
            "state": "SC",
            "lng": -82.399422,
            "group_sic_code_name": "Personal Trainers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Personal Trainers::Health Clubs & Gyms",
            "id": "277699883",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399422,
                    "lat": 34.850422
                }
            },
            "address": "14 S Main St",
            "postal_code": "29601",
            "name": "Reform Bode",
            "mqap_id": "00057891-c5c5-4a53-b556-c458c1e50557",
            "group_sic_code_ext": "799106::799101",
            "disp_lat": 34.850422,
            "lat": 34.850422,
            "disp_lng": -82.399422
        }
    },
    {
        "resultNumber": 70,
        "distance": 0.0439,
        "sourceName": "mqap.ntpois",
        "name": "14 South Main St",
        "shapePoints": [34.850422, -82.399422],
        "distanceUnit": "m",
        "key": "3244b972-0449-42ab-a7d1-41945bcd37bc",
        "fields": {
            "phone": "8642417807",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399422,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "274319444",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399422,
                    "lat": 34.850422
                }
            },
            "address": "14 S Main St",
            "postal_code": "29601",
            "name": "14 South Main St",
            "mqap_id": "3244b972-0449-42ab-a7d1-41945bcd37bc",
            "group_sic_code_ext": "",
            "disp_lat": 34.850422,
            "lat": 34.850422,
            "disp_lng": -82.399422
        }
    },
    {
        "resultNumber": 71,
        "distance": 0.0452,
        "sourceName": "mqap.ntpois",
        "name": "K V L Audio Visual Services",
        "shapePoints": [34.849372, -82.399771],
        "distanceUnit": "m",
        "key": "c9a2b37e-cf78-4dc9-bfe5-0f0347312632",
        "fields": {
            "phone": "8642507908",
            "side_of_street": "R",
            "group_sic_code": "504301",
            "state": "SC",
            "lng": -82.399771,
            "group_sic_code_name": "Audio-Visual Equipment & Supls (whol)",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Audio-Visual Equipment & Supls (whol)::Audio-Visual Equipment-Repairing",
            "id": "21987248",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399771,
                    "lat": 34.849372
                }
            },
            "address": "120 S Main St",
            "postal_code": "29601",
            "name": "K V L Audio Visual Services",
            "mqap_id": "c9a2b37e-cf78-4dc9-bfe5-0f0347312632",
            "group_sic_code_ext": "504301::762204",
            "disp_lat": 34.849372,
            "lat": 34.849372,
            "disp_lng": -82.399771
        }
    },
    {
        "resultNumber": 72,
        "distance": 0.0452,
        "sourceName": "mqap.ntpois",
        "name": "The Westin Poinsett, Greenville",
        "shapePoints": [34.849372, -82.399771],
        "distanceUnit": "m",
        "key": "973fee42-c1a0-4748-b97d-e14ba9b11b1b",
        "fields": {
            "phone": "8644219719",
            "side_of_street": "R",
            "group_sic_code": "701101",
            "state": "SC",
            "lng": -82.399771,
            "group_sic_code_name": "Hotels & Motels",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Hotels & Motels",
            "id": "282779844",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399771,
                    "lat": 34.849372
                }
            },
            "address": "120 S Main St",
            "postal_code": "29601",
            "name": "The Westin Poinsett, Greenville",
            "mqap_id": "973fee42-c1a0-4748-b97d-e14ba9b11b1b",
            "group_sic_code_ext": "701101",
            "disp_lat": 34.849372,
            "lat": 34.849372,
            "disp_lng": -82.399771
        }
    },
    {
        "resultNumber": 73,
        "distance": 0.0458,
        "sourceName": "mqap.ntpois",
        "name": "Outmans On Main Cigar Lounge",
        "shapePoints": [34.850355, -82.399319],
        "distanceUnit": "m",
        "key": "0d94986a-372f-4a5c-a650-1abf14f0b90f",
        "fields": {
            "phone": "8642329430",
            "side_of_street": "L",
            "group_sic_code": "599302",
            "state": "SC",
            "lng": -82.399319,
            "group_sic_code_name": "Smoke Shops & Supplies",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Smoke Shops & Supplies::Cigars & Tobacco",
            "id": "274863075",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399319,
                    "lat": 34.850355
                }
            },
            "address": "36 S Main St",
            "postal_code": "29601",
            "name": "Outmans On Main Cigar Lounge",
            "mqap_id": "0d94986a-372f-4a5c-a650-1abf14f0b90f",
            "group_sic_code_ext": "599302::599301",
            "disp_lat": 34.850355,
            "lat": 34.850355,
            "disp_lng": -82.399319
        }
    },
    {
        "resultNumber": 74,
        "distance": 0.0458,
        "sourceName": "mqap.ntpois",
        "name": "Sunbelt",
        "shapePoints": [34.850355, -82.399319],
        "distanceUnit": "m",
        "key": "f156522f-1533-409d-8037-f73427da039e",
        "fields": {
            "phone": "8644788252",
            "side_of_street": "L",
            "group_sic_code": "679401",
            "state": "SC",
            "lng": -82.399319,
            "group_sic_code_name": "Franchising",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Franchising::Notes & Contracts Buyers",
            "id": "284226234",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399319,
                    "lat": 34.850355
                }
            },
            "address": "36 S Main St",
            "postal_code": "29601",
            "name": "Sunbelt",
            "mqap_id": "f156522f-1533-409d-8037-f73427da039e",
            "group_sic_code_ext": "679401::616206",
            "disp_lat": 34.850355,
            "lat": 34.850355,
            "disp_lng": -82.399319
        }
    },
    {
        "resultNumber": 75,
        "distance": 0.0458,
        "sourceName": "mqap.ntpois",
        "name": "12 Gates Holdings Company LLC",
        "shapePoints": [34.850355, -82.399319],
        "distanceUnit": "m",
        "key": "f887189d-dbc0-446e-8666-03da381c78e2",
        "fields": {
            "phone": "8642320607",
            "side_of_street": "L",
            "group_sic_code": "679401",
            "state": "SC",
            "lng": -82.399319,
            "group_sic_code_name": "Franchising",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Franchising::Notes & Contracts Buyers",
            "id": "284907910",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399319,
                    "lat": 34.850355
                }
            },
            "address": "36 S Main St",
            "postal_code": "29601",
            "name": "12 Gates Holdings Company LLC",
            "mqap_id": "f887189d-dbc0-446e-8666-03da381c78e2",
            "group_sic_code_ext": "679401::616206",
            "disp_lat": 34.850355,
            "lat": 34.850355,
            "disp_lng": -82.399319
        }
    },
    {
        "resultNumber": 76,
        "distance": 0.0468,
        "sourceName": "mqap.ntpois",
        "name": "Takosushi III Inc",
        "shapePoints": [34.850372, -82.399311],
        "distanceUnit": "m",
        "key": "8f2c10b2-6307-4b08-a896-8ad14e75cb5c",
        "fields": {
            "phone": "8642715055",
            "side_of_street": "L",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.399311,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "261842375",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399311,
                    "lat": 34.850372
                }
            },
            "address": "34 S Main St",
            "postal_code": "29601",
            "name": "Takosushi III Inc",
            "mqap_id": "8f2c10b2-6307-4b08-a896-8ad14e75cb5c",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.850372,
            "lat": 34.850372,
            "disp_lng": -82.399311
        }
    },
    {
        "resultNumber": 77,
        "distance": 0.0479,
        "sourceName": "mqap.ntpois",
        "name": "Pohl PA",
        "shapePoints": [34.85039, -82.399303],
        "distanceUnit": "m",
        "key": "e9d896e6-bd16-4e7d-9482-2d0629a397bd",
        "fields": {
            "phone": "8642336294",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399303,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "284389776",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399303,
                    "lat": 34.85039
                }
            },
            "address": "32 S Main St",
            "postal_code": "29601",
            "name": "Pohl PA",
            "mqap_id": "e9d896e6-bd16-4e7d-9482-2d0629a397bd",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.85039,
            "lat": 34.85039,
            "disp_lng": -82.399303
        }
    },
    {
        "resultNumber": 78,
        "distance": 0.0479,
        "sourceName": "mqap.ntpois",
        "name": "Advancedprofessional Services Inc",
        "shapePoints": [34.85039, -82.399303],
        "distanceUnit": "m",
        "key": "788c0ede-fa91-478a-90a5-92765764619f",
        "fields": {
            "phone": "8642422321",
            "side_of_street": "L",
            "group_sic_code": "736103",
            "state": "SC",
            "lng": -82.399303,
            "group_sic_code_name": "Employment Agencies",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Employment Agencies",
            "id": "275268453",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399303,
                    "lat": 34.85039
                }
            },
            "address": "32 S Main St",
            "postal_code": "29601",
            "name": "Advancedprofessional Services Inc",
            "mqap_id": "788c0ede-fa91-478a-90a5-92765764619f",
            "group_sic_code_ext": "736103",
            "disp_lat": 34.85039,
            "lat": 34.85039,
            "disp_lng": -82.399303
        }
    },
    {
        "resultNumber": 79,
        "distance": 0.0479,
        "sourceName": "mqap.ntpois",
        "name": "Evolve Resources",
        "shapePoints": [34.85039, -82.399303],
        "distanceUnit": "m",
        "key": "835c1b51-022e-4325-8d43-400fa39dec3e",
        "fields": {
            "phone": "8645619447",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399303,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "288919936",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399303,
                    "lat": 34.85039
                }
            },
            "address": "32 S Main St",
            "postal_code": "29601",
            "name": "Evolve Resources",
            "mqap_id": "835c1b51-022e-4325-8d43-400fa39dec3e",
            "group_sic_code_ext": "",
            "disp_lat": 34.85039,
            "lat": 34.85039,
            "disp_lng": -82.399303
        }
    },
    {
        "resultNumber": 80,
        "distance": 0.0479,
        "sourceName": "mqap.ntpois",
        "name": "Firstplace Employer Services",
        "shapePoints": [34.85039, -82.399303],
        "distanceUnit": "m",
        "key": "8526fa0a-0245-49e7-9df4-7309ab0d7eec",
        "fields": {
            "phone": "8642335162",
            "side_of_street": "L",
            "group_sic_code": "736103",
            "state": "SC",
            "lng": -82.399303,
            "group_sic_code_name": "Employment Agencies",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Employment Agencies",
            "id": "277140800",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399303,
                    "lat": 34.85039
                }
            },
            "address": "32 S Main St",
            "postal_code": "29601",
            "name": "Firstplace Employer Services",
            "mqap_id": "8526fa0a-0245-49e7-9df4-7309ab0d7eec",
            "group_sic_code_ext": "736103",
            "disp_lat": 34.85039,
            "lat": 34.85039,
            "disp_lng": -82.399303
        }
    },
    {
        "resultNumber": 81,
        "distance": 0.0489,
        "sourceName": "mqap.ntpois",
        "name": "Poppington's Popcorn",
        "shapePoints": [34.850408, -82.399295],
        "distanceUnit": "m",
        "key": "e1e939ba-cca6-4660-ab2d-ab972642b083",
        "fields": {
            "phone": "8643491331",
            "side_of_street": "L",
            "group_sic_code": "514505",
            "state": "SC",
            "lng": -82.399295,
            "group_sic_code_name": "Popcorn & Popcorn Supplies-Wholesale",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Popcorn & Popcorn Supplies-Wholesale::Gourmet Shops",
            "id": "281905605",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399295,
                    "lat": 34.850408
                }
            },
            "address": "30 S Main St",
            "postal_code": "29601",
            "name": "Poppington's Popcorn",
            "mqap_id": "e1e939ba-cca6-4660-ab2d-ab972642b083",
            "group_sic_code_ext": "514505::549920",
            "disp_lat": 34.850408,
            "lat": 34.850408,
            "disp_lng": -82.399295
        }
    },
    {
        "resultNumber": 82,
        "distance": 0.05,
        "sourceName": "mqap.ntpois",
        "name": "Jamaica Mi Irie",
        "shapePoints": [34.850425, -82.399286],
        "distanceUnit": "m",
        "key": "a2e55843-5040-4ec9-9282-e5319d94cdf9",
        "fields": {
            "phone": "8642718384",
            "side_of_street": "L",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.399286,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "284095529",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399286,
                    "lat": 34.850425
                }
            },
            "address": "28 S Main St",
            "postal_code": "29601",
            "name": "Jamaica Mi Irie",
            "mqap_id": "a2e55843-5040-4ec9-9282-e5319d94cdf9",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.850425,
            "lat": 34.850425,
            "disp_lng": -82.399286
        }
    },
    {
        "resultNumber": 83,
        "distance": 0.05,
        "sourceName": "mqap.ntpois",
        "name": "Prime Dental PC",
        "shapePoints": [34.850425, -82.399286],
        "distanceUnit": "m",
        "key": "1e00a00f-80f6-4c88-a15e-4e11beefc81e",
        "fields": {
            "phone": "8648348001",
            "side_of_street": "L",
            "group_sic_code": "802101",
            "state": "SC",
            "lng": -82.399286,
            "group_sic_code_name": "(all) Dentists",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Dentists",
            "id": "277378873",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399286,
                    "lat": 34.850425
                }
            },
            "address": "28 S Main St",
            "postal_code": "29601",
            "name": "Prime Dental PC",
            "mqap_id": "1e00a00f-80f6-4c88-a15e-4e11beefc81e",
            "group_sic_code_ext": "802101",
            "disp_lat": 34.850425,
            "lat": 34.850425,
            "disp_lng": -82.399286
        }
    },
    {
        "resultNumber": 84,
        "distance": 0.05,
        "sourceName": "mqap.ntpois",
        "name": "Jamaica Twist Restaurant",
        "shapePoints": [34.850425, -82.399286],
        "distanceUnit": "m",
        "key": "b9655960-361c-4e76-894d-34dad56997c3",
        "fields": {
            "phone": "8642980013",
            "side_of_street": "L",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.399286,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "3578164",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399286,
                    "lat": 34.850425
                }
            },
            "address": "28 S Main St",
            "postal_code": "29601",
            "name": "Jamaica Twist Restaurant",
            "mqap_id": "b9655960-361c-4e76-894d-34dad56997c3",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.850425,
            "lat": 34.850425,
            "disp_lng": -82.399286
        }
    },
    {
        "resultNumber": 85,
        "distance": 0.0501,
        "sourceName": "mqap.ntpois",
        "name": "Senor Wraps",
        "shapePoints": [34.850559, -82.399437],
        "distanceUnit": "m",
        "key": "d8ef84b1-26e1-46e5-a031-664a54a7fc2c",
        "fields": {
            "phone": "8642393971",
            "side_of_street": "R",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.399437,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "3579312",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399437,
                    "lat": 34.850559
                }
            },
            "address": "10 S Main St",
            "postal_code": "29601",
            "name": "Senor Wraps",
            "mqap_id": "d8ef84b1-26e1-46e5-a031-664a54a7fc2c",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.850559,
            "lat": 34.850559,
            "disp_lng": -82.399437
        }
    },
    {
        "resultNumber": 86,
        "distance": 0.0501,
        "sourceName": "mqap.ntpois",
        "name": "U S Government U S Senate",
        "shapePoints": [34.84929, -82.399809],
        "distanceUnit": "m",
        "key": "50898074-fcb0-492e-9234-a7054be5def5",
        "fields": {
            "phone": "8642501417",
            "side_of_street": "L",
            "group_sic_code": "912101",
            "state": "SC",
            "lng": -82.399809,
            "group_sic_code_name": "Government Offices-Us",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Government Offices-Us",
            "id": "277972418",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399809,
                    "lat": 34.84929
                }
            },
            "address": "130 S Main St",
            "postal_code": "29601",
            "name": "U S Government U S Senate",
            "mqap_id": "50898074-fcb0-492e-9234-a7054be5def5",
            "group_sic_code_ext": "912101",
            "disp_lat": 34.84929,
            "lat": 34.84929,
            "disp_lng": -82.399809
        }
    },
    {
        "resultNumber": 87,
        "distance": 0.0501,
        "sourceName": "mqap.ntpois",
        "name": "River Falls Spa",
        "shapePoints": [34.84929, -82.399809],
        "distanceUnit": "m",
        "key": "7eef6420-2c3c-4e8d-9e8d-599c0f57acfa",
        "fields": {
            "phone": "8642402136",
            "side_of_street": "L",
            "group_sic_code": "509112",
            "state": "SC",
            "lng": -82.399809,
            "group_sic_code_name": "Swimming Pool-Distributors (whol)",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Swimming Pool-Distributors (whol)",
            "id": "21987304",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399809,
                    "lat": 34.84929
                }
            },
            "address": "130 S Main St",
            "postal_code": "29601",
            "name": "River Falls Spa",
            "mqap_id": "7eef6420-2c3c-4e8d-9e8d-599c0f57acfa",
            "group_sic_code_ext": "509112",
            "disp_lat": 34.84929,
            "lat": 34.84929,
            "disp_lng": -82.399809
        }
    },
    {
        "resultNumber": 88,
        "distance": 0.052,
        "sourceName": "mqap.ntpois",
        "name": "Greyhound Bus Lines",
        "shapePoints": [34.850229, -82.400872],
        "distanceUnit": "m",
        "key": "e7c0649b-2a05-40dc-a064-5747d2c9b0a4",
        "fields": {
            "phone": "8642350371",
            "side_of_street": "R",
            "group_sic_code": "413101",
            "state": "SC",
            "lng": -82.400872,
            "group_sic_code_name": "Bus Lines",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Bus Lines::Greyhound Bus Lines",
            "id": "265831538",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.400872,
                    "lat": 34.850229
                }
            },
            "address": "100 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Greyhound Bus Lines",
            "mqap_id": "e7c0649b-2a05-40dc-a064-5747d2c9b0a4",
            "group_sic_code_ext": "413101::413101F01",
            "disp_lat": 34.850229,
            "lat": 34.850229,
            "disp_lng": -82.400872
        }
    },
    {
        "resultNumber": 89,
        "distance": 0.0521,
        "sourceName": "mqap.ntpois",
        "name": "Greyhound Packagexpress",
        "shapePoints": [34.850609, -82.400543],
        "distanceUnit": "m",
        "key": "d37d5897-1eea-4199-b860-b630f8cd8c37",
        "fields": {
            "phone": "8642354741",
            "side_of_street": "R",
            "group_sic_code": "413101",
            "state": "SC",
            "lng": -82.400543,
            "group_sic_code_name": "Bus Lines",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Bus Lines::Delivery Service",
            "id": "289594148",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.400543,
                    "lat": 34.850609
                }
            },
            "address": "100 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Greyhound Packagexpress",
            "mqap_id": "d37d5897-1eea-4199-b860-b630f8cd8c37",
            "group_sic_code_ext": "413101::421205",
            "disp_lat": 34.850609,
            "lat": 34.850609,
            "disp_lng": -82.400543
        }
    },
    {
        "resultNumber": 90,
        "distance": 0.0547,
        "sourceName": "mqap.ntpois",
        "name": "Trappe Door The",
        "shapePoints": [34.850784, -82.399857],
        "distanceUnit": "m",
        "key": "c1926eaf-3ffc-4b80-8b5d-262409a8c8f4",
        "fields": {
            "phone": "8644517490",
            "side_of_street": "L",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.399857,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "276668335",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399857,
                    "lat": 34.850784
                }
            },
            "address": "25 W Washington St",
            "postal_code": "29601",
            "name": "Trappe Door The",
            "mqap_id": "c1926eaf-3ffc-4b80-8b5d-262409a8c8f4",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.850784,
            "lat": 34.850784,
            "disp_lng": -82.399857
        }
    },
    {
        "resultNumber": 91,
        "distance": 0.0547,
        "sourceName": "mqap.ntpois",
        "name": "Barleys Taproom",
        "shapePoints": [34.850784, -82.399857],
        "distanceUnit": "m",
        "key": "9c952531-fe12-41a2-9681-4d4fc03e8f5c",
        "fields": {
            "phone": "8642323706",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399857,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "3580142",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399857,
                    "lat": 34.850784
                }
            },
            "address": "25 W Washington St",
            "postal_code": "29601",
            "name": "Barleys Taproom",
            "mqap_id": "9c952531-fe12-41a2-9681-4d4fc03e8f5c",
            "group_sic_code_ext": "",
            "disp_lat": 34.850784,
            "lat": 34.850784,
            "disp_lng": -82.399857
        }
    },
    {
        "resultNumber": 92,
        "distance": 0.0556,
        "sourceName": "mqap.ntpois",
        "name": "Park Place On Main",
        "shapePoints": [34.850514, -82.399245],
        "distanceUnit": "m",
        "key": "1ea98f44-07cb-4b11-8055-1751238ad545",
        "fields": {
            "phone": "8643707085",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399245,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "277479127",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399245,
                    "lat": 34.850514
                }
            },
            "address": "18 S Main St",
            "postal_code": "29601",
            "name": "Park Place On Main",
            "mqap_id": "1ea98f44-07cb-4b11-8055-1751238ad545",
            "group_sic_code_ext": "",
            "disp_lat": 34.850514,
            "lat": 34.850514,
            "disp_lng": -82.399245
        }
    },
    {
        "resultNumber": 93,
        "distance": 0.0556,
        "sourceName": "mqap.ntpois",
        "name": "Red Fin",
        "shapePoints": [34.850514, -82.399245],
        "distanceUnit": "m",
        "key": "37cb9628-1d0b-47c5-afc5-205ba1ca1163",
        "fields": {
            "phone": "8642368408",
            "side_of_street": "L",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.399245,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "284796302",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399245,
                    "lat": 34.850514
                }
            },
            "address": "18 S Main St",
            "postal_code": "29601",
            "name": "Red Fin",
            "mqap_id": "37cb9628-1d0b-47c5-afc5-205ba1ca1163",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.850514,
            "lat": 34.850514,
            "disp_lng": -82.399245
        }
    },
    {
        "resultNumber": 94,
        "distance": 0.0585,
        "sourceName": "mqap.ntpois",
        "name": "Greenville Beer Exchange The",
        "shapePoints": [34.850841, -82.399861],
        "distanceUnit": "m",
        "key": "b99d6fa0-0fee-45dd-b564-5a9313a1fbf3",
        "fields": {
            "phone": "8642323533",
            "side_of_street": "R",
            "group_sic_code": "592102",
            "state": "SC",
            "lng": -82.399861,
            "group_sic_code_name": "Liquor Stores",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Liquor Stores::Beer & Ale-Retail",
            "id": "270135898",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399861,
                    "lat": 34.850841
                }
            },
            "address": "7 S Laurens St",
            "postal_code": "29601",
            "name": "Greenville Beer Exchange The",
            "mqap_id": "b99d6fa0-0fee-45dd-b564-5a9313a1fbf3",
            "group_sic_code_ext": "592102::592104",
            "disp_lat": 34.850841,
            "lat": 34.850841,
            "disp_lng": -82.399861
        }
    },
    {
        "resultNumber": 95,
        "distance": 0.0585,
        "sourceName": "mqap.ntpois",
        "name": "Zirkelbach Construction LLC",
        "shapePoints": [34.850841, -82.399861],
        "distanceUnit": "m",
        "key": "882af8df-ad83-4a69-862d-676ba3fde2d9",
        "fields": {
            "phone": "8645524004",
            "side_of_street": "R",
            "group_sic_code": "874114",
            "state": "SC",
            "lng": -82.399861,
            "group_sic_code_name": "Construction Consultants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Construction Consultants::Real Estate Developers",
            "id": "284495809",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399861,
                    "lat": 34.850841
                }
            },
            "address": "7 S Laurens St",
            "postal_code": "29601",
            "name": "Zirkelbach Construction LLC",
            "mqap_id": "882af8df-ad83-4a69-862d-676ba3fde2d9",
            "group_sic_code_ext": "874114::655202",
            "disp_lat": 34.850841,
            "lat": 34.850841,
            "disp_lng": -82.399861
        }
    },
    {
        "resultNumber": 96,
        "distance": 0.0591,
        "sourceName": "mqap.ntpois",
        "name": "Kozani Restaurant & Bar",
        "shapePoints": [34.850567, -82.39922],
        "distanceUnit": "m",
        "key": "310bdeec-6515-4f7b-8501-1f820b1f8786",
        "fields": {
            "phone": "8642633561",
            "side_of_street": "L",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.39922,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "264799055",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.39922,
                    "lat": 34.850567
                }
            },
            "address": "12 S Main St",
            "postal_code": "29601",
            "name": "Kozani Restaurant & Bar",
            "mqap_id": "310bdeec-6515-4f7b-8501-1f820b1f8786",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.850567,
            "lat": 34.850567,
            "disp_lng": -82.39922
        }
    },
    {
        "resultNumber": 97,
        "distance": 0.0595,
        "sourceName": "mqap.ntpois",
        "name": "CVS Pharmacy",
        "shapePoints": [34.850265, -82.399003],
        "distanceUnit": "m",
        "key": "0febd46c-fa1a-4a11-802c-28e35b486f36",
        "fields": {
            "phone": "8643704848",
            "side_of_street": "R",
            "group_sic_code": "591205",
            "state": "SC",
            "lng": -82.399003,
            "group_sic_code_name": "Pharmacies",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Pharmacies::Cvs Pharmacy",
            "id": "274293646",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399003,
                    "lat": 34.850265
                }
            },
            "address": "35 S Main St",
            "postal_code": "29601",
            "name": "CVS Pharmacy",
            "mqap_id": "0febd46c-fa1a-4a11-802c-28e35b486f36",
            "group_sic_code_ext": "591205::591205F75",
            "disp_lat": 34.850265,
            "lat": 34.850265,
            "disp_lng": -82.399003
        }
    },
    {
        "resultNumber": 98,
        "distance": 0.0595,
        "sourceName": "mqap.ntpois",
        "name": "ATM",
        "shapePoints": [34.850265, -82.399003],
        "distanceUnit": "m",
        "key": "2d9e18fd-b3a4-4d72-9461-a22a59cb34c1",
        "fields": {
            "phone": "",
            "side_of_street": "R",
            "group_sic_code": "602103",
            "state": "SC",
            "lng": -82.399003,
            "group_sic_code_name": "Automated Teller Machines",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Automated Teller Machines",
            "id": "288645207",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399003,
                    "lat": 34.850265
                }
            },
            "address": "35 S Main St",
            "postal_code": "29601",
            "name": "ATM",
            "mqap_id": "2d9e18fd-b3a4-4d72-9461-a22a59cb34c1",
            "group_sic_code_ext": "602103",
            "disp_lat": 34.850265,
            "lat": 34.850265,
            "disp_lng": -82.399003
        }
    },
    {
        "resultNumber": 99,
        "distance": 0.0595,
        "sourceName": "mqap.ntpois",
        "name": "Seven South Main Holdings LLC",
        "shapePoints": [34.850265, -82.399003],
        "distanceUnit": "m",
        "key": "05c2e0ed-2892-48df-ba21-ec257a3ea592",
        "fields": {
            "phone": "8642350650",
            "side_of_street": "R",
            "group_sic_code": "641133",
            "state": "SC",
            "lng": -82.399003,
            "group_sic_code_name": "Insurance-Holding Companies",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Insurance-Holding Companies::Holding Companies (bank)::Holding Companies (non-Bank)::Restaurant Holding Companies::Utilities-Holding Companies",
            "id": "273344863",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399003,
                    "lat": 34.850265
                }
            },
            "address": "35 S Main St",
            "postal_code": "29601",
            "name": "Seven South Main Holdings LLC",
            "mqap_id": "05c2e0ed-2892-48df-ba21-ec257a3ea592",
            "group_sic_code_ext": "641133::671201::671901::671902::671904",
            "disp_lat": 34.850265,
            "lat": 34.850265,
            "disp_lng": -82.399003
        }
    },
    {
        "resultNumber": 100,
        "distance": 0.0609,
        "sourceName": "mqap.ntpois",
        "name": "Nose Dive",
        "shapePoints": [34.849117, -82.400047],
        "distanceUnit": "m",
        "key": "e97b70b5-92e2-41a8-8ccd-eb49a24a0acc",
        "fields": {
            "phone": "8643737300",
            "side_of_street": "R",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.400047,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "273164218",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.400047,
                    "lat": 34.849117
                }
            },
            "address": "116 S Main St",
            "postal_code": "29601",
            "name": "Nose Dive",
            "mqap_id": "e97b70b5-92e2-41a8-8ccd-eb49a24a0acc",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.849117,
            "lat": 34.849117,
            "disp_lng": -82.400047
        }
    }],
    "origin": {
        "latLng": {
            "lng": -82.4,
            "lat": 34.85
        },
        "postalCode": "",
        "adminArea5Type": "City",
        "adminArea4": "",
        "adminArea5": "",
        "adminArea4Type": "County",
        "street": "",
        "adminArea1Type": "Country",
        "adminArea1": "",
        "adminArea3": "",
        "adminArea3Type": "State"
    },
    "resultsCount": 100,
    "hostedData": [{
        "tableName": "mqap.ntpois",
        "extraCriteria": "",
        "columnNames": []
    }],
    "totalPages": 1,
    "info": {
        "statusCode": 0,
        "copyright": {
            "text": "© 2015 MapQuest, Inc.",
            "imageUrl": "http://api.mqcdn.com/res/mqlogo.gif",
            "imageAltText": "© 2015 MapQuest, Inc."
        },
        "messages": []
    },
    "options": {
        "kmlStyleUrl": "http://www.search.mapquestapi.com/kml-default.kml",
        "shapeFormat": "raw",
        "ambiguities": true,
        "pageSize": 100,
        "radius": 20,
        "currentPage": 1,
        "units": "m",
        "maxMatches": 100
    }
 */ 
/**
 * http://router.project-osrm.org/nearest?loc=52.4224,13.333086
 * http://{server}/trip?loc={lat,lon}&loc={lat,lon}<&loc={lat,lon} ...>
 * http://router.project-osrm.org/trip?loc=52.52,13.44&loc=52.5,13.45&jsonp=callback
 */
define("osrm-proxy", ["require", "exports", "ajax", "jquery", "google-polyline"], function (require, exports, ajax, $, Encoder) {
    "use strict";
    var Osrm = (function () {
        function Osrm(url) {
            if (url === void 0) { url = "http://router.project-osrm.org"; }
            this.url = url;
        }
        Osrm.prototype.viaroute = function (data) {
            var req = $.extend({}, data);
            req.loc = data.loc.map(function (l) { return (l[0] + "," + l[1]); }).join("&loc=");
            return ajax.jsonp(this.url + "/viaroute", req, "jsonp");
        };
        Osrm.prototype.nearest = function (loc) {
            return ajax.jsonp(this.url + "/nearest", {
                loc: loc
            }, "jsonp");
        };
        Osrm.prototype.table = function () {
        };
        Osrm.prototype.match = function () {
        };
        Osrm.prototype.trip = function (loc) {
            var url = this.url + "/trip";
            return ajax.jsonp(url, {
                loc: loc.map(function (l) { return (l[0] + "," + l[1]); }).join("&loc="),
            }, "jsonp");
        };
        Osrm.test = function () {
            var service = new Osrm();
            false && service.trip([[34.8, -82.85], [34.8, -82.80]]).then(function (result) {
                console.log("trip", result);
                var decoder = new Encoder();
                result.trips.map(function (trip) {
                    console.log("trip", trip.route_name, "route_geometry", decoder.decode(trip.route_geometry, 6).map(function (v) { return [v[1], v[0]]; }));
                });
            });
            service.viaroute({
                loc: [[34.85, -82.4], [34.85, -82.4]]
            }).then(function (result) {
                console.log("viaroute", result);
                var decoder = new Encoder();
                console.log("route_geometry", decoder.decode(result.route_geometry, 6).map(function (v) { return [v[1], v[0]]; }));
            });
            // "West McBee Avenue"
            false && service.nearest([34.85, -82.4]).then(function (result) { return console.log("nearest", result); });
        };
        return Osrm;
    }());
    return Osrm;
});
/**
 * Response to http://router.project-osrm.org/trip?loc=34.8,-82.85&loc=34.8,-82.8&jsonp=define:
define({
    "status": 200,
    "status_message": "Found trips",
    "trips": [{
        "hint_data": {
            "locations": ["CZZiAWbmYgFaDBMAFgAAAEgAAAD_AQAAdgMAACjaHQHH6AAACgETAr-WEPsQAAEB", "PwBiAa09YgFUOgYAGAAAAAUAAACoAwAAAgEAACL3HAHH6AAAwgcTAsrID_shAAEB", "CZZiAWbmYgFaDBMAFgAAAEgAAAD_AQAAdgMAACjaHQHH6AAACgETAr-WEPsQAAEB"],
            "checksum": 2261320460
        },
        "route_name": ["Old Seneca Road", "Mt Olivet Road (SC 133)"],
        "route_geometry": "so_kaA`ss||C~KdAxJH~Gw@fPoCvNwElG_BrEaB~T_K~LwGdH_GjHeH`FuGpG{L`U{i@pHmNhVmTvDiD|Y{QjTeQdMwIfFoEtGuBhGoAhIRfFtAhFdDdDtExOtd@~AnEzDfJfC~E`DnB_IfYwTl{@_Knc@qGtUuC~PaDbV}AxWaBlVyAld@kD`fA{A`x@oBfm@uBhb@sBz[}LrdAyThqAiDnSmJfk@}Lto@eKhf@kIzWmGnRkYpo@u\\xl@s]hn@uIpOqOnZse@d_AmA`Cgv@`wAwRnZuN`QqKhLeb@dSaTjJo`@bQ{ShJa`@`QkmA|i@weBnw@gz@r^sQlMeMdLcDvGuJ|VeEbNoBnE\\jOpDxc@jCnV|Ej\\xPt_AtTlbBr^~}BxKnr@zMhv@~Lbn@rLne@dFhTnAjFpClLxIra@bJj_@dEjRhFtUvFx]pCvOhBlVX|]Gvl@_Adm@Rdg@tB~VpE`T|BjMfD~MhGtNvQrW|BbD`Zbm@vWbb@hDnFlNfVnGzKjBrDdIdPxHlOvGtMfPf^tBtEbd@foAtA|DbC`HjAbDva@fkArLxXnP~UvC~CfHvHtO|Kn[rKnDZsCdI}BtF}DfFuKjEkJbAoSpA_Jj@yPvAoJvCst@jg@eJzGyCnFeOtq@oBpMUtOqBxZKnMVvLpAjLhH|NpH|LzPhUtFdJhIjTb@lH@dIcBjR{CnWuDd`@yBdQc@rJVfKnAxL|@xK|ExR`FpOnEnPjBlL~BrP~@rQtBdThChKhC~F~@rBzC~FhInIhShObInFtElIdBvHp@jQcAd^}@`VcChTyB`HmBbGoEvKsEpR{@`Np@xSjAfSK~Le@tQmApXC`R`BdI~HfV~D`GrHbG~HvEjPhEvRbDhIrClDxDdCxInCvLdDjHfFpIzDlFoMhDui@tKuT|C{If@wMV_M}A}L_HiOeHsEwB_M{Go[wNqH_B}Be@sVsCmR}CuNqE{LqFkJwKiSoZeLsT_LkY{Pm\\iMaX}EmQuIkX}H{b@uOiuAgAoVd@yXfDeY~A}Om@mH{BgD_ICoP}@uGiBkGuEoJmKiKeQmKeVqLc_@sCw[iAqMm@sV}CqOkFqSiGiNip@a`AsMuQaGcMsHqZmBoEcFrC{Hd@oNKuYgBcWo@eScDeGmC_A{A_C{DqF_PkKeYoKw]uHiZmD{Qu`@m^a_@mZkI{GwS}NoE_DwJqFeNwH{g@iYmEcCwj@c]_q@gk@yCwDeT_Q}_@g\\wa@o[gLqIyKeIaD_CuDoD}EiFyFsJid@unAgEiPkSgbAi@mCeRsv@kLqq@uHsVmJeMoHmDgMgEeYcPwMmKyNyKgRuRb\\_UhDaDjE_ExIqKhWsa@|QcVxMeVfPeT~LiRpNuOlOqO`MeMtEkF~c@w^jD}CzT}R|BsBp^}ZnLuLnEiFdKaNtCqDfBuDfMia@dWst@|K{[nHwS~`@ciAhEqL|HwNrQ_UdBwB~@kA|WuXrZy]`Z_Y`GwFzBcCzo@ys@fJuHtD}CpQqQjWqYxc@ue@tLqL`GqIhOcRdVu\\~Xya@`KeRrGiPnBoEdEcNtJ}VbDwGdMeLrQmMfz@s^veBow@jmA}i@``@aQzSiJn`@cQ`TkJdb@eSpKiLtNaQvRoZfv@awAlAaCre@e_ApOoZtIqOr]in@t\\yl@jYqo@lGoRjI{WdKif@|Luo@lJgk@hDoSxTiqA|LsdArB{[tBib@nBgm@zAax@jDafAxAmd@`BmV|AyW`DcVtC_QpGuU~Joc@vTm{@~HgYaDoBgC_F{DgJ_BoEyOud@eDuEiFeDgFuAiISiGnAuGtBgFnEeMvIkTdQ}YzQwDhDiVlTqHlNaUzi@qGzLaFtGkHdHeH~F_MvG_U~JsE`BmG~AwNvEgPnC_Hv@yJI_LeA",
        "via_indices": [0, 156, 444],
        "via_points": [
            [34.799882, -82.798913],
            [34.801602, -82.851638],
            [34.799882, -82.798913]
        ],
        "permutation": [1, 0],
        "found_alternative": false,
        "route_summary": {
            "total_distance": 18280,
            "total_time": 1723,
            "end_point": "John Holiday Road",
            "start_point": "John Holiday Road"
        }
    }]
})

And when the geometry is decoded:
[
    [
        [34.799882, -82.798913],
        [34.799674, -82.798948],
        [34.799485, -82.798953],
        [34.799341, -82.798925],
        [34.799065, -82.798853],
        [34.798813, -82.798745],
        [34.798678, -82.798697],
        [34.798572, -82.798648],
        [34.79822, -82.798456],
        [34.797996, -82.798316],
        [34.797849, -82.798188],
        [34.797699, -82.798041],
        [34.797586, -82.797902],
        [34.797449, -82.79768],
        [34.797096, -82.796994],
        [34.796943, -82.796747],
        [34.79657, -82.796404],
        [34.796478, -82.796319],
        [34.796047, -82.796017],
        [34.795705, -82.795726],
        [34.795478, -82.795554],
        [34.795362, -82.79545],
        [34.795223, -82.795391],
        [34.79509, -82.795351],
        [34.794925, -82.795361],
        [34.794809, -82.795404],
        [34.794692, -82.795487],
        [34.794609, -82.795594],
        [34.79434, -82.796197],
        [34.794292, -82.796301],
        [34.794198, -82.796481],
        [34.79413, -82.796593],
        [34.794049, -82.796649],
        [34.794209, -82.797069],
        [34.794557, -82.798036],
        [34.794749, -82.79862],
        [34.794886, -82.798983],
        [34.794961, -82.799271],
        [34.795042, -82.799641],
        [34.795089, -82.800038],
        [34.795138, -82.800413],
        [34.795183, -82.801012],
        [34.795269, -82.802149],
        [34.795315, -82.803062],
        [34.795371, -82.803802],
        [34.79543, -82.804367],
        [34.795488, -82.804829],
        [34.795711, -82.805943],
        [34.79606, -82.80726],
        [34.796145, -82.807588],
        [34.796328, -82.808296],
        [34.796551, -82.809075],
        [34.796746, -82.809704],
        [34.796912, -82.810102],
        [34.797047, -82.810414],
        [34.797469, -82.811191],
        [34.797944, -82.811924],
        [34.798434, -82.812681],
        [34.798605, -82.812946],
        [34.79887, -82.813386],
        [34.799488, -82.814413],
        [34.799527, -82.814478],
        [34.800411, -82.815887],
        [34.800727, -82.816327],
        [34.800978, -82.816616],
        [34.801179, -82.816829],
        [34.801742, -82.817152],
        [34.802079, -82.817334],
        [34.802615, -82.817624],
        [34.802949, -82.817805],
        [34.803478, -82.818094],
        [34.804732, -82.818781],
        [34.806376, -82.819685],
        [34.807324, -82.820191],
        [34.807622, -82.820422],
        [34.807849, -82.820633],
        [34.807931, -82.820773],
        [34.808118, -82.821156],
        [34.808217, -82.821398],
        [34.808273, -82.821502],
        [34.808258, -82.821764],
        [34.808169, -82.822353],
        [34.808099, -82.822729],
        [34.807988, -82.823199],
        [34.807703, -82.824234],
        [34.807356, -82.825825],
        [34.80685, -82.827857],
        [34.806645, -82.828681],
        [34.806407, -82.829566],
        [34.806183, -82.83032],
        [34.805965, -82.830936],
        [34.80585, -82.831277],
        [34.80581, -82.831395],
        [34.805737, -82.83161],
        [34.805564, -82.832164],
        [34.805386, -82.832682],
        [34.805287, -82.832992],
        [34.80517, -82.833355],
        [34.805046, -82.833848],
        [34.804973, -82.834116],
        [34.80492, -82.834491],
        [34.804907, -82.834986],
        [34.804911, -82.835718],
        [34.804943, -82.836457],
        [34.804933, -82.8371],
        [34.804874, -82.837484],
        [34.804769, -82.837821],
        [34.804706, -82.838051],
        [34.804622, -82.838291],
        [34.804489, -82.838542],
        [34.804189, -82.838936],
        [34.804126, -82.839018],
        [34.803693, -82.839756],
        [34.803297, -82.840318],
        [34.803212, -82.840438],
        [34.802965, -82.84081],
        [34.802829, -82.841016],
        [34.802775, -82.841106],
        [34.802612, -82.841381],
        [34.802455, -82.841644],
        [34.802315, -82.841879],
        [34.802039, -82.842379],
        [34.80198, -82.842486],
        [34.801386, -82.84377],
        [34.801343, -82.843865],
        [34.801277, -82.84401],
        [34.801239, -82.844092],
        [34.800683, -82.845312],
        [34.800465, -82.845725],
        [34.800185, -82.846093],
        [34.800109, -82.846173],
        [34.799961, -82.846329],
        [34.799694, -82.846536],
        [34.799238, -82.846738],
        [34.79915, -82.846752],
        [34.799224, -82.846915],
        [34.799287, -82.847038],
        [34.799382, -82.847154],
        [34.799585, -82.847256],
        [34.799767, -82.84729],
        [34.800095, -82.847331],
        [34.800271, -82.847353],
        [34.800556, -82.847397],
        [34.80074, -82.847473],
        [34.801598, -82.848119],
        [34.801777, -82.848261],
        [34.801854, -82.848381],
        [34.802113, -82.849192],
        [34.802169, -82.849425],
        [34.80218, -82.849692],
        [34.802237, -82.850137],
        [34.802243, -82.850369],
        [34.802231, -82.850589],
        [34.80219, -82.850803],
        [34.802041, -82.851058],
        [34.801888, -82.851281],
        [34.801602, -82.851638],
        [34.801479, -82.851817],
        [34.801314, -82.852159],
        [34.801296, -82.85231],
        [34.801295, -82.852473],
        [34.801345, -82.852783],
        [34.801423, -82.853175],
        [34.801514, -82.853706],
        [34.801575, -82.853997],
        [34.801593, -82.854183],
        [34.801581, -82.854379],
        [34.801541, -82.8546],
        [34.80151, -82.854805],
        [34.801399, -82.855122],
        [34.801286, -82.855387],
        [34.801182, -82.855667],
        [34.801128, -82.855882],
        [34.801064, -82.856164],
        [34.801032, -82.856462],
        [34.800973, -82.856801],
        [34.800904, -82.856998],
        [34.800835, -82.857126],
        [34.800803, -82.857184],
        [34.800725, -82.857312],
        [34.80056, -82.85748],
        [34.800235, -82.857741],
        [34.800073, -82.857861],
        [34.799966, -82.858028],
        [34.799915, -82.858184],
        [34.79989, -82.858478],
        [34.799924, -82.858977],
        [34.799955, -82.859346],
        [34.800021, -82.859687],
        [34.800082, -82.859832],
        [34.800137, -82.859962],
        [34.800241, -82.860166],
        [34.800347, -82.860479],
        [34.800377, -82.86072],
        [34.800352, -82.861053],
        [34.800314, -82.861377],
        [34.80032, -82.861601],
        [34.800339, -82.8619],
        [34.800378, -82.862309],
        [34.80038, -82.862614],
        [34.800331, -82.862777],
        [34.800171, -82.863149],
        [34.800075, -82.863278],
        [34.799921, -82.863408],
        [34.799761, -82.863516],
        [34.799483, -82.863617],
        [34.799167, -82.863699],
        [34.799002, -82.863773],
        [34.798915, -82.863866],
        [34.798848, -82.864039],
        [34.798776, -82.864259],
        [34.798693, -82.864409],
        [34.798577, -82.864578],
        [34.798483, -82.864697],
        [34.798715, -82.864782],
        [34.799398, -82.864985],
        [34.799745, -82.865064],
        [34.799919, -82.865084],
        [34.800155, -82.865096],
        [34.800379, -82.865049],
        [34.800602, -82.864905],
        [34.800863, -82.864758],
        [34.800969, -82.864698],
        [34.801193, -82.864556],
        [34.801649, -82.864304],
        [34.801802, -82.864256],
        [34.801865, -82.864237],
        [34.802243, -82.864163],
        [34.802554, -82.864084],
        [34.802805, -82.863979],
        [34.803027, -82.863858],
        [34.803209, -82.863654],
        [34.803534, -82.863214],
        [34.803745, -82.862868],
        [34.803953, -82.862446],
        [34.804239, -82.861975],
        [34.804468, -82.861574],
        [34.804579, -82.861279],
        [34.80475, -82.860873],
        [34.804909, -82.860299],
        [34.805176, -82.858918],
        [34.805212, -82.858542],
        [34.805193, -82.858129],
        [34.805109, -82.85771],
        [34.805061, -82.857439],
        [34.805084, -82.857288],
        [34.805146, -82.857204],
        [34.805306, -82.857202],
        [34.805586, -82.857171],
        [34.805725, -82.857118],
        [34.805859, -82.857011],
        [34.806043, -82.856812],
        [34.80624, -82.856521],
        [34.806439, -82.85615],
        [34.806656, -82.855636],
        [34.80673, -82.855176],
        [34.806767, -82.854943],
        [34.80679, -82.854565],
        [34.806869, -82.8543],
        [34.806987, -82.853971],
        [34.80712, -82.853726],
        [34.807909, -82.852685],
        [34.808143, -82.852386],
        [34.808272, -82.85216],
        [34.808426, -82.851719],
        [34.808481, -82.851615],
        [34.808595, -82.851689],
        [34.808753, -82.851708],
        [34.809001, -82.851702],
        [34.809428, -82.85165],
        [34.809814, -82.851626],
        [34.810137, -82.851544],
        [34.810268, -82.851473],
        [34.8103, -82.851427],
        [34.810364, -82.851333],
        [34.810485, -82.851061],
        [34.810683, -82.850642],
        [34.810883, -82.85015],
        [34.811038, -82.849713],
        [34.811125, -82.849411],
        [34.811664, -82.848908],
        [34.812177, -82.848469],
        [34.812343, -82.848327],
        [34.812675, -82.848072],
        [34.812779, -82.847992],
        [34.812967, -82.847871],
        [34.81321, -82.847715],
        [34.813864, -82.847294],
        [34.813967, -82.847228],
        [34.814667, -82.846746],
        [34.815467, -82.846038],
        [34.815544, -82.845946],
        [34.815883, -82.845658],
        [34.81641, -82.84519],
        [34.816966, -82.844734],
        [34.817178, -82.844565],
        [34.817383, -82.844402],
        [34.817464, -82.844338],
        [34.817555, -82.84425],
        [34.817666, -82.844133],
        [34.817791, -82.843947],
        [34.818388, -82.842672],
        [34.818488, -82.842395],
        [34.818814, -82.841319],
        [34.818835, -82.841248],
        [34.819142, -82.840358],
        [34.819356, -82.839549],
        [34.819511, -82.839171],
        [34.819694, -82.838944],
        [34.819846, -82.838857],
        [34.820074, -82.838757],
        [34.820493, -82.838483],
        [34.820729, -82.838284],
        [34.820982, -82.838079],
        [34.82129, -82.837764],
        [34.820824, -82.837412],
        [34.820739, -82.837331],
        [34.820637, -82.837235],
        [34.820464, -82.837034],
        [34.820075, -82.83648],
        [34.819772, -82.83611],
        [34.819535, -82.835739],
        [34.819259, -82.8354],
        [34.819035, -82.835091],
        [34.818786, -82.834824],
        [34.818523, -82.834559],
        [34.818298, -82.834332],
        [34.818191, -82.834214],
        [34.817599, -82.833706],
        [34.817513, -82.833627],
        [34.817163, -82.833308],
        [34.8171, -82.83325],
        [34.816595, -82.832803],
        [34.816379, -82.832584],
        [34.816275, -82.832467],
        [34.81608, -82.832226],
        [34.816005, -82.832137],
        [34.815953, -82.832046],
        [34.815725, -82.831497],
        [34.815338, -82.830639],
        [34.815131, -82.830177],
        [34.814979, -82.829845],
        [34.814435, -82.828659],
        [34.814334, -82.828442],
        [34.814175, -82.82819],
        [34.813877, -82.827838],
        [34.813826, -82.827778],
        [34.813794, -82.82774],
        [34.813395, -82.827329],
        [34.812953, -82.826836],
        [34.81252, -82.82642],
        [34.812391, -82.826296],
        [34.812329, -82.82623],
        [34.811547, -82.825385],
        [34.811367, -82.82523],
        [34.811276, -82.825151],
        [34.810979, -82.824854],
        [34.810589, -82.824429],
        [34.81, -82.82381],
        [34.809781, -82.823593],
        [34.809652, -82.823424],
        [34.809391, -82.823118],
        [34.80902, -82.822643],
        [34.808604, -82.822086],
        [34.808411, -82.821779],
        [34.808273, -82.821502],
        [34.808217, -82.821398],
        [34.808118, -82.821156],
        [34.807931, -82.820773],
        [34.807849, -82.820633],
        [34.807622, -82.820422],
        [34.807324, -82.820191],
        [34.806376, -82.819685],
        [34.804732, -82.818781],
        [34.803478, -82.818094],
        [34.802949, -82.817805],
        [34.802615, -82.817624],
        [34.802079, -82.817334],
        [34.801742, -82.817152],
        [34.801179, -82.816829],
        [34.800978, -82.816616],
        [34.800727, -82.816327],
        [34.800411, -82.815887],
        [34.799527, -82.814478],
        [34.799488, -82.814413],
        [34.79887, -82.813386],
        [34.798605, -82.812946],
        [34.798434, -82.812681],
        [34.797944, -82.811924],
        [34.797469, -82.811191],
        [34.797047, -82.810414],
        [34.796912, -82.810102],
        [34.796746, -82.809704],
        [34.796551, -82.809075],
        [34.796328, -82.808296],
        [34.796145, -82.807588],
        [34.79606, -82.80726],
        [34.795711, -82.805943],
        [34.795488, -82.804829],
        [34.79543, -82.804367],
        [34.795371, -82.803802],
        [34.795315, -82.803062],
        [34.795269, -82.802149],
        [34.795183, -82.801012],
        [34.795138, -82.800413],
        [34.795089, -82.800038],
        [34.795042, -82.799641],
        [34.794961, -82.799271],
        [34.794886, -82.798983],
        [34.794749, -82.79862],
        [34.794557, -82.798036],
        [34.794209, -82.797069],
        [34.794049, -82.796649],
        [34.79413, -82.796593],
        [34.794198, -82.796481],
        [34.794292, -82.796301],
        [34.79434, -82.796197],
        [34.794609, -82.795594],
        [34.794692, -82.795487],
        [34.794809, -82.795404],
        [34.794925, -82.795361],
        [34.79509, -82.795351],
        [34.795223, -82.795391],
        [34.795362, -82.79545],
        [34.795478, -82.795554],
        [34.795705, -82.795726],
        [34.796047, -82.796017],
        [34.796478, -82.796319],
        [34.79657, -82.796404],
        [34.796943, -82.796747],
        [34.797096, -82.796994],
        [34.797449, -82.79768],
        [34.797586, -82.797902],
        [34.797699, -82.798041],
        [34.797849, -82.798188],
        [34.797996, -82.798316],
        [34.79822, -82.798456],
        [34.798572, -82.798648],
        [34.798678, -82.798697],
        [34.798813, -82.798745],
        [34.799065, -82.798853],
        [34.799341, -82.798925],
        [34.799485, -82.798953],
        [34.799674, -82.798948],
        [34.799882, -82.798913]
    ]
]
 */ 
define("app", ["require", "exports", "openlayers", "mapquest-directions-proxy", "mapquest-optimized-route-proxy", "google-polyline", "jquery", "resize-sensor"], function (require, exports, ol, Directions, Route, PolylineEncoder, $, ResizeSensor) {
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
            return map;
        };
        Tests.prototype.polylineEncoder = function () {
            var encoder = new PolylineEncoder();
            console.log("_p~iF~ps|U_ulLnnqC_mqNvxq`@", encoder.encode([[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]]));
            console.log("decode", encoder.decode("_p~iF~ps|U_ulLnnqC_mqNvxq`@"));
        };
        Tests.prototype.renderRoute = function (map, result) {
            var lr = result.route.boundingBox.lr;
            var ul = result.route.boundingBox.ul;
            // lon,lat <==> x,y;
            // ul => max y, min x; 
            // lr => min y, max x
            map.getView().fit([ul.lng, lr.lat, lr.lng, ul.lat], map.getSize());
            var points = [];
            for (var i = 0; i < result.route.shape.shapePoints.length; i += 2) {
                var _a = [result.route.shape.shapePoints[i], result.route.shape.shapePoints[i + 1]], lat = _a[0], lon = _a[1];
                points.push([lon, lat]);
            }
            console.log("points", points);
            var geom = new ol.geom.LineString(points);
            var route = new ol.Feature({
                geometry: geom
            });
            route.setStyle(new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: "red",
                    width: 5
                })
            }));
            var source = new ol.source.Vector({
                features: [route]
            });
            var routeLayer = new ol.layer.Vector({
                source: source
            });
            result.route.locations.forEach(function (l) {
                var location = new ol.Feature({
                    geometry: new ol.geom.Point([l.latLng.lng, l.latLng.lat])
                });
                source.addFeature(location);
            });
            map.addLayer(routeLayer);
            result.route.legs.forEach(function (leg) {
                console.log(leg.destNarrative, leg.maneuvers.map(function (m) { return m.narrative; }).join("\n\t"));
            });
        };
        Tests.prototype.resize = function (map) {
            console.log("map should become portrait in 3 seconds");
            setTimeout(function () { return $(".map").addClass("portrait"); }, 3000);
            console.log("map should become landscape in 5 seconds");
            setTimeout(function () { return $(".map").removeClass("portrait"); }, 5000);
            console.log("map should become resize aware in 7 seconds");
            setTimeout(function () {
                //$(".map").resize(() => map.updateSize());
                new ResizeSensor($(".map")[0], function () { return map.updateSize(); });
            }, 7000);
            console.log("map should become portrait in 9 seconds");
            setTimeout(function () { return $(".map").addClass("portrait"); }, 9000);
        };
        return Tests;
    }());
    function run() {
        console.log("ol3 playground");
        var tests = new Tests();
        //tests.polylineEncoder();
        var map = tests.heatmap();
        //Osrm.test();
        //Search.test();
        //Geocoding.test();
        //Traffic.test();
        var l1 = [
            "550 S Main St 101, Greenville, SC 29601",
            "207 N Main St, Greenville, SC 29601",
            "100 S Main St 101, Greenville, SC 29601"];
        var l2 = [
            "34.845546,-82.401672",
            "34.845547,-82.401674"];
        false && Route.test({
            from: "50 Datastream Plaza, Greenville, SC",
            to: "50 Datastream Plaza, Greenville, SC",
            locations: l2
        }).then(function (result) { return tests.renderRoute(map, result); });
        false && Directions.test({
            from: "50 Datastream Plaza, Greenville, SC",
            to: ["550 S Main St 101, Greenville, SC 29601", "207 N Main St, Greenville, SC 29601"]
        }).then(function (result) { return tests.renderRoute(map, result); });
        tests.resize(map);
    }
    return run;
});
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
define("data/route_01", ["require", "exports"], function (require, exports) {
    "use strict";
    return {
        "route": {
            "hasTollRoad": false,
            "computedWaypoints": [],
            "fuelUsed": 0.41,
            "shape": {
                "maneuverIndexes": [0, 3, 6, 9, 16, 20, 31, 37, 40],
                "shapePoints": [34.790672, -82.407676, 34.791465, -82.407936, 34.791774, -82.40866, 34.791774, -82.40866, 34.791465, -82.410713, 34.79071, -82.411811, 34.79071, -82.411811, 34.78852, -82.414115, 34.787902, -82.415168, 34.787902, -82.415168, 34.78857, -82.415596, 34.791408, -82.416847, 34.793861, -82.419006, 34.797557, -82.421356, 34.798877, -82.422737, 34.799873, -82.424446, 34.799873, -82.424446, 34.80167, -82.424133, 34.80392, -82.423469, 34.807411, -82.421798, 34.807411, -82.421798, 34.807895, -82.422035, 34.809406, -82.421936, 34.817108, -82.419311, 34.81863, -82.418472, 34.819698, -82.417564, 34.823398, -82.413398, 34.826889, -82.410057, 34.828369, -82.408966, 34.831047, -82.4057, 34.832126, -82.404014, 34.832126, -82.404014, 34.834873, -82.405517, 34.839363, -82.406455, 34.841873, -82.406387, 34.842742, -82.405845, 34.84452, -82.404212, 34.84452, -82.404212, 34.844757, -82.402526, 34.845546, -82.401672, 34.845546, -82.401672, 34.846393, -82.40097, 34.85271, -82.398056],
                "legIndexes": [0, 40, 43]
            },
            "hasUnpaved": false,
            "hasHighway": true,
            "realTime": 878,
            "boundingBox": {
                "ul": {
                    "lng": -82.424446,
                    "lat": 34.85271
                },
                "lr": {
                    "lng": -82.398056,
                    "lat": 34.787902
                }
            },
            "distance": 5.804,
            "time": 793,
            "locationSequence": [0, 1, 2],
            "hasSeasonalClosure": false,
            "sessionId": "56d92350-01d1-0012-02b7-6f80-00163efc9f42",
            "locations": [{
                    "latLng": {
                        "lng": -82.407674,
                        "lat": 34.790672
                    },
                    "adminArea4": "Greenville",
                    "adminArea5Type": "City",
                    "adminArea4Type": "County",
                    "adminArea5": "Greenville",
                    "street": "50 Datastream Plz",
                    "adminArea1": "US",
                    "adminArea3": "SC",
                    "type": "s",
                    "displayLatLng": {
                        "lng": -82.407676,
                        "lat": 34.790672
                    },
                    "linkId": 49368065,
                    "postalCode": "29605-3451",
                    "sideOfStreet": "R",
                    "dragPoint": false,
                    "adminArea1Type": "Country",
                    "geocodeQuality": "ADDRESS",
                    "geocodeQualityCode": "L1AAA",
                    "adminArea3Type": "State"
                },
                {
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
                        "lng": -82.398057,
                        "lat": 34.85271
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
                        "lng": -82.398056,
                        "lat": 34.85271
                    },
                    "linkId": 48131299,
                    "postalCode": "29601-2115",
                    "sideOfStreet": "L",
                    "dragPoint": false,
                    "adminArea1Type": "Country",
                    "geocodeQuality": "POINT",
                    "geocodeQualityCode": "P1AAA",
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
                    "distance": 5.267,
                    "time": 633,
                    "origIndex": 3,
                    "hasSeasonalClosure": false,
                    "origNarrative": "Go northwest on White Horse Rd/US-25 N.",
                    "hasCountryCross": false,
                    "formattedTime": "00:10:33",
                    "destNarrative": "Proceed to 550 S MAIN ST, 101.",
                    "destIndex": 6,
                    "maneuvers": [{
                            "signs": [],
                            "index": 0,
                            "maneuverNotes": [],
                            "direction": 2,
                            "narrative": "Start out going northwest on Datastream Plz toward Bruce Rd.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-start_sm.gif",
                            "distance": 0.104,
                            "time": 29,
                            "linkIds": [],
                            "streets": ["Datastream Plz"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:00:29",
                            "directionName": "Northwest",
                            "startPoint": {
                                "lng": -82.407676,
                                "lat": 34.790672
                            },
                            "turnType": 2
                        },
                        {
                            "signs": [],
                            "index": 1,
                            "maneuverNotes": [],
                            "direction": 6,
                            "narrative": "Turn slight left onto Bruce Rd.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_slight_left_sm.gif",
                            "distance": 0.201,
                            "time": 27,
                            "linkIds": [],
                            "streets": ["Bruce Rd"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:00:27",
                            "directionName": "Southwest",
                            "startPoint": {
                                "lng": -82.40866,
                                "lat": 34.791774
                            },
                            "turnType": 7
                        },
                        {
                            "signs": [],
                            "index": 2,
                            "maneuverNotes": [],
                            "direction": 6,
                            "narrative": "Bruce Rd becomes E Lenhardt Rd.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_straight_sm.gif",
                            "distance": 0.274,
                            "time": 41,
                            "linkIds": [],
                            "streets": ["E Lenhardt Rd"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:00:41",
                            "directionName": "Southwest",
                            "startPoint": {
                                "lng": -82.411811,
                                "lat": 34.79071
                            },
                            "turnType": 0
                        },
                        {
                            "signs": [{
                                    "text": "25",
                                    "extraText": "",
                                    "direction": 1,
                                    "type": 2,
                                    "url": "http://icons.mqcdn.com/icons/rs2.png?n=25&d=NORTH"
                                }],
                            "index": 3,
                            "maneuverNotes": [],
                            "direction": 2,
                            "narrative": "Turn right onto White Horse Rd/US-25 N.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_right_sm.gif",
                            "distance": 0.999,
                            "time": 118,
                            "linkIds": [],
                            "streets": ["White Horse Rd", "US-25 N"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:01:58",
                            "directionName": "Northwest",
                            "startPoint": {
                                "lng": -82.415168,
                                "lat": 34.787902
                            },
                            "turnType": 2
                        },
                        {
                            "signs": [{
                                    "text": "20",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 539,
                                    "url": "http://icons.mqcdn.com/icons/rs539.png?n=20"
                                }],
                            "index": 4,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Turn right onto SC-20/Grove Rd.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_right_sm.gif",
                            "distance": 0.545,
                            "time": 62,
                            "linkIds": [],
                            "streets": ["SC-20", "Grove Rd"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:01:02",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -82.424446,
                                "lat": 34.799873
                            },
                            "turnType": 2
                        },
                        {
                            "signs": [{
                                    "text": "29",
                                    "extraText": "",
                                    "direction": 1,
                                    "type": 2,
                                    "url": "http://icons.mqcdn.com/icons/rs2.png?n=29&d=NORTH"
                                }],
                            "index": 5,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Merge onto US-29 N via the ramp on the left toward GROVE RD.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_merge_left_sm.gif",
                            "distance": 2.056,
                            "time": 185,
                            "linkIds": [],
                            "streets": ["US-29 N"],
                            "attributes": 128,
                            "transportMode": "AUTO",
                            "formattedTime": "00:03:05",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -82.421798,
                                "lat": 34.807411
                            },
                            "turnType": 11
                        },
                        {
                            "signs": [{
                                    "text": "25",
                                    "extraText": "BUS",
                                    "direction": 1,
                                    "type": 2,
                                    "url": "http://icons.mqcdn.com/icons/rs2.png?n=25&d=NORTH&v=BUS"
                                }],
                            "index": 6,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Turn left onto Augusta St/US-25 Bus N.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_left_sm.gif",
                            "distance": 0.917,
                            "time": 133,
                            "linkIds": [],
                            "streets": ["Augusta St", "US-25 Bus N"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:02:13",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -82.404014,
                                "lat": 34.832126
                            },
                            "turnType": 6
                        },
                        {
                            "signs": [],
                            "index": 7,
                            "maneuverNotes": [],
                            "direction": 8,
                            "narrative": "Turn right onto S Main St.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-end_sm.gif",
                            "distance": 0.171,
                            "time": 38,
                            "linkIds": [],
                            "streets": ["S Main St"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:00:38",
                            "directionName": "East",
                            "startPoint": {
                                "lng": -82.404212,
                                "lat": 34.84452
                            },
                            "turnType": 2
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
                    "distance": 0.537,
                    "time": 160,
                    "origIndex": -1,
                    "hasSeasonalClosure": false,
                    "origNarrative": "",
                    "hasCountryCross": false,
                    "formattedTime": "00:02:40",
                    "destNarrative": "",
                    "destIndex": -1,
                    "maneuvers": [{
                            "signs": [],
                            "index": 8,
                            "maneuverNotes": [],
                            "direction": 3,
                            "narrative": "Start out going northeast on S Main St toward E Broad St.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-start_sm.gif",
                            "distance": 0.537,
                            "time": 160,
                            "linkIds": [],
                            "streets": ["S Main St"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:02:40",
                            "directionName": "Northeast",
                            "startPoint": {
                                "lng": -82.401672,
                                "lat": 34.845546
                            },
                            "turnType": 6
                        }],
                    "hasFerry": false
                }],
            "formattedTime": "00:13:13",
            "routeError": {
                "message": "",
                "errorCode": -400
            },
            "options": {
                "mustAvoidLinkIds": [],
                "drivingStyle": 2,
                "countryBoundaryDisplay": true,
                "generalize": 10,
                "narrativeType": "text",
                "locale": "en_US",
                "avoidTimedConditions": false,
                "destinationManeuverDisplay": false,
                "enhancedNarrative": false,
                "filterZoneFactor": -1,
                "timeType": 0,
                "maxWalkingDistance": -1,
                "routeType": "FASTEST",
                "transferPenalty": -1,
                "walkingSpeed": -1,
                "stateBoundaryDisplay": true,
                "avoids": ["unpaved"],
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
                "manmaps": "false",
                "highwayEfficiency": 20,
                "sideOfStreetDisplay": false,
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
    };
});
define("data/route_02", ["require", "exports"], function (require, exports) {
    "use strict";
    return {
        "route": {
            "hasTollRoad": false,
            "computedWaypoints": [],
            "fuelUsed": 0.33,
            "shape": {
                "maneuverIndexes": [0, 3, 6, 9, 16, 20, 31, 37, 40],
                "shapePoints": [34.790672, -82.407676, 34.791465, -82.407936, 34.791774, -82.40866, 34.791774, -82.40866, 34.791465, -82.410713, 34.79071, -82.411811, 34.79071, -82.411811, 34.78852, -82.414115, 34.787902, -82.415168, 34.787902, -82.415168, 34.78857, -82.415596, 34.791408, -82.416847, 34.793861, -82.419006, 34.797557, -82.421356, 34.798877, -82.422737, 34.799873, -82.424446, 34.799873, -82.424446, 34.80167, -82.424133, 34.80392, -82.423469, 34.807411, -82.421798, 34.807411, -82.421798, 34.807895, -82.422035, 34.809406, -82.421936, 34.817108, -82.419311, 34.81863, -82.418472, 34.819698, -82.417564, 34.823398, -82.413398, 34.826889, -82.410057, 34.828369, -82.408966, 34.831047, -82.4057, 34.832126, -82.404014, 34.832126, -82.404014, 34.834873, -82.405517, 34.839363, -82.406455, 34.841873, -82.406387, 34.842742, -82.405845, 34.84452, -82.404212, 34.84452, -82.404212, 34.844757, -82.402526, 34.845546, -82.401672, 34.845546, -82.401672, 34.846393, -82.40097, 34.85271, -82.398056],
                "legIndexes": [0, 40, 43]
            },
            "hasUnpaved": false,
            "hasHighway": true,
            "realTime": 820,
            "boundingBox": {
                "ul": {
                    "lng": -82.424446,
                    "lat": 34.85271
                },
                "lr": {
                    "lng": -82.398056,
                    "lat": 34.787902
                }
            },
            "distance": 5.804,
            "time": 793,
            "locationSequence": [0, 1, 2],
            "hasSeasonalClosure": false,
            "sessionId": "56d929c3-00b3-000e-02b7-6f80-00163efc9f42",
            "locations": [{
                    "latLng": {
                        "lng": -82.407674,
                        "lat": 34.790672
                    },
                    "adminArea4": "Greenville",
                    "adminArea5Type": "City",
                    "adminArea4Type": "County",
                    "adminArea5": "Greenville",
                    "street": "50 Datastream Plz",
                    "adminArea1": "US",
                    "adminArea3": "SC",
                    "type": "s",
                    "displayLatLng": {
                        "lng": -82.407676,
                        "lat": 34.790672
                    },
                    "linkId": 49368065,
                    "postalCode": "29605-3451",
                    "sideOfStreet": "R",
                    "dragPoint": false,
                    "adminArea1Type": "Country",
                    "geocodeQuality": "ADDRESS",
                    "geocodeQualityCode": "L1AAA",
                    "adminArea3Type": "State"
                },
                {
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
                        "lng": -82.398057,
                        "lat": 34.85271
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
                        "lng": -82.398056,
                        "lat": 34.85271
                    },
                    "linkId": 48131299,
                    "postalCode": "29601-2115",
                    "sideOfStreet": "L",
                    "dragPoint": false,
                    "adminArea1Type": "Country",
                    "geocodeQuality": "POINT",
                    "geocodeQualityCode": "P1AAA",
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
                    "distance": 5.267,
                    "time": 633,
                    "origIndex": 3,
                    "hasSeasonalClosure": false,
                    "origNarrative": "Go northwest on White Horse Rd/US-25 N.",
                    "hasCountryCross": false,
                    "formattedTime": "00:10:33",
                    "destNarrative": "Proceed to 550 S MAIN ST, 101.",
                    "destIndex": 6,
                    "maneuvers": [{
                            "signs": [],
                            "index": 0,
                            "maneuverNotes": [],
                            "direction": 2,
                            "narrative": "Start out going northwest on Datastream Plz toward Bruce Rd.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-start_sm.gif",
                            "distance": 0.104,
                            "time": 29,
                            "linkIds": [],
                            "streets": ["Datastream Plz"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:00:29",
                            "directionName": "Northwest",
                            "startPoint": {
                                "lng": -82.407676,
                                "lat": 34.790672
                            },
                            "turnType": 2
                        },
                        {
                            "signs": [],
                            "index": 1,
                            "maneuverNotes": [],
                            "direction": 6,
                            "narrative": "Turn slight left onto Bruce Rd.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_slight_left_sm.gif",
                            "distance": 0.201,
                            "time": 27,
                            "linkIds": [],
                            "streets": ["Bruce Rd"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:00:27",
                            "directionName": "Southwest",
                            "startPoint": {
                                "lng": -82.40866,
                                "lat": 34.791774
                            },
                            "turnType": 7
                        },
                        {
                            "signs": [],
                            "index": 2,
                            "maneuverNotes": [],
                            "direction": 6,
                            "narrative": "Bruce Rd becomes E Lenhardt Rd.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_straight_sm.gif",
                            "distance": 0.274,
                            "time": 41,
                            "linkIds": [],
                            "streets": ["E Lenhardt Rd"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:00:41",
                            "directionName": "Southwest",
                            "startPoint": {
                                "lng": -82.411811,
                                "lat": 34.79071
                            },
                            "turnType": 0
                        },
                        {
                            "signs": [{
                                    "text": "25",
                                    "extraText": "",
                                    "direction": 1,
                                    "type": 2,
                                    "url": "http://icons.mqcdn.com/icons/rs2.png?n=25&d=NORTH"
                                }],
                            "index": 3,
                            "maneuverNotes": [],
                            "direction": 2,
                            "narrative": "Turn right onto White Horse Rd/US-25 N.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_right_sm.gif",
                            "distance": 0.999,
                            "time": 118,
                            "linkIds": [],
                            "streets": ["White Horse Rd", "US-25 N"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:01:58",
                            "directionName": "Northwest",
                            "startPoint": {
                                "lng": -82.415168,
                                "lat": 34.787902
                            },
                            "turnType": 2
                        },
                        {
                            "signs": [{
                                    "text": "20",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 539,
                                    "url": "http://icons.mqcdn.com/icons/rs539.png?n=20"
                                }],
                            "index": 4,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Turn right onto SC-20/Grove Rd.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_right_sm.gif",
                            "distance": 0.545,
                            "time": 62,
                            "linkIds": [],
                            "streets": ["SC-20", "Grove Rd"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:01:02",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -82.424446,
                                "lat": 34.799873
                            },
                            "turnType": 2
                        },
                        {
                            "signs": [{
                                    "text": "29",
                                    "extraText": "",
                                    "direction": 1,
                                    "type": 2,
                                    "url": "http://icons.mqcdn.com/icons/rs2.png?n=29&d=NORTH"
                                }],
                            "index": 5,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Merge onto US-29 N via the ramp on the left toward GROVE RD.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_merge_left_sm.gif",
                            "distance": 2.056,
                            "time": 185,
                            "linkIds": [],
                            "streets": ["US-29 N"],
                            "attributes": 128,
                            "transportMode": "AUTO",
                            "formattedTime": "00:03:05",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -82.421798,
                                "lat": 34.807411
                            },
                            "turnType": 11
                        },
                        {
                            "signs": [{
                                    "text": "25",
                                    "extraText": "BUS",
                                    "direction": 1,
                                    "type": 2,
                                    "url": "http://icons.mqcdn.com/icons/rs2.png?n=25&d=NORTH&v=BUS"
                                }],
                            "index": 6,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Turn left onto Augusta St/US-25 Bus N.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_left_sm.gif",
                            "distance": 0.917,
                            "time": 133,
                            "linkIds": [],
                            "streets": ["Augusta St", "US-25 Bus N"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:02:13",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -82.404014,
                                "lat": 34.832126
                            },
                            "turnType": 6
                        },
                        {
                            "signs": [],
                            "index": 7,
                            "maneuverNotes": [],
                            "direction": 8,
                            "narrative": "Turn right onto S Main St.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-end_sm.gif",
                            "distance": 0.171,
                            "time": 38,
                            "linkIds": [],
                            "streets": ["S Main St"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:00:38",
                            "directionName": "East",
                            "startPoint": {
                                "lng": -82.404212,
                                "lat": 34.84452
                            },
                            "turnType": 2
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
                    "distance": 0.537,
                    "time": 160,
                    "origIndex": -1,
                    "hasSeasonalClosure": false,
                    "origNarrative": "",
                    "hasCountryCross": false,
                    "formattedTime": "00:02:40",
                    "destNarrative": "",
                    "destIndex": -1,
                    "maneuvers": [{
                            "signs": [],
                            "index": 8,
                            "maneuverNotes": [],
                            "direction": 3,
                            "narrative": "Start out going northeast on S Main St toward E Broad St.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-start_sm.gif",
                            "distance": 0.537,
                            "time": 160,
                            "linkIds": [],
                            "streets": ["S Main St"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:02:40",
                            "directionName": "Northeast",
                            "startPoint": {
                                "lng": -82.401672,
                                "lat": 34.845546
                            },
                            "turnType": 6
                        }],
                    "hasFerry": false
                }],
            "formattedTime": "00:13:13",
            "routeError": {
                "message": "",
                "errorCode": -400
            },
            "options": {
                "mustAvoidLinkIds": [],
                "drivingStyle": 2,
                "countryBoundaryDisplay": true,
                "generalize": 10,
                "narrativeType": "text",
                "locale": "en_US",
                "avoidTimedConditions": false,
                "destinationManeuverDisplay": false,
                "enhancedNarrative": false,
                "filterZoneFactor": -1,
                "timeType": 0,
                "maxWalkingDistance": -1,
                "routeType": "FASTEST",
                "transferPenalty": -1,
                "walkingSpeed": -1,
                "stateBoundaryDisplay": true,
                "avoids": ["unpaved"],
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
                "manmaps": "false",
                "highwayEfficiency": 20,
                "sideOfStreetDisplay": false,
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
    };
});
define("ux/styles/flower", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "star": {
                "fill": {
                    "color": "rgba(106,9,251,0.736280404819044)"
                },
                "opacity": 1,
                "stroke": {
                    "color": "rgba(42,128,244,0.8065839214705285)",
                    "width": 8.199150828494362
                },
                "radius": 13.801178106456376,
                "radius2": 9.103803658902862,
                "points": 10
            }
        }
    ];
});
define("ux/format", ["require", "exports", "openlayers", "ux/styles/flower"], function (require, exports, ol, coretech_flower_json) {
    "use strict";
    var geoJsonSimpleStyle = {
        "type": "FeatureCollection",
        "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [0, 0]
                },
                "properties": {
                    "title": "A title",
                    "description": "A description",
                    // OPTIONAL: default "medium"
                    // Value must be one of
                    // "small"
                    // "medium"
                    // "large"
                    "marker-size": "medium",
                    // OPTIONAL: default ""
                    "marker-symbol": "bus",
                    // OPTIONAL: default "7e7e7e"
                    // the marker's color
                    //
                    // value must follow COLOR RULES
                    "marker-color": "#fff",
                    // OPTIONAL: default "555555"
                    // the color of a line as part of a polygon, polyline, or
                    // multigeometry
                    //
                    // value must follow COLOR RULES
                    "stroke": "#555555",
                    // OPTIONAL: default 1.0
                    // the opacity of the line component of a polygon, polyline, or
                    // multigeometry
                    //
                    // value must be a floating point number greater than or equal to
                    // zero and less or equal to than one
                    "stroke-opacity": 1.0,
                    // OPTIONAL: default 2
                    // the width of the line component of a polygon, polyline, or
                    // multigeometry
                    //
                    // value must be a floating point number greater than or equal to 0
                    "stroke-width": 2,
                    // OPTIONAL: default "555555"
                    // the color of the interior of a polygon
                    //
                    // value must follow COLOR RULES
                    "fill": "#555555",
                    // OPTIONAL: default 0.6
                    // the opacity of the interior of a polygon. Implementations
                    // may choose to set this to 0 for line features.
                    //
                    // value must be a floating point number greater than or equal to
                    // zero and less or equal to than one
                    "fill-opacity": 0.5
                }
            }]
    };
    /**
     * See also, leaflet styles:
        weight: 2,
        color: "#999",
        opacity: 1,
        fillColor: "#B0DE5C",
        fillOpacity: 0.8
    
     * mapbox styles (https://github.com/mapbox/simplestyle-spec/tree/master/1.1.0)
     * mapbox svg symbols: https://github.com/mapbox/maki
     */
    var CoretechConverter = (function () {
        function CoretechConverter() {
        }
        CoretechConverter.prototype.fromJson = function (json) {
            return this.deserializeStyle(json);
        };
        CoretechConverter.prototype.toJson = function (style) {
            return this.serializeStyle(style);
        };
        CoretechConverter.prototype.assign = function (obj, prop, value) {
            //let getter = prop[0].toUpperCase() + prop.substring(1);
            if (value === null)
                return;
            if (value === undefined)
                return;
            if (typeof value === "object") {
                if (Object.keys(value).length === 0)
                    return;
            }
            if (prop === "image") {
                if (value.hasOwnProperty("radius")) {
                    prop = "circle";
                }
                if (value.hasOwnProperty("points")) {
                    prop = "star";
                }
            }
            obj[prop] = value;
        };
        CoretechConverter.prototype.serializeStyle = function (style) {
            var s = {};
            if (!style)
                return null;
            if (typeof style === "string")
                return style;
            if (typeof style === "number")
                return style;
            if (style.getColor)
                this.assign(s, "color", this.serializeColor(style.getColor()));
            if (style.getImage)
                this.assign(s, "image", this.serializeStyle(style.getImage()));
            if (style.getFill)
                this.assign(s, "fill", this.serializeFill(style.getFill()));
            if (style.getOpacity)
                this.assign(s, "opacity", style.getOpacity());
            if (style.getStroke)
                this.assign(s, "stroke", this.serializeStyle(style.getStroke()));
            if (style.getText)
                this.assign(s, "text", this.serializeStyle(style.getText()));
            if (style.getWidth)
                this.assign(s, "width", style.getWidth());
            if (style.getOffsetX)
                this.assign(s, "offset-x", style.getOffsetX());
            if (style.getOffsetY)
                this.assign(s, "offset-y", style.getOffsetY());
            if (style.getWidth)
                this.assign(s, "width", style.getWidth());
            if (style.getFont)
                this.assign(s, "font", style.getFont());
            if (style.getRadius)
                this.assign(s, "radius", style.getRadius());
            if (style.getRadius2)
                this.assign(s, "radius2", style.getRadius2());
            if (style.getPoints)
                this.assign(s, "points", style.getPoints() / 2);
            return s;
        };
        CoretechConverter.prototype.serializeColor = function (color) {
            return typeof color === "string" ? color : ol.color.asString(ol.color.asArray(color));
        };
        CoretechConverter.prototype.serializeFill = function (fill) {
            return this.serializeStyle(fill);
        };
        CoretechConverter.prototype.deserializeStyle = function (json) {
            var image;
            var text;
            if (json.circle)
                image = this.deserializeCircle(json.circle);
            else if (json.star)
                image = this.deserializeStar(json.star);
            if (json.text)
                text = this.deserializeText(json.text);
            var s = new ol.style.Style({
                image: image,
                text: text
            });
            return s;
        };
        CoretechConverter.prototype.deserializeText = function (json) {
            return new ol.style.Text({
                fill: this.deserializeFill(json.fill),
                stroke: this.deserializeStroke(json.stroke),
                text: json.text,
                font: json.font,
                offsetX: json["offset-x"],
                offsetY: json["offset-y"],
            });
        };
        CoretechConverter.prototype.deserializeCircle = function (json) {
            var image = new ol.style.Circle({
                radius: json.radius,
                fill: this.deserializeFill(json.fill),
                stroke: this.deserializeStroke(json.stroke)
            });
            image.setOpacity(json.opacity);
            return image;
        };
        CoretechConverter.prototype.deserializeStar = function (json) {
            var image = new ol.style.RegularShape({
                radius: json.radius,
                radius2: json.radius2,
                points: json.points,
                fill: this.deserializeFill(json.fill),
                stroke: this.deserializeStroke(json.stroke)
            });
            image.setOpacity(json.opacity);
            return image;
        };
        CoretechConverter.prototype.deserializeFill = function (json) {
            var fill = new ol.style.Fill({
                color: json.color
            });
            return fill;
        };
        CoretechConverter.prototype.deserializeStroke = function (json) {
            var stroke = new ol.style.Stroke();
            stroke.setColor(json.color);
            stroke.setWidth(json.width);
            return stroke;
        };
        return CoretechConverter;
    }());
    exports.CoretechConverter = CoretechConverter;
    {
        var coretechConverter_1 = new CoretechConverter();
        var expect = JSON.stringify(coretech_flower_json);
        var actual = JSON.stringify(coretech_flower_json.map(function (json) { return coretechConverter_1.toJson(coretechConverter_1.fromJson(json)); }));
        if (expect !== actual) {
            throw "CoretechConverter failure coretech_flower_json";
        }
        ;
    }
});
define("ux/style-generator", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    var range = function (n) {
        var result = new Array(n);
        for (var i = 0; i < n; i++)
            result[i] = i;
        return result;
    };
    var StyleGenerator = (function () {
        function StyleGenerator(options) {
            this.options = options;
        }
        StyleGenerator.prototype.asPoints = function () {
            return 3 + Math.round(10 * Math.random());
        };
        StyleGenerator.prototype.asRadius = function () {
            return 14 + 10 * Math.random();
        };
        StyleGenerator.prototype.asWidth = function () {
            return 1 + 20 * Math.random() * Math.random();
        };
        StyleGenerator.prototype.asPastel = function () {
            var _a = [255, 255, 255].map(function (n) { return Math.round((1 - Math.random() * Math.random()) * n); }), r = _a[0], g = _a[1], b = _a[2];
            return [r, g, b, 0.1 + 0.5 * Math.random()];
        };
        StyleGenerator.prototype.asColor = function () {
            var _a = [255, 255, 255].map(function (n) { return Math.round((Math.random() * Math.random()) * n); }), r = _a[0], g = _a[1], b = _a[2];
            return [r, g, b, 0.1 + 0.9 * Math.random()];
        };
        StyleGenerator.prototype.asFill = function () {
            var fill = new ol.style.Fill({
                color: this.asPastel(),
            });
            return fill;
        };
        StyleGenerator.prototype.asStroke = function () {
            var stroke = new ol.style.Stroke({
                width: this.asWidth(),
                color: this.asColor()
            });
            return stroke;
        };
        StyleGenerator.prototype.asCircle = function () {
            var style = new ol.style.Circle({
                fill: this.asFill(),
                radius: this.asRadius(),
                stroke: this.asStroke(),
                snapToPixel: false
            });
            return style;
        };
        StyleGenerator.prototype.asStar = function () {
            var style = new ol.style.RegularShape({
                fill: this.asFill(),
                stroke: this.asStroke(),
                points: this.asPoints(),
                radius: this.asRadius(),
                radius2: this.asRadius()
            });
            return style;
        };
        StyleGenerator.prototype.asPoly = function () {
            var style = new ol.style.RegularShape({
                fill: this.asFill(),
                stroke: this.asStroke(),
                points: this.asPoints(),
                radius: this.asRadius(),
                width: this.asWidth(),
                radius2: 0
            });
            return style;
        };
        StyleGenerator.prototype.asText = function () {
            var style = new ol.style.Text({
                font: "18px fantasy",
                text: "Test",
                fill: this.asFill(),
                stroke: this.asStroke(),
                offsetY: 30 - Math.random() * 20
            });
            style.getFill().setColor(this.asColor());
            style.getStroke().setColor(this.asPastel());
            return style;
        };
        StyleGenerator.prototype.asPoint = function () {
            var _a = this.options.center, x = _a[0], y = _a[1];
            x += (Math.random() - 0.5);
            y += (Math.random() - 0.5);
            return new ol.geom.Point([x, y]);
        };
        StyleGenerator.prototype.asPointFeature = function (styleCount) {
            var _this = this;
            if (styleCount === void 0) { styleCount = 1; }
            var feature = new ol.Feature();
            var gens = [function () { return _this.asStar(); }, function () { return _this.asCircle(); }, function () { return _this.asPoly(); }];
            feature.setGeometry(this.asPoint());
            var styles = range(styleCount).map(function (x) { return new ol.style.Style({
                image: gens[Math.round((gens.length - 1) * Math.random())](),
                text: null && _this.asText()
            }); });
            feature.setStyle(styles);
            return feature;
        };
        StyleGenerator.prototype.asLineFeature = function () {
            var feature = new ol.Feature();
            var p1 = this.asPoint();
            var p2 = this.asPoint();
            p2.setCoordinates([p2.getCoordinates()[0], p1.getCoordinates()[1]]);
            var polyline = new ol.geom.LineString([p1, p2].map(function (p) { return p.getCoordinates(); }));
            feature.setGeometry(polyline);
            feature.setStyle([new ol.style.Style({
                    stroke: this.asStroke(),
                    text: this.asText()
                })]);
            return feature;
        };
        StyleGenerator.prototype.asLineLayer = function () {
            var _this = this;
            var layer = new ol.layer.Vector();
            var source = new ol.source.Vector();
            layer.setSource(source);
            var features = range(10).map(function (i) { return _this.asLineFeature(); });
            source.addFeatures(features);
            return layer;
        };
        StyleGenerator.prototype.asMarkerLayer = function (args) {
            var _this = this;
            var layer = new ol.layer.Vector();
            var source = new ol.source.Vector();
            layer.setSource(source);
            var features = range(args.markerCount || 100).map(function (i) { return _this.asPointFeature(args.styleCount || 1); });
            source.addFeatures(features);
            return layer;
        };
        return StyleGenerator;
    }());
    return StyleGenerator;
});
define("ux/style-lab", ["require", "exports", "openlayers", "jquery", "ux/format", "ux/style-generator"], function (require, exports, ol, $, Formatter, StyleGenerator) {
    "use strict";
    var center = [-82.4, 34.85];
    var formatter = new Formatter.CoretechConverter();
    var generator = new StyleGenerator({
        center: center,
        fromJson: function (json) { return formatter.fromJson(json); }
    });
    var ux = "\n<div class='form'>\n<label for='style-count'>How many styles per symbol?</label>\n<input id='style-count' type=\"number\" value=\"1\" />\n<label for='style-out'>Click marker to see style here:</label>\n<textarea id='style-out'></textarea>\n<label for='apply-style'>Apply this style to some of the features</label>\n<button id='apply-style'>Apply</button>\n<div>\n";
    var css = "\nhtml, body, .map {\n    width: 100%;\n    height: 100%;\n    overflow: hidden;    \n}\n\nlabel {\n    display: block;\n}\n\n.form {\n    padding: 20px;\n    position:absolute;\n    top: 40px;\n    right: 40px;\n    z-index: 1;\n    background-color: rgba(255, 255, 255, 0.8);\n    border: 1px solid black;\n}\n\n#style-count {\n    vertical-align: top;\n}\n\n#style-out {\n    min-width: 100px;\n    min-height: 20px;\n}\n";
    function run() {
        $(ux).appendTo(".map");
        $("<style>").appendTo("head").text(css);
        var map = new ol.Map({
            target: "map",
            view: new ol.View({
                projection: 'EPSG:4326',
                center: center,
                zoom: 10
            }),
            layers: []
        });
        var styleOut = document.getElementById("style-out");
        $("#style-count").on("change", function (args) {
            map.addLayer(generator.asMarkerLayer({
                markerCount: 100,
                styleCount: args.target.valueAsNumber
            }));
        }).change();
        $("#apply-style").on("click", function () {
            var json = JSON.parse(styleOut.value);
            console.log(json);
            var styles = json.map(function (json) { return formatter.fromJson(json); });
            map.getLayers().forEach(function (l) {
                if (l instanceof ol.layer.Vector) {
                    var s = l.getSource();
                    var features = s.getFeatures().filter(function (f, i) { return 0.5 > Math.random(); });
                    features.forEach(function (f) { return f.setStyle(styles); });
                    l.changed();
                }
            });
        });
        map.on("click", function (args) { return map.forEachFeatureAtPixel(args.pixel, function (feature, layer) {
            var style = feature.getStyle();
            var json = "";
            if (Array.isArray(style)) {
                var styles = style.map(function (s) { return formatter.toJson(s); });
                json = JSON.stringify(styles, null, '\t');
            }
            else {
                throw "todo";
            }
            styleOut.value = json;
        }); });
        return map;
    }
    exports.run = run;
});
define("ux/styles/4star", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "star": {
                "fill": {
                    "color": "rgba(238,162,144,0.4)"
                },
                "opacity": 1,
                "stroke": {
                    "color": "rgba(169,141,168,0.8)",
                    "width": 5
                },
                "radius": 13,
                "radius2": 7,
                "points": 4
            }
        }
    ];
});
define("ux/styles/6star", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "star": {
                "fill": {
                    "color": "rgba(54,47,234,1)"
                },
                "stroke": {
                    "color": "rgba(75,92,105,0.85)",
                    "width": 4
                },
                "radius": 9,
                "radius2": 0,
                "points": 6
            }
        }
    ];
});
define("ux/styles/alert", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "circle": {
                "fill": {
                    "color": "rgba(197,37,84,0.9684230581506159)"
                },
                "opacity": 1,
                "stroke": {
                    "color": "rgba(227,83,105,0.9911592437357548)",
                    "width": 4.363895186012079
                },
                "radius": 7.311000259153705
            },
            "text": {
                "fill": {
                    "color": "rgba(205,86,109,0.8918881202751567)"
                },
                "stroke": {
                    "color": "rgba(252,175,131,0.46245606098317293)",
                    "width": 1.9329284004109581
                },
                "text": "Test",
                "offset-x": 0,
                "offset-y": 19.909814762842267,
                "font": "18px fantasy"
            }
        }
    ];
});
define("ux/styles/cold", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "star": {
                "fill": {
                    "color": "rgb(127,220,241)"
                },
                "opacity": 0.5,
                "stroke": {
                    "color": "rgb(160,164,166)",
                    "width": 3
                },
                "radius": 11,
                "radius2": 5,
                "points": 12
            }
        }
    ];
});
define("ux/styles/peace", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "star": {
                "fill": {
                    "color": "rgba(182,74,9,0.2635968300410687)"
                },
                "opacity": 1,
                "stroke": {
                    "color": "rgba(49,14,23,0.6699808995760113)",
                    "width": 3.4639032010315107
                },
                "radius": 6.63376222856383,
                "radius2": 0,
                "points": 3
            },
            "text": {
                "fill": {
                    "color": "rgba(207,45,78,0.44950090791791375)"
                },
                "stroke": {
                    "color": "rgba(233,121,254,0.3105821877136521)",
                    "width": 4.019676388210171
                },
                "text": "Test",
                "offset-x": 0,
                "offset-y": 14.239434215855646,
                "font": "18px fantasy"
            }
        }
    ];
});
define("ux/styles/text/text", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "text": {
                "fill": {
                    "color": "rgba(75,92,85,0.85)"
                },
                "stroke": {
                    "color": "rgba(255,255,255,1)",
                    "width": 2
                },
                "offset-x": 0,
                "offset-y": 17,
                "text": "fantasy light",
                "font": "lighter 18px fantasy" //weight + size + font
            }
        }
    ];
});
define("ux - Copy/styles/4star", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "star": {
                "fill": {
                    "color": "rgba(238,162,144,0.4)"
                },
                "opacity": 1,
                "stroke": {
                    "color": "rgba(169,141,168,0.8)",
                    "width": 5
                },
                "radius": 13,
                "radius2": 7,
                "points": 4
            }
        }
    ];
});
define("ux - Copy/styles/6star", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "star": {
                "fill": {
                    "color": "rgba(54,47,234,1)"
                },
                "stroke": {
                    "color": "rgba(75,92,105,0.85)",
                    "width": 4
                },
                "radius": 9,
                "radius2": 0,
                "points": 6
            }
        }
    ];
});
define("ux - Copy/styles/alert", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "circle": {
                "fill": {
                    "color": "rgba(197,37,84,0.9684230581506159)"
                },
                "opacity": 1,
                "stroke": {
                    "color": "rgba(227,83,105,0.9911592437357548)",
                    "width": 4.363895186012079
                },
                "radius": 7.311000259153705
            },
            "text": {
                "fill": {
                    "color": "rgba(205,86,109,0.8918881202751567)"
                },
                "stroke": {
                    "color": "rgba(252,175,131,0.46245606098317293)",
                    "width": 1.9329284004109581
                },
                "text": "Test",
                "offset-x": 0,
                "offset-y": 19.909814762842267,
                "font": "18px fantasy"
            }
        }
    ];
});
define("ux - Copy/styles/cold", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "star": {
                "fill": {
                    "color": "rgb(127,220,241)"
                },
                "opacity": 0.5,
                "stroke": {
                    "color": "rgb(160,164,166)",
                    "width": 3
                },
                "radius": 11,
                "radius2": 5,
                "points": 12
            }
        }
    ];
});
define("ux - Copy/styles/flower", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "star": {
                "fill": {
                    "color": "rgba(106,9,251,0.736280404819044)"
                },
                "opacity": 1,
                "stroke": {
                    "color": "rgba(42,128,244,0.8065839214705285)",
                    "width": 8.199150828494362
                },
                "radius": 13.801178106456376,
                "radius2": 9.103803658902862,
                "points": 10
            }
        }
    ];
});
define("ux - Copy/styles/peace", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "star": {
                "fill": {
                    "color": "rgba(182,74,9,0.2635968300410687)"
                },
                "opacity": 1,
                "stroke": {
                    "color": "rgba(49,14,23,0.6699808995760113)",
                    "width": 3.4639032010315107
                },
                "radius": 6.63376222856383,
                "radius2": 0,
                "points": 3
            },
            "text": {
                "fill": {
                    "color": "rgba(207,45,78,0.44950090791791375)"
                },
                "stroke": {
                    "color": "rgba(233,121,254,0.3105821877136521)",
                    "width": 4.019676388210171
                },
                "text": "Test",
                "offset-x": 0,
                "offset-y": 14.239434215855646,
                "font": "18px fantasy"
            }
        }
    ];
});
define("ux - Copy/styles/text/text", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "text": {
                "fill": {
                    "color": "rgba(75,92,85,0.85)"
                },
                "stroke": {
                    "color": "rgba(255,255,255,1)",
                    "width": 2
                },
                "offset-x": 0,
                "offset-y": 17,
                "text": "fantasy light",
                "font": "lighter 18px fantasy" //weight + size + font
            }
        }
    ];
});
