var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("labs/common/ajax", ["require", "exports", "jquery"], function (require, exports, $) {
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
define("ux/mapquest-directions-proxy", ["require", "exports", "labs/common/ajax"], function (require, exports, ajax) {
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
define("ux/mapquest-optimized-route-proxy", ["require", "exports", "labs/common/ajax"], function (require, exports, ajax) {
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
define("ux/mapquest-traffic-proxy", ["require", "exports", "labs/common/ajax"], function (require, exports, ajax) {
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
define("ux/mapquest-geocoding-proxy", ["require", "exports", "labs/common/ajax", "jquery"], function (require, exports, ajax, $) {
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
define("labs/common/google-polyline", ["require", "exports"], function (require, exports) {
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
                    byte = str.charCodeAt(index++) - 0x3f;
                    result |= (byte & 0x1f) << shift;
                    shift += 5;
                } while (byte >= 0x20);
                var latitude_change_1 = ((result & 1) ? ~(result >> 1) : (result >> 1));
                shift = result = 0;
                do {
                    byte = str.charCodeAt(index++) - 0x3f;
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
define("ux/mapquest-search-proxy", ["require", "exports", "labs/common/ajax", "jquery", "labs/common/google-polyline"], function (require, exports, ajax, $, G) {
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
define("ux/osrm-proxy", ["require", "exports", "labs/common/ajax", "jquery", "labs/common/google-polyline"], function (require, exports, ajax, $, Encoder) {
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
define("app", ["require", "exports", "openlayers", "ux/mapquest-directions-proxy", "ux/mapquest-optimized-route-proxy", "jquery", "resize-sensor"], function (require, exports, ol, Directions, Route, $, ResizeSensor) {
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
define("labs/facebook", ["require", "exports", "openlayers", "jquery"], function (require, exports, ol, $) {
    "use strict";
    requirejs.config({
        shim: {
            'facebook': {
                exports: 'FB'
            }
        },
        paths: {
            'facebook': '//connect.facebook.net/en_US/sdk'
        }
    });
    var css = "\n<style id='authentication_css'>\n    html, body, .map {\n        margin: 0;\n        padding: 0;\n        width: 100%;\n        height: 100%;\n        overflow: hidden;\n    }\n    .authentication .facebook-toolbar {\n        position: absolute;\n        bottom: 30px;\n        right: 20px;\n    }\n\n    .logout-button {\n        background-color: #365899;\n        border: 1px solid #365899;\n        color: white;\n        border-radius: 3px;\n        font-size: 8pt !important;\n        height: 20px;\n        vertical-align: bottom;\n    }\n</style>\n";
    var html = "\n<div class='authentication'>\n    <div id=\"events\"></div>\n\n    <div class='facebook-toolbar'>\n    <div class=\"fb-like\" \n        data-href=\"" + window.location + "\" \n        data-layout=\"button_count\" \n        data-action=\"recommend\" \n        data-size=\"small\" \n        data-show-faces=\"true\" \n        data-share=\"true\">\n    </div>\n\n    <fb:login-button class='login-button' scope=\"public_profile,user_tagged_places,email\" onlogin=\"$('#events').trigger('fb-login');\"/>\n    <button class='logout-button'>Logout</button>\n    </div>\n</div>\n";
    var Facebook = (function () {
        function Facebook() {
        }
        Facebook.prototype.load = function (appId) {
            var _this = this;
            var d = $.Deferred();
            requirejs(['facebook'], function (FB) {
                _this.FB = FB;
                FB.init({
                    appId: appId,
                    cookie: true,
                    xfbml: true,
                    version: 'v2.7'
                });
                d.resolve(FB);
            });
            return d;
        };
        Facebook.prototype.on = function (event, cb) {
            var _this = this;
            this.FB.Event.subscribe(event, cb);
            return { off: function () { return _this.FB.Event.unsubscribe(event, cb); } };
        };
        Facebook.prototype.api = function (name, args) {
            if (args === void 0) { args = {}; }
            var d = $.Deferred();
            this.FB.api("" + name, 'get', args, function (args) {
                d.resolve(args);
            });
            return d;
        };
        Facebook.prototype.getUserInfo = function () {
            var _this = this;
            return this.api('me').done(function (v) {
                _this.user_id = v.id;
            });
        };
        Facebook.prototype.getPlaces = function (user_id) {
            if (user_id === void 0) { user_id = this.user_id; }
            return this.api(this.user_id + "/tagged_places");
        };
        Facebook.prototype.getPicture = function () {
            return this.api(this.user_id + "/picture");
        };
        return Facebook;
    }());
    function createMap(fb) {
        var features = new ol.Collection();
        var source = new ol.source.Vector({
            features: features
        });
        var vectorLayer = new ol.layer.Vector({
            source: source
        });
        var style = new ol.style.Style({
            image: new ol.style.Circle({
                radius: 12,
                fill: new ol.style.Fill({ color: "#4267b2" }),
                stroke: new ol.style.Stroke({
                    width: 3,
                    color: "#29487d"
                })
            }),
            text: new ol.style.Text({
                fill: new ol.style.Fill({
                    color: "#ffffff"
                }),
                stroke: new ol.style.Stroke({
                    width: 3,
                    color: "#4267b2"
                }),
                font: "15pt arial",
                text: "f"
            })
        });
        vectorLayer.setStyle(style);
        var basemap = new ol.layer.Tile({
            source: new ol.source.OSM()
        });
        var map = new ol.Map({
            target: "map",
            view: new ol.View({
                projection: "EPSG:4326",
                center: [-82.4, 34.85],
                zoom: 10
            }),
            layers: [basemap, vectorLayer]
        });
        fb.getUserInfo().then(function (args) {
            fb.getPlaces(args.id).then(function (places) {
                places.data.forEach(function (data) {
                    var loc = data.place.location;
                    var geom = new ol.geom.Point([loc.longitude, loc.latitude]);
                    var feature = new ol.Feature(geom);
                    feature.setProperties({
                        name: data.place.name
                    });
                    feature.setStyle([style, new ol.style.Style({
                            text: new ol.style.Text({
                                fill: new ol.style.Fill({
                                    color: "#ffffff"
                                }),
                                stroke: new ol.style.Stroke({
                                    width: 3,
                                    color: "#4267b2"
                                }),
                                font: "12pt arial",
                                text: data.place.name,
                                offsetY: 30
                            })
                        })]);
                    features.push(feature);
                });
                var extent = source.getExtent();
                map.getView().fit(extent, map.getSize());
            });
        });
        return map;
    }
    function run() {
        $(css).appendTo("head");
        $(html).appendTo("body");
        $('.logout-button').hide();
        var fb = new Facebook();
        fb.load('639680389534759').then(function (FB) {
            var map;
            var onLoggedIn = function () {
                console.log("logged in");
                $('.login-button').hide();
                $('.logout-button').show();
                map = createMap(fb);
                fb.getPicture().then(function (picture) {
                    if (picture.data.is_silhouette)
                        return;
                    $("<img class='fb-pic' src='" + picture.data.url + "'/>'").prependTo('.facebook-toolbar');
                });
            };
            var onLoggedOut = function () {
                console.log("logged out");
                $('.login-button').show();
                $('.logout-button').hide();
                if (map) {
                    map.dispose();
                    map = null;
                }
                $('.fb-pic').remove();
            };
            fb.on('auth.login', onLoggedIn);
            fb.on('auth.logout', onLoggedOut);
            $('.logout-button').click(function () { return FB.logout(); });
            FB.getLoginStatus(function (args) {
                switch (args.status) {
                    case 'connected':
                        onLoggedIn();
                        break;
                    case 'not_authorized':
                        break;
                    default:
                        onLoggedOut();
                        break;
                }
            });
        });
    }
    exports.run = run;
});
define("labs/google-identity", ["require", "exports", "jquery", "openlayers"], function (require, exports, $, ol) {
    "use strict";
    var html = "\n    <div class=\"g-signin2\" data-onsuccess=\"giAsyncInit\" data-theme=\"dark\"></div>\n    <button class='logout-button'>Logout</button>\n";
    function createMap() {
        var basemap = new ol.layer.Tile({
            source: new ol.source.OSM()
        });
        var map = new ol.Map({
            target: "map",
            view: new ol.View({
                projection: "EPSG:4326",
                center: [-82.4, 34.85],
                zoom: 10
            }),
            layers: [basemap]
        });
    }
    var GoogleIdentity = (function () {
        function GoogleIdentity() {
        }
        GoogleIdentity.prototype.load = function (client_id) {
            var _this = this;
            var d = $.Deferred();
            $("\n            <meta name=\"google-signin-scope\" content=\"profile email\">\n            <meta name=\"google-signin-client_id\" content=\"" + client_id + "\">\n            <script src=\"https://apis.google.com/js/platform.js\" async defer></script>\n        ").appendTo('head');
            window.giAsyncInit = function (args) {
                _this.id_token = args.getAuthResponse().id_token;
                d.resolve(args);
                delete window.giAsyncInit;
            };
            return d;
        };
        GoogleIdentity.prototype.showInfo = function (googleUser) {
            createMap();
            var profile = googleUser.getBasicProfile();
            $("<img src='" + profile.getImageUrl() + "'>" + profile.getName() + "</img>").appendTo('body');
        };
        ;
        GoogleIdentity.prototype.logout = function () {
            var auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function () {
                console.log('User signed out.');
            });
        };
        return GoogleIdentity;
    }());
    function run() {
        $(html).appendTo('body');
        var gi = new GoogleIdentity();
        gi.load('987911803084-a6cafnu52d7lkr8vfrtl4modrpinr1os.apps.googleusercontent.com').then(function (args) { return gi.showInfo(args); });
        $('button.logout-button').click(function () {
            gi.logout();
        });
    }
    exports.run = run;
});
define("labs/image-data-viewer", ["require", "exports", "jquery"], function (require, exports, $) {
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
    var pasteHandler = function (evt) {
        var event = (evt.originalEvent || evt);
        var items = event.clipboardData.items;
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
define("labs/index", ["require", "exports"], function (require, exports) {
    "use strict";
    function run() {
        var l = window.location;
        var path = "" + l.origin + l.pathname + "?run=labs/";
        var labs = "\n    style-lab\n    style-viewer\n    style-viewer&geom=parcel\n    style-viewer&geom=polygon-with-holes\n    style-viewer&style=fill/gradient,text/text\n    style-viewer&geom=parcel&style=fill/gradient,text/text\n    style-to-canvas\n    polyline-encoder\n    image-data-viewer\n    mapmaker\n    mapmaker&background=light\n    mapmaker&geom=t`syzE}gm_dAm_@A?r@p@Bp@Hp@Ph@Td@Z`@`@Vb@Nd@xUABmF\n    mapmaker&geom=t`syzE}gm_dAm_@A?r@p@Bp@Hp@Ph@Td@Z`@`@Vb@Nd@xUABmF&color=yellow&background=dark&modify=1\n    facebook\n    google-identity\n    index\n    ";
        var styles = document.createElement("style");
        document.head.appendChild(styles);
        styles.innerText += "\n    #map {\n        display: none;\n    }\n    ";
        var labDiv = document.createElement("div");
        document.body.appendChild(labDiv);
        labDiv.innerHTML = labs
            .split(/ /)
            .map(function (v) { return v.trim(); })
            .filter(function (v) { return !!v; })
            .sort()
            .map(function (lab) { return ("<a href='" + path + lab + "&debug=1'>" + lab + "</a>"); })
            .join("<br/>");
        var testDiv = document.createElement("div");
        document.body.appendChild(testDiv);
        testDiv.innerHTML = "<a href='" + l.origin + l.pathname + "?run=tests/index'>tests</a>";
    }
    exports.run = run;
    ;
});
define("labs/common/common", ["require", "exports"], function (require, exports) {
    "use strict";
    function getParameterByName(name, url) {
        if (url === void 0) { url = window.location.href; }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    exports.getParameterByName = getParameterByName;
    function doif(v, cb) {
        if (v !== undefined && v !== null)
            cb(v);
    }
    exports.doif = doif;
    function mixin(a, b) {
        Object.keys(b).forEach(function (k) { return a[k] = b[k]; });
        return a;
    }
    exports.mixin = mixin;
});
define("labs/common/ol3-polyline", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    var Polyline = ol.format.Polyline;
    var PolylineEncoder = (function () {
        function PolylineEncoder(precision, stride) {
            if (precision === void 0) { precision = 5; }
            if (stride === void 0) { stride = 2; }
            this.precision = precision;
            this.stride = stride;
        }
        PolylineEncoder.prototype.flatten = function (points) {
            var nums = new Array(points.length * this.stride);
            var i = 0;
            points.forEach(function (p) { return p.map(function (p) { return nums[i++] = p; }); });
            return nums;
        };
        PolylineEncoder.prototype.unflatten = function (nums) {
            var points = new Array(nums.length / this.stride);
            for (var i = 0; i < nums.length / this.stride; i++) {
                points[i] = nums.slice(i * this.stride, (i + 1) * this.stride);
            }
            return points;
        };
        PolylineEncoder.prototype.round = function (nums) {
            var factor = Math.pow(10, this.precision);
            return nums.map(function (n) { return Math.round(n * factor) / factor; });
        };
        PolylineEncoder.prototype.decode = function (str) {
            var nums = Polyline.decodeDeltas(str, this.stride, Math.pow(10, this.precision));
            return this.unflatten(this.round(nums));
        };
        PolylineEncoder.prototype.encode = function (points) {
            return Polyline.encodeDeltas(this.flatten(points), this.stride, Math.pow(10, this.precision));
        };
        return PolylineEncoder;
    }());
    return PolylineEncoder;
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
define("ux/styles/star/flower", ["require", "exports"], function (require, exports) {
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
            var fill;
            var stroke;
            if (json.circle)
                image = this.deserializeCircle(json.circle);
            else if (json.star)
                image = this.deserializeStar(json.star);
            if (json.text)
                text = this.deserializeText(json.text);
            if (json.fill)
                fill = this.deserializeFill(json.fill);
            if (json.stroke)
                stroke = this.deserializeStroke(json.stroke);
            var s = new ol.style.Style({
                image: image,
                text: text,
                fill: fill,
                stroke: stroke
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
            doif(json.lineCap, function (v) { return stroke.setLineCap(v); });
            doif(json.lineDash, function (v) { return stroke.setLineDash(v); });
            doif(json.lineJoin, function (v) { return stroke.setLineJoin(v); });
            doif(json.miterLimit, function (v) { return stroke.setMiterLimit(v); });
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
define("ux/styles/stroke/dashdotdot", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "stroke": {
                "color": "blue",
                "width": 2,
                "lineDash": [15, 2, 5, 2, 5, 2]
            }
        }
    ];
});
define("ux/styles/stroke/solid", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "stroke": {
                "color": "blue",
                "width": 2
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
                    "width": 5
                },
                "offset-x": 0,
                "offset-y": 0,
                "text": "fantasy light",
                "font": "18px serif"
            }
        }
    ];
});
define("labs/mapmaker", ["require", "exports", "jquery", "openlayers", "labs/common/common", "labs/common/ol3-polyline", "ux/serializers/coretech", "ux/styles/stroke/dashdotdot", "ux/styles/stroke/solid", "ux/styles/text/text"], function (require, exports, $, ol, common_1, reduce, coretech_1, dashdotdot, strokeStyle, textStyle) {
    "use strict";
    var styler = new coretech_1.CoretechConverter();
    function parse(v, type) {
        if (typeof type === "string")
            return v;
        if (typeof type === "number")
            return parseFloat(v);
        if (typeof type === "boolean")
            return (v === "1" || v === "true");
        if (Array.isArray(type)) {
            return (v.split(",").map(function (v) { return parse(v, type[0]); }));
        }
        throw "unknown type: " + type;
    }
    var html = "\n<div class='mapmaker'>\n    <div class='toolbar'>\n        <button class='share'>Share</button>\n        <button class='clone'>Add</button>\n    </div>\n</div>\n";
    var css = "\n<style>\n    html, body, .map {\n        width: 100%;\n        height: 100%;\n        padding: 0;\n        overflow: hidden;\n        margin: 0;    \n    }\n\n    .map {\n        background-color: black;\n    }\n\n    .map.dark {\n        background: black;\n    }\n\n    .map.light {\n        background: silver;\n    }\n\n    .map.bright {\n        background: white;\n    }\n\n    .mapmaker {\n        position: absolute;\n        top: 0;\n        left: 0;\n        width: 0;\n        height: 0;\n        background: transparent;\n        z-index: 1;\n    }\n    .mapmaker .toolbar {\n        position: relative;\n        top: 10px;\n        left: 42px;\n        width: 240px;\n    }\n    .mapmaker .toolbar button {\n        border: none;\n        background: transparent;\n    }\n    button.clone {\n        display:none;\n    }\n</style>\n";
    function run() {
        $(html).appendTo(".map");
        $(css).appendTo("head");
        var options = {
            srs: 'EPSG:4326',
            center: [-82.4, 34.85],
            zoom: 15,
            background: "bright",
            geom: "",
            color: "red",
            modify: false,
            basemap: "bing"
        };
        {
            var opts_1 = options;
            Object.keys(opts_1).forEach(function (k) {
                common_1.doif(common_1.getParameterByName(k), function (v) { return opts_1[k] = parse(v, opts_1[k]); });
            });
        }
        $(".map").addClass(options.background);
        var map = new ol.Map({
            target: "map",
            keyboardEventTarget: document,
            loadTilesWhileAnimating: true,
            loadTilesWhileInteracting: true,
            controls: ol.control.defaults({ attribution: false }),
            view: new ol.View({
                projection: options.srs,
                center: options.center,
                zoom: options.zoom
            }),
            layers: [
                new ol.layer.Tile({
                    opacity: 0.8,
                    source: options.basemap !== "bing" ? new ol.source.OSM() : new ol.source.BingMaps({
                        key: 'AuPHWkNxvxVAL_8Z4G8Pcq_eOKGm5eITH_cJMNAyYoIC1S_29_HhE893YrUUbIGl',
                        imagerySet: 'Aerial'
                    })
                })]
        });
        var features = new ol.Collection();
        var layer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: features
            })
        });
        map.addLayer(layer);
        strokeStyle[0].stroke.color = options.color;
        layer.setStyle(strokeStyle.map(function (s) { return styler.fromJson(s); }));
        if (options.geom) {
            options.geom.split(",").forEach(function (encoded, i) {
                var geom;
                var points = new reduce(6, 2).decode(encoded);
                geom = new ol.geom.Polygon([points]);
                var feature = new ol.Feature(geom);
                textStyle[0].text.text = "" + (i + 1);
                var style = textStyle.concat(strokeStyle).map(function (s) { return styler.fromJson(s); });
                feature.setStyle(style);
                features.push(feature);
            });
            if (!common_1.getParameterByName("center")) {
                map.getView().fit(layer.getSource().getExtent(), map.getSize());
            }
        }
        if (options.modify) {
            var modify_1 = new ol.interaction.Modify({
                features: features,
                deleteCondition: function (event) { return ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event); }
            });
            map.addInteraction(modify_1);
            $("button.clone").show().click(function () {
                var _a = map.getView().calculateExtent([100, 100]), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
                var geom = new ol.geom.Polygon([[[a, b], [c, b], [c, d], [a, d]]]);
                var feature = new ol.Feature(geom);
                feature.setStyle(styler.fromJson(dashdotdot[0]));
                features.push(feature);
                modify_1 && map.removeInteraction(modify_1);
                modify_1 = new ol.interaction.Modify({
                    features: new ol.Collection([feature]),
                    deleteCondition: function (event) { return ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event); }
                });
                map.addInteraction(modify_1);
            });
        }
        $("button.share").click(function () {
            var href = window.location.href;
            href = href.substring(0, href.length - window.location.search.length);
            options.center = new reduce(6, 2).round(map.getView().getCenter());
            options.zoom = map.getView().getZoom();
            if (options.modify) {
                options.geom = features.getArray().map(function (feature) {
                    var geom = (feature && feature.getGeometry());
                    var points = geom.getCoordinates()[0];
                    return new reduce(6, 2).encode(points);
                }).join(",");
            }
            var opts = options;
            var querystring = Object.keys(options).map(function (k) { return (k + "=" + opts[k]); }).join("&");
            var url = encodeURI(href + "?run=labs/mapmaker&" + querystring);
            window.open(url, "_blank");
        });
        return map;
    }
    exports.run = run;
});
define("labs/polyline-encoder", ["require", "exports", "jquery", "openlayers", "labs/common/ol3-polyline", "labs/common/google-polyline"], function (require, exports, $, ol, PolylineEncoder, GoogleEncoder) {
    "use strict";
    var PRECISION = 6;
    var css = "\n<style>\n    .polyline-encoder .area {\n        margin: 20px;\n    }\n\n    .polyline-encoder .area p {\n        font-size: smaller;\n    }\n\n    .polyline-encoder .area canvas {\n        vertical-align: top;\n    }\n\n    .polyline-encoder .area label {\n        display: block;\n        margin: 10px;\n        border-bottom: 1px solid black;\n    }\n\n    .polyline-encoder .area textarea {\n        min-width: 400px;\n        min-height: 200px;\n    }\n</style>\n";
    var ux = "\n<div class='polyline-encoder'>\n    <p>\n    Demonstrates simplifying a geometry and then encoding it.  Enter an Input Geometry (e.g. [[1,2],[3,4]]) and watch the magic happen\n    </p>\n\n    <div class='input area'>\n        <label>Input Geometry</label>\n        <p>Enter a geometry here as an array of points in the form [[x1,y1], [x2,y2], ..., [xn, yn]]</p>\n        <textarea></textarea>\n        <canvas></canvas>\n    </div>\n\n    <div class='simplified area'>\n        <label>Simplified Geometry</label>\n        <p>This is a 'simplified' version of the Input Geometry.  \n        You can also enter a geometry here as an array of points in the form [[x1,y1], [x2,y2], ..., [xn, yn]]</p>\n        <textarea></textarea>\n        <canvas></canvas>\n    </div>\n\n    <div class='encoded area'>\n        <label>Encoded Simplified Geometry</label>\n        <p>This is an encoding of the Simplified Geometry.  You can also enter an encoded value here</p>\n        <textarea>[encoding]</textarea>\n        <div>Use google encoder?</div>\n        <input type='checkbox' id='use-google' />\n        <p>Ported to Typescript from https://github.com/DeMoehn/Cloudant-nyctaxi/blob/master/app/js/polyline.js</p>\n    </div>\n\n    <div class='decoded area'>\n        <label>Decoded Simplified Geometry</label>\n        <p>This is the decoding of the Encoded Geometry</p>\n        <textarea>[decoded]</textarea>\n        <canvas></canvas>\n    </div>\n\n</div>\n";
    var encoder;
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
        $("#use-google").change(function (args) {
            encoder = $("#use-google:checked").length ? new GoogleEncoder() : new PolylineEncoder(6, 2);
            $(".simplified textarea").change();
        }).change();
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
define("ux/styles/fill/gradient", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "fill": {
                "gradient": {
                    "type": "linear(200,0,201,0)",
                    "stops": "rgba(255,0,0,.1) 0%;rgba(255,0,0,0.8) 100%"
                }
            }
        },
        {
            "fill": {
                "gradient": {
                    "type": "linear(0,200,0,201)",
                    "stops": "rgba(0,255,0,0.1) 0%;rgba(0,255,0,0.8) 100%"
                }
            }
        }
    ];
});
define("labs/common/style-generator", ["require", "exports", "openlayers", "ux/styles/basic", "ux/serializers/coretech"], function (require, exports, ol, basic_styles, Coretech) {
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
define("labs/style-lab", ["require", "exports", "openlayers", "jquery", "ux/serializers/coretech", "ux/serializers/ags-simplemarkersymbol", "labs/common/style-generator"], function (require, exports, ol, $, CoretechSerializer, AgsMarkerSerializer, StyleGenerator) {
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
                    while (s) {
                        if (s instanceof HTMLCanvasElement) {
                            var dataUrl = s.toDataURL();
                            $(".last-image-clicked").attr("src", dataUrl);
                            break;
                        }
                        s = s.getImage();
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
define("labs/common/snapshot", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    {
        ol.geom.SimpleGeometry.prototype.scale = ol.geom.SimpleGeometry.prototype.scale || function (deltaX, deltaY) {
            var flatCoordinates = this.getFlatCoordinates();
            if (flatCoordinates) {
                var stride = this.getStride();
                ol.geom.flat.transform.scale(flatCoordinates, 0, flatCoordinates.length, stride, deltaX, deltaY, flatCoordinates);
                this.changed();
            }
        };
        ol.geom.flat.transform.scale = ol.geom.flat.transform.scale ||
            function (flatCoordinates, offset, end, stride, deltaX, deltaY, opt_dest) {
                var dest = opt_dest ? opt_dest : [];
                var i = 0;
                var j, k;
                for (j = offset; j < end; j += stride) {
                    dest[i++] = flatCoordinates[j] * deltaX;
                    dest[i++] = flatCoordinates[j + 1] * deltaY;
                    for (k = j + 2; k < j + stride; ++k) {
                        dest[i++] = flatCoordinates[k];
                    }
                }
                if (opt_dest && dest.length != i) {
                    dest.length = i;
                }
                return dest;
            };
    }
    var Snapshot = (function () {
        function Snapshot() {
        }
        Snapshot.render = function (canvas, feature) {
            feature = feature.clone();
            var geom = feature.getGeometry();
            var extent = geom.getExtent();
            var _a = ol.extent.getCenter(extent), dx = _a[0], dy = _a[1];
            var scale = Math.min(canvas.width / ol.extent.getWidth(extent), canvas.height / ol.extent.getHeight(extent));
            geom.translate(-dx, -dy);
            geom.scale(scale, -scale);
            geom.translate(canvas.width / 2, canvas.height / 2);
            var vtx = ol.render.toContext(canvas.getContext("2d"));
            var styles = feature.getStyleFunction()(0);
            if (!Array.isArray(styles))
                styles = [styles];
            styles.forEach(function (style) { return vtx.drawFeature(feature, style); });
        };
        Snapshot.snapshot = function (feature) {
            var canvas = document.createElement("canvas");
            var geom = feature.getGeometry();
            this.render(canvas, feature);
            return canvas.toDataURL();
        };
        return Snapshot;
    }());
    return Snapshot;
});
define("tests/data/geom/parcel", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        [
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
        ]
    ];
});
define("labs/style-to-canvas", ["require", "exports", "openlayers", "jquery", "labs/common/snapshot", "tests/data/geom/parcel"], function (require, exports, ol, $, Snapshot, parcel) {
    "use strict";
    var html = "\n<div class='style-to-canvas'>\n    <h3>Renders a feature on a canvas</h3>\n    <div class=\"area\">\n        <label>256 x 256 Canvas</label>\n        <canvas id='canvas' width=\"256\" height=\"256\"></canvas>\n    </div>\n</div>\n";
    var css = "\n<style>\n    #map {\n        display: none;\n    }\n\n    .style-to-canvas {\n    }\n\n    .style-to-canvas .area label {\n        display: block;\n        vertical-align: top;\n    }\n\n    .style-to-canvas .area {\n        border: 1px solid black;\n        padding: 20px;\n        margin: 20px;\n    }\n\n    .style-to-canvas #canvas {\n        font-family: sans serif;\n        font-size: 20px;\n        border: none;\n        padding: 0;\n        margin: 0;\n    }\n</style>\n";
    function run() {
        $(html).appendTo("body");
        $(css).appendTo("head");
        var font = $("#canvas").css("fontSize") + " " + $("#canvas").css("fontFamily");
        var style1 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: "rgba(255, 0, 0, 0.5)"
            }),
            stroke: new ol.style.Stroke({
                width: 2,
                color: "blue"
            })
        });
        var style2 = new ol.style.Style({
            text: new ol.style.Text({
                text: "style-to-canvas",
                font: font,
                fill: new ol.style.Fill({
                    color: "rgba(0, 0, 0, 1)"
                }),
                stroke: new ol.style.Stroke({
                    width: 4,
                    color: "rgba(255, 255, 255, 0.8)"
                })
            })
        });
        var canvas = document.getElementById("canvas");
        var feature = new ol.Feature(new ol.geom.Polygon(parcel));
        feature.setStyle([style1, style2]);
        Snapshot.render(canvas, feature);
    }
    exports.run = run;
});
define("tests/data/geom/polygon-with-holes", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        [
            [-115.23607381724413, 36.18020468011697],
            [-115.23585925895877, 36.179702181216726],
            [-115.23575411703308, 36.17970096569444],
            [-115.2357555390405, 36.179660925345416],
            [-115.23498759816178, 36.17965671947266],
            [-115.23498227780165, 36.17965563145225],
            [-115.23497562817354, 36.17965345801133],
            [-115.23497429411718, 36.179653454129465],
            [-115.2349729648491, 36.179652368709114],
            [-115.23497164190998, 36.17965236485955],
            [-115.23497031260206, 36.17965128845199],
            [-115.23496366297462, 36.17964911501038],
            [-115.23495435806059, 36.17964152607966],
            [-115.23495037983507, 36.17963610674103],
            [-115.23494905056762, 36.17963502132042],
            [-115.23494905535622, 36.17963393978194],
            [-115.23494772608885, 36.17963285436133],
            [-115.23494773087741, 36.17963177282287],
            [-115.23494374153573, 36.17962635345167],
            [-115.23494242663457, 36.17962202341565],
            [-115.23494244274961, 36.179613362030594],
            [-115.23494115849935, 36.17958955512785],
            [-115.23494259074424, 36.179539762821165],
            [-115.23495080755244, 36.17943153234975],
            [-115.23498190979615, 36.179198854743774],
            [-115.23498597483993, 36.179162057736576],
            [-115.23498741333559, 36.17911335600928],
            [-115.23498760303814, 36.1790202799572],
            [-115.23498894037036, 36.17901703017802],
            [-115.23499294903999, 36.17901054351405],
            [-115.23500627711793, 36.179000821282315],
            [-115.23501027775183, 36.17899866080441],
            [-115.23501827423149, 36.1789954213867],
            [-115.23502227007734, 36.178994342446956],
            [-115.23503690505271, 36.178993267421134],
            [-115.23613088558278, 36.17900978428773],
            [-115.23641035743786, 36.17901554257806],
            [-115.23642233215821, 36.17901772235737],
            [-115.23642366143577, 36.17901880776175],
            [-115.2364249954815, 36.17901881162746],
            [-115.23643430369208, 36.17902314678388],
            [-115.23644359756013, 36.1790307355685],
            [-115.23644493318729, 36.17903290254361],
            [-115.23644625134835, 36.179033987915574],
            [-115.23644891148601, 36.179038321833545],
            [-115.23644890671817, 36.179039403372215],
            [-115.23645023599641, 36.179040488776366],
            [-115.23645287229544, 36.179050230387844],
            [-115.23644236273168, 36.179626054530914],
            [-115.23668058083813, 36.17963175574282],
            [-115.2366834748921, 36.179522437195914],
            [-115.23661559800996, 36.17952127625068],
            [-115.23661568079545, 36.17948230455008],
            [-115.23656510706341, 36.179480085095875],
            [-115.23656514052031, 36.179464925432384],
            [-115.23654650808301, 36.17946490751295],
            [-115.2365540175394, 36.17905252428298],
            [-115.23655670160856, 36.17904386161155],
            [-115.23656071015083, 36.179037374894435],
            [-115.23656470915981, 36.17903305125468],
            [-115.23657136994915, 36.17902764475913],
            [-115.2365767093539, 36.179024406553935],
            [-115.2365846946555, 36.17902116699908],
            [-115.23659535439921, 36.17901901674222],
            [-115.23713833886198, 36.1790294298395],
            [-115.23715563711139, 36.17902945282161],
            [-115.23716229150622, 36.17903054460291],
            [-115.23716894114325, 36.17903271792267],
            [-115.23717558602276, 36.179035972780895],
            [-115.23718622040953, 36.17904463792368],
            [-115.23719019876008, 36.179050057189215],
            [-115.23719285418174, 36.179055472629685],
            [-115.23719416919774, 36.179059802642044],
            [-115.23719116643991, 36.17922432514126],
            [-115.23719241007713, 36.179267626889896],
            [-115.23721203241809, 36.179434332838255],
            [-115.23721989085172, 36.17949279544402],
            [-115.23722777151995, 36.17954367823275],
            [-115.23722497973465, 36.179609698939885],
            [-115.23722409330264, 36.180036161511154],
            [-115.23722639987513, 36.180209351752936],
            [-115.23722102868629, 36.18022991275794],
            [-115.23721300999347, 36.18024830300364],
            [-115.2372009938535, 36.18026560013875],
            [-115.23718632380785, 36.18027965395507],
            [-115.23717165215595, 36.180291544660236],
            [-115.23715700433107, 36.180298018657865],
            [-115.23713968041169, 36.18030882013731],
            [-115.23710901412761, 36.18033259770809],
            [-115.23709567812136, 36.180346655371196],
            [-115.23708635703858, 36.18034772799106],
            [-115.23707305914606, 36.18034554445107],
            [-115.23705842558819, 36.180341193941615],
            [-115.23702517527396, 36.18032816419867],
            [-115.23699059405523, 36.18031946581843],
            [-115.23695998492562, 36.180315096116985],
            [-115.23687881268215, 36.18030849810276],
            [-115.23662063061164, 36.18030168495093],
            [-115.23638240890344, 36.18029382050014],
            [-115.23637957338431, 36.18037715490031],
            [-115.23691856336063, 36.180392974213746],
            [-115.23696247517685, 36.18039844594108],
            [-115.23699839685315, 36.180408229759635],
            [-115.23701967540914, 36.18041583514312],
            [-115.23703030836687, 36.18042233718951],
            [-115.23703428837263, 36.18042991956851],
            [-115.23703293205983, 36.18043749552426],
            [-115.23702757508498, 36.18045481190387],
            [-115.23702218797958, 36.180484025271284],
            [-115.23701522157822, 36.180634620287506],
            [-115.23701388430145, 36.18063787008873],
            [-115.23701388589801, 36.1806400331979],
            [-115.23701254226417, 36.18064220142843],
            [-115.23701121134403, 36.18064653280025],
            [-115.23700987247047, 36.180647619492305],
            [-115.23700986771001, 36.18064870103079],
            [-115.23700853999335, 36.18064977874215],
            [-115.23700853523289, 36.180650860280636],
            [-115.23700720747651, 36.18065194700479],
            [-115.23700586384234, 36.18065411523524],
            [-115.23700319725172, 36.18065627963851],
            [-115.23699919818345, 36.180660603291415],
            [-115.23698854137972, 36.18066708881365],
            [-115.23698720726621, 36.18066709396689],
            [-115.23698587954891, 36.18066817167798],
            [-115.23698454547511, 36.18066816781841],
            [-115.23698320660087, 36.18066925451012],
            [-115.23698188364428, 36.18066925068268],
            [-115.23697522590852, 36.18067141255135],
            [-115.2369725577608, 36.18067140483197],
            [-115.23696856185578, 36.180672483836176],
            [-115.23696191368127, 36.18067247361428],
            [-115.2369605748066, 36.18067356030576],
            [-115.23613944034335, 36.18064871246639],
            [-115.23613411993963, 36.180647615484105],
            [-115.23612747019557, 36.180645442106865],
            [-115.23612614089488, 36.18064435669936],
            [-115.23612347752092, 36.180643267422624],
            [-115.23611816027882, 36.180638934805],
            [-115.23611418196273, 36.18063350649241],
            [-115.23611418673549, 36.180632424954],
            [-115.23611286220795, 36.180630258007966],
            [-115.23611153614853, 36.18062591893997],
            [-115.23612705321317, 36.18020582594842],
            [-115.23607381724413, 36.18020468011697]
        ],
        [
            [-115.23618294625469, 36.17956944939985],
            [-115.23618152437697, 36.1796170696354],
            [-115.2361813999148, 36.17967551816986],
            [-115.23634908732791, 36.17967680645728],
            [-115.23634919412686, 36.179624856198686],
            [-115.2363824679463, 36.17962489855586],
            [-115.2363825795315, 36.1795718577452],
            [-115.23638534968705, 36.179520987743686],
            [-115.23635074658684, 36.17951986899516],
            [-115.2363521827075, 36.17946899512751],
            [-115.2363522910816, 36.179419207976636],
            [-115.236386892558, 36.179418163614926],
            [-115.2363870009098, 36.17936837646343],
            [-115.23638710449244, 36.17931967085019],
            [-115.2363551585448, 36.179318541777775],
            [-115.23635527168521, 36.17926767308688],
            [-115.23638854535363, 36.1792677154416],
            [-115.23638995914024, 36.17922442138702],
            [-115.23641258255111, 36.1792244508959],
            [-115.23641552635529, 36.17909132031167],
            [-115.23634764988991, 36.17909015020365],
            [-115.23634769453865, 36.179067419704054],
            [-115.23627716107944, 36.179066250868104],
            [-115.2362146097472, 36.17906508710888],
            [-115.2362145698311, 36.17908673606951],
            [-115.23614802742047, 36.17908556971632],
            [-115.23608680530958, 36.179085500310464],
            [-115.23608551598718, 36.17906276594198],
            [-115.23601765066995, 36.17906159567923],
            [-115.23595376526016, 36.179060436926335],
            [-115.23595372049765, 36.179083167425176],
            [-115.23588717809511, 36.179082000927025],
            [-115.23582195384806, 36.17908191977068],
            [-115.23582201454218, 36.17905810776571],
            [-115.23575946318529, 36.17905695278159],
            [-115.23569424377776, 36.17905578100435],
            [-115.23569419894028, 36.179078511502695],
            [-115.23563031352298, 36.179077352577124],
            [-115.23562736517071, 36.17921372778321],
            [-115.23575645912092, 36.179216058458195],
            [-115.23588422384631, 36.17921729457083],
            [-115.2360159859503, 36.17921962369661],
            [-115.23614508469727, 36.17922087241399],
            [-115.2362741723721, 36.17922211194713],
            [-115.23627408780143, 36.179266491406025],
            [-115.23618757879821, 36.17926530324189],
            [-115.23618737296034, 36.1793648775767],
            [-115.23618449573719, 36.17946770684685],
            [-115.23618294625469, 36.17956944939985]
        ],
        [
            [-115.23686858906352, 36.17946421772446],
            [-115.23708818379693, 36.179467737173354],
            [-115.23708696717102, 36.17941578308344],
            [-115.23712289793187, 36.17941582390601],
            [-115.23712300421819, 36.17936387364166],
            [-115.23712310578506, 36.17931299590278],
            [-115.23708984321254, 36.17931295378433],
            [-115.23708994476085, 36.179262085057985],
            [-115.23709005110757, 36.17921012577965],
            [-115.23712465880284, 36.17921017178786],
            [-115.23712609917445, 36.17915821636679],
            [-115.23712620069831, 36.179107347638976],
            [-115.23709293185466, 36.17910622395091],
            [-115.23709302864063, 36.179056436761556],
            [-115.23687476910101, 36.179052921188244],
            [-115.23665251856224, 36.17904939365998],
            [-115.2366510762937, 36.17909918596493],
            [-115.236621804877, 36.179099146261294],
            [-115.2366203594083, 36.17915218321373],
            [-115.23661891870293, 36.179204138626986],
            [-115.23664953536439, 36.17920417321409],
            [-115.23664809467705, 36.17925612862733],
            [-115.23664798649122, 36.1793059157809],
            [-115.23661738090723, 36.17930588122539],
            [-115.23661727270161, 36.179355668378406],
            [-115.23661583834084, 36.17940870536066],
            [-115.23664644873001, 36.17940765837814],
            [-115.23664500327055, 36.17946069532819],
            [-115.23686858906352, 36.17946421772446]
        ],
        [
            [-115.23531117600369, 36.179579184921224],
            [-115.23537638954298, 36.179579266325774],
            [-115.23537633500685, 36.17960416891128],
            [-115.23543755751767, 36.17960423868263],
            [-115.23550144331914, 36.17960540672608],
            [-115.23550149626053, 36.17957834103089],
            [-115.23556538204222, 36.17957950904011],
            [-115.23562793859004, 36.1795795825893],
            [-115.23562787939407, 36.179605557701095],
            [-115.23569043592308, 36.17960564023055],
            [-115.23575431065326, 36.17960679909393],
            [-115.23575437458497, 36.17957974244331],
            [-115.23582357921542, 36.179579826178696],
            [-115.23582252817624, 36.17944777458885],
            [-115.23569209497232, 36.17944653066063],
            [-115.23556565919206, 36.17944637074196],
            [-115.23543922341348, 36.179446210689804],
            [-115.23531278759663, 36.17944605951695],
            [-115.23525822443638, 36.179445991018255],
            [-115.23525825181221, 36.179429749785584],
            [-115.23525979770169, 36.17932908878721],
            [-115.23526002234115, 36.17922301618337],
            [-115.23526157145767, 36.17911911053341],
            [-115.23526310621648, 36.17901844949739],
            [-115.23509542023675, 36.1790171596965],
            [-115.23509531107005, 36.17906694684531],
            [-115.23506869664503, 36.17906691449056],
            [-115.23506858900447, 36.179118864748276],
            [-115.23506846696303, 36.179174068634],
            [-115.23509375849314, 36.17917409714073],
            [-115.23509365407101, 36.17922281176253],
            [-115.23509354644585, 36.17927476201899],
            [-115.23506693195053, 36.17927472966353],
            [-115.23506548542977, 36.17932776658991],
            [-115.23506537295849, 36.179380807396655],
            [-115.23509332158127, 36.179380834620375],
            [-115.23509321715753, 36.17942954924048],
            [-115.23509311910382, 36.179479336418154],
            [-115.23506782268866, 36.179480389449196],
            [-115.23506772461859, 36.17953017662637],
            [-115.23506627330525, 36.17958429508896],
            [-115.23509289902239, 36.17958432747747],
            [-115.23509145729834, 36.179636282863015],
            [-115.2352591493816, 36.17963649113807],
            [-115.2352592215437, 36.17960509928969],
            [-115.23531112144691, 36.17960408750662],
            [-115.23531117600369, 36.179579184921224]
        ],
        [
            [-115.23715466140786, 36.18014323272865],
            [-115.23715476767816, 36.1800912824705],
            [-115.23712815766072, 36.18009016903315],
            [-115.23712826398778, 36.18003820976182],
            [-115.23712703145384, 36.17998733718353],
            [-115.23715498501544, 36.179986291401335],
            [-115.23715376202102, 36.179933246732716],
            [-115.23715254534713, 36.17988129264721],
            [-115.2371259290423, 36.17987909763896],
            [-115.23712603221048, 36.179830383013936],
            [-115.2371248187149, 36.17977518427921],
            [-115.23715276744281, 36.17977522003574],
            [-115.23715287850983, 36.17972217922288],
            [-115.23715298477842, 36.17967022896107],
            [-115.2371250360878, 36.179670193204785],
            [-115.23712379880102, 36.1796204021621],
            [-115.23695212519661, 36.17961802187439],
            [-115.23695190123763, 36.17972193137736],
            [-115.23695300817042, 36.17982908938646],
            [-115.23695546344958, 36.179933006637626],
            [-115.2369552394907, 36.18003691613518],
            [-115.23695635595108, 36.18014191106148],
            [-115.2369574708579, 36.180244733863816],
            [-115.23712782763906, 36.18024602878663],
            [-115.2371266062204, 36.18019515624228],
            [-115.23715322103163, 36.18019518814154],
            [-115.23715466140786, 36.18014323272865]
        ],
        [
            [-115.23677512801696, 36.18024883880216],
            [-115.23684033735668, 36.18025000095081],
            [-115.23684172069555, 36.18022619277727],
            [-115.2368909608097, 36.18022841726922],
            [-115.23690560226717, 36.180228441612684],
            [-115.23691120233957, 36.18009530971011],
            [-115.23677945302525, 36.18008973694613],
            [-115.2366516853144, 36.18008632965913],
            [-115.23651993761892, 36.18008291971901],
            [-115.23639084059808, 36.180078435763335],
            [-115.23638656898369, 36.18021264402907],
            [-115.23644778716528, 36.18021380383769],
            [-115.23644773935501, 36.180239778980805],
            [-115.2365142827474, 36.18024094517253],
            [-115.23657948730926, 36.18024318900176],
            [-115.23657953666071, 36.18021937696756],
            [-115.23664608639028, 36.18022162465665],
            [-115.23670996163874, 36.18022278301284],
            [-115.2367099186795, 36.180247676617995],
            [-115.23677512801696, 36.18024883880216]
        ],
        [
            [-115.23684226425577, 36.18060515225207],
            [-115.23697402395965, 36.18060856187418],
            [-115.23697829035417, 36.18047531796289],
            [-115.23691707672076, 36.180473076885946],
            [-115.23691712597076, 36.18044926485199],
            [-115.23684925308694, 36.18044701348367],
            [-115.23678670064628, 36.18044585001762],
            [-115.23678665135678, 36.180469662051266],
            [-115.23672010772597, 36.18046850502276],
            [-115.23665489189531, 36.18046625222419],
            [-115.23665627370782, 36.180440280944794],
            [-115.23658840084047, 36.18043802942873],
            [-115.23652186204708, 36.18043578173885],
            [-115.23652180310351, 36.18046176586181],
            [-115.23645793247239, 36.18045951685289],
            [-115.23645364931258, 36.18059384224745],
            [-115.2365827519096, 36.180597253613996],
            [-115.23671716865431, 36.18060066220171],
            [-115.23684226425577, 36.18060515225207]
        ],
        [
            [-115.23633258643937, 36.18056985047485],
            [-115.23633402914288, 36.180520013123044],
            [-115.23633545745574, 36.180473438411894],
            [-115.2363382229087, 36.18042364995789],
            [-115.23631959024468, 36.180423632001876],
            [-115.23632235412812, 36.18037168043877],
            [-115.23632379186483, 36.18032296968805],
            [-115.23632655574141, 36.180271018123904],
            [-115.2363279934334, 36.18022231638518],
            [-115.23618957515714, 36.18021889575871],
            [-115.23618814849672, 36.18026759752763],
            [-115.23618537341171, 36.180319549055824],
            [-115.23618261740978, 36.18036717442975],
            [-115.23618117638654, 36.18041912982545],
            [-115.2361958179183, 36.18041914524308],
            [-115.23619438644577, 36.18046893756167],
            [-115.23619295327786, 36.180516593809216],
            [-115.23619152160241, 36.18056643119107],
            [-115.23618875108032, 36.18061734624244],
            [-115.23632981596866, 36.18062077454276],
            [-115.23633258643937, 36.18056985047485]
        ],
        [
            [-115.23657932815844, 36.17968142122321],
            [-115.23651411929491, 36.179680258934894],
            [-115.2365114017708, 36.179704072254324],
            [-115.23644885627627, 36.179703990185644],
            [-115.23644591403833, 36.17983929287941],
            [-115.23657633679484, 36.17984053595765],
            [-115.2367107522468, 36.17984394454598],
            [-115.23671236152083, 36.179710810103074],
            [-115.23664582810342, 36.17970748094652],
            [-115.23664587108127, 36.1796825873393],
            [-115.23657932815844, 36.17968142122321]
        ]
    ];
});
define("tests/data/geom/point", ["require", "exports"], function (require, exports) {
    "use strict";
    return [-115.2553, 36.1832];
});
define("labs/style-viewer", ["require", "exports", "openlayers", "jquery", "labs/common/snapshot", "labs/common/common", "ux/serializers/coretech", "tests/data/geom/polygon-with-holes"], function (require, exports, ol, $, Snapshot, common_2, Serializer, polygonGeom) {
    "use strict";
    var html = "\n<div class='style-to-canvas'>\n    <h3>Renders a feature on a canvas</h3>\n    <div class=\"area\">\n        <label>256 x 256 Canvas</label>\n        <canvas id='canvas' width=\"256\" height=\"256\"></canvas>\n    </div>\n    <div class=\"area\">\n        <label>Style</label>\n        <textarea class='style'></textarea>\n    </div>\n    <div class=\"area\">\n        <label>Potential control for setting linear gradient start/stop locations</label>\n        <div class=\"colorramp\">\n            <input class=\"top\" type=\"range\" min=\"0\" max=\"100\" value=\"20\"/>\n            <input class=\"bottom\" type=\"range\" min=\"0\" max=\"100\" value=\"80\"/>\n        </div>\n    </div>\n</div>\n";
    var css = "\n<style>\n    #map {\n        display: none;\n    }\n\n    .style-to-canvas {\n    }\n\n    .style-to-canvas .area label {\n        display: block;\n        vertical-align: top;\n    }\n\n    .style-to-canvas .area {\n        border: 1px solid black;\n        padding: 20px;\n        margin: 20px;\n    }\n\n    .style-to-canvas .area .style {\n        width: 100%;\n        height: 400px;\n    }\n\n    .style-to-canvas #canvas {\n        font-family: sans serif;\n        font-size: 20px;\n        border: none;\n        padding: 0;\n        margin: 0;\n    }\n\n    div.colorramp {\n        display: inline-block;\n        background: linear-gradient(to right, rgba(250,0,0,0), rgba(250,0,0,1) 60%, rgba(250,100,0,1) 85%, rgb(250,250,0) 95%);\n        width:100%;\n    }\n\n    div.colorramp > input[type=range] {\n        -webkit-appearance: slider-horizontal;\n        display:block;\n        width:100%;\n        background-color:transparent;\n    }\n\n    div.colorramp > label {\n        display: inline-block;\n    }\n\n    div.colorramp > input[type='range'] {\n        box-shadow: 0 0 0 white;\n    }\n\n    div.colorramp > input[type=range]::-webkit-slider-runnable-track {\n        height: 0px;     \n    }\n\n    div.colorramp > input[type='range'].top::-webkit-slider-thumb {\n        margin-top: -10px;\n    }\n\n    div.colorramp > input[type='range'].bottom::-webkit-slider-thumb {\n        margin-top: -12px;\n    }\n    \n</style>\n";
    function loadStyle(name) {
        var mids = name.split(",").map(function (name) { return ("../ux/styles/" + name); });
        var d = $.Deferred();
        require(mids, function () {
            var styles = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                styles[_i - 0] = arguments[_i];
            }
            var style = [];
            styles.forEach(function (s) { return style = style.concat(s); });
            d.resolve(style);
        });
        return d;
    }
    function loadGeom(name) {
        var mids = name.split(",").map(function (name) { return ("../data/geom/" + name); });
        var d = $.Deferred();
        require(mids, function () {
            var shapes = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                shapes[_i - 0] = arguments[_i];
            }
            var geoms = shapes.map(function (shape) {
                if (typeof shape[0] === "number") {
                    return new ol.geom.Point(shape);
                }
                if (typeof shape[0][0] === "number") {
                    return new ol.geom.LineString(shape);
                }
                if (typeof shape[0][0][0] === "number") {
                    return new ol.geom.Polygon(shape);
                }
                if (typeof shape[0][0][0][0] === "number") {
                    return new ol.geom.MultiPolygon(shape);
                }
                throw "invalid shape: " + shape;
            });
            d.resolve(geoms);
        });
        return d;
    }
    function run() {
        var serializer = new Serializer.CoretechConverter();
        $(html).appendTo("body");
        $(css).appendTo("head");
        var canvas = document.getElementById("canvas");
        var feature = new ol.Feature();
        feature.setGeometry(new ol.geom.MultiPolygon([polygonGeom]));
        var redraw = function () {
            var styles = JSON.parse($(".style").val());
            var style = styles.map(function (style) { return serializer.fromJson(style); });
            feature.setStyle(style);
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            Snapshot.render(canvas, feature);
        };
        setInterval(function () {
            try {
                redraw();
            }
            catch (ex) {
            }
        }, 2500);
        var geom = common_2.getParameterByName("geom");
        if (geom) {
            loadGeom(geom).then(function (geoms) {
                feature.setGeometry(geoms[0]);
                redraw();
            });
        }
        var style = common_2.getParameterByName("style");
        if (style) {
            loadStyle(style).then(function (styles) {
                var style = styles.map(function (style) { return serializer.fromJson(style); });
                $(".style").val(JSON.stringify(styles, null, 2));
                redraw();
            });
        }
        else {
            var font = $("#canvas").css("fontSize") + " " + $("#canvas").css("fontFamily");
            var style1 = serializer.fromJson({
                "fill": {
                    "color": "rgba(255, 0, 0, 0.5)"
                },
                "stroke": {
                    "color": "blue",
                    "width": 2
                }
            });
            var style2 = serializer.fromJson({
                "text": {
                    "fill": {
                        "color": "rgba(0, 0, 0, 1)"
                    },
                    "stroke": {
                        "color": "rgba(255, 255, 255, 0.8)",
                        "width": 4
                    },
                    "text": "style-to-canvas",
                    "offset-x": 0,
                    "offset-y": 0,
                    "font": "20px 'sans serif'"
                }
            });
            var styles = [style1, style2];
            $(".style").val(JSON.stringify(styles.map(function (s) { return serializer.toJson(s); }), null, 2));
            redraw();
        }
    }
    exports.run = run;
});
define("labs/providers/osm", ["require", "exports"], function (require, exports) {
    "use strict";
    var OpenStreet = (function () {
        function OpenStreet() {
            this.dataType = 'json';
            this.method = 'GET';
            this.settings = {
                url: '//nominatim.openstreetmap.org/search/',
                params: {
                    q: '',
                    format: 'json',
                    addressdetails: 1,
                    limit: 10,
                    countrycodes: '',
                    'accept-language': 'en-US'
                }
            };
        }
        OpenStreet.prototype.getParameters = function (options) {
            return {
                url: this.settings.url,
                params: {
                    q: options.query,
                    format: 'json',
                    addressdetails: 1,
                    limit: options.limit || this.settings.params.limit,
                    countrycodes: options.countrycodes || this.settings.params.countrycodes,
                    'accept-language': options.lang || this.settings.params['accept-language']
                }
            };
        };
        OpenStreet.prototype.handleResponse = function (args) {
            return args.sort(function (v) { return v.importance || 1; }).map(function (result) { return ({
                original: result,
                lon: parseFloat(result.lon),
                lat: parseFloat(result.lat),
                address: {
                    name: result.address.neighbourhood || '',
                    road: result.address.road || '',
                    postcode: result.address.postcode,
                    city: result.address.city || result.address.town,
                    state: result.address.state,
                    country: result.address.country
                }
            }); });
        };
        return OpenStreet;
    }());
    exports.OpenStreet = OpenStreet;
});
define("tests/ags-format", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    function run() {
        var formatter = (new ol.format.EsriJSON());
        var olFeature = new ol.Feature(new ol.geom.Point([0, 0]));
        var esriFeature = formatter.writeFeatureObject(olFeature);
        olFeature = formatter.readFeature(esriFeature);
        console.log("esriFeature", esriFeature);
        {
            var geom = esriFeature.geometry;
            console.assert(geom.x === 0);
            console.assert(geom.y === 0);
        }
        olFeature.setGeometry(new ol.geom.LineString([[0, 0], [0, 0]]));
        esriFeature = formatter.writeFeatureObject(olFeature);
        olFeature = formatter.readFeature(esriFeature);
        console.log("esriFeature", esriFeature);
        {
            var geom = esriFeature.geometry;
            console.assert(geom.paths[0][0][0] === 0);
        }
        olFeature.setGeometry(new ol.geom.MultiLineString([[[0, 0], [0, 0]], [[0, 0], [0, 0]]]));
        esriFeature = formatter.writeFeatureObject(olFeature);
        olFeature = formatter.readFeature(esriFeature);
        console.log("esriFeature", esriFeature);
        {
            var geom = esriFeature.geometry;
            console.assert(geom.paths[0][0][0] === 0);
        }
        olFeature.setGeometry(new ol.geom.Polygon([[[0, 0], [0, 0]]]));
        esriFeature = formatter.writeFeatureObject(olFeature);
        olFeature = formatter.readFeature(esriFeature);
        console.log("esriFeature", esriFeature);
        {
            var geom = esriFeature.geometry;
            console.assert(geom.rings[0][0][0] === 0);
        }
        olFeature.setGeometry(new ol.geom.MultiPolygon([[[[0, 0], [0, 0]]], [[[0, 0], [0, 0]]]]));
        esriFeature = formatter.writeFeatureObject(olFeature);
        olFeature = formatter.readFeature(esriFeature);
        console.log("esriFeature", esriFeature);
        {
            var geom = esriFeature.geometry;
            console.assert(geom.rings[0][0][0] === 0);
        }
        olFeature.setGeometry(new ol.geom.MultiPoint([[0, 0], [0, 0]]));
        esriFeature = formatter.writeFeatureObject(olFeature);
        olFeature = formatter.readFeature(esriFeature);
        console.log("esriFeature", esriFeature);
        {
            var geom = esriFeature.geometry;
            console.assert(geom.points[0][0] === 0);
        }
        olFeature.setProperties({ foo: "bar" });
        esriFeature = formatter.writeFeatureObject(olFeature);
        olFeature = formatter.readFeature(esriFeature);
        console.log("esriFeature", esriFeature);
        {
            console.assert(olFeature.get("foo") === "bar");
        }
    }
    exports.run = run;
});
define("ux/controls/input", ["require", "exports", "jquery", "openlayers", "labs/common/common"], function (require, exports, $, ol, common_3) {
    "use strict";
    var css = "\n<style id='locator'>\n    .ol-input {\n        position:absolute;\n    }\n    .ol-input.top {\n        top: 0.5em;\n    }\n    .ol-input.left {\n        left: 0.5em;\n    }\n    .ol-input.bottom {\n        bottom: 0.5em;\n    }\n    .ol-input.right {\n        right: 0.5em;\n    }\n    .ol-input.top.left {\n        top: 4.5em;\n    }\n    .ol-input button {\n        min-height: 1.375em;\n        min-width: 1.375em;\n        width: auto;\n        display: inline;\n    }\n    .ol-input.left button {\n        float:right;\n    }\n    .ol-input.right button {\n        float:left;\n    }\n    .ol-input input {\n        height: 24px;\n        min-width: 240px;\n        border: none;\n        padding: 0;\n        margin: 0;\n        margin-left: 2px;\n        margin-top: 1px;\n        vertical-align: top;\n    }\n    .ol-input input.hidden {\n        display: none;\n    }\n</style>\n";
    var expando = {
        right: '»',
        left: '«'
    };
    var defaults = {
        className: 'ol-input bottom left',
        expanded: false,
        closedText: expando.right,
        openedText: expando.left,
        placeholderText: 'Search'
    };
    var Geocoder = (function (_super) {
        __extends(Geocoder, _super);
        function Geocoder(options) {
            var _this = this;
            _super.call(this, {
                element: options.element,
                target: options.target
            });
            var button = this.button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.title = options.placeholderText;
            options.element.appendChild(button);
            var input = this.input = document.createElement('input');
            input.placeholder = options.placeholderText;
            options.element.appendChild(input);
            button.addEventListener("click", function () {
                options.expanded ? _this.collapse(options) : _this.expand(options);
            });
            input.addEventListener("keypress", function (args) {
                if (args.key === "Enter") {
                    button.focus();
                    _this.collapse(options);
                }
            });
            input.addEventListener("change", function () {
                _this.dispatchEvent({
                    type: "change",
                    value: input.value
                });
            });
            input.addEventListener("blur", function () {
            });
            options.expanded ? this.expand(options) : this.collapse(options);
        }
        Geocoder.create = function (options) {
            $("style#locator").length || $(css).appendTo('head');
            options = common_3.mixin({
                openedText: options.className && -1 < options.className.indexOf("left") ? expando.left : expando.right,
                closedText: options.className && -1 < options.className.indexOf("left") ? expando.right : expando.left,
            }, options || {});
            options = common_3.mixin(common_3.mixin({}, defaults), options);
            var element = document.createElement('div');
            element.className = options.className + " " + ol.css.CLASS_UNSELECTABLE + " " + ol.css.CLASS_CONTROL;
            var geocoderOptions = common_3.mixin({
                element: element,
                target: options.target,
                expanded: false
            }, options);
            return new Geocoder(geocoderOptions);
        };
        Geocoder.prototype.collapse = function (options) {
            options.expanded = false;
            this.input.classList.toggle("hidden", true);
            this.button.classList.toggle("hidden", false);
            this.button.innerHTML = options.closedText;
        };
        Geocoder.prototype.expand = function (options) {
            options.expanded = true;
            this.input.classList.toggle("hidden", false);
            this.button.classList.toggle("hidden", true);
            this.button.innerHTML = options.openedText;
            this.input.focus();
            this.input.select();
        };
        return Geocoder;
    }(ol.control.Control));
    exports.Geocoder = Geocoder;
});
define("tests/geocoder", ["require", "exports", "labs/mapmaker", "ux/controls/input", "labs/providers/osm"], function (require, exports, MapMaker, input_1, osm_1) {
    "use strict";
    function run() {
        var map = MapMaker.run();
        var searchProvider = new osm_1.OpenStreet();
        var geocoder = input_1.Geocoder.create({
            closedText: "+",
            openedText: "−"
        });
        map.addControl(geocoder);
        geocoder.on("change", function (args) {
            if (!args.value)
                return;
            console.log("search", args.value);
            var searchArgs = searchProvider.getParameters({
                query: args.value,
                limit: 1,
                countrycodes: 'us',
                lang: 'en'
            });
            $.ajax({
                url: searchArgs.url,
                method: searchProvider.method || 'GET',
                data: searchArgs.params,
                dataType: searchProvider.dataType || 'json'
            }).then(function (json) {
                var results = searchProvider.handleResponse(json);
                results.some(function (r) {
                    console.log(r);
                    map.getView().setCenter([r.lon, r.lat]);
                    return true;
                });
            }).fail(function () {
                console.error("geocoder failed");
            });
        });
        map.addControl(input_1.Geocoder.create({
            className: 'ol-input bottom right',
            expanded: true
        }));
        map.addControl(input_1.Geocoder.create({
            className: 'ol-input top right',
            expanded: false
        }));
        map.addControl(input_1.Geocoder.create({
            className: 'ol-input top left',
            expanded: false
        }));
    }
    exports.run = run;
});
define("tests/google-polyline", ["require", "exports", "labs/common/ol3-polyline", "labs/common/google-polyline"], function (require, exports, OlEncoder, Encoder) {
    "use strict";
    var polyline = [[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]];
    var encoding = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";
    function run() {
        {
            var encoder = new Encoder();
            console.assert(encoder.encode(encoder.decode(encoding)) === encoding);
            console.assert(encoding === encoder.encode(polyline));
        }
        {
            var olEncoder = new OlEncoder();
            console.assert(olEncoder.encode(olEncoder.decode(encoding)) === encoding);
            console.assert(encoding === olEncoder.encode(polyline));
        }
    }
    exports.run = run;
});
define("tests/index", ["require", "exports"], function (require, exports) {
    "use strict";
    function run() {
        var l = window.location;
        var path = "" + l.origin + l.pathname + "?run=tests/";
        var labs = "\n    ags-format\n    google-polyline\n    webmap\n    index\n    ";
        document.writeln("\n    <p>\n    Watch the console output for failed assertions (blank is good).\n    </p>\n    ");
        document.writeln(labs
            .split(/ /)
            .map(function (v) { return v.trim(); })
            .filter(function (v) { return !!v; })
            .sort()
            .map(function (lab) { return ("<a href=" + path + lab + "&debug=1>" + lab + "</a>"); })
            .join("<br/>"));
    }
    exports.run = run;
    ;
});
define("tests/webmap", ["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    var webmap = "ae85c9d9c5ae409bb1f351617ea0bffc";
    var portal = "https://www.arcgis.com";
    var items_endpoint = "http://www.arcgis.com/sharing/rest/content/items";
    function endpoint() {
        return items_endpoint + "/" + webmap + "/data?f=json";
    }
    function run() {
        if (1)
            $.ajax({
                url: endpoint(),
                dataType: "json"
            }).done(function (webmap) {
                console.assert(webmap.authoringApp === "WebMapViewer", "authoringApp");
                console.assert(webmap.authoringAppVersion === "4.2");
                webmap.operationalLayers;
                webmap.baseMap;
                console.assert(webmap.spatialReference.latestWkid === 3857);
                console.assert(webmap.version === "2.5");
                console.log("done");
            });
    }
    exports.run = run;
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
define("ux/ags-symbols", ["require", "exports", "openlayers", "ux/serializers/ags-simplemarkersymbol", "labs/common/style-generator", "ux/styles/ags/simplemarkersymbol-circle", "ux/styles/ags/simplemarkersymbol-cross", "ux/styles/ags/simplemarkersymbol-square", "ux/styles/ags/simplemarkersymbol-diamond", "ux/styles/ags/simplemarkersymbol-path", "ux/styles/ags/simplemarkersymbol-x"], function (require, exports, ol, Formatter, StyleGenerator, circleSymbol, crossSymbol, squareSymbol, diamondSymbol, pathSymbol, xSymbol) {
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
define("ux/styles/circle/alert", ["require", "exports"], function (require, exports) {
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
define("ux/styles/circle/gradient", ["require", "exports"], function (require, exports) {
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
define("ux/styles/icon/png", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "icon": {
                anchor: [0.5, 46],
                anchorXUnits: "fraction",
                anchorYUnits: "pixels",
                src: "http://openlayers.org/en/v3.17.1/examples/data/icon.png"
            }
        }
    ];
});
define("ux/styles/icon/svg", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "size": 30,
            "outline": {
                "color": "red",
                "width": 5
            },
            "path": "M23 2 L23 23 L43 16.5 L23 23 L35.34349029814194 39.989356881873896 L23 23 L10.656509701858067 39.989356881873896 L23 23 L3.0278131578017735 16.510643118126108 L23 23 L23 2 Z",
            "color": "white"
        }
    ];
});
define("ux/styles/star/4star", ["require", "exports"], function (require, exports) {
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
define("ux/styles/star/6star", ["require", "exports"], function (require, exports) {
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
define("ux/styles/star/cold", ["require", "exports"], function (require, exports) {
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
define("ux/styles/stroke/dash", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "stroke": {
                "color": "blue",
                "width": 2,
                "lineDash": [4]
            }
        }
    ];
});
define("ux/styles/stroke/dot", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "stroke": {
                "color": "blue",
                "width": 2,
                "lineDash": [2]
            }
        }
    ];
});
//# sourceMappingURL=run.js.map