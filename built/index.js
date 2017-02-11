var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
define("ol3-lab/labs/common/ajax", ["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    function jsonp(url, args, callback) {
        if (args === void 0) { args = {}; }
        if (callback === void 0) { callback = "callback"; }
        var d = $.Deferred();
        {
            args[callback] = "define";
            var uri = url + "?" + Object.keys(args).map(function (k) { return k + "=" + args[k]; }).join('&');
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
            var uri = url + "?" + values_1.map(function (k) { return k.name + "=" + k.value; }).join('&');
            require([uri], function (data) { return d.resolve(data); });
        }
        return d;
    }
    exports.mapquest = mapquest;
});
define("ol3-lab/ux/mapquest-directions-proxy", ["require", "exports", "ol3-lab/labs/common/ajax"], function (require, exports, ajax) {
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
define("ol3-lab/ux/mapquest-optimized-route-proxy", ["require", "exports", "ol3-lab/labs/common/ajax"], function (require, exports, ajax) {
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
define("ol3-lab/ux/mapquest-traffic-proxy", ["require", "exports", "ol3-lab/labs/common/ajax"], function (require, exports, ajax) {
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
define("ol3-lab/ux/mapquest-geocoding-proxy", ["require", "exports", "ol3-lab/labs/common/ajax", "jquery"], function (require, exports, ajax, $) {
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
define("ol3-lab/labs/common/google-polyline", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/mapquest-search-proxy", ["require", "exports", "ol3-lab/labs/common/ajax", "jquery", "ol3-lab/labs/common/google-polyline"], function (require, exports, ajax, $, G) {
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
define("ol3-lab/ux/osrm-proxy", ["require", "exports", "ol3-lab/labs/common/ajax", "jquery", "ol3-lab/labs/common/google-polyline"], function (require, exports, ajax, $, Encoder) {
    "use strict";
    var Osrm = (function () {
        function Osrm(url) {
            if (url === void 0) { url = "http://router.project-osrm.org"; }
            this.url = url;
        }
        Osrm.prototype.viaroute = function (data) {
            var req = $.extend({}, data);
            req.loc = data.loc.map(function (l) { return l[0] + "," + l[1]; }).join("&loc=");
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
                loc: loc.map(function (l) { return l[0] + "," + l[1]; }).join("&loc=")
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
define("ol3-lab", ["require", "exports", "openlayers", "ol3-lab/ux/mapquest-directions-proxy", "ol3-lab/ux/mapquest-optimized-route-proxy", "jquery", "resize-sensor"], function (require, exports, ol, Directions, Route, $, ResizeSensor) {
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
            "100 S Main St 101, Greenville, SC 29601"
        ];
        var l2 = [
            "34.845546,-82.401672",
            "34.845547,-82.401674"
        ];
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
define("ol3-lab/labs/common/common", ["require", "exports"], function (require, exports) {
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
    function defaults(a, b) {
        Object.keys(b).filter(function (k) { return a[k] == undefined; }).forEach(function (k) { return a[k] = b[k]; });
        return a;
    }
    exports.defaults = defaults;
    function cssin(name, css) {
        var id = "style-" + name;
        var styleTag = document.getElementById(id);
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = id;
            styleTag.innerText = css;
            document.head.appendChild(styleTag);
        }
        var dataset = styleTag.dataset;
        dataset["count"] = parseInt(dataset["count"] || "0") + 1 + "";
        return function () {
            dataset["count"] = parseInt(dataset["count"] || "0") - 1 + "";
            if (dataset["count"] === "0") {
                styleTag.remove();
            }
        };
    }
    exports.cssin = cssin;
});
define("bower_components/ol3-symbolizer/ol3-symbolizer/format/base", ["require", "exports"], function (require, exports) {
    "use strict";
});
define("bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    function doif(v, cb) {
        if (v !== undefined && v !== null)
            cb(v);
    }
    function mixin(a, b) {
        Object.keys(b).forEach(function (k) { return a[k] = b[k]; });
        return a;
    }
    var StyleConverter = (function () {
        function StyleConverter() {
        }
        StyleConverter.prototype.fromJson = function (json) {
            return this.deserializeStyle(json);
        };
        StyleConverter.prototype.toJson = function (style) {
            return this.serializeStyle(style);
        };
        StyleConverter.prototype.setGeometry = function (feature) {
            var geom = feature.getGeometry();
            if (geom instanceof ol.geom.Polygon) {
                geom = geom.getInteriorPoint();
            }
            return geom;
        };
        StyleConverter.prototype.assign = function (obj, prop, value) {
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
        StyleConverter.prototype.serializeStyle = function (style) {
            var _this = this;
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
            if (style.getOrigin)
                this.assign(s, "origin", style.getOrigin());
            if (style.getScale)
                this.assign(s, "scale", style.getScale());
            if (style.getSize)
                this.assign(s, "size", style.getSize());
            if (style.getAnchor) {
                this.assign(s, "anchor", style.getAnchor());
                "anchorXUnits,anchorYUnits,anchorOrigin".split(",").forEach(function (k) {
                    _this.assign(s, k, style[k + "_"]);
                });
            }
            if (style.path) {
                if (style.path)
                    this.assign(s, "path", style.path);
                if (style.getImageSize)
                    this.assign(s, "imgSize", style.getImageSize());
                if (style.stroke)
                    this.assign(s, "stroke", style.stroke);
                if (style.fill)
                    this.assign(s, "fill", style.fill);
                if (style.scale)
                    this.assign(s, "scale", style.scale);
                if (style.imgSize)
                    this.assign(s, "imgSize", style.imgSize);
            }
            if (style.getSrc)
                this.assign(s, "src", style.getSrc());
            if (s.points && s.radius !== s.radius2)
                s.points /= 2;
            return s;
        };
        StyleConverter.prototype.serializeColor = function (color) {
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
        StyleConverter.prototype.serializeFill = function (fill) {
            return this.serializeStyle(fill);
        };
        StyleConverter.prototype.deserializeStyle = function (json) {
            var _this = this;
            var image;
            var text;
            var fill;
            var stroke;
            if (json.circle)
                image = this.deserializeCircle(json.circle);
            else if (json.star)
                image = this.deserializeStar(json.star);
            else if (json.icon)
                image = this.deserializeIcon(json.icon);
            else if (json.svg)
                image = this.deserializeSvg(json.svg);
            else if (json.image && (json.image.img || json.image.path))
                image = this.deserializeSvg(json.image);
            else if (json.image && json.image.src)
                image = this.deserializeIcon(json.image);
            else if (json.image)
                throw "unknown image type";
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
            image && s.setGeometry(function (feature) { return _this.setGeometry(feature); });
            return s;
        };
        StyleConverter.prototype.deserializeText = function (json) {
            json.rotation = json.rotation || 0;
            json.scale = json.scale || 1;
            var _a = [json["offset-x"] || 0, json["offset-y"] || 0], x = _a[0], y = _a[1];
            {
                var p = new ol.geom.Point([x, y]);
                p.rotate(json.rotation, [0, 0]);
                p.scale(json.scale, json.scale);
                _b = p.getCoordinates(), x = _b[0], y = _b[1];
            }
            return new ol.style.Text({
                fill: json.fill && this.deserializeFill(json.fill),
                stroke: json.stroke && this.deserializeStroke(json.stroke),
                text: json.text,
                font: json.font,
                offsetX: x,
                offsetY: y,
                rotation: json.rotation,
                scale: json.scale
            });
            var _b;
        };
        StyleConverter.prototype.deserializeCircle = function (json) {
            var image = new ol.style.Circle({
                radius: json.radius,
                fill: json.fill && this.deserializeFill(json.fill),
                stroke: json.stroke && this.deserializeStroke(json.stroke)
            });
            image.setOpacity(json.opacity);
            return image;
        };
        StyleConverter.prototype.deserializeStar = function (json) {
            var image = new ol.style.RegularShape({
                radius: json.radius,
                radius2: json.radius2,
                points: json.points,
                angle: json.angle,
                fill: json.fill && this.deserializeFill(json.fill),
                stroke: json.stroke && this.deserializeStroke(json.stroke)
            });
            doif(json.rotation, function (v) { return image.setRotation(v); });
            doif(json.opacity, function (v) { return image.setOpacity(v); });
            return image;
        };
        StyleConverter.prototype.deserializeIcon = function (json) {
            if (!json.anchor) {
                json.anchor = [json["anchor-x"] || 0.5, json["anchor-y"] || 0.5];
            }
            var image = new ol.style.Icon({
                anchor: json.anchor || [0.5, 0.5],
                anchorOrigin: json.anchorOrigin || "top-left",
                anchorXUnits: json.anchorXUnits || "fraction",
                anchorYUnits: json.anchorYUnits || "fraction",
                img: undefined,
                imgSize: undefined,
                offset: json.offset,
                offsetOrigin: json.offsetOrigin,
                opacity: json.opacity,
                scale: json.scale,
                snapToPixel: json.snapToPixel,
                rotateWithView: json.rotateWithView,
                rotation: json.rotation,
                size: json.size,
                src: json.src,
                color: json.color
            });
            image.load();
            return image;
        };
        StyleConverter.prototype.deserializeSvg = function (json) {
            json.rotation = json.rotation || 0;
            json.scale = json.scale || 1;
            if (json.img) {
                var symbol = document.getElementById(json.img);
                if (!symbol) {
                    throw "unable to find svg element: " + json.img;
                }
                if (symbol) {
                    var path = (symbol.getElementsByTagName("path")[0]);
                    if (path) {
                        if (symbol.viewBox) {
                            if (!json.imgSize) {
                                json.imgSize = [symbol.viewBox.baseVal.width, symbol.viewBox.baseVal.height];
                            }
                        }
                        json.path = (json.path || "") + path.getAttribute('d');
                    }
                }
            }
            var canvas = document.createElement("canvas");
            if (json.path) {
                {
                    _a = json.imgSize.map(function (v) { return v * json.scale; }), canvas.width = _a[0], canvas.height = _a[1];
                    if (json.stroke && json.stroke.width) {
                        var dx = 2 * json.stroke.width * json.scale;
                        canvas.width += dx;
                        canvas.height += dx;
                    }
                }
                var ctx = canvas.getContext('2d');
                var path2d = new Path2D(json.path);
                ctx.translate(canvas.width / 2, canvas.height / 2);
                ctx.scale(json.scale, json.scale);
                ctx.translate(-json.imgSize[0] / 2, -json.imgSize[1] / 2);
                if (json.fill) {
                    ctx.fillStyle = json.fill.color;
                    ctx.fill(path2d);
                }
                if (json.stroke) {
                    ctx.strokeStyle = json.stroke.color;
                    ctx.lineWidth = json.stroke.width;
                    ctx.stroke(path2d);
                }
            }
            var icon = new ol.style.Icon({
                img: canvas,
                imgSize: [canvas.width, canvas.height],
                rotation: json.rotation,
                scale: 1,
                anchor: json.anchor || [canvas.width / 2, canvas.height],
                anchorOrigin: json.anchorOrigin,
                anchorXUnits: json.anchorXUnits || "pixels",
                anchorYUnits: json.anchorYUnits || "pixels",
                offset: json.offset,
                offsetOrigin: json.offsetOrigin,
                opacity: json.opacity,
                snapToPixel: json.snapToPixel,
                rotateWithView: json.rotateWithView,
                size: [canvas.width, canvas.height],
                src: undefined
            });
            return mixin(icon, {
                path: json.path,
                stroke: json.stroke,
                fill: json.fill,
                scale: json.scale,
                imgSize: json.imgSize
            });
            var _a;
        };
        StyleConverter.prototype.deserializeFill = function (json) {
            var fill = new ol.style.Fill({
                color: json && this.deserializeColor(json)
            });
            return fill;
        };
        StyleConverter.prototype.deserializeStroke = function (json) {
            var stroke = new ol.style.Stroke();
            doif(json.color, function (v) { return stroke.setColor(v); });
            doif(json.lineCap, function (v) { return stroke.setLineCap(v); });
            doif(json.lineDash, function (v) { return stroke.setLineDash(v); });
            doif(json.lineJoin, function (v) { return stroke.setLineJoin(v); });
            doif(json.miterLimit, function (v) { return stroke.setMiterLimit(v); });
            doif(json.width, function (v) { return stroke.setWidth(v); });
            return stroke;
        };
        StyleConverter.prototype.deserializeColor = function (fill) {
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
                    stops.forEach(function (colorstop) {
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
        StyleConverter.prototype.deserializeLinearGradient = function (json) {
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
        StyleConverter.prototype.deserializeRadialGradient = function (json) {
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
        return StyleConverter;
    }());
    exports.StyleConverter = StyleConverter;
});
define("bower_components/ol3-symbolizer/ol3-symbolizer", ["require", "exports", "bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer"], function (require, exports, Symbolizer) {
    "use strict";
    return Symbolizer;
});
define("ol3-lab/ux/styles/star/flower", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "star": {
                "fill": {
                    "color": "rgba(106,9,251,0.7)"
                },
                "opacity": 1,
                "stroke": {
                    "color": "rgba(42,128,244,0.8)",
                    "width": 8
                },
                "radius": 14,
                "radius2": 9,
                "points": 10
            },
            "text": {
                "fill": {
                    "color": "rgba(255,255,255,1)"
                },
                "stroke": {
                    "color": "rgba(0,0,0,1)",
                    "width": 2
                },
                "text": "Test",
                "offset-x": 0,
                "offset-y": 20,
                "font": "18px fantasy"
            }
        }
    ];
});
define("bower_components/ol3-layerswitcher/ol3-layerswitcher/ol3-layerswitcher", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    function defaults(a) {
        var b = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            b[_i - 1] = arguments[_i];
        }
        b.forEach(function (b) {
            Object.keys(b).filter(function (k) { return a[k] === undefined; }).forEach(function (k) { return a[k] = b[k]; });
        });
        return a;
    }
    function asArray(list) {
        var result = new Array(list.length);
        for (var i = 0; i < list.length; i++) {
            result.push(list[i]);
        }
        return result;
    }
    function allLayers(lyr) {
        var result = [];
        lyr.getLayers().forEach(function (lyr, idx, a) {
            result.push(lyr);
            if ("getLayers" in lyr) {
                result = result.concat(allLayers(lyr));
            }
        });
        return result;
    }
    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
    var DEFAULT_OPTIONS = {
        tipLabel: 'Layers',
        openOnMouseOver: false,
        closeOnMouseOut: false,
        openOnClick: true,
        closeOnClick: true,
        className: 'layer-switcher',
        target: null
    };
    var LayerSwitcher = (function (_super) {
        __extends(LayerSwitcher, _super);
        function LayerSwitcher(options) {
            var _this = this;
            options = defaults(options || {}, DEFAULT_OPTIONS);
            _this = _super.call(this, options) || this;
            _this.afterCreate(options);
            return _this;
        }
        LayerSwitcher.prototype.afterCreate = function (options) {
            var _this = this;
            this.hiddenClassName = "ol-unselectable ol-control " + options.className;
            this.shownClassName = this.hiddenClassName + ' shown';
            var element = document.createElement('div');
            element.className = this.hiddenClassName;
            var button = this.button = document.createElement('button');
            button.setAttribute('title', options.tipLabel);
            element.appendChild(button);
            this.panel = document.createElement('div');
            this.panel.className = 'panel';
            element.appendChild(this.panel);
            this.unwatch = [];
            this.element = element;
            this.setTarget(options.target);
            if (options.openOnMouseOver) {
                element.addEventListener("mouseover", function () { return _this.showPanel(); });
            }
            if (options.closeOnMouseOut) {
                element.addEventListener("mouseout", function () { return _this.hidePanel(); });
            }
            if (options.openOnClick || options.closeOnClick) {
                button.addEventListener('click', function (e) {
                    _this.isVisible() ? options.closeOnClick && _this.hidePanel() : options.openOnClick && _this.showPanel();
                    e.preventDefault();
                });
            }
        };
        LayerSwitcher.prototype.dispatch = function (name, args) {
            var event = new Event(name);
            args && Object.keys(args).forEach(function (k) { return event[k] = args[k]; });
            this["dispatchEvent"](event);
        };
        LayerSwitcher.prototype.isVisible = function () {
            return this.element.className != this.hiddenClassName;
        };
        LayerSwitcher.prototype.showPanel = function () {
            if (this.element.className != this.shownClassName) {
                this.element.className = this.shownClassName;
                this.renderPanel();
            }
        };
        LayerSwitcher.prototype.hidePanel = function () {
            this.element.className = this.hiddenClassName;
            this.unwatch.forEach(function (f) { return f(); });
        };
        LayerSwitcher.prototype.renderPanel = function () {
            var _this = this;
            this.ensureTopVisibleBaseLayerShown();
            while (this.panel.firstChild) {
                this.panel.removeChild(this.panel.firstChild);
            }
            var ul = document.createElement('ul');
            this.panel.appendChild(ul);
            this.state = [];
            var map = this.getMap();
            var view = map.getView();
            this.renderLayers(map, ul);
            {
                var doit = function () {
                    var res = view.getResolution();
                    _this.state.filter(function (s) { return !!s.input; }).forEach(function (s) {
                        var min = s.layer.getMinResolution();
                        var max = s.layer.getMaxResolution();
                        console.log(res, min, max, s.layer.get("title"));
                        s.input.disabled = !(min <= res && (max === 0 || res < max));
                    });
                };
                var h_1 = view.on("change:resolution", doit);
                doit();
                this.unwatch.push(function () { return view.unByKey(h_1); });
            }
        };
        ;
        LayerSwitcher.prototype.ensureTopVisibleBaseLayerShown = function () {
            var visibleBaseLyrs = allLayers(this.getMap()).filter(function (l) { return l.get('type') === 'base' && l.getVisible(); });
            if (visibleBaseLyrs.length)
                this.setVisible(visibleBaseLyrs.shift(), true);
        };
        ;
        LayerSwitcher.prototype.setVisible = function (lyr, visible) {
            var _this = this;
            if (lyr.getVisible() !== visible) {
                if (visible && lyr.get('type') === 'base') {
                    allLayers(this.getMap()).filter(function (l) { return l !== lyr && l.get('type') === 'base' && l.getVisible(); }).forEach(function (l) { return _this.setVisible(l, false); });
                }
                lyr.setVisible(visible);
                this.dispatch(visible ? "show-layer" : "hide-layer", { layer: lyr });
            }
        };
        ;
        LayerSwitcher.prototype.renderLayer = function (lyr, container) {
            var _this = this;
            var result;
            var li = document.createElement('li');
            container.appendChild(li);
            var lyrTitle = lyr.get('title');
            var label = document.createElement('label');
            label.htmlFor = uuid();
            lyr.on('load:start', function () { return li.classList.add("loading"); });
            lyr.on('load:end', function () { return li.classList.remove("loading"); });
            li.classList.toggle("loading", true === lyr.get("loading"));
            if ('getLayers' in lyr && !lyr.get('combine')) {
                if (!lyr.get('label-only')) {
                    var input_1 = result = document.createElement('input');
                    input_1.id = label.htmlFor;
                    input_1.type = 'checkbox';
                    input_1.checked = lyr.getVisible();
                    input_1.addEventListener('change', function () {
                        ul_1.classList.toggle('hide-layer-group', !input_1.checked);
                        _this.setVisible(lyr, input_1.checked);
                        var childLayers = lyr.getLayers();
                        _this.state.filter(function (s) { return s.container === ul_1 && s.input && s.input.checked; }).forEach(function (state) {
                            _this.setVisible(state.layer, input_1.checked);
                        });
                    });
                    li.appendChild(input_1);
                }
                li.classList.add('group');
                label.innerHTML = lyrTitle;
                li.appendChild(label);
                var ul_1 = document.createElement('ul');
                result && ul_1.classList.toggle('hide-layer-group', !result.checked);
                li.appendChild(ul_1);
                this.renderLayers(lyr, ul_1);
            }
            else {
                li.classList.add('layer');
                var input_2 = result = document.createElement('input');
                input_2.id = label.htmlFor;
                if (lyr.get('type') === 'base') {
                    input_2.classList.add('basemap');
                    input_2.type = 'radio';
                    input_2.addEventListener("change", function () {
                        if (input_2.checked) {
                            asArray(_this.panel.getElementsByClassName("basemap")).filter(function (i) { return i.tagName === "INPUT"; }).forEach(function (i) {
                                if (i.checked && i !== input_2)
                                    i.checked = false;
                            });
                        }
                        _this.setVisible(lyr, input_2.checked);
                    });
                }
                else {
                    input_2.type = 'checkbox';
                    input_2.addEventListener("change", function () {
                        _this.setVisible(lyr, input_2.checked);
                    });
                }
                input_2.checked = lyr.get('visible');
                li.appendChild(input_2);
                label.innerHTML = lyrTitle;
                li.appendChild(label);
            }
            this.state.push({
                container: container,
                input: result,
                layer: lyr
            });
        };
        LayerSwitcher.prototype.renderLayers = function (map, elm) {
            var _this = this;
            var lyrs = map.getLayers().getArray().slice().reverse();
            return lyrs.filter(function (l) { return !!l.get('title'); }).forEach(function (l) { return _this.renderLayer(l, elm); });
        };
        return LayerSwitcher;
    }(ol.control.Control));
    exports.LayerSwitcher = LayerSwitcher;
});
define("bower_components/ol3-layerswitcher/ol3-layerswitcher", ["require", "exports", "bower_components/ol3-layerswitcher/ol3-layerswitcher/ol3-layerswitcher"], function (require, exports, LayerSwitcher) {
    "use strict";
    return LayerSwitcher;
});
define("bower_components/ol3-popup/ol3-popup/paging/paging", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    function getInteriorPoint(geom) {
        if (geom["getInteriorPoint"])
            return geom["getInteriorPoint"]().getCoordinates();
        return ol.extent.getCenter(geom.getExtent());
    }
    var classNames = {
        pages: "pages",
        page: "page"
    };
    var eventNames = {
        add: "add",
        clear: "clear",
        goto: "goto"
    };
    var Paging = (function () {
        function Paging(options) {
            this.options = options;
            this._pages = [];
            this.domNode = document.createElement("div");
            this.domNode.classList.add(classNames.pages);
            options.popup.domNode.appendChild(this.domNode);
        }
        Object.defineProperty(Paging.prototype, "activePage", {
            get: function () {
                return this._pages[this._activeIndex];
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paging.prototype, "activeIndex", {
            get: function () {
                return this._activeIndex;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Paging.prototype, "count", {
            get: function () {
                return this._pages.length;
            },
            enumerable: true,
            configurable: true
        });
        Paging.prototype.dispatch = function (name) {
            this.domNode.dispatchEvent(new Event(name));
        };
        Paging.prototype.on = function (name, listener) {
            this.domNode.addEventListener(name, listener);
        };
        Paging.prototype.add = function (source, geom) {
            if (false) {
            }
            else if (typeof source === "string") {
                var page = document.createElement("div");
                page.innerHTML = source;
                this._pages.push({
                    element: page,
                    location: geom
                });
            }
            else if (source["appendChild"]) {
                var page = source;
                page.classList.add(classNames.page);
                this._pages.push({
                    element: page,
                    location: geom
                });
            }
            else if (source["then"]) {
                var d = source;
                var page_1 = document.createElement("div");
                page_1.classList.add(classNames.page);
                this._pages.push({
                    element: page_1,
                    location: geom
                });
                $.when(d).then(function (v) {
                    if (typeof v === "string") {
                        page_1.innerHTML = v;
                    }
                    else {
                        page_1.appendChild(v);
                    }
                });
            }
            else if (typeof source === "function") {
                var page = document.createElement("div");
                page.classList.add("page");
                this._pages.push({
                    callback: source,
                    element: page,
                    location: geom
                });
            }
            else {
                throw "invalid source value: " + source;
            }
            this.dispatch(eventNames.add);
        };
        Paging.prototype.clear = function () {
            var activeChild = this._activeIndex >= 0 && this._pages[this._activeIndex];
            this._activeIndex = -1;
            this._pages = [];
            if (activeChild) {
                this.domNode.removeChild(activeChild.element);
                this.dispatch(eventNames.clear);
            }
        };
        Paging.prototype.goto = function (index) {
            var _this = this;
            var page = this._pages[index];
            if (!page)
                return;
            var activeChild = this._activeIndex >= 0 && this._pages[this._activeIndex];
            var d = $.Deferred();
            if (page.callback) {
                var refreshedContent = page.callback();
                $.when(refreshedContent).then(function (v) {
                    if (false) {
                    }
                    else if (typeof v === "string") {
                        page.element.innerHTML = v;
                    }
                    else if (typeof v["innerHTML"] !== "undefined") {
                        page.element.innerHTML = "";
                        page.element.appendChild(v);
                    }
                    else {
                        throw "invalid callback result: " + v;
                    }
                    d.resolve();
                });
            }
            else {
                d.resolve();
            }
            d.then(function () {
                activeChild && activeChild.element.remove();
                _this._activeIndex = index;
                _this.domNode.appendChild(page.element);
                if (page.location) {
                    _this.options.popup.setPosition(getInteriorPoint(page.location));
                }
                _this.dispatch(eventNames.goto);
            });
        };
        Paging.prototype.next = function () {
            (0 <= this.activeIndex) && (this.activeIndex < this.count) && this.goto(this.activeIndex + 1);
        };
        Paging.prototype.prev = function () {
            (0 < this.activeIndex) && this.goto(this.activeIndex - 1);
        };
        return Paging;
    }());
    exports.Paging = Paging;
});
define("bower_components/ol3-popup/ol3-popup/paging/page-navigator", ["require", "exports"], function (require, exports) {
    "use strict";
    var classNames = {
        prev: 'btn-prev',
        next: 'btn-next',
        hidden: 'hidden',
        active: 'active',
        inactive: 'inactive',
        pagenum: "page-num"
    };
    var eventNames = {
        show: "show",
        hide: "hide",
        prev: "prev",
        next: "next"
    };
    var PageNavigator = (function () {
        function PageNavigator(options) {
            var _this = this;
            this.options = options;
            var pages = options.pages;
            this.domNode = document.createElement("div");
            this.domNode.classList.add("pagination");
            this.domNode.innerHTML = this.template();
            this.prevButton = this.domNode.getElementsByClassName(classNames.prev)[0];
            this.nextButton = this.domNode.getElementsByClassName(classNames.next)[0];
            this.pageInfo = this.domNode.getElementsByClassName(classNames.pagenum)[0];
            pages.options.popup.domNode.appendChild(this.domNode);
            this.prevButton.addEventListener('click', function () { return _this.dispatch(eventNames.prev); });
            this.nextButton.addEventListener('click', function () { return _this.dispatch(eventNames.next); });
            pages.on("goto", function () { return pages.count > 1 ? _this.show() : _this.hide(); });
            pages.on("clear", function () { return _this.hide(); });
            pages.on("goto", function () {
                var index = pages.activeIndex;
                var count = pages.count;
                var canPrev = 0 < index;
                var canNext = count - 1 > index;
                _this.prevButton.classList.toggle(classNames.inactive, !canPrev);
                _this.prevButton.classList.toggle(classNames.active, canPrev);
                _this.nextButton.classList.toggle(classNames.inactive, !canNext);
                _this.nextButton.classList.toggle(classNames.active, canNext);
                _this.prevButton.disabled = !canPrev;
                _this.nextButton.disabled = !canNext;
                _this.pageInfo.innerHTML = 1 + index + " of " + count;
            });
        }
        PageNavigator.prototype.dispatch = function (name) {
            this.domNode.dispatchEvent(new Event(name));
        };
        PageNavigator.prototype.on = function (name, listener) {
            this.domNode.addEventListener(name, listener);
        };
        PageNavigator.prototype.template = function () {
            return "<button class=\"arrow btn-prev\"></button><span class=\"page-num\">m of n</span><button class=\"arrow btn-next\"></button>";
        };
        PageNavigator.prototype.hide = function () {
            this.domNode.classList.add(classNames.hidden);
            this.dispatch(eventNames.hide);
        };
        PageNavigator.prototype.show = function () {
            this.domNode.classList.remove(classNames.hidden);
            this.dispatch(eventNames.show);
        };
        return PageNavigator;
    }());
    return PageNavigator;
});
define("bower_components/ol3-popup/ol3-popup/ol3-popup", ["require", "exports", "jquery", "openlayers", "bower_components/ol3-popup/ol3-popup/paging/paging", "bower_components/ol3-popup/ol3-popup/paging/page-navigator"], function (require, exports, $, ol, paging_1, PageNavigator) {
    "use strict";
    var css = "\n.ol-popup {\n    position: absolute;\n    bottom: 12px;\n    left: -50px;\n}\n\n.ol-popup:after {\n    top: auto;\n    bottom: -20px;\n    left: 50px;\n    border: solid transparent;\n    border-top-color: inherit;\n    content: \" \";\n    height: 0;\n    width: 0;\n    position: absolute;\n    pointer-events: none;\n    border-width: 10px;\n    margin-left: -10px;\n}\n\n.ol-popup.docked {\n    position:absolute;\n    bottom:0;\n    top:0;\n    left:0;\n    right:0;\n    width:auto;\n    height:auto;\n    pointer-events: all;\n}\n\n.ol-popup.docked:after {\n    display:none;\n}\n\n.ol-popup.docked .pages {\n    max-height: inherit;\n    overflow: auto;\n    height: calc(100% - 60px);\n}\n\n.ol-popup.docked .pagination {\n    position: absolute;\n    bottom: 0;\n}\n\n.ol-popup .pagination .btn-prev::after {\n    content: \"\u21E6\"; \n}\n\n.ol-popup .pagination .btn-next::after {\n    content: \"\u21E8\"; \n}\n\n.ol-popup .pagination.hidden {\n    display: none;\n}\n\n.ol-popup .ol-popup-closer {\n    border: none;\n    background: transparent;\n    color: inherit;\n    position: absolute;\n    top: 0;\n    right: 0;\n    text-decoration: none;\n}\n    \n.ol-popup .ol-popup-closer:after {\n    content:'\u2716';\n}\n\n.ol-popup .ol-popup-docker {\n    border: none;\n    background: transparent;\n    color: inherit;\n    text-decoration: none;\n    position: absolute;\n    top: 0;\n    right: 20px;\n}\n\n.ol-popup .ol-popup-docker:after {\n    content:'\u25A1';\n}\n";
    var classNames = {
        olPopup: 'ol-popup',
        olPopupDocker: 'ol-popup-docker',
        olPopupCloser: 'ol-popup-closer',
        olPopupContent: 'ol-popup-content',
        hidden: 'hidden',
        docked: 'docked'
    };
    var eventNames = {
        show: "show",
        hide: "hide"
    };
    function defaults(a) {
        var b = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            b[_i - 1] = arguments[_i];
        }
        b.forEach(function (b) {
            Object.keys(b).filter(function (k) { return a[k] === undefined; }).forEach(function (k) { return a[k] = b[k]; });
        });
        return a;
    }
    function debounce(func, wait, immediate) {
        var _this = this;
        if (wait === void 0) { wait = 20; }
        if (immediate === void 0) { immediate = false; }
        var timeout;
        return (function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            var later = function () {
                timeout = null;
                if (!immediate)
                    func.call(_this, args);
            };
            var callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
                func.call(_this, args);
        });
    }
    var isTouchDevice = function () {
        try {
            document.createEvent("TouchEvent");
            isTouchDevice = function () { return true; };
        }
        catch (e) {
            isTouchDevice = function () { return false; };
        }
        return isTouchDevice();
    };
    function enableTouchScroll(elm) {
        var scrollStartPos = 0;
        elm.addEventListener("touchstart", function (event) {
            scrollStartPos = this.scrollTop + event.touches[0].pageY;
        }, false);
        elm.addEventListener("touchmove", function (event) {
            this.scrollTop = scrollStartPos - event.touches[0].pageY;
        }, false);
    }
    ;
    var DEFAULT_OPTIONS = {
        insertFirst: true,
        autoPan: true,
        autoPanAnimation: {
            source: null,
            duration: 250
        },
        pointerPosition: 50,
        xOffset: 0,
        yOffset: 0,
        positioning: "top-right",
        stopEvent: true
    };
    var Popup = (function (_super) {
        __extends(Popup, _super);
        function Popup(options) {
            if (options === void 0) { options = DEFAULT_OPTIONS; }
            var _this = this;
            options = defaults({}, options, DEFAULT_OPTIONS);
            _this = _super.call(this, options) || this;
            _this.options = options;
            _this.handlers = [];
            _this.postCreate();
            return _this;
        }
        Popup.prototype.postCreate = function () {
            var _this = this;
            this.injectCss(css);
            var options = this.options;
            options.css && this.injectCss(options.css);
            var domNode = this.domNode = document.createElement('div');
            domNode.className = classNames.olPopup;
            this.setElement(domNode);
            if (typeof this.options.pointerPosition === "number") {
                this.setIndicatorPosition(this.options.pointerPosition);
            }
            if (this.options.dockContainer) {
                var dockContainer = $(this.options.dockContainer)[0];
                if (dockContainer) {
                    var docker = this.docker = document.createElement('label');
                    docker.className = classNames.olPopupDocker;
                    domNode.appendChild(docker);
                    docker.addEventListener('click', function (evt) {
                        _this.isDocked() ? _this.undock() : _this.dock();
                        evt.preventDefault();
                    }, false);
                }
            }
            {
                var closer = this.closer = document.createElement('label');
                closer.className = classNames.olPopupCloser;
                domNode.appendChild(closer);
                closer.addEventListener('click', function (evt) {
                    _this.hide();
                    evt.preventDefault();
                }, false);
            }
            {
                var content = this.content = document.createElement('div');
                content.className = classNames.olPopupContent;
                this.domNode.appendChild(content);
                isTouchDevice() && enableTouchScroll(content);
            }
            {
                var pages_1 = this.pages = new paging_1.Paging({ popup: this });
                var pageNavigator = new PageNavigator({ pages: pages_1 });
                pageNavigator.hide();
                pageNavigator.on("prev", function () { return pages_1.prev(); });
                pageNavigator.on("next", function () { return pages_1.next(); });
                pages_1.on("goto", function () { return _this.panIntoView(); });
            }
            if (0) {
                var callback_1 = this.setPosition;
                this.setPosition = debounce(function (args) { return callback_1.apply(_this, args); }, 50);
            }
        };
        Popup.prototype.injectCss = function (css) {
            var style = $("<style type='text/css'>" + css + "</style>");
            style.appendTo('head');
            this.handlers.push(function () { return style.remove(); });
        };
        Popup.prototype.setIndicatorPosition = function (offset) {
            var _this = this;
            var _a = this.getPositioning().split("-", 2), verticalPosition = _a[0], horizontalPosition = _a[1];
            var css = [];
            switch (verticalPosition) {
                case "bottom":
                    css.push(".ol-popup { top: " + (10 + this.options.yOffset) + "px; bottom: auto; }");
                    css.push(".ol-popup:after {  top: -20px; bottom: auto; transform: rotate(180deg);}");
                    break;
                case "center":
                    break;
                case "top":
                    css.push(".ol-popup { top: auto; bottom: " + (10 + this.options.yOffset) + "px; }");
                    css.push(".ol-popup:after {  top: auto; bottom: -20px; transform: rotate(0deg);}");
                    break;
            }
            switch (horizontalPosition) {
                case "center":
                    break;
                case "left":
                    css.push(".ol-popup { left: auto; right: " + (this.options.xOffset - offset - 10) + "px; }");
                    css.push(".ol-popup:after { left: auto; right: " + offset + "px; }");
                    break;
                case "right":
                    css.push(".ol-popup { left: " + (this.options.xOffset - offset - 10) + "px; right: auto; }");
                    css.push(".ol-popup:after { left: " + (10 + offset) + "px; right: auto; }");
                    break;
            }
            css.forEach(function (css) { return _this.injectCss(css); });
        };
        Popup.prototype.setPosition = function (position) {
            this.options.position = position;
            if (!this.isDocked()) {
                _super.prototype.setPosition.call(this, position);
            }
            else {
                var view = this.options.map.getView();
                view.animate({
                    center: position
                });
            }
        };
        Popup.prototype.panIntoView = function () {
            if (!this.isOpened())
                return;
            if (this.isDocked())
                return;
            var p = this.getPosition();
            p && this.setPosition(p.map(function (v) { return v; }));
        };
        Popup.prototype.destroy = function () {
            this.handlers.forEach(function (h) { return h(); });
            this.handlers = [];
            this.getMap().removeOverlay(this);
            this.dispose();
            this.dispatch("dispose");
        };
        Popup.prototype.dispatch = function (name) {
            this["dispatchEvent"](new Event(name));
        };
        Popup.prototype.show = function (coord, html) {
            if (html instanceof HTMLElement) {
                this.content.innerHTML = "";
                this.content.appendChild(html);
            }
            else {
                this.content.innerHTML = html;
            }
            this.domNode.classList.remove(classNames.hidden);
            this.setPosition(coord);
            this.dispatch(eventNames.show);
            return this;
        };
        Popup.prototype.hide = function () {
            this.isDocked() && this.undock();
            this.setPosition(undefined);
            this.pages.clear();
            this.dispatch(eventNames.hide);
            this.domNode.classList.add(classNames.hidden);
            return this;
        };
        Popup.prototype.isOpened = function () {
            return !this.domNode.classList.contains(classNames.hidden);
        };
        Popup.prototype.isDocked = function () {
            return this.domNode.classList.contains(classNames.docked);
        };
        Popup.prototype.dock = function () {
            var map = this.getMap();
            this.options.map = map;
            this.options.parentNode = this.domNode.parentElement;
            map.removeOverlay(this);
            this.domNode.classList.add(classNames.docked);
            $(this.options.dockContainer).append(this.domNode);
        };
        Popup.prototype.undock = function () {
            this.options.parentNode.appendChild(this.domNode);
            this.domNode.classList.remove(classNames.docked);
            this.options.map.addOverlay(this);
            this.setPosition(this.options.position);
        };
        Popup.prototype.applyOffset = function (_a) {
            var x = _a[0], y = _a[1];
            switch (this.getPositioning()) {
                case "bottom-left":
                    this.setOffset([x, -y]);
                    break;
                case "bottom-right":
                    this.setOffset([-x, -y]);
                    break;
                case "top-left":
                    this.setOffset([x, y]);
                    break;
                case "top-right":
                    this.setOffset([-x, y]);
                    break;
            }
        };
        return Popup;
    }(ol.Overlay));
    exports.Popup = Popup;
});
define("bower_components/ol3-popup/ol3-popup", ["require", "exports", "bower_components/ol3-popup/ol3-popup/ol3-popup"], function (require, exports, Popup) {
    "use strict";
    return Popup;
});
define("bower_components/ol3-symbolizer/ol3-symbolizer/common/ajax", ["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    var Ajax = (function () {
        function Ajax(url) {
            this.url = url;
            this.options = {
                use_json: true,
                use_cors: true
            };
        }
        Ajax.prototype.jsonp = function (args, url) {
            if (url === void 0) { url = this.url; }
            var d = $.Deferred();
            args["callback"] = "define";
            var uri = url + "?" + Object.keys(args).map(function (k) { return k + "=" + args[k]; }).join('&');
            require([uri], function (data) { return d.resolve(data); });
            return d;
        };
        Ajax.prototype.ajax = function (method, args, url) {
            if (url === void 0) { url = this.url; }
            var isData = method === "POST" || method === "PUT";
            var isJson = this.options.use_json;
            var isCors = this.options.use_cors;
            var d = $.Deferred();
            var client = new XMLHttpRequest();
            if (isCors)
                client.withCredentials = true;
            var uri = url;
            var data = null;
            if (args) {
                if (isData) {
                    data = JSON.stringify(args);
                }
                else {
                    uri += '?';
                    var argcount = 0;
                    for (var key in args) {
                        if (args.hasOwnProperty(key)) {
                            if (argcount++) {
                                uri += '&';
                            }
                            uri += encodeURIComponent(key) + '=' + encodeURIComponent(args[key]);
                        }
                    }
                }
            }
            client.open(method, uri, true);
            if (isData && isJson)
                client.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
            client.send(data);
            client.onload = function () {
                console.log("content-type", client.getResponseHeader("Content-Type"));
                if (client.status >= 200 && client.status < 300) {
                    isJson = isJson || 0 === client.getResponseHeader("Content-Type").indexOf("application/json");
                    d.resolve(isJson ? JSON.parse(client.response) : client.response);
                }
                else {
                    d.reject(client.statusText);
                }
            };
            client.onerror = function () { return d.reject(client.statusText); };
            return d;
        };
        Ajax.prototype.get = function (args) {
            return this.ajax('GET', args);
        };
        Ajax.prototype.post = function (args) {
            return this.ajax('POST', args);
        };
        Ajax.prototype.put = function (args) {
            return this.ajax('PUT', args);
        };
        Ajax.prototype["delete"] = function (args) {
            return this.ajax('DELETE', args);
        };
        return Ajax;
    }());
    return Ajax;
});
define("bower_components/ol3-symbolizer/ol3-symbolizer/ags/ags-catalog", ["require", "exports", "bower_components/ol3-symbolizer/ol3-symbolizer/common/ajax"], function (require, exports, Ajax) {
    "use strict";
    function defaults(a) {
        var b = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            b[_i - 1] = arguments[_i];
        }
        b.filter(function (b) { return !!b; }).forEach(function (b) {
            Object.keys(b).filter(function (k) { return a[k] === undefined; }).forEach(function (k) { return a[k] = b[k]; });
        });
        return a;
    }
    var Catalog = (function () {
        function Catalog(url) {
            this.ajax = new Ajax(url);
        }
        Catalog.prototype.about = function (data) {
            var req = defaults({
                f: "pjson"
            }, data);
            return this.ajax.jsonp(req);
        };
        Catalog.prototype.aboutFolder = function (folder) {
            var ajax = new Ajax(this.ajax.url + "/" + folder);
            var req = {
                f: "pjson"
            };
            return ajax.jsonp(req);
        };
        Catalog.prototype.aboutFeatureServer = function (name) {
            var ajax = new Ajax(this.ajax.url + "/" + name + "/FeatureServer");
            var req = {
                f: "pjson"
            };
            return defaults(ajax.jsonp(req), { url: ajax.url });
        };
        Catalog.prototype.aboutMapServer = function (name) {
            var ajax = new Ajax(this.ajax.url + "/" + name + "/MapServer");
            var req = {
                f: "pjson"
            };
            return defaults(ajax.jsonp(req), { url: ajax.url });
        };
        Catalog.prototype.aboutLayer = function (layer) {
            var ajax = new Ajax(this.ajax.url + "/" + layer);
            var req = {
                f: "pjson"
            };
            return ajax.jsonp(req);
        };
        return Catalog;
    }());
    exports.Catalog = Catalog;
});
define("bower_components/ol3-symbolizer/ol3-symbolizer/format/ags-symbolizer", ["require", "exports", "jquery", "bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer"], function (require, exports, $, Symbolizer) {
    "use strict";
    var symbolizer = new Symbolizer.StyleConverter();
    var styleMap = {
        "esriSMSCircle": "circle",
        "esriSMSDiamond": "diamond",
        "esriSMSX": "x",
        "esriSMSCross": "cross",
        "esriSLSSolid": "solid",
        "esriSFSSolid": "solid",
        "esriSLSDot": "dot",
        "esriSLSDash": "dash",
        "esriSLSDashDot": "dashdot",
        "esriSLSDashDotDot": "dashdotdot",
        "esriSFSForwardDiagonal": "forward-diagonal"
    };
    var typeMap = {
        "esriSMS": "sms",
        "esriSLS": "sls",
        "esriSFS": "sfs",
        "esriPMS": "pms",
        "esriPFS": "pfs",
        "esriTS": "txt"
    };
    function range(a, b) {
        var result = new Array(b - a + 1);
        while (a <= b)
            result.push(a++);
        return result;
    }
    function clone(o) {
        return JSON.parse(JSON.stringify(o));
    }
    var StyleConverter = (function () {
        function StyleConverter() {
        }
        StyleConverter.prototype.asWidth = function (v) {
            return v * 4 / 3;
        };
        StyleConverter.prototype.asColor = function (color) {
            if (color.length === 4)
                return "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + color[3] / 255 + ")";
            if (color.length === 3)
                return "rgb(" + color[0] + "," + color[1] + "," + color[2] + "})";
            return "#" + color.map(function (v) { return ("0" + v.toString(16)).substr(0, 2); }).join("");
        };
        StyleConverter.prototype.fromSFSSolid = function (symbol, style) {
            style.fill = {
                color: this.asColor(symbol.color)
            };
            this.fromSLS(symbol.outline, style);
        };
        StyleConverter.prototype.fromSFS = function (symbol, style) {
            switch (symbol.style) {
                case "esriSFSSolid":
                    this.fromSFSSolid(symbol, style);
                    break;
                case "esriSFSForwardDiagonal":
                    this.fromSFSSolid(symbol, style);
                    break;
                default:
                    throw "invalid-style: " + symbol.style;
            }
        };
        StyleConverter.prototype.fromSMSCircle = function (symbol, style) {
            style.circle = {
                opacity: 1,
                radius: this.asWidth(symbol.size / 2),
                stroke: {
                    color: this.asColor(symbol.outline.color)
                },
                snapToPixel: true
            };
            this.fromSFSSolid(symbol, style.circle);
            this.fromSLS(symbol.outline, style.circle);
        };
        StyleConverter.prototype.fromSMSCross = function (symbol, style) {
            style.star = {
                points: 4,
                angle: 0,
                radius: this.asWidth(symbol.size / Math.sqrt(2)),
                radius2: 0
            };
            this.fromSFSSolid(symbol, style.star);
            this.fromSLS(symbol.outline, style.star);
        };
        StyleConverter.prototype.fromSMSDiamond = function (symbol, style) {
            style.star = {
                points: 4,
                angle: 0,
                radius: this.asWidth(symbol.size / Math.sqrt(2)),
                radius2: this.asWidth(symbol.size / Math.sqrt(2))
            };
            this.fromSFSSolid(symbol, style.star);
            this.fromSLS(symbol.outline, style.star);
        };
        StyleConverter.prototype.fromSMSPath = function (symbol, style) {
            var size = 2 * this.asWidth(symbol.size);
            style.svg = {
                imgSize: [size, size],
                path: symbol.path,
                rotation: symbol.angle
            };
            this.fromSLSSolid(symbol, style.svg);
            this.fromSLS(symbol.outline, style.svg);
        };
        StyleConverter.prototype.fromSMSSquare = function (symbol, style) {
            style.star = {
                points: 4,
                angle: Math.PI / 4,
                radius: this.asWidth(symbol.size / Math.sqrt(2)),
                radius2: this.asWidth(symbol.size / Math.sqrt(2))
            };
            this.fromSFSSolid(symbol, style.star);
            this.fromSLS(symbol.outline, style.star);
        };
        StyleConverter.prototype.fromSMSX = function (symbol, style) {
            style.star = {
                points: 4,
                angle: Math.PI / 4,
                radius: this.asWidth(symbol.size / Math.sqrt(2)),
                radius2: 0
            };
            this.fromSFSSolid(symbol, style.star);
            this.fromSLS(symbol.outline, style.star);
        };
        StyleConverter.prototype.fromSMS = function (symbol, style) {
            switch (symbol.style) {
                case "esriSMSCircle":
                    this.fromSMSCircle(symbol, style);
                    break;
                case "esriSMSCross":
                    this.fromSMSCross(symbol, style);
                    break;
                case "esriSMSDiamond":
                    this.fromSMSDiamond(symbol, style);
                    break;
                case "esriSMSPath":
                    this.fromSMSPath(symbol, style);
                    break;
                case "esriSMSSquare":
                    this.fromSMSSquare(symbol, style);
                    break;
                case "esriSMSX":
                    this.fromSMSX(symbol, style);
                    break;
                default:
                    throw "invalid-style: " + symbol.style;
            }
        };
        StyleConverter.prototype.fromPMS = function (symbol, style) {
            style.image = {};
            style.image.src = symbol.url;
            if (symbol.imageData) {
                style.image.src = "data:image/png;base64," + symbol.imageData;
            }
            style.image["anchor-x"] = this.asWidth(symbol.xoffset);
            style.image["anchor-y"] = this.asWidth(symbol.yoffset);
            style.image.imgSize = [this.asWidth(symbol.width), this.asWidth(symbol.height)];
        };
        StyleConverter.prototype.fromSLSSolid = function (symbol, style) {
            style.stroke = {
                color: this.asColor(symbol.color),
                width: this.asWidth(symbol.width),
                lineDash: [],
                lineJoin: "",
                miterLimit: 4
            };
        };
        StyleConverter.prototype.fromSLS = function (symbol, style) {
            switch (symbol.style) {
                case "esriSLSSolid":
                    this.fromSLSSolid(symbol, style);
                    break;
                case "esriSLSDot":
                    this.fromSLSSolid(symbol, style);
                    break;
                case "esriSLSDash":
                    this.fromSLSSolid(symbol, style);
                    break;
                case "esriSLSDashDot":
                    this.fromSLSSolid(symbol, style);
                    break;
                case "esriSLSDashDotDot":
                    this.fromSLSSolid(symbol, style);
                    break;
                default:
                    this.fromSLSSolid(symbol, style);
                    console.warn("invalid-style: " + symbol.style);
                    break;
            }
        };
        StyleConverter.prototype.fromPFS = function (symbol, style) {
            throw "not-implemented";
        };
        StyleConverter.prototype.fromTS = function (symbol, style) {
            throw "not-implemented";
        };
        StyleConverter.prototype.fromJson = function (symbol) {
            var style = {};
            this.fromSymbol(symbol, style);
            return symbolizer.fromJson(style);
        };
        StyleConverter.prototype.fromSymbol = function (symbol, style) {
            switch (symbol.type) {
                case "esriSFS":
                    this.fromSFS(symbol, style);
                    break;
                case "esriSLS":
                    this.fromSLS(symbol, style);
                    break;
                case "esriPMS":
                    this.fromPMS(symbol, style);
                    break;
                case "esriPFS":
                    this.fromPFS(symbol, style);
                    break;
                case "esriSMS":
                    this.fromSMS(symbol, style);
                    break;
                case "esriTS":
                    this.fromTS(symbol, style);
                    break;
                default:
                    throw "invalid-symbol-type: " + symbol.type;
            }
        };
        StyleConverter.prototype.fromRenderer = function (renderer, args) {
            var _this = this;
            switch (renderer.type) {
                case "simple":
                    {
                        return this.fromJson(renderer.symbol);
                    }
                case "uniqueValue":
                    {
                        var styles_1 = {};
                        var defaultStyle_1 = (renderer.defaultSymbol) && this.fromJson(renderer.defaultSymbol);
                        if (renderer.uniqueValueInfos) {
                            renderer.uniqueValueInfos.forEach(function (info) {
                                styles_1[info.value] = _this.fromJson(info.symbol);
                            });
                        }
                        return function (feature) { return styles_1[feature.get(renderer.field1)] || defaultStyle_1; };
                    }
                case "classBreaks": {
                    var styles_2 = {};
                    var classBreakRenderer_1 = renderer;
                    if (classBreakRenderer_1.classBreakInfos) {
                        console.log("processing classBreakInfos");
                        if (classBreakRenderer_1.visualVariables) {
                            classBreakRenderer_1.visualVariables.forEach(function (vars) {
                                switch (vars.type) {
                                    case "sizeInfo": {
                                        var steps_1 = range(classBreakRenderer_1.authoringInfo.visualVariables[0].minSliderValue, classBreakRenderer_1.authoringInfo.visualVariables[0].maxSliderValue);
                                        var dx_1 = (vars.maxSize - vars.minSize) / steps_1.length;
                                        var dataValue_1 = (vars.maxDataValue - vars.minDataValue) / steps_1.length;
                                        classBreakRenderer_1.classBreakInfos.forEach(function (classBreakInfo) {
                                            var icons = steps_1.map(function (step) {
                                                var json = $.extend({}, classBreakInfo.symbol);
                                                json.size = vars.minSize + dx_1 * (dataValue_1 - vars.minDataValue);
                                                var style = _this.fromJson(json);
                                                styles_2[dataValue_1] = style;
                                            });
                                        });
                                        debugger;
                                        break;
                                    }
                                    default:
                                        debugger;
                                        break;
                                }
                            });
                        }
                    }
                    return function (feature) {
                        debugger;
                        var value = feature.get(renderer.field1);
                        for (var key in styles_2) {
                            return styles_2[key];
                        }
                    };
                }
                default:
                    {
                        debugger;
                        console.error("unsupported renderer type: ", renderer.type);
                        break;
                    }
            }
        };
        return StyleConverter;
    }());
    exports.StyleConverter = StyleConverter;
});
define("bower_components/ol3-symbolizer/ol3-symbolizer/common/common", ["require", "exports"], function (require, exports) {
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
    function defaults(a, b) {
        Object.keys(b).filter(function (k) { return a[k] == undefined; }).forEach(function (k) { return a[k] = b[k]; });
        return a;
    }
    exports.defaults = defaults;
    function cssin(name, css) {
        var id = "style-" + name;
        var styleTag = document.getElementById(id);
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = id;
            styleTag.innerText = css;
            document.head.appendChild(styleTag);
        }
        var dataset = styleTag.dataset;
        dataset["count"] = parseInt(dataset["count"] || "0") + 1 + "";
        return function () {
            dataset["count"] = parseInt(dataset["count"] || "0") - 1 + "";
            if (dataset["count"] === "0") {
                styleTag.remove();
            }
        };
    }
    exports.cssin = cssin;
});
define("bower_components/ol3-symbolizer/ol3-symbolizer/ags/ags-source", ["require", "exports", "jquery", "openlayers", "bower_components/ol3-symbolizer/ol3-symbolizer/ags/ags-catalog", "bower_components/ol3-symbolizer/ol3-symbolizer/format/ags-symbolizer", "bower_components/ol3-symbolizer/ol3-symbolizer/common/common"], function (require, exports, $, ol, AgsCatalog, Symbolizer, common_1) {
    "use strict";
    var esrijsonFormat = new ol.format.EsriJSON();
    function asParam(options) {
        return Object
            .keys(options)
            .map(function (k) { return k + "=" + options[k]; })
            .join("&");
    }
    ;
    var DEFAULT_OPTIONS = {
        tileSize: 512,
        where: "1=1"
    };
    var ArcGisVectorSourceFactory = (function () {
        function ArcGisVectorSourceFactory() {
        }
        ArcGisVectorSourceFactory.create = function (options) {
            var d = $.Deferred();
            options = common_1.defaults(options, DEFAULT_OPTIONS);
            var srs = options.map.getView()
                .getProjection()
                .getCode()
                .split(":")
                .pop();
            var all = options.layers.map(function (layerId) {
                var d = $.Deferred();
                var tileGrid = ol.tilegrid.createXYZ({
                    tileSize: options.tileSize
                });
                var strategy = ol.loadingstrategy.tile(tileGrid);
                var loader = function (extent, resolution, projection) {
                    var box = {
                        xmin: extent[0],
                        ymin: extent[1],
                        xmax: extent[2],
                        ymax: extent[3]
                    };
                    var params = {
                        f: "json",
                        returnGeometry: true,
                        spatialRel: "esriSpatialRelIntersects",
                        geometry: encodeURIComponent(JSON.stringify(box)),
                        geometryType: "esriGeometryEnvelope",
                        resultType: "tile",
                        where: encodeURIComponent(options.where),
                        inSR: srs,
                        outSR: srs,
                        outFields: "*"
                    };
                    var query = options.services + "/" + options.serviceName + "/FeatureServer/" + layerId + "/query?" + asParam(params);
                    $.ajax({
                        url: query,
                        dataType: 'jsonp',
                        success: function (response) {
                            if (response.error) {
                                alert(response.error.message + '\n' +
                                    response.error.details.join('\n'));
                            }
                            else {
                                var features = esrijsonFormat.readFeatures(response, {
                                    featureProjection: projection,
                                    dataProjection: projection
                                });
                                if (features.length > 0) {
                                    source.addFeatures(features);
                                }
                            }
                        }
                    });
                };
                var source = new ol.source.Vector({
                    strategy: strategy,
                    loader: loader
                });
                var catalog = new AgsCatalog.Catalog(options.services + "/" + options.serviceName + "/FeatureServer");
                var converter = new Symbolizer.StyleConverter();
                catalog.aboutLayer(layerId).then(function (layerInfo) {
                    var layer = new ol.layer.Vector({
                        title: layerInfo.name,
                        source: source
                    });
                    var styleMap = converter.fromRenderer(layerInfo.drawingInfo.renderer, { url: "for icons?" });
                    layer.setStyle(function (feature, resolution) {
                        if (styleMap instanceof ol.style.Style) {
                            return styleMap;
                        }
                        else {
                            return styleMap(feature);
                        }
                    });
                    d.resolve(layer);
                });
                return d;
            });
            $.when.apply($, all).then(function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return d.resolve(args);
            });
            return d;
        };
        return ArcGisVectorSourceFactory;
    }());
    exports.ArcGisVectorSourceFactory = ArcGisVectorSourceFactory;
});
define("ol3-lab/labs/ags-viewer", ["require", "exports", "jquery", "openlayers", "ol3-lab/labs/common/common", "bower_components/ol3-symbolizer/ol3-symbolizer", "bower_components/ol3-layerswitcher/ol3-layerswitcher", "bower_components/ol3-popup/ol3-popup", "bower_components/ol3-symbolizer/ol3-symbolizer/ags/ags-source"], function (require, exports, $, ol, common_2, ol3_symbolizer_1, ol3_layerswitcher_1, ol3_popup_1, ags_source_1) {
    "use strict";
    var styler = new ol3_symbolizer_1.StyleConverter();
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
    var html = "\n<div class='popup'>\n    <div class='popup-container'>\n    </div>\n</div>\n";
    var css = "\n<style name=\"popup\" type=\"text/css\">\n    html, body, .map {\n        width: 100%;\n        height: 100%;\n        padding: 0;\n        overflow: hidden;\n        margin: 0;    \n    }\n</style>\n";
    var css_popup = "\n.popup-container {\n    position: absolute;\n    top: 1em;\n    right: 0.5em;\n    width: 10em;\n    bottom: 1em;\n    z-index: 1;\n    pointer-events: none;\n}\n\n.ol-popup {\n    color: white;\n    background-color: rgba(77,77,77,0.7);\n    min-width: 200px;\n}\n\n.ol-popup:after {\n    border-top-color: rgba(77,77,77,0.7);\n}\n\n";
    var center = {
        fire: [-117.754430386, 34.2606862490001],
        wichita: [-97.4, 37.8],
        vegas: [-115.235, 36.173]
    };
    function run() {
        $(html).appendTo(".map");
        $(css).appendTo("head");
        var options = {
            srs: 'EPSG:4326',
            center: center.vegas,
            zoom: 10,
            services: "http://sampleserver3.arcgisonline.com/ArcGIS/rest/services",
            serviceName: "SanFrancisco/311Incidents",
            layers: [0]
        };
        {
            var opts_1 = options;
            Object.keys(opts_1).forEach(function (k) {
                common_2.doif(common_2.getParameterByName(k), function (v) {
                    var value = parse(v, opts_1[k]);
                    if (value !== undefined)
                        opts_1[k] = value;
                });
            });
        }
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
                    title: "OSM",
                    type: 'base',
                    opacity: 0.8,
                    visible: true,
                    source: new ol.source.OSM()
                }),
                new ol.layer.Tile({
                    title: "Bing",
                    type: 'base',
                    opacity: 0.8,
                    visible: false,
                    source: new ol.source.BingMaps({
                        key: 'AuPHWkNxvxVAL_8Z4G8Pcq_eOKGm5eITH_cJMNAyYoIC1S_29_HhE893YrUUbIGl',
                        imagerySet: 'Aerial'
                    })
                })
            ]
        });
        ags_source_1.ArcGisVectorSourceFactory.create({
            tileSize: 256,
            map: map,
            services: options.services,
            serviceName: options.serviceName,
            layers: options.layers.reverse()
        }).then(function (agsLayers) {
            agsLayers.forEach(function (agsLayer) { return map.addLayer(agsLayer); });
            var layerSwitcher = new ol3_layerswitcher_1.LayerSwitcher();
            layerSwitcher.setMap(map);
            var popup = new ol3_popup_1.Popup({
                css: "\n            .ol-popup {\n                background-color: white;\n            }\n            .ol-popup .page {\n                max-height: 200px;\n                overflow-y: auto;\n            }\n            "
            });
            map.addOverlay(popup);
            map.on("click", function (event) {
                console.log("click");
                var coord = event.coordinate;
                popup.hide();
                var pageNum = 0;
                map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
                    var page = document.createElement('p');
                    var keys = Object.keys(feature.getProperties()).filter(function (key) {
                        var v = feature.get(key);
                        if (typeof v === "string")
                            return true;
                        if (typeof v === "number")
                            return true;
                        return false;
                    });
                    page.title = "" + ++pageNum;
                    page.innerHTML = "<table>" + keys.map(function (k) { return "<tr><td>" + k + "</td><td>" + feature.get(k) + "</td></tr>"; }).join("") + "</table>";
                    popup.pages.add(page, feature.getGeometry());
                });
                popup.show(coord, "<label>" + pageNum + " Features Found</label>");
                popup.pages.goto(0);
            });
        });
        return map;
    }
    exports.run = run;
});
define("ol3-lab/labs/common/myjson", ["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    var MyJson = (function () {
        function MyJson(json, id, endpoint) {
            if (id === void 0) { id = "4acgf"; }
            if (endpoint === void 0) { endpoint = "https://api.myjson.com/bins"; }
            this.json = json;
            this.id = id;
            this.endpoint = endpoint;
        }
        MyJson.prototype.get = function () {
            var _this = this;
            return $.ajax({
                url: this.endpoint + "/" + this.id,
                type: 'GET'
            }).then(function (json) { return _this.json = json; });
        };
        MyJson.prototype.put = function () {
            var _this = this;
            return $.ajax({
                url: this.endpoint + "/" + this.id,
                type: 'PUT',
                data: JSON.stringify(this.json),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            }).then(function (json) { return _this.json = json; });
        };
        MyJson.prototype.post = function () {
            var _this = this;
            return $.ajax({
                url: "" + this.endpoint,
                type: 'POST',
                data: JSON.stringify(this.json),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            }).then(function (data) {
                debugger;
                _this.id = data.uri.substr(1 + _this.endpoint.length);
            });
        };
        return MyJson;
    }());
    exports.MyJson = MyJson;
});
define("ol3-lab/labs/common/ol3-patch", ["require", "exports", "openlayers", "ol3-lab/labs/common/common"], function (require, exports, ol3, common_3) {
    "use strict";
    if (!ol3.geom.SimpleGeometry.prototype.scale) {
        var scale_1 = function (flatCoordinates, offset, end, stride, deltaX, deltaY, opt_dest) {
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
        common_3.mixin(ol3.geom.SimpleGeometry.prototype, {
            scale: function (deltaX, deltaY) {
                var it = this;
                it.applyTransform(function (flatCoordinates, output, stride) {
                    scale_1(flatCoordinates, 0, flatCoordinates.length, stride, deltaX, deltaY, flatCoordinates);
                    return flatCoordinates;
                });
                it.changed();
            }
        });
    }
    return ol3;
});
define("ol3-lab/labs/common/ol3-polyline", ["require", "exports", "openlayers"], function (require, exports, ol) {
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
define("ol3-lab/labs/common/snapshot", ["require", "exports", "ol3-lab/labs/common/ol3-patch"], function (require, exports, ol) {
    "use strict";
    var Snapshot = (function () {
        function Snapshot() {
        }
        Snapshot.render = function (canvas, feature) {
            feature = feature.clone();
            var geom = feature.getGeometry();
            var extent = geom.getExtent();
            var isPoint = extent[0] === extent[2];
            var _a = ol.extent.getCenter(extent), dx = _a[0], dy = _a[1];
            var scale = isPoint ? 1 : Math.min(canvas.width / ol.extent.getWidth(extent), canvas.height / ol.extent.getHeight(extent));
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
define("ol3-lab/ux/styles/basic", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/fill/gradient", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/labs/common/style-generator", ["require", "exports", "openlayers", "ol3-lab/ux/styles/basic", "bower_components/ol3-symbolizer/ol3-symbolizer"], function (require, exports, ol, basic_styles, ol3_symbolizer_2) {
    "use strict";
    var converter = new ol3_symbolizer_2.StyleConverter();
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
                stops: stops.map(function (stop) { return stop.color + " " + Math.round(100 * stop.stop) + "%"; }).join(";")
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
define("ol3-lab/labs/facebook", ["require", "exports", "openlayers", "jquery"], function (require, exports, ol, $) {
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
define("ol3-lab/ux/styles/stroke/linedash", ["require", "exports"], function (require, exports) {
    "use strict";
    var dasharray = {
        solid: "none",
        shortdash: [4, 1],
        shortdot: [1, 1],
        shortdashdot: [4, 1, 1, 1],
        shortdashdotdot: [4, 1, 1, 1, 1, 1],
        dot: [1, 3],
        dash: [4, 3],
        longdash: [8, 3],
        dashdot: [4, 3, 1, 3],
        longdashdot: [8, 3, 1, 3],
        longdashdotdot: [8, 3, 1, 3, 1, 3]
    };
    return dasharray;
});
define("ol3-lab/ux/styles/stroke/dashdotdot", ["require", "exports", "ol3-lab/ux/styles/stroke/linedash"], function (require, exports, Dashes) {
    "use strict";
    return [
        {
            "stroke": {
                "color": "orange",
                "width": 2,
                "lineDash": Dashes.longdashdotdot
            }
        }
    ];
});
define("ol3-lab/ux/styles/stroke/solid", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/text/text", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/labs/mapmaker", ["require", "exports", "jquery", "openlayers", "ol3-lab/labs/common/common", "ol3-lab/labs/common/ol3-polyline", "bower_components/ol3-symbolizer/ol3-symbolizer", "ol3-lab/ux/styles/stroke/dashdotdot", "ol3-lab/ux/styles/stroke/solid", "ol3-lab/ux/styles/text/text", "ol3-lab/labs/common/myjson"], function (require, exports, $, ol, common_4, reduce, ol3_symbolizer_3, dashdotdot, strokeStyle, textStyle, myjson_1) {
    "use strict";
    var styler = new ol3_symbolizer_3.StyleConverter();
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
    var css = "\n<style>\n    html, body, .map {\n        width: 100%;\n        height: 100%;\n        padding: 0;\n        overflow: hidden;\n        margin: 0;    \n    }\n\n    .map {\n        background-color: black;\n    }\n\n    .map.dark {\n        background: black;\n    }\n\n    .map.light {\n        background: silver;\n    }\n\n    .map.bright {\n        background: white;\n    }\n\n    .mapmaker {\n        position: absolute;\n        top: 0;\n        left: 0;\n        width: 0;\n        height: 0;\n        background: transparent;\n        z-index: 1;\n    }\n    .mapmaker .toolbar {\n        position: relative;\n        top: 10px;\n        left: 42px;\n        width: 240px;\n    }\n    .mapmaker .toolbar button {\n        border: 1px solid transparent;\n        background: transparent;\n    }\n\n    .mapmaker .toolbar button:hover {\n        border: 1px solid black;\n        background: white;\n    }\n    button.clone {\n        display:none;\n    }\n</style>\n";
    function run() {
        $(html).appendTo(".map");
        $(css).appendTo("head");
        var options = {
            srs: 'EPSG:4326',
            center: [-82.4, 34.85],
            zoom: 15,
            background: "bright",
            myjson: "",
            geom: "",
            color: "red",
            modify: false,
            basemap: "bing"
        };
        {
            var opts_2 = options;
            Object.keys(opts_2).forEach(function (k) {
                common_4.doif(common_4.getParameterByName(k), function (v) {
                    var value = parse(v, opts_2[k]);
                    if (value !== undefined)
                        opts_2[k] = value;
                });
            });
        }
        var d = $.Deferred();
        if (options.myjson) {
            var myjson_2 = new myjson_1.MyJson(options, options.myjson);
            myjson_2.get().then(function () {
                myjson_2.json.myjson = options.myjson;
                d.resolve(myjson_2.json);
            });
        }
        else {
            d.resolve(options);
        }
        return d.then(function (options) {
            $("#map").addClass(options.background);
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
                    })
                ]
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
                if (!common_4.getParameterByName("center")) {
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
                    console.log("geom size", options.geom.length);
                    if (options.myjson || (options.geom.length > 1000)) {
                        var myjson_3 = new myjson_1.MyJson(options);
                        if (options.myjson) {
                            myjson_3.id = options.myjson;
                            myjson_3.put().then(function () {
                                var url = encodeURI(href + "?run=ol3-lab/labs/mapmaker&myjson=" + myjson_3.id);
                                window.open(url, "_blank");
                            });
                        }
                        else {
                            myjson_3.post().then(function () {
                                var url = encodeURI(href + "?run=ol3-lab/labs/mapmaker&myjson=" + myjson_3.id);
                                window.open(url, "_blank");
                            });
                        }
                    }
                    else {
                        var opts_3 = options;
                        var querystring = Object.keys(options).map(function (k) { return k + "=" + opts_3[k]; }).join("&");
                        var url = encodeURI(href + "?run=ol3-lab/labs/mapmaker&" + querystring);
                        window.open(url, "_blank");
                    }
                }
                else {
                    var opts_4 = options;
                    var querystring = Object.keys(options).map(function (k) { return k + "=" + opts_4[k]; }).join("&");
                    var url = encodeURI(href + "?run=ol3-lab/labs/mapmaker&" + querystring);
                    window.open(url, "_blank");
                }
            });
            return map;
        });
    }
    exports.run = run;
});
define("ol3-lab/ux/controls/input", ["require", "exports", "openlayers", "ol3-lab/labs/common/common"], function (require, exports, ol, common_5) {
    "use strict";
    var css = "\n    .ol-input {\n        position:absolute;\n    }\n    .ol-input.top {\n        top: 0.5em;\n    }\n    .ol-input.left {\n        left: 0.5em;\n    }\n    .ol-input.bottom {\n        bottom: 0.5em;\n    }\n    .ol-input.right {\n        right: 0.5em;\n    }\n    .ol-input.top.left {\n        top: 4.5em;\n    }\n    .ol-input button {\n        min-height: 1.375em;\n        min-width: 1.375em;\n        width: auto;\n        display: inline;\n    }\n    .ol-input.left button {\n        float:right;\n    }\n    .ol-input.right button {\n        float:left;\n    }\n    .ol-input input {\n        height: 24px;\n        min-width: 240px;\n        border: none;\n        padding: 0;\n        margin: 0;\n        margin-left: 2px;\n        margin-top: 1px;\n        vertical-align: top;\n    }\n    .ol-input input.hidden {\n        display: none;\n    }\n";
    var olcss = {
        CLASS_CONTROL: 'ol-control',
        CLASS_UNSELECTABLE: 'ol-unselectable',
        CLASS_UNSUPPORTED: 'ol-unsupported',
        CLASS_HIDDEN: 'ol-hidden'
    };
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
            var _this = _super.call(this, {
                element: options.element,
                target: options.target
            }) || this;
            var button = _this.button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.title = options.placeholderText;
            options.element.appendChild(button);
            var input = _this.input = document.createElement('input');
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
                var args = {
                    type: "change",
                    value: input.value
                };
                _this.dispatchEvent(args);
                if (options.onChange)
                    options.onChange(args);
            });
            input.addEventListener("blur", function () {
            });
            options.expanded ? _this.expand(options) : _this.collapse(options);
            return _this;
        }
        Geocoder.create = function (options) {
            common_5.cssin('ol-input', css);
            options = common_5.mixin({
                openedText: options.className && -1 < options.className.indexOf("left") ? expando.left : expando.right,
                closedText: options.className && -1 < options.className.indexOf("left") ? expando.right : expando.left
            }, options || {});
            options = common_5.mixin(common_5.mixin({}, defaults), options);
            var element = document.createElement('div');
            element.className = options.className + " " + olcss.CLASS_UNSELECTABLE + " " + olcss.CLASS_CONTROL;
            var geocoderOptions = common_5.mixin({
                element: element,
                target: options.target,
                expanded: false
            }, options);
            return new Geocoder(geocoderOptions);
        };
        Geocoder.prototype.dispose = function () {
            debugger;
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
define("ol3-lab/labs/providers/osm", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/labs/geocoder", ["require", "exports", "ol3-lab/labs/mapmaker", "ol3-lab/ux/controls/input", "ol3-lab/labs/providers/osm"], function (require, exports, MapMaker, input_3, osm_1) {
    "use strict";
    function run() {
        MapMaker.run().then(function (map) {
            var searchProvider = new osm_1.OpenStreet();
            var changeHandler = function (args) {
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
                        if (r.original.boundingbox) {
                            var _a = r.original.boundingbox.map(function (v) { return parseFloat(v); }), lat1 = _a[0], lat2 = _a[1], lon1 = _a[2], lon2 = _a[3];
                            map.getView().fit([lon1, lat1, lon2, lat2], map.getSize());
                        }
                        else {
                            map.getView().setCenter([r.lon, r.lat]);
                        }
                        return true;
                    });
                }).fail(function () {
                    console.error("geocoder failed");
                });
            };
            var geocoder = input_3.Geocoder.create({
                closedText: "+",
                openedText: "−",
                placeholderText: "Bottom Left Search",
                onChange: changeHandler
            });
            map.addControl(geocoder);
            map.addControl(input_3.Geocoder.create({
                className: 'ol-input bottom right',
                expanded: true,
                placeholderText: "Bottom Right Search",
                onChange: changeHandler
            }));
            map.addControl(input_3.Geocoder.create({
                className: 'ol-input top right',
                expanded: false,
                placeholderText: "Top Right",
                onChange: changeHandler
            }));
            map.addControl(input_3.Geocoder.create({
                className: 'ol-input top left',
                expanded: false,
                placeholderText: "Top Left Search",
                onChange: changeHandler
            }));
        });
    }
    exports.run = run;
});
define("ol3-lab/labs/google-identity", ["require", "exports", "jquery", "openlayers"], function (require, exports, $, ol) {
    "use strict";
    var client_id = '987911803084-a6cafnu52d7lkr8vfrtl4modrpinr1os.apps.googleusercontent.com';
    var api_key = 'AIzaSyCfuluThuQ0j7tCHg9GRf0lwDRHNUsZs6o';
    requirejs.config({
        shim: {
            'gapi': {
                exports: 'gapi'
            }
        },
        paths: {
            'gapi': 'https://apis.google.com/js/api.js'
        }
    });
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
        function GoogleIdentity(client_id) {
            this.client_id = client_id;
        }
        GoogleIdentity.prototype.load = function () {
            var _this = this;
            var d = $.Deferred();
            $("\n            <meta name=\"google-signin-scope\" content=\"profile email https://www.googleapis.com/auth/calendar.readonly\">\n            <meta name=\"google-signin-client_id\" content=\"" + this.client_id + "\">\n            <script src=\"https://apis.google.com/js/platform.js\" async defer></script>\n        ").appendTo('head');
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
        require(["gapi"], function (gapi) {
            gapi.load('client', function () {
                debugger;
                gapi.client.setApiKey(api_key);
                gapi.auth2.init({
                    client_id: client_id,
                    scope: 'profile https://www.googleapis.com/auth/calendar.readonly'
                }).then(function () {
                    debugger;
                    var auth2 = gapi.auth2.getAuthInstance();
                });
            });
        });
        return;
        var gi = new GoogleIdentity(client_id);
        gi.load().then(function (args) {
            gi.showInfo(args);
            gapi.load('client', 'v3', function () {
                debugger;
            });
        });
        $('button.logout-button').click(function () {
            gi.logout();
        });
    }
    exports.run = run;
});
define("ol3-lab/labs/image-data-viewer", ["require", "exports", "jquery"], function (require, exports, $) {
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
define("ol3-lab/labs/index", ["require", "exports"], function (require, exports) {
    "use strict";
    function run() {
        var l = window.location;
        var path = "" + l.origin + l.pathname + "?run=ol3-lab/labs/";
        var labs = "\n    ../ux/ags-symbols\n\n    ags-viewer&services=//sampleserver3.arcgisonline.com/ArcGIS/rest/services&serviceName=SanFrancisco/311Incidents&layers=0&debug=1&center=-122.49,37.738\n    popup\n    layerswitcher\n    \n    style-lab\n\n    style-viewer\n    style-viewer&geom=point&style=icon/png\n    style-viewer&geom=point&style=icon/png,text/text\n    style-viewer&geom=point&style=%5B%7B\"image\":%7B\"imgSize\":%5B45,45%5D,\"rotation\":0,\"stroke\":%7B\"color\":\"rgba(255,25,0,0.8)\",\"width\":3%7D,\"path\":\"M23%202%20L23%2023%20L43%2016.5%20L23%2023%20L35%2040%20L23%2023%20L11%2040%20L23%2023%20L3%2017%20L23%2023%20L23%202%20Z\"%7D%7D%5D\n\n    style-viewer&geom=point&style=%5B%7B\"circle\":%7B\"fill\":%7B\"gradient\":%7B\"type\":\"linear(32,32,96,96)\",\"stops\":\"rgba(0,255,0,0.1)%200%25;rgba(0,255,0,0.8)%20100%25\"%7D%7D,\"opacity\":1,\"stroke\":%7B\"color\":\"rgba(0,255,0,1)\",\"width\":1%7D,\"radius\":64%7D%7D,%7B\"image\":%7B\"anchor\":%5B16,48%5D,\"size\":%5B32,48%5D,\"anchorXUnits\":\"pixels\",\"anchorYUnits\":\"pixels\",\"src\":\"http://openlayers.org/en/v3.20.1/examples/data/icon.png\"%7D%7D,%7B\"text\":%7B\"fill\":%7B\"color\":\"rgba(75,92,85,0.85)\"%7D,\"stroke\":%7B\"color\":\"rgba(255,255,255,1)\",\"width\":5%7D,\"offset-x\":0,\"offset-y\":16,\"text\":\"fantasy%20light\",\"font\":\"18px%20serif\"%7D%7D%5D    \n\n    style-viewer&geom=point&style=%5B%7B\"image\":%7B\"imgSize\":%5B13,21%5D,\"fill\":%7B\"color\":\"rgba(0,0,0,0.5)\"%7D,\"path\":\"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z%20M6.3,8.8%20c-1.4,0-2.5-1.1-2.5-2.5c0-1.4,1.1-2.5,2.5-2.5c1.4,0,2.5,1.1,2.5,2.5C8.8,7.7,7.7,8.8,6.3,8.8z\"%7D%7D%5D\n\n    style-viewer&geom=point&style=%5B%7B\"image\":%7B\"imgSize\":%5B15,15%5D,\"anchor\":%5B0,0.5%5D,\"fill\":%7B\"color\":\"rgba(255,0,0,0.1)\"%7D,\"stroke\":%7B\"color\":\"rgba(255,0,0,1)\",\"width\":0.1%7D,\"scale\":8,\"rotation\":0.7,\"img\":\"lock\"%7D%7D,%7B\"image\":%7B\"imgSize\":%5B15,15%5D,\"anchor\":%5B100,0.5%5D,\"anchorXUnits\":\"pixels\",\"fill\":%7B\"color\":\"rgba(0,255,0,0.4)\"%7D,\"stroke\":%7B\"color\":\"rgba(255,0,0,1)\",\"width\":0.1%7D,\"scale\":1.5,\"rotation\":0.7,\"img\":\"lock\"%7D%7D,%7B\"image\":%7B\"imgSize\":%5B15,15%5D,\"anchor\":%5B-10,0%5D,\"anchorXUnits\":\"pixels\",\"anchorOrigin\":\"top-right\",\"fill\":%7B\"color\":\"rgba(230,230,80,1)\"%7D,\"stroke\":%7B\"color\":\"rgba(0,0,0,1)\",\"width\":0.5%7D,\"scale\":2,\"rotation\":0.8,\"img\":\"lock\"%7D%7D%5D\n\n\n    style-viewer&geom=multipoint&style=icon/png\n\n    style-viewer&geom=polyline&style=stroke/dot\n\n    style-viewer&geom=polygon&style=fill/diagonal\n    style-viewer&geom=polygon&style=fill/horizontal,fill/vertical,stroke/dashdotdot\n    style-viewer&geom=polygon&style=stroke/solid,text/text\n    style-viewer&geom=polygon-with-holes&style=fill/cross,stroke/solid\n\n    style-viewer&geom=multipolygon&style=stroke/solid,fill/horizontal,text/text\n\n    style-to-canvas\n    polyline-encoder\n    image-data-viewer\n\n    mapmaker\n    mapmaker&background=light\n    mapmaker&geom=t`syzE}gm_dAm_@A?r@p@Bp@Hp@Ph@Td@Z`@`@Vb@Nd@xUABmF\n    mapmaker&geom=t`syzE}gm_dAm_@A?r@p@Bp@Hp@Ph@Td@Z`@`@Vb@Nd@xUABmF&color=yellow&background=dark&modify=1\n    \n    geocoder&modify=1\n\n    facebook\n    google-identity\n    index\n    ";
        var styles = document.createElement("style");
        document.head.appendChild(styles);
        styles.innerText += "\n    #map {\n        display: none;\n    }\n    .test {\n        margin: 20px;\n    }\n    ";
        var labDiv = document.createElement("div");
        document.body.appendChild(labDiv);
        labDiv.innerHTML = labs
            .split(/ /)
            .map(function (v) { return v.trim(); })
            .filter(function (v) { return !!v; })
            .map(function (lab) { return "<div class='test'><a href='" + path + lab + "&debug=1'>" + lab + "</a></div>"; })
            .join("\n");
        var testDiv = document.createElement("div");
        document.body.appendChild(testDiv);
        testDiv.innerHTML = "<a href='" + l.origin + l.pathname + "?run=ol3-lab/tests/index'>tests</a>";
    }
    exports.run = run;
    ;
});
define("bower_components/ol3-panzoom/ol3-panzoom/zoomslidercontrol", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    var ZoomSlider = (function (_super) {
        __extends(ZoomSlider, _super);
        function ZoomSlider(opt_options) {
            return _super.call(this, opt_options) || this;
        }
        ZoomSlider.prototype.getElement = function () {
            return this.element;
        };
        return ZoomSlider;
    }(ol.control.ZoomSlider));
    return ZoomSlider;
});
define("bower_components/ol3-panzoom/ol3-panzoom/ol3-panzoom", ["require", "exports", "openlayers", "bower_components/ol3-panzoom/ol3-panzoom/zoomslidercontrol"], function (require, exports, ol, ZoomSlider) {
    "use strict";
    function defaults(a) {
        var b = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            b[_i - 1] = arguments[_i];
        }
        b.forEach(function (b) {
            Object.keys(b).filter(function (k) { return a[k] === undefined; }).forEach(function (k) { return a[k] = b[k]; });
        });
        return a;
    }
    function on(element, event, listener) {
        element.addEventListener(event, listener);
        return function () { return element.removeEventListener(event, listener); };
    }
    var DEFAULT_OPTIONS = {};
    var PanZoom = (function (_super) {
        __extends(PanZoom, _super);
        function PanZoom(options) {
            if (options === void 0) { options = DEFAULT_OPTIONS; }
            var _this = this;
            options = defaults({}, options, DEFAULT_OPTIONS);
            _this = _super.call(this, options) || this;
            _this.className_ = options.className ? options.className : 'ol-panzoom';
            _this.imgPath_ = options.imgPath || './ol3-panzoom/resources/ol2img';
            var element = _this.element = _this.element_ = _this.createEl_();
            _this.setTarget(options.target);
            _this.listenerKeys_ = [];
            _this.duration_ = options.duration !== undefined ? options.duration : 100;
            _this.maxExtent_ = options.maxExtent ? options.maxExtent : null;
            _this.maxZoom_ = options.maxZoom ? options.maxZoom : 19;
            _this.minZoom_ = options.minZoom ? options.minZoom : 0;
            _this.pixelDelta_ = options.pixelDelta !== undefined ? options.pixelDelta : 128;
            _this.slider_ = options.slider !== undefined ? options.slider : false;
            _this.zoomDelta_ = options.zoomDelta !== undefined ? options.zoomDelta : 1;
            _this.panEastEl_ = _this.createButtonEl_('pan-east');
            _this.panNorthEl_ = _this.createButtonEl_('pan-north');
            _this.panSouthEl_ = _this.createButtonEl_('pan-south');
            _this.panWestEl_ = _this.createButtonEl_('pan-west');
            _this.zoomInEl_ = _this.createButtonEl_('zoom-in');
            _this.zoomOutEl_ = _this.createButtonEl_('zoom-out');
            _this.zoomMaxEl_ = (!_this.slider_ && _this.maxExtent_) ? _this.createButtonEl_('zoom-max') : null;
            _this.zoomSliderCtrl_ = (_this.slider_) ? new ZoomSlider() : null;
            element.appendChild(_this.panNorthEl_);
            element.appendChild(_this.panWestEl_);
            element.appendChild(_this.panEastEl_);
            element.appendChild(_this.panSouthEl_);
            element.appendChild(_this.zoomInEl_);
            element.appendChild(_this.zoomOutEl_);
            if (_this.zoomMaxEl_) {
                element.appendChild(_this.zoomMaxEl_);
            }
            return _this;
        }
        PanZoom.prototype.setMap = function (map) {
            var _this = this;
            var keys = this.listenerKeys_;
            var zoomSlider = this.zoomSliderCtrl_;
            var currentMap = this.getMap();
            if (currentMap && currentMap instanceof ol.Map) {
                keys.forEach(function (k) { return k(); });
                keys.length = 0;
                if (this.zoomSliderCtrl_) {
                    this.zoomSliderCtrl_.setTarget(null);
                    window.setTimeout(function () {
                        currentMap.removeControl(zoomSlider);
                    }, 0);
                }
            }
            _super.prototype.setMap.call(this, map);
            if (map) {
                keys.push(on(this.panEastEl_, "click", function (evt) { return _this.pan_('east', evt); }));
                keys.push(on(this.panNorthEl_, "click", function (evt) { return _this.pan_('north', evt); }));
                keys.push(on(this.panSouthEl_, "click", function (evt) { return _this.pan_('south', evt); }));
                keys.push(on(this.panWestEl_, "click", function (evt) { return _this.pan_('west', evt); }));
                keys.push(on(this.zoomInEl_, "click", function (evt) { return _this.zoom_('in', evt); }));
                keys.push(on(this.zoomOutEl_, "click", function (evt) { return _this.zoom_('out', evt); }));
                if (this.maxExtent_ && !this.slider_) {
                    keys.push(on(this.zoomMaxEl_, "click", function (evt) { return _this.zoom_('max', evt); }));
                }
                if (this.slider_) {
                    zoomSlider.setTarget(this.element_);
                    window.setTimeout(function () {
                        map.addControl(zoomSlider);
                    }, 0);
                    this.adjustZoomSlider_();
                }
            }
        };
        PanZoom.prototype.createEl_ = function () {
            var path = this.imgPath_;
            var className = this.className_;
            var cssClasses = [
                className,
                'ol-unselectable'
            ];
            if (!path) {
                cssClasses.push('ol-control');
            }
            var element = document.createElement('div');
            element.className = cssClasses.join(' ');
            if (path) {
                element.style.left = '4px';
                element.style.position = 'absolute';
                element.style.top = '4px';
            }
            return element;
        };
        PanZoom.prototype.createButtonEl_ = function (action) {
            var divEl = document.createElement('div');
            var path = this.imgPath_;
            var maxExtent = this.maxExtent_;
            var slider = this.slider_;
            if (path) {
                divEl.style.width = '18px';
                divEl.style.height = '18px';
                divEl.style.position = 'absolute';
                divEl.style.cursor = 'pointer';
                var imgEl = document.createElement('img');
                imgEl.style.width = '18px';
                imgEl.style.height = '18px';
                imgEl.style['vertical-align'] = 'top';
                switch (action) {
                    case 'pan-east':
                        imgEl.id = 'OpenLayers_Control_PanZoom_panright_innerImage';
                        imgEl.src = [path, 'east-mini.png'].join('/');
                        divEl.id = 'OpenLayers_Control_PanZoom_panright';
                        divEl.style.top = '22px';
                        divEl.style.left = '22px';
                        break;
                    case 'pan-north':
                        imgEl.id = 'OpenLayers_Control_PanZoom_panup_innerImage';
                        imgEl.src = [path, 'north-mini.png'].join('/');
                        divEl.id = 'OpenLayers_Control_PanZoom_panup';
                        divEl.style.top = '4px';
                        divEl.style.left = '13px';
                        break;
                    case 'pan-south':
                        imgEl.id = 'OpenLayers_Control_PanZoom_pandown_innerImage';
                        imgEl.src = [path, 'south-mini.png'].join('/');
                        divEl.id = 'OpenLayers_Control_PanZoom_pandown';
                        divEl.style.top = '40px';
                        divEl.style.left = '13px';
                        break;
                    case 'pan-west':
                        imgEl.id = 'OpenLayers_Control_PanZoom_panleft_innerImage';
                        imgEl.src = [path, 'west-mini.png'].join('/');
                        divEl.id = 'OpenLayers_Control_PanZoom_panleft';
                        divEl.style.top = '22px';
                        divEl.style.left = '4px';
                        break;
                    case 'zoom-in':
                        imgEl.id = 'OpenLayers_Control_PanZoom_zoomin_innerImage';
                        imgEl.src = [path, 'zoom-plus-mini.png'].join('/');
                        divEl.id = 'OpenLayers_Control_PanZoom_zoomin';
                        divEl.style.top = '63px';
                        divEl.style.left = '13px';
                        break;
                    case 'zoom-out':
                        imgEl.id = 'OpenLayers_Control_PanZoom_zoomout_innerImage';
                        imgEl.src = [path, 'zoom-minus-mini.png'].join('/');
                        divEl.id = 'OpenLayers_Control_PanZoom_zoomout';
                        if (slider) {
                            divEl.style.top = [this.getSliderSize_() + 81, 'px'].join('');
                        }
                        else if (maxExtent) {
                            divEl.style.top = '99px';
                        }
                        else {
                            divEl.style.top = '81px';
                        }
                        divEl.style.left = '13px';
                        break;
                    case 'zoom-max':
                        imgEl.id = 'OpenLayers_Control_PanZoom_zoomworld_innerImage';
                        imgEl.src = [path, 'zoom-world-mini.png'].join('/');
                        divEl.id = 'OpenLayers_Control_PanZoom_zoomworld';
                        divEl.style.top = '81px';
                        divEl.style.left = '13px';
                        break;
                }
                divEl.appendChild(imgEl);
            }
            return divEl;
        };
        PanZoom.prototype.pan_ = function (direction, evt) {
            var stopEvent = false;
            var map = this.getMap();
            console.assert(!!map, 'map must be set');
            var view = map.getView();
            console.assert(!!view, 'map must have view');
            var mapUnitsDelta = view.getResolution() * this.pixelDelta_;
            var deltaX = 0, deltaY = 0;
            if (direction == 'south') {
                deltaY = -mapUnitsDelta;
            }
            else if (direction == 'west') {
                deltaX = -mapUnitsDelta;
            }
            else if (direction == 'east') {
                deltaX = mapUnitsDelta;
            }
            else {
                deltaY = mapUnitsDelta;
            }
            var delta = [deltaX, deltaY];
            ol.coordinate.rotate(delta, view.getRotation());
            var currentCenter = view.getCenter();
            if (currentCenter) {
                if (this.duration_ && this.duration_ > 0) {
                    map.beforeRender(ol.animation.pan({
                        source: currentCenter,
                        duration: this.duration_,
                        easing: ol.easing.linear
                    }));
                }
                var center = view.constrainCenter([currentCenter[0] + delta[0], currentCenter[1] + delta[1]]);
                view.setCenter(center);
            }
            evt.preventDefault();
            stopEvent = true;
            return !stopEvent;
        };
        PanZoom.prototype.zoom_ = function (direction, evt) {
            if (direction === 'in') {
                this.zoomByDelta_(this.zoomDelta_);
            }
            else if (direction === 'out') {
                this.zoomByDelta_(-this.zoomDelta_);
            }
            else if (direction === 'max') {
                var map = this.getMap();
                var view = map.getView();
                var extent = !this.maxExtent_ ?
                    view.getProjection().getExtent() : this.maxExtent_;
                var size = map.getSize();
                console.assert(!!size, 'size should be defined');
                view.fit(extent, size);
            }
        };
        PanZoom.prototype.zoomByDelta_ = function (delta) {
            var map = this.getMap();
            var view = map.getView();
            if (!view) {
                return;
            }
            var currentResolution = view.getResolution();
            if (currentResolution) {
                if (this.duration_ > 0) {
                    map.beforeRender(ol.animation.zoom({
                        resolution: currentResolution,
                        duration: this.duration_,
                        easing: ol.easing.easeOut
                    }));
                }
                var newResolution = view.constrainResolution(currentResolution, delta);
                view.setResolution(newResolution);
            }
        };
        PanZoom.prototype.adjustZoomSlider_ = function () {
            var zoomSlider = this.zoomSliderCtrl_;
            var path = this.imgPath_;
            if (!zoomSlider || !path) {
                return;
            }
            var height = [this.getSliderSize_(), 'px'].join('');
            var zoomSliderEl = zoomSlider.getElement();
            zoomSliderEl.style.background =
                ['url(', path, '/', 'zoombar.png', ')'].join('');
            zoomSliderEl.style.border = '0';
            zoomSliderEl.style['border-radius'] = '0';
            zoomSliderEl.style.height = height;
            zoomSliderEl.style.left = '13px';
            zoomSliderEl.style.padding = '0';
            zoomSliderEl.style.top = '81px';
            zoomSliderEl.style.width = '18px';
            var sliderEl = zoomSliderEl.children[0];
            console.assert(sliderEl instanceof Element);
            sliderEl.style.background = ['url(', path, '/', 'slider.png', ')'].join('');
            sliderEl.style.border = "none";
            sliderEl.style.height = '9px';
            sliderEl.style.margin = '0 -1px';
            sliderEl.style.width = '20px';
        };
        PanZoom.prototype.getSliderSize_ = function () {
            return (this.maxZoom_ - this.minZoom_ + 1) * 11;
        };
        return PanZoom;
    }(ol.control.Control));
    exports.PanZoom = PanZoom;
});
define("bower_components/ol3-panzoom/index", ["require", "exports", "bower_components/ol3-panzoom/ol3-panzoom/ol3-panzoom"], function (require, exports, Panzoom) {
    "use strict";
    return Panzoom;
});
define("ol3-lab/labs/layerswitcher", ["require", "exports", "jquery", "openlayers", "ol3-lab/labs/common/common", "bower_components/ol3-symbolizer/ol3-symbolizer", "bower_components/ol3-layerswitcher/ol3-layerswitcher", "bower_components/ol3-popup/ol3-popup", "bower_components/ol3-panzoom/index", "bower_components/ol3-symbolizer/ol3-symbolizer/ags/ags-source"], function (require, exports, $, ol, common_6, ol3_symbolizer_4, ol3_layerswitcher_2, ol3_popup_2, index_1, ags_source_2) {
    "use strict";
    var styler = new ol3_symbolizer_4.StyleConverter();
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
    var html = "\n<div class='popup'>\n    <div class='popup-container'>\n    </div>\n</div>\n";
    var css = "\n<style name=\"popup\" type=\"text/css\">\n    html, body, .map {\n        width: 100%;\n        height: 100%;\n        padding: 0;\n        overflow: hidden;\n        margin: 0;    \n    }\n</style>\n";
    var css_popup = "\n.popup-container {\n    position: absolute;\n    top: 1em;\n    right: 0.5em;\n    width: 10em;\n    bottom: 1em;\n    z-index: 1;\n    pointer-events: none;\n}\n\n.ol-popup {\n    color: white;\n    background-color: rgba(77,77,77,0.7);\n    min-width: 200px;\n}\n\n.ol-popup:after {\n    border-top-color: rgba(77,77,77,0.7);\n}\n\n";
    var center = {
        fire: [-117.754430386, 34.2606862490001],
        wichita: [-97.4, 37.8],
        vegas: [-115.235, 36.173]
    };
    function run() {
        $(html).appendTo(".map");
        $(css).appendTo("head");
        var options = {
            srs: 'EPSG:4326',
            center: center.vegas,
            zoom: 10
        };
        {
            var opts_5 = options;
            Object.keys(opts_5).forEach(function (k) {
                common_6.doif(common_6.getParameterByName(k), function (v) {
                    var value = parse(v, opts_5[k]);
                    if (value !== undefined)
                        opts_5[k] = value;
                });
            });
        }
        var map = new ol.Map({
            target: "map",
            keyboardEventTarget: document,
            loadTilesWhileAnimating: true,
            loadTilesWhileInteracting: true,
            controls: ol.control.defaults({
                attribution: false,
                zoom: false
            }).extend([new index_1.PanZoom({
                    minZoom: 5,
                    maxZoom: 21,
                    imgPath: "https://raw.githubusercontent.com/ca0v/ol3-panzoom/master/ol3-panzoom/resources/zoombar_black",
                    slider: true
                })]),
            view: new ol.View({
                projection: options.srs,
                center: options.center,
                minZoom: 5,
                maxZoom: 21,
                zoom: options.zoom
            }),
            layers: [
                new ol.layer.Tile({
                    title: "OSM",
                    type: 'base',
                    opacity: 0.8,
                    visible: true,
                    source: new ol.source.OSM()
                }),
                new ol.layer.Tile({
                    title: "Bing",
                    type: 'base',
                    opacity: 0.8,
                    visible: false,
                    source: new ol.source.BingMaps({
                        key: 'AuPHWkNxvxVAL_8Z4G8Pcq_eOKGm5eITH_cJMNAyYoIC1S_29_HhE893YrUUbIGl',
                        imagerySet: 'Aerial'
                    })
                })
            ]
        });
        ags_source_2.ArcGisVectorSourceFactory.create({
            tileSize: 256,
            map: map,
            services: "https://services7.arcgis.com/k0UprFPHKieFB9UY/arcgis/rest/services",
            serviceName: "GoldServer860",
            layers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].reverse()
        }).then(function (agsLayers) {
            agsLayers.forEach(function (agsLayer) { return map.addLayer(agsLayer); });
            var layerSwitcher = new ol3_layerswitcher_2.LayerSwitcher();
            layerSwitcher.setMap(map);
            var popup = new ol3_popup_2.Popup({
                css: "\n            .ol-popup {\n                background-color: white;\n            }\n            .ol-popup .page {\n                max-height: 200px;\n                overflow-y: auto;\n            }\n            "
            });
            map.addOverlay(popup);
            map.on("click", function (event) {
                console.log("click");
                var coord = event.coordinate;
                popup.hide();
                var pageNum = 0;
                map.forEachFeatureAtPixel(event.pixel, function (feature, layer) {
                    var page = document.createElement('p');
                    var keys = Object.keys(feature.getProperties()).filter(function (key) {
                        var v = feature.get(key);
                        if (typeof v === "string")
                            return true;
                        if (typeof v === "number")
                            return true;
                        return false;
                    });
                    page.title = "" + ++pageNum;
                    page.innerHTML = "<table>" + keys.map(function (k) { return "<tr><td>" + k + "</td><td>" + feature.get(k) + "</td></tr>"; }).join("") + "</table>";
                    popup.pages.add(page, feature.getGeometry());
                });
                popup.show(coord, "<label>" + pageNum + " Features Found</label>");
                popup.pages.goto(0);
            });
        });
        return map;
    }
    exports.run = run;
});
define("ol3-lab/labs/polyline-encoder", ["require", "exports", "jquery", "openlayers", "ol3-lab/labs/common/ol3-polyline", "ol3-lab/labs/common/google-polyline"], function (require, exports, $, ol, PolylineEncoder, GoogleEncoder) {
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
define("bower_components/ol3-symbolizer/ol3-symbolizer/styles/star/flower", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "star": {
                "fill": {
                    "color": "rgba(106,9,251,0.7)"
                },
                "opacity": 1,
                "stroke": {
                    "color": "rgba(42,128,244,0.8)",
                    "width": 8
                },
                "radius": 14,
                "radius2": 9,
                "points": 10
            },
            "text": {
                "fill": {
                    "color": "rgba(255,255,255,1)"
                },
                "stroke": {
                    "color": "rgba(0,0,0,1)",
                    "width": 2
                },
                "text": "Test",
                "offset-x": 0,
                "offset-y": 20,
                "font": "18px fantasy"
            }
        }
    ];
});
define("ol3-lab/labs/popup", ["require", "exports", "jquery", "openlayers", "ol3-lab/labs/common/common", "bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer", "bower_components/ol3-symbolizer/ol3-symbolizer/styles/star/flower", "bower_components/ol3-popup/ol3-popup"], function (require, exports, $, ol, common_7, ol3_symbolizer_5, pointStyle, ol3_popup_3) {
    "use strict";
    var styler = new ol3_symbolizer_5.StyleConverter();
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
    var html = "\n<div class='popup'>\n    <div class='popup-container'>\n    </div>\n</div>\n";
    var css = "\n<style name=\"popup\" type=\"text/css\">\n    html, body, .map {\n        width: 100%;\n        height: 100%;\n        padding: 0;\n        overflow: hidden;\n        margin: 0;    \n    }\n    .popup-container {\n        position: absolute;\n        top: 1em;\n        right: 0.5em;\n        width: 10em;\n        bottom: 1em;\n        z-index: 1;\n        pointer-events: none;\n    }\n    .popup-container .ol-popup.docked {\n        min-width: auto;\n    }\n</style>\n";
    var css_popup = "\n.ol-popup {\n    color: white;\n    background-color: rgba(77,77,77,0.7);\n    border: 1px solid white;\n    min-width: 200px;\n    padding: 12px;\n}\n\n.ol-popup:after {\n    border-top-color: white;\n}\n";
    function run() {
        $(html).appendTo(".map");
        $(css).appendTo("head");
        var options = {
            srs: 'EPSG:4326',
            center: [-82.4, 34.85],
            zoom: 15,
            basemap: "bing"
        };
        {
            var opts_6 = options;
            Object.keys(opts_6).forEach(function (k) {
                common_7.doif(common_7.getParameterByName(k), function (v) {
                    var value = parse(v, opts_6[k]);
                    if (value !== undefined)
                        opts_6[k] = value;
                });
            });
        }
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
                })
            ]
        });
        var features = new ol.Collection();
        var source = new ol.source.Vector({
            features: features
        });
        var layer = new ol.layer.Vector({
            source: source,
            style: function (feature, resolution) {
                var style = pointStyle.filter(function (p) { return p.text; })[0];
                if (style) {
                    style.text["offset-y"] = -24;
                    style.text.text = feature.getGeometry().get("location") || "unknown location";
                }
                return pointStyle.map(function (s) { return styler.fromJson(s); });
            }
        });
        map.addLayer(layer);
        var popup = new ol3_popup_3.Popup({
            dockContainer: '.popup-container',
            pointerPosition: 100,
            positioning: "bottom-left",
            yOffset: 20,
            css: css_popup
        });
        popup.setMap(map);
        map.on("click", function (event) {
            var location = event.coordinate.map(function (v) { return v.toFixed(5); }).join(", ");
            var point = new ol.geom.Point(event.coordinate);
            point.set("location", location);
            var feature = new ol.Feature(point);
            source.addFeature(feature);
            setTimeout(function () { return popup.show(event.coordinate, "<div>You clicked on " + location + "</div>"); }, 50);
        });
        return map;
    }
    exports.run = run;
});
define("ol3-lab/labs/route-editor", ["require", "exports", "openlayers", "bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer", "ol3-lab/labs/common/common"], function (require, exports, ol, ol3_symbolizer_6, common_8) {
    "use strict";
    var delta = 16;
    var formatter = new ol3_symbolizer_6.StyleConverter();
    function fromJson(styles) {
        return styles.map(function (style) { return formatter.fromJson(style); });
    }
    function asPoint(pt) {
        return pt.getGeometry().getFirstCoordinate();
    }
    var defaultLineStyle = function (color) { return [
        {
            "stroke": {
                "color": color,
                "width": 4
            }
        }, {
            "stroke": {
                "color": "white",
                "width": 1
            }
        }
    ]; };
    var Route = (function () {
        function Route(options) {
            this.options = common_8.defaults(options, {
                color: "black",
                delta: delta,
                stops: [],
                showLines: true,
                modifyRoute: false,
                modifyStartLocation: true,
                modifyFinishLocation: true,
                lineStyle: defaultLineStyle(options.color || "black")
            });
            this.create();
        }
        Object.defineProperty(Route.prototype, "delta", {
            get: function () {
                return this.options.delta;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Route.prototype, "start", {
            get: function () {
                return this.startLocation && asPoint(this.startLocation);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Route.prototype, "finish", {
            get: function () {
                return this.finishLocation && asPoint(this.finishLocation);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Route.prototype, "route", {
            get: function () {
                return this.routeLine.getGeometry().getCoordinates();
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Route.prototype, "stops", {
            get: function () {
                return this.routeStops.map(asPoint);
            },
            enumerable: true,
            configurable: true
        });
        Route.prototype.create = function () {
            var _this = this;
            var _a = [this.options.color, this.options.start, this.options.finish, this.options.stops], color = _a[0], start = _a[1], finish = _a[2], stops = _a[3];
            if (this.options.showLines) {
                var feature = this.routeLine = new ol.Feature(new ol.geom.LineString(stops));
                feature.set("color", color);
                feature.setStyle(fromJson(this.options.lineStyle));
            }
            var points = this.routeStops = stops.map(function (p) { return new ol.Feature(new ol.geom.Point(p)); });
            if (start) {
                var startingLocation = this.startLocation = new ol.Feature(new ol.geom.Point(start));
                startingLocation.on("change:geometry", function () {
                    console.log("moved start location");
                });
                startingLocation.set("color", color);
                startingLocation.set("text", "A");
                startingLocation.setStyle(fromJson([
                    {
                        "circle": {
                            "fill": {
                                "color": "transparent"
                            },
                            "opacity": 0.5,
                            "stroke": {
                                "color": "green",
                                "width": 5
                            },
                            "radius": this.delta
                        }
                    },
                    {
                        "circle": {
                            "fill": {
                                "color": "transparent"
                            },
                            "opacity": 1,
                            "stroke": {
                                "color": "white",
                                "width": 1
                            },
                            "radius": this.delta
                        }
                    }
                ]));
            }
            if (finish) {
                var endingLocation = this.finishLocation = new ol.Feature(new ol.geom.Point(finish));
                endingLocation.set("color", color);
                endingLocation.set("text", "Z");
                endingLocation.setStyle(fromJson([
                    {
                        "star": {
                            "fill": {
                                "color": "transparent"
                            },
                            "opacity": 1,
                            "stroke": {
                                "color": "red",
                                "width": 5
                            },
                            "radius": this.delta * 0.75,
                            "points": 8,
                            "angle": 0.39
                        }
                    },
                    {
                        "star": {
                            "fill": {
                                "color": "transparent"
                            },
                            "opacity": 1,
                            "stroke": {
                                "color": "white",
                                "width": 1
                            },
                            "radius": this.delta * 0.75,
                            "points": 8,
                            "angle": 0.39
                        }
                    },
                    {
                        "circle": {
                            "fill": {
                                "color": color
                            },
                            "opacity": 0.5,
                            "stroke": {
                                "color": color,
                                "width": 1
                            },
                            "radius": 5
                        }
                    }
                ]));
            }
            points.forEach(function (p, stopIndex) {
                p.set("color", color);
                p.set("text", (1 + stopIndex) + "");
                p.setStyle(function (res) { return [
                    new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: _this.delta,
                            fill: new ol.style.Fill({
                                color: p.get("color")
                            })
                        })
                    }),
                    new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: _this.delta - 2,
                            stroke: new ol.style.Stroke({
                                color: "white",
                                width: 1
                            })
                        })
                    }),
                    new ol.style.Style({
                        text: new ol.style.Text({
                            font: _this.delta * 0.75 + "pt Segoe UI",
                            text: p.get("text"),
                            fill: new ol.style.Fill({
                                color: "white"
                            }),
                            stroke: new ol.style.Stroke({
                                color: "black",
                                width: 1
                            })
                        })
                    })
                ]; });
            });
        };
        Route.prototype.isNewVertex = function () {
            var lineSegmentCount = this.route.length;
            this.start && lineSegmentCount--;
            this.finish && lineSegmentCount--;
            var stopCount = this.routeStops.length;
            return stopCount < lineSegmentCount;
        };
        Route.prototype.owns = function (feature) {
            return this.routeLine && feature === this.routeLine;
        };
        Route.prototype.allowModify = function (collection) {
            if (this.options.showLines) {
                collection.push(this.routeLine);
            }
        };
        Route.prototype.appendTo = function (layer) {
            this.routeLine && layer.getSource().addFeatures([this.routeLine]);
            this.startLocation && layer.getSource().addFeature(this.startLocation);
            this.routeStops && layer.getSource().addFeatures(this.routeStops);
            this.finishLocation && layer.getSource().addFeature(this.finishLocation);
        };
        Route.prototype.findStop = function (map, location) {
            return this.findStops(map, location, this.stops)[0];
        };
        Route.prototype.isStartingLocation = function (map, location) {
            return !!this.start && 1 === this.findStops(map, location, [this.start]).length;
        };
        Route.prototype.isEndingLocation = function (map, location) {
            return !!this.finish && 1 === this.findStops(map, location, [this.finish]).length;
        };
        Route.prototype.findStops = function (map, location, stops) {
            var pixel = map.getPixelFromCoordinate(location);
            var _a = [pixel[0] - this.delta, pixel[1] + this.delta, pixel[0] + this.delta, pixel[1] - this.delta], x1 = _a[0], y1 = _a[1], x2 = _a[2], y2 = _a[3];
            _b = map.getCoordinateFromPixel([x1, y1]), x1 = _b[0], y1 = _b[1];
            _c = map.getCoordinateFromPixel([x2, y2]), x2 = _c[0], y2 = _c[1];
            var extent = [x1, y1, x2, y2];
            var result = [];
            stops.some(function (p, i) {
                if (ol.extent.containsCoordinate(extent, p)) {
                    result.push(i);
                    return true;
                }
            });
            return result;
            var _b, _c;
        };
        Route.prototype.removeStop = function (index) {
            var stop = this.routeStops[index];
            this.routeStops.splice(index, 1);
            return stop;
        };
        Route.prototype.addStop = function (stop, index) {
            if (index === undefined)
                this.routeStops.push(stop);
            else
                this.routeStops.splice(index, 0, stop);
        };
        Route.prototype.refresh = function (map) {
            var _this = this;
            this.routeStops.map(function (stop, index) {
                stop.set("color", _this.options.color);
                stop.set("text", (1 + index) + "");
            });
            var coords = this.stops;
            this.start && coords.unshift(this.start);
            this.finish && coords.push(this.finish);
            this.routeLine && this.routeLine.setGeometry(new ol.geom.LineString(coords));
            if (this.options.modifyRoute || this.options.modifyFinishLocation || this.options.modifyStartLocation) {
                var modify = this.modify;
                if (modify) {
                    modify.setActive(false);
                    map.removeInteraction(modify);
                }
                var features_1 = new ol.Collection();
                if (this.options.modifyStartLocation) {
                    this.startLocation && features_1.push(this.startLocation);
                }
                if (this.options.modifyFinishLocation) {
                    if (this.options.modifyStartLocation && this.startLocation && this.finishLocation) {
                        if (ol.coordinate.toStringXY(asPoint(this.startLocation), 5) === ol.coordinate.toStringXY(asPoint(this.finishLocation), 5)) {
                        }
                        else {
                            features_1.push(this.finishLocation);
                        }
                    }
                }
                if (this.options.modifyRoute) {
                    this.routeStops && this.routeStops.forEach(function (s) { return features_1.push(s); });
                }
                modify = this.modify = new ol.interaction.Modify({
                    pixelTolerance: 8,
                    features: features_1
                });
                modify.on("modifyend", function () {
                    _this.refresh(map);
                });
                map.addInteraction(modify);
            }
        };
        return Route;
    }());
    exports.Route = Route;
});
define("ol3-lab/ux/serializers/serializer", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/serializers/ags-simplemarkersymbol", ["require", "exports", "bower_components/ol3-symbolizer/ol3-symbolizer/format/ags-symbolizer"], function (require, exports, ags_symbolizer_1) {
    "use strict";
    var converter = new ags_symbolizer_1.StyleConverter();
    var SimpleMarkerConverter = (function () {
        function SimpleMarkerConverter() {
        }
        SimpleMarkerConverter.prototype.toJson = function (style) {
            throw "not-implemented";
        };
        SimpleMarkerConverter.prototype.fromJson = function (json) {
            return converter.fromJson(json);
        };
        return SimpleMarkerConverter;
    }());
    exports.SimpleMarkerConverter = SimpleMarkerConverter;
});
define("ol3-lab/labs/style-lab", ["require", "exports", "openlayers", "jquery", "bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer", "ol3-lab/labs/common/style-generator"], function (require, exports, ol, $, ol3_symbolizer_7, StyleGenerator) {
    "use strict";
    var center = [-82.4, 34.85];
    var formatter = new ol3_symbolizer_7.StyleConverter();
    var generator = new StyleGenerator({
        center: center,
        fromJson: function (json) { return formatter.fromJson(json); }
    });
    var ux = "\n<div class='style-lab'>\n    <label for='style-count'>How many styles per symbol?</label>\n    <input id='style-count' type=\"number\" value=\"1\" min=\"1\" max=\"5\"/><button id='more'>More</button>\n    <label for='style-out'>Click marker to see style here:</label>\n    <textarea id='style-out'>[\n\t{\n\t\t\"star\": {\n\t\t\t\"fill\": {\n\t\t\t\t\"color\": \"rgba(228,254,211,0.57)\"\n\t\t\t},\n\t\t\t\"opacity\": 1,\n\t\t\t\"stroke\": {\n\t\t\t\t\"color\": \"rgba(67,8,10,0.61)\",\n\t\t\t\t\"width\": 8\n\t\t\t},\n\t\t\t\"radius\": 22,\n\t\t\t\"radius2\": 16,\n\t\t\t\"points\": 11,\n\t\t\t\"angle\": 0,\n\t\t\t\"rotation\": 0\n\t\t}\n\t}\n]</textarea>\n    <label for='apply-style'>Apply this style to some of the features</label>\n    <button id='apply-style'>Apply</button>\n    <div class='area'>\n        <label>Last image clicked:</label>\n        <img class='last-image-clicked light' />\n        <img class='last-image-clicked bright' />\n        <img class='last-image-clicked dark' />\n    </div>\n<div>\n";
    var css = "\n<style>\n    html, body, .map {\n        width: 100%;\n        height: 100%;\n        padding: 0;\n        overflow: hidden;\n        margin: 0;    \n    }\n\n    .map {\n        background-color: black;\n    }\n\n    .map.dark {\n        background: black;\n    }\n\n    .map.light {\n        background: silver;\n    }\n\n    .map.bright {\n        background: white;\n    }\n\n    .style-lab {\n        padding: 20px;\n        position:absolute;\n        top: 8px;\n        left: 40px;\n        z-index: 1;\n        background-color: rgba(255, 255, 255, 0.8);\n        border: 1px solid black;\n    }\n\n    .style-lab .area {\n        padding-top: 20px;\n    }\n\n    .style-lab label {\n        display: block;\n    }\n\n    .style-lab #style-count {\n        vertical-align: top;\n    }\n\n    .style-lab #style-out {\n        font-family: cursive;\n        font-size: smaller;\n        min-width: 320px;\n        min-height: 240px;\n    }\n\n    .style-lab .dark {\n        background: black;\n    }\n\n    .style-lab .light {\n        background: silver;\n    }\n\n    .style-lab .bright {\n        background: white;\n    }\n\n</style>\n";
    function run() {
        $(ux).appendTo(".map");
        $(css).appendTo("head");
        var formatter = new ol3_symbolizer_7.StyleConverter();
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
                        if (s instanceof HTMLImageElement) {
                            $(".last-image-clicked").attr("src", s.src);
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
define("ol3-lab/tests/data/geom/polygon", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    return new ol.geom.Polygon([
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
    ]);
});
define("ol3-lab/labs/style-to-canvas", ["require", "exports", "openlayers", "jquery", "ol3-lab/labs/common/snapshot", "ol3-lab/tests/data/geom/polygon"], function (require, exports, ol, $, Snapshot, parcel) {
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
        var feature = new ol.Feature(parcel);
        feature.setStyle([style1, style2]);
        Snapshot.render(canvas, feature);
    }
    exports.run = run;
});
define("ol3-lab/ux/styles/icon/png", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "circle": {
                "fill": {
                    "gradient": {
                        "type": "linear(32,32,96,96)",
                        "stops": "rgba(0,255,0,0.1) 0%;rgba(0,255,0,0.8) 100%"
                    }
                },
                "opacity": 1,
                "stroke": {
                    "color": "rgba(0,255,0,1)",
                    "width": 1
                },
                "radius": 64
            }
        },
        {
            "image": {
                "anchor": [16, 48],
                "imgSize": [32, 48],
                "anchorXUnits": "pixels",
                "anchorYUnits": "pixels",
                "src": "http://openlayers.org/en/v3.20.1/examples/data/icon.png"
            }
        }
    ];
});
define("ol3-lab/labs/style-viewer", ["require", "exports", "openlayers", "jquery", "ol3-lab/labs/common/snapshot", "ol3-lab/labs/common/common", "bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer", "ol3-lab/ux/styles/icon/png"], function (require, exports, ol, $, Snapshot, common_9, ol3_symbolizer_8, pointStyle) {
    "use strict";
    var html = "\n<div class='style-to-canvas'>\n    <h3>Renders a feature on a canvas</h3>\n    <div class=\"area\">\n        <label>256 x 256 Canvas</label>\n        <div id='canvas-collection'></div>\n    </div>\n    <div class=\"area\">\n        <label>Style</label>\n        <textarea class='style'></textarea>\n        <button class=\"save\">Save</button>\n    </div>\n    <div class=\"area\">\n        <label>Potential control for setting linear gradient start/stop locations</label>\n        <div class=\"colorramp\">\n            <input class=\"top\" type=\"range\" min=\"0\" max=\"100\" value=\"20\"/>\n            <input class=\"bottom\" type=\"range\" min=\"0\" max=\"100\" value=\"80\"/>\n        </div>\n    </div>\n</div>\n";
    var css = "\n<style>\n    #map {\n        display: none;\n    }\n\n    .style-to-canvas {\n    }\n\n    .style-to-canvas .area label {\n        display: block;\n        vertical-align: top;\n    }\n\n    .style-to-canvas .area {\n        border: 1px solid black;\n        padding: 20px;\n        margin: 20px;\n    }\n\n    .style-to-canvas .area .style {\n        width: 100%;\n        height: 400px;\n    }\n\n    .style-to-canvas #canvas-collection canvas {\n        font-family: sans serif;\n        font-size: 20px;\n        border: 1px solid black;\n        padding: 20px;\n        margin: 20px;\n    }\n\n    div.colorramp {\n        display: inline-block;\n        background: linear-gradient(to right, rgba(250,0,0,0), rgba(250,0,0,1) 60%, rgba(250,100,0,1) 85%, rgb(250,250,0) 95%);\n        width:100%;\n    }\n\n    div.colorramp > input[type=range] {\n        -webkit-appearance: slider-horizontal;\n        display:block;\n        width:100%;\n        background-color:transparent;\n    }\n\n    div.colorramp > label {\n        display: inline-block;\n    }\n\n    div.colorramp > input[type='range'] {\n        box-shadow: 0 0 0 white;\n    }\n\n    div.colorramp > input[type=range]::-webkit-slider-runnable-track {\n        height: 0px;     \n    }\n\n    div.colorramp > input[type='range'].top::-webkit-slider-thumb {\n        margin-top: -10px;\n    }\n\n    div.colorramp > input[type='range'].bottom::-webkit-slider-thumb {\n        margin-top: -12px;\n    }\n    \n</style>\n";
    var svg = "\n<div style='display:none'>\n<svg xmlns=\"http://www.w3.org/2000/svg\">\n<symbol viewBox=\"5 0 20 15\" id=\"lock\">\n    <title>lock</title>\n    <path d=\"M10.9,11.6c-0.3-0.6-0.3-2.3,0-2.8c0.4-0.6,3.4,1.4,3.4,1.4c0.9,0.4,0.9-6.1,0-5.7\n\tc0,0-3.1,2.1-3.4,1.4c-0.3-0.7-0.3-2.1,0-2.8C11.2,2.5,15,2.4,15,2.4C15,1.7,12.1,1,10.9,1S8.4,1.1,6.8,1.8C5.2,2.4,3.9,3.4,2.7,4.6\n\tS0,8.2,0,8.9s1.5,2.8,3.7,3.7s3.3,1.1,4.5,1.3c1.1,0.1,2.6,0,3.9-0.3c1-0.2,2.9-0.7,2.9-1.1C15,12.3,11.2,12.2,10.9,11.6z M4.5,9.3\n\tC3.7,9.3,3,8.6,3,7.8s0.7-1.5,1.5-1.5S6,7,6,7.8S5.3,9.3,4.5,9.3z\"\n    />\n</symbol>\n<symbol viewBox=\"0 0 37 37\" id=\"marker\">\n      <title>marker</title>\n      <path d=\"M19.75 2.75 L32.47792206135786 7.022077938642145 L36.75 19.75 L32.47792206135786 32.47792206135786 L19.75 36.75 L7.022077938642145 32.47792206135786 L2.75 19.750000000000004 L7.022077938642141 7.022077938642145 L19.749999999999996 2.75 Z\" /> </symbol>\n</svg>\n</div>\n";
    function loadStyle(name) {
        var d = $.Deferred();
        if ('[' === name[0]) {
            d.resolve(JSON.parse(name));
        }
        else {
            var mids = name.split(",").map(function (name) { return "../ux/styles/" + name; });
            require(mids, function () {
                var styles = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    styles[_i] = arguments[_i];
                }
                var style = [];
                styles.forEach(function (s) { return style = style.concat(s); });
                d.resolve(style);
            });
        }
        return d;
    }
    function loadGeom(name) {
        var mids = name.split(",").map(function (name) { return "../tests/data/geom/" + name; });
        var d = $.Deferred();
        require(mids, function () {
            var geoms = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                geoms[_i] = arguments[_i];
            }
            d.resolve(geoms);
        });
        return d;
    }
    var styles = {
        point: pointStyle
    };
    var serializer = new ol3_symbolizer_8.StyleConverter();
    var Renderer = (function () {
        function Renderer(geom) {
            this.feature = new ol.Feature(geom);
            this.canvas = this.createCanvas();
        }
        Renderer.prototype.createCanvas = function (size) {
            if (size === void 0) { size = 256; }
            var canvas = document.createElement("canvas");
            canvas.width = canvas.height = size;
            return canvas;
        };
        Renderer.prototype.draw = function (styles) {
            var canvas = this.canvas;
            var feature = this.feature;
            var style = styles.map(function (style) { return serializer.fromJson(style); });
            feature.setStyle(style);
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            Snapshot.render(canvas, feature);
        };
        return Renderer;
    }());
    function run() {
        $(html).appendTo("body");
        $(svg).appendTo("body");
        $(css).appendTo("head");
        var geom = common_9.getParameterByName("geom") || "polygon-with-holes";
        var style = common_9.getParameterByName("style") || "fill/gradient";
        $(".save").click(function () {
            var style = JSON.stringify(JSON.parse($(".style").val()));
            var loc = window.location;
            var url = "" + loc.origin + loc.pathname + "?run=labs/style-viewer&geom=" + geom + "&style=" + encodeURI(style);
            loc.replace(url);
        });
        loadStyle(style).then(function (styles) {
            loadGeom(geom).then(function (geoms) {
                var style = JSON.stringify(styles, null, ' ');
                $(".style").val(style);
                var renderers = geoms.map(function (g) { return new Renderer(g); });
                renderers.forEach(function (r) { return $(r.canvas).appendTo("#canvas-collection"); });
                setInterval(function () {
                    try {
                        var style_1 = JSON.parse($(".style").val());
                        renderers.forEach(function (r) { return r.draw(style_1); });
                    }
                    catch (ex) {
                    }
                }, 2000);
            });
        });
    }
    exports.run = run;
});
define("ol3-lab/labs/svg", ["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    var html = "\n<div\n    class=\"clear-margin-mobile space-left4 clearfix mobile-cols\"\n    data-reactid=\".0.1.0.1.0\">\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$airfield\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$airfield.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$airfield.0.0\">airfield</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$airfield.0.1\"></rect>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M6.8182,0.6818H4.7727  C4.0909,0.6818,4.0909,0,4.7727,0h5.4545c0.6818,0,0.6818,0.6818,0,0.6818H8.1818c0,0,0.8182,0.5909,0.8182,1.9545V4h6v2L9,8l-0.5,5  l2.5,1.3182V15H4v-0.6818L6.5,13L6,8L0,6V4h6V2.6364C6,1.2727,6.8182,0.6818,6.8182,0.6818z\"\n                data-reactid=\".0.1.0.1.0.$airfield.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$airport\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$airport.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$airport.0.0\">airport</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$airport.0.1\"></rect>\n            <path\n                fill=\"#56b881\"\n                transform=\"translate(0 0)\"\n                d=\"M15,6.8182L15,8.5l-6.5-1  l-0.3182,4.7727L11,14v1l-3.5-0.6818L4,15v-1l2.8182-1.7273L6.5,7.5L0,8.5V6.8182L6.5,4.5v-3c0,0,0-1.5,1-1.5s1,1.5,1,1.5v2.8182  L15,6.8182z\"\n                data-reactid=\".0.1.0.1.0.$airport.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$heliport\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$heliport.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$heliport.0.0\">heliport</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$heliport.0.1\"></rect>\n            <path\n                fill=\"#34a9ca\"\n                transform=\"translate(0 0)\"\n                d=\"M4,2C3,2,3,3,4,3h4v1C7.723,4,7.5,4.223,7.5,4.5V5H5H3.9707H3.9316  C3.7041,4.1201,2.9122,3.5011,2,3.5c-1.1046,0-2,0.8954-2,2s0.8954,2,2,2c0.3722-0.001,0.7368-0.1058,1.0527-0.3027L5.5,10.5  C6.5074,11.9505,8.3182,12,9,12h5c0,0,1,0,1-1v-0.9941C15,9.2734,14.874,8.874,14.5,8.5l-3-3c0,0-0.5916-0.5-1.2734-0.5H9.5V4.5  C9.5,4.223,9.277,4,9,4V3h4c1,0,1-1,0-1C13,2,4,2,4,2z M2,4.5c0.5523,0,1,0.4477,1,1s-0.4477,1-1,1s-1-0.4477-1-1  C1,4.9477,1.4477,4.5,2,4.5z M10,6c0.5,0,0.7896,0.3231,1,0.5L13.5,9H10c0,0-1,0-1-1V7C9,7,9,6,10,6z\"\n                data-reactid=\".0.1.0.1.0.$heliport.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$rocket\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$rocket.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$rocket.0.0\">rocket</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$rocket.0.1\"></rect>\n            <path\n                fill=\"#ff9933\"\n                transform=\"translate(0 0)\"\n                d=\"M12.5547,1c-2.1441,0-5.0211,1.471-6.9531,4H4  C2.8427,5,2.1794,5.8638,1.7227,6.7773L1.1113,8h1.4434H4l1.5,1.5L7,11v1.4453v1.4434l1.2227-0.6113  C9.1362,12.8206,10,12.1573,10,11V9.3984c2.529-1.932,4-4.809,4-6.9531V1H12.5547z M10,4c0.5523,0,1,0.4477,1,1l0,0  c0,0.5523-0.4477,1-1,1l0,0C9.4477,6,9,5.5523,9,5v0C9,4.4477,9.4477,4,10,4L10,4z M3.5,10L3,10.5C2.2778,11.2222,2,13,2,13  s1.698-0.198,2.5-1L5,11.5L3.5,10z\"\n                data-reactid=\".0.1.0.1.0.$rocket.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$mountain\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$mountain.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$mountain.0.0\">mountain</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$mountain.0.1\"></rect>\n            <path\n                fill=\"#8a8acb\"\n                transform=\"translate(0 0)\"\n                d=\"M7.5,2C7.2,2,7.1,2.2,6.9,2.4  l-5.8,9.5C1,12,1,12.2,1,12.3C1,12.8,1.4,13,1.7,13h11.6c0.4,0,0.7-0.2,0.7-0.7c0-0.2,0-0.2-0.1-0.4L8.2,2.4C8,2.2,7.8,2,7.5,2z   M7.5,3.5L10.8,9H10L8.5,7.5L7.5,9l-1-1.5L5,9H4.1L7.5,3.5z\"\n                data-reactid=\".0.1.0.1.0.$mountain.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$volcano\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$volcano.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$volcano.0.0\">volcano</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$volcano.0.1\"></rect>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M8.4844,1.0002  c-0.1464,0.005-0.2835,0.0731-0.375,0.1875L6.4492,3.2619L4.8438,1.7385C4.4079,1.3374,3.7599,1.893,4.0899,2.385l1.666,2.4004  C5.9472,5.061,6.3503,5.0737,6.5586,4.8108C6.7249,4.6009,7,4.133,7.5,4.133s0.7929,0.4907,0.9414,0.6777  c0.175,0.2204,0.4973,0.2531,0.7129,0.0723l1.668-1.4004c0.4408-0.3741,0.0006-1.0735-0.5273-0.8379L9,3.2268V1.5002  C9.0002,1.2179,8.7666,0.9915,8.4844,1.0002L8.4844,1.0002z M5,6.0002L2.0762,11.924C1.9993,12.0009,2,12.155,2,12.3088  c0,0.5385,0.3837,0.6914,0.6914,0.6914h9.6172c0.3846,0,0.6914-0.153,0.6914-0.6914c0-0.1538,0.0008-0.2309-0.0762-0.3848L10,6.0002  c-0.5,0-1,0.5-1,1v0.5c0,0.277-0.223,0.5-0.5,0.5S8,7.7772,8,7.5002v-0.5c0-0.2761-0.2238-0.5-0.5-0.5S7,6.7241,7,7.0002v2  c0,0.277-0.223,0.5-0.5,0.5S6,9.2772,6,9.0002v-2C6,6.5002,5.5,6.0002,5,6.0002z\"\n                data-reactid=\".0.1.0.1.0.$volcano.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$bakery\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$bakery.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$bakery.0.0\">bakery</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$bakery.0.1\"></rect>\n            <path\n                fill=\"#56b881\"\n                transform=\"translate(0 0)\"\n                d=\"M5.2941,4.3824L6,9.5  c0,0,0,1,1,1h1c1,0,1-1,1-1l0.7059-5.1176C9.7059,3,7.5,3,7.5,3S5.291,3,5.2941,4.3824z M3.5,5C2,5,2,6,2,6l1,4h1.5  c0.755,0,0.7941-0.7647,0.7941-0.7647L4.5,5H3.5z M1.5,7.5c0,0-0.6176-0.0294-1.0588,0.4118C0,8.3529,0,8.7941,0,8.7941V11h0.8824  C2,11,2,10,2,10L1.5,7.5z\"\n                data-reactid=\".0.1.0.1.0.$bakery.0.5:$0\"></path>\n            <path\n                fill=\"#56b881\"\n                transform=\"translate(0 0)\"\n                d=\"M11.5,5C13,5,13,6,13,6l-1,4h-1.5  c-0.755,0-0.7941-0.7647-0.7941-0.7647L10.5,5H11.5z M13.5,7.5c0,0,0.6176-0.0294,1.0588,0.4118C15,8.3529,15,8.7941,15,8.7941V11  h-0.8824C13,11,13,10,13,10L13.5,7.5z\"\n                data-reactid=\".0.1.0.1.0.$bakery.0.5:$1\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$bar\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$bar.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$bar.0.0\">bar</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$bar.0.1\"></rect>\n            <path\n                fill=\"#34a9ca\"\n                transform=\"translate(0 0)\"\n                d=\"M7.5,1c-2,0-7,0.25-6.5,0.75L7,8v4  c0,1-3,0.5-3,2h7c0-1.5-3-1-3-2V8l6-6.25C14.5,1.25,9.5,1,7.5,1z M7.5,2c2.5,0,4.75,0.25,4.75,0.25L11.5,3h-8L2.75,2.25  C2.75,2.25,5,2,7.5,2z\"\n                data-reactid=\".0.1.0.1.0.$bar.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$beer\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$beer.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$beer.0.0\">beer</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$beer.0.1\"></rect>\n            <path\n                fill=\"#ff9933\"\n                transform=\"translate(0 0)\"\n                d=\"M12,5V2c0,0-1-1-4.5-1S3,2,3,2v3c0.0288,1.3915,0.3706,2.7586,1,4c0.6255,1.4348,0.6255,3.0652,0,4.5c0,0,0,1,3.5,1  s3.5-1,3.5-1c-0.6255-1.4348-0.6255-3.0652,0-4.5C11.6294,7.7586,11.9712,6.3915,12,5z M7.5,13.5  c-0.7966,0.035-1.5937-0.0596-2.36-0.28c0.203-0.7224,0.304-1.4696,0.3-2.22h4.12c-0.004,0.7504,0.097,1.4976,0.3,2.22  C9.0937,13.4404,8.2966,13.535,7.5,13.5z M7.5,5C6.3136,5.0299,5.1306,4.8609,4,4.5v-2C5.131,2.1411,6.3137,1.9722,7.5,2  C8.6863,1.9722,9.869,2.1411,11,2.5v2C9.8694,4.8609,8.6864,5.0299,7.5,5z\"\n                data-reactid=\".0.1.0.1.0.$beer.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$cafe\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$cafe.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$cafe.0.0\">cafe</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$cafe.0.1\"></rect>\n            <path\n                fill=\"#8a8acb\"\n                transform=\"translate(0 0)\"\n                d=\"M12,5h-2V3H2v4c0.0133,2.2091,1.8149,3.9891,4.024,3.9758C7.4345,10.9673,8.7362,10.2166,9.45,9H12c1.1046,0,2-0.8954,2-2  S13.1046,5,12,5z M12,8H9.86C9.9487,7.6739,9.9958,7.3379,10,7V6h2c0.5523,0,1,0.4477,1,1S12.5523,8,12,8z M10,12.5  c0,0.2761-0.2239,0.5-0.5,0.5h-7C2.2239,13,2,12.7761,2,12.5S2.2239,12,2.5,12h7C9.7761,12,10,12.2239,10,12.5z\"\n                data-reactid=\".0.1.0.1.0.$cafe.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$fast-food\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$fast-food.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$fast-food.0.0\">fast-food</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$fast-food.0.1\"></rect>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M14,8c0,0.5523-0.4477,1-1,1H2C1.4477,9,1,8.5523,1,8s0.4477-1,1-1h11C13.5523,7,14,7.4477,14,8z M3.5,10H2  c0,1.6569,1.3431,3,3,3h5c1.6569,0,3-1.3431,3-3H3.5z M3,6H2V4c0-1.1046,0.8954-2,2-2h7c1.1046,0,2,0.8954,2,2v2H3z M11,4.5  C11,4.7761,11.2239,5,11.5,5S12,4.7761,12,4.5S11.7761,4,11.5,4S11,4.2239,11,4.5z M9,3.5C9,3.7761,9.2239,4,9.5,4S10,3.7761,10,3.5  S9.7761,3,9.5,3S9,3.2239,9,3.5z M7,4.5C7,4.7761,7.2239,5,7.5,5S8,4.7761,8,4.5S7.7761,4,7.5,4S7,4.2239,7,4.5z M5,3.5  C5,3.7761,5.2239,4,5.5,4S6,3.7761,6,3.5S5.7761,3,5.5,3S5,3.2239,5,3.5z M3,4.5C3,4.7761,3.2239,5,3.5,5S4,4.7761,4,4.5  S3.7761,4,3.5,4S3,4.2239,3,4.5z\"\n                data-reactid=\".0.1.0.1.0.$fast-food.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$ice-cream\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$ice-cream.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$ice-cream.0.0\">ice-cream</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$ice-cream.0.1\"></rect>\n            <path\n                fill=\"#56b881\"\n                transform=\"translate(0 0)\"\n                d=\"M5.44,8.17c0.7156,0.0006,1.414-0.2194,2-0.63C7.9037,7.8634,8.4391,8.0693,9,8.14h0.44L8,13.7  c-0.1082,0.2541-0.4019,0.3723-0.656,0.264C7.2252,13.9134,7.1306,13.8188,7.08,13.7L5.44,8.17z\"\n                data-reactid=\".0.1.0.1.0.$ice-cream.0.5:$0\"></path>\n            <path\n                fill=\"#56b881\"\n                transform=\"translate(0 0)\"\n                d=\"M11.44,4.67c0,1.1046-0.8954,2-2,2s-2-0.8954-2-2l0,0l0,0l0,0c0,1.1046-0.8954,2-2,2s-2-0.8954-2-2s0.8954-2,2-2h0.12  C5.1756,1.6345,5.7035,0.4834,6.739,0.099s2.1866,0.1435,2.571,1.179c0.1667,0.449,0.1667,0.9429,0,1.3919h0.13  C10.5446,2.67,11.44,3.5654,11.44,4.67z\"\n                data-reactid=\".0.1.0.1.0.$ice-cream.0.5:$1\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$restaurant\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$restaurant.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$restaurant.0.0\">restaurant</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$restaurant.0.1\"></rect>\n            <path\n                fill=\"#34a9ca\"\n                transform=\"translate(0 0)\"\n                d=\"M3.5,0l-1,5.5c-0.1464,0.805,1.7815,1.181,1.75,2L4,14c-0.0384,0.9993,1,1,1,1s1.0384-0.0007,1-1L5.75,7.5  c-0.0314-0.8176,1.7334-1.1808,1.75-2L6.5,0H6l0.25,4L5.5,4.5L5.25,0h-0.5L4.5,4.5L3.75,4L4,0H3.5z M12,0  c-0.7364,0-1.9642,0.6549-2.4551,1.6367C9.1358,2.3731,9,4.0182,9,5v2.5c0,0.8182,1.0909,1,1.5,1L10,14c-0.0905,0.9959,1,1,1,1  s1,0,1-1V0z\"\n                data-reactid=\".0.1.0.1.0.$restaurant.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$college\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$college.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$college.0.0\">college</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$college.0.1\"></rect>\n            <path\n                fill=\"#ff9933\"\n                transform=\"translate(0 0)\"\n                d=\"M7.5,1L0,4.5l2,0.9v1.7C1.4,7.3,1,7.9,1,8.5s0.4,1.2,1,1.4V10l-0.9,2.1  C0.8,13,1,14,2.5,14s1.7-1,1.4-1.9L3,10c0.6-0.3,1-0.8,1-1.5S3.6,7.3,3,7.1V5.9L7.5,8L15,4.5L7.5,1z M11.9,7.5l-4.5,2L5,8.4v0.1  c0,0.7-0.3,1.3-0.8,1.8l0.6,1.4v0.1C4.9,12.2,5,12.6,4.9,13c0.7,0.3,1.5,0.5,2.5,0.5c3.3,0,4.5-2,4.5-3L11.9,7.5L11.9,7.5z\"\n                data-reactid=\".0.1.0.1.0.$college.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$school\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$school.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$school.0.0\">school</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$school.0.1\"></rect>\n            <path\n                fill=\"#8a8acb\"\n                transform=\"translate(0 0)\"\n                d=\"M11,13v-1h2v-1H9.5v-1H13V9h-2V8h2V7h-2V6h2V5H9.5V4H13V3h-2V2h2V1H8v13h5v-1H11z M6,11H2V1h4V11z M6,12l-2,2l-2-2H6z\"\n                data-reactid=\".0.1.0.1.0.$school.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$alcohol-shop\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$alcohol-shop.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$alcohol-shop.0.0\">alcohol-shop</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$alcohol-shop.0.1\"></rect>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M14,4h-4v3.44l0,0c0,0,0,0,0,0.06c0.003,0.9096,0.6193,1.7026,1.5,1.93V13H11c-0.2761,0-0.5,0.2239-0.5,0.5  S10.7239,14,11,14h2c0.2761,0,0.5-0.2239,0.5-0.5S13.2761,13,13,13h-0.5V9.43c0.8807-0.2274,1.497-1.0204,1.5-1.93c0,0,0,0,0-0.06  l0,0V4z M13,7.5c0,0.5523-0.4477,1-1,1s-1-0.4477-1-1V5h2V7.5z M5.5,2.5V2C5.7761,2,6,1.7761,6,1.5S5.7761,1,5.5,1V0.5  C5.5,0.2239,5.2761,0,5,0H4C3.7239,0,3.5,0.2239,3.5,0.5V1C3.2239,1,3,1.2239,3,1.5S3.2239,2,3.5,2v0.5C3.5,3.93,1,5.57,1,7v6  c0,0.5523,0.4477,1,1,1h5c0.5318-0.0465,0.9535-0.4682,1-1V7C8,5.65,5.5,3.85,5.5,2.5z M4.5,12C3.1193,12,2,10.8807,2,9.5  S3.1193,7,4.5,7S7,8.1193,7,9.5S5.8807,12,4.5,12z\"\n                data-reactid=\".0.1.0.1.0.$alcohol-shop.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$amusement-park\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$amusement-park.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$amusement-park.0.0\">amusement-park</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$amusement-park.0.1\"></rect>\n            <path\n                fill=\"#56b881\"\n                transform=\"translate(0 0)\"\n                d=\"M7.5,0C3.919,0,1,2.919,1,6.5c0,2.3161,1.2251,4.3484,3.0566,5.5H4l-1,2h9l-1-2h-0.0566  C12.7749,10.8484,14,8.8161,14,6.5C14,2.919,11.081,0,7.5,0z M7.375,1.5059v3.5c-0.3108,0.026-0.6057,0.1482-0.8438,0.3496  L4.0566,2.8809C4.9243,2.0555,6.0851,1.5376,7.375,1.5059z M7.625,1.5059c1.2899,0.0317,2.4507,0.5496,3.3184,1.375L8.4688,5.3555  c-0.0007-0.0007-0.0013-0.0013-0.002-0.002C8.229,5.1532,7.9348,5.0317,7.625,5.0059V1.5059z M3.8809,3.0566l2.4746,2.4746  c-0.0007,0.0007-0.0013,0.0013-0.002,0.002C6.1532,5.771,6.0317,6.0652,6.0059,6.375h-3.5  C2.5376,5.0851,3.0555,3.9243,3.8809,3.0566z M11.1191,3.0566c0.8254,0.8676,1.3433,2.0285,1.375,3.3184h-3.5  c-0.026-0.3108-0.1482-0.6057-0.3496-0.8438L11.1191,3.0566z M2.5059,6.625h3.5c0.026,0.3108,0.1482,0.6057,0.3496,0.8438  L3.8809,9.9434C3.0555,9.0757,2.5376,7.9149,2.5059,6.625z M8.9941,6.625h3.5c-0.0317,1.2899-0.5496,2.4507-1.375,3.3184  L8.6445,7.4688c0.0007-0.0007,0.0013-0.0013,0.002-0.002C8.8468,7.229,8.9683,6.9348,8.9941,6.625z M6.5312,7.6445  c0.0007,0.0007,0.0013,0.0013,0.002,0.002C6.6716,7.7624,6.8297,7.8524,7,7.9121v3.5625c-1.1403-0.1124-2.1606-0.6108-2.9434-1.3555  L6.5312,7.6445z M8.4688,7.6445l2.4746,2.4746c-0.7828,0.7447-1.803,1.243-2.9434,1.3555V7.9121  C8.1711,7.852,8.33,7.7613,8.4688,7.6445z\"\n                data-reactid=\".0.1.0.1.0.$amusement-park.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$aquarium\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$aquarium.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$aquarium.0.0\">aquarium</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$aquarium.0.1\"></rect>\n            <path\n                fill=\"#34a9ca\"\n                transform=\"translate(0 0)\"\n                d=\"M10.9,11.6c-0.3-0.6-0.3-2.3,0-2.8c0.4-0.6,3.4,1.4,3.4,1.4c0.9,0.4,0.9-6.1,0-5.7  c0,0-3.1,2.1-3.4,1.4c-0.3-0.7-0.3-2.1,0-2.8C11.2,2.5,15,2.4,15,2.4C15,1.7,12.1,1,10.9,1S8.4,1.1,6.8,1.8C5.2,2.4,3.9,3.4,2.7,4.6  S0,8.2,0,8.9s1.5,2.8,3.7,3.7s3.3,1.1,4.5,1.3c1.1,0.1,2.6,0,3.9-0.3c1-0.2,2.9-0.7,2.9-1.1C15,12.3,11.2,12.2,10.9,11.6z M4.5,9.3  C3.7,9.3,3,8.6,3,7.8s0.7-1.5,1.5-1.5S6,7,6,7.8S5.3,9.3,4.5,9.3z\"\n                data-reactid=\".0.1.0.1.0.$aquarium.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$art-gallery\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$art-gallery.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$art-gallery.0.0\">art-gallery</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$art-gallery.0.1\"></rect>\n            <path\n                fill=\"#ff9933\"\n                transform=\"translate(0 0)\"\n                d=\"M10.71,4L7.85,1.15C7.6555,0.9539,7.339,0.9526,7.1429,1.1471C7.1419,1.1481,7.141,1.149,7.14,1.15L4.29,4H1.5  C1.2239,4,1,4.2239,1,4.5v9C1,13.7761,1.2239,14,1.5,14h12c0.2761,0,0.5-0.2239,0.5-0.5v-9C14,4.2239,13.7761,4,13.5,4H10.71z   M7.5,2.21L9.29,4H5.71L7.5,2.21z M13,13H2V5h11V13z M5,8C4.4477,8,4,7.5523,4,7s0.4477-1,1-1s1,0.4477,1,1S5.5523,8,5,8z M12,12  H4.5L6,9l1.25,2.5L9.5,7L12,12z\"\n                data-reactid=\".0.1.0.1.0.$art-gallery.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$attraction\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$attraction.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$attraction.0.0\">attraction</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$attraction.0.1\"></rect>\n            <path\n                fill=\"#8a8acb\"\n                transform=\"translate(0 0)\"\n                d=\"M6,2C5.446,2,5.2478,2.5045,5,3L4.5,4h-2C1.669,4,1,4.669,1,5.5v5C1,11.331,1.669,12,2.5,12h10  c0.831,0,1.5-0.669,1.5-1.5v-5C14,4.669,13.331,4,12.5,4h-2L10,3C9.75,2.5,9.554,2,9,2H6z M2.5,5C2.7761,5,3,5.2239,3,5.5  S2.7761,6,2.5,6S2,5.7761,2,5.5S2.2239,5,2.5,5z M7.5,5c1.6569,0,3,1.3431,3,3s-1.3431,3-3,3s-3-1.3431-3-3S5.8431,5,7.5,5z   M7.5,6.5C6.6716,6.5,6,7.1716,6,8l0,0c0,0.8284,0.6716,1.5,1.5,1.5l0,0C8.3284,9.5,9,8.8284,9,8l0,0C9,7.1716,8.3284,6.5,7.5,6.5  L7.5,6.5z\"\n                data-reactid=\".0.1.0.1.0.$attraction.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$bank\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$bank.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$bank.0.0\">bank</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$bank.0.1\"></rect>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M1,3C0.446,3,0,3.446,0,4v7c0,0.554,0.446,1,1,1h13c0.554,0,1-0.446,1-1V4c0-0.554-0.446-1-1-1H1z M1,4h1.5  C2.7761,4,3,4.2239,3,4.5S2.7761,5,2.5,5S2,4.7761,2,4.5L1.5,5C1.7761,5,2,5.2239,2,5.5S1.7761,6,1.5,6S1,5.7761,1,5.5V4z M7.5,4  C8.8807,4,10,5.567,10,7.5l0,0C10,9.433,8.8807,11,7.5,11S5,9.433,5,7.5S6.1193,4,7.5,4z M12.5,4H14v1.5C14,5.7761,13.7761,6,13.5,6  S13,5.7761,13,5.5S13.2239,5,13.5,5L13,4.5C13,4.7761,12.7761,5,12.5,5S12,4.7761,12,4.5S12.2239,4,12.5,4z M7.5,5.5  c-0.323,0-0.5336,0.1088-0.6816,0.25h1.3633C8.0336,5.6088,7.823,5.5,7.5,5.5z M6.625,6C6.5795,6.091,6.5633,6.1711,6.5449,6.25  h1.9102C8.4367,6.1711,8.4205,6.091,8.375,6H6.625z M6.5,6.5v0.25h2V6.5H6.5z M6.5,7v0.25h2V7H6.5z M6.5,7.5v0.25h2V7.5H6.5z M6.5,8  L6.25,8.25h2L8.5,8H6.5z M6,8.5c0,0,0.0353,0.1024,0.1016,0.25H8.375L8,8.5H6z M1.5,9C1.7761,9,2,9.2239,2,9.5S1.7761,10,1.5,10  L2,10.5C2,10.2239,2.2239,10,2.5,10S3,10.2239,3,10.5S2.7761,11,2.5,11H1V9.5C1,9.2239,1.2239,9,1.5,9z M6.2383,9  C6.2842,9.0856,6.3144,9.159,6.375,9.25h2.2676C8.7092,9.1121,8.75,9,8.75,9H6.2383z M13.5,9C13.7761,9,14,9.2239,14,9.5V11h-1.5  c-0.2761,0-0.5-0.2239-0.5-0.5s0.2239-0.5,0.5-0.5s0.5,0.2239,0.5,0.5l0.5-0.5C13.2239,10,13,9.7761,13,9.5S13.2239,9,13.5,9z   M6.5664,9.5c0.0786,0.0912,0.1647,0.1763,0.2598,0.25h1.4199C8.3462,9.6727,8.4338,9.5883,8.5,9.5H6.5664z\"\n                data-reactid=\".0.1.0.1.0.$bank.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$bicycle\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$bicycle.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$bicycle.0.0\">bicycle</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$bicycle.0.1\"></rect>\n            <path\n                fill=\"#56b881\"\n                transform=\"translate(0 0)\"\n                d=\"  M7.5,2c-0.6761-0.01-0.6761,1.0096,0,1H9v1.2656l-2.8027,2.334L5.2226,4H5.5c0.6761,0.01,0.6761-1.0096,0-1h-2  c-0.6761-0.01-0.6761,1.0096,0,1h0.6523L5.043,6.375C4.5752,6.1424,4.0559,6,3.5,6C1.5729,6,0,7.5729,0,9.5S1.5729,13,3.5,13  S7,11.4271,7,9.5c0-0.6699-0.2003-1.2911-0.5293-1.8242L9.291,5.3262l0.4629,1.1602C8.7114,7.0937,8,8.2112,8,9.5  c0,1.9271,1.5729,3.5,3.5,3.5S15,11.4271,15,9.5S13.4271,6,11.5,6c-0.2831,0-0.5544,0.0434-0.8184,0.1074L10,4.4023V2.5  c0-0.2761-0.2239-0.5-0.5-0.5H7.5z M3.5,7c0.5923,0,1.1276,0.2119,1.5547,0.5527l-1.875,1.5625  c-0.5109,0.4273,0.1278,1.1945,0.6406,0.7695l1.875-1.5625C5.8835,8.674,6,9.0711,6,9.5C6,10.8866,4.8866,12,3.5,12S1,10.8866,1,9.5  S2.1133,7,3.5,7L3.5,7z M11.5,7C12.8866,7,14,8.1134,14,9.5S12.8866,12,11.5,12S9,10.8866,9,9.5c0-0.877,0.4468-1.6421,1.125-2.0879  l0.9102,2.2734c0.246,0.6231,1.1804,0.2501,0.9297-0.3711l-0.9082-2.2695C11.2009,7.0193,11.3481,7,11.5,7L11.5,7z\"\n                data-reactid=\".0.1.0.1.0.$bicycle.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$bicycle-share\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$bicycle-share.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$bicycle-share.0.0\">bicycle-share</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$bicycle-share.0.1\"></rect>\n            <path\n                fill=\"#34a9ca\"\n                transform=\"translate(0 0)\"\n                d=\"  M10,1C9.4477,1,9,1.4477,9,2c0,0.5523,0.4477,1,1,1s1-0.4477,1-1C11,1.4477,10.5523,1,10,1z M8.1445,2.9941  c-0.13,0.0005-0.2547,0.0517-0.3477,0.1426l-2.6406,2.5c-0.2256,0.2128-0.2051,0.5775,0.043,0.7637L7,7.75v2.75  c-0.01,0.6762,1.0096,0.6762,1,0v-3c0.0003-0.1574-0.0735-0.3057-0.1992-0.4004L7.0332,6.5234l1.818-1.7212l0.7484,0.9985  C9.6943,5.9265,9.8426,6.0003,10,6h1.5c0.6761,0.01,0.6761-1.0096,0-1h-1.25L9.5,4L8.9004,3.1992  C8.8103,3.0756,8.6685,3,8.5156,2.9941H8.1445z M3,7c-1.6569,0-3,1.3432-3,3s1.3431,3,3,3s3-1.3432,3-3S4.6569,7,3,7z M12,7  c-1.6569,0-3,1.3432-3,3s1.3431,3,3,3s3-1.3432,3-3S13.6569,7,12,7z M3,8c1.1046,0,2,0.8954,2,2s-0.8954,2-2,2s-2-0.8954-2-2  S1.8954,8,3,8z M12,8c1.1046,0,2,0.8954,2,2s-0.8954,2-2,2s-2-0.8954-2-2S10.8954,8,12,8z\"\n                data-reactid=\".0.1.0.1.0.$bicycle-share.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$car\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$car.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$car.0.0\">car</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$car.0.1\"></rect>\n            <path\n                fill=\"#ff9933\"\n                transform=\"translate(0 0)\"\n                d=\"M14,7c-0.004-0.6904-0.4787-1.2889-1.15-1.45l-1.39-3.24l0,0l0,0l0,0C11.3833,2.1233,11.2019,2.001,11,2H4  C3.8124,2.0034,3.6425,2.1115,3.56,2.28l0,0l0,0l0,0L2.15,5.54C1.475,5.702,0.9994,6.3059,1,7v3.5h1v1c0,0.5523,0.4477,1,1,1  s1-0.4477,1-1v-1h7v1c0,0.5523,0.4477,1,1,1s1-0.4477,1-1v-1h1V7z M4.3,3h6.4l1.05,2.5h-8.5L4.3,3z M3,9C2.4477,9,2,8.5523,2,8  s0.4477-1,1-1s1,0.4477,1,1S3.5523,9,3,9z M12,9c-0.5523,0-1-0.4477-1-1s0.4477-1,1-1s1,0.4477,1,1S12.5523,9,12,9z\"\n                data-reactid=\".0.1.0.1.0.$car.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$castle\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$castle.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$castle.0.0\">castle</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$castle.0.1\"></rect>\n            <path\n                fill=\"#8a8acb\"\n                transform=\"translate(0 0)\"\n                d=\"M11,4H4C3.4477,4,3,3.5523,3,3V0.5C3,0.2239,3.2239,0,3.5,0S4,0.2239,4,0.5V2h1V1c0-0.5523,0.4477-1,1-1s1,0.4477,1,1v1h1V1  c0-0.5523,0.4477-1,1-1s1,0.4477,1,1v1h1V0.5C11,0.2239,11.2239,0,11.5,0S12,0.2239,12,0.5V3C12,3.5523,11.5523,4,11,4z M14,14.5  c0,0.2761-0.2239,0.5-0.5,0.5h-12C1.2239,15,1,14.7761,1,14.5S1.2239,14,1.5,14H2c0.5523,0,1-0.4477,1-1c0,0,1-6,1-7  c0-0.5523,0.4477-1,1-1h5c0.5523,0,1,0.4477,1,1c0,1,1,7,1,7c0,0.5523,0.4477,1,1,1h0.5c0.2723-0.0001,0.4946,0.2178,0.5,0.49V14.5z   M9,10.5C9,9.6716,8.3284,9,7.5,9S6,9.6716,6,10.5V14h3V10.5z\"\n                data-reactid=\".0.1.0.1.0.$castle.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$cinema\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$cinema.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$cinema.0.0\">cinema</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$cinema.0.1\"></rect>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M14,7.5v2c0,0.2761-0.2239,0.5-0.5,0.5S13,9.7761,13,9.5c0,0,0.06-0.5-1-0.5h-1v2.5c0,0.2761-0.2239,0.5-0.5,0.5h-8  C2.2239,12,2,11.7761,2,11.5v-4C2,7.2239,2.2239,7,2.5,7h8C10.7761,7,11,7.2239,11,7.5V8h1c1.06,0,1-0.5,1-0.5  C13,7.2239,13.2239,7,13.5,7S14,7.2239,14,7.5z M4,3C2.8954,3,2,3.8954,2,5s0.8954,2,2,2s2-0.8954,2-2S5.1046,3,4,3z M4,6  C3.4477,6,3,5.5523,3,5s0.4477-1,1-1s1,0.4477,1,1S4.5523,6,4,6z M8.5,2C7.1193,2,6,3.1193,6,4.5S7.1193,7,8.5,7S11,5.8807,11,4.5  S9.8807,2,8.5,2z M8.5,6C7.6716,6,7,5.3284,7,4.5S7.6716,3,8.5,3S10,3.6716,10,4.5S9.3284,6,8.5,6z\"\n                data-reactid=\".0.1.0.1.0.$cinema.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$circle\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$circle.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$circle.0.0\">circle</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$circle.0.1\"></rect>\n            <path\n                fill=\"#56b881\"\n                transform=\"translate(0 0)\"\n                d=\"M14,7.5c0,3.5899-2.9101,6.5-6.5,6.5S1,11.0899,1,7.5S3.9101,1,7.5,1S14,3.9101,14,7.5z\"\n                data-reactid=\".0.1.0.1.0.$circle.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$circle-stroked\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$circle-stroked.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$circle-stroked.0.0\">circle-stroked</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$circle-stroked.0.1\"></rect>\n            <path\n                fill=\"#34a9ca\"\n                transform=\"translate(0 0)\"\n                d=\"M7.5,0C11.6422,0,15,3.3578,15,7.5S11.6422,15,7.5,15  S0,11.6422,0,7.5S3.3578,0,7.5,0z M7.5,1.6666c-3.2217,0-5.8333,2.6117-5.8333,5.8334S4.2783,13.3334,7.5,13.3334  s5.8333-2.6117,5.8333-5.8334S10.7217,1.6666,7.5,1.6666z\"\n                data-reactid=\".0.1.0.1.0.$circle-stroked.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$clothing-store\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$clothing-store.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$clothing-store.0.0\">clothing-store</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$clothing-store.0.1\"></rect>\n            <path\n                fill=\"#ff9933\"\n                transform=\"translate(0 0)\"\n                d=\"  M3.5,1L0,4v3h2.9L3,14h9V7h3V4l-3.5-3H10L7.5,5L5,1H3.5z\"\n                data-reactid=\".0.1.0.1.0.$clothing-store.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$drinking-water\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$drinking-water.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$drinking-water.0.0\">drinking-water</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$drinking-water.0.1\"></rect>\n            <path\n                fill=\"#8a8acb\"\n                transform=\"translate(0 0)\"\n                d=\"M5,1h9v3H6.5C6.2239,4,6,4.2239,6,4.5V7H3V3C3,1.8954,3.8954,1,5,1z M5.9,11.94L5.9,11.94L5.9,11.94L5.9,11.94L4.5,9  l-1.39,2.93C3.0535,12.1156,3.0166,12.3067,3,12.5c-0.0021,0.8284,0.6678,1.5017,1.4962,1.5038  C5.3246,14.0059,5.9979,13.3361,6,12.5076c0.0005-0.1946-0.0369-0.3873-0.11-0.5676H5.9z\"\n                data-reactid=\".0.1.0.1.0.$drinking-water.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$embassy\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$embassy.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$embassy.0.0\">embassy</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$embassy.0.1\"></rect>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M6.65,2C5.43,2,4.48,3.38,4.11,3.82C4.0365,3.9102,3.9975,4.0237,4,4.14v4.4C3.9884,8.7827,4.1758,8.9889,4.4185,9.0005  C4.528,9.0057,4.6355,8.9699,4.72,8.9c0.4665-0.6264,1.1589-1.0461,1.93-1.17C8.06,7.73,8.6,9,10.07,9  c0.9948-0.0976,1.9415-0.4756,2.73-1.09c0.1272-0.0934,0.2016-0.2422,0.2-0.4V2.45c0.0275-0.2414-0.1459-0.4595-0.3874-0.487  C12.5332,1.954,12.4527,1.9668,12.38,2c-0.6813,0.5212-1.4706,0.8834-2.31,1.06C8.6,3.08,8.12,2,6.65,2z M2.5,3  c-0.5523,0-1-0.4477-1-1s0.4477-1,1-1s1,0.4477,1,1S3.0523,3,2.5,3z M3,4v9.48c0,0.2761-0.2239,0.5-0.5,0.5S2,13.7561,2,13.48V4  c0-0.2761,0.2239-0.5,0.5-0.5S3,3.7239,3,4z\"\n                data-reactid=\".0.1.0.1.0.$embassy.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$fire-station\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$fire-station.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$fire-station.0.0\">fire-station</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$fire-station.0.1\"></rect>\n            <path\n                fill=\"#56b881\"\n                transform=\"translate(0 0)\"\n                d=\"M7.5,0.5L5,4.5l-1.5-2  C2.9452,3.4753,0.8036,5.7924,0.8036,8.3036C0.8036,12.002,3.8017,15,7.5,15s6.6964-2.998,6.6964-6.6964  c0-2.5112-2.1416-4.8283-2.6964-5.8036l-1.5,2L7.5,0.5z M7.5,7c0,0,2.5,2.5618,2.5,4.5c0,0.8371-0.8259,2-2.5,2S5,12.3371,5,11.5  C5,9.6283,7.5,7,7.5,7z\"\n                data-reactid=\".0.1.0.1.0.$fire-station.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$fuel\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$fuel.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$fuel.0.0\">fuel</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$fuel.0.1\"></rect>\n            <path\n                fill=\"#34a9ca\"\n                transform=\"translate(0 0)\"\n                d=\"M13,6L13,6v5.5c0,0.2761-0.2239,0.5-0.5,0.5S12,11.7761,12,11.5v-2C12,8.6716,11.3284,8,10.5,8H9V2c0-0.5523-0.4477-1-1-1H2  C1.4477,1,1,1.4477,1,2v11c0,0.5523,0.4477,1,1,1h6c0.5523,0,1-0.4477,1-1V9h1.5C10.7761,9,11,9.2239,11,9.5v2  c0,0.8284,0.6716,1.5,1.5,1.5s1.5-0.6716,1.5-1.5V5c0-0.5523-0.4477-1-1-1l0,0V2.49C12.9946,2.2178,12.7723,1.9999,12.5,2  c-0.2816,0.0047-0.5062,0.2367-0.5015,0.5184C11.9987,2.5289,11.9992,2.5395,12,2.55V5C12,5.5523,12.4477,6,13,6s1-0.4477,1-1  s-0.4477-1-1-1 M8,6.5C8,6.7761,7.7761,7,7.5,7h-5C2.2239,7,2,6.7761,2,6.5v-3C2,3.2239,2.2239,3,2.5,3h5C7.7761,3,8,3.2239,8,3.5  V6.5z\"\n                data-reactid=\".0.1.0.1.0.$fuel.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$grocery\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$grocery.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$grocery.0.0\">grocery</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$grocery.0.1\"></rect>\n            <path\n                fill=\"#ff9933\"\n                transform=\"translate(0 0)\"\n                d=\"M 13.199219 1.5 C 13.199219 1.5 11.808806 1.4588 11.253906 2 C 10.720406 2.5202 10.5 2.9177 10.5 4 L 1.1992188 4 L 2.59375 8.8144531 C 2.59725 8.8217531 2.6036219 8.8287375 2.6074219 8.8359375 C 2.8418219 9.4932375 3.4545469 9.9666406 4.1855469 9.9941406 C 4.1885469 9.9954406 4.1992187 10 4.1992188 10 L 10.699219 10 L 10.699219 10.199219 C 10.699219 10.199219 10.7 10.500391 10.5 10.900391 C 10.3 11.300391 10.200391 11.5 9.4003906 11.5 L 2.9003906 11.5 C 1.9003906 11.5 1.9003906 13 2.9003906 13 L 4.0996094 13 L 4.1992188 13 L 9.0996094 13 L 9.1992188 13 L 9.3007812 13 C 10.500781 13 11.399219 12.299609 11.699219 11.599609 C 11.999219 10.899609 12 10.300781 12 10.300781 L 12 10 L 12 4 C 12 3.4764 12.228619 3 12.699219 3 L 13.25 3 C 13.6642 3 14 2.6642 14 2.25 C 14 1.8358 13.6642 1.5 13.25 1.5 L 13.199219 1.5 z M 9.1992188 13 C 8.5992188 13 8.1992188 13.4 8.1992188 14 C 8.1992188 14.6 8.5992187 15 9.1992188 15 C 9.7992187 15 10.199219 14.6 10.199219 14 C 10.199219 13.4 9.7992188 13 9.1992188 13 z M 4.1992188 13 C 3.5992188 13 3.1992188 13.4 3.1992188 14 C 3.1992188 14.6 3.5992187 15 4.1992188 15 C 4.7992188 15 5.1992188 14.6 5.1992188 14 C 5.1992188 13.4 4.7992187 13 4.1992188 13 z \"\n                data-reactid=\".0.1.0.1.0.$grocery.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$harbor\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$harbor.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$harbor.0.0\">harbor</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$harbor.0.1\"></rect>\n            <path\n                fill=\"#8a8acb\"\n                transform=\"translate(0 0)\"\n                d=\"M7.5,0C5.5,0,4,1.567,4,3.5c0.0024,1.5629,1.0397,2.902,2.5,3.3379v6.0391  c-0.9305-0.1647-1.8755-0.5496-2.6484-1.2695C2.7992,10.6273,2.002,9.0676,2.002,6.498c0.0077-0.5646-0.4531-1.0236-1.0176-1.0137  C0.4329,5.493-0.0076,5.9465,0,6.498c0,3.0029,1.0119,5.1955,2.4902,6.5723C3.9685,14.4471,5.8379,15,7.5,15  c1.6656,0,3.535-0.5596,5.0117-1.9395S14.998,9.4868,14.998,6.498c0.0648-1.3953-2.0628-1.3953-1.998,0  c0,2.553-0.7997,4.1149-1.8535,5.0996C10.3731,12.3203,9.4288,12.7084,8.5,12.875V6.8418C9.9607,6.4058,10.9986,5.0642,11,3.5  C11,1.567,9.5,0,7.5,0z M7.5,2C8.3284,2,9,2.6716,9,3.5S8.3284,5,7.5,5S6,4.3284,6,3.5S6.6716,2,7.5,2z\"\n                data-reactid=\".0.1.0.1.0.$harbor.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$information\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$information.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$information.0.0\">information</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$information.0.1\"></rect>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M7.5,1  C6.7,1,6,1.7,6,2.5S6.7,4,7.5,4S9,3.3,9,2.5S8.3,1,7.5,1z M4,5v1c0,0,2,0,2,2v2c0,2-2,2-2,2v1h7v-1c0,0-2,0-2-2V6c0-0.5-0.5-1-1-1H4  z\"\n                data-reactid=\".0.1.0.1.0.$information.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$laundry\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$laundry.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$laundry.0.0\">laundry</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$laundry.0.1\"></rect>\n            <path\n                fill=\"#56b881\"\n                transform=\"translate(0 0)\"\n                d=\"M8,1L6,3H3c0,0-1,0-1,1v9c0,1,1,1,1,1h9c0,0,1,0,1-1V2c0-1-1-1-1-1  S8,1,8,1z M8.5,2h2C10.777,2,11,2.223,11,2.5S10.777,3,10.5,3h-2C8.223,3,8,2.777,8,2.5S8.223,2,8.5,2z M7.5,6  c1.6569,0,3,1.3431,3,3s-1.3431,3-3,3s-3-1.3431-3-3S5.8431,6,7.5,6z\"\n                data-reactid=\".0.1.0.1.0.$laundry.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$library\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$library.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$library.0.0\">library</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$library.0.1\"></rect>\n            <path\n                fill=\"#34a9ca\"\n                transform=\"translate(0 0)\"\n                d=\"M7.47,4.92C7.47,4.92,5.7,3,1,3v8c4.7,0,6.47,2,6.47,2S9.3,11,14,11V3C9.3,3,7.47,4.92,7.47,4.92z M13,10  c-1.9614,0.0492-3.8727,0.6299-5.53,1.68C5.836,10.6273,3.9432,10.0459,2,10V4c3.4,0.26,4.73,1.6,4.75,1.61l0.73,0.74L8.2,5.6  c0,0,1.4-1.34,4.8-1.6V10z M8,10.24l-0.1-0.17c1.3011-0.5931,2.6827-0.9907,4.1-1.18v0.2c-1.3839,0.1953-2.7316,0.5929-4,1.18V10.24  z M8,9.24L7.9,9.07C9.2016,8.4802,10.5832,8.086,12,7.9v0.2c-1.3844,0.1988-2.7321,0.5997-4,1.19V9.24z M8,8.24L7.9,8.07  C9.2015,7.48,10.5831,7.0857,12,6.9v0.2c-1.3845,0.1981-2.7323,0.599-4,1.19V8.24z M8,7.24L7.9,7.07  C9.2013,6.4794,10.583,6.0851,12,5.9v0.2c-1.3844,0.1986-2.7321,0.5996-4,1.19V7.24z M6.9,10.24C5.6639,9.6641,4.3499,9.2733,3,9.08  v-0.2c1.3872,0.2028,2.7358,0.6141,4,1.22L6.9,10.24z M6.9,9.24C5.6629,8.671,4.3488,8.2869,3,8.1V7.9  c1.386,0.2027,2.7341,0.6105,4,1.21L6.9,9.24z M6.9,8.24C5.6631,7.6705,4.3489,7.2863,3,7.1V6.9c1.3868,0.199,2.7354,0.607,4,1.21  L6.9,8.24z M6.9,7.24C5.6629,6.671,4.3488,6.2869,3,6.1V5.9c1.386,0.2024,2.7342,0.6102,4,1.21L6.9,7.24z\"\n                data-reactid=\".0.1.0.1.0.$library.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$lodging\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$lodging.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$lodging.0.0\">lodging</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$lodging.0.1\"></rect>\n            <path\n                fill=\"#ff9933\"\n                transform=\"translate(0 0)\"\n                d=\"M0.5,2.5C0.2,2.5,0,2.7,0,3v7.5v2C0,12.8,0.2,13,0.5,13S1,12.8,1,12.5V11h13v1.5  c0,0.3,0.2,0.5,0.5,0.5s0.5-0.2,0.5-0.5v-2c0-0.3-0.2-0.5-0.5-0.5H1V3C1,2.7,0.8,2.5,0.5,2.5z M3.5,3C2.7,3,2,3.7,2,4.5l0,0  C2,5.3,2.7,6,3.5,6l0,0C4.3,6,5,5.3,5,4.5l0,0C5,3.7,4.3,3,3.5,3L3.5,3z M7,4C5.5,4,5.5,5.5,5.5,5.5V7h-3C2.2,7,2,7.2,2,7.5v1  C2,8.8,2.2,9,2.5,9H6h9V6.5C15,4,12.5,4,12.5,4H7z\"\n                data-reactid=\".0.1.0.1.0.$lodging.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$marker\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$marker.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$marker.0.0\">marker</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$marker.0.1\"></rect>\n            <path\n                fill=\"#8a8acb\"\n                transform=\"translate(0 0)\"\n                d=\"M7.5,0C5.0676,0,2.2297,1.4865,2.2297,5.2703  C2.2297,7.8378,6.2838,13.5135,7.5,15c1.0811-1.4865,5.2703-7.027,5.2703-9.7297C12.7703,1.4865,9.9324,0,7.5,0z\"\n                data-reactid=\".0.1.0.1.0.$marker.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$monument\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$monument.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$monument.0.0\">monument</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$monument.0.1\"></rect>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M7.5,0L6,2.5v7h3v-7L7.5,0z M3,11.5  L3,15h9v-3.5L10.5,10h-6L3,11.5z\"\n                data-reactid=\".0.1.0.1.0.$monument.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$museum\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$museum.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$museum.0.0\">museum</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$museum.0.1\"></rect>\n            <path\n                fill=\"#56b881\"\n                transform=\"translate(0 0)\"\n                d=\"M7.5,0L1,3.4453V4h13V3.4453L7.5,0z M2,5v5l-1,1.5547V13h13v-1.4453L13,10  V5H2z M4.6152,6c0.169-0.0023,0.3318,0.0639,0.4512,0.1836L7.5,8.6172l2.4336-2.4336c0.2445-0.2437,0.6402-0.2432,0.884,0.0013  C10.9341,6.3017,10.9997,6.46,11,6.625v4.2422c0.0049,0.3452-0.271,0.629-0.6162,0.6338c-0.3452,0.0049-0.629-0.271-0.6338-0.6162  c-0.0001-0.0059-0.0001-0.0118,0-0.0177V8.1328L7.9414,9.9414c-0.244,0.2433-0.6388,0.2433-0.8828,0L5.25,8.1328v2.7344  c0.0049,0.3452-0.271,0.629-0.6162,0.6338C4.2887,11.5059,4.0049,11.2301,4,10.8849c-0.0001-0.0059-0.0001-0.0118,0-0.0177V6.625  C4,6.2836,4.2739,6.0054,4.6152,6z\"\n                data-reactid=\".0.1.0.1.0.$museum.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$music\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$music.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$music.0.0\">music</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$music.0.1\"></rect>\n            <path\n                fill=\"#34a9ca\"\n                transform=\"translate(0 0)\"\n                d=\"M13.5,1c-0.0804,0.0008-0.1594,0.0214-0.23,0.06L4.5,3.5C4.2239,3.5,4,3.7239,4,4v6.28C3.6971,10.1002,3.3522,10.0037,3,10  c-1.1046,0-2,0.8954-2,2s0.8954,2,2,2s2-0.8954,2-2V7.36l8-2.22v3.64c-0.3029-0.1798-0.6478-0.2763-1-0.28c-1.1046,0-2,0.8954-2,2  s0.8954,2,2,2s2-0.8954,2-2v-9C14,1.2239,13.7761,1,13.5,1z M13,4.14L5,6.36v-2l8-2.22C13,2.14,13,4.14,13,4.14z\"\n                data-reactid=\".0.1.0.1.0.$music.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$place-of-worship\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$place-of-worship.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$place-of-worship.0.0\">place-of-worship</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$place-of-worship.0.1\"></rect>\n            <path\n                fill=\"#ff9933\"\n                transform=\"translate(0 0)\"\n                d=\"M7.5,0l-2,2v2h4V2  L7.5,0z M5.5,4.5L4,6h7L9.5,4.5H5.5z M2,6.5c-0.5523,0-1,0.4477-1,1V13h2V7.5C3,6.9477,2.5523,6.5,2,6.5z M4,6.5V13h7V6.5H4z   M13,6.5c-0.5523,0-1,0.4477-1,1V13h2V7.5C14,6.9477,13.5523,6.5,13,6.5z\"\n                data-reactid=\".0.1.0.1.0.$place-of-worship.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$police\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$police.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$police.0.0\">police</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$police.0.1\"></rect>\n            <path\n                fill=\"#8a8acb\"\n                transform=\"translate(0 0)\"\n                d=\"M5.5,1L6,2h5l0.5-1H5.5z M6,2.5v1.25c0,0,0,2.75,2.5,2.75S11,3.75,11,3.75V2.5H6z M1.9844,3.9863  C1.4329,3.9949,0.9924,4.4485,1,5v4c-0.0001,0.6398,0.5922,1.1152,1.2168,0.9766L5,9.3574V14l5.8789-6.9297  C10.7391,7.0294,10.5947,7,10.4414,7H6.5L3,7.7539V5C3.0077,4.4362,2.5481,3.9775,1.9844,3.9863z M11.748,7.7109L6.4121,14H12  V8.5586C12,8.2451,11.9061,7.9548,11.748,7.7109z\"\n                data-reactid=\".0.1.0.1.0.$police.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$post\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$post.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$post.0.0\">post</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$post.0.1\"></rect>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M14,6.5V12c0,0.5523-0.4477,1-1,1H2c-0.5523,0-1-0.4477-1-1V6.5C1,6.2239,1.2239,6,1.5,6  c0.0692-0.0152,0.1408-0.0152,0.21,0l0,0l5.79,4l5.8-4l0,0c0.066-0.0138,0.134-0.0138,0.2,0C13.7761,6,14,6.2239,14,6.5z M1.25,3.92  L1.25,3.92L1.33,4L7.5,8l6.19-4l0,0h0.06l0,0c0.1796-0.0981,0.2792-0.2975,0.25-0.5C14,3.2239,13.7761,3,13.5,3h-12  C1.2239,3,1,3.2239,1,3.5C1.0026,3.6745,1.0978,3.8345,1.25,3.92z\"\n                data-reactid=\".0.1.0.1.0.$post.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$prison\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$prison.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$prison.0.0\">prison</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$prison.0.1\"></rect>\n            <path\n                fill=\"#56b881\"\n                transform=\"translate(0 0)\"\n                d=\"M3.5,1v13H12V1H3.5z M9.5,2H11v3.5H9.5V2z M4.5,2.0547H6V7H4.5V2.0547z M7,2.0547h1.5V7H7V2.0547z M10.25,6.5  C10.6642,6.5,11,6.8358,11,7.25S10.6642,8,10.25,8l0,0C9.8358,8,9.5,7.6642,9.5,7.25l0,0C9.5,6.8358,9.8358,6.5,10.25,6.5z M7,8  h1.4727L8.5,13H7.0273L7,8z M4.5,8.166H6V13H4.5V8.166z M9.5,9H11v4H9.5V9z\"\n                data-reactid=\".0.1.0.1.0.$prison.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$religious-christian\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$religious-christian.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$religious-christian.0.0\">religious-christian</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$religious-christian.0.1\"></rect>\n            <path\n                fill=\"#34a9ca\"\n                transform=\"translate(0 0)\"\n                d=\"M6,0.9552V4H3v3h3v8h3V7h3V4H9V1  c0-1-0.9776-1-0.9776-1H6.9887C6.9887,0,6,0,6,0.9552z\"\n                data-reactid=\".0.1.0.1.0.$religious-christian.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$religious-jewish\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$religious-jewish.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$religious-jewish.0.0\">religious-jewish</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$religious-jewish.0.1\"></rect>\n            <path\n                fill=\"#ff9933\"\n                transform=\"translate(0 0)\"\n                d=\"M15,12H9.78L7.5,15l-2.26-3H0l2.7-4L0,4h5.3l2.2-4l2.34,4H15l-2.56,4L15,12z\"\n                data-reactid=\".0.1.0.1.0.$religious-jewish.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$religious-muslim\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$religious-muslim.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$religious-muslim.0.0\">religious-muslim</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$religious-muslim.0.1\"></rect>\n            <path\n                fill=\"#8a8acb\"\n                transform=\"translate(0 0)\"\n                d=\"M6.7941,0C3,0,0,3,0,6.7941  s3,6.7941,6.7941,6.7941c2.1176,0,4.4118-0.7059,5.6471-2.2941C11.6471,11.8235,10.1471,12.4412,9,12.4412  c-2.9118,0-5.1176-2.9118-5.1176-5.8235S6.0882,1.1471,9,1.1471c1.0588,0,2.5588,0.6176,3.4412,1.1471  C11.2059,0.7059,8.9118,0,6.7941,0z M11,3l-1,2.5H7L9.5,7l-1,3L11,8.5l2.5,1.5l-1-3L15,5.5h-3L11,3z\"\n                data-reactid=\".0.1.0.1.0.$religious-muslim.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$shop\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$shop.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$shop.0.0\">shop</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$shop.0.1\"></rect>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M13.33,6H11.5l-0.39-2.33c-0.1601-0.7182-0.7017-1.2905-1.41-1.49C9.3507,2.0676,8.9869,2.007,8.62,2H6.38  C6.0131,2.007,5.6493,2.0676,5.3,2.18C4.5917,2.3795,4.0501,2.9518,3.89,3.67L3.5,6H1.67C1.3939,5.9983,1.1687,6.2208,1.167,6.497  C1.1667,6.5489,1.1744,6.6005,1.19,6.65l1.88,6.3l0,0C3.2664,13.5746,3.8453,13.9996,4.5,14h6c0.651-0.0047,1.2247-0.4289,1.42-1.05  l0,0l1.88-6.3c0.0829-0.2634-0.0635-0.5441-0.3269-0.627C13.4268,6.0084,13.3786,6.0007,13.33,6z M4.52,6l0.36-2.17  c0.0807-0.3625,0.3736-0.6395,0.74-0.7C5.8663,3.0524,6.1219,3.0087,6.38,3h2.24c0.2614,0.0078,0.5205,0.0515,0.77,0.13  c0.3664,0.0605,0.6593,0.3375,0.74,0.7L10.48,6h-6H4.52z\"\n                data-reactid=\".0.1.0.1.0.$shop.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$stadium\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$stadium.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$stadium.0.0\">stadium</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$stadium.0.1\"></rect>\n            <path\n                fill=\"#56b881\"\n                transform=\"translate(0 0)\"\n                d=\"M7,1v2v1.5v0.5098C4.1695,5.1037,2.0021,5.9665,2,7v4.5c0,1.1046,2.4624,2,5.5,2s5.5-0.8954,5.5-2V7  c-0.0021-1.0335-2.1695-1.8963-5-1.9902V4.0625L11,2.75L7,1z M3,8.1465c0.5148,0.2671,1.2014,0.4843,2,0.6328v2.9668  C3.7948,11.477,3,11.0199,3,10.5V8.1465z M12,8.1484V10.5c0,0.5199-0.7948,0.977-2,1.2461V8.7812  C10.7986,8.6328,11.4852,8.4155,12,8.1484z M6,8.9219C6.4877,8.973,6.9925,8.9992,7.5,9C8.0073,8.9999,8.5121,8.9743,9,8.9238  v2.9844C8.5287,11.964,8.0288,12,7.5,12S6.4713,11.964,6,11.9082V8.9219z\"\n                data-reactid=\".0.1.0.1.0.$stadium.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$star\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$star.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$star.0.0\">star</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$star.0.1\"></rect>\n            <path\n                fill=\"#34a9ca\"\n                transform=\"translate(0 0)\"\n                d=\"M7.5,0l-2,5h-5l4,3.5l-2,6l5-3.5  l5,3.5l-2-6l4-3.5h-5L7.5,0z\"\n                data-reactid=\".0.1.0.1.0.$star.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$suitcase\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$suitcase.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$suitcase.0.0\">suitcase</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$suitcase.0.1\"></rect>\n            <path\n                fill=\"#ff9933\"\n                transform=\"translate(0 0)\"\n                d=\"M11,4V2c0-1-1-1-1-1H5.0497  c0,0-1.1039,0.0015-1.0497,1v2H2c0,0-1,0-1,1v7c0,1,1,1,1,1h11c0,0,1,0,1-1V5c0-1-1-1-1-1H11z M5.5,2.5h4V4h-4V2.5z\"\n                data-reactid=\".0.1.0.1.0.$suitcase.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$swimming\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$swimming.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$swimming.0.0\">swimming</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$swimming.0.1\"></rect>\n            <path\n                fill=\"#8a8acb\"\n                transform=\"translate(0 0)\"\n                d=\"M10.1113,2C9.9989,2,9.6758,2.1465,9.6758,2.1465L6.3535,3.8262  C5.9111,4.0024,5.7358,4.7081,6.002,5.0605l0.9707,1.4082L3.002,8.498L5,9.998l2.502-1.5l2.5,1.5l1.002-1.002l-3-4l2.5566-1.5293  c0.5286-0.2662,0.4434-0.7045,0.4434-0.9707C10.9999,2.2861,10.6437,2,10.1113,2z M12.252,5C11.2847,5,10.5,5.7827,10.5,6.75  s0.7847,1.752,1.752,1.752s1.75-0.7847,1.75-1.752S13.2192,5,12.252,5z M2.5,10L0,11.5V13l2.5-1.5L5,13l2.502-1.5l2.5,1.5L12,11.5  l3,1.5v-1.5L12,10l-1.998,1.5l-2.5-1.5L5,11.5L2.5,10z\"\n                data-reactid=\".0.1.0.1.0.$swimming.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$theatre\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$theatre.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$theatre.0.0\">theatre</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$theatre.0.1\"></rect>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M2,1c0,0-1,0-1,1v5.1582C1,8.8885,1.354,11,4.5,11H5V8L2.5,9c0,0,0-2.5,2.5-2.5V5  c0-0.7078,0.0868-1.3209,0.5-1.7754C5.8815,2.805,6.5046,1.9674,8.1562,2.7539L9,3.3027V2c0,0,0-1-1-1C7.2922,1,6.0224,2,5,2  S2.7865,1,2,1z M3,3c0.5523,0,1,0.4477,1,1S3.5523,5,3,5S2,4.5523,2,4S2.4477,3,3,3z M7,4c0,0-1,0-1,1v5c0,2,1,4,4,4s4-2,4-4V5  c0-1-1-1-1-1c-0.7078,0-1.9776,1-3,1S7.7865,4,7,4z M8,6c0.5523,0,1,0.4477,1,1S8.5523,8,8,8S7,7.5523,7,7S7.4477,6,8,6z M12,6  c0.5523,0,1,0.4477,1,1s-0.4477,1-1,1s-1-0.4477-1-1S11.4477,6,12,6z M7.5,10H10h2.5c0,0,0,2.5-2.5,2.5S7.5,10,7.5,10z\"\n                data-reactid=\".0.1.0.1.0.$theatre.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$toilet\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$toilet.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$toilet.0.0\">toilet</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$toilet.0.1\"></rect>\n            <path\n                fill=\"#56b881\"\n                transform=\"translate(0 0)\"\n                d=\"M4.5,3C3.6716,3,3,2.3284,3,1.5S3.6716,0,4.5,0S6,0.6716,6,1.5S5.3284,3,4.5,3z M14,1.5C14,0.6716,13.3284,0,12.5,0  S11,0.6716,11,1.5S11.6716,3,12.5,3S14,2.3284,14,1.5z M8.86,6.64L8.86,6.64L6.38,4.15l0,0C6.2798,4.0492,6.142,3.9949,6,4H3  C2.8697,4.0003,2.7445,4.0503,2.65,4.14l0,0L0.14,6.63c-0.2261,0.177-0.2659,0.5039-0.0889,0.73s0.5039,0.2659,0.73,0.0889  C0.8142,7.423,0.8441,7.3931,0.87,7.36L3,5.2L1,11h2v3.33c-0.0075,0.0497-0.0075,0.1003,0,0.15  c0.0555,0.2761,0.3244,0.455,0.6005,0.3995C3.802,14.839,3.9595,14.6815,4,14.48l0,0V11h1v3.5l0,0  c0.0555,0.2761,0.3244,0.455,0.6005,0.3995C5.802,14.859,5.9595,14.7015,6,14.5c0.0075-0.0497,0.0075-0.1003,0-0.15V11h2L6,5.2  l2.14,2.16l0,0c0.0967,0.1081,0.2349,0.17,0.38,0.17C8.7954,7.5088,9.0061,7.2761,9,7C9.0023,6.8663,8.9521,6.737,8.86,6.64z   M14.5,4h-4C10.2239,4,10,4.2239,10,4.5v5c0,0.2761,0.2239,0.5,0.5,0.5S11,9.7761,11,9.5v5c0,0.2761,0.2239,0.5,0.5,0.5  s0.5-0.2239,0.5-0.5v-5h1v5c0,0.2761,0.2239,0.5,0.5,0.5s0.5-0.2239,0.5-0.5v-5c0,0.2761,0.2239,0.5,0.5,0.5S15,9.7761,15,9.5v-5  C15,4.2239,14.7761,4,14.5,4z\"\n                data-reactid=\".0.1.0.1.0.$toilet.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$town-hall\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$town-hall.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$town-hall.0.0\">town-hall</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$town-hall.0.1\"></rect>\n            <path\n                fill=\"#34a9ca\"\n                transform=\"translate(0 0)\"\n                d=\"M7.5,0L1,3.4453V4h13V3.4453L7.5,0z M2,5v5l-1,1.5547V13h13v-1.4453L13,10V5H2z M4,6h1v5.5H4V6z M7,6h1v5.5H7  V6z M10,6h1v5.5h-1V6z\"\n                data-reactid=\".0.1.0.1.0.$town-hall.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$triangle\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$triangle.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$triangle.0.0\">triangle</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$triangle.0.1\"></rect>\n            <path\n                fill=\"#ff9933\"\n                transform=\"translate(0 0)\"\n                d=\"M7.5385,2  C7.2437,2,7.0502,2.1772,6.9231,2.3846l-5.8462,9.5385C1,12,1,12.1538,1,12.3077C1,12.8462,1.3846,13,1.6923,13h11.6154  C13.6923,13,14,12.8462,14,12.3077c0-0.1538,0-0.2308-0.0769-0.3846L8.1538,2.3846C8.028,2.1765,7.7882,2,7.5385,2z\"\n                data-reactid=\".0.1.0.1.0.$triangle.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$triangle-stroked\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$triangle-stroked.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$triangle-stroked.0.0\">triangle-stroked</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$triangle-stroked.0.1\"></rect>\n            <path\n                fill=\"#8a8acb\"\n                transform=\"translate(0 0)\"\n                d=\"M7.5243,1.5004  C7.2429,1.4913,6.9787,1.6423,6.8336,1.8952l-5.5,9.8692C1.0218,12.3078,1.395,12.9999,2,13h11  c0.605-0.0001,0.9782-0.6922,0.6664-1.2355l-5.5-9.8692C8.0302,1.6579,7.7884,1.5092,7.5243,1.5004z M7.5,3.8993l4.1267,7.4704  H3.3733L7.5,3.8993z\"\n                data-reactid=\".0.1.0.1.0.$triangle-stroked.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$veterinary\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$veterinary.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$veterinary.0.0\">veterinary</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$veterinary.0.1\"></rect>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M7.5,6c-2.5,0-3,2.28-3,3.47l0,0c-0.6097,0.2059-1.1834,0.5062-1.7,0.89  c-0.871,0.6614-1.0492,1.8998-0.4,2.78c0.6799,0.8542,1.9081,1.0297,2.8,0.4c0.6779-0.4601,1.4808-0.701,2.3-0.69  c0.8192-0.011,1.6221,0.2299,2.3,0.69c0.8575,0.6854,2.1072,0.5515,2.8-0.3c0.6888-0.8134,0.5878-2.0313-0.2256-2.7201  c-0.0243-0.0206-0.0491-0.0406-0.0744-0.0599l-0.1-0.1c-0.5333-0.3564-1.1032-0.6548-1.7-0.89l0,0C10.5,8.29,10,6,7.5,6z\"\n                data-reactid=\".0.1.0.1.0.$veterinary.0.5:$0\"></path>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M2.08,4.3c-0.7348,0.3676-1.0652,1.2371-0.76,2c0.064,0.8282,0.7809,1.4517,1.61,1.4  c0.7348-0.3676,1.0652-1.2371,0.76-2C3.626,4.8718,2.9091,4.2483,2.08,4.3z\"\n                data-reactid=\".0.1.0.1.0.$veterinary.0.5:$1\"></path>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M12.93,4.3c0.7348,0.3676,1.0653,1.2371,0.76,2c-0.064,0.8282-0.7809,1.4517-1.61,1.4  c-0.7348-0.3676-1.0653-1.2371-0.76-2C11.384,4.8718,12.1009,4.2483,12.93,4.3z\"\n                data-reactid=\".0.1.0.1.0.$veterinary.0.5:$2\"></path>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M5.08,1.3c-0.68,0.09-1,0.94-0.76,1.87C4.4301,3.9951,5.1003,4.6321,5.93,4.7c0.68-0.09,1-0.94,0.76-1.87  C6.5799,2.0049,5.9097,1.3679,5.08,1.3z\"\n                data-reactid=\".0.1.0.1.0.$veterinary.0.5:$3\"></path>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M9.93,1.3c0.68,0.09,1,0.94,0.76,1.87C10.5791,3.9986,9.9036,4.6365,9.07,4.7c-0.68-0.08-1-0.94-0.76-1.87  C8.4209,2.0014,9.0964,1.3634,9.93,1.3z\"\n                data-reactid=\".0.1.0.1.0.$veterinary.0.5:$4\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$dentist\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$dentist.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$dentist.0.0\">dentist</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$dentist.0.1\"></rect>\n            <path\n                fill=\"#56b881\"\n                transform=\"translate(0 0)\"\n                d=\"M4.36,14c-1,0-0.56-2.67-0.86-5c-0.1-0.76-1-1.49-1.12-2.06C2,5,1.39,1.44,3.66,1S6,3,7.54,3s1.57-2.36,3.85-2  s1.59,3.9,1.29,5.9c-0.1,0.45-1.1,1.48-1.18,2.06c-0.33,2.4,0.32,5-0.8,5c-0.93,0-1.32-2.72-2-4.5C8.43,8.63,8.06,8,7.54,8  C6,8,5.75,14,4.36,14z\"\n                data-reactid=\".0.1.0.1.0.$dentist.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$doctor\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$doctor.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$doctor.0.0\">doctor</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$doctor.0.1\"></rect>\n            <path\n                fill=\"#34a9ca\"\n                transform=\"translate(0 0)\"\n                d=\"M5.5,7C4.1193,7,3,5.8807,3,4.5l0,0v-2C3,2.2239,3.2239,2,3.5,2H4c0.2761,0,0.5-0.2239,0.5-0.5S4.2761,1,4,1H3.5  C2.6716,1,2,1.6716,2,2.5v2c0.0013,1.1466,0.5658,2.2195,1.51,2.87l0,0C4.4131,8.1662,4.9514,9.297,5,10.5C5,12.433,6.567,14,8.5,14  s3.5-1.567,3.5-3.5V9.93c1.0695-0.2761,1.7126-1.367,1.4365-2.4365C13.1603,6.424,12.0695,5.7809,11,6.057  C9.9305,6.3332,9.2874,7.424,9.5635,8.4935C9.7454,9.198,10.2955,9.7481,11,9.93v0.57c0,1.3807-1.1193,2.5-2.5,2.5S6,11.8807,6,10.5  c0.0511-1.2045,0.5932-2.3356,1.5-3.13l0,0C8.4404,6.7172,9.001,5.6448,9,4.5v-2C9,1.6716,8.3284,1,7.5,1H7  C6.7239,1,6.5,1.2239,6.5,1.5S6.7239,2,7,2h0.5C7.7761,2,8,2.2239,8,2.5v2l0,0C8,5.8807,6.8807,7,5.5,7 M11.5,9  c-0.5523,0-1-0.4477-1-1s0.4477-1,1-1s1,0.4477,1,1S12.0523,9,11.5,9z\"\n                data-reactid=\".0.1.0.1.0.$doctor.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$hospital\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$hospital.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$hospital.0.0\">hospital</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$hospital.0.1\"></rect>\n            <path\n                fill=\"#ff9933\"\n                transform=\"translate(0 0)\"\n                d=\"M7,1C6.4,1,6,1.4,6,2v4H2C1.4,6,1,6.4,1,7v1  c0,0.6,0.4,1,1,1h4v4c0,0.6,0.4,1,1,1h1c0.6,0,1-0.4,1-1V9h4c0.6,0,1-0.4,1-1V7c0-0.6-0.4-1-1-1H9V2c0-0.6-0.4-1-1-1H7z\"\n                data-reactid=\".0.1.0.1.0.$hospital.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$pharmacy\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$pharmacy.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$pharmacy.0.0\">pharmacy</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$pharmacy.0.1\"></rect>\n            <path\n                fill=\"#8a8acb\"\n                transform=\"translate(0 0)\"\n                d=\"M9.5,4l1.07-1.54c0.0599,0.0046,0.1201,0.0046,0.18,0c0.6904-0.0004,1.2497-0.5603,1.2494-1.2506  C11.999,0.519,11.4391-0.0404,10.7487-0.04C10.0584-0.0396,9.499,0.5203,9.4994,1.2106c0,0.0131,0.0002,0.0262,0.0006,0.0394  c0,0,0,0.07,0,0.1L7,4H9.5z M12,6V5H3v1l1.5,3.5L3,13v1h9v-1l-1-3.5L12,6z M10,10H8v2H7v-2H5V9h2V7h1v2h2V10z\"\n                data-reactid=\".0.1.0.1.0.$pharmacy.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$campsite\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$campsite.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$campsite.0.0\">campsite</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$campsite.0.1\"></rect>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M7,1.5  l-5.5,9H1c-1,0-1,1-1,1v1c0,0,0,1,1,1h13c1,0,1-1,1-1v-1c0,0,0-1-1-1h-0.5L8,1.5C7.8,1.1,7.2,1.1,7,1.5z M7.5,5l3.2,5.5H4.2L7.5,5z\"\n                data-reactid=\".0.1.0.1.0.$campsite.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$cemetery\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$cemetery.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$cemetery.0.0\">cemetery</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$cemetery.0.1\"></rect>\n            <path\n                fill=\"#56b881\"\n                transform=\"translate(0 0)\"\n                d=\"M11.46,12h-0.68L12,3.55c0.0175-0.2867-0.2008-0.5332-0.4874-0.5507C11.4884,2.9979,11.4641,2.9981,11.44,3h-1.18  c0-0.92-1.23-2-2.75-2S4.77,2.08,4.77,3H3.54C3.253,2.9885,3.0111,3.2117,2.9995,3.4987C2.9988,3.5158,2.999,3.5329,3,3.55L4.2,12  H3.55C3.2609,11.9886,3.0162,12.2112,3,12.5V14h9v-1.51C11.9839,12.2067,11.7435,11.9886,11.46,12z M4.5,5h6v1h-6V5z\"\n                data-reactid=\".0.1.0.1.0.$cemetery.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$dog-park\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$dog-park.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$dog-park.0.0\">dog-park</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$dog-park.0.1\"></rect>\n            <path\n                fill=\"#34a9ca\"\n                transform=\"translate(0 0)\"\n                d=\"M 10.300781 1.2207031 C 9.9144812 1.2207031 9.6 1.2 9.5 2 L 9.0996094 4.5214844 L 11.5 6.5 L 13.5 6.5 C 14.9 6.5 15 5.5410156 15 5.5410156 L 13.099609 3.3222656 C 12.399609 2.6222656 11.7 2.5 11 2.5 L 11 2 C 11 2 11.067481 1.2206031 10.300781 1.2207031 z M 4.75 1.5 C 4.75 1.5 3.7992187 1.5206031 3.1992188 1.7207031 C 2.5992187 1.9207031 2 2.6210938 2 3.6210938 L 2 7.5214844 C 2 9.2214844 1.3 9.5 1 9.5 C 1 9.5 0 9.5214844 0 10.521484 L 0 12.720703 C 0 12.720703 0.00078125 13.521484 0.80078125 13.521484 L 1 13.521484 L 1.5 13.521484 L 2 13.521484 L 2 13.021484 L 2 12.822266 C 2 12.422266 1.8 12.221094 1.5 12.121094 L 1.5 11.021484 C 2.5 11.021484 2.6 10.820703 3 10.720703 L 3.5507812 12.917969 C 3.6507813 13.217969 3.7507813 13.417578 4.0507812 13.517578 L 5.0507812 13.517578 L 6 13.5 L 6 12.699219 C 6 12.022819 5 12 5 12 L 5 9.5 L 8.5 9.5 L 9.1992188 12.121094 C 9.5992188 13.521094 10.5 13.5 10.5 13.5 L 11 13.5 L 12 13.5 L 12 12.699219 C 12 11.987419 11 12 11 12 L 11.099609 7.921875 L 8 5.5 L 3.5 5.5 L 3.5 3.5 C 3.5 3.1 3.7765 3.0053 4 3 C 4.4941 2.9882 4.75 3 4.75 3 C 5.1642 3 5.5 2.6642 5.5 2.25 C 5.5 1.8358 5.1642 1.5 4.75 1.5 z M 11.75 4 C 11.8881 4 12 4.1119 12 4.25 C 12 4.3881 11.8881 4.5 11.75 4.5 C 11.6119 4.5 11.5 4.3881 11.5 4.25 C 11.5 4.1119 11.6119 4 11.75 4 z \"\n                data-reactid=\".0.1.0.1.0.$dog-park.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$garden\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$garden.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$garden.0.0\">garden</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$garden.0.1\"></rect>\n            <path\n                fill=\"#ff9933\"\n                transform=\"translate(0 0)\"\n                d=\"M13,8c0,3.31-2.19,6-5.5,6S2,11.31,2,8c2.2643,0.0191,4.2694,1.4667,5,3.61V7H4.5C3.6716,7,3,6.3284,3,5.5v-3  C3,2.2239,3.2239,2,3.5,2c0.1574,0,0.3056,0.0741,0.4,0.2l1.53,2l1.65-3c0.1498-0.232,0.4593-0.2985,0.6913-0.1487  C7.8308,1.0898,7.8815,1.1404,7.92,1.2l1.65,3l1.53-2c0.1657-0.2209,0.4791-0.2657,0.7-0.1C11.9259,2.1944,12,2.3426,12,2.5v3  C12,6.3284,11.3284,7,10.5,7H8v4.61C8.7306,9.4667,10.7357,8.0191,13,8z\"\n                data-reactid=\".0.1.0.1.0.$garden.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$golf\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$golf.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$golf.0.0\">golf</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$golf.0.1\"></rect>\n            <path\n                fill=\"#8a8acb\"\n                transform=\"translate(0 0)\"\n                d=\"  M3.3999,1.1c0,0.1,0,0.2,0,0.2c0,0.4,0.3,0.7,0.7,0.7c0.3,0,0.5-0.2,0.6-0.5l0,0L4.9,1l5.6,2.3L6.6,6C6.2,6.3,6.2,6.7,6.3,7.1  l0.9,2.1l-1.3,3.9C5.7,13.6,6.1,14,6.5,14c0.3,0,0.5-0.1,0.6-0.5l1.4-4l0.1,0.3v3.5c0,0,0,0.7,0.7,0.7s0.7-0.7,0.7-0.7V10  c0-0.2,0-0.3-0.1-0.5L8.5,6.1l2.7-1.9c0.2-0.2,0.4-0.3,0.4-0.6s-0.2-0.5-0.4-0.6L4,0.1c-0.0878,0-0.118,0.0179-0.2001,0.1  L3.3999,1.1z M5.5,3C4.7,3,4,3.7,4,4.5S4.7,6,5.5,6S7,5.3,7,4.5S6.2999,3,5.5,3z\"\n                data-reactid=\".0.1.0.1.0.$golf.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$park\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$park.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$park.0.0\">park</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$park.0.1\"></rect>\n            <path\n                fill=\"#e55e5e\"\n                transform=\"translate(0 0)\"\n                d=\"M14,5.75c0.0113-0.6863-0.3798-1.3159-1-1.61C12.9475,3.4906,12.4014,2.9926,11.75,3  c-0.0988,0.0079-0.1962,0.0281-0.29,0.06c-0.0607-0.66-0.6449-1.1458-1.3048-1.0851C9.8965,1.9987,9.6526,2.1058,9.46,2.28l0,0  c0-0.6904-0.5596-1.25-1.25-1.25S6.96,1.5896,6.96,2.28C6.96,2.28,7,2.3,7,2.33C6.4886,1.8913,5.7184,1.9503,5.2797,2.4618  C5.1316,2.6345,5.0347,2.8451,5,3.07C4.8417,3.0195,4.6761,2.9959,4.51,3C3.6816,2.9931,3.0044,3.659,2.9975,4.4874  C2.9958,4.6872,3.0341,4.8852,3.11,5.07C2.3175,5.2915,1.8546,6.1136,2.0761,6.9061C2.2163,7.4078,2.6083,7.7998,3.11,7.94  c0.2533,0.7829,1.0934,1.2123,1.8763,0.959C5.5216,8.7258,5.9137,8.2659,6,7.71C6.183,7.8691,6.4093,7.9701,6.65,8v5L5,14h5l-1.6-1  v-2c0.7381-0.8915,1.6915-1.5799,2.77-2c0.8012,0.1879,1.603-0.3092,1.7909-1.1103C12.9893,7.7686,13.0025,7.6444,13,7.52  c0.0029-0.0533,0.0029-0.1067,0-0.16C13.6202,7.0659,14.0113,6.4363,14,5.75z M8.4,10.26V6.82C8.6703,7.3007,9.1785,7.5987,9.73,7.6  h0.28c0.0156,0.4391,0.2242,0.849,0.57,1.12C9.7643,9.094,9.0251,9.6162,8.4,10.26z\"\n                data-reactid=\".0.1.0.1.0.$park.0.5:$0\"></path>\n        </svg>\n    </div>\n    <div\n        class=\"pad1 col1\"\n        data-reactid=\".0.1.0.1.0.$picnic-site\">\n        <svg\n            viewBox=\"0 0 15 15\"\n            height=\"15\"\n            width=\"15\"\n            data-reactid=\".0.1.0.1.0.$picnic-site.0\">\n            <title\n                data-reactid=\".0.1.0.1.0.$picnic-site.0.0\">picnic-site</title>\n            <rect\n                fill=\"none\"\n                x=\"0\"\n                y=\"0\"\n                width=\"15\"\n                height=\"15\"\n                data-reactid=\".0.1.0.1.0.$picnic-site.0.1\"></rect>\n            <path\n                fill=\"#56b881\"\n                transform=\"translate(0 0)\"\n                d=\"M4,3C3.446,3,3,3.446,3,4s0.446,1,1,1h1.2969  L4.6523,7H2.5c-0.554,0-1,0.446-1,1s0.446,1,1,1h1.5098L3.041,12.0098c-0.1284,0.3939,0.0868,0.8173,0.4807,0.9457  s0.8173-0.0868,0.9457-0.4807c0.0005-0.0013,0.0009-0.0027,0.0013-0.004L5.5859,9h3.8281l1.1172,3.4707  c0.1273,0.3943,0.5501,0.6107,0.9443,0.4834s0.6107-0.5501,0.4834-0.9443l0,0L10.9902,9H12.5c0.554,0,1-0.446,1-1s-0.446-1-1-1  h-2.1523L9.7031,5H11c0.554,0,1-0.446,1-1s-0.446-1-1-1H4z M6.873,5H8.127l0.6445,2h-2.543L6.873,5z\"\n                data-reactid=\".0.1.0.1.0.$picnic-site.0.5:$0\"></path>\n        </svg>\n    </div>\n</div>\n";
    function find(id) {
        var svgNodes = document.getElementsByTagName("div");
        for (var i = 0; i < svgNodes.length; i++) {
            var n = svgNodes[i];
            if (n.dataset.reactid === ".0.1.0.1.0.$" + id) {
                var svg = n.getElementsByTagName("svg")[0];
                svg.id = id;
                return svg;
            }
        }
        return undefined;
    }
    function run() {
        $(html).appendTo("body");
        var svg = find("aquarium");
        console.log(svg);
        $(svg).clone().appendTo(".map");
        $("<svg viewBox=\"0 0 15 15\" height=\"200\" width=\"200\"><use href='#" + svg.id + "'/></svg>").appendTo(".map");
    }
    exports.run = run;
});
define("ol3-lab/tests/ags-format", ["require", "exports", "openlayers"], function (require, exports, ol) {
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
define("ol3-lab/tests/canvas", ["require", "exports"], function (require, exports) {
    "use strict";
    function run() {
        var _a = [600, 600], cw = _a[0], ch = _a[1];
        var canvas = document.createElement("canvas");
        canvas.style.border = "1px solid black";
        canvas.width = cw;
        canvas.height = ch;
        var ctx = canvas.getContext("2d");
        document.getElementById("map").appendChild(canvas);
        var path = new Path2D("M12 0 L24 24 L0 24 L12 0 Z");
        var _b = [24, 24], dw = _b[0], dh = _b[1];
        var positions = [[0, -60], [-60, 60], [60, 60]];
        var tick = 0;
        requestAnimationFrame(animate);
        function animate(time) {
            tick++;
            ctx.clearRect(0, 0, cw, ch);
            ctx.strokeStyle = "red";
            ctx.save();
            {
                ctx.translate(cw / 2, ch / 2);
                ctx.scale(Math.cos(tick * Math.PI / 180), Math.cos(tick * Math.PI / 180));
                ctx.rotate(tick * Math.PI / 180);
                ctx.translate(-cw / 2, -ch / 2);
                ctx.save();
                {
                    ctx.translate(cw / 2, ch / 2);
                    ctx.rotate(tick * Math.PI / 180);
                    ctx.scale(5, 5);
                    ctx.translate(-12, -12);
                    ctx.stroke(path);
                }
                ctx.restore();
                ctx.save();
                {
                    ctx.strokeStyle = "orange";
                    positions.forEach(function (position) {
                        ctx.save();
                        {
                            ctx.translate(position[0], position[1]);
                            ctx.translate(cw / 2, ch / 2);
                            ctx.scale(3, 3);
                            ctx.rotate(tick * Math.PI / 180);
                            ctx.translate(-12, -12);
                            ctx.stroke(path);
                        }
                        ctx.restore();
                    });
                }
                ctx.restore();
            }
            ctx.restore();
            if (tick < 360)
                requestAnimationFrame(animate);
        }
    }
    exports.run = run;
});
define("ol3-lab/tests/data/geom/multipoint", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    return new ol.geom.MultiPoint([
        [-115, 36],
        [-115.26, 36.3],
        [-115.2553, 36.1831]
    ]);
});
define("ol3-lab/tests/data/geom/multipolygon", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    return new ol.geom.MultiPolygon([
        [[
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
            ]],
        [[
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
            ]],
        [[
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
            ]],
        [[
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
            ]],
        [[
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
            ]],
        [[
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
        ]
    ]);
});
define("ol3-lab/tests/data/geom/point", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    return new ol.geom.Point([-115.2553, 36.1832]);
});
define("ol3-lab/tests/data/geom/polygon-with-holes", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    return new ol.geom.Polygon([
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
    ]);
});
define("ol3-lab/tests/data/geom/polyline", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    return new ol.geom.MultiLineString([
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
    ]);
});
define("ol3-lab/tests/drop-vertex-on-marker-detection", ["require", "exports", "openlayers", "ol3-lab/labs/mapmaker", "ol3-lab/labs/route-editor"], function (require, exports, ol, mapmaker_1, route_editor_1) {
    "use strict";
    function midpoint(points) {
        var p0 = points.reduce(function (sum, p) { return p.map(function (v, i) { return v + sum[i]; }); });
        return p0.map(function (v) { return v / points.length; });
    }
    var range = function (n) {
        var r = new Array(n);
        for (var i = 0; i < n; i++)
            r[i] = i;
        return r;
    };
    function run() {
        var features = new ol.Collection([]);
        var activeFeature;
        features.on("add", function (args) {
            var feature = args.element;
            feature.on("change", function (args) {
                activeFeature = feature;
            });
            feature.on("change:geometry", function (args) {
                console.log("feature change:geometry", args);
            });
        });
        var layer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: features
            })
        });
        var colors = ['229966', 'cc6633', 'cc22cc', '331199'].map(function (v) { return '#' + v; });
        mapmaker_1.run().then(function (map) {
            map.addLayer(layer);
            var _a = map.getView().calculateExtent(map.getSize().map(function (v) { return v * 0.25; })), a = _a[0], b = _a[1], c = _a[2], d = _a[3];
            var routes = [];
            var shift = [-0.001, -0.005];
            while (colors.length) {
                var startstop = [a + (c - a) * Math.random(), b + (d - b) * Math.random()].map(function (v, i) { return v + shift[i]; });
                var route = new route_editor_1.Route({
                    color: colors.pop(),
                    start: startstop,
                    finish: startstop,
                    stops: range(8).map(function (v) { return [a + (c - a) * Math.random(), b + (d - b) * Math.random()].map(function (v, i) { return v + shift[i]; }); })
                });
                shift = shift.map(function (v) { return v + 0.005; });
                routes.push(route);
            }
            var redRoute = new route_editor_1.Route({
                color: "red",
                showLines: false,
                modifyRoute: true
            });
            routes.push(redRoute);
            routes.forEach(function (r) {
                r.refresh(map);
                r.appendTo(layer);
            });
            var editFeatures = new ol.Collection();
            routes.map(function (route) { return route.allowModify(editFeatures); });
            var modify = new ol.interaction.Modify({
                pixelTolerance: 8,
                condition: function (evt) {
                    if (!ol.events.condition.noModifierKeys(evt))
                        return false;
                    if (routes.some(function (r) { return r.isStartingLocation(map, evt.coordinate); }))
                        return false;
                    if (routes.some(function (r) { return r.isEndingLocation(map, evt.coordinate); }))
                        return false;
                    return true;
                },
                features: editFeatures
            });
            map.addInteraction(modify);
            modify.on("modifyend", function (args) {
                console.log("modifyend", args);
                var dropLocation = args.mapBrowserEvent.coordinate;
                console.log("drop-location", dropLocation);
                var dropInfo = {
                    route: null,
                    stops: null
                };
                var targetInfo = {
                    route: null,
                    vertexIndex: null
                };
                targetInfo.route = routes.filter(function (route) { return route.owns(activeFeature); })[0];
                console.log("target-route", targetInfo.route);
                {
                    var geom = activeFeature.getGeometry();
                    var coords = geom.getCoordinates();
                    var vertex = coords.filter(function (p) { return p[0] === dropLocation[0]; })[0];
                    var vertexIndex = coords.indexOf(vertex);
                    console.log("vertex", vertexIndex);
                    targetInfo.vertexIndex = vertexIndex;
                    if (targetInfo.vertexIndex == 0) {
                        targetInfo.vertexIndex = targetInfo.route.stops.length;
                    }
                }
                routes.some(function (route) {
                    var stop = route.findStop(map, dropLocation);
                    if (stop >= 0) {
                        console.log("drop", route, stop);
                        dropInfo.route = route;
                        dropInfo.stops = [stop];
                        return true;
                    }
                });
                var isNewVertex = targetInfo.route.isNewVertex();
                var dropOnStop = dropInfo.route && 0 < dropInfo.stops.length;
                var isSameRoute = dropOnStop && dropInfo.route === targetInfo.route;
                var stopIndex = targetInfo.vertexIndex;
                if (targetInfo.route.startLocation)
                    stopIndex--;
                if (stopIndex < 0) {
                    console.log("moving the starting vertex is not allowed");
                }
                else if (stopIndex > targetInfo.route.stops.length) {
                    console.log("moving the ending vertex is not allowed");
                }
                else if (dropOnStop && isNewVertex) {
                    var stop = dropInfo.route.removeStop(dropInfo.stops[0]);
                    targetInfo.route.addStop(stop, stopIndex);
                }
                else if (dropOnStop && !isNewVertex && !isSameRoute) {
                    var stop = targetInfo.route.removeStop(stopIndex);
                    redRoute.addStop(stop);
                    stop = dropInfo.route.removeStop(dropInfo.stops[0]);
                    targetInfo.route.addStop(stop, stopIndex);
                }
                else if (dropOnStop && !isNewVertex && isSameRoute) {
                    var count = dropInfo.stops[0] - stopIndex;
                    if (count > 1)
                        while (count--) {
                            var stop = targetInfo.route.removeStop(stopIndex);
                            redRoute.addStop(stop);
                        }
                }
                else if (!dropOnStop && isNewVertex) {
                    console.log("dropping a new vertex on empty space has not effect");
                }
                else if (!dropOnStop && !isNewVertex) {
                    var stop = targetInfo.route.removeStop(stopIndex);
                    stop && redRoute.addStop(stop);
                }
                routes.map(function (r) { return r.refresh(map); });
            });
        });
    }
    exports.run = run;
});
define("ol3-lab/tests/google-polyline", ["require", "exports", "ol3-lab/labs/common/ol3-polyline", "ol3-lab/labs/common/google-polyline"], function (require, exports, OlEncoder, Encoder) {
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
define("ol3-lab/tests/index", ["require", "exports"], function (require, exports) {
    "use strict";
    function run() {
        var l = window.location;
        var path = "" + l.origin + l.pathname + "?run=ol3-lab/tests/";
        var labs = "\n    ags-format\n    google-polyline\n    webmap\n    map-resize-defect\n    drop-vertex-on-marker-detection\n    index\n    ";
        document.writeln("\n    <p>\n    Watch the console output for failed assertions (blank is good).\n    </p>\n    ");
        document.writeln(labs
            .split(/ /)
            .map(function (v) { return v.trim(); })
            .filter(function (v) { return !!v; })
            .sort()
            .map(function (lab) { return "<a href=" + path + lab + "&debug=1>" + lab + "</a>"; })
            .join("<br/>"));
    }
    exports.run = run;
    ;
});
define("ol3-lab/tests/map-resize-defect", ["require", "exports", "openlayers", "jquery"], function (require, exports, ol, $) {
    "use strict";
    var html = "\n<lab class='map-resize-defect'>\n    <div class='outer'>\n        <div id='map' class='map fill'>\n        </div>\n    </div>\n    <button class='event grow'>Update CSS</button>\n    <button class='event resize'>Resize Map</button>\n</lab>\n";
    var css = "\n<style>\n\n    .outer {\n        padding: 20px;\n        border: 1px solid orange;\n        width: 0;\n        height: 0;\n        overflow:hidden;\n    }\n\n    .map {\n        padding: 20px;\n        border: 1px solid yellow;\n        width: 80%;\n        height: 80%;\n    }\n\n</style>\n";
    var css2 = "\n<style>\n\n    html, body {\n        width: 100%;\n        height: 100%;\n        margin: 0;\n        padding: 0;\n        border: none;\n    }\n\n    .outer {\n        width: 100%;\n        height: 100%;\n        margin: 0;\n        padding: 0;\n        border: none;\n    }\n\n    .map {\n        border: none;\n    }\n\n</style>\n";
    var fail = 0;
    return function run() {
        $('#map').remove();
        $(html).appendTo('body');
        $(css).appendTo('head');
        var map = new ol.Map({
            target: "map",
            view: new ol.View({
                projection: 'EPSG:4326',
                center: [-82.4, 34.85],
                zoom: 15
            }),
            layers: [new ol.layer.Tile({ source: new ol.source.OSM() })]
        });
        $('#map').resize(function () {
            throw "this will never happen because jquery only listens for the window size to change";
        });
        $('button.event.grow').click(function (evt) {
            $(css2).appendTo("head");
            $(evt.target).remove();
        });
        $('button.event.resize').click(function (evt) {
            map.updateSize();
            $(evt.target).remove();
        });
        require(["https://rawgit.com/marcj/css-element-queries/master/src/ResizeSensor.js"], function (ResizeSensor) {
            var target = map.getTargetElement();
            new ResizeSensor(target, function () {
                console.log("ResizeSensor resize detected!");
                if (!fail)
                    map.updateSize();
            });
        });
    };
});
define("ol3-lab/tests/webmap", ["require", "exports", "jquery"], function (require, exports, $) {
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
define("ol3-lab/ux/styles/ags/simplemarkersymbol-circle", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/ags/simplemarkersymbol-cross", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/ags/simplemarkersymbol-square", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/ags/simplemarkersymbol-diamond", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/ags/simplemarkersymbol-path", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/ags/simplemarkersymbol-x", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/ags/picturemarkersymbol", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/ags/picturemarkersymbol-imagedata", ["require", "exports"], function (require, exports) {
    "use strict";
    var style = [{
            "type": "esriPMS",
            "url": "4A138C60",
            "imageData": "iVBORw0KGgoAAAANSUhEUgAAACMAAAAjCAYAAAAe2bNZAAAAAXNSR0IB2cksfwAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAy1JREFUWIXtl0tIG1EUhv84Ymp0AhqsJhUqmmAUtRSlPjbW4mOhaSlushANNiCBiG7GgEZCQGiD4qYSXFiQlkAXBRdWECx2o4JiwE0Jtq60ICKBKsaYSeLtolY7nRmdiYKl5N/de85/7jfnDPNIxT+k1NsG+FNJGDElYcSUhBHTjcAEg0Gi0WgUtw4TDAaJTqfDxMQEsdvt1wK6NszY2BhKnpXAbreDZVmSlpaWMNC1YNrb28kGtQHLWwsOPYeg82isrq6S6urqhIAShvH5fKTX1QvGyyAWj0F1V4U2ZxucTmeiJROHGRwchOmVCYo7CsRiMQBAlaUKkx8m4fF4iMPhkN2dhGD6+vrI/NY8DI0GxNgYJ9bibIHjuQPhcJikp6fLApINs7m5SSoqKmBdtIJlWV4870EeKs2VsNlsckvLhxkYGEBtXy3U99SIRqOCOTX2Gky1TGFhYYE0NTVJ7o5cGAITUPqoFAeHB+JZSqB7sRudLzplFZcFo2/VI+dhDtgodzxH34+QmZ/Jy6/pr4Gv3UdUKpWk7kiGWVtbI55tD6In/NGsT62jvKMc6nw1Z19dqIbVapV6hHSY4eFhZDmyEIlEOPvBL0FszW4hFAqh3lnP8818nsHc3BxpbW29sjuSYMbHx8mIdwQNbANn/xSn8E/6MTo6CoZhsP1kG9oqLSenrKsMQ0NDUo65GubseYG6l3W8e2Xn0w4MmQYwDKOYnp4mPa4eNBobkaJMOc/R1eqwPL8Ml8tF3G73pd25EsZms0HbogVtoMFGLmCiR1EE3gUw+34Wzc3NsFgsCpPJRAIfAyhqK+LUMHYY4R5yY29vj+Tm5ooCCcIo7ytJRlYGQuEQllRL0HfocRw+Po+zP1h8e/MNGTkZMPeakV2cTQBg+esyQvEQQAHaxxfjonIp1L2uQ8nTEiiLlQQAIpsRHpQgTEFXATSFmvN1PB7nxCmagrHfKHaBgh6kAUbbhWfFssLzCMLsr+7jZPvk14KInHbZ9MU8Zz6h14gojLnIDL/fD4qiQFGUoJF35X9JyPfbQ9M0drErDcbr9V77ezYR/X9/BzelJIyYkjBi+gkX4w++7OoZ3gAAAABJRU5ErkJggg==",
            "contentType": "image/png",
            "color": null,
            "width": 26,
            "height": 26,
            "angle": 0,
            "xoffset": 0,
            "yoffset": 0
        }];
    return style;
});
define("ol3-lab/ux/ags-symbols", ["require", "exports", "openlayers", "ol3-lab/labs/common/style-generator", "ol3-lab/ux/styles/ags/simplemarkersymbol-circle", "ol3-lab/ux/styles/ags/simplemarkersymbol-cross", "ol3-lab/ux/styles/ags/simplemarkersymbol-square", "ol3-lab/ux/styles/ags/simplemarkersymbol-diamond", "ol3-lab/ux/styles/ags/simplemarkersymbol-path", "ol3-lab/ux/styles/ags/simplemarkersymbol-x", "ol3-lab/ux/styles/ags/picturemarkersymbol", "ol3-lab/ux/styles/ags/picturemarkersymbol-imagedata", "bower_components/ol3-symbolizer/ol3-symbolizer/format/ags-symbolizer"], function (require, exports, ol, StyleGenerator, circleSymbol, crossSymbol, squareSymbol, diamondSymbol, pathSymbol, xSymbol, iconurl, iconimagedata, ags_symbolizer_2) {
    "use strict";
    var center = [-82.4, 34.85];
    function run() {
        var formatter = new ags_symbolizer_2.StyleConverter();
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
            xStyle,
            formatter.fromJson(iconurl[0]),
            formatter.fromJson(iconimagedata[0])
        ];
        layer.getSource().getFeatures().forEach(function (f, i) { return f.setStyle([styles[i % styles.length]]); });
    }
    exports.run = run;
});
define("ol3-lab/ux/download", ["require", "exports", "openlayers", "jquery"], function (require, exports, ol, $) {
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
define("ol3-lab/ux/serializers/ags-simplefillsymbol", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/ags/cartographiclinesymbol", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/ags/picturefillsymbol", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/ags/simplefillsymbol", ["require", "exports"], function (require, exports) {
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
        result.style = "esriSFS" + style;
        return result;
    });
    return symbols;
});
define("ol3-lab/ux/styles/ags/textsymbol", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/circle/alert", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "circle": {
                "fill": {
                    "color": "rgba(197,37,84,0.90)"
                },
                "opacity": 1,
                "stroke": {
                    "color": "rgba(227,83,105,1)",
                    "width": 4.4
                },
                "radius": 7.3
            },
            "text": {
                "fill": {
                    "color": "rgba(205,86,109,0.9)"
                },
                "stroke": {
                    "color": "rgba(252,175,131,0.5)",
                    "width": 2
                },
                "text": "Test",
                "offset-x": 0,
                "offset-y": 20,
                "font": "18px fantasy"
            }
        }
    ];
});
define("ol3-lab/ux/styles/circle/gradient", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/fill/cross", ["require", "exports"], function (require, exports) {
    "use strict";
    return [{
            "fill": {
                "pattern": {
                    "orientation": "cross",
                    "color": "rgba(12,236,43,1)",
                    "spacing": 7,
                    "repitition": "repeat"
                }
            }
        }];
});
define("ol3-lab/ux/styles/fill/diagonal", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "fill": {
                "pattern": {
                    "orientation": "diagonal",
                    "color": "rgba(230,113,26,1)",
                    "spacing": 3,
                    "repitition": "repeat"
                }
            }
        }
    ];
});
define("ol3-lab/ux/styles/fill/horizontal", ["require", "exports"], function (require, exports) {
    "use strict";
    return [{
            "fill": {
                "pattern": {
                    "orientation": "horizontal",
                    "color": "rgba(115,38,12,1)",
                    "spacing": 6,
                    "repitition": "repeat"
                }
            }
        }];
});
define("ol3-lab/ux/styles/fill/vertical", ["require", "exports"], function (require, exports) {
    "use strict";
    return [{
            "fill": {
                "pattern": {
                    "orientation": "vertical",
                    "color": "rgba(12,236,43,1)",
                    "spacing": 7,
                    "repitition": "repeat"
                }
            }
        }];
});
define("ol3-lab/ux/styles/icon/svg", ["require", "exports"], function (require, exports) {
    "use strict";
    return [
        {
            "image": {
                "imgSize": [
                    48,
                    48
                ],
                "stroke": {
                    "color": "rgba(255,25,0,0.8)",
                    "width": 10
                },
                "path": "M23 2 L23 23 L43 16.5 L23 23 L35 40 L23 23 L11 40 L23 23 L3 17 L23 23 L23 2 Z"
            }
        }
    ];
});
define("ol3-lab/ux/styles/peace", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/star/4star", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/star/6star", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/star/cold", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/ux/styles/stroke/dash", ["require", "exports", "ol3-lab/ux/styles/stroke/linedash"], function (require, exports, Dashes) {
    "use strict";
    return [
        {
            "stroke": {
                "color": "red",
                "width": 2,
                "lineDash": Dashes.dash
            }
        }
    ];
});
define("ol3-lab/ux/styles/stroke/dot", ["require", "exports", "ol3-lab/ux/styles/stroke/linedash"], function (require, exports, Dashes) {
    "use strict";
    return [
        {
            "stroke": {
                "color": "yellow",
                "width": 2,
                "lineDash": Dashes.dot
            }
        }
    ];
});
//# sourceMappingURL=index.js.map