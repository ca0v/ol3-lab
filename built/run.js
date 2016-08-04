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
            xmlHttp.open("POST", url, true);
            xmlHttp.send(JSON.stringify(args));
        }
        return d;
    }
    exports.post = post;
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
                g.decode;
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
            false && service.nearest([34.85, -82.4]).then(function (result) { return console.log("nearest", result); });
        };
        return Osrm;
    }());
    return Osrm;
});
define("app", ["require", "exports", "mapquest-traffic-proxy", "mapquest-geocoding-proxy", "mapquest-search-proxy", "osrm-proxy", "jquery", "resize-sensor"], function (require, exports, Traffic, Geocoding, Search, Osrm, $, ResizeSensor) {
    "use strict";
    var Tests = (function () {
        function Tests() {
        }
        Tests.prototype.resize = function (map) {
            console.log("map should become portrait in 3 seconds");
            setTimeout(function () { return $(".map").addClass("portrait"); }, 3000);
            console.log("map should become landscape in 5 seconds");
            setTimeout(function () { return $(".map").removeClass("portrait"); }, 5000);
            console.log("map should become resize aware in 7 seconds");
            setTimeout(function () {
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
        Osrm.test();
        Search.test();
        Geocoding.test();
        Traffic.test();
        tests.resize(map);
    }
    return run;
});
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
define("mapquest-optimized-route-proxy", ["require", "exports", "ajax"], function (require, exports, ajax) {
    "use strict";
    var MapQuestKey = "cwm3pF5yuEGNp54sh96TF0irs5kCLd5y";
    var Route = (function () {
        function Route() {
            this.sessionId = "";
        }
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
            return ajax.post(url + "?key=" + req.key, {
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
            "hasBridge": false,
            "computedWaypoints": [],
            "fuelUsed": 0,
            "hasTunnel": false,
            "hasUnpaved": false,
            "hasHighway": false,
            "realTime": 0,
            "boundingBox": {
                "ul": {
                    "lng": -82.401672,
                    "lat": 34.845546
                },
                "lr": {
                    "lng": -82.401672,
                    "lat": 34.845546
                }
            },
            "distance": 0,
            "time": 0,
            "locationSequence": [0, 1],
            "hasSeasonalClosure": false,
            "sessionId": "579fc301-01c4-0004-02b7-3f82-00163e0300b8",
            "locations": [{
                    "latLng": {
                        "lng": -82.401672,
                        "lat": 34.845546
                    },
                    "adminArea4": "Greenville",
                    "adminArea5Type": "City",
                    "adminArea4Type": "County",
                    "adminArea5": "Greenville",
                    "street": "567 S Main St",
                    "adminArea1": "US",
                    "adminArea3": "SC",
                    "type": "s",
                    "displayLatLng": {
                        "lng": -82.401672,
                        "lat": 34.845546
                    },
                    "linkId": 51023925,
                    "postalCode": "29601-2504",
                    "sideOfStreet": "L",
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
                    "street": "554 S Main St",
                    "adminArea1": "US",
                    "adminArea3": "SC",
                    "type": "s",
                    "displayLatLng": {
                        "lng": -82.401674,
                        "lat": 34.845547
                    },
                    "linkId": 51023925,
                    "postalCode": "29601-2503",
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
                    "hasBridge": false,
                    "hasTunnel": false,
                    "roadGradeStrategy": [
                        []
                    ],
                    "hasHighway": false,
                    "hasUnpaved": false,
                    "distance": 0,
                    "time": 0,
                    "origIndex": -1,
                    "hasSeasonalClosure": false,
                    "origNarrative": "",
                    "hasCountryCross": false,
                    "formattedTime": "00:00:00",
                    "destNarrative": "",
                    "destIndex": -1,
                    "maneuvers": [{
                            "signs": [],
                            "index": 0,
                            "maneuverNotes": [],
                            "direction": 3,
                            "narrative": "The origin and destination are essentially the same place.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-start_sm.gif",
                            "distance": 0,
                            "time": 0,
                            "linkIds": [],
                            "streets": ["S Main St"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:00:00",
                            "directionName": "Northeast",
                            "mapUrl": "http://www.mapquestapi.com/staticmap/v4/getmap?key=cwm3pF5yuEGNp54sh96TF0irs5kCLd5y&type=map&size=225,160&pois=purple-1,34.845546,-82.40167199999999,0,0|&center=34.845546,-82.40167199999999&zoom=15&rand=1537905868&session=579fc301-01c4-0004-02b7-3f82-00163e0300b8",
                            "startPoint": {
                                "lng": -82.401672,
                                "lat": 34.845546
                            },
                            "turnType": 2
                        },
                        {
                            "signs": [],
                            "index": 1,
                            "maneuverNotes": [],
                            "direction": 0,
                            "narrative": "554 S MAIN ST is on the left.",
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
                                "lng": -82.401672,
                                "lat": 34.845546
                            },
                            "turnType": -1
                        }],
                    "hasFerry": false
                }],
            "formattedTime": "00:00:00",
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
                "walkingSpeed": -1,
                "stateBoundaryDisplay": true,
                "maxLinkId": 0,
                "arteryWeights": [],
                "tryAvoidLinkIds": [],
                "unit": "M",
                "routeNumber": 0,
                "doReverseGeocode": true,
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
                "text": "© 2016 MapQuest, Inc.",
                "imageUrl": "http://api.mqcdn.com/res/mqlogo.gif",
                "imageAltText": "© 2016 MapQuest, Inc."
            },
            "statuscode": 0,
            "messages": []
        }
    };
});
define("data/route_03", ["require", "exports"], function (require, exports) {
    "use strict";
    return {
        "route": {
            "hasTollRoad": false,
            "hasBridge": false,
            "computedWaypoints": [],
            "fuelUsed": 0,
            "hasTunnel": false,
            "hasUnpaved": false,
            "hasHighway": false,
            "realTime": 0,
            "boundingBox": {
                "ul": {
                    "lng": -82.401672,
                    "lat": 34.845546
                },
                "lr": {
                    "lng": -82.401672,
                    "lat": 34.845546
                }
            },
            "distance": 0,
            "time": 0,
            "locationSequence": [0, 1],
            "hasSeasonalClosure": false,
            "sessionId": "579fc66c-0390-0001-02b7-78ea-00163e3f3cf3",
            "locations": [{
                    "latLng": {
                        "lng": -82.401672,
                        "lat": 34.845546
                    },
                    "adminArea4": "Greenville",
                    "adminArea5Type": "City",
                    "adminArea4Type": "County",
                    "adminArea5": "Greenville",
                    "street": "567 S Main St",
                    "adminArea1": "US",
                    "adminArea3": "SC",
                    "type": "s",
                    "displayLatLng": {
                        "lng": -82.401672,
                        "lat": 34.845546
                    },
                    "linkId": 51023925,
                    "postalCode": "29601-2504",
                    "sideOfStreet": "L",
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
                    "street": "554 S Main St",
                    "adminArea1": "US",
                    "adminArea3": "SC",
                    "type": "s",
                    "displayLatLng": {
                        "lng": -82.401674,
                        "lat": 34.845547
                    },
                    "linkId": 51023925,
                    "postalCode": "29601-2503",
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
                    "hasBridge": false,
                    "hasTunnel": false,
                    "roadGradeStrategy": [
                        []
                    ],
                    "hasHighway": false,
                    "hasUnpaved": false,
                    "distance": 0,
                    "time": 0,
                    "origIndex": -1,
                    "hasSeasonalClosure": false,
                    "origNarrative": "",
                    "hasCountryCross": false,
                    "formattedTime": "00:00:00",
                    "destNarrative": "",
                    "destIndex": -1,
                    "maneuvers": [{
                            "signs": [],
                            "index": 0,
                            "maneuverNotes": [],
                            "direction": 3,
                            "narrative": "The origin and destination are essentially the same place.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-start_sm.gif",
                            "distance": 0,
                            "time": 0,
                            "linkIds": [],
                            "streets": ["S Main St"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:00:00",
                            "directionName": "Northeast",
                            "mapUrl": "http://www.mapquestapi.com/staticmap/v4/getmap?key=cwm3pF5yuEGNp54sh96TF0irs5kCLd5y&type=map&size=225,160&pois=purple-1,34.845546,-82.40167199999999,0,0|&center=34.845546,-82.40167199999999&zoom=15&rand=1786526989&session=579fc66c-0390-0001-02b7-78ea-00163e3f3cf3",
                            "startPoint": {
                                "lng": -82.401672,
                                "lat": 34.845546
                            },
                            "turnType": 2
                        },
                        {
                            "signs": [],
                            "index": 1,
                            "maneuverNotes": [],
                            "direction": 0,
                            "narrative": "554 S MAIN ST is on the left.",
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
                                "lng": -82.401672,
                                "lat": 34.845546
                            },
                            "turnType": -1
                        }],
                    "hasFerry": false
                }],
            "formattedTime": "00:00:00",
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
                "walkingSpeed": -1,
                "stateBoundaryDisplay": true,
                "maxLinkId": 0,
                "arteryWeights": [],
                "tryAvoidLinkIds": [],
                "unit": "M",
                "routeNumber": 0,
                "doReverseGeocode": true,
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
                "text": "© 2016 MapQuest, Inc.",
                "imageUrl": "http://api.mqcdn.com/res/mqlogo.gif",
                "imageAltText": "© 2016 MapQuest, Inc."
            },
            "statuscode": 0,
            "messages": []
        }
    };
});
define("data/route_04", ["require", "exports"], function (require, exports) {
    "use strict";
    return {
        "route": {
            "hasTollRoad": true,
            "hasBridge": true,
            "computedWaypoints": [],
            "fuelUsed": 61.08,
            "shape": {
                "maneuverIndexes": [0, 3, 6, 9, 16, 20, 31, 37, 40, 43, 47, 68, 112, 266, 317, 322, 726, 1071, 1081, 1364, 2607, 2836, 2844, 2867, 2871, 2876, 2881, 3001, 3017, 3029, 3038, 3042, 3047, 3406, 3606, 3752, 3937, 4045, 4049],
                "shapePoints": [34.790672, -82.407676, 34.791465, -82.407936, 34.791774, -82.40866, 34.791774, -82.40866, 34.791465, -82.410713, 34.79071, -82.411811, 34.79071, -82.411811, 34.78852, -82.414115, 34.787902, -82.415168, 34.787902, -82.415168, 34.78857, -82.415596, 34.791408, -82.416847, 34.793861, -82.419006, 34.797557, -82.421356, 34.798877, -82.422737, 34.799873, -82.424446, 34.799873, -82.424446, 34.80167, -82.424133, 34.80392, -82.423469, 34.807411, -82.421798, 34.807411, -82.421798, 34.807895, -82.422035, 34.809406, -82.421936, 34.817108, -82.419311, 34.81863, -82.418472, 34.819698, -82.417564, 34.823398, -82.413398, 34.826889, -82.410057, 34.828369, -82.408966, 34.831047, -82.4057, 34.832126, -82.404014, 34.832126, -82.404014, 34.834873, -82.405517, 34.839363, -82.406455, 34.841873, -82.406387, 34.842742, -82.405845, 34.84452, -82.404212, 34.84452, -82.404212, 34.844757, -82.402526, 34.845546, -82.401672, 34.845546, -82.401672, 34.846393, -82.40097, 34.852485, -82.398162, 34.852485, -82.398162, 34.851276, -82.394248, 34.851604, -82.391784, 34.852764, -82.386177, 34.852764, -82.386177, 34.853923, -82.383125, 34.854133, -82.380737, 34.853595, -82.377441, 34.852554, -82.37445, 34.851673, -82.370697, 34.851486, -82.369323, 34.851551, -82.368309, 34.852039, -82.366699, 34.853496, -82.363609, 34.856731, -82.359992, 34.85765, -82.358108, 34.857959, -82.356361, 34.858291, -82.349975, 34.858283, -82.348495, 34.858066, -82.346885, 34.853862, -82.333663, 34.853134, -82.332023, 34.838741, -82.31298, 34.837509, -82.310836, 34.835521, -82.306022, 34.835521, -82.306022, 34.834754, -82.304458, 34.833976, -82.302307, 34.832603, -82.299789, 34.832195, -82.298767, 34.832042, -82.297271, 34.83237, -82.295982, 34.833023, -82.295013, 34.834766, -82.293701, 34.835773, -82.292465, 34.840679, -82.284698, 34.841804, -82.283309, 34.843685, -82.281898, 34.84896, -82.279258, 34.850517, -82.278335, 34.851978, -82.276916, 34.852943, -82.275459, 34.853672, -82.273757, 34.869354, -82.230865, 34.884948, -82.194671, 34.885883, -82.191055, 34.890716, -82.163665, 34.891235, -82.162193, 34.891815, -82.161071, 34.897289, -82.152488, 34.898723, -82.149124, 34.899581, -82.145492, 34.902355, -82.128013, 34.903045, -82.125495, 34.903961, -82.123222, 34.905162, -82.121055, 34.92369, -82.092178, 34.932437, -82.080436, 34.934001, -82.078758, 34.935787, -82.077308, 34.948173, -82.070037, 34.950103, -82.068725, 34.952339, -82.066566, 34.958141, -82.058959, 34.959041, -82.05764, 34.959823, -82.056091, 34.962253, -82.049171, 34.962947, -82.045875, 34.963466, -82.039237, 34.963466, -82.039237, 34.963882, -82.034652, 34.964363, -82.033004, 34.965084, -82.031532, 34.965843, -82.030448, 34.975055, -82.01976, 34.976085, -82.018302, 34.9766, -82.017303, 34.977329, -82.01519, 34.979095, -82.007118, 34.97974, -82.005439, 34.980388, -82.004371, 34.981605, -82.003082, 34.982913, -82.002258, 34.983833, -82.001914, 34.98846, -82.000808, 34.989665, -82.000175, 34.990467, -81.999542, 35.010746, -81.978149, 35.01152, -81.977172, 35.012306, -81.975509, 35.012702, -81.973213, 35.01258, -81.952232, 35.011051, -81.914413, 35.011238, -81.91143, 35.011814, -81.908828, 35.012809, -81.906265, 35.023418, -81.886268, 35.024623, -81.883468, 35.03067, -81.859321, 35.036006, -81.83715, 35.037498, -81.832511, 35.056388, -81.786308, 35.071235, -81.76123, 35.072288, -81.75888, 35.07299, -81.755821, 35.077079, -81.725494, 35.080757, -81.710304, 35.08155, -81.70803, 35.082683, -81.705543, 35.094909, -81.683715, 35.095932, -81.681228, 35.096687, -81.678558, 35.097122, -81.675994, 35.09727, -81.672866, 35.096401, -81.659973, 35.096393, -81.6585, 35.096626, -81.656425, 35.097389, -81.653678, 35.101169, -81.644737, 35.10184, -81.642578, 35.102199, -81.639884, 35.102878, -81.622375, 35.10334, -81.620437, 35.105953, -81.614433, 35.109672, -81.603637, 35.109954, -81.60157, 35.11042, -81.588333, 35.110797, -81.586174, 35.111415, -81.584526, 35.11222, -81.583099, 35.120323, -81.573242, 35.121257, -81.571891, 35.122455, -81.569702, 35.123424, -81.567276, 35.129539, -81.548583, 35.137237, -81.517364, 35.13779, -81.515525, 35.143817, -81.502258, 35.158687, -81.477493, 35.159545, -81.475723, 35.160022, -81.474021, 35.160236, -81.471878, 35.16014, -81.470321, 35.159072, -81.463691, 35.159107, -81.462242, 35.159412, -81.460411, 35.159942, -81.458786, 35.160472, -81.457717, 35.165657, -81.449211, 35.167022, -81.446144, 35.167858, -81.443092, 35.170112, -81.43325, 35.171554, -81.425659, 35.172298, -81.423171, 35.173027, -81.42163, 35.173931, -81.420219, 35.182865, -81.409347, 35.191532, -81.397987, 35.193344, -81.395042, 35.196311, -81.388229, 35.196666, -81.386795, 35.199115, -81.371696, 35.200309, -81.367965, 35.201751, -81.365158, 35.227764, -81.330627, 35.228805, -81.328887, 35.233783, -81.318656, 35.235671, -81.315528, 35.236713, -81.314254, 35.238109, -81.312866, 35.240993, -81.310562, 35.243122, -81.308105, 35.244747, -81.305938, 35.24905, -81.299278, 35.2537, -81.29438, 35.258499, -81.287742, 35.259685, -81.285758, 35.260425, -81.283859, 35.26094, -81.28157, 35.261817, -81.270698, 35.262241, -81.268241, 35.263011, -81.265357, 35.274696, -81.235206, 35.284965, -81.204521, 35.285438, -81.202568, 35.285785, -81.200027, 35.285854, -81.197631, 35.285667, -81.195175, 35.284961, -81.191856, 35.282482, -81.184692, 35.282123, -81.18235, 35.282432, -81.18016, 35.283641, -81.176742, 35.283882, -81.175689, 35.283954, -81.174034, 35.28371, -81.172561, 35.283233, -81.171302, 35.282283, -81.169891, 35.274555, -81.163352, 35.273372, -81.161888, 35.272777, -81.16056, 35.270404, -81.153045, 35.267456, -81.146347, 35.266635, -81.143783, 35.265811, -81.139938, 35.26012, -81.104629, 35.260078, -81.102691, 35.260253, -81.10131, 35.26398, -81.086944, 35.264293, -81.084983, 35.264038, -81.063499, 35.263637, -81.059631, 35.262611, -81.055519, 35.261638, -81.053001, 35.257274, -81.043777, 35.256526, -81.041069, 35.256397, -81.038711, 35.258052, -81.006431, 35.258007, -81.001495, 35.257366, -80.995071, 35.256103, -80.988586, 35.254611, -80.983558, 35.25251, -80.977951, 35.25251, -80.977951, 35.251186, -80.975639, 35.248226, -80.971778, 35.247573, -80.970458, 35.247413, -80.969306, 35.247596, -80.968299, 35.248023, -80.96746, 35.24879, -80.966796, 35.249481, -80.966583, 35.250392, -80.966567, 35.255908, -80.96762, 35.258026, -80.967704, 35.278907, -80.965591, 35.284847, -80.965461, 35.286636, -80.965148, 35.28804, -80.964683, 35.289577, -80.964027, 35.291183, -80.963043, 35.298236, -80.957611, 35.300544, -80.956321, 35.304958, -80.954383, 35.307811, -80.952636, 35.318889, -80.943801, 35.32072, -80.942001, 35.322059, -80.940246, 35.323131, -80.938423, 35.327575, -80.928466, 35.328357, -80.925888, 35.329772, -80.918609, 35.330421, -80.916564, 35.33126, -80.914627, 35.33279, -80.912071, 35.334125, -80.910354, 35.337989, -80.906494, 35.338645, -80.905502, 35.339305, -80.90409, 35.339809, -80.902389, 35.340042, -80.900375, 35.339473, -80.892456, 35.339561, -80.890678, 35.339988, -80.888252, 35.340614, -80.886283, 35.341312, -80.884704, 35.343406, -80.881332, 35.344203, -80.879661, 35.346267, -80.872299, 35.347209, -80.869972, 35.348541, -80.867568, 35.350143, -80.86547, 35.358928, -80.856895, 35.360576, -80.855026, 35.360576, -80.855026, 35.361488, -80.853294, 35.361965, -80.851844, 35.36219, -80.850654, 35.362407, -80.847251, 35.362407, -80.847251, 35.362731, -80.841949, 35.362957, -80.84082, 35.363323, -80.840171, 35.363845, -80.83966, 35.364597, -80.839332, 35.365287, -80.83934, 35.366085, -80.839691, 35.367919, -80.841728, 35.368862, -80.842552, 35.376605, -80.84732, 35.379219, -80.848526, 35.382125, -80.849143, 35.385719, -80.849311, 35.387763, -80.849708, 35.389968, -80.850524, 35.395538, -80.853912, 35.398918, -80.855377, 35.401374, -80.856002, 35.412147, -80.857955, 35.415191, -80.858818, 35.418159, -80.860107, 35.429733, -80.86631, 35.432266, -80.867332, 35.43404, -80.867851, 35.436832, -80.868362, 35.439022, -80.868499, 35.445232, -80.868515, 35.448394, -80.869056, 35.450622, -80.869865, 35.460536, -80.874656, 35.462257, -80.875183, 35.464782, -80.875518, 35.474437, -80.874847, 35.484416, -80.874732, 35.485626, -80.874595, 35.486877, -80.874206, 35.500984, -80.867187, 35.503093, -80.866363, 35.517292, -80.865104, 35.549629, -80.858009, 35.551395, -80.857749, 35.554233, -80.857704, 35.56068, -80.858551, 35.563205, -80.858528, 35.565128, -80.858169, 35.573276, -80.855926, 35.575035, -80.855667, 35.576725, -80.855644, 35.578887, -80.855934, 35.59309, -80.859672, 35.596656, -80.860061, 35.59962, -80.859817, 35.614448, -80.857154, 35.615798, -80.857086, 35.617145, -80.857238, 35.618881, -80.857742, 35.626281, -80.861251, 35.629646, -80.862396, 35.632381, -80.862976, 35.640121, -80.864082, 35.644622, -80.864707, 35.646297, -80.864768, 35.648395, -80.864532, 35.649967, -80.86412, 35.655811, -80.861427, 35.657974, -80.86071, 35.660766, -80.860206, 35.666225, -80.859634, 35.66896, -80.85894, 35.671634, -80.857772, 35.680068, -80.853302, 35.681247, -80.85289, 35.682941, -80.852584, 35.684803, -80.852661, 35.68692, -80.853233, 35.695732, -80.857749, 35.697368, -80.858367, 35.698371, -80.858573, 35.700405, -80.858627, 35.702083, -80.858299, 35.708118, -80.85559, 35.709865, -80.855094, 35.71157, -80.854949, 35.713844, -80.855308, 35.722122, -80.857307, 35.726169, -80.857955, 35.777656, -80.863578, 35.7802, -80.863517, 35.802055, -80.861495, 35.847515, -80.858963, 35.849155, -80.859016, 35.850997, -80.859283, 35.852428, -80.859703, 35.854278, -80.860534, 35.859687, -80.863388, 35.861763, -80.864051, 35.876293, -80.866058, 35.879058, -80.866226, 35.881874, -80.866027, 35.884109, -80.8656, 35.887935, -80.864273, 35.894729, -80.860847, 35.896415, -80.859718, 35.901035, -80.855812, 35.902465, -80.854988, 35.904731, -80.854171, 35.907279, -80.853881, 35.931167, -80.855369, 35.93378, -80.855201, 35.935691, -80.854728, 35.960983, -80.846473, 35.963645, -80.84513, 35.97232, -80.839454, 35.974315, -80.83847, 35.976329, -80.837844, 35.978378, -80.837562, 35.980503, -80.837608, 35.982055, -80.837867, 35.98788, -80.839408, 35.989997, -80.839653, 35.99213, -80.839561, 35.994651, -80.838958, 36.012313, -80.831443, 36.014636, -80.83023, 36.016895, -80.828788, 36.018829, -80.827308, 36.025741, -80.821235, 36.028129, -80.819854, 36.030418, -80.819038, 36.033111, -80.818634, 36.036102, -80.818847, 36.049091, -80.82228, 36.051261, -80.822601, 36.071224, -80.821937, 36.073585, -80.821456, 36.075309, -80.8208, 36.091068, -80.813064, 36.092792, -80.812469, 36.095088, -80.812088, 36.096961, -80.812072, 36.116241, -80.814071, 36.119384, -80.814048, 36.123424, -80.813423, 36.139896, -80.808944, 36.144165, -80.808219, 36.149787, -80.807807, 36.164424, -80.80796, 36.167598, -80.808227, 36.170108, -80.808738, 36.171974, -80.80928, 36.178325, -80.811645, 36.181522, -80.812194, 36.184234, -80.812179, 36.206466, -80.810714, 36.209327, -80.810623, 36.212768, -80.810737, 36.217525, -80.811279, 36.223514, -80.812606, 36.242668, -80.81874, 36.255966, -80.822273, 36.264247, -80.824928, 36.265136, -80.825103, 36.269256, -80.825355, 36.271636, -80.825248, 36.274433, -80.824592, 36.27695, -80.823478, 36.2957, -80.812667, 36.306373, -80.805801, 36.312126, -80.803443, 36.313251, -80.802864, 36.314975, -80.80162, 36.318229, -80.798889, 36.320903, -80.797088, 36.323703, -80.795631, 36.327594, -80.794219, 36.330104, -80.793739, 36.332504, -80.793632, 36.344398, -80.79454, 36.346214, -80.794822, 36.348327, -80.79541, 36.353534, -80.797531, 36.355384, -80.798095, 36.358074, -80.798431, 36.36127, -80.798225, 36.363346, -80.797767, 36.365131, -80.797134, 36.366897, -80.796211, 36.371894, -80.792915, 36.374729, -80.791526, 36.376956, -80.790687, 36.380279, -80.789855, 36.392913, -80.787673, 36.397827, -80.786384, 36.403411, -80.784278, 36.407249, -80.78244, 36.411308, -80.780708, 36.424438, -80.776153, 36.426959, -80.775695, 36.429309, -80.775772, 36.431228, -80.776191, 36.435375, -80.777786, 36.437427, -80.778121, 36.439151, -80.778015, 36.441204, -80.777404, 36.457008, -80.769134, 36.458389, -80.768264, 36.459644, -80.767211, 36.460929, -80.765815, 36.466186, -80.75856, 36.467597, -80.757156, 36.469039, -80.756156, 36.470363, -80.755516, 36.485347, -80.75016, 36.487064, -80.749244, 36.488803, -80.747566, 36.490844, -80.744354, 36.491924, -80.743019, 36.493324, -80.741859, 36.494567, -80.741218, 36.495464, -80.740943, 36.496356, -80.740783, 36.497566, -80.740783, 36.506233, -80.741676, 36.51403, -80.742195, 36.515026, -80.7425, 36.533317, -80.750259, 36.534908, -80.750686, 36.536056, -80.75074, 36.537197, -80.750617, 36.538925, -80.750083, 36.550674, -80.743309, 36.551937, -80.742736, 36.55344, -80.742408, 36.554809, -80.742424, 36.555839, -80.742637, 36.559658, -80.744232, 36.561061, -80.744659, 36.563217, -80.744819, 36.585891, -80.74176, 36.589847, -80.741699, 36.59428, -80.742332, 36.595745, -80.742301, 36.597167, -80.741798, 36.598438, -80.740844, 36.601451, -80.736938, 36.602306, -80.736137, 36.603427, -80.735565, 36.60416, -80.735412, 36.605533, -80.735511, 36.606529, -80.735931, 36.611614, -80.739074, 36.613048, -80.739715, 36.614696, -80.74002, 36.615707, -80.739982, 36.616973, -80.739715, 36.618568, -80.73896, 36.620101, -80.737686, 36.620914, -80.736679, 36.625022, -80.730422, 36.627136, -80.728294, 36.630195, -80.726325, 36.63108, -80.725601, 36.632022, -80.724449, 36.633598, -80.721832, 36.634429, -80.720764, 36.635627, -80.719711, 36.641906, -80.714988, 36.643215, -80.71331, 36.645179, -80.709701, 36.64672, -80.707855, 36.647663, -80.707038, 36.649932, -80.705688, 36.652412, -80.705108, 36.654277, -80.705131, 36.656688, -80.705802, 36.659828, -80.707771, 36.662075, -80.708763, 36.66452, -80.709098, 36.668392, -80.708595, 36.671016, -80.708656, 36.673728, -80.70932, 36.67527, -80.709999, 36.677074, -80.71109, 36.679069, -80.712753, 36.680644, -80.71453, 36.695064, -80.734558, 36.697353, -80.737014, 36.699195, -80.73841, 36.701545, -80.739639, 36.718051, -80.745468, 36.719619, -80.74617, 36.721523, -80.747306, 36.724208, -80.749511, 36.726314, -80.751907, 36.72821, -80.754852, 36.732948, -80.763275, 36.734012, -80.764648, 36.735717, -80.766387, 36.737163, -80.767524, 36.738872, -80.768547, 36.749847, -80.773971, 36.75164, -80.77539, 36.752582, -80.776504, 36.753509, -80.777984, 36.758625, -80.789726, 36.759815, -80.791961, 36.761646, -80.794464, 36.766399, -80.799667, 36.768093, -80.801994, 36.769001, -80.80352, 36.775699, -80.816246, 36.779846, -80.825279, 36.781784, -80.828361, 36.783329, -80.830192, 36.784954, -80.831718, 36.791557, -80.837066, 36.794326, -80.839607, 36.806251, -80.851966, 36.807861, -80.853408, 36.809696, -80.854331, 36.810764, -80.854576, 36.812274, -80.854621, 36.813472, -80.854393, 36.814491, -80.853996, 36.81826, -80.851844, 36.819389, -80.851364, 36.820575, -80.851325, 36.823139, -80.852157, 36.82386, -80.852226, 36.829078, -80.851333, 36.830425, -80.85144, 36.831768, -80.851997, 36.839218, -80.856185, 36.845409, -80.858955, 36.85503, -80.863777, 36.858325, -80.865951, 36.863677, -80.870368, 36.8652, -80.871307, 36.866611, -80.871864, 36.867847, -80.872138, 36.869113, -80.8722, 36.876499, -80.871559, 36.87878, -80.872108, 36.884037, -80.874092, 36.886684, -80.87474, 36.890476, -80.875183, 36.898742, -80.875221, 36.900466, -80.875495, 36.901741, -80.875991, 36.903415, -80.877067, 36.905059, -80.878799, 36.915016, -80.893455, 36.916938, -80.895942, 36.931053, -80.910614, 36.932727, -80.912033, 36.934894, -80.913482, 36.948837, -80.921173, 36.950096, -80.92221, 36.950584, -80.922912, 36.951133, -80.924324, 36.951293, -80.925872, 36.95119, -80.926864, 36.95071, -80.928291, 36.948886, -80.931449, 36.948276, -80.932762, 36.947277, -80.935966, 36.946701, -80.939636, 36.946334, -80.94596, 36.942344, -80.969566, 36.941459, -80.972915, 36.938274, -80.981536, 36.937599, -80.984199, 36.93729, -80.986358, 36.93716, -80.988609, 36.937301, -80.99327, 36.937656, -80.996482, 36.938484, -81.001304, 36.939018, -81.002883, 36.940517, -81.00621, 36.940967, -81.007881, 36.94107, -81.009376, 36.94107, -81.020851, 36.941238, -81.022048, 36.941917, -81.023643, 36.943946, -81.025947, 36.944889, -81.027465, 36.945388, -81.028961, 36.946693, -81.034744, 36.946762, -81.036949, 36.94596, -81.042243, 36.94585, -81.04454, 36.945995, -81.04631, 36.946712, -81.050003, 36.947555, -81.051666, 36.948356, -81.052589, 36.949104, -81.053184, 36.950542, -81.053817, 36.95404, -81.054794, 36.9552, -81.055389, 36.956504, -81.05635, 36.957355, -81.057182, 36.958377, -81.058532, 36.959709, -81.061271, 36.959709, -81.061271, 36.960838, -81.063209, 36.961872, -81.064254, 36.962814, -81.06488, 36.964275, -81.065414, 36.973896, -81.067802, 36.977642, -81.069282, 36.979293, -81.070137, 36.991046, -81.077232, 36.993469, -81.079078, 36.996131, -81.081878, 36.998287, -81.084999, 37.004169, -81.096511, 37.005344, -81.098258, 37.007453, -81.100357, 37.013935, -81.106109, 37.015338, -81.106773, 37.016857, -81.106979, 37.022014, -81.106201, 37.023273, -81.106239, 37.024818, -81.106719, 37.026214, -81.10765, 37.027187, -81.108695, 37.028152, -81.110404, 37.030395, -81.117599, 37.031166, -81.119453, 37.032119, -81.121246, 37.04327, -81.137321, 37.044166, -81.138259, 37.045227, -81.1389, 37.046134, -81.139152, 37.047088, -81.139183, 37.048526, -81.13874, 37.061855, -81.129081, 37.06462, -81.127731, 37.067337, -81.126899, 37.070697, -81.126525, 37.085731, -81.126312, 37.093814, -81.128028, 37.104785, -81.128852, 37.10596, -81.128662, 37.107231, -81.128196, 37.112468, -81.124755, 37.11478, -81.123649, 37.126003, -81.120429, 37.129009, -81.120178, 37.131542, -81.120536, 37.136131, -81.121826, 37.137287, -81.122497, 37.138351, -81.123573, 37.13911, -81.124855, 37.139579, -81.126251, 37.139797, -81.127616, 37.139781, -81.128906, 37.139427, -81.131889, 37.139675, -81.134117, 37.140136, -81.135398, 37.140651, -81.136291, 37.141471, -81.13726, 37.142215, -81.137855, 37.143379, -81.138389, 37.155151, -81.141624, 37.159225, -81.142204, 37.162017, -81.142211, 37.165023, -81.141876, 37.169017, -81.140846, 37.171646, -81.139793, 37.176963, -81.137115, 37.18119, -81.134971, 37.182804, -81.133956, 37.188739, -81.128677, 37.190395, -81.126716, 37.191787, -81.124038, 37.192394, -81.1221, 37.193687, -81.115089, 37.194206, -81.113777, 37.194965, -81.112533, 37.195728, -81.111656, 37.196788, -81.110816, 37.200447, -81.108993, 37.20166, -81.108161, 37.203212, -81.106819, 37.204418, -81.105506, 37.205711, -81.103729, 37.212017, -81.09375, 37.213367, -81.092445, 37.214542, -81.091835, 37.215488, -81.09159, 37.216262, -81.091506, 37.217132, -81.091613, 37.233627, -81.095748, 37.234565, -81.096061, 37.235404, -81.096542, 37.236736, -81.097915, 37.237525, -81.099418, 37.240421, -81.110099, 37.241046, -81.111305, 37.241687, -81.11206, 37.242973, -81.112899, 37.245834, -81.113563, 37.247623, -81.114204, 37.258083, -81.120147, 37.259479, -81.120613, 37.265022, -81.121376, 37.286518, -81.12577, 37.287792, -81.125755, 37.288753, -81.125434, 37.290122, -81.124374, 37.290779, -81.12342, 37.291198, -81.122467, 37.292568, -81.116706, 37.294841, -81.110046, 37.295352, -81.105621, 37.29589, -81.103706, 37.29676, -81.102302, 37.298538, -81.10025, 37.300876, -81.095405, 37.301582, -81.094215, 37.303127, -81.092826, 37.304428, -81.092224, 37.30537, -81.091567, 37.306049, -81.090667, 37.306427, -81.089797, 37.308784, -81.073707, 37.309234, -81.071403, 37.311611, -81.0625, 37.312088, -81.061462, 37.312927, -81.060356, 37.313835, -81.059646, 37.314956, -81.059188, 37.315883, -81.059089, 37.318275, -81.059158, 37.321006, -81.058013, 37.322566, -81.057678, 37.323936, -81.057945, 37.326328, -81.059349, 37.328041, -81.059944, 37.329814, -81.059974, 37.33319, -81.058975, 37.334354, -81.05883, 37.335502, -81.059135, 37.337478, -81.060363, 37.338287, -81.0606, 37.343811, -81.0606, 37.344577, -81.060325, 37.345275, -81.059837, 37.347469, -81.056716, 37.348007, -81.056236, 37.348808, -81.055793, 37.349662, -81.055572, 37.350532, -81.055587, 37.353027, -81.056564, 37.354175, -81.056861, 37.355201, -81.056816, 37.356563, -81.056251, 37.357585, -81.05532, 37.362545, -81.048698, 37.363746, -81.047515, 37.364479, -81.047012, 37.36623, -81.046295, 37.370449, -81.045181, 37.374851, -81.043022, 37.376113, -81.042747, 37.377231, -81.042785, 37.378597, -81.043167, 37.379936, -81.04393, 37.380771, -81.044593, 37.382148, -81.046066, 37.383563, -81.048141, 37.386734, -81.054367, 37.387386, -81.055313, 37.388431, -81.056449, 37.389663, -81.057418, 37.395507, -81.061363, 37.397319, -81.062202, 37.3992, -81.062301, 37.405136, -81.060737, 37.407089, -81.060707, 37.412967, -81.061759, 37.414253, -81.062255, 37.418346, -81.064384, 37.419887, -81.064994, 37.422458, -81.065727, 37.425003, -81.065986, 37.427379, -81.065948, 37.43066, -81.065666, 37.439971, -81.064224, 37.440937, -81.064346, 37.441635, -81.064605, 37.443969, -81.066001, 37.445678, -81.06636, 37.446765, -81.066223, 37.455154, -81.06414, 37.456455, -81.063995, 37.458286, -81.06401, 37.459339, -81.064147, 37.460197, -81.064445, 37.46236, -81.0662, 37.463298, -81.066665, 37.470928, -81.067115, 37.472183, -81.067413, 37.473331, -81.067932, 37.474658, -81.06887, 37.481651, -81.07521, 37.485294, -81.078132, 37.48656, -81.079498, 37.487571, -81.081146, 37.492679, -81.091133, 37.493358, -81.093521, 37.493743, -81.097038, 37.494148, -81.098915, 37.495086, -81.101226, 37.49652, -81.104019, 37.49802, -81.106513, 37.500244, -81.109527, 37.502326, -81.111602, 37.505413, -81.113731, 37.506034, -81.114494, 37.508224, -81.118438, 37.508842, -81.119041, 37.509952, -81.11956, 37.51136, -81.119598, 37.512783, -81.118934, 37.523082, -81.109542, 37.524711, -81.108695, 37.525955, -81.108459, 37.527561, -81.108619, 37.529079, -81.109298, 37.532329, -81.112152, 37.533573, -81.112876, 37.54079, -81.115447, 37.542377, -81.115791, 37.544353, -81.115638, 37.553256, -81.113464, 37.554897, -81.113189, 37.556972, -81.113067, 37.561748, -81.113204, 37.565895, -81.112564, 37.567691, -81.112442, 37.569309, -81.112556, 37.5708, -81.112846, 37.572429, -81.113388, 37.576965, -81.115325, 37.578807, -81.116348, 37.580158, -81.117347, 37.588256, -81.12458, 37.58974, -81.125625, 37.592117, -81.126602, 37.594089, -81.127014, 37.595149, -81.127082, 37.597488, -81.126899, 37.599365, -81.126403, 37.600807, -81.125801, 37.609264, -81.121444, 37.611007, -81.120697, 37.613697, -81.119819, 37.618034, -81.118774, 37.621383, -81.11763, 37.624553, -81.116096, 37.629238, -81.113128, 37.631992, -81.111602, 37.63589, -81.110191, 37.63842, -81.109596, 37.640743, -81.109283, 37.652656, -81.108367, 37.653808, -81.108688, 37.654544, -81.109107, 37.661865, -81.114463, 37.663436, -81.115242, 37.664699, -81.115463, 37.665611, -81.115417, 37.666744, -81.115127, 37.669166, -81.114112, 37.670139, -81.113853, 37.671127, -81.113822, 37.6721, -81.114013, 37.673065, -81.114463, 37.673881, -81.115081, 37.678176, -81.12017, 37.684486, -81.126159, 37.685817, -81.127273, 37.687129, -81.128059, 37.688163, -81.128486, 37.689994, -81.128906, 37.693412, -81.12931, 37.694068, -81.129539, 37.695072, -81.130187, 37.69561, -81.130729, 37.696342, -81.131828, 37.697856, -81.1361, 37.698699, -81.137542, 37.709655, -81.15039, 37.710552, -81.151107, 37.711372, -81.151428, 37.713768, -81.151473, 37.714962, -81.151771, 37.715808, -81.152252, 37.716888, -81.153335, 37.71767, -81.154762, 37.71809, -81.156433, 37.718109, -81.161552, 37.718357, -81.163116, 37.721431, -81.17205, 37.722766, -81.178924, 37.723888, -81.182365, 37.72834, -81.191604, 37.731933, -81.200782, 37.732704, -81.202415, 37.733489, -81.203559, 37.734405, -81.204551, 37.738117, -81.207115, 37.739822, -81.20787, 37.741611, -81.208114, 37.749637, -81.206695, 37.750492, -81.206619, 37.751369, -81.206741, 37.752197, -81.207099, 37.752952, -81.207687, 37.755882, -81.210876, 37.75708, -81.211898, 37.762161, -81.214355, 37.766963, -81.21804, 37.768352, -81.218681, 37.769786, -81.219085, 37.776664, -81.220718, 37.778396, -81.220924, 37.786914, -81.220458, 37.788967, -81.219886, 37.78984, -81.219444, 37.791191, -81.218437, 37.794574, -81.21495, 37.796043, -81.213676, 37.798091, -81.212554, 37.800083, -81.212051, 37.804786, -81.211807, 37.807479, -81.21183, 37.809001, -81.212013, 37.810916, -81.212554, 37.8152, -81.214538, 37.816303, -81.214874, 37.817512, -81.215034, 37.819129, -81.214904, 37.828571, -81.21305, 37.830696, -81.213104, 37.832988, -81.21379, 37.832988, -81.21379, 37.835231, -81.214523, 37.836421, -81.214332, 37.84027, -81.211723, 37.845806, -81.207572, 37.846767, -81.20671, 37.84761, -81.205375, 37.852287, -81.193962, 37.852943, -81.192657, 37.853931, -81.191169, 37.853931, -81.191169, 37.855396, -81.18959, 37.857177, -81.188293, 37.859367, -81.1874, 37.861072, -81.187179, 37.863422, -81.187385, 37.877048, -81.190429, 37.878883, -81.190673, 37.884922, -81.190338, 37.886569, -81.189956, 37.888004, -81.189208, 37.889087, -81.188323, 37.893161, -81.184204, 37.902442, -81.175773, 37.906749, -81.171234, 37.908256, -81.169891, 37.913555, -81.166099, 37.914669, -81.165786, 37.91809, -81.165687, 37.919265, -81.1651, 37.919998, -81.16426, 37.921325, -81.16159, 37.922058, -81.160507, 37.923534, -81.158988, 37.924976, -81.158081, 37.926715, -81.157554, 37.928295, -81.157478, 37.944004, -81.158767, 37.945652, -81.15879, 37.948497, -81.158332, 37.953517, -81.156631, 37.955856, -81.155754, 37.957084, -81.154769, 37.957725, -81.153877, 37.958168, -81.152931, 37.959434, -81.149246, 37.959976, -81.148483, 37.960746, -81.14785, 37.962375, -81.147315, 37.963352, -81.147163, 37.96714, -81.147232, 37.969432, -81.147758, 37.970138, -81.147735, 37.970817, -81.147476, 37.971454, -81.146987, 37.972076, -81.146224, 37.973506, -81.142868, 37.974216, -81.141632, 37.975055, -81.140892, 37.976047, -81.14051, 37.977214, -81.140617, 37.984191, -81.143783, 37.985271, -81.144012, 37.988166, -81.143821, 38.002288, -81.142333, 38.003429, -81.14167, 38.004287, -81.140495, 38.005817, -81.135398, 38.009269, -81.128608, 38.011688, -81.125106, 38.0125, -81.124343, 38.013332, -81.123817, 38.014202, -81.123504, 38.015392, -81.123382, 38.039749, -81.12265, 38.042133, -81.122467, 38.044441, -81.121856, 38.04636, -81.120979, 38.048305, -81.119697, 38.049797, -81.118408, 38.051372, -81.11663, 38.052825, -81.11444, 38.063243, -81.093399, 38.072498, -81.075653, 38.073818, -81.073722, 38.076839, -81.070266, 38.079948, -81.06636, 38.091354, -81.049957, 38.092941, -81.047325, 38.094852, -81.043441, 38.096317, -81.039474, 38.097404, -81.035491, 38.098957, -81.027641, 38.099514, -81.026092, 38.100475, -81.024253, 38.102066, -81.022171, 38.109882, -81.015487, 38.112003, -81.013153, 38.113178, -81.011283, 38.121253, -80.996032, 38.122913, -80.991996, 38.123836, -80.988525, 38.124404, -80.984779, 38.126453, -80.966377, 38.127124, -80.963172, 38.128021, -80.960548, 38.139133, -80.93708, 38.139774, -80.935951, 38.140941, -80.934509, 38.142261, -80.933448, 38.146572, -80.931541, 38.147891, -80.930618, 38.14925, -80.92913, 38.15295, -80.923912, 38.15343, -80.922882, 38.153858, -80.921447, 38.155372, -80.911026, 38.15604, -80.90895, 38.157173, -80.90673, 38.158824, -80.904632, 38.16043, -80.903274, 38.175338, -80.89537, 38.177001, -80.894172, 38.178375, -80.892868, 38.179519, -80.89154, 38.180694, -80.889862, 38.195022, -80.864181, 38.196601, -80.86174, 38.198253, -80.85984, 38.199752, -80.858512, 38.208976, -80.852149, 38.21059, -80.851478, 38.212306, -80.85128, 38.219184, -80.851997, 38.220928, -80.851921, 38.222793, -80.851264, 38.226242, -80.848968, 38.227333, -80.848632, 38.228343, -80.848587, 38.229785, -80.848968, 38.235363, -80.851905, 38.247604, -80.857444, 38.249279, -80.857566, 38.258914, -80.856147, 38.260066, -80.85569, 38.261127, -80.85501, 38.265193, -80.850738, 38.265895, -80.849548, 38.266361, -80.848213, 38.266967, -80.84465, 38.267341, -80.843475, 38.26836, -80.841728, 38.26926, -80.840858, 38.273811, -80.837562, 38.275974, -80.836341, 38.284687, -80.832794, 38.287277, -80.832214, 38.289703, -80.83216, 38.304988, -80.833663, 38.30812, -80.833847, 38.312282, -80.833633, 38.315608, -80.833633, 38.328544, -80.832809, 38.330104, -80.832839, 38.331291, -80.833084, 38.336601, -80.83493, 38.339736, -80.835578, 38.355674, -80.836898, 38.357215, -80.836891, 38.35828, -80.836585, 38.359359, -80.835884, 38.365871, -80.830528, 38.367908, -80.828514, 38.369403, -80.826599, 38.376682, -80.815643, 38.378772, -80.813369, 38.379898, -80.812568, 38.381534, -80.811759, 38.382743, -80.811393, 38.387928, -80.810485, 38.389369, -80.810104, 38.391265, -80.809394, 38.393676, -80.808113, 38.395362, -80.806922, 38.397193, -80.805351, 38.402168, -80.799934, 38.403511, -80.798667, 38.405521, -80.797416, 38.410446, -80.795372, 38.411388, -80.794837, 38.41254, -80.793884, 38.419029, -80.78749, 38.420597, -80.786239, 38.421676, -80.785873, 38.422763, -80.785835, 38.443115, -80.787292, 38.444831, -80.78778, 38.447914, -80.789115, 38.449462, -80.789253, 38.45018, -80.789077, 38.451091, -80.788612, 38.457576, -80.784034, 38.458747, -80.783401, 38.459709, -80.78321, 38.46397, -80.78305, 38.465126, -80.782432, 38.467662, -80.779937, 38.468986, -80.779083, 38.470066, -80.7789, 38.472515, -80.779037, 38.473827, -80.778533, 38.474937, -80.777435, 38.47863, -80.772155, 38.479225, -80.771118, 38.479621, -80.76979, 38.48019, -80.765762, 38.480648, -80.763816, 38.48138, -80.762168, 38.482448, -80.760658, 38.48344, -80.759727, 38.484199, -80.759223, 38.485839, -80.758567, 38.48751, -80.758438, 38.490421, -80.758705, 38.49242, -80.758705, 38.495311, -80.758102, 38.497333, -80.757278, 38.498802, -80.756469, 38.500106, -80.75563, 38.502109, -80.754058, 38.506866, -80.749122, 38.508697, -80.746551, 38.51089, -80.742454, 38.511978, -80.737197, 38.512519, -80.735511, 38.513446, -80.733894, 38.514373, -80.732894, 38.515815, -80.731971, 38.518295, -80.731346, 38.519119, -80.73101, 38.521747, -80.729011, 38.522747, -80.728485, 38.523788, -80.728279, 38.525741, -80.728195, 38.526893, -80.727828, 38.5279, -80.727005, 38.53046, -80.724174, 38.533996, -80.722145, 38.535251, -80.721595, 38.536243, -80.721527, 38.537097, -80.721763, 38.537746, -80.722137, 38.539783, -80.723808, 38.5405, -80.724212, 38.541484, -80.724433, 38.542682, -80.724258, 38.543415, -80.723869, 38.544178, -80.723175, 38.546142, -80.719818, 38.546947, -80.718833, 38.550205, -80.716468, 38.551048, -80.716003, 38.55175, -80.715835, 38.552505, -80.71585, 38.553237, -80.716072, 38.553993, -80.716522, 38.554645, -80.717185, 38.555965, -80.719253, 38.556838, -80.720291, 38.561225, -80.724578, 38.565994, -80.728691, 38.567203, -80.7304, 38.570407, -80.736778, 38.571052, -80.73751, 38.572174, -80.738159, 38.573238, -80.738296, 38.579772, -80.737297, 38.58078, -80.737304, 38.583606, -80.737777, 38.584999, -80.737632, 38.59077, -80.735519, 38.595676, -80.73246, 38.597305, -80.731964, 38.598438, -80.731986, 38.599437, -80.732276, 38.604705, -80.735038, 38.605884, -80.735832, 38.607257, -80.737098, 38.609031, -80.739593, 38.609771, -80.741294, 38.611858, -80.747741, 38.612464, -80.749008, 38.614234, -80.751937, 38.614234, -80.751937, 38.615581, -80.753921, 38.616081, -80.754333, 38.616985, -80.75444, 38.617801, -80.753898, 38.618175, -80.753204, 38.618282, -80.752639, 38.618545, -80.746688, 38.619216, -80.744636, 38.620079, -80.743293, 38.623737, -80.738639, 38.625816, -80.73442, 38.62664, -80.733108, 38.628326, -80.731376, 38.630458, -80.73014, 38.631927, -80.729682, 38.633346, -80.729492, 38.63816, -80.729927, 38.64326, -80.728782, 38.644229, -80.72882, 38.645076, -80.72908, 38.64606, -80.72969, 38.647071, -80.730812, 38.650085, -80.736495, 38.650756, -80.737586, 38.651824, -80.738815, 38.652992, -80.739669, 38.654029, -80.74015, 38.655788, -80.740386, 38.657138, -80.740013, 38.658077, -80.739379, 38.658565, -80.738868, 38.660942, -80.734748, 38.661968, -80.733512, 38.66299, -80.732841, 38.667781, -80.730506, 38.669456, -80.729209, 38.670631, -80.727828, 38.671531, -80.726127, 38.671878, -80.724853, 38.672374, -80.721321, 38.672657, -80.720352, 38.673217, -80.719184, 38.674106, -80.718101, 38.676284, -80.716369, 38.677024, -80.71553, 38.677593, -80.714553, 38.679935, -80.709426, 38.686836, -80.698966, 38.687557, -80.697578, 38.688232, -80.695541, 38.688499, -80.693611, 38.688892, -80.684974, 38.689239, -80.681579, 38.690284, -80.677536, 38.691524, -80.674797, 38.693271, -80.672431, 38.699279, -80.666374, 38.706462, -80.659934, 38.707885, -80.659049, 38.708686, -80.658729, 38.710662, -80.658416, 38.712162, -80.658584, 38.717563, -80.66027, 38.719047, -80.661018, 38.720848, -80.662574, 38.722011, -80.664169, 38.72293, -80.666061, 38.724067, -80.669662, 38.724807, -80.670928, 38.72554, -80.671737, 38.727046, -80.672676, 38.73191, -80.673873, 38.733459, -80.674468, 38.736633, -80.676818, 38.737789, -80.677467, 38.739212, -80.677764, 38.740291, -80.67765, 38.741161, -80.677345, 38.743377, -80.676116, 38.744606, -80.675849, 38.745769, -80.675926, 38.749183, -80.676719, 38.752998, -80.676811, 38.754394, -80.677253, 38.762741, -80.681655, 38.763782, -80.682029, 38.764686, -80.682136, 38.766155, -80.681892, 38.7677, -80.680969, 38.76873, -80.679763, 38.770187, -80.677474, 38.771347, -80.675994, 38.772647, -80.674659, 38.774291, -80.673324, 38.777084, -80.671783, 38.784397, -80.669273, 38.785865, -80.667976, 38.787269, -80.665786, 38.78823, -80.664695, 38.789356, -80.663932, 38.790576, -80.663528, 38.791992, -80.663528, 38.794506, -80.663902, 38.79552, -80.663848, 38.796718, -80.663444, 38.799064, -80.661994, 38.800312, -80.661666, 38.801429, -80.661682, 38.805614, -80.662261, 38.806602, -80.662551, 38.807525, -80.663047, 38.808376, -80.663787, 38.810195, -80.665794, 38.812137, -80.667182, 38.814243, -80.66809, 38.81628, -80.668357, 38.817916, -80.668144, 38.821975, -80.666625, 38.824249, -80.666175, 38.826927, -80.666069, 38.828155, -80.666168, 38.830604, -80.667045, 38.831611, -80.667213, 38.832633, -80.667106, 38.834663, -80.666358, 38.835838, -80.666122, 38.838794, -80.666328, 38.840522, -80.666206, 38.853569, -80.664192, 38.855072, -80.663619, 38.85688, -80.662376, 38.857959, -80.661239, 38.858646, -80.660285, 38.864189, -80.649932, 38.864902, -80.649093, 38.867324, -80.64698, 38.868259, -80.645935, 38.869201, -80.644577, 38.870189, -80.642616, 38.871772, -80.637992, 38.872322, -80.636947, 38.872997, -80.636123, 38.875854, -80.633995, 38.878543, -80.631401, 38.880401, -80.63018, 38.881683, -80.629646, 38.882858, -80.629364, 38.88676, -80.629554, 38.888111, -80.629119, 38.888763, -80.628684, 38.890899, -80.626701, 38.893924, -80.624969, 38.896194, -80.622993, 38.899646, -80.621109, 38.900833, -80.619667, 38.901855, -80.617202, 38.903881, -80.608375, 38.904472, -80.606521, 38.905006, -80.605613, 38.905712, -80.604804, 38.906532, -80.604194, 38.908344, -80.603233, 38.909488, -80.602149, 38.910728, -80.599891, 38.912078, -80.596099, 38.912513, -80.594398, 38.912696, -80.592819, 38.912433, -80.586204, 38.912548, -80.584983, 38.912994, -80.583457, 38.914245, -80.580886, 38.914573, -80.579872, 38.915035, -80.574966, 38.916519, -80.570899, 38.917129, -80.568527, 38.917263, -80.566864, 38.916885, -80.56298, 38.917015, -80.561347, 38.917743, -80.559303, 38.919887, -80.555931, 38.921184, -80.551376, 38.921619, -80.550453, 38.922386, -80.549423, 38.923736, -80.548385, 38.926578, -80.547027, 38.928676, -80.544769, 38.929828, -80.54393, 38.931053, -80.543563, 38.933734, -80.543716, 38.934638, -80.543586, 38.938083, -80.542015, 38.941562, -80.541473, 38.942752, -80.541046, 38.944068, -80.539909, 38.94651, -80.535934, 38.947132, -80.535278, 38.947971, -80.534683, 38.948944, -80.534324, 38.949726, -80.53424, 38.952411, -80.534637, 38.953308, -80.534614, 38.954124, -80.534378, 38.955089, -80.533813, 38.955913, -80.532966, 38.957439, -80.53054, 38.959091, -80.528625, 38.959945, -80.52732, 38.960342, -80.526283, 38.960567, -80.525161, 38.960613, -80.524063, 38.960346, -80.520736, 38.960536, -80.51918, 38.960983, -80.517868, 38.961498, -80.51696, 38.962116, -80.516204, 38.96315, -80.515373, 38.964126, -80.514968, 38.966934, -80.51435, 38.970176, -80.512237, 38.971824, -80.511512, 38.973552, -80.511146, 38.97731, -80.511154, 38.978275, -80.510932, 38.979381, -80.510307, 38.981201, -80.508621, 38.981983, -80.508094, 38.988273, -80.505706, 38.989669, -80.505584, 38.992584, -80.506202, 38.993915, -80.505905, 38.999618, -80.501579, 39.005096, -80.498619, 39.011722, -80.494308, 39.012569, -80.493659, 39.013263, -80.492881, 39.013679, -80.49221, 39.014179, -80.490921, 39.014419, -80.489212, 39.014244, -80.487403, 39.013099, -80.482093, 39.012989, -80.480751, 39.013145, -80.479003, 39.014305, -80.472434, 39.014392, -80.47039, 39.014312, -80.468963, 39.014041, -80.467674, 39.012104, -80.462753, 39.01173, -80.461494, 39.011489, -80.458915, 39.01197, -80.455635, 39.012584, -80.453247, 39.013084, -80.451942, 39.014186, -80.450126, 39.01704, -80.447036, 39.017608, -80.446067, 39.018081, -80.444656, 39.018249, -80.443099, 39.01807, -80.441535, 39.016483, -80.437217, 39.016174, -80.435501, 39.01625, -80.433799, 39.016765, -80.432014, 39.017311, -80.431083, 39.018253, -80.430076, 39.025722, -80.424446, 39.028388, -80.423133, 39.038105, -80.41957, 39.039119, -80.418861, 39.04132, -80.416831, 39.043449, -80.415298, 39.044223, -80.414535, 39.044891, -80.413558, 39.046478, -80.410392, 39.04943, -80.407051, 39.051578, -80.402755, 39.05286, -80.40113, 39.053718, -80.400512, 39.054653, -80.400108, 39.055633, -80.399925, 39.056869, -80.400039, 39.060546, -80.401641, 39.065185, -80.402442, 39.066196, -80.402915, 39.068683, -80.404487, 39.069591, -80.404861, 39.071479, -80.405212, 39.073368, -80.405052, 39.074306, -80.404762, 39.075614, -80.404121, 39.090293, -80.394271, 39.091629, -80.393478, 39.093128, -80.392807, 39.094833, -80.392288, 39.096141, -80.392074, 39.106109, -80.391914, 39.1086, -80.391578, 39.11082, -80.390815, 39.115692, -80.388565, 39.117164, -80.388031, 39.126216, -80.385513, 39.127464, -80.385017, 39.128711, -80.384201, 39.129753, -80.383186, 39.133571, -80.377716, 39.136478, -80.374839, 39.137275, -80.373542, 39.138622, -80.370368, 39.139129, -80.369537, 39.143875, -80.364143, 39.145076, -80.363403, 39.147205, -80.362838, 39.147972, -80.362464, 39.148796, -80.361686, 39.150791, -80.359245, 39.152572, -80.357879, 39.153774, -80.357368, 39.157924, -80.356185, 39.159198, -80.355552, 39.160293, -80.354804, 39.164844, -80.350303, 39.167575, -80.346839, 39.168819, -80.345664, 39.173892, -80.34336, 39.175128, -80.342658, 39.17992, -80.338638, 39.181579, -80.337463, 39.182685, -80.337013, 39.185485, -80.336456, 39.18629, -80.335968, 39.187206, -80.334762, 39.189636, -80.329528, 39.192623, -80.325126, 39.195991, -80.318374, 39.196636, -80.317199, 39.198223, -80.31491, 39.200092, -80.312927, 39.201557, -80.311752, 39.20708, -80.308601, 39.211158, -80.305252, 39.212127, -80.304718, 39.213073, -80.30445, 39.217548, -80.304275, 39.218807, -80.303848, 39.219707, -80.303237, 39.220516, -80.302429, 39.224525, -80.297851, 39.225837, -80.297012, 39.226959, -80.296707, 39.236091, -80.295989, 39.238159, -80.295272, 39.239032, -80.2947, 39.240081, -80.293739, 39.24599, -80.28717, 39.247753, -80.285865, 39.24995, -80.284934, 39.252143, -80.284599, 39.254257, -80.284904, 39.25605, -80.285583, 39.260272, -80.287879, 39.261936, -80.288551, 39.263648, -80.288848, 39.265701, -80.288734, 39.267166, -80.288322, 39.285598, -80.281562, 39.287059, -80.280891, 39.290096, -80.279075, 39.290916, -80.278724, 39.292148, -80.278404, 39.292999, -80.27835, 39.293994, -80.278419, 39.296886, -80.279022, 39.29953, -80.278991, 39.301856, -80.278358, 39.30434, -80.276908, 39.305622, -80.275817, 39.307029, -80.274208, 39.308067, -80.272651, 39.309135, -80.270484, 39.309707, -80.268867, 39.310264, -80.266494, 39.311172, -80.25875, 39.31145, -80.257331, 39.312114, -80.255653, 39.313983, -80.252792, 39.315471, -80.249794, 39.316375, -80.248458, 39.32048, -80.243759, 39.321537, -80.242073, 39.322994, -80.238952, 39.323867, -80.237594, 39.325241, -80.236305, 39.328346, -80.23484, 39.329666, -80.233787, 39.330844, -80.2322, 39.332988, -80.227973, 39.334114, -80.226058, 39.335613, -80.224235, 39.337234, -80.222953, 39.339565, -80.2219, 39.363845, -80.214271, 39.365676, -80.21392, 39.372364, -80.213203, 39.376342, -80.212257, 39.385364, -80.208694, 39.391368, -80.207145, 39.393291, -80.206077, 39.397006, -80.203079, 39.398784, -80.202178, 39.400299, -80.201919, 39.40179, -80.202079, 39.402832, -80.202438, 39.406402, -80.204299, 39.40747, -80.204521, 39.408523, -80.204345, 39.409484, -80.203842, 39.414096, -80.200698, 39.416431, -80.199546, 39.418609, -80.198822, 39.4248, -80.197555, 39.426673, -80.196662, 39.427886, -80.195709, 39.429141, -80.19429, 39.430305, -80.192298, 39.43309, -80.185203, 39.43383, -80.184112, 39.436092, -80.181411, 39.437137, -80.179656, 39.442268, -80.169456, 39.446235, -80.162651, 39.450626, -80.153236, 39.452186, -80.150398, 39.454006, -80.14804, 39.459911, -80.142242, 39.461437, -80.140548, 39.467609, -80.132293, 39.468505, -80.130821, 39.469509, -80.128562, 39.471973, -80.121078, 39.472633, -80.119529, 39.473815, -80.117523, 39.476013, -80.114822, 39.476554, -80.113891, 39.477092, -80.112129, 39.477401, -80.10913, 39.477725, -80.107627, 39.48122, -80.100753, 39.482196, -80.098991, 39.482822, -80.098167, 39.483814, -80.097213, 39.487228, -80.094787, 39.488346, -80.093086, 39.488845, -80.091369, 39.489383, -80.08612, 39.489799, -80.083679, 39.49052, -80.081741, 39.491401, -80.0802, 39.493019, -80.078414, 39.502273, -80.071792, 39.504051, -80.070823, 39.508922, -80.06871, 39.510421, -80.067733, 39.512008, -80.065956, 39.515346, -80.060157, 39.515975, -80.058525, 39.516422, -80.056381, 39.516857, -80.049369, 39.517105, -80.047866, 39.517776, -80.045768, 39.519805, -80.041473, 39.520427, -80.038864, 39.520526, -80.03688, 39.520278, -80.033546, 39.52032, -80.031929, 39.521533, -80.024063, 39.521583, -80.022605, 39.521301, -80.020812, 39.520233, -80.017578, 39.520011, -80.015663, 39.520263, -80.013793, 39.521114, -80.011871, 39.522323, -80.010589, 39.526226, -80.008819, 39.527183, -80.00811, 39.527881, -80.007324, 39.528751, -80.005729, 39.530979, -79.999183, 39.531543, -79.997993, 39.532234, -79.997093, 39.532882, -79.99652, 39.535755, -79.994972, 39.536991, -79.993911, 39.540954, -79.987022, 39.542484, -79.985473, 39.54372, -79.984786, 39.545127, -79.984443, 39.551864, -79.985046, 39.552742, -79.985015, 39.559223, -79.983131, 39.566619, -79.981941, 39.567569, -79.98159, 39.568325, -79.981124, 39.573181, -79.976615, 39.57431, -79.975967, 39.575592, -79.975563, 39.576995, -79.975547, 39.578174, -79.975807, 39.579475, -79.976562, 39.581684, -79.978355, 39.582931, -79.978958, 39.591083, -79.979316, 39.592002, -79.97953, 39.592845, -79.979972, 39.593456, -79.980461, 39.594242, -79.981407, 39.597286, -79.986854, 39.598949, -79.989013, 39.599914, -79.98999, 39.601799, -79.991447, 39.603069, -79.992156, 39.604843, -79.99282, 39.606178, -79.993118, 39.607624, -79.99324, 39.609172, -79.993148, 39.610488, -79.992897, 39.620849, -79.988807, 39.623184, -79.988029, 39.6245, -79.987915, 39.626365, -79.988113, 39.628414, -79.989013, 39.630241, -79.990539, 39.642341, -80.004844, 39.643112, -80.005554, 39.643951, -80.006042, 39.644824, -80.006309, 39.648906, -80.006851, 39.649833, -80.007118, 39.65102, -80.007698, 39.653881, -80.009696, 39.655361, -80.010398, 39.656574, -80.010681, 39.661018, -80.011024, 39.661972, -80.011398, 39.662925, -80.012115, 39.663654, -80.013, 39.664188, -80.013977, 39.668582, -80.025962, 39.669067, -80.026939, 39.670066, -80.028129, 39.672271, -80.029571, 39.673156, -80.030418, 39.673931, -80.031501, 39.675998, -80.035118, 39.676994, -80.036308, 39.678409, -80.037544, 39.679962, -80.03849, 39.681621, -80.039077, 39.683021, -80.039299, 39.68592, -80.039344, 39.687313, -80.039657, 39.688419, -80.040222, 39.69091, -80.0419, 39.694618, -80.043273, 39.695674, -80.043823, 39.696838, -80.044624, 39.697982, -80.045669, 39.702865, -80.051902, 39.704559, -80.053512, 39.705471, -80.054153, 39.706764, -80.054794, 39.709861, -80.05558, 39.711196, -80.056205, 39.716453, -80.060539, 39.717983, -80.061347, 39.719326, -80.061599, 39.720691, -80.061462, 39.736061, -80.057411, 39.737312, -80.057312, 39.738689, -80.057708, 39.739616, -80.058357, 39.740497, -80.059379, 39.748565, -80.072792, 39.749851, -80.074562, 39.751914, -80.076667, 39.757431, -80.080879, 39.758579, -80.081611, 39.759452, -80.081871, 39.760437, -80.081893, 39.768272, -80.080352, 39.76968, -80.080261, 39.770877, -80.080398, 39.775619, -80.081779, 39.777599, -80.081809, 39.778526, -80.081588, 39.779663, -80.0811, 39.783489, -80.078567, 39.785045, -80.078033, 39.793464, -80.076904, 39.795154, -80.077064, 39.796424, -80.077461, 39.797348, -80.077926, 39.799194, -80.079338, 39.802772, -80.083374, 39.804431, -80.085983, 39.807888, -80.092445, 39.808876, -80.093681, 39.810016, -80.094429, 39.819477, -80.098953, 39.820938, -80.099838, 39.822368, -80.10115, 39.829311, -80.108955, 39.830692, -80.110153, 39.832054, -80.110961, 39.833797, -80.111587, 39.838317, -80.112174, 39.840831, -80.112838, 39.849212, -80.116676, 39.850868, -80.117897, 39.852954, -80.119888, 39.854347, -80.120834, 39.863189, -80.124412, 39.864662, -80.12519, 39.86639, -80.126792, 39.868919, -80.130096, 39.86972, -80.130767, 39.87062, -80.131233, 39.877056, -80.13298, 39.879276, -80.133209, 39.88544, -80.132873, 39.887741, -80.133346, 39.889381, -80.134124, 39.891315, -80.135635, 39.897396, -80.142517, 39.899269, -80.144447, 39.907363, -80.151428, 39.908649, -80.152946, 39.911689, -80.157333, 39.913734, -80.159637, 39.916225, -80.16156, 39.918548, -80.162704, 39.920166, -80.1632, 39.921806, -80.163459, 39.9239, -80.163467, 39.927227, -80.163146, 39.928428, -80.163246, 39.929306, -80.163482, 39.931236, -80.164505, 39.935832, -80.168388, 39.937503, -80.169212, 39.938678, -80.169464, 39.940166, -80.169448, 39.941631, -80.169059, 39.947765, -80.165565, 39.948837, -80.165084, 39.949905, -80.164978, 39.950744, -80.165153, 39.951927, -80.165817, 39.959102, -80.171264, 39.959941, -80.171768, 39.961002, -80.172195, 39.96585, -80.173492, 39.967655, -80.174171, 39.996673, -80.187812, 39.998252, -80.188423, 39.99937, -80.188659, 40.000732, -80.18872, 40.002426, -80.188476, 40.003864, -80.187965, 40.005134, -80.187187, 40.006645, -80.185577, 40.009597, -80.18061, 40.010318, -80.179649, 40.012001, -80.17797, 40.013584, -80.176933, 40.015766, -80.176094, 40.02219, -80.174308, 40.024215, -80.174102, 40.026176, -80.174316, 40.028053, -80.174911, 40.046741, -80.182769, 40.059211, -80.186302, 40.065242, -80.187263, 40.066593, -80.187591, 40.079483, -80.192207, 40.090145, -80.193099, 40.095539, -80.192939, 40.097625, -80.193351, 40.099277, -80.194107, 40.101211, -80.195587, 40.102142, -80.196601, 40.104995, -80.200363, 40.105945, -80.201232, 40.106983, -80.201904, 40.107807, -80.20227, 40.109012, -80.202568, 40.114101, -80.202598, 40.116878, -80.203201, 40.118949, -80.204078, 40.121524, -80.20549, 40.126766, -80.209121, 40.128364, -80.209617, 40.129188, -80.209655, 40.130279, -80.209487, 40.135845, -80.20729, 40.136966, -80.206977, 40.147388, -80.205802, 40.148788, -80.205398, 40.149612, -80.204917, 40.150714, -80.20388, 40.15829, -80.194335, 40.159252, -80.193603, 40.160213, -80.193176, 40.161422, -80.193092, 40.162265, -80.193336, 40.163379, -80.194183, 40.164264, -80.19561, 40.164672, -80.197151, 40.165153, -80.200103, 40.166, -80.201942, 40.167148, -80.203086, 40.170345, -80.205688, 40.171623, -80.207473, 40.175495, -80.218711, 40.176059, -80.220146, 40.176605, -80.221084, 40.177951, -80.222526, 40.180889, -80.224189, 40.182136, -80.225105, 40.183273, -80.22631, 40.184383, -80.22792, 40.185436, -80.230354, 40.188266, -80.242004, 40.188728, -80.243598, 40.189117, -80.244369, 40.189949, -80.245193, 40.191547, -80.245994, 40.198169, -80.248291, 40.199958, -80.248634, 40.202358, -80.248451, 40.203365, -80.248146, 40.204986, -80.24736, 40.206199, -80.246475, 40.207313, -80.245384, 40.208347, -80.244049, 40.209182, -80.242622, 40.210346, -80.239654, 40.210956, -80.236419, 40.211013, -80.233398, 40.210643, -80.227264, 40.210998, -80.225074, 40.211723, -80.223388, 40.212738, -80.222015, 40.218208, -80.215629, 40.219547, -80.214469, 40.221023, -80.213676, 40.230998, -80.211112, 40.233364, -80.210144, 40.242073, -80.204376, 40.242923, -80.203681, 40.243919, -80.202545, 40.244728, -80.201194, 40.24686, -80.196876, 40.251197, -80.190238, 40.25391, -80.183792, 40.256885, -80.180099, 40.258972, -80.174934, 40.259719, -80.173851, 40.262645, -80.170921, 40.26324, -80.16999, 40.263713, -80.168907, 40.265148, -80.164169, 40.265842, -80.16294, 40.267086, -80.161506, 40.269054, -80.16024, 40.272239, -80.158958, 40.275039, -80.158409, 40.27676, -80.158462, 40.277713, -80.15879, 40.278995, -80.159667, 40.286548, -80.167892, 40.28796, -80.169006, 40.288986, -80.169456, 40.290348, -80.169677, 40.291553, -80.16954, 40.297576, -80.167991, 40.299755, -80.16719, 40.301002, -80.166076, 40.306686, -80.159042, 40.308895, -80.156623, 40.319496, -80.146995, 40.321151, -80.14566, 40.334896, -80.135643, 40.337177, -80.133605, 40.338729, -80.131698, 40.339958, -80.129714, 40.344352, -80.121162, 40.345447, -80.119651, 40.34682, -80.118415, 40.348716, -80.117446, 40.350589, -80.117126, 40.351821, -80.117248, 40.357425, -80.118515, 40.359161, -80.118667, 40.368045, -80.118736, 40.369277, -80.1184, 40.370075, -80.117897, 40.371257, -80.116546, 40.372051, -80.114425, 40.372451, -80.107261, 40.372692, -80.106246, 40.373317, -80.104743, 40.374126, -80.103538, 40.375171, -80.102394, 40.38018, -80.097442, 40.381168, -80.096717, 40.38245, -80.096328, 40.383522, -80.096366, 40.384265, -80.096588, 40.393081, -80.100532, 40.394309, -80.101333, 40.398704, -80.104927, 40.400127, -80.105804, 40.40129, -80.106178, 40.408031, -80.107566, 40.409286, -80.10765, 40.410583, -80.107337, 40.411621, -80.106735, 40.415992, -80.103393, 40.417114, -80.102996, 40.41835, -80.102912, 40.420066, -80.103523, 40.422603, -80.105514, 40.423797, -80.106048, 40.424732, -80.106155, 40.427848, -80.106002, 40.429119, -80.106338, 40.429962, -80.106819, 40.432731, -80.109252, 40.433902, -80.110061, 40.435348, -80.110801, 40.437202, -80.111381, 40.439857, -80.111564, 40.447669, -80.110618, 40.459403, -80.111663, 40.463054, -80.111305, 40.464515, -80.11145, 40.46566, -80.111816, 40.4668, -80.112434, 40.471794, -80.115913, 40.490001, -80.125289, 40.491104, -80.125724, 40.492343, -80.125617, 40.493377, -80.124984, 40.4953, -80.122299, 40.496383, -80.121276, 40.497882, -80.120605, 40.499015, -80.120681, 40.499897, -80.121162, 40.500583, -80.121871, 40.501106, -80.122817, 40.501575, -80.12429, 40.501773, -80.12606, 40.501815, -80.133491, 40.50212, -80.135253, 40.502529, -80.136116, 40.503208, -80.136924, 40.503913, -80.13739, 40.504783, -80.137611, 40.505874, -80.137435, 40.522232, -80.131309, 40.526668, -80.1305, 40.527618, -80.129966, 40.530372, -80.127426, 40.531684, -80.126579, 40.541465, -80.121772, 40.542446, -80.12165, 40.54504, -80.12194, 40.54689, -80.121582, 40.547901, -80.121032, 40.552623, -80.117263, 40.553638, -80.116668, 40.554908, -80.116203, 40.562816, -80.11412, 40.564697, -80.113937, 40.566608, -80.114433, 40.570213, -80.1165, 40.571998, -80.117164, 40.572978, -80.117294, 40.576816, -80.117309, 40.578063, -80.116996, 40.579227, -80.116195, 40.579879, -80.115417, 40.580402, -80.114479, 40.583332, -80.104164, 40.583984, -80.1026, 40.584636, -80.101631, 40.585861, -80.100479, 40.590877, -80.097122, 40.594825, -80.094566, 40.596591, -80.093734, 40.598247, -80.09336, 40.599975, -80.09333, 40.633869, -80.097671, 40.637702, -80.09777, 40.639606, -80.097587, 40.642757, -80.096954, 40.660682, -80.090721, 40.662029, -80.090476, 40.663024, -80.090606, 40.663803, -80.090873, 40.674217, -80.095497, 40.675392, -80.095863, 40.676498, -80.095993, 40.677562, -80.095939, 40.682807, -80.095237, 40.684291, -80.095169, 40.685703, -80.09526, 40.687225, -80.095581, 40.690155, -80.096603, 40.696575, -80.099822, 40.698528, -80.100517, 40.70034, -80.100944, 40.704036, -80.101341, 40.708702, -80.101623, 40.715068, -80.101699, 40.722587, -80.101509, 40.725528, -80.101684, 40.727703, -80.102127, 40.730834, -80.103431, 40.735347, -80.104461, 40.739299, -80.106437, 40.741382, -80.107078, 40.743656, -80.10717, 40.748001, -80.106391, 40.74897, -80.106407, 40.750316, -80.106712, 40.751659, -80.107345, 40.75291, -80.108299, 40.754215, -80.109642, 40.756095, -80.111938, 40.759357, -80.116592, 40.764743, -80.125648, 40.76585, -80.127105, 40.766746, -80.127922, 40.767993, -80.128623, 40.770183, -80.129074, 40.772228, -80.128936, 40.77425, -80.12825, 40.77972, -80.124664, 40.781078, -80.123962, 40.782562, -80.123489, 40.783901, -80.123306, 40.785106, -80.123336, 40.786399, -80.123588, 40.789569, -80.124618, 40.790336, -80.124732, 40.791393, -80.124633, 40.792434, -80.124237, 40.79335, -80.123603, 40.794284, -80.122573, 40.796264, -80.119903, 40.797161, -80.119094, 40.798179, -80.118515, 40.799461, -80.118179, 40.809009, -80.116989, 40.809867, -80.116691, 40.81097, -80.115982, 40.811992, -80.114837, 40.812568, -80.113853, 40.814136, -80.110244, 40.814899, -80.109016, 40.815448, -80.108406, 40.816917, -80.107398, 40.820873, -80.105903, 40.825176, -80.102737, 40.826091, -80.102279, 40.827362, -80.102043, 40.828433, -80.102157, 40.829509, -80.102577, 40.833724, -80.104743, 40.83525, -80.10511, 40.836353, -80.104988, 40.837165, -80.104698, 40.839992, -80.10276, 40.84151, -80.102256, 40.849979, -80.102806, 40.851226, -80.103286, 40.857158, -80.107276, 40.859745, -80.108581, 40.865081, -80.11045, 40.86967, -80.111633, 40.874691, -80.113433, 40.879352, -80.114089, 40.881126, -80.114562, 40.89793, -80.122589, 40.899337, -80.122848, 40.904953, -80.122505, 40.906642, -80.122962, 40.90747, -80.123481, 40.908252, -80.124221, 40.91101, -80.128059, 40.912544, -80.129798, 40.914329, -80.131248, 40.916374, -80.132316, 40.918205, -80.132843, 40.920631, -80.132965, 40.927528, -80.131744, 40.928897, -80.131683, 40.93032, -80.131935, 40.938812, -80.134613, 40.940219, -80.135467, 40.941013, -80.136238, 40.944496, -80.141166, 40.945648, -80.142402, 40.946441, -80.142967, 40.947334, -80.143379, 40.948806, -80.143669, 40.95042, -80.143447, 40.951816, -80.142776, 40.958087, -80.136833, 40.959484, -80.135765, 40.960655, -80.135192, 40.967903, -80.132858, 40.969917, -80.132591, 40.984661, -80.132965, 40.986717, -80.132522, 40.988361, -80.131568, 40.99002, -80.129867, 40.990825, -80.128601, 40.993751, -80.122833, 40.994457, -80.121826, 40.995494, -80.120887, 40.996425, -80.120376, 41.002532, -80.118148, 41.007698, -80.114608, 41.008697, -80.114105, 41.010128, -80.113868, 41.012699, -80.114204, 41.023258, -80.115875, 41.024868, -80.11631, 41.026245, -80.116859, 41.032634, -80.119895, 41.033939, -80.120948, 41.038959, -80.125839, 41.040767, -80.126846, 41.041919, -80.127174, 41.043514, -80.127227, 41.051109, -80.126197, 41.063877, -80.122856, 41.06578, -80.12281, 41.067287, -80.123153, 41.069473, -80.124328, 41.088199, -80.13739, 41.089626, -80.138153, 41.102962, -80.143989, 41.104095, -80.144309, 41.117141, -80.146781, 41.118324, -80.147277, 41.126548, -80.151939, 41.128776, -80.152824, 41.12989, -80.152999, 41.135192, -80.153312, 41.140251, -80.154388, 41.153686, -80.156349, 41.154979, -80.156883, 41.177722, -80.168388, 41.179496, -80.168876, 41.180393, -80.168914, 41.181587, -80.168754, 41.183307, -80.16806, 41.193992, -80.161094, 41.194992, -80.16056, 41.197139, -80.159904, 41.201858, -80.159362, 41.203559, -80.159553, 41.204475, -80.159828, 41.210269, -80.162269, 41.213294, -80.163276, 41.21643, -80.163871, 41.21944, -80.164054, 41.22182, -80.163917, 41.224235, -80.163536, 41.235927, -80.160369, 41.238254, -80.160102, 41.240715, -80.160194, 41.243564, -80.160774, 41.26202, -80.165901, 41.264904, -80.166229, 41.267185, -80.165962, 41.269233, -80.165344, 41.282585, -80.158943, 41.284992, -80.15818, 41.287429, -80.157814, 41.304569, -80.157768, 41.318546, -80.159339, 41.322227, -80.159523, 41.343021, -80.158737, 41.354217, -80.159568, 41.357547, -80.159278, 41.365528, -80.157348, 41.368846, -80.157005, 41.371501, -80.157058, 41.373497, -80.157302, 41.381679, -80.158775, 41.386051, -80.158866, 41.389263, -80.158416, 41.399982, -80.15615, 41.402229, -80.15599, 41.404918, -80.156211, 41.407764, -80.156967, 41.409984, -80.157936, 41.416347, -80.161567, 41.418384, -80.162475, 41.421558, -80.16349, 41.424636, -80.164054, 41.428462, -80.164184, 41.431667, -80.163803, 41.433967, -80.163261, 41.44379, -80.160324, 41.445404, -80.160034, 41.447078, -80.159973, 41.449413, -80.160285, 41.451389, -80.160919, 41.460277, -80.164932, 41.462158, -80.165657, 41.464466, -80.166313, 41.467613, -80.166831, 41.471061, -80.166908, 41.490856, -80.166351, 41.493915, -80.166549, 41.495822, -80.166877, 41.498348, -80.167572, 41.507423, -80.17102, 41.509471, -80.171531, 41.510704, -80.171661, 41.512767, -80.1716, 41.514114, -80.171348, 41.521099, -80.169136, 41.522472, -80.169013, 41.523845, -80.169151, 41.525905, -80.169906, 41.527851, -80.171363, 41.535133, -80.180168, 41.536457, -80.181488, 41.537639, -80.182312, 41.538772, -80.182838, 41.539806, -80.183135, 41.541175, -80.183265, 41.542919, -80.183036, 41.549827, -80.181045, 41.55233, -80.180656, 41.555282, -80.180824, 41.569446, -80.182205, 41.570953, -80.182151, 41.571994, -80.181938, 41.573688, -80.181274, 41.590366, -80.172088, 41.597553, -80.167152, 41.599304, -80.166107, 41.602188, -80.165046, 41.604114, -80.164764, 41.606044, -80.164794, 41.608295, -80.165229, 41.61071, -80.166221, 41.612979, -80.167709, 41.614528, -80.169105, 41.616104, -80.170814, 41.617778, -80.173042, 41.621189, -80.178855, 41.626422, -80.185134, 41.630535, -80.189712, 41.641239, -80.20079, 41.642501, -80.201889, 41.643596, -80.202522, 41.645092, -80.203002, 41.671108, -80.208915, 41.673328, -80.209159, 41.675556, -80.208984, 41.677536, -80.208457, 41.702102, -80.199142, 41.70383, -80.198631, 41.705917, -80.198265, 41.707923, -80.198188, 41.709426, -80.198295, 41.712566, -80.198997, 41.713924, -80.199485, 41.724327, -80.204223, 41.725753, -80.204734, 41.727813, -80.204986, 41.729877, -80.204696, 41.731246, -80.204177, 41.732414, -80.203514, 41.737533, -80.199729, 41.739082, -80.198913, 41.740627, -80.198348, 41.743152, -80.197837, 41.762401, -80.194999, 41.764171, -80.194519, 41.76546, -80.193984, 41.767127, -80.193038, 41.768386, -80.1921, 41.781711, -80.181083, 41.784809, -80.178878, 41.787014, -80.177642, 41.78971, -80.17646, 41.792896, -80.175521, 41.795715, -80.175064, 41.79895, -80.174957, 41.810699, -80.175621, 41.827995, -80.174896, 41.830127, -80.17501, 41.838642, -80.175926, 41.841094, -80.175857, 41.84848, -80.175025, 41.849933, -80.174995, 41.851421, -80.175148, 41.85807, -80.17646, 41.859283, -80.176544, 41.873706, -80.176269, 41.882781, -80.175727, 41.905807, -80.175186, 41.919403, -80.176124, 41.921714, -80.175994, 41.934654, -80.174102, 41.946388, -80.173721, 41.956024, -80.1725, 41.958034, -80.172645, 41.96577, -80.174148, 41.976131, -80.17691, 41.97834, -80.177024, 41.980857, -80.176643, 41.983516, -80.175628, 41.986202, -80.173858, 42.005802, -80.1585, 42.00785, -80.156745, 42.009567, -80.154823, 42.01173, -80.151718, 42.013454, -80.148376, 42.021766, -80.127426, 42.022666, -80.125968, 42.023738, -80.124702, 42.025009, -80.123619, 42.026477, -80.122802, 42.026477, -80.122802, 42.028423, -80.121772, 42.029693, -80.120109, 42.030292, -80.119544, 42.03099, -80.119224, 42.032794, -80.118911, 42.033435, -80.1184, 42.033748, -80.117927, 42.043304, -80.097724, 42.052871, -80.071578, 42.054157, -80.068527, 42.056045, -80.064865, 42.071025, -80.037902, 42.07471, -80.032096, 42.091114, -80.009696, 42.093402, -80.005691, 42.100032, -79.991958, 42.101383, -79.989555, 42.122364, -79.957466, 42.124233, -79.954216, 42.134922, -79.933212, 42.159729, -79.878623, 42.161056, -79.875183, 42.167716, -79.85408, 42.168815, -79.85157, 42.169837, -79.849761, 42.171009, -79.848106, 42.172306, -79.846611, 42.180297, -79.839179, 42.181976, -79.837402, 42.194252, -79.821914, 42.202072, -79.813407, 42.223651, -79.785362, 42.22541, -79.783706, 42.227668, -79.782188, 42.229133, -79.781509, 42.236278, -79.778793, 42.237583, -79.778053, 42.239124, -79.776863, 42.240406, -79.775627, 42.250698, -79.763732, 42.254112, -79.759513, 42.255973, -79.756568, 42.25716, -79.754234, 42.261466, -79.74472, 42.262882, -79.742202, 42.265529, -79.738288, 42.267551, -79.734909, 42.269886, -79.73059, 42.270874, -79.728408, 42.273029, -79.722351, 42.276733, -79.706787, 42.277675, -79.703399, 42.278633, -79.700721, 42.279907, -79.697792, 42.281742, -79.694282, 42.287311, -79.685531, 42.288715, -79.683074, 42.290451, -79.67958, 42.292308, -79.674964, 42.300025, -79.653396, 42.301872, -79.649154, 42.306163, -79.64083, 42.307357, -79.638046, 42.31174, -79.624511, 42.313533, -79.620254, 42.314708, -79.618171, 42.316047, -79.61621, 42.323577, -79.606933, 42.327167, -79.601928, 42.340389, -79.580116, 42.341857, -79.576805, 42.342937, -79.573616, 42.345741, -79.56134, 42.347423, -79.555679, 42.349678, -79.549835, 42.355575, -79.53643, 42.357971, -79.531784, 42.360168, -79.528053, 42.367733, -79.516807, 42.374168, -79.506294, 42.377132, -79.500488, 42.380012, -79.493354, 42.382053, -79.489059, 42.383827, -79.486038, 42.387863, -79.479965, 42.389747, -79.476623, 42.395053, -79.46524, 42.396434, -79.461433, 42.398078, -79.455604, 42.399181, -79.452857, 42.400184, -79.450889, 42.402164, -79.447883, 42.406429, -79.443023, 42.408222, -79.440261, 42.409187, -79.438369, 42.409904, -79.436676, 42.410934, -79.433578, 42.411598, -79.430465, 42.411914, -79.428146, 42.412559, -79.419166, 42.413078, -79.415916, 42.414459, -79.411056, 42.416084, -79.407386, 42.417644, -79.404754, 42.419418, -79.402427, 42.420631, -79.401107, 42.425788, -79.396179, 42.435562, -79.385322, 42.439437, -79.381736, 42.447147, -79.3759, 42.449737, -79.373382, 42.452533, -79.369728, 42.454479, -79.366348, 42.455829, -79.363319, 42.456943, -79.360092, 42.457832, -79.356575, 42.458393, -79.353225, 42.458728, -79.349075, 42.458881, -79.329765, 42.459167, -79.327224, 42.460948, -79.316726, 42.461963, -79.304504, 42.462966, -79.299644, 42.464626, -79.295051, 42.480316, -79.26258, 42.494819, -79.240112, 42.497215, -79.235847, 42.499088, -79.23162, 42.5107, -79.202239, 42.511806, -79.198448, 42.51234, -79.194526, 42.512527, -79.170539, 42.512752, -79.166664, 42.513153, -79.16381, 42.51387, -79.161079, 42.515151, -79.15792, 42.519229, -79.14978, 42.520172, -79.148147, 42.527156, -79.137382, 42.528713, -79.135215, 42.55315, -79.105216, 42.571083, -79.084503, 42.572837, -79.082176, 42.574203, -79.080039, 42.575523, -79.07759, 42.576713, -79.07489, 42.579288, -79.068222, 42.580997, -79.064735, 42.583827, -79.060333, 42.589794, -79.053115, 42.591907, -79.050102, 42.593219, -79.047698, 42.596786, -79.040023, 42.603462, -79.028343, 42.605815, -79.025253, 42.609836, -79.021186, 42.611862, -79.018806, 42.613727, -79.016143, 42.616985, -79.010887, 42.619632, -79.00727, 42.621784, -79.004707, 42.627555, -78.998748, 42.630901, -78.994903, 42.633415, -78.99163, 42.636917, -78.986633, 42.64299, -78.979423, 42.647983, -78.972564, 42.653556, -78.966804, 42.661369, -78.957969, 42.666156, -78.953315, 42.671493, -78.948753, 42.678665, -78.943191, 42.686073, -78.937995, 42.688041, -78.936378, 42.691001, -78.933296, 42.695926, -78.927398, 42.702438, -78.919006, 42.70996, -78.908279, 42.712074, -78.90496, 42.714618, -78.900352, 42.717327, -78.89479, 42.719757, -78.890182, 42.726177, -78.87928, 42.729133, -78.87313, 42.733161, -78.86248, 42.736999, -78.854576, 42.741821, -78.843292, 42.743778, -78.839981, 42.746852, -78.836418, 42.757915, -78.826766, 42.759662, -78.824813, 42.763416, -78.820045, 42.765266, -78.818542, 42.767002, -78.817649, 42.768974, -78.817062, 42.773311, -78.816146, 42.778568, -78.815582, 42.782958, -78.815574, 42.793857, -78.816452, 42.796291, -78.816406, 42.799167, -78.815765, 42.80035, -78.815269, 42.801757, -78.814445, 42.803161, -78.813346, 42.804199, -78.812316, 42.805564, -78.810615, 42.806533, -78.809066, 42.812248, -78.796257, 42.813205, -78.794525, 42.813957, -78.793533, 42.815086, -78.79248, 42.816005, -78.791877, 42.817062, -78.791435, 42.818618, -78.791107, 42.828647, -78.790794, 42.829738, -78.790946, 42.830921, -78.791305, 42.834426, -78.79277, 42.837131, -78.792892, 42.844474, -78.79264, 42.845932, -78.792228, 42.849296, -78.790443, 42.851192, -78.790077, 42.852745, -78.790222, 42.856872, -78.791755, 42.85852, -78.791938, 42.866039, -78.79161, 42.870994, -78.790008, 42.870994, -78.790008, 42.871963, -78.789474, 42.873268, -78.788154, 42.873931, -78.787956, 42.874713, -78.788169, 42.875427, -78.788734, 42.875839, -78.789474, 42.876201, -78.792694, 42.876201, -78.792694, 42.876396, -78.805358, 42.876205, -78.808189, 42.875835, -78.810226, 42.875431, -78.811424, 42.874675, -78.812889, 42.870269, -78.818855, 42.869125, -78.820938, 42.868621, -78.82257, 42.868011, -78.828132, 42.868129, -78.829994, 42.870517, -78.843589, 42.872127, -78.849731, 42.873558, -78.85839, 42.874034, -78.859809, 42.875156, -78.861793, 42.875541, -78.862876, 42.877288, -78.872207, 42.878849, -78.875503, 42.879501, -78.877746, 42.8801, -78.878929, 42.882545, -78.881973, 42.898151, -78.897491, 42.898151, -78.897491, 42.89904, -78.89817, 42.900085, -78.898605, 42.901306, -78.899673, 42.901306, -78.899673, 42.901645, -78.899719, 42.901908, -78.899566, 42.902683, -78.898078, 42.903018, -78.897933, 42.903018, -78.897933, 42.905181, -78.899482, 42.905921, -78.900215, 42.906265, -78.900909, 42.907745, -78.911773, 42.907745, -78.911773, 42.907958, -78.913024, 42.90797, -78.914886, 42.908489, -78.916717, 42.908565, -78.922355, 42.909992, -78.927772, 42.913822, -78.956451, 42.914218, -78.958312, 42.914966, -78.960754, 42.916076, -78.963394, 42.916999, -78.965057, 42.917961, -78.966491, 42.919216, -78.968017, 42.935428, -78.985397, 42.942039, -78.99398, 42.950069, -79.003997, 42.972263, -79.033996, 42.989917, -79.056991, 43.001457, -79.070907, 43.0181, -79.093627, 43.03466, -79.115341, 43.036827, -79.117782, 43.039253, -79.119613, 43.040843, -79.120452, 43.042514, -79.12104, 43.045127, -79.121475, 43.053619, -79.122268, 43.062992, -79.122482, 43.064479, -79.12239, 43.065715, -79.122161, 43.077774, -79.118774, 43.079788, -79.118415, 43.080863, -79.118377, 43.094226, -79.119056, 43.095653, -79.118873, 43.098236, -79.118202, 43.099647, -79.118118, 43.101074, -79.118354, 43.10482, -79.119438, 43.110519, -79.119934, 43.119403, -79.120407, 43.121692, -79.120796, 43.123634, -79.121482, 43.124973, -79.122177, 43.127132, -79.123733, 43.147972, -79.144165, 43.148895, -79.145202, 43.150524, -79.147483, 43.151912, -79.150009, 43.152507, -79.151412, 43.159976, -79.171966, 43.166503, -79.188385, 43.167015, -79.190162, 43.167339, -79.193107, 43.167442, -79.204986, 43.167778, -79.208122, 43.173366, -79.231536, 43.179706, -79.264587, 43.179794, -79.267059, 43.179565, -79.268966, 43.177551, -79.276222, 43.177165, -79.278923, 43.18021, -79.316299, 43.180229, -79.320182, 43.179359, -79.353317, 43.179393, -79.35569, 43.179763, -79.3591, 43.180297, -79.36148, 43.181369, -79.364677, 43.18502, -79.373664, 43.186153, -79.378074, 43.186664, -79.381904, 43.186779, -79.385093, 43.18658, -79.395454, 43.189449, -79.486213, 43.189342, -79.517929, 43.189872, -79.522666, 43.190582, -79.526832, 43.191585, -79.531555, 43.217197, -79.636833, 43.245227, -79.752929, 43.246414, -79.757637, 43.247467, -79.759773, 43.248649, -79.760955, 43.259571, -79.768661, 43.262065, -79.770584, 43.276428, -79.784339, 43.278392, -79.786033, 43.285129, -79.789367, 43.308921, -79.803108, 43.312229, -79.804618, 43.313415, -79.805397, 43.314434, -79.806388, 43.315128, -79.807319, 43.324417, -79.821929, 43.326763, -79.824615, 43.32872, -79.826187, 43.333225, -79.828697, 43.334972, -79.829093, 43.336109, -79.828994, 43.336811, -79.828781, 43.337669, -79.828353, 43.338565, -79.827674, 43.339756, -79.826217, 43.347259, -79.810218, 43.348972, -79.807334, 43.350685, -79.805114, 43.375324, -79.777938, 43.402687, -79.748298, 43.40839, -79.741867, 43.412975, -79.737136, 43.423332, -79.725784, 43.457675, -79.687545, 43.467689, -79.676795, 43.468929, -79.67559, 43.470714, -79.674255, 43.473083, -79.673057, 43.475532, -79.672416, 43.47742, -79.672271, 43.480987, -79.6725, 43.480987, -79.6725, 43.498069, -79.673538, 43.499946, -79.673164, 43.501037, -79.672637, 43.501995, -79.671943, 43.523948, -79.648117, 43.547088, -79.62268, 43.548278, -79.621063, 43.54911, -79.619644, 43.551208, -79.615135, 43.552925, -79.612762, 43.554134, -79.61161, 43.562889, -79.605232, 43.564601, -79.603614, 43.59798, -79.567382, 43.609603, -79.55445, 43.609603, -79.55445, 43.611171, -79.552246, 43.612445, -79.550949, 43.613754, -79.550575, 43.615325, -79.550872, 43.618377, -79.552383, 43.628486, -79.556785, 43.640682, -79.56118, 43.645549, -79.563201, 43.649513, -79.565017, 43.657756, -79.569129, 43.667415, -79.573165, 43.667415, -79.573165, 43.670104, -79.57405, 43.671051, -79.574722, 43.673278, -79.576698, 43.674137, -79.577224, 43.674812, -79.577445, 43.675735, -79.577514, 43.676433, -79.5774, 43.680423, -79.575675, 43.680423, -79.575675, 43.689247, -79.57077, 43.691726, -79.569244, 43.701126, -79.560989, 43.701126, -79.560989, 43.707584, -79.555221, 43.7084, -79.554176, 43.709255, -79.552398, 43.715061, -79.528282, 43.715061, -79.528282, 43.715709, -79.523971, 43.715702, -79.523277, 43.715091, -79.520172, 43.715114, -79.519393, 43.71548, -79.518669, 43.716056, -79.518463, 43.716785, -79.518745, 43.721683, -79.522392, 43.722591, -79.522842, 43.723834, -79.523223, 43.775047, -79.535385, 43.783042, -79.537124, 43.794372, -79.539985, 43.814109, -79.544624, 43.817085, -79.545089, 43.841594, -79.547485, 43.844585, -79.547981, 43.930374, -79.568222, 43.936466, -79.569793, 43.99541, -79.583847, 44.013275, -79.58979, 44.03424, -79.59542, 44.036083, -79.596023, 44.037826, -79.596855, 44.040355, -79.59867, 44.066398, -79.621315, 44.068252, -79.62252, 44.070842, -79.62358, 44.144641, -79.64183, 44.147251, -79.642158, 44.176994, -79.644241, 44.179042, -79.6445, 44.181499, -79.645065, 44.183891, -79.645896, 44.185863, -79.646781, 44.206306, -79.657875, 44.209102, -79.659164, 44.21096, -79.65979, 44.300472, -79.683662, 44.303287, -79.68386, 44.323356, -79.682716, 44.326721, -79.682647, 44.328227, -79.682884, 44.332778, -79.683975, 44.352195, -79.688819, 44.353965, -79.689514, 44.355106, -79.690139, 44.356464, -79.691085, 44.357822, -79.692276, 44.359191, -79.693725, 44.372646, -79.709526, 44.373447, -79.710319, 44.374629, -79.711112, 44.376316, -79.711662, 44.377182, -79.711738, 44.378295, -79.711608, 44.379596, -79.711174, 44.389732, -79.70581, 44.40044, -79.697402, 44.401523, -79.696441, 44.403083, -79.69474, 44.409519, -79.685897, 44.410221, -79.684776, 44.411098, -79.682937, 44.412254, -79.679206, 44.41706, -79.661041, 44.418079, -79.65837, 44.419223, -79.6566, 44.420417, -79.655372, 44.4235, -79.653327, 44.4253, -79.651954, 44.427036, -79.649833, 44.427761, -79.649505, 44.428237, -79.649551, 44.428909, -79.649902, 44.429237, -79.650314, 44.431873, -79.655578, 44.433181, -79.657249, 44.443885, -79.666671, 44.463806, -79.683738, 44.475067, -79.694007, 44.487136, -79.705215, 44.528064, -79.744338, 44.53004, -79.745513, 44.54354, -79.750144, 44.545013, -79.750205, 44.54618, -79.749969, 44.547584, -79.749343, 44.548374, -79.748779, 44.560821, -79.737312, 44.562995, -79.73484, 44.564613, -79.732276, 44.565647, -79.730125, 44.569942, -79.717727, 44.571346, -79.714668, 44.580062, -79.702003, 44.58728, -79.688995, 44.588092, -79.687736, 44.595985, -79.678413, 44.597522, -79.676834, 44.599304, -79.67543, 44.615325, -79.664047, 44.617004, -79.663108, 44.663043, -79.643035, 44.665241, -79.64244, 44.667133, -79.642417, 44.668823, -79.642753, 44.68177, -79.646476, 44.683685, -79.646827, 44.696815, -79.648284, 44.697914, -79.64862, 44.699222, -79.649391, 44.700195, -79.650291, 44.701103, -79.651481, 44.705623, -79.659957, 44.70713, -79.662139, 44.708415, -79.663497, 44.736129, -79.683929, 44.737461, -79.685157, 44.7387, -79.686836, 44.739429, -79.688224, 44.742843, -79.697059, 44.743675, -79.698753, 44.745246, -79.700843, 44.746528, -79.701942, 44.747726, -79.702674, 44.749423, -79.703208, 44.750942, -79.7033, 44.75217, -79.703079, 44.753383, -79.70259, 44.769756, -79.691703, 44.770832, -79.691162, 44.772102, -79.690795, 44.773319, -79.69075, 44.774501, -79.690948, 44.776252, -79.691726, 44.794845, -79.707641, 44.796134, -79.709205, 44.797096, -79.710929, 44.797931, -79.71331, 44.801116, -79.727722, 44.801712, -79.729988, 44.802322, -79.731658, 44.803295, -79.733619, 44.804756, -79.73571, 44.806667, -79.737564, 44.808425, -79.738685, 44.809455, -79.739112, 44.810913, -79.739486, 44.813095, -79.739562, 44.826614, -79.736938, 44.82846, -79.736824, 44.82999, -79.737083, 44.836875, -79.738998, 44.838279, -79.739097, 44.839195, -79.738975, 44.840396, -79.738578, 44.843795, -79.736343, 44.844902, -79.735855, 44.846683, -79.735549, 44.848461, -79.735816, 44.853477, -79.738395, 44.870529, -79.747695, 44.871662, -79.748008, 44.87305, -79.748031, 44.878219, -79.74694, 44.879951, -79.747169, 44.881332, -79.747802, 44.882614, -79.748825, 44.887599, -79.754104, 44.888721, -79.75489, 44.890674, -79.755851, 44.892196, -79.756942, 44.893348, -79.758346, 44.899234, -79.766891, 44.900703, -79.768455, 44.902324, -79.769462, 44.907505, -79.771987, 44.915672, -79.774665, 44.9169, -79.774963, 44.918087, -79.775054, 44.934234, -79.774513, 44.937442, -79.774673, 44.951045, -79.776802, 44.956554, -79.778724, 44.958435, -79.778953, 44.959812, -79.778717, 44.961017, -79.778205, 44.970386, -79.772338, 44.971717, -79.771926, 44.972747, -79.771903, 44.973995, -79.772209, 44.975402, -79.773056, 44.976177, -79.773818, 44.978691, -79.777191, 44.979476, -79.777961, 44.980243, -79.778472, 44.994209, -79.783432, 44.995578, -79.783691, 44.996578, -79.783706, 44.997604, -79.783561, 44.999149, -79.782974, 45.000114, -79.782379, 45.003467, -79.779609, 45.004722, -79.778976, 45.006019, -79.778594, 45.019828, -79.778076, 45.022167, -79.777664, 45.024013, -79.77687, 45.025371, -79.775978, 45.029586, -79.771972, 45.030399, -79.771385, 45.031574, -79.770858, 45.033092, -79.77066, 45.03384, -79.770759, 45.040599, -79.772659, 45.042316, -79.773895, 45.044963, -79.777366, 45.046192, -79.778434, 45.058048, -79.785743, 45.059593, -79.786598, 45.060398, -79.786857, 45.061561, -79.786979, 45.062713, -79.786834, 45.07056, -79.784805, 45.072269, -79.784477, 45.083881, -79.784713, 45.107299, -79.786773, 45.138618, -79.793228, 45.139938, -79.793235, 45.14122, -79.792976, 45.146621, -79.790443, 45.148036, -79.78997, 45.149097, -79.789794, 45.151, -79.78984, 45.158569, -79.791007, 45.161212, -79.791702, 45.171821, -79.796775, 45.17807, -79.799995, 45.179412, -79.800949, 45.181335, -79.802688, 45.186695, -79.808837, 45.188529, -79.81034, 45.189842, -79.811027, 45.191925, -79.811592, 45.19609, -79.811714, 45.198078, -79.812072, 45.19968, -79.812751, 45.205566, -79.815986, 45.20758, -79.81681, 45.217559, -79.819221, 45.223079, -79.820144, 45.2247, -79.820625, 45.225963, -79.821327, 45.227451, -79.822578, 45.23225, -79.828804, 45.233337, -79.829879, 45.234855, -79.830886, 45.236396, -79.831451, 45.238098, -79.831619, 45.23981, -79.831314, 45.242374, -79.830299, 45.243755, -79.829925, 45.245262, -79.829841, 45.247234, -79.830261, 45.249179, -79.831336, 45.259693, -79.840179, 45.261894, -79.8414, 45.263679, -79.841842, 45.264862, -79.841896, 45.272991, -79.841056, 45.274383, -79.841117, 45.275394, -79.841361, 45.27679, -79.841979, 45.277927, -79.842758, 45.27909, -79.843872, 45.280567, -79.845932, 45.288696, -79.859413, 45.290561, -79.86132, 45.294582, -79.86383, 45.29631, -79.865348, 45.297782, -79.867294, 45.298625, -79.868881, 45.299289, -79.870574, 45.299964, -79.873229, 45.303153, -79.890678, 45.303981, -79.893226, 45.306133, -79.897926, 45.306701, -79.89981, 45.307033, -79.901603, 45.30717, -79.904701, 45.306537, -79.913116, 45.30656, -79.915428, 45.307056, -79.921737, 45.307552, -79.930854, 45.307991, -79.933288, 45.308849, -79.93576, 45.310134, -79.937973, 45.31113, -79.939163, 45.311958, -79.93991, 45.313106, -79.940681, 45.31855, -79.943382, 45.319786, -79.944236, 45.320907, -79.945335, 45.32241, -79.947517, 45.325309, -79.9542, 45.327007, -79.957244, 45.329124, -79.960083, 45.336082, -79.968704, 45.3376, -79.971038, 45.338802, -79.973571, 45.339874, -79.976821, 45.343898, -79.99681, 45.344573, -79.999206, 45.345695, -80.00167, 45.347332, -80.00402, 45.349075, -80.005638, 45.350574, -80.006561, 45.354133, -80.007934, 45.355342, -80.008537, 45.357158, -80.009994, 45.359058, -80.012527, 45.364295, -80.020957, 45.365756, -80.022712, 45.366744, -80.02349, 45.36819, -80.024208, 45.371459, -80.024909, 45.37252, -80.025321, 45.373825, -80.026145, 45.374931, -80.027183, 45.375843, -80.02835, 45.376644, -80.029731, 45.379341, -80.036727, 45.380237, -80.03852, 45.381038, -80.039741, 45.394077, -80.055458, 45.395347, -80.0568, 45.400547, -80.060859, 45.40216, -80.06182, 45.40393, -80.062408, 45.407928, -80.063011, 45.409526, -80.063415, 45.411441, -80.064193, 45.413837, -80.065635, 45.415283, -80.066825, 45.416839, -80.068374, 45.429443, -80.082633, 45.430915, -80.085098, 45.431842, -80.087287, 45.432609, -80.089889, 45.433082, -80.092605, 45.433265, -80.096382, 45.433368, -80.110382, 45.433643, -80.113441, 45.43415, -80.116104, 45.434581, -80.117675, 45.435672, -80.120605, 45.440975, -80.132423, 45.440975, -80.132423, 45.442245, -80.135124, 45.444271, -80.138229, 45.445178, -80.139297, 45.451099, -80.144973, 45.453086, -80.147468, 45.456108, -80.15052, 45.479965, -80.182075, 45.499748, -80.212875, 45.544666, -80.274177, 45.546413, -80.277297, 45.556713, -80.299362, 45.569072, -80.332794, 45.57051, -80.337768, 45.571262, -80.339462, 45.574893, -80.345825, 45.575569, -80.347686, 45.576503, -80.351493, 45.577564, -80.353927, 45.578369, -80.355125, 45.584213, -80.362243, 45.593128, -80.370742, 45.601764, -80.378456, 45.602851, -80.379249, 45.604026, -80.379791, 45.615711, -80.383102, 45.616962, -80.383613, 45.618572, -80.384803, 45.625621, -80.391586, 45.627235, -80.392868, 45.628784, -80.393768, 45.630512, -80.394485, 45.647876, -80.400444, 45.649406, -80.401245, 45.650424, -80.402107, 45.651218, -80.403007, 45.680431, -80.442451, 45.681484, -80.443702, 45.68301, -80.445152, 45.685295, -80.446739, 45.720764, -80.467887, 45.762622, -80.494415, 45.764392, -80.495315, 45.766147, -80.49588, 45.774528, -80.4972, 45.775245, -80.497467, 45.776527, -80.49826, 45.777675, -80.499351, 45.77853, -80.500511, 45.779338, -80.502029, 45.77983, -80.503341, 45.7803, -80.505302, 45.78162, -80.515716, 45.782096, -80.517448, 45.782661, -80.518821, 45.784107, -80.521095, 45.793739, -80.532203, 45.79496, -80.533088, 45.832881, -80.554588, 45.873897, -80.56929, 45.875038, -80.569557, 45.876262, -80.56958, 45.877693, -80.569236, 45.888973, -80.564979, 45.890193, -80.564804, 45.891143, -80.564926, 45.908676, -80.573791, 45.909545, -80.574005, 45.910163, -80.573982, 45.912349, -80.573204, 45.913646, -80.572952, 45.914821, -80.573074, 45.915763, -80.573379, 45.922641, -80.577407, 45.930084, -80.583038, 45.930923, -80.583427, 45.931873, -80.583625, 45.965061, -80.579223, 45.96622, -80.578895, 45.968116, -80.578102, 45.979816, -80.571731, 45.994159, -80.567207, 45.996223, -80.56681, 45.997985, -80.566909, 45.999515, -80.567321, 46.001419, -80.568298, 46.002571, -80.569175, 46.02597, -80.589767, 46.044326, -80.611976, 46.04961, -80.618644, 46.05569, -80.623657, 46.06694, -80.634773, 46.068725, -80.636863, 46.074287, -80.645301, 46.076644, -80.648101, 46.080093, -80.651351, 46.096847, -80.663391, 46.114967, -80.672424, 46.117385, -80.673858, 46.14101, -80.69477, 46.142578, -80.696655, 46.14587, -80.701858, 46.147274, -80.703727, 46.148906, -80.705383, 46.150527, -80.706604, 46.152179, -80.707489, 46.152965, -80.707771, 46.153228, -80.707687, 46.154083, -80.708053, 46.164562, -80.713249, 46.166584, -80.713768, 46.174869, -80.714897, 46.177574, -80.715881, 46.179187, -80.716865, 46.180831, -80.718223, 46.182945, -80.720626, 46.184524, -80.723075, 46.185752, -80.725669, 46.189083, -80.73426, 46.190555, -80.737518, 46.203914, -80.761466, 46.205787, -80.764266, 46.207126, -80.765769, 46.208423, -80.766906, 46.209972, -80.767959, 46.211875, -80.768867, 46.21355, -80.769332, 46.223628, -80.770355, 46.224864, -80.770584, 46.22731, -80.771461, 46.229225, -80.77256, 46.23035, -80.773468, 46.23151, -80.774566, 46.233142, -80.776542, 46.247913, -80.800071, 46.25061, -80.804145, 46.252712, -80.806404, 46.254428, -80.80767, 46.256969, -80.808891, 46.259288, -80.809494, 46.261795, -80.809494, 46.26258, -80.809364, 46.264366, -80.80883, 46.266311, -80.807922, 46.277999, -80.799942, 46.280445, -80.79853, 46.282669, -80.797805, 46.289131, -80.797523, 46.291378, -80.797988, 46.293178, -80.799026, 46.294651, -80.800476, 46.295856, -80.801902, 46.303337, -80.811195, 46.304817, -80.812377, 46.306091, -80.813003, 46.307258, -80.813323, 46.307975, -80.813415, 46.309696, -80.813278, 46.324893, -80.810173, 46.326015, -80.809684, 46.327072, -80.809005, 46.32793, -80.808265, 46.33105, -80.804924, 46.332351, -80.803802, 46.33398, -80.802894, 46.335781, -80.802452, 46.337196, -80.802444, 46.339092, -80.802955, 46.348384, -80.808441, 46.351158, -80.810699, 46.353298, -80.812927, 46.358882, -80.820518, 46.360721, -80.822586, 46.362415, -80.824104, 46.369014, -80.829399, 46.37115, -80.831672, 46.372276, -80.833106, 46.374004, -80.835754, 46.376979, -80.841682, 46.379684, -80.846298, 46.3824, -80.850021, 46.384426, -80.852363, 46.386631, -80.854515, 46.394683, -80.861129, 46.39854, -80.863639, 46.421253, -80.874076, 46.422683, -80.875099, 46.424263, -80.876495, 46.425903, -80.878974, 46.42694, -80.881469, 46.427436, -80.883506, 46.428844, -80.895622, 46.430042, -80.899009, 46.432182, -80.902511, 46.43264, -80.904014, 46.432746, -80.904953, 46.432712, -80.907157, 46.43201, -80.913459, 46.431758, -80.929412, 46.43581, -80.967842, 46.43581, -80.967842, 46.435958, -80.969192, 46.436305, -80.969795, 46.43666, -80.969871, 46.437118, -80.969696, 46.437629, -80.968925, 46.437671, -80.968391, 46.437419, -80.96772, 46.437, -80.967468, 46.436447, -80.967712, 46.435367, -80.969078, 46.434036, -80.971122, 46.433464, -80.972221, 46.432876, -80.973846, 46.431682, -80.978515, 46.42908, -80.993408, 46.428928, -80.994766, 46.428974, -80.996856, 46.42945, -80.999382, 46.433277, -81.011032, 46.4337, -81.013229, 46.433807, -81.01538, 46.433704, -81.016738, 46.432483, -81.023178, 46.432224, -81.025939, 46.432289, -81.029067, 46.4328, -81.032455, 46.433551, -81.035224, 46.434604, -81.037666, 46.440605, -81.047134, 46.441978, -81.049865, 46.44252, -81.051628, 46.442977, -81.053924, 46.442981, -81.058006, 46.442359, -81.061302, 46.441356, -81.063796, 46.426395, -81.089614, 46.424968, -81.093078, 46.42395, -81.096755, 46.423561, -81.0997, 46.423419, -81.102645, 46.423522, -81.105583, 46.4239, -81.10852, 46.424526, -81.110885, 46.425788, -81.114334, 46.429492, -81.126579, 46.429958, -81.129638, 46.429824, -81.132675, 46.429473, -81.134536, 46.426128, -81.147964, 46.42506, -81.155479, 46.420055, -81.172332, 46.419193, -81.175971, 46.41856, -81.179359, 46.418098, -81.183662, 46.417152, -81.19728, 46.416713, -81.200141, 46.416095, -81.202934, 46.415287, -81.205642, 46.413738, -81.209465, 46.408897, -81.218101, 46.407241, -81.221847, 46.399425, -81.251045, 46.398605, -81.255218, 46.398483, -81.259445, 46.398685, -81.261596, 46.399066, -81.263687, 46.404796, -81.281478, 46.405399, -81.28408, 46.405635, -81.286109, 46.405685, -81.288177, 46.405307, -81.291763, 46.398822, -81.318031, 46.397911, -81.320755, 46.396667, -81.32344, 46.395774, -81.324958, 46.394489, -81.326744, 46.376708, -81.347579, 46.375968, -81.348701, 46.375377, -81.349983, 46.374702, -81.352645, 46.369598, -81.388442, 46.369075, -81.390884, 46.364044, -81.409629, 46.363674, -81.412117, 46.363086, -81.420928, 46.36238, -81.424369, 46.36156, -81.426635, 46.360523, -81.428642, 46.352867, -81.439735, 46.35189, -81.441612, 46.35147, -81.442764, 46.347896, -81.456169, 46.347103, -81.458694, 46.341552, -81.471977, 46.334011, -81.489112, 46.33274, -81.49311, 46.332111, -81.496635, 46.331878, -81.500839, 46.332008, -81.503425, 46.333259, -81.515953, 46.333251, -81.518043, 46.333053, -81.519706, 46.332595, -81.521591, 46.331985, -81.5232, 46.326732, -81.533554, 46.326107, -81.535026, 46.325424, -81.53775, 46.325248, -81.54074, 46.325542, -81.543296, 46.327442, -81.551078, 46.328422, -81.553375, 46.329795, -81.555458, 46.330829, -81.557441, 46.333244, -81.565193, 46.333595, -81.566864, 46.333774, -81.568939, 46.333553, -81.572059, 46.323574, -81.607673, 46.323322, -81.610145, 46.323432, -81.61222, 46.323722, -81.61383, 46.324684, -81.617256, 46.324996, -81.619712, 46.324916, -81.622352, 46.324371, -81.625053, 46.312915, -81.652442, 46.312072, -81.654045, 46.303722, -81.667831, 46.302814, -81.669692, 46.301921, -81.672401, 46.30072, -81.677322, 46.299301, -81.685279, 46.298618, -81.688117, 46.298099, -81.689239, 46.296642, -81.691665, 46.293365, -81.69815, 46.292659, -81.699768, 46.292228, -81.701232, 46.291866, -81.704338, 46.291893, -81.722412, 46.291755, -81.72528, 46.288341, -81.739944, 46.285202, -81.760322, 46.285034, -81.768714, 46.285964, -81.776634, 46.285964, -81.776634, 46.27494, -81.780616, 46.27367, -81.780639, 46.272491, -81.780113, 46.271446, -81.77906, 46.269607, -81.775634, 46.266658, -81.771995, 46.26527, -81.770767, 46.262634, -81.767364, 46.261116, -81.765708, 46.260059, -81.765098, 46.257633, -81.764297, 46.252811, -81.764205, 46.251567, -81.764015, 46.250545, -81.763458, 46.249645, -81.762504, 46.248703, -81.760932, 46.246253, -81.754608, 46.245555, -81.753303, 46.244724, -81.752296, 46.240844, -81.748611, 46.239734, -81.747268, 46.23841, -81.745285, 46.234035, -81.737846, 46.233055, -81.736778, 46.232242, -81.736396, 46.231719, -81.736335, 46.230934, -81.736457, 46.227977, -81.737403, 46.225921, -81.737373, 46.224952, -81.737075, 46.217334, -81.733421, 46.21585, -81.733146, 46.214393, -81.73323, 46.21342, -81.733116, 46.21257, -81.732574, 46.211841, -81.731689, 46.209213, -81.727157, 46.208511, -81.726432, 46.207576, -81.725967, 46.206893, -81.725921, 46.205883, -81.726242, 46.203781, -81.727981, 46.202911, -81.728317, 46.201663, -81.728187, 46.200851, -81.727684, 46.200248, -81.726989, 46.198875, -81.7247, 46.198265, -81.723617, 46.197841, -81.722488, 46.197631, -81.721511, 46.197536, -81.719886, 46.197845, -81.71627, 46.197326, -81.714065, 46.196369, -81.7126, 46.195949, -81.712234, 46.195064, -81.711791, 46.19223, -81.710998, 46.19165, -81.711021, 46.190792, -81.711326, 46.183898, -81.718078, 46.183063, -81.718772, 46.182308, -81.719177, 46.180805, -81.719474, 46.176387, -81.718795, 46.174903, -81.71878, 46.173557, -81.719268, 46.170894, -81.720802, 46.169399, -81.722145, 46.165195, -81.726715, 46.162471, -81.731048, 46.161415, -81.732353, 46.153175, -81.738952, 46.15237, -81.739837, 46.151752, -81.740859, 46.14841, -81.748031, 46.147747, -81.748977, 46.146949, -81.749748, 46.146026, -81.750335, 46.144718, -81.75093, 46.143913, -81.751068, 46.143375, -81.750999, 46.142501, -81.750549, 46.141468, -81.74929, 46.14088, -81.74739, 46.14011, -81.742614, 46.139591, -81.741462, 46.138893, -81.740608, 46.137897, -81.740036, 46.135604, -81.739402, 46.135074, -81.739372, 46.133789, -81.739852, 46.132843, -81.740653, 46.132015, -81.741127, 46.131164, -81.741279, 46.13029, -81.741073, 46.129211, -81.740203, 46.128658, -81.739349, 46.127185, -81.734176, 46.126651, -81.733322, 46.126045, -81.732757, 46.125492, -81.732521, 46.124664, -81.732475, 46.122806, -81.73307, 46.121902, -81.733078, 46.119953, -81.732299, 46.11787, -81.732322, 46.116664, -81.731628, 46.116024, -81.73088, 46.112884, -81.725616, 46.111965, -81.724647, 46.109825, -81.723052, 46.109004, -81.722175, 46.108592, -81.721138, 46.108051, -81.717391, 46.107479, -81.716361, 46.10704, -81.715942, 46.102722, -81.713867, 46.101253, -81.71347, 46.099788, -81.713668, 46.096797, -81.715019, 46.090225, -81.714958, 46.088581, -81.715347, 46.08076, -81.720306, 46.080001, -81.721138, 46.079181, -81.722808, 46.076797, -81.732376, 46.07373, -81.743133, 46.072868, -81.754005, 46.072471, -81.756721, 46.071849, -81.758651, 46.06969, -81.763694, 46.068534, -81.771774, 46.068252, -81.77272, 46.067565, -81.773559, 46.067119, -81.773742, 46.066524, -81.773735, 46.066013, -81.773544, 46.064266, -81.772186, 46.062522, -81.771232, 46.060615, -81.770729, 46.059696, -81.770675, 46.058376, -81.770782, 46.057197, -81.771095, 46.050182, -81.774566, 46.04927, -81.774871, 46.047599, -81.775108, 46.039665, -81.77555, 46.038879, -81.775367, 46.03778, -81.77481, 46.03181, -81.770225, 46.030479, -81.769515, 46.029441, -81.769348, 46.019706, -81.770011, 46.01876, -81.770362, 46.017936, -81.770973, 46.016933, -81.772445, 46.016399, -81.774009, 46.015628, -81.780204, 46.016139, -81.788505, 46.016021, -81.791366, 46.015689, -81.794197, 46.0135, -81.803161, 46.008419, -81.821594, 46.008056, -81.823379, 46.005409, -81.841369, 46.004829, -81.8581, 46.004577, -81.860717, 46.003993, -81.863792, 45.999202, -81.878585, 45.995655, -81.891197, 45.994888, -81.893135, 45.994369, -81.893959, 45.9934, -81.895042, 45.984161, -81.903289, 45.983367, -81.904365, 45.982929, -81.90525, 45.982463, -81.906845, 45.981822, -81.912559, 45.981449, -81.913185, 45.97966, -81.914428, 45.979225, -81.914871, 45.977943, -81.919601, 45.977912, -81.920989, 45.978691, -81.924789, 45.978691, -81.924789, 45.978286, -81.924766, 45.977481, -81.924423, 45.944789, -81.907752, 45.943553, -81.907409, 45.934776, -81.907341, 45.922454, -81.907409, 45.921043, -81.907707, 45.920425, -81.907974, 45.919357, -81.908615, 45.918289, -81.909507, 45.904117, -81.922424, 45.901943, -81.924263, 45.900405, -81.924995, 45.898826, -81.92527, 45.89595, -81.925247, 45.894321, -81.924858, 45.89236, -81.923652, 45.882068, -81.915061, 45.881046, -81.913887, 45.880054, -81.912322, 45.878993, -81.909423, 45.878677, -81.907768, 45.878536, -81.905845, 45.878662, -81.879196, 45.878585, -81.857589, 45.878261, -81.855697, 45.877647, -81.85395, 45.876777, -81.852531, 45.875362, -81.851196, 45.874374, -81.8507, 45.87297, -81.850448, 45.860115, -81.850395, 45.852035, -81.850524, 45.851253, -81.850654, 45.850368, -81.851005, 45.847198, -81.852905, 45.84579, -81.853126, 45.844417, -81.852813, 45.840751, -81.850936, 45.839508, -81.850715, 45.806755, -81.850616, 45.805477, -81.850944, 45.80183, -81.852958, 45.799793, -81.853324, 45.798885, -81.85324, 45.797485, -81.85279, 45.794647, -81.851081, 45.793605, -81.850708, 45.768817, -81.85028, 45.768005, -81.85041, 45.76725, -81.850738, 45.765235, -81.85205, 45.764129, -81.852447, 45.758266, -81.852462, 45.757644, -81.852363, 45.756332, -81.851608, 45.755409, -81.850463, 45.752384, -81.843948, 45.751083, -81.840179, 45.748798, -81.829055, 45.748737, -81.827247, 45.749004, -81.822929, 45.748722, -81.820777, 45.748031, -81.81884, 45.746948, -81.817245, 45.745944, -81.816383, 45.745159, -81.815986, 45.743862, -81.815628, 45.739807, -81.814964, 45.738689, -81.814964, 45.737091, -81.815597, 45.732265, -81.818855, 45.729835, -81.820144, 45.728694, -81.820938, 45.725959, -81.823432, 45.703353, -81.839683, 45.701641, -81.841323, 45.695789, -81.848266, 45.690704, -81.852241, 45.689697, -81.853576, 45.689079, -81.855285, 45.687397, -81.862533, 45.68655, -81.865135, 45.685302, -81.868072, 45.684516, -81.869613, 45.682888, -81.872245, 45.678333, -81.87799, 45.677711, -81.879142, 45.677177, -81.880752, 45.676216, -81.889503, 45.676273, -81.8917, 45.677131, -81.898277, 45.677036, -81.901115, 45.676364, -81.904106, 45.672813, -81.913856, 45.672138, -81.916122, 45.671642, -81.918502, 45.671314, -81.921035, 45.668853, -81.949302, 45.668079, -81.953666, 45.667209, -81.956504, 45.666336, -81.95858, 45.658988, -81.972526, 45.658134, -81.973678, 45.657432, -81.974235, 45.656295, -81.974662, 45.655063, -81.974563, 45.655063, -81.974563, 45.655086, -81.975502, 45.655303, -81.976181, 45.656375, -81.977394, 45.656375, -81.977394, 45.657321, -81.975692],
                "legIndexes": [0, 40, 4051]
            },
            "hasTunnel": true,
            "hasUnpaved": true,
            "hasHighway": true,
            "realTime": 70146,
            "boundingBox": {
                "ul": {
                    "lng": -82.424446,
                    "lat": 46.43581
                },
                "lr": {
                    "lng": -78.790008,
                    "lat": 34.787902
                }
            },
            "distance": 1189.021,
            "time": 69398,
            "locationSequence": [0, 1, 2],
            "hasSeasonalClosure": false,
            "sessionId": "579fc74f-03d9-0000-02b7-49ff-00163e01ab69",
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
                    "linkId": 51590753,
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
                    "linkId": 51023925,
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
                        "lng": -81.975692,
                        "lat": 45.657321
                    },
                    "adminArea4": "",
                    "adminArea5Type": "City",
                    "adminArea4Type": "County",
                    "adminArea5": "P0P",
                    "street": "Undefined Rd",
                    "adminArea1": "CA",
                    "adminArea3": "ON",
                    "type": "s",
                    "displayLatLng": {
                        "lng": -81.975692,
                        "lat": 45.657321
                    },
                    "linkId": 22803814,
                    "postalCode": "P0P",
                    "sideOfStreet": "N",
                    "dragPoint": false,
                    "adminArea1Type": "Country",
                    "geocodeQuality": "STREET",
                    "geocodeQualityCode": "B3CCA",
                    "adminArea3Type": "State"
                }],
            "hasCountryCross": true,
            "legs": [{
                    "hasTollRoad": false,
                    "index": 0,
                    "hasBridge": true,
                    "hasTunnel": false,
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
                            "attributes": 1024,
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
                    "hasTollRoad": true,
                    "index": 1,
                    "hasBridge": true,
                    "hasTunnel": true,
                    "roadGradeStrategy": [
                        []
                    ],
                    "hasHighway": true,
                    "hasUnpaved": true,
                    "distance": 1183.754,
                    "time": 68765,
                    "origIndex": 1,
                    "hasSeasonalClosure": false,
                    "origNarrative": "Go east on E North St/SC-183.",
                    "hasCountryCross": true,
                    "formattedTime": "19:06:05",
                    "destNarrative": "Proceed to UNDEFINED RD.",
                    "destIndex": 28,
                    "maneuvers": [{
                            "signs": [],
                            "index": 8,
                            "maneuverNotes": [],
                            "direction": 3,
                            "narrative": "Start out going northeast on S Main St toward E Broad St.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-start_sm.gif",
                            "distance": 0.52,
                            "time": 155,
                            "linkIds": [],
                            "streets": ["S Main St"],
                            "attributes": 1024,
                            "transportMode": "AUTO",
                            "formattedTime": "00:02:35",
                            "directionName": "Northeast",
                            "startPoint": {
                                "lng": -82.401672,
                                "lat": 34.845546
                            },
                            "turnType": 6
                        },
                        {
                            "signs": [{
                                    "text": "183",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 539,
                                    "url": "http://icons.mqcdn.com/icons/rs539.png?n=183"
                                }],
                            "index": 9,
                            "maneuverNotes": [],
                            "direction": 8,
                            "narrative": "Turn right onto E North St/SC-183.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_right_sm.gif",
                            "distance": 0.709,
                            "time": 120,
                            "linkIds": [],
                            "streets": ["E North St", "SC-183"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:02:00",
                            "directionName": "East",
                            "startPoint": {
                                "lng": -82.398162,
                                "lat": 34.852485
                            },
                            "turnType": 2
                        },
                        {
                            "signs": [{
                                    "text": "385",
                                    "extraText": "",
                                    "direction": 4,
                                    "type": 1,
                                    "url": "http://icons.mqcdn.com/icons/rs1.png?n=385&d=SOUTH"
                                }],
                            "index": 10,
                            "maneuverNotes": [],
                            "direction": 4,
                            "narrative": "Stay straight to go onto I-385 S.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_straight_sm.gif",
                            "distance": 5.27,
                            "time": 319,
                            "linkIds": [],
                            "streets": ["I-385 S"],
                            "attributes": 1152,
                            "transportMode": "AUTO",
                            "formattedTime": "00:05:19",
                            "directionName": "South",
                            "startPoint": {
                                "lng": -82.386177,
                                "lat": 34.852764
                            },
                            "turnType": 0
                        },
                        {
                            "signs": [{
                                    "text": "85",
                                    "extraText": "",
                                    "direction": 1,
                                    "type": 1,
                                    "url": "http://icons.mqcdn.com/icons/rs1.png?n=85&d=NORTH"
                                },
                                {
                                    "text": "36",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 1001,
                                    "url": "http://icons.mqcdn.com/icons/rs1001.png?n=36&d=RIGHT"
                                }],
                            "index": 11,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Merge onto I-85 N via EXIT 36 toward Spartanburg/Airport.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_merge_right_sm.gif",
                            "distance": 18.443,
                            "time": 1023,
                            "linkIds": [],
                            "streets": ["I-85 N"],
                            "attributes": 1152,
                            "transportMode": "AUTO",
                            "formattedTime": "00:17:03",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -82.306022,
                                "lat": 34.835521
                            },
                            "turnType": 10
                        },
                        {
                            "signs": [{
                                    "text": "85",
                                    "extraText": "",
                                    "direction": 1,
                                    "type": 1,
                                    "url": "http://icons.mqcdn.com/icons/rs1.png?n=85&d=NORTH"
                                }],
                            "index": 12,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Keep left to take I-85 N toward Charlotte (Crossing into North Carolina).",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_slight_left_sm.gif",
                            "distance": 67.847,
                            "time": 3694,
                            "linkIds": [],
                            "streets": ["I-85 N"],
                            "attributes": 1152,
                            "transportMode": "AUTO",
                            "formattedTime": "01:01:34",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -82.039237,
                                "lat": 34.963466
                            },
                            "turnType": 7
                        },
                        {
                            "signs": [{
                                    "text": "485",
                                    "extraText": "",
                                    "direction": 1,
                                    "type": 1,
                                    "url": "http://icons.mqcdn.com/icons/rs1.png?n=485&d=NORTH"
                                },
                                {
                                    "text": "30",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 1001,
                                    "url": "http://icons.mqcdn.com/icons/rs1001.png?n=30&d=RIGHT"
                                }],
                            "index": 13,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Merge onto I-485 N via EXIT 30.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_merge_right_sm.gif",
                            "distance": 11.991,
                            "time": 685,
                            "linkIds": [],
                            "streets": ["I-485 N"],
                            "attributes": 1152,
                            "transportMode": "AUTO",
                            "formattedTime": "00:11:25",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -80.977951,
                                "lat": 35.25251
                            },
                            "turnType": 10
                        },
                        {
                            "signs": [{
                                    "text": "23A-B",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 1001,
                                    "url": "http://icons.mqcdn.com/icons/rs1001.png?n=23A-B&d=RIGHT"
                                }],
                            "index": 14,
                            "maneuverNotes": [],
                            "direction": 8,
                            "narrative": "Take the I-77 exit, EXIT 23A-B, toward Statesville/Charlotte.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_gr_exitright_sm.gif",
                            "distance": 0.466,
                            "time": 34,
                            "linkIds": [],
                            "streets": [],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:00:34",
                            "directionName": "East",
                            "startPoint": {
                                "lng": -80.855026,
                                "lat": 35.360576
                            },
                            "turnType": 14
                        },
                        {
                            "signs": [{
                                    "text": "77",
                                    "extraText": "",
                                    "direction": 1,
                                    "type": 1,
                                    "url": "http://icons.mqcdn.com/icons/rs1.png?n=77&d=NORTH"
                                },
                                {
                                    "text": "23B",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 1001,
                                    "url": "http://icons.mqcdn.com/icons/rs1001.png?n=23B&d=LEFT"
                                }],
                            "index": 15,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Merge onto I-77 N via EXIT 23B on the left toward Statesville/I-77 N (Crossing into Virginia).",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_merge_left_sm.gif",
                            "distance": 127.329,
                            "time": 7082,
                            "linkIds": [],
                            "streets": ["I-77 N"],
                            "attributes": 1152,
                            "transportMode": "AUTO",
                            "formattedTime": "01:58:02",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -80.847251,
                                "lat": 35.362407
                            },
                            "turnType": 11
                        },
                        {
                            "signs": [{
                                    "text": "77",
                                    "extraText": "",
                                    "direction": 1,
                                    "type": 1,
                                    "url": "http://icons.mqcdn.com/icons/rs1.png?n=77&d=NORTH"
                                },
                                {
                                    "text": "72",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 1001,
                                    "url": "http://icons.mqcdn.com/icons/rs1001.png?n=72&d=RIGHT"
                                }],
                            "index": 16,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Keep right to take I-77 N via EXIT 72 toward Bluefield/Charleston W VA (Portions toll) (Crossing into West Virginia).",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_slight_right_sm.gif",
                            "distance": 73.703,
                            "time": 4305,
                            "linkIds": [],
                            "streets": ["I-77 N"],
                            "attributes": 3201,
                            "transportMode": "AUTO",
                            "formattedTime": "01:11:45",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -81.061271,
                                "lat": 36.959709
                            },
                            "turnType": 1
                        },
                        {
                            "signs": [{
                                    "text": "19",
                                    "extraText": "ALT",
                                    "direction": 1,
                                    "type": 2,
                                    "url": "http://icons.mqcdn.com/icons/rs2.png?n=19&d=NORTH&v=ALT"
                                },
                                {
                                    "text": "48",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 1001,
                                    "url": "http://icons.mqcdn.com/icons/rs1001.png?n=48&d=RIGHT"
                                }],
                            "index": 17,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Merge onto US-19 Alt N via EXIT 48 toward US-19/North Beckley/Summersville.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_merge_right_sm.gif",
                            "distance": 2.058,
                            "time": 140,
                            "linkIds": [],
                            "streets": ["US-19 Alt N"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:02:20",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -81.21379,
                                "lat": 37.832988
                            },
                            "turnType": 10
                        },
                        {
                            "signs": [{
                                    "text": "19",
                                    "extraText": "",
                                    "direction": 1,
                                    "type": 2,
                                    "url": "http://icons.mqcdn.com/icons/rs2.png?n=19&d=NORTH"
                                }],
                            "index": 18,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "US-19 Alt N becomes US-19 N.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_straight_sm.gif",
                            "distance": 66.653,
                            "time": 4092,
                            "linkIds": [],
                            "streets": ["US-19 N"],
                            "attributes": 1152,
                            "transportMode": "AUTO",
                            "formattedTime": "01:08:12",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -81.191169,
                                "lat": 37.853931
                            },
                            "turnType": 0
                        },
                        {
                            "signs": [{
                                    "text": "79",
                                    "extraText": "",
                                    "direction": 1,
                                    "type": 1,
                                    "url": "http://icons.mqcdn.com/icons/rs1.png?n=79&d=NORTH"
                                }],
                            "index": 19,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Merge onto I-79 N toward Clarksburg (Crossing into Pennsylvania).",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_merge_right_sm.gif",
                            "distance": 279.351,
                            "time": 15295,
                            "linkIds": [],
                            "streets": ["I-79 N"],
                            "attributes": 1152,
                            "transportMode": "AUTO",
                            "formattedTime": "04:14:55",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -80.751937,
                                "lat": 38.614234
                            },
                            "turnType": 10
                        },
                        {
                            "signs": [{
                                    "text": "90",
                                    "extraText": "",
                                    "direction": 8,
                                    "type": 1,
                                    "url": "http://icons.mqcdn.com/icons/rs1.png?n=90&d=EAST"
                                },
                                {
                                    "text": "178A",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 1001,
                                    "url": "http://icons.mqcdn.com/icons/rs1001.png?n=178A&d=RIGHT"
                                }],
                            "index": 20,
                            "maneuverNotes": [],
                            "direction": 8,
                            "narrative": "Merge onto I-90 E via EXIT 178A toward Buffalo (Portions toll) (Crossing into New York).",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_merge_right_sm.gif",
                            "distance": 94.252,
                            "time": 5367,
                            "linkIds": [],
                            "streets": ["I-90 E"],
                            "attributes": 1153,
                            "transportMode": "AUTO",
                            "formattedTime": "01:29:27",
                            "directionName": "East",
                            "startPoint": {
                                "lng": -80.122802,
                                "lat": 42.026477
                            },
                            "turnType": 10
                        },
                        {
                            "signs": [{
                                    "text": "53",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 1001,
                                    "url": "http://icons.mqcdn.com/icons/rs1001.png?n=53&d=RIGHT"
                                }],
                            "index": 21,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Take the I-90 N exit, EXIT 53, toward Downtown Buffalo/Niagara Falls.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_gr_exitright_sm.gif",
                            "distance": 0.558,
                            "time": 42,
                            "linkIds": [],
                            "streets": [],
                            "attributes": 1024,
                            "transportMode": "AUTO",
                            "formattedTime": "00:00:42",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -78.790008,
                                "lat": 42.870994
                            },
                            "turnType": 14
                        },
                        {
                            "signs": [{
                                    "text": "190",
                                    "extraText": "",
                                    "direction": 1,
                                    "type": 1,
                                    "url": "http://icons.mqcdn.com/icons/rs1.png?n=190&d=NORTH"
                                }],
                            "index": 22,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Merge onto I-190 N/Niagara Trwy N.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_merge_right_sm.gif",
                            "distance": 6.293,
                            "time": 398,
                            "linkIds": [],
                            "streets": ["I-190 N", "Niagara Trwy N"],
                            "attributes": 1152,
                            "transportMode": "AUTO",
                            "formattedTime": "00:06:38",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -78.792694,
                                "lat": 42.876201
                            },
                            "turnType": 10
                        },
                        {
                            "signs": [{
                                    "text": "9",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 1001,
                                    "url": "http://icons.mqcdn.com/icons/rs1001.png?n=9&d=RIGHT"
                                }],
                            "index": 23,
                            "maneuverNotes": [],
                            "direction": 2,
                            "narrative": "Take EXIT 9 toward Peace Bridge/Ft Erie Can.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_gr_exitright_sm.gif",
                            "distance": 0.247,
                            "time": 22,
                            "linkIds": [],
                            "streets": [],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:00:22",
                            "directionName": "Northwest",
                            "startPoint": {
                                "lng": -78.897491,
                                "lat": 42.898151
                            },
                            "turnType": 14
                        },
                        {
                            "signs": [],
                            "index": 24,
                            "maneuverNotes": [],
                            "direction": 3,
                            "narrative": "Merge onto Peace Bridge Plz.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_merge_right_sm.gif",
                            "distance": 0.162,
                            "time": 31,
                            "linkIds": [],
                            "streets": ["Peace Bridge Plz"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:00:31",
                            "directionName": "Northeast",
                            "startPoint": {
                                "lng": -78.899673,
                                "lat": 42.901306
                            },
                            "turnType": 10
                        },
                        {
                            "signs": [],
                            "index": 25,
                            "maneuverNotes": [],
                            "direction": 7,
                            "narrative": "Peace Bridge Plz becomes Peace Bridge (Portions toll) (Crossing into Ontario, Canada).",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_straight_sm.gif",
                            "distance": 0.836,
                            "time": 386,
                            "linkIds": [],
                            "streets": ["Peace Bridge"],
                            "attributes": 1217,
                            "transportMode": "AUTO",
                            "formattedTime": "00:06:26",
                            "directionName": "West",
                            "startPoint": {
                                "lng": -78.897933,
                                "lat": 42.903018
                            },
                            "turnType": 0
                        },
                        {
                            "signs": [{
                                    "text": "QEW",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 22,
                                    "url": "http://icons.mqcdn.com/icons/rs22.png?n=QEW"
                                }],
                            "index": 26,
                            "maneuverNotes": [],
                            "direction": 7,
                            "narrative": "Peace Bridge becomes Queen Elizabeth Way (Portions toll).",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_straight_sm.gif",
                            "distance": 74.721,
                            "time": 4120,
                            "linkIds": [],
                            "streets": ["Queen Elizabeth Way"],
                            "attributes": 1153,
                            "transportMode": "AUTO",
                            "formattedTime": "01:08:40",
                            "directionName": "West",
                            "startPoint": {
                                "lng": -78.911773,
                                "lat": 42.907745
                            },
                            "turnType": 0
                        },
                        {
                            "signs": [{
                                    "text": "QEW",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 22,
                                    "url": "http://icons.mqcdn.com/icons/rs22.png?n=QEW"
                                }],
                            "index": 27,
                            "maneuverNotes": [],
                            "direction": 3,
                            "narrative": "Keep left to take Queen Elizabeth Way toward Toronto/Downtown/Centrevllie.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_slight_left_sm.gif",
                            "distance": 10.985,
                            "time": 604,
                            "linkIds": [],
                            "streets": ["Queen Elizabeth Way"],
                            "attributes": 1152,
                            "transportMode": "AUTO",
                            "formattedTime": "00:10:04",
                            "directionName": "Northeast",
                            "startPoint": {
                                "lng": -79.6725,
                                "lat": 43.480987
                            },
                            "turnType": 7
                        },
                        {
                            "signs": [{
                                    "text": "427",
                                    "extraText": "",
                                    "direction": 1,
                                    "type": 22,
                                    "url": "http://icons.mqcdn.com/icons/rs22.png?n=427&d=NORTH"
                                },
                                {
                                    "text": "139",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 1001,
                                    "url": "http://icons.mqcdn.com/icons/rs1001.png?n=139&d=RIGHT"
                                }],
                            "index": 28,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Merge onto ON-427 (EXPRESS) N via EXIT 139 toward ON-401/Pearson.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_merge_right_sm.gif",
                            "distance": 4.235,
                            "time": 241,
                            "linkIds": [],
                            "streets": ["ON-427 (EXPRESS) N"],
                            "attributes": 1152,
                            "transportMode": "AUTO",
                            "formattedTime": "00:04:01",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -79.55445,
                                "lat": 43.609603
                            },
                            "turnType": 10
                        },
                        {
                            "signs": [],
                            "index": 29,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Take the ON-401 E exit.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_gr_exitright_sm.gif",
                            "distance": 0.962,
                            "time": 57,
                            "linkIds": [],
                            "streets": [],
                            "attributes": 1024,
                            "transportMode": "AUTO",
                            "formattedTime": "00:00:57",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -79.573165,
                                "lat": 43.667415
                            },
                            "turnType": 14
                        },
                        {
                            "signs": [{
                                    "text": "401",
                                    "extraText": "",
                                    "direction": 8,
                                    "type": 22,
                                    "url": "http://icons.mqcdn.com/icons/rs22.png?n=401&d=EAST"
                                }],
                            "index": 30,
                            "maneuverNotes": [],
                            "direction": 8,
                            "narrative": "Merge onto ON-401 (EXPRESS) E/Macdonald Cartier Freeway E.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_merge_right_sm.gif",
                            "distance": 1.614,
                            "time": 115,
                            "linkIds": [],
                            "streets": ["ON-401 (EXPRESS) E", "Macdonald Cartier Freeway E"],
                            "attributes": 1152,
                            "transportMode": "AUTO",
                            "formattedTime": "00:01:55",
                            "directionName": "East",
                            "startPoint": {
                                "lng": -79.575675,
                                "lat": 43.680423
                            },
                            "turnType": 10
                        },
                        {
                            "signs": [{
                                    "text": "401",
                                    "extraText": "",
                                    "direction": 8,
                                    "type": 22,
                                    "url": "http://icons.mqcdn.com/icons/rs22.png?n=401&d=EAST"
                                }],
                            "index": 31,
                            "maneuverNotes": [],
                            "direction": 8,
                            "narrative": "Keep left to take ON-401 (EXPRESS) E/Macdonald Cartier Freeway E.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_slight_left_sm.gif",
                            "distance": 1.988,
                            "time": 142,
                            "linkIds": [],
                            "streets": ["ON-401 (EXPRESS) E", "Macdonald Cartier Freeway E"],
                            "attributes": 1152,
                            "transportMode": "AUTO",
                            "formattedTime": "00:02:22",
                            "directionName": "East",
                            "startPoint": {
                                "lng": -79.560989,
                                "lat": 43.701126
                            },
                            "turnType": 7
                        },
                        {
                            "signs": [{
                                    "text": "400",
                                    "extraText": "",
                                    "direction": 1,
                                    "type": 22,
                                    "url": "http://icons.mqcdn.com/icons/rs22.png?n=400&d=NORTH"
                                },
                                {
                                    "text": "359",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 1001,
                                    "url": "http://icons.mqcdn.com/icons/rs1001.png?n=359&d=RIGHT"
                                }],
                            "index": 32,
                            "maneuverNotes": [],
                            "direction": 1,
                            "narrative": "Merge onto ON-400 N via EXIT 359 toward Barrie.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_merge_right_sm.gif",
                            "distance": 138.394,
                            "time": 7570,
                            "linkIds": [],
                            "streets": ["ON-400 N"],
                            "attributes": 1152,
                            "transportMode": "AUTO",
                            "formattedTime": "02:06:10",
                            "directionName": "North",
                            "startPoint": {
                                "lng": -79.528282,
                                "lat": 43.715061
                            },
                            "turnType": 10
                        },
                        {
                            "signs": [{
                                    "text": "69",
                                    "extraText": "",
                                    "direction": 1,
                                    "type": 22,
                                    "url": "http://icons.mqcdn.com/icons/rs22.png?n=69&d=NORTH"
                                }],
                            "index": 33,
                            "maneuverNotes": [],
                            "direction": 2,
                            "narrative": "ON-400 N becomes TC N/ON-69 N.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_straight_sm.gif",
                            "distance": 86.615,
                            "time": 5060,
                            "linkIds": [],
                            "streets": ["TC N", "ON-69 N"],
                            "attributes": 1152,
                            "transportMode": "AUTO",
                            "formattedTime": "01:24:20",
                            "directionName": "Northwest",
                            "startPoint": {
                                "lng": -80.132423,
                                "lat": 45.440975
                            },
                            "turnType": 0
                        },
                        {
                            "signs": [{
                                    "text": "17",
                                    "extraText": "",
                                    "direction": 7,
                                    "type": 22,
                                    "url": "http://icons.mqcdn.com/icons/rs22.png?n=17&d=WEST"
                                }],
                            "index": 34,
                            "maneuverNotes": [],
                            "direction": 7,
                            "narrative": "Merge onto TC W/ON-17 W toward Sault Ste Marie.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_merge_right_sm.gif",
                            "distance": 43.347,
                            "time": 2634,
                            "linkIds": [],
                            "streets": ["TC W", "ON-17 W"],
                            "attributes": 1152,
                            "transportMode": "AUTO",
                            "formattedTime": "00:43:54",
                            "directionName": "West",
                            "startPoint": {
                                "lng": -80.967842,
                                "lat": 46.43581
                            },
                            "turnType": 10
                        },
                        {
                            "signs": [{
                                    "text": "6",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 22,
                                    "url": "http://icons.mqcdn.com/icons/rs22.png?n=6"
                                }],
                            "index": 35,
                            "maneuverNotes": [],
                            "direction": 4,
                            "narrative": "Turn left onto ON-6/Highway 6. Continue to follow ON-6.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_left_sm.gif",
                            "distance": 32.172,
                            "time": 2571,
                            "linkIds": [],
                            "streets": ["ON-6"],
                            "attributes": 1024,
                            "transportMode": "AUTO",
                            "formattedTime": "00:42:51",
                            "directionName": "South",
                            "startPoint": {
                                "lng": -81.776634,
                                "lat": 46.285964
                            },
                            "turnType": 6
                        },
                        {
                            "signs": [{
                                    "text": "6",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 22,
                                    "url": "http://icons.mqcdn.com/icons/rs22.png?n=6"
                                }],
                            "index": 36,
                            "maneuverNotes": [],
                            "direction": 4,
                            "narrative": "Turn left onto Manitowaning Rd/ON-6. Continue to follow ON-6.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_left_sm.gif",
                            "distance": 31.751,
                            "time": 2394,
                            "linkIds": [],
                            "streets": ["ON-6"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:39:54",
                            "directionName": "South",
                            "startPoint": {
                                "lng": -81.924789,
                                "lat": 45.978691
                            },
                            "turnType": 6
                        },
                        {
                            "signs": [{
                                    "text": "542",
                                    "extraText": "",
                                    "direction": 0,
                                    "type": 23,
                                    "url": "http://icons.mqcdn.com/icons/rs23.png?n=542"
                                }],
                            "index": 37,
                            "maneuverNotes": [],
                            "direction": 2,
                            "narrative": "Turn right onto Highway 542/ON-542.",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_right_sm.gif",
                            "distance": 0.176,
                            "time": 29,
                            "linkIds": [],
                            "streets": ["Highway 542", "ON-542"],
                            "attributes": 0,
                            "transportMode": "AUTO",
                            "formattedTime": "00:00:29",
                            "directionName": "Northwest",
                            "startPoint": {
                                "lng": -81.974563,
                                "lat": 45.655063
                            },
                            "turnType": 2
                        },
                        {
                            "signs": [],
                            "index": 38,
                            "maneuverNotes": [],
                            "direction": 3,
                            "narrative": "Turn right (Portions unpaved).",
                            "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-end_sm.gif",
                            "distance": 0.106,
                            "time": 38,
                            "linkIds": [],
                            "streets": [],
                            "attributes": 2,
                            "transportMode": "AUTO",
                            "formattedTime": "00:00:38",
                            "directionName": "Northeast",
                            "startPoint": {
                                "lng": -81.977394,
                                "lat": 45.656375
                            },
                            "turnType": 2
                        }],
                    "hasFerry": false
                }],
            "formattedTime": "19:16:38",
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
                "doReverseGeocode": true,
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
                "text": "© 2016 MapQuest, Inc.",
                "imageUrl": "http://api.mqcdn.com/res/mqlogo.gif",
                "imageAltText": "© 2016 MapQuest, Inc."
            },
            "statuscode": 0,
            "messages": []
        }
    };
});
define("ux/serializers/serializer", ["require", "exports"], function (require, exports) {
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
                    "marker-size": "medium",
                    "marker-symbol": "bus",
                    "marker-color": "#fff",
                    "stroke": "#555555",
                    "stroke-opacity": 1.0,
                    "stroke-width": 2,
                    "fill": "#555555",
                    "fill-opacity": 0.5
                }
            }]
    };
});
define("ux/serializers/ags-simplemarkersymbol", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    function doif(v, cb) {
        if (typeof v !== "undefined")
            cb(v);
    }
    function asAngle(radian) {
        return Math.round(180 / Math.PI * radian);
    }
    function asColor(color) {
        if (color.length == 4 && color[3] > 1) {
            color[3] /= 255.0;
        }
        return ol.color.asString(color);
    }
    function toAgs(value) {
        return value * 4 / 3;
    }
    function fromAgs(value) {
        return value * 3 / 4;
    }
    var SimpleMarkerConverter = (function () {
        function SimpleMarkerConverter() {
        }
        SimpleMarkerConverter.prototype.toJson = function (style) {
            var result = {
                type: "esriSMS"
            };
            this.serializeStyle(style, result);
            return result;
        };
        SimpleMarkerConverter.prototype.fromJson = function (json) {
            if (json.type !== "esriSMS")
                throw "invalid symbol type: " + json.type;
            switch (json.style) {
                case "esriSMSPath": return this.deserializePath(json);
                case "esriSMSCircle": return this.deserializeCircle(json);
                case "esriSMSCross": return this.deserializeCross(json);
                case "esriSMSDiamond": return this.deserializeDiamond(json);
                case "esriSMSSquare": return this.deserializeSquare(json);
                case "esriSMSX": return this.deserializeX(json);
            }
            throw "unknown symbol style: " + json.style;
        };
        SimpleMarkerConverter.prototype.serializeStyle = function (style, result) {
            var _this = this;
            var s = style;
            if (s instanceof ol.style.Circle) {
                result.style = "esriSMSCircle";
                doif(s.getFill(), function (v) { return _this.serializeStyle(v, result); });
                doif(s.getImage(), function (v) { return _this.serializeStyle(v, result); });
                s.getOpacity();
                doif(s.getRotation(), function (v) { return result.angle = v; });
                s.getScale();
                doif(s.getStroke(), function (v) { return _this.serializeStyle(v, result); });
                doif(s.getRadius(), function (v) { return result.size = 1.5 * v; });
            }
            else if (s instanceof ol.style.Fill) {
                result.color = ol.color.asArray(s.getColor());
            }
            else if (s instanceof ol.style.Icon) {
                debugger;
                result.style = "esriSMSPath";
                s.getFill();
                s.getImage();
                s.getOpacity();
                s.getRotation();
                s.getScale();
                s.getStroke();
                s.getText();
            }
            else if (s instanceof ol.style.RegularShape) {
                var points = s.getPoints();
                var r1 = s.getRadius();
                var r2 = s.getRadius2();
                var angle = s.getAngle();
                var rotation = s.getRotation();
                rotation = asAngle(angle + rotation);
                result.size = r1;
                doif(s.getStroke(), function (v) { return _this.serializeStyle(v, result); });
                if (points === 8 && r2 === 0) {
                    if (rotation === 0) {
                        result.style = "esriSMSCross";
                        result.size *= Math.sqrt(2);
                    }
                    else if (rotation === 45) {
                        result.style = "esriSMSX";
                    }
                }
                else if (points === 4 && r2 === r1) {
                    if (rotation === 0) {
                        result.style = "esriSMSDiamond";
                        result.size *= Math.sqrt(2);
                    }
                    else if (rotation === 45) {
                        result.style = "esriSMSSquare";
                    }
                }
                if (!result.style) {
                    result.style = "esriSMSPath";
                    result.size *= Math.sqrt(2);
                    var strokeWidth = result.outline.width;
                    var size = 2 * (r1 + strokeWidth) + 1;
                    var path = [];
                    for (var i = 0; i <= points; i++) {
                        var angle0 = i * 2 * Math.PI / points - Math.PI / 2 + angle;
                        var radiusC = i % 2 === 0 ? r1 : r2;
                        var _a = [size / 2 + radiusC * Math.cos(angle0), size / 2 + radiusC * Math.sin(angle0)], x = _a[0], y = _a[1];
                        i === 0 ? path.push("M" + x + " " + y) : path.push("L" + x + " " + y);
                    }
                    path.push("Z");
                    result.path = path.join(" ");
                }
                doif(s.getFill(), function (v) { return result.color = v.getColor(); });
                doif(s.getImage(), function (v) { return _this.serializeStyle(v, result); });
                s.getOpacity();
                s.getScale();
            }
            else if (s instanceof ol.style.Stroke) {
                result.outline = result.outline || {};
                doif(s.getColor(), function (v) { return result.outline.color = v; });
                s.getLineCap();
                s.getLineDash();
                s.getLineJoin();
                s.getMiterLimit();
                doif(s.getWidth(), function (v) { return result.outline.width = fromAgs(v); });
            }
            else if (s instanceof ol.style.Text) {
                debugger;
            }
            else if (s instanceof ol.style.Image) {
                s.getOpacity();
                s.getScale();
            }
            else if (s instanceof ol.style.Style) {
                var fill = s.getFill();
                if (fill) {
                    result.color = ol.color.asArray(fill.getColor());
                }
                var image = s.getImage();
                if (image) {
                    this.serializeStyle(image, result);
                }
            }
        };
        SimpleMarkerConverter.prototype.deserializePath = function (json) {
            var canvas = document.createElement("canvas");
            var size = 2 * toAgs(json.size);
            var svgdata = "\n        <svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" \n            x=\"" + json.xoffset + "px\" y=\"" + json.yoffset + "px\" width=\"" + size + "px\" height=\"" + size + "px\" \n            xml:space=\"preserve\">\n\n        <path d=\"" + json.path + "\" \n            fill=\"" + asColor(json.color) + "\" \n            stroke=\"" + asColor(json.outline.color) + "\" \n            stroke-width=\"" + toAgs(json.outline.width) + "\" \n            stroke-linecap=\"butt\" \n            stroke-linejoin=\"miter\" \n            stroke-miterlimit=\"4\"\n            stroke-dasharray=\"none\" \n            fill-rule=\"evenodd\"\n            transform=\"rotate(" + json.angle + " " + (json.xoffset + json.size) + " " + (json.yoffset + json.size) + ")\"\n        />\n\n        </svg>";
            return new ol.style.Style({
                image: new ol.style.Icon({
                    src: "data:image/svg+xml;utf8," + svgdata
                })
            });
        };
        SimpleMarkerConverter.prototype.deserializeCircle = function (json) {
            return new ol.style.Style({
                image: new ol.style.Circle({
                    radius: toAgs(json.size / 2),
                    fill: new ol.style.Fill({
                        color: asColor(json.color)
                    }),
                    stroke: new ol.style.Stroke({
                        color: asColor(json.outline.color),
                        width: toAgs(json.outline.width),
                        lineJoin: "",
                        lineDash: [],
                        miterLimit: 4
                    })
                })
            });
        };
        SimpleMarkerConverter.prototype.deserializeCross = function (json) {
            return new ol.style.Style({
                image: new ol.style.RegularShape({
                    points: 4,
                    angle: 0,
                    radius: toAgs(json.size / 2),
                    radius2: 0,
                    fill: new ol.style.Fill({
                        color: asColor(json.color)
                    }),
                    stroke: new ol.style.Stroke({
                        color: asColor(json.outline.color),
                        width: toAgs(json.outline.width),
                        lineJoin: "",
                        lineDash: [],
                        miterLimit: 4
                    })
                })
            });
        };
        SimpleMarkerConverter.prototype.deserializeDiamond = function (json) {
            return new ol.style.Style({
                image: new ol.style.RegularShape({
                    points: 4,
                    radius: toAgs(json.size / 2),
                    radius2: toAgs(json.size / 2),
                    angle: json.angle,
                    fill: new ol.style.Fill({
                        color: asColor(json.color)
                    }),
                    stroke: new ol.style.Stroke({
                        color: asColor(json.outline.color),
                        width: toAgs(json.outline.width),
                        lineJoin: "",
                        lineDash: [],
                        miterLimit: 4
                    })
                })
            });
        };
        SimpleMarkerConverter.prototype.deserializeSquare = function (json) {
            return new ol.style.Style({
                image: new ol.style.RegularShape({
                    points: 4,
                    radius: toAgs(json.size / Math.sqrt(2)),
                    radius2: toAgs(json.size / Math.sqrt(2)),
                    angle: Math.PI / 4,
                    fill: new ol.style.Fill({
                        color: asColor(json.color)
                    }),
                    stroke: new ol.style.Stroke({
                        color: asColor(json.outline.color),
                        width: toAgs(json.outline.width),
                        lineJoin: "",
                        lineDash: [],
                        miterLimit: 4
                    })
                })
            });
        };
        SimpleMarkerConverter.prototype.deserializeX = function (json) {
            return new ol.style.Style({
                image: new ol.style.RegularShape({
                    points: 4,
                    radius: toAgs(json.size / Math.sqrt(2)),
                    radius2: 0,
                    angle: Math.PI / 4,
                    fill: new ol.style.Fill({
                        color: asColor(json.color)
                    }),
                    stroke: new ol.style.Stroke({
                        color: asColor(json.outline.color),
                        width: toAgs(json.outline.width),
                        lineJoin: "",
                        lineDash: [],
                        miterLimit: 4
                    })
                })
            });
        };
        return SimpleMarkerConverter;
    }());
    exports.SimpleMarkerConverter = SimpleMarkerConverter;
});
define("ux/styles/basic", ["require", "exports"], function (require, exports) {
    "use strict";
    var stroke = {
        color: 'black',
        width: 2
    };
    var fill = {
        color: 'red'
    };
    var radius = 10;
    var opacity = 0.5;
    var square = {
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: radius,
        angle: Math.PI / 4
    };
    var diamond = {
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: radius,
        angle: 0
    };
    var triangle = {
        fill: fill,
        stroke: stroke,
        points: 3,
        radius: radius,
        angle: 0
    };
    var star = {
        fill: fill,
        stroke: stroke,
        points: 5,
        radius: radius,
        radius2: 4,
        angle: 0
    };
    var cross = {
        opacity: opacity,
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: radius,
        radius2: 0,
        angle: 0
    };
    var x = {
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: radius,
        radius2: 0,
        angle: Math.PI / 4
    };
    return {
        cross: [{ star: cross }],
        square: [{ star: square }],
        diamond: [{ star: diamond }],
        star: [{ star: star }],
        triangle: [{ star: triangle }],
        x: [{ star: x }]
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
define("ux/serializers/coretech", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    function doif(v, cb) {
        if (typeof v !== "undefined")
            cb(v);
    }
    function mixin(a, b) {
        Object.keys(b).forEach(function (k) { return a[k] = b[k]; });
        return a;
    }
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
                mixin(s, this.serializeColor(style.getColor()));
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
                this.assign(s, "points", style.getPoints());
            if (style.getAngle)
                this.assign(s, "angle", style.getAngle());
            if (style.getRotation)
                this.assign(s, "rotation", style.getRotation());
            if (s.points && s.radius !== s.radius2)
                s.points /= 2;
            return s;
        };
        CoretechConverter.prototype.serializeColor = function (color) {
            if (color instanceof Array) {
                return {
                    color: ol.color.asString(color)
                };
            }
            else if (color instanceof CanvasGradient) {
                return {
                    gradient: color
                };
            }
            else if (color instanceof CanvasPattern) {
                return {
                    pattern: color
                };
            }
            else if (typeof color === "string") {
                return {
                    color: color
                };
            }
            throw "unknown color type";
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
                angle: json.angle,
                fill: this.deserializeFill(json.fill),
                stroke: this.deserializeStroke(json.stroke)
            });
            doif(json.rotation, function (v) { return image.setRotation(v); });
            doif(json.opacity, function (v) { return image.setOpacity(v); });
            return image;
        };
        CoretechConverter.prototype.deserializeFill = function (json) {
            var fill = new ol.style.Fill({
                color: this.deserializeColor(json)
            });
            return fill;
        };
        CoretechConverter.prototype.deserializeStroke = function (json) {
            var stroke = new ol.style.Stroke();
            doif(json.color, function (v) { return stroke.setColor(v); });
            doif(json.width, function (v) { return stroke.setWidth(v); });
            return stroke;
        };
        CoretechConverter.prototype.deserializeColor = function (fill) {
            if (fill.color) {
                return fill.color;
            }
            if (fill.gradient) {
                var type = fill.gradient.type;
                var gradient_1;
                if (0 === type.indexOf("linear(")) {
                    gradient_1 = this.deserializeLinearGradient(fill.gradient);
                }
                else if (0 === type.indexOf("radial(")) {
                    gradient_1 = this.deserializeRadialGradient(fill.gradient);
                }
                if (fill.gradient.stops) {
                    mixin(gradient_1, {
                        stops: fill.gradient.stops
                    });
                    var stops = fill.gradient.stops.split(";");
                    stops = stops.map(function (v) { return v.trim(); });
                    var colorStops = stops.forEach(function (colorstop) {
                        var stop = colorstop.match(/ \d+%/m)[0];
                        var color = colorstop.substr(0, colorstop.length - stop.length);
                        gradient_1.addColorStop(parseInt(stop) / 100, color);
                    });
                }
                return gradient_1;
            }
            if (fill.pattern) {
                var repitition = fill.pattern.repitition;
                var canvas = document.createElement('canvas');
                var spacing = canvas.width = canvas.height = fill.pattern.spacing | 6;
                var context = canvas.getContext('2d');
                context.fillStyle = fill.pattern.color;
                switch (fill.pattern.orientation) {
                    case "horizontal":
                        for (var i = 0; i < spacing; i++) {
                            context.fillRect(i, 0, 1, 1);
                        }
                        break;
                    case "vertical":
                        for (var i = 0; i < spacing; i++) {
                            context.fillRect(0, i, 1, 1);
                        }
                        break;
                    case "cross":
                        for (var i = 0; i < spacing; i++) {
                            context.fillRect(i, 0, 1, 1);
                            context.fillRect(0, i, 1, 1);
                        }
                        break;
                    case "forward":
                        for (var i = 0; i < spacing; i++) {
                            context.fillRect(i, i, 1, 1);
                        }
                        break;
                    case "backward":
                        for (var i = 0; i < spacing; i++) {
                            context.fillRect(spacing - 1 - i, i, 1, 1);
                        }
                        break;
                    case "diagonal":
                        for (var i = 0; i < spacing; i++) {
                            context.fillRect(i, i, 1, 1);
                            context.fillRect(spacing - 1 - i, i, 1, 1);
                        }
                        break;
                }
                return mixin(context.createPattern(canvas, repitition), fill.pattern);
            }
            throw "invalid color configuration";
        };
        CoretechConverter.prototype.deserializeLinearGradient = function (json) {
            var rx = /\w+\((.*)\)/m;
            var _a = JSON.parse(json.type.replace(rx, "[$1]")), x0 = _a[0], y0 = _a[1], x1 = _a[2], y1 = _a[3];
            var canvas = document.createElement('canvas');
            canvas.width = Math.max(x0, x1);
            canvas.height = Math.max(y0, y1);
            var context = canvas.getContext('2d');
            var gradient = context.createLinearGradient(x0, y0, x1, y1);
            mixin(gradient, {
                type: "linear(" + [x0, y0, x1, y1].join(",") + ")"
            });
            return gradient;
        };
        CoretechConverter.prototype.deserializeRadialGradient = function (json) {
            var rx = /radial\((.*)\)/m;
            var _a = JSON.parse(json.type.replace(rx, "[$1]")), x0 = _a[0], y0 = _a[1], r0 = _a[2], x1 = _a[3], y1 = _a[4], r1 = _a[5];
            var canvas = document.createElement('canvas');
            canvas.width = 2 * Math.max(x0, x1);
            canvas.height = 2 * Math.max(y0, y1);
            var context = canvas.getContext('2d');
            var gradient = context.createRadialGradient(x0, y0, r0, x1, y1, r1);
            mixin(gradient, {
                type: "radial(" + [x0, y0, r0, x1, y1, r1].join(",") + ")"
            });
            return gradient;
        };
        return CoretechConverter;
    }());
    exports.CoretechConverter = CoretechConverter;
});
define("ux/styles/gradient", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "circle": {
                "fill": {
                    "color": "rgba(197,37,84,0.2)",
                    "gradient": ["rgba(197,37,84,0.2)", "rgba(197,37,84,0.8)"]
                },
                "opacity": 1,
                "stroke": {
                    "color": "rgba(227,83,105,0.5)",
                    "width": 4
                },
                "radius": 7
            }
        }
    ];
});
define("ux/style-generator", ["require", "exports", "openlayers", "ux/styles/basic", "ux/serializers/coretech"], function (require, exports, ol, basic_styles, Coretech) {
    "use strict";
    var converter = new Coretech.CoretechConverter();
    var orientations = "forward,backward,diagonal,horizontal,vertical,cross".split(",");
    function mixin(a, b) {
        Object.keys(b).forEach(function (k) { return a[k] = b[k]; });
        return a;
    }
    var range = function (n) {
        var result = new Array(n);
        for (var i = 0; i < n; i++)
            result[i] = i;
        return result;
    };
    var randint = function (n) { return Math.round(n * Math.random()); };
    var StyleGenerator = (function () {
        function StyleGenerator(options) {
            this.options = options;
        }
        StyleGenerator.prototype.asPoints = function () {
            return 3 + Math.round(10 * Math.random());
        };
        StyleGenerator.prototype.asRadius = function () {
            return 14 + Math.round(10 * Math.random());
        };
        StyleGenerator.prototype.asWidth = function () {
            return 1 + Math.round(20 * Math.random() * Math.random());
        };
        StyleGenerator.prototype.asPastel = function () {
            var _a = [255, 255, 255].map(function (n) { return Math.round((1 - Math.random() * Math.random()) * n); }), r = _a[0], g = _a[1], b = _a[2];
            return [r, g, b, (10 + randint(50)) / 100];
        };
        StyleGenerator.prototype.asRgb = function () {
            return [255, 255, 255].map(function (n) { return Math.round((Math.random() * Math.random()) * n); });
        };
        StyleGenerator.prototype.asRgba = function () {
            var color = this.asRgb();
            color.push((10 + randint(90)) / 100);
            return color;
        };
        StyleGenerator.prototype.asFill = function () {
            var fill = new ol.style.Fill({
                color: this.asPastel()
            });
            return fill;
        };
        StyleGenerator.prototype.asStroke = function () {
            var stroke = new ol.style.Stroke({
                width: this.asWidth(),
                color: this.asRgba()
            });
            return stroke;
        };
        StyleGenerator.prototype.addColorStops = function (gradient) {
            var stops = [
                {
                    stop: 0,
                    color: "rgba(" + this.asRgba().join(",") + ")"
                },
                {
                    stop: 1,
                    color: "rgba(" + this.asRgba().join(",") + ")"
                }
            ];
            while (0.5 < Math.random()) {
                stops.push({
                    stop: 0.1 + randint(80) / 100,
                    color: "rgba(" + this.asRgba().join(",") + ")"
                });
            }
            stops = stops.sort(function (a, b) { return a.stop - b.stop; });
            stops.forEach(function (stop) { return gradient.addColorStop(stop.stop, stop.color); });
            mixin(gradient, {
                stops: stops.map(function (stop) { return (stop.color + " " + Math.round(100 * stop.stop) + "%"); }).join(";")
            });
        };
        StyleGenerator.prototype.asRadialGradient = function (context, radius) {
            var canvas = context.canvas;
            var _a = [
                canvas.width / 2, canvas.height / 2, radius,
                canvas.width / 2, canvas.height / 2, 0
            ], x0 = _a[0], y0 = _a[1], r0 = _a[2], x1 = _a[3], y1 = _a[4], r1 = _a[5];
            var gradient = context.createRadialGradient(x0, y0, r0, x1, y1, r1);
            return mixin(gradient, {
                type: "radial(" + [x0, y0, r0, x1, y1, r1].join(",") + ")"
            });
        };
        StyleGenerator.prototype.asLinearGradient = function (context, radius) {
            var _a = [
                randint(radius), 0,
                randint(radius), 2 * radius
            ], x0 = _a[0], y0 = _a[1], x1 = _a[2], y1 = _a[3];
            var gradient = context.createLinearGradient(x0, y0, x1, y1);
            return mixin(gradient, { type: "linear(" + [x0, y0, x1, y1].join(",") + ")" });
        };
        StyleGenerator.prototype.asGradient = function () {
            var radius = this.asRadius();
            var stroke = this.asStroke();
            var canvas = document.createElement('canvas');
            canvas.width = canvas.height = 2 * (radius + stroke.getWidth());
            var context = canvas.getContext('2d');
            var gradient;
            if (0.5 < Math.random()) {
                gradient = this.asLinearGradient(context, radius);
            }
            else {
                gradient = this.asRadialGradient(context, radius);
            }
            this.addColorStops(gradient);
            var fill = new ol.style.Fill({
                color: gradient
            });
            var style = new ol.style.Circle({
                fill: fill,
                radius: radius,
                stroke: stroke,
                snapToPixel: false
            });
            return style;
        };
        StyleGenerator.prototype.asPattern = function () {
            var radius = this.asRadius();
            var spacing = 3 + randint(5);
            var color = ol.color.asString(this.asRgb());
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            var orientation = orientations[Math.round((orientations.length - 1) * Math.random())];
            var pattern;
            switch (orientation) {
                case "horizontal":
                    canvas.width = 1;
                    canvas.height = 1 + randint(10);
                    context.strokeStyle = color;
                    context.beginPath();
                    context.lineWidth = 1 + randint(canvas.height);
                    context.strokeStyle = color;
                    context.moveTo(0, 0);
                    context.lineTo(canvas.width, 0);
                    context.stroke();
                    context.closePath();
                    pattern = context.createPattern(canvas, 'repeat');
                    break;
                case "vertical":
                    canvas.width = spacing;
                    canvas.height = spacing;
                    context.fillStyle = ol.color.asString(this.asRgba());
                    for (var i = 0; i < spacing; i++) {
                        context.fillRect(0, i, 1, 1);
                    }
                    pattern = context.createPattern(canvas, 'repeat');
                    break;
                case "cross":
                    canvas.width = spacing;
                    canvas.height = spacing;
                    context.fillStyle = color;
                    for (var i = 0; i < spacing; i++) {
                        context.fillRect(i, 0, 1, 1);
                        context.fillRect(0, i, 1, 1);
                    }
                    pattern = context.createPattern(canvas, 'repeat');
                    break;
                case "forward":
                    canvas.width = spacing;
                    canvas.height = spacing;
                    context.fillStyle = color;
                    for (var i = 0; i < spacing; i++) {
                        context.fillRect(i, i, 1, 1);
                    }
                    pattern = context.createPattern(canvas, 'repeat');
                    break;
                case "backward":
                    canvas.width = spacing;
                    canvas.height = spacing;
                    context.fillStyle = color;
                    for (var i = 0; i < spacing; i++) {
                        context.fillRect(spacing - 1 - i, i, 1, 1);
                    }
                    pattern = context.createPattern(canvas, 'repeat');
                    break;
                case "diagonal":
                    canvas.width = spacing;
                    canvas.height = spacing;
                    context.fillStyle = color;
                    for (var i = 0; i < spacing; i++) {
                        context.fillRect(i, i, 1, 1);
                        context.fillRect(spacing - 1 - i, i, 1, 1);
                    }
                    pattern = context.createPattern(canvas, 'repeat');
                    break;
                default:
                    throw "invalid orientation";
            }
            mixin(pattern, {
                orientation: orientation,
                color: color,
                spacing: spacing,
                repitition: "repeat"
            });
            var fill = new ol.style.Fill({
                color: pattern
            });
            var style = new ol.style.Circle({
                fill: fill,
                radius: radius,
                stroke: this.asStroke(),
                snapToPixel: false
            });
            return style;
        };
        StyleGenerator.prototype.asBasic = function () {
            var basic = [basic_styles.cross, basic_styles.x, basic_styles.square, basic_styles.diamond, basic_styles.star, basic_styles.triangle];
            var config = basic[Math.round((basic.length - 1) * Math.random())];
            return converter.fromJson(config[0]).getImage();
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
            style.getFill().setColor(this.asRgba());
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
            var gens = [function () { return _this.asStar(); }, function () { return _this.asCircle(); }, function () { return _this.asPoly(); }, function () { return _this.asBasic(); }, function () { return _this.asGradient(); }, function () { return _this.asPattern(); }];
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
define("ux/styles/ags/simplemarkersymbol-circle", ["require", "exports"], function (require, exports) {
    "use strict";
    var styles = [{
            "color": [
                255,
                255,
                255,
                64
            ],
            "size": 12,
            "angle": 0,
            "xoffset": 0,
            "yoffset": 0,
            "type": "esriSMS",
            "style": "esriSMSCircle",
            "outline": {
                "color": [
                    0,
                    0,
                    0,
                    255
                ],
                "width": 1,
                "type": "esriSLS",
                "style": "esriSLSSolid"
            }
        }];
    return styles;
});
define("ux/styles/ags/simplemarkersymbol-cross", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "color": [
                255,
                255,
                255,
                64
            ],
            "size": 12,
            "angle": 0,
            "xoffset": 0,
            "yoffset": 0,
            "type": "esriSMS",
            "style": "esriSMSCross",
            "outline": {
                "color": [
                    0,
                    0,
                    0,
                    255
                ],
                "width": 1,
                "type": "esriSLS",
                "style": "esriSLSSolid"
            }
        }
    ];
});
define("ux/styles/ags/simplemarkersymbol-square", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "color": [
                255,
                255,
                255,
                64
            ],
            "size": 12,
            "angle": 0,
            "xoffset": 0,
            "yoffset": 0,
            "type": "esriSMS",
            "style": "esriSMSSquare",
            "outline": {
                "color": [
                    0,
                    0,
                    0,
                    255
                ],
                "width": 1,
                "type": "esriSLS",
                "style": "esriSLSSolid"
            }
        }
    ];
});
define("ux/styles/ags/simplemarkersymbol-diamond", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "color": [
                255,
                255,
                255,
                64
            ],
            "size": 12,
            "angle": 0,
            "xoffset": 0,
            "yoffset": 0,
            "type": "esriSMS",
            "style": "esriSMSDiamond",
            "outline": {
                "color": [
                    0,
                    0,
                    0,
                    255
                ],
                "width": 1,
                "type": "esriSLS",
                "style": "esriSLSSolid"
            }
        }
    ];
});
define("ux/styles/ags/simplemarkersymbol-path", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "color": [
                255,
                255,
                255,
                64
            ],
            "size": 12,
            "angle": 0,
            "xoffset": 0,
            "yoffset": 0,
            "type": "esriSMS",
            "style": "esriSMSPath",
            "outline": {
                "color": [
                    0,
                    0,
                    0,
                    255
                ],
                "width": 1,
                "type": "esriSLS",
                "style": "esriSLSSolid"
            },
            "path": "M16,3.5c-4.142,0-7.5,3.358-7.5,7.5c0,4.143,7.5,18.121,7.5,18.121S23.5,15.143,23.5,11C23.5,6.858,20.143,3.5,16,3.5z M16,14.584c-1.979,0-3.584-1.604-3.584-3.584S14.021,7.416,16,7.416S19.584,9.021,19.584,11S17.979,14.584,16,14.584z"
        }
    ];
});
define("ux/styles/ags/simplemarkersymbol-x", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "color": [
                255,
                255,
                255,
                64
            ],
            "size": 12,
            "angle": 0,
            "xoffset": 0,
            "yoffset": 0,
            "type": "esriSMS",
            "style": "esriSMSX",
            "outline": {
                "color": [
                    0,
                    0,
                    0,
                    255
                ],
                "width": 1,
                "type": "esriSLS",
                "style": "esriSLSSolid"
            }
        }
    ];
});
define("ux/ags-symbols", ["require", "exports", "openlayers", "ux/serializers/ags-simplemarkersymbol", "ux/style-generator", "ux/styles/ags/simplemarkersymbol-circle", "ux/styles/ags/simplemarkersymbol-cross", "ux/styles/ags/simplemarkersymbol-square", "ux/styles/ags/simplemarkersymbol-diamond", "ux/styles/ags/simplemarkersymbol-path", "ux/styles/ags/simplemarkersymbol-x"], function (require, exports, ol, Formatter, StyleGenerator, circleSymbol, crossSymbol, squareSymbol, diamondSymbol, pathSymbol, xSymbol) {
    "use strict";
    var center = [-82.4, 34.85];
    function run() {
        var formatter = new Formatter.SimpleMarkerConverter();
        var generator = new StyleGenerator({
            center: center,
            fromJson: function (json) { return formatter.fromJson(json); }
        });
        var layer = generator.asMarkerLayer({
            markerCount: 50,
            styleCount: 1
        });
        var map = new ol.Map({
            target: "map",
            view: new ol.View({
                projection: 'EPSG:4326',
                center: center,
                zoom: 10
            }),
            layers: [layer]
        });
        var circleStyle = formatter.fromJson(circleSymbol[0]);
        var crossStyle = formatter.fromJson(crossSymbol[0]);
        var squareStyle = formatter.fromJson(squareSymbol[0]);
        var diamondStyle = formatter.fromJson(diamondSymbol[0]);
        var pathStyle = formatter.fromJson(pathSymbol[0]);
        var xStyle = formatter.fromJson(xSymbol[0]);
        var styles = [
            circleStyle,
            crossStyle,
            diamondStyle,
            pathStyle,
            squareStyle,
            xStyle
        ];
        layer.getSource().getFeatures().forEach(function (f, i) { return f.setStyle([styles[i % styles.length]]); });
    }
    exports.run = run;
});
define("ux/download", ["require", "exports", "openlayers", "jquery"], function (require, exports, ol, $) {
    "use strict";
    var proxy = 'http://localhost:94/proxy/proxy.ashx?';
    var center = [-82.4, 34.85];
    var html = "\n<div class='download'>\n    <h3>Print Preview Lab - Capturing Map Canvas</h3>\n    <p>\n    This lab only works locally because it requires a proxy and I'm not aware of a github proxy.\n    (Good luck searching for github+proxy) \n    </p>\n\n    <div class='area'>    \n        <label>Copy Map into toDataURL</label>\n        <div class='map'></div>\n        <button class='download-map'>Download</button>\n    </div>\n\n    <div class='area'>    \n        <label>We want to get the map to render into this canvas so that we can right-click and save the image</label>\n        <canvas class='canvas-preview'></canvas>\n    </div>\n\n    <div class='area'>    \n        <label>We want to get the map into this image so that we can get the image data</label>\n        <img class='image-preview'></img>\n    </div>\n\n    <div class='area'>    \n        <label>toDataURL</label>\n        <input class='data-url' spellcheck='false autocomplete='off' wrap='hard'></input>\n    </div>\n</div>";
    var css = "\n<style>\n    #map { \n        display: none;\n    }\n    .download {\n        padding: 20px;\n    }\n    .download .map {\n        width: 400px;\n        height: 400px;\n    }\n    .download label {\n        display: block;\n        vertical-align: top;\n    }\n    .download .area {\n        padding: 20px;\n        margin: 20px;\n        border: 1px solid black;\n    }\n    .download .image-preview, .download .canvas-preview {\n        border: 1px solid black;\n        padding: 20px;\n    }\n    .download .data-url {\n        overflow: auto;\n        width: 400px;\n    }\n</style>";
    var imageUrl = 'http://sampleserver1.arcgisonline.com/arcgis/rest/services/Demographics/ESRI_Census_USA/MapServer/export?F=image&FORMAT=PNG32&TRANSPARENT=true&layers=show%3A4&SIZE=256%2C256&BBOX=-10488383.273178745%2C4148390.399093086%2C-10410111.756214725%2C4226661.916057106&BBOXSR=3857&IMAGESR=3857&DPI=83';
    function copyTo(image, canvas) {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
    }
    function makeMap() {
        var map = new ol.Map({
            target: $(".download .map")[0],
            view: new ol.View({
                projection: 'EPSG:4326',
                center: center,
                zoom: 15
            }),
            layers: [new ol.layer.Tile({
                    source: new ol.source.OSM()
                })]
        });
        return map;
    }
    function run() {
        $(html).appendTo("body");
        $(css).appendTo("head");
        $(function () {
            ol.source.Image.defaultImageLoadFunction =
                function (image, src) {
                    return image.getImage().src = "" + proxy + src;
                };
            var map = makeMap();
            map.addLayer(new ol.layer.Image({
                source: new ol.source.ImageArcGISRest({
                    ratio: 1,
                    params: {},
                    url: 'http://sampleserver1.arcgisonline.com/arcgis/rest/services/Demographics/ESRI_Census_USA/MapServer'
                })
            }));
            $('.download-map').click(function () {
                map.once('postcompose', function (event) {
                    var canvas = event.context.canvas;
                    img.src = canvas.toDataURL();
                });
                map.updateSize();
            });
        });
        var img = $('.image-preview')[0];
        var canvas = $('.canvas-preview')[0];
        img.setAttribute("crossOrigin", "anonymous");
        img.src = proxy + imageUrl;
        img.onload = function () {
            copyTo(img, canvas);
            document.getElementsByClassName('data-url')[0].value = canvas.toDataURL();
        };
    }
    exports.run = run;
});
define("ux/image-data-viewer", ["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    var data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAA9CAYAAAAd1W/BAAAFf0lEQVRoBe1ZSW/bRhT+uFMSZcmSAnlpHCcokKZo0QU9t7321n/QnnvqHyjQn9Cf0GuvRU89Feg5AdIGDro5tuPd1mItJKWhyOKNRMRwpFjcZAviAATJ4XDee998b97MGwGAhwUu4gLbzk1PAUgZsOAIpC6w4ARAyoCUAQuOwO1xAQEAXTMu8ozlDcUJQ1sFCRBEASK/Dz95A8AdAJ7rwXNH6/QEF+uzBUAAJBmQNRGyJkDPy1BzCjRDgZqVucG9Th9904HdZuh3HTg9D07f46AksWuZDQAjw5WMCOOOhtJGHssbeeRKOiRF4pcoivA8MtTlF7MddE5N1HZbaOx3YNYZHHsERIy0Ja9LkGBDv1Z0AUsrGqoPiyjfLyJXzkLNqJBUCYIw3vHJBViPWNBD58zE8fMazrfb6NYdDPrxqZwoAIIIqFkB5U0Db31UQWmjCD2fgSgHm3udngO7ZeHk7xoOntZwcWhz1/BiwCExALjxOQGr7xax/sEdLK8XoWRVTBjwa0lNjCAQajtN7D0+QW3H5C4RFYRk5gABINqvPCri7sdVFNcKkHUltPGEDkULfSmDytsSf/bcY9RemHyCvBa9NzRIBABFA8qbOaw+KqGwshTZeF9/AkHLqijdK4CiBbMH3B0GzG8R/B7MGafon2J6rqJh9b0SyvdLkWg/ThxnQj6D6jtlVB7koRnEiHEtp6uL8Ot4AZJKo2+guF6AEpH24yUM3UHL6ag+LKOwRpPqpJbX18cKAB/9sobCmoHscvDZ/np1X7WQNRm5SpbLogVVWBbEDsBSNYOlqsFj/Ct1k3kihhXXCWz19gCQK+vIFHSIUqzYjkVQVmUYlSz0vHI7APA8ClVvXuGNtSRkJU2ISkZGpqBC1WlVGbyjWIeJ2R669X4oRYKrPvyDltIiLamlENYD8aXE7o0sOHjamAn9fcDI1XRDgaLTntqvnf4eCwPI+N8A0L1b62Hvydn0GkRtKQiQJJEz4MZc4AcAmwC+Hxnz7JddMMuJatp0/3seHObCdVyE2RdEZsBnAL4cqfo1AHqnvfy/vx9OZ0DEVoOBC7vTh9Pz00fBOowMAI3+5eK/P/91D2bdvvwpkWfaJbojBoQREAmArwB8eEUqvVM9lT9+fjF6SuZG2SNmMljNHpg9YxcoAPBH+6p5VE/fD5/VcPbfxdXPsb07fQet0y6sFgvl/6RIaAZ8C6A4wRSqp+9UHv/0z+gp5psHMIvh4qADq8l4QjWMhFAAULjzZ/xJQuk7taN5IIkJkfKF7ZMOmodd9DrObAH4cZLVV+p9F6EJMc6wSCHPvrBw8lcdrSMLboSIG5gBFOY+v2LopFcKjzwsWg4IhDiKO/BgXZg42jrnWeK+GW7y83UJDMC0o+8L8NuTG0QNi2Q8JUbPt5s42mqgfdqPNPqkY6CsMK32aLETtBAIOwAqDwr49Jv3g/7OTy4o5JmNLs62G3j55AyNlxZ4LjBiajwQAME1f/2PL777BPqSBoGwv27z4oGfFjGbwawPaX/4Zw2dc4YB+X1E40m7CNm0142bVEOHoIouorieRWO/CaNMSQwdlNaiPT0vPhgjo/gix2Kw2zbap10cb9VR223DbtG6f5Kk4PUzYwDl7GQNyJZUlO4aWN4wkCtleOqMnw9KIh/QARvwjQ2NeufUQm2vjeZ+F3aLjsSIEcGNfNMfMwPAV4ISp5TFpVNizZCh5GS+n/dPh+0OA+Onw5T3d+EycLrTUXkSZeYAXDaCWMH38DQdjOIRN5R8nzZ3MY/2Zdn+840C4Ctxk/fA64CbVDYJ2SkASaA6T32mDJin0UpC15QBSaA6T32mDJin0UpC15QBSaA6T32mDJin0UpC15QBSaA6T30uPAP+B8Xv5/OOW6fPAAAAAElFTkSuQmCC";
    var css = "\n<style>\n    .image-data-viewer .area {\n        padding: 20px;\n    }\n\n    .image-data-viewer img {\n        width: auto;\n        height: auto;\n        border: 1px dashed rgba(0, 0, 0, 0.5);\n        padding: 20px;\n    }\n\n    .image-data-viewer label {\n        display: block;\n    }\n\n    .image-data-viewer textarea {\n        width: 100%;\n        height: 40px;\n        white-space: nowrap;\n    }\n</style>\n";
    var ux = "\n<div class=\"image-data-viewer\">\n    <h3>Tool for viewing image data</h3>\n    <p>Paste an Image into Image Data to view the Image below</p>\n    <div class='area'>\n        <label>Image Data (paste image or text here)</label> \n        <textarea autocomplete=\"off\" spellcheck=\"false\" class='image-data-input'></textarea>\n    </div>\n    <div class='area'>\n        <label>Image</label> \n        <img class='image'/>\n    </div>\n    <div class='area'>\n        <label>Select an Image to update the Image Data and then the Image</label>\n        <input class='image-file' type='file' accept='image/*' />\n    </div>\n</div>\n";
    var openFile = function (event) {
        var input = event.target;
        var reader = new FileReader();
        reader.onload = function () {
            var textarea = $(".image-data-input");
            textarea[0].value = reader.result;
            textarea.change();
        };
        reader.readAsDataURL(input.files[0]);
    };
    var pasteHandler = function (event) {
        var items = (event.clipboardData || event.originalEvent.clipboardData).items;
        var blob;
        for (var i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") === 0) {
                blob = items[i].getAsFile();
                break;
            }
        }
        if (blob) {
            var reader = new FileReader();
            reader.onload = function (readerEvent) {
                $(".image-data-input").val(readerEvent.target.result).change();
            };
            reader.readAsDataURL(blob);
        }
    };
    function run() {
        $(ux).appendTo(".map");
        $(css).appendTo("head");
        $(".image-data-input").change(function () {
            $(".image").attr("src", $(".image-data-input").val());
        }).val(data).change();
        $(".image-data-input").on("paste", pasteHandler);
        $(".image-file").change(openFile);
    }
    exports.run = run;
});
define("ux/mapmaker", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    function run() {
        var map = new ol.Map({
            target: "map",
            view: new ol.View({
                projection: 'EPSG:4326',
                center: [-82.4, 34.85],
                zoom: 15
            }),
            layers: [new ol.layer.Tile({
                    source: new ol.source.OSM({
                        layer: "sat"
                    })
                })]
        });
        return map;
    }
    exports.run = run;
});
define("ux/polyline-encoder", ["require", "exports", "jquery", "openlayers", "google-polyline"], function (require, exports, $, ol, PolylineEncoder) {
    "use strict";
    var PRECISION = 6;
    var css = "\n<style>\n    .polyline-encoder .area {\n        margin: 20px;\n    }\n\n    .polyline-encoder .area p {\n        font-size: smaller;\n    }\n\n    .polyline-encoder .area canvas {\n        vertical-align: top;\n    }\n\n    .polyline-encoder .area label {\n        display: block;\n        margin: 10px;\n        border-bottom: 1px solid black;\n    }\n\n    .polyline-encoder .area textarea {\n        min-width: 400px;\n        min-height: 200px;\n    }\n</style>\n";
    var ux = "\n<div class='polyline-encoder'>\n    <p>\n    Demonstrates simplifying a geometry and then encoding it.  Enter an Input Geometry (e.g. [[1,2],[3,4]]) and watch the magic happen\n    </p>\n\n    <div class='input area'>\n        <label>Input Geometry</label>\n        <p>Enter a geometry here as an array of points in the form [[x1,y1], [x2,y2], ..., [xn, yn]]</p>\n        <textarea></textarea>\n        <canvas></canvas>\n    </div>\n\n    <div class='simplified area'>\n        <label>Simplified Geometry</label>\n        <p>This is a 'simplified' version of the Input Geometry.  \n        You can also enter a geometry here as an array of points in the form [[x1,y1], [x2,y2], ..., [xn, yn]]</p>\n        <textarea></textarea>\n        <canvas></canvas>\n    </div>\n\n    <div class='encoded area'>\n        <label>Encoded Simplified Geometry</label>\n        <p>This is an encoding of the Simplified Geometry.  You can also enter an encoded value here</p>\n        <textarea>[encoding]</textarea>\n        <p>Ported to Typescript from https://github.com/DeMoehn/Cloudant-nyctaxi/blob/master/app/js/polyline.js</p>\n    </div>\n\n    <div class='decoded area'>\n        <label>Decoded Simplified Geometry</label>\n        <p>This is the decoding of the Encoded Geometry</p>\n        <textarea>[decoded]</textarea>\n        <canvas></canvas>\n    </div>\n\n</div>\n";
    var encoder = new PolylineEncoder();
    var sample_input = [
        [-115.25532322799027, 36.18318333413792], [-115.25480459088912, 36.18318418322269], [-115.25480456865377, 36.18318418316166], [-115.25480483306748, 36.1831581364999], [-115.25480781267404, 36.18315812665095], [-115.2548095138256, 36.183158095267615], [-115.25481120389723, 36.183158054840916], [-115.2548128940441, 36.18315799638853], [-115.2548145842662, 36.18315791991047], [-115.25481628564361, 36.18315783445006], [-115.25481797597863, 36.18315773093339], [-115.25481965527126, 36.18315760936059], [-115.25482134571912, 36.18315747880541], [-115.2548230362423, 36.18315733022459], [-115.25482471568543, 36.183157172600346], [-115.25482639524148, 36.183156987937565], [-115.25482807479749, 36.183156803274784], [-115.25482974334876, 36.183156591542996], [-115.2548314230553, 36.18315637082881], [-115.25483309171943, 36.18315613205847], [-115.25483476042122, 36.183155884275266], [-115.25483641808054, 36.18315561843585], [-115.25483807581516, 36.18315533457071], [-115.25483973358743, 36.18315504169277], [-115.25484138031726, 36.183154730758616], [-115.25484302712233, 36.18315440179879], [-115.25484467396501, 36.183154063826066], [-115.25484630976528, 36.1831537077972], [-115.2548479456032, 36.18315334275542], [-115.25484957043632, 36.183152950644654], [-115.25485119526944, 36.183152558533834], [-115.25485280906014, 36.183152148366815], [-115.2548544229261, 36.18315172017415], [-115.2548560257496, 36.18315127392525], [-115.25485762861075, 36.18315081866349], [-115.25485922039188, 36.18315035435842], [-115.25486081224824, 36.18314987202764], [-115.25486239306215, 36.183149371640624], [-115.25486396279601, 36.1831488622103], [-115.25486553260517, 36.18314833475428], [-115.2548670913342, 36.18314779825488], [-115.25486863902088, 36.183147243699295], [-115.25487018674515, 36.18314668013086], [-115.25487172342703, 36.18314609850624], [-115.25487324902879, 36.18314550783829], [-115.25487476358818, 36.18314489911408], [-115.25487627818518, 36.18314428137708], [-115.25487778173971, 36.18314364558384], [-115.25487928533187, 36.18314300077779], [-115.25488076676396, 36.18314233788503], [-115.25488224823366, 36.183141665979406], [-115.25488370754327, 36.1831409759871], [-115.25488516689049, 36.18314027698193], [-115.25488661519529, 36.183139559920576], [-115.25488805238238, 36.183138842828726], [-115.25488948968233, 36.183138098698365], [-115.2548909047846, 36.18313734549412], [-115.25489231992445, 36.18313658327705], [-115.25489371286662, 36.18313581198606], [-115.25489510588402, 36.18313502266943], [-115.25489647670366, 36.183134224279], [-115.25489784759858, 36.18313340786281], [-115.25489919629575, 36.18313258237279], [-115.25490054503052, 36.18313174786991], [-115.25490187156761, 36.18313090429319], [-115.25490319817993, 36.18313004269079], [-115.25490450259451, 36.183129172014546], [-115.25490580704671, 36.183128292325435], [-115.25490708933879, 36.18312739454964], [-115.25490836055086, 36.18312648773055], [-115.25490962068287, 36.183125571868075], [-115.25491086973481, 36.18312464696224], [-115.25491210774435, 36.183123704000224], [-115.25491332355611, 36.18312275196436], [-115.25491453940552, 36.183121790915635], [-115.25491573305723, 36.18312082079315], [-115.25491691562885, 36.183119841627246], [-115.25491808715805, 36.18311884440516], [-115.25491924756955, 36.18311784715259], [-115.25492038582102, 36.18311683181332], [-115.2549215129924, 36.18311580743071], [-115.25492262908377, 36.183114774004764], [-115.25492373409503, 36.18311373153546], [-115.25492481690861, 36.183112679992306], [-115.2549258886421, 36.18311161940585], [-115.25492694929561, 36.183110549776046], [-115.25492798775133, 36.183109471072356], [-115.25492901516465, 36.183108374312525], [-115.25493003146033, 36.1831072775222], [-115.25493102555829, 36.18310617165801], [-115.25493200857615, 36.18310505675048], [-115.25493298051404, 36.183103932799625], [-115.25493393025415, 36.18310279977493], [-115.25493486891426, 36.18310165770687], [-115.25493579649431, 36.183100506595494], [-115.25493670187666, 36.18309934641027], [-115.25493759614129, 36.18309818619454], [-115.25493846824591, 36.183097007892144], [-115.25493931811518, 36.18309582952875], [-115.25494016802205, 36.183094642152525], [-115.25494099573123, 36.18309344570244], [-115.25494180124268, 36.18309224017851], [-115.25494259567414, 36.183091025611276], [-115.25494336787024, 36.18308981098305], [-115.25494412898631, 36.183088587311474], [-115.2549448790223, 36.183087354596566], [-115.25494560682303, 36.18308612182065], [-115.25494631246364, 36.18308487095804], [-115.25494700698661, 36.18308362006498], [-115.25494767927427, 36.18308236911088], [-115.2549483404819, 36.18308110911343], [-115.25494897949177, 36.183079840042225], [-115.25494960742166, 36.183078561927644], [-115.25495021311626, 36.183077283752056], [-115.25495080769318, 36.183076005545956], [-115.25495138011001, 36.18307470925323], [-115.25495193025388, 36.183073421912326], [-115.25495246935542, 36.18307211651528], [-115.25495298618397, 36.18307082007], [-115.25495349197016, 36.183069505568625], [-115.2549539754834, 36.183068200019065], [-115.25495443679894, 36.18306688539569], [-115.25495488703444, 36.183065561728924], [-115.25495531503466, 36.183064238001236], [-115.25495573195485, 36.18306290523016], [-115.2553212003638, 36.183064339787606], [-115.25532322799027, 36.18318333413792]
    ];
    function updateEncoder() {
        var input = $(".simplified textarea")[0];
        var geom = new ol.geom.LineString(JSON.parse(input.value));
        var encoded = encoder.encode(geom.getCoordinates(), PRECISION);
        $(".encoded textarea").val(encoded).change();
    }
    function updateDecoder() {
        var input = $(".encoded textarea")[0];
        $(".decoded textarea").val(JSON.stringify(encoder.decode(input.value, PRECISION))).change();
        updateCanvas(".decoded canvas", ".decoded textarea");
    }
    function updateCanvas(canvas_id, features_id) {
        var canvas = $(canvas_id)[0];
        canvas.width = canvas.height = 200;
        var geom = new ol.geom.LineString(JSON.parse($(features_id)[0].value));
        var extent = geom.getExtent();
        var scale = (function () {
            var _a = [ol.extent.getWidth(extent), ol.extent.getHeight(extent)], w = _a[0], h = _a[1];
            var _b = ol.extent.getCenter(extent), x0 = _b[0], y0 = _b[1];
            var _c = [canvas.width / 2, canvas.height / 2], dx = _c[0], dy = _c[1];
            var _d = [dx / w, dy / h], sx = _d[0], sy = _d[1];
            return function (x, y) {
                return [sx * (x - x0) + dx, -sy * (y - y0) + dy];
            };
        })();
        var c = canvas.getContext("2d");
        c.beginPath();
        {
            c.strokeStyle = "#000000";
            c.lineWidth = 1;
            geom.getCoordinates().forEach(function (p, i) {
                var _a = scale(p[0], p[1]), x = _a[0], y = _a[1];
                console.log(x, y);
                (i === 0) && c.moveTo(x, y);
                c.lineTo(x, y);
            });
            c.stroke();
            c.closePath();
        }
        c.beginPath();
        {
            c.strokeStyle = "#FF0000";
            c.lineWidth = 1;
            geom.getCoordinates().forEach(function (p, i) {
                var _a = scale(p[0], p[1]), x = _a[0], y = _a[1];
                c.moveTo(x, y);
                c.rect(x, y, 1, 1);
            });
            c.stroke();
            c.closePath();
        }
    }
    function run() {
        $(css).appendTo("head");
        $(ux).appendTo(".map");
        $(".encoded textarea").change(updateDecoder);
        $(".simplified textarea").change(function () {
            updateCanvas(".simplified canvas", ".simplified textarea");
            updateEncoder();
        });
        $(".input textarea")
            .val(JSON.stringify(sample_input))
            .change(function (args) {
            var input = $(".input textarea")[0];
            var coords = JSON.parse("" + input.value);
            var geom = new ol.geom.LineString(coords);
            geom = geom.simplify(Math.pow(10, -PRECISION));
            $(".simplified textarea").val(JSON.stringify(geom.getCoordinates())).change();
            updateCanvas(".input canvas", ".input textarea");
        })
            .change();
    }
    exports.run = run;
});
define("ux/routing", ["require", "exports", "mapquest-directions-proxy", "mapquest-optimized-route-proxy", "ux/mapmaker", "data/route_03"], function (require, exports, Directions, Route, mapmaker_1, route3) {
    "use strict";
    function renderRoute(map, result) {
        var lr = result.route.boundingBox.lr;
        var ul = result.route.boundingBox.ul;
        map.getView().fit([ul.lng, lr.lat, lr.lng, ul.lat], map.getSize());
        var points = [];
        if (result.route.shape) {
            for (var i = 0; i < result.route.shape.shapePoints.length; i += 2) {
                var _a = [result.route.shape.shapePoints[i], result.route.shape.shapePoints[i + 1]], lat = _a[0], lon = _a[1];
                points.push([lon, lat]);
            }
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
    }
    function run() {
        var map = mapmaker_1.run();
        renderRoute(map, route3);
        var l1 = [
            "50 Datastream Plaza, Greenville, SC",
            "550 S Main St 101, Greenville, SC 29601",
            "207 N Main St, Greenville, SC 29601",
            "100 S Main St 101, Greenville, SC 29601"];
        var l2 = [
            "34.845546,-82.401672",
            "34.845547,-82.401674"];
        false && Route.test({
            from: l1[0],
            to: l1[1],
            locations: l2
        }).then(function (result) { return renderRoute(map, result); });
        Directions.test({
            from: l1[0],
            to: [l1[1], l2[2]]
        }).then(function (result) { return renderRoute(map, result); });
    }
    exports.run = run;
});
define("ux/style-lab", ["require", "exports", "openlayers", "jquery", "ux/serializers/coretech", "ux/serializers/ags-simplemarkersymbol", "ux/style-generator"], function (require, exports, ol, $, CoretechSerializer, AgsMarkerSerializer, StyleGenerator) {
    "use strict";
    var center = [-82.4, 34.85];
    var formatter = new CoretechSerializer.CoretechConverter();
    var generator = new StyleGenerator({
        center: center,
        fromJson: function (json) { return formatter.fromJson(json); }
    });
    var ux = "\n<div class='style-lab'>\n    <label for='use-ags-serializer'>use-ags-serializer?</label>\n    <input type=\"checkbox\" id=\"use-ags-serializer\"/>\n    <label for='style-count'>How many styles per symbol?</label>\n    <input id='style-count' type=\"number\" value=\"1\" min=\"1\" max=\"5\"/><button id='more'>More</button>\n    <label for='style-out'>Click marker to see style here:</label>\n    <textarea id='style-out'>[\n\t{\n\t\t\"star\": {\n\t\t\t\"fill\": {\n\t\t\t\t\"color\": \"rgba(228,254,211,0.57)\"\n\t\t\t},\n\t\t\t\"opacity\": 1,\n\t\t\t\"stroke\": {\n\t\t\t\t\"color\": \"rgba(67,8,10,0.61)\",\n\t\t\t\t\"width\": 8\n\t\t\t},\n\t\t\t\"radius\": 22,\n\t\t\t\"radius2\": 16,\n\t\t\t\"points\": 11,\n\t\t\t\"angle\": 0,\n\t\t\t\"rotation\": 0\n\t\t}\n\t}\n]</textarea>\n    <label for='apply-style'>Apply this style to some of the features</label>\n    <button id='apply-style'>Apply</button>\n    <div class='area'>\n        <label>Last image clicked:</label>\n        <img class='last-image-clicked light' />\n        <img class='last-image-clicked bright' />\n        <img class='last-image-clicked dark' />\n    </div>\n<div>\n";
    var css = "\n<style>\n    html, body, .map {\n        width: 100%;\n        height: 100%;\n        padding: 0;\n        overflow: hidden;\n        margin: 0;    \n    }\n\n    .map {\n        background-color: black;\n    }\n\n    .map.dark {\n        background: black;\n    }\n\n    .map.light {\n        background: silver;\n    }\n\n    .map.bright {\n        background: white;\n    }\n\n    .style-lab {\n        padding: 20px;\n        position:absolute;\n        top: 8px;\n        left: 40px;\n        z-index: 1;\n        background-color: rgba(255, 255, 255, 0.8);\n        border: 1px solid black;\n    }\n\n    .style-lab .area {\n        padding-top: 20px;\n    }\n\n    .style-lab label {\n        display: block;\n    }\n\n    .style-lab #style-count {\n        vertical-align: top;\n    }\n\n    .style-lab #style-out {\n        font-family: cursive;\n        font-size: smaller;\n        min-width: 320px;\n        min-height: 240px;\n    }\n\n    .style-lab .dark {\n        background: black;\n    }\n\n    .style-lab .light {\n        background: silver;\n    }\n\n    .style-lab .bright {\n        background: white;\n    }\n\n</style>\n";
    function run() {
        var formatter;
        $(ux).appendTo(".map");
        $(css).appendTo("head");
        $("#use-ags-serializer").change(function (args) {
            if (args.target.checked) {
                formatter = new AgsMarkerSerializer.SimpleMarkerConverter();
            }
            else {
                formatter = new CoretechSerializer.CoretechConverter();
            }
        }).change();
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
        $("#more").click(function () { return $("#style-count").change(); });
        $("#style-count").on("change", function (args) {
            map.addLayer(generator.asMarkerLayer({
                markerCount: 100,
                styleCount: args.target.valueAsNumber
            }));
        }).change();
        $("#apply-style").on("click", function () {
            var json = JSON.parse(styleOut.value);
            var styles = json.map(function (json) { return formatter.fromJson(json); });
            map.getLayers().forEach(function (l) {
                if (l instanceof ol.layer.Vector) {
                    var s = l.getSource();
                    var features = s.getFeatures().filter(function (f, i) { return 0.1 > Math.random(); });
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
            {
                if (Array.isArray(style)) {
                    var s = style[0];
                    while (!(s instanceof HTMLCanvasElement)) {
                        s = s.getImage();
                    }
                    if (s instanceof HTMLCanvasElement) {
                        var dataUrl = s.toDataURL();
                        $(".last-image-clicked").attr("src", dataUrl);
                    }
                }
            }
        }); });
        $(".last-image-clicked").click(function (evt) {
            "light,dark,bright".split(",").forEach(function (c) { return $("#map").toggleClass(c, $(evt.target).hasClass(c)); });
        });
        return map;
    }
    exports.run = run;
});
define("ux/geom/parcel", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        [-115.25532322799027, 36.18318333413792],
        [-115.25480456865377, 36.18318418316166],
        [-115.25480483306748, 36.1831581364999],
        [-115.25482974334876, 36.183156591542996],
        [-115.2548544229261, 36.18315172017415],
        [-115.25487928533187, 36.18314300077779],
        [-115.25490054503052, 36.18313174786991],
        [-115.25491924756955, 36.18311784715259],
        [-115.25493579649431, 36.183100506595494],
        [-115.25494767927427, 36.18308236911088],
        [-115.25495573195485, 36.18306290523016],
        [-115.2553212003638, 36.183064339787606],
        [-115.25532322799027, 36.18318333413792]
    ];
});
define("ux/style-to-canvas", ["require", "exports", "openlayers", "jquery", "ux/geom/parcel"], function (require, exports, ol, $, parcel) {
    "use strict";
    var html = "\n<div class='style-to-canvas'>\n    <canvas id='canvas'></canvas>\n</div>\n";
    var css = "\n<style>\n    #map {\n        display: none;\n    }\n\n    .style-to-canvas #canvas {\n        border: 1px solid black;\n        padding: 20px;\n        width: 400px;\n        height: 400px;\n        overflow: auto;\n    }\n</style>\n";
    function translate(points, vector) {
        return points.map(function (p) { return vector.map(function (v, i) { return v + p[i]; }); });
    }
    function rotate(points, a) {
        return points.map(function (p) {
            var _a = [p[0], p[1], Math.cos(a), Math.sin(a)], x = _a[0], y = _a[1], cos = _a[2], sin = _a[3];
            return [
                x * cos - y * sin,
                x * sin + y * cos
            ];
        });
    }
    function scale(points, vector) {
        return points.map(function (p) { return vector.map(function (v, i) { return v * p[i]; }); });
    }
    function render(canvas, line, style) {
        var extent = ol.extent.boundingExtent(line);
        var _a = ol.extent.getCenter(extent), dx = _a[0], dy = _a[1];
        var _b = [canvas.width / ol.extent.getWidth(extent), canvas.height / ol.extent.getHeight(extent)], sx = _b[0], sy = _b[1];
        line = translate(line, [-dx, -dy]);
        line = scale(line, [Math.min(sx, sy), -Math.min(sx, sy)]);
        line = translate(line, [canvas.width / 2, canvas.height / 2]);
        var feature = new ol.Feature({
            geometry: new ol.geom.Polygon([line]),
            style: style
        });
        var vtx = ol.render.toContext(canvas.getContext("2d"));
        vtx.drawFeature(feature, style);
    }
    function run() {
        $(html).appendTo("body");
        $(css).appendTo("head");
        var style = new ol.style.Style({
            fill: new ol.style.Fill({
                color: "red"
            }),
            stroke: new ol.style.Stroke({
                width: 1,
                color: "blue"
            })
        });
        var canvas = document.getElementById("canvas");
        render(canvas, parcel, style);
    }
    exports.run = run;
});
define("ux/serializers/ags-simplefillsymbol", ["require", "exports"], function (require, exports) {
    "use strict";
    var SimpleFillConverter = (function () {
        function SimpleFillConverter() {
        }
        SimpleFillConverter.prototype.toJson = function () {
            return null;
        };
        SimpleFillConverter.prototype.fromJson = function (json) {
            return null;
        };
        return SimpleFillConverter;
    }());
    exports.SimpleFillConverter = SimpleFillConverter;
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
define("ux/styles/ags/cartographiclinesymbol", ["require", "exports"], function (require, exports) {
    "use strict";
    var symbol = function () { return ({
        "type": "esriSLS",
        "style": "esriSLSLongDashDot",
        "color": [
            152,
            230,
            0,
            255
        ],
        "width": 1,
        "cap": "esriLCSButt",
        "join": "esriLJSBevel",
        "miterLimit": 9.75
    }); };
    var styles = "Dash,DashDot,DashDotDot,Dot,LongDash,LongDashDot,ShortDash,ShortDashDot,ShortDashDotDot,ShortDot,Solid".split(",");
    var caps = "Butt,Round,Square".split(",");
    var joins = "Bevel,Miter,Round".split(",");
    var symbols = styles.map(function (style, i) {
        var result = symbol();
        result.style = "esriSLS" + style;
        result.cap = "esriLCS" + caps[i % caps.length];
        result.join = "esriLJS" + joins[i % joins.length];
        return result;
    });
    return symbols;
});
define("ux/styles/ags/picturefillsymbol", ["require", "exports"], function (require, exports) {
    "use strict";
    return [{
            "color": [
                0,
                0,
                0,
                255
            ],
            "type": "esriPFS",
            "url": "http://www.free.designquery.com/01/bg0245.jpg",
            "width": 112.5,
            "height": 112.5,
            "xoffset": 0,
            "yoffset": 0,
            "xscale": 1,
            "yscale": 1
        }];
});
define("ux/styles/ags/picturemarkersymbol", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "angle": 0,
            "xoffset": 0,
            "yoffset": 0,
            "type": "esriPMS",
            "url": "https://rawgit.com/mapbox/maki/master/icons/aerialway-11.svg",
            "width": 30,
            "height": 30
        }
    ];
});
define("ux/styles/ags/simplefillsymbol", ["require", "exports"], function (require, exports) {
    "use strict";
    var symbol = function () { return ({
        "color": [
            0,
            0,
            0,
            64
        ],
        "outline": {
            "color": [
                0,
                0,
                0,
                255
            ],
            "width": 1.5,
            "type": "esriSLS",
            "style": "esriSLSDashDotDot"
        },
        "type": "esriSFS",
        "style": "esriSFSBackwardDiagonal"
    }); };
    var styles = "BackwardDiagonal,Cross,DiagonalCross,ForwardDiagonal,Horizontal,Solid,Vertical".split(",");
    var symbols = styles.map(function (style) {
        var result = symbol();
        result.style = ("esriSFS" + style);
        return result;
    });
    return symbols;
});
define("ux/styles/ags/textsymbol", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "color": [
                0,
                0,
                0,
                255
            ],
            "type": "esriTS",
            "horizontalAlignment": "center",
            "angle": 0,
            "xoffset": 0,
            "yoffset": 0,
            "text": "Sample Text",
            "rotated": false,
            "kerning": true,
            "font": {
                "size": 10,
                "style": "normal",
                "variant": "normal",
                "weight": "normal",
                "family": "serif"
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
                "font": "lighter 18px fantasy"
            }
        }
    ];
});
//# sourceMappingURL=run.js.map