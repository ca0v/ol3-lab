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
                        source: new ol.source.OSM({
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
        var map = tests.heatmap();
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
    function Converter(json) {
        switch (json.type) {
            case "esriSMS": return new SimpleMarkerConverter();
        }
    }
    exports.Converter = Converter;
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
                    gradient_1.stops = fill.gradient.stops;
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
            gradient.type = "linear(" + [x0, y0, x1, y1].join(",") + ")";
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
            gradient.type = "radial(" + [x0, y0, r0, x1, y1, r1].join(",") + ")";
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
            gradient.stops = stops.map(function (stop) { return (stop.color + " " + Math.round(100 * stop.stop) + "%"); }).join(";");
        };
        StyleGenerator.prototype.asRadialGradient = function (context, radius) {
            var canvas = context.canvas;
            var _a = [
                canvas.width / 2, canvas.height / 2, radius,
                canvas.width / 2, canvas.height / 2, 0
            ], x0 = _a[0], y0 = _a[1], r0 = _a[2], x1 = _a[3], y1 = _a[4], r1 = _a[5];
            var gradient = context.createRadialGradient(x0, y0, r0, x1, y1, r1);
            gradient.type = "radial(" + [x0, y0, r0, x1, y1, r1].join(",") + ")";
            return gradient;
        };
        StyleGenerator.prototype.asLinearGradient = function (context, radius) {
            var _a = [
                randint(radius), 0,
                randint(radius), 2 * radius
            ], x0 = _a[0], y0 = _a[1], x1 = _a[2], y1 = _a[3];
            var gradient = context.createLinearGradient(x0, y0, x1, y1);
            gradient.type = "linear(" + [x0, y0, x1, y1].join(",") + ")";
            return gradient;
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
            var canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            var orientation = orientations[Math.round((orientations.length - 1) * Math.random())];
            var pattern;
            switch (orientation) {
                case "horizontal":
                    canvas.width = 1;
                    canvas.height = 1 + randint(10);
                    context.strokeStyle = ol.color.asString(this.asRgb());
                    context.beginPath();
                    context.lineWidth = 1 + randint(canvas.height);
                    context.strokeStyle = ol.color.asString(this.asRgb());
                    context.moveTo(0, 0);
                    context.lineTo(canvas.width, 0);
                    context.stroke();
                    context.closePath();
                    pattern = context.createPattern(canvas, 'repeat');
                    break;
                case "vertical":
                    canvas.width = 6;
                    canvas.height = 6;
                    context.fillStyle = ol.color.asString(this.asRgba());
                    for (var i = 0; i < 6; i++) {
                        context.fillRect(0, i, 1, 1);
                    }
                    pattern = context.createPattern(canvas, 'repeat');
                    break;
                case "cross":
                    canvas.width = 6;
                    canvas.height = 6;
                    context.fillStyle = ol.color.asString(this.asRgb());
                    for (var i = 0; i < 6; i++) {
                        context.fillRect(i, 0, 1, 1);
                        context.fillRect(0, i, 1, 1);
                    }
                    pattern = context.createPattern(canvas, 'repeat');
                    break;
                case "forward":
                    canvas.width = 6;
                    canvas.height = 6;
                    context.fillStyle = ol.color.asString(this.asRgb());
                    for (var i = 0; i < 6; i++) {
                        context.fillRect(i, i, 1, 1);
                    }
                    pattern = context.createPattern(canvas, 'repeat');
                    break;
                case "backward":
                    canvas.width = 6;
                    canvas.height = 6;
                    context.fillStyle = ol.color.asString(this.asRgb());
                    for (var i = 0; i < 6; i++) {
                        context.fillRect(5 - i, i, 1, 1);
                    }
                    pattern = context.createPattern(canvas, 'repeat');
                    break;
                case "diagonal":
                    canvas.width = 6;
                    canvas.height = 6;
                    context.fillStyle = ol.color.asString(this.asRgb());
                    for (var i = 0; i < 6; i++) {
                        context.fillRect(i, i, 1, 1);
                        context.fillRect(5 - i, i, 1, 1);
                    }
                    pattern = context.createPattern(canvas, 'repeat');
                    break;
                default:
                    throw "invalid orientation";
            }
            pattern.image = canvas.toDataURL();
            pattern.repitition = "repeat";
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
            console.log(json);
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