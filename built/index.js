define("ol3-lab/labs/common/ajax", ["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function jsonp(url, args = {}, callback = "callback") {
        let d = $.Deferred();
        {
            args[callback] = "define";
            let uri = url + "?" + Object.keys(args).map(k => `${k}=${args[k]}`).join('&');
            require([uri], (data) => d.resolve(data));
        }
        return d;
    }
    exports.jsonp = jsonp;
    function post(url, args = {}) {
        let d = $.Deferred();
        {
            false && $.post(url, args, (data, status, XHR) => {
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
    function mapquest(url, args = {}, callback = "callback") {
        let d = $.Deferred();
        {
            args[callback] = "define";
            let values = [];
            Object.keys(args).forEach(k => {
                let value = args[k];
                if (Array.isArray(value)) {
                    let arr = value;
                    arr.forEach(v => values.push({ name: k, value: v }));
                }
                else {
                    values.push({ name: k, value: value });
                }
            });
            let uri = url + "?" + values.map(k => `${k.name}=${k.value}`).join('&');
            require([uri], (data) => d.resolve(data));
        }
        return d;
    }
    exports.mapquest = mapquest;
});
define("ol3-lab/ux/mapquest-directions-proxy", ["require", "exports", "ol3-lab/labs/common/ajax"], function (require, exports, ajax) {
    "use strict";
    const MapQuestKey = "cwm3pF5yuEGNp54sh96TF0irs5kCLd5y";
    class Directions {
        constructor() {
            this.sessionId = "";
        }
        directions(url, data) {
            let req = $.extend({
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
            return ajax.mapquest(url, req).then(response => {
                this.sessionId = response.route.sessionId;
                return response;
            });
        }
        static test(options) {
            if (!options) {
                options = {
                    from: "50 Datastream Plaza, Greenville, SC",
                    to: "550 S Main St 101, Greenville, SC 29601"
                };
            }
            let serviceUrl = `http://www.mapquestapi.com/directions/v2/route`;
            let request = {
                key: MapQuestKey,
                from: options.from,
                to: options.to
            };
            return new Directions().directions(serviceUrl, request).then(result => {
                console.log("directions", result);
                result.route.legs.forEach(leg => {
                    console.log(leg.destNarrative, leg.maneuvers.map(m => m.narrative).join("\n\t"));
                });
                return result;
            });
        }
    }
    return Directions;
});
define("ol3-lab/ux/mapquest-optimized-route-proxy", ["require", "exports", "ol3-lab/labs/common/ajax"], function (require, exports, ajax) {
    "use strict";
    const MapQuestKey = "cwm3pF5yuEGNp54sh96TF0irs5kCLd5y";
    class Route {
        constructor() {
            this.sessionId = "";
        }
        route(url, data) {
            let req = $.extend({
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
            return ajax.post(`${url}?key=${req.key}`, {
                locations: data.locations
            }).then(response => {
                this.sessionId = response.route.sessionId;
                return response;
            });
        }
        static test(options) {
            let serviceUrl = `http://www.mapquestapi.com/directions/v2/optimizedRoute`;
            let request = {
                key: MapQuestKey,
                from: options.from,
                to: options.to,
                locations: options.locations
            };
            return new Route().route(serviceUrl, request).then(result => {
                console.log("directions", result);
                result.route.legs.forEach(leg => {
                    console.log(leg.destNarrative, leg.maneuvers.map(m => m.narrative).join("\n\t"));
                });
                return result;
            });
        }
    }
    return Route;
});
define("ol3-lab/ux/mapquest-traffic-proxy", ["require", "exports", "ol3-lab/labs/common/ajax"], function (require, exports, ajax) {
    "use strict";
    const MapQuestKey = "cwm3pF5yuEGNp54sh96TF0irs5kCLd5y";
    class Traffic {
        incidents(url, data) {
            let req = $.extend({
                inFormat: "kvp",
                outFormat: "json"
            }, data);
            return ajax.jsonp(url, req).then(response => {
                return response;
            });
        }
        static test() {
            let serviceUrl = `http://www.mapquestapi.com/traffic/v2/incidents`;
            let request = {
                key: MapQuestKey,
                filters: "construction,incidents",
                boundingBox: [34.85, -82.4, 35, -82]
            };
            new Traffic().incidents(serviceUrl, request).then(result => {
                console.log("traffic incidents", result);
                result.incidents.forEach(i => {
                    console.log(i.shortDesc, i.fullDesc);
                });
            });
        }
    }
    return Traffic;
});
define("ol3-lab/ux/mapquest-geocoding-proxy", ["require", "exports", "ol3-lab/labs/common/ajax", "jquery"], function (require, exports, ajax, $) {
    "use strict";
    const MapQuestKey = "cwm3pF5yuEGNp54sh96TF0irs5kCLd5y";
    class Geocoding {
        reverse(url, data) {
            let req = $.extend({
                inFormat: "kvp",
                outFormat: "json"
            }, data);
            return ajax.jsonp(url, req).then(response => {
                return response;
            });
        }
        address(url, data) {
            let req = $.extend({
                maxResults: 1,
                thumbMaps: false,
                ignoreLatLngInput: false,
                delimiter: ",",
                intlMode: "AUTO",
                inFormat: "kvp",
                outFormat: "json"
            }, data);
            return ajax.jsonp(url, req).then(response => {
                return response;
            });
        }
        static test() {
            new Geocoding().address(`http://www.mapquestapi.com/geocoding/v1/address`, {
                key: MapQuestKey,
                location: "50 Datastream Plaza, Greenville, SC 29615",
                boundingBox: [34.85, -82.4, 35, -82]
            }).then(result => {
                console.log("geocoding address", result);
                result.results.forEach(r => console.log(r.providedLocation.location, r.locations.map(l => l.linkId).join(",")));
            });
            new Geocoding().reverse(`http://www.mapquestapi.com/geocoding/v1/reverse`, {
                key: MapQuestKey,
                lat: 34.790672,
                lng: -82.407674
            }).then(result => {
                console.log("geocoding reverse", result);
                result.results.forEach(r => console.log(r.providedLocation.latLng, r.locations.map(l => l.linkId).join(",")));
            });
        }
    }
    return Geocoding;
});
define("ol3-lab/labs/common/google-polyline", ["require", "exports"], function (require, exports) {
    "use strict";
    class PolylineEncoder {
        encodeCoordinate(coordinate, factor) {
            coordinate = Math.round(coordinate * factor);
            coordinate <<= 1;
            if (coordinate < 0) {
                coordinate = ~coordinate;
            }
            let output = '';
            while (coordinate >= 0x20) {
                output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 0x3f);
                coordinate >>= 5;
            }
            output += String.fromCharCode(coordinate + 0x3f);
            return output;
        }
        decode(str, precision = 5) {
            let index = 0, lat = 0, lng = 0, coordinates = [], latitude_change, longitude_change, factor = Math.pow(10, precision);
            while (index < str.length) {
                let byte = 0;
                let shift = 0;
                let result = 0;
                do {
                    byte = str.charCodeAt(index++) - 0x3f;
                    result |= (byte & 0x1f) << shift;
                    shift += 5;
                } while (byte >= 0x20);
                let latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
                shift = result = 0;
                do {
                    byte = str.charCodeAt(index++) - 0x3f;
                    result |= (byte & 0x1f) << shift;
                    shift += 5;
                } while (byte >= 0x20);
                longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
                lat += latitude_change;
                lng += longitude_change;
                coordinates.push([lat / factor, lng / factor]);
            }
            return coordinates;
        }
        encode(coordinates, precision = 5) {
            if (!coordinates.length)
                return '';
            let factor = Math.pow(10, precision), output = this.encodeCoordinate(coordinates[0][0], factor) + this.encodeCoordinate(coordinates[0][1], factor);
            for (let i = 1; i < coordinates.length; i++) {
                let a = coordinates[i], b = coordinates[i - 1];
                output += this.encodeCoordinate(a[0] - b[0], factor);
                output += this.encodeCoordinate(a[1] - b[1], factor);
            }
            return output;
        }
    }
    return PolylineEncoder;
});
define("ol3-lab/ux/mapquest-search-proxy", ["require", "exports", "ol3-lab/labs/common/ajax", "jquery", "ol3-lab/labs/common/google-polyline"], function (require, exports, ajax, $, G) {
    "use strict";
    const g = new G();
    const MapQuestKey = "cwm3pF5yuEGNp54sh96TF0irs5kCLd5y";
    class Search {
        constructor(url = "http://www.mapquestapi.com/search/v2") {
            this.url = url;
        }
        search(data, type = "search", key = MapQuestKey) {
            let req = $.extend({
                key: key,
                inFormat: "json",
                outFormat: "json",
                ambiguities: "ignore",
                units: "m",
                maxMatches: 100,
                shapeFormat: "cmp6"
            }, data);
            let url = this.url + "/" + type;
            return ajax.jsonp(url, req).then(response => {
                g.decode;
                return response;
            });
        }
        radius(data) {
            return this.search(data, "radius");
        }
        rectangle(data) {
            return this.search(data, "rectangle");
        }
        polygon(data) {
            return this.search(data, "polygon");
        }
        corridor(data) {
            return this.search($.extend({
                width: 5,
                bufferWidth: 0.25
            }, data), "corridor");
        }
        static test() {
            let search = new Search();
            search.radius({ origin: [34.85, -82.4] }).then(result => console.log("radius", result));
            search.rectangle({ boundingBox: [34.85, -82.4, 34.9, -82.35] }).then(result => console.log("rectangle", result));
            search.polygon({ polygon: [34.85, -82.4, 34.85, -82.35, 34.9, -82.35, 34.85, -82.4] }).then(result => console.log("polygon", result));
            search.corridor({ line: [34.85, -82.4, 34.9, -82.4], shapeFormat: "raw" }).then(result => console.log("corridor", result));
        }
    }
    return Search;
});
define("ol3-lab/ux/osrm-proxy", ["require", "exports", "ol3-lab/labs/common/ajax", "jquery", "ol3-lab/labs/common/google-polyline"], function (require, exports, ajax, $, Encoder) {
    "use strict";
    class Osrm {
        constructor(url = "http://router.project-osrm.org") {
            this.url = url;
        }
        viaroute(data) {
            let req = $.extend({}, data);
            req.loc = data.loc.map(l => `${l[0]},${l[1]}`).join("&loc=");
            return ajax.jsonp(this.url + "/viaroute", req, "jsonp");
        }
        nearest(loc) {
            return ajax.jsonp(this.url + "/nearest", {
                loc: loc
            }, "jsonp");
        }
        table() {
        }
        match() {
        }
        trip(loc) {
            let url = this.url + "/trip";
            return ajax.jsonp(url, {
                loc: loc.map(l => `${l[0]},${l[1]}`).join("&loc="),
            }, "jsonp");
        }
        static test() {
            let service = new Osrm();
            false && service.trip([[34.8, -82.85], [34.8, -82.80]]).then(result => {
                console.log("trip", result);
                let decoder = new Encoder();
                result.trips.map(trip => {
                    console.log("trip", trip.route_name, "route_geometry", decoder.decode(trip.route_geometry, 6).map(v => [v[1], v[0]]));
                });
            });
            service.viaroute({
                loc: [[34.85, -82.4], [34.85, -82.4]]
            }).then(result => {
                console.log("viaroute", result);
                let decoder = new Encoder();
                console.log("route_geometry", decoder.decode(result.route_geometry, 6).map(v => [v[1], v[0]]));
            });
            false && service.nearest([34.85, -82.4]).then(result => console.log("nearest", result));
        }
    }
    return Osrm;
});
define("ol3-lab", ["require", "exports", "openlayers", "ol3-lab/ux/mapquest-directions-proxy", "ol3-lab/ux/mapquest-optimized-route-proxy", "jquery", "resize-sensor"], function (require, exports, ol, Directions, Route, $, ResizeSensor) {
    "use strict";
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
                        source: new ol.source.OSM({
                            layer: "sat"
                        })
                    })]
            });
            return map;
        }
        renderRoute(map, result) {
            let lr = result.route.boundingBox.lr;
            let ul = result.route.boundingBox.ul;
            map.getView().fit([ul.lng, lr.lat, lr.lng, ul.lat], map.getSize());
            let points = [];
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
        resize(map) {
            console.log("map should become portrait in 3 seconds");
            setTimeout(() => $(".map").addClass("portrait"), 3000);
            console.log("map should become landscape in 5 seconds");
            setTimeout(() => $(".map").removeClass("portrait"), 5000);
            console.log("map should become resize aware in 7 seconds");
            setTimeout(() => {
                new ResizeSensor($(".map")[0], () => map.updateSize());
            }, 7000);
            console.log("map should become portrait in 9 seconds");
            setTimeout(() => $(".map").addClass("portrait"), 9000);
        }
    }
    function run() {
        console.log("ol3 playground");
        let tests = new Tests();
        let map = tests.heatmap();
        let l1 = [
            "550 S Main St 101, Greenville, SC 29601",
            "207 N Main St, Greenville, SC 29601",
            "100 S Main St 101, Greenville, SC 29601"
        ];
        let l2 = [
            "34.845546,-82.401672",
            "34.845547,-82.401674"
        ];
        false && Route.test({
            from: "50 Datastream Plaza, Greenville, SC",
            to: "50 Datastream Plaza, Greenville, SC",
            locations: l2
        }).then(result => tests.renderRoute(map, result));
        false && Directions.test({
            from: "50 Datastream Plaza, Greenville, SC",
            to: ["550 S Main St 101, Greenville, SC 29601", "207 N Main St, Greenville, SC 29601"]
        }).then(result => tests.renderRoute(map, result));
        tests.resize(map);
    }
    return run;
});
define("bower_components/ol3-fun/ol3-fun/common", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function parse(v, type) {
        if (typeof type === "string")
            return v;
        if (typeof type === "number")
            return parseFloat(v);
        if (typeof type === "boolean")
            return (v === "1" || v === "true");
        if (Array.isArray(type)) {
            return (v.split(",").map(v => parse(v, type[0])));
        }
        throw `unknown type: ${type}`;
    }
    exports.parse = parse;
    function getQueryParameters(options, url = window.location.href) {
        let opts = options;
        Object.keys(opts).forEach(k => {
            doif(getParameterByName(k, url), v => {
                let value = parse(v, opts[k]);
                if (value !== undefined)
                    opts[k] = value;
            });
        });
    }
    exports.getQueryParameters = getQueryParameters;
    function getParameterByName(name, url = window.location.href) {
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
        Object.keys(b).forEach(k => a[k] = b[k]);
        return a;
    }
    exports.mixin = mixin;
    function defaults(a, ...b) {
        b.forEach(b => {
            Object.keys(b).filter(k => a[k] === undefined).forEach(k => a[k] = b[k]);
        });
        return a;
    }
    exports.defaults = defaults;
    function cssin(name, css) {
        let id = `style-${name}`;
        let styleTag = document.getElementById(id);
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = id;
            styleTag.innerText = css;
            document.head.appendChild(styleTag);
        }
        let dataset = styleTag.dataset;
        dataset["count"] = parseInt(dataset["count"] || "0") + 1 + "";
        return () => {
            dataset["count"] = parseInt(dataset["count"] || "0") - 1 + "";
            if (dataset["count"] === "0") {
                styleTag.remove();
            }
        };
    }
    exports.cssin = cssin;
    function debounce(func, wait = 50, immediate = false) {
        let timeout;
        return ((...args) => {
            let later = () => {
                timeout = null;
                if (!immediate)
                    func.apply(this, args);
            };
            let callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
                func.call(this, args);
        });
    }
    exports.debounce = debounce;
    function html(html) {
        let d = document;
        let a = d.createElement("div");
        let b = d.createDocumentFragment();
        a.innerHTML = html;
        while (a.firstChild)
            b.appendChild(a.firstChild);
        return b.firstElementChild;
    }
    exports.html = html;
    function pair(a1, a2) {
        let result = [];
        a1.forEach(v1 => a2.forEach(v2 => result.push([v1, v2])));
        return result;
    }
    exports.pair = pair;
    function range(n) {
        var result = new Array(n);
        for (var i = 0; i < n; i++)
            result[i] = i;
        return result;
    }
    exports.range = range;
    function shuffle(array) {
        let currentIndex = array.length;
        let temporaryValue;
        let randomIndex;
        while (0 !== currentIndex) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex -= 1;
            temporaryValue = array[currentIndex];
            array[currentIndex] = array[randomIndex];
            array[randomIndex] = temporaryValue;
        }
        return array;
    }
    exports.shuffle = shuffle;
});
define("ol3-lab/labs/common/common", ["require", "exports", "bower_components/ol3-fun/ol3-fun/common"], function (require, exports, Common) {
    "use strict";
    return Common;
});
define("bower_components/ol3-symbolizer/ol3-symbolizer/format/base", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
});
define("bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function doif(v, cb) {
        if (v !== undefined && v !== null)
            cb(v);
    }
    function mixin(a, b) {
        Object.keys(b).forEach(k => a[k] = b[k]);
        return a;
    }
    class StyleConverter {
        fromJson(json) {
            return this.deserializeStyle(json);
        }
        toJson(style) {
            return this.serializeStyle(style);
        }
        setGeometry(feature) {
            let geom = feature.getGeometry();
            if (geom instanceof ol.geom.Polygon) {
                geom = geom.getInteriorPoint();
            }
            return geom;
        }
        assign(obj, prop, value) {
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
        }
        serializeStyle(style) {
            let s = {};
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
                "anchorXUnits,anchorYUnits,anchorOrigin".split(",").forEach(k => {
                    this.assign(s, k, style[`${k}_`]);
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
        }
        serializeColor(color) {
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
        }
        serializeFill(fill) {
            return this.serializeStyle(fill);
        }
        deserializeStyle(json) {
            let image;
            let text;
            let fill;
            let stroke;
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
            let s = new ol.style.Style({
                image: image,
                text: text,
                fill: fill,
                stroke: stroke
            });
            image && s.setGeometry(feature => this.setGeometry(feature));
            return s;
        }
        deserializeText(json) {
            json.rotation = json.rotation || 0;
            json.scale = json.scale || 1;
            let [x, y] = [json["offset-x"] || 0, json["offset-y"] || 0];
            {
                let p = new ol.geom.Point([x, y]);
                p.rotate(json.rotation, [0, 0]);
                p.scale(json.scale, json.scale);
                [x, y] = p.getCoordinates();
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
        }
        deserializeCircle(json) {
            let image = new ol.style.Circle({
                radius: json.radius,
                fill: json.fill && this.deserializeFill(json.fill),
                stroke: json.stroke && this.deserializeStroke(json.stroke)
            });
            image.setOpacity(json.opacity);
            return image;
        }
        deserializeStar(json) {
            let image = new ol.style.RegularShape({
                radius: json.radius,
                radius2: json.radius2,
                points: json.points,
                angle: json.angle,
                fill: json.fill && this.deserializeFill(json.fill),
                stroke: json.stroke && this.deserializeStroke(json.stroke)
            });
            doif(json.rotation, v => image.setRotation(v));
            doif(json.opacity, v => image.setOpacity(v));
            return image;
        }
        deserializeIcon(json) {
            if (!json.anchor) {
                json.anchor = [json["anchor-x"] || 0.5, json["anchor-y"] || 0.5];
            }
            let image = new ol.style.Icon({
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
        }
        deserializeSvg(json) {
            json.rotation = json.rotation || 0;
            json.scale = json.scale || 1;
            if (json.img) {
                let symbol = document.getElementById(json.img);
                if (!symbol) {
                    throw `unable to find svg element: ${json.img}`;
                }
                if (symbol) {
                    let path = (symbol.getElementsByTagName("path")[0]);
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
            let canvas = document.createElement("canvas");
            if (json.path) {
                {
                    [canvas.width, canvas.height] = json.imgSize.map(v => v * json.scale);
                    if (json.stroke && json.stroke.width) {
                        let dx = 2 * json.stroke.width * json.scale;
                        canvas.width += dx;
                        canvas.height += dx;
                    }
                }
                let ctx = canvas.getContext('2d');
                let path2d = new Path2D(json.path);
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
            let icon = new ol.style.Icon({
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
        }
        deserializeFill(json) {
            let fill = new ol.style.Fill({
                color: json && this.deserializeColor(json)
            });
            return fill;
        }
        deserializeStroke(json) {
            let stroke = new ol.style.Stroke();
            doif(json.color, v => stroke.setColor(v));
            doif(json.lineCap, v => stroke.setLineCap(v));
            doif(json.lineDash, v => stroke.setLineDash(v));
            doif(json.lineJoin, v => stroke.setLineJoin(v));
            doif(json.miterLimit, v => stroke.setMiterLimit(v));
            doif(json.width, v => stroke.setWidth(v));
            return stroke;
        }
        deserializeColor(fill) {
            if (fill.color) {
                return fill.color;
            }
            if (fill.gradient) {
                let type = fill.gradient.type;
                let gradient;
                if (0 === type.indexOf("linear(")) {
                    gradient = this.deserializeLinearGradient(fill.gradient);
                }
                else if (0 === type.indexOf("radial(")) {
                    gradient = this.deserializeRadialGradient(fill.gradient);
                }
                if (fill.gradient.stops) {
                    mixin(gradient, {
                        stops: fill.gradient.stops
                    });
                    let stops = fill.gradient.stops.split(";");
                    stops = stops.map(v => v.trim());
                    stops.forEach(colorstop => {
                        let stop = colorstop.match(/ \d+%/m)[0];
                        let color = colorstop.substr(0, colorstop.length - stop.length);
                        gradient.addColorStop(parseInt(stop) / 100, color);
                    });
                }
                return gradient;
            }
            if (fill.pattern) {
                let repitition = fill.pattern.repitition;
                let canvas = document.createElement('canvas');
                let spacing = canvas.width = canvas.height = fill.pattern.spacing | 6;
                let context = canvas.getContext('2d');
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
        }
        deserializeLinearGradient(json) {
            let rx = /\w+\((.*)\)/m;
            let [x0, y0, x1, y1] = JSON.parse(json.type.replace(rx, "[$1]"));
            let canvas = document.createElement('canvas');
            canvas.width = Math.max(x0, x1);
            canvas.height = Math.max(y0, y1);
            var context = canvas.getContext('2d');
            let gradient = context.createLinearGradient(x0, y0, x1, y1);
            mixin(gradient, {
                type: `linear(${[x0, y0, x1, y1].join(",")})`
            });
            return gradient;
        }
        deserializeRadialGradient(json) {
            let rx = /radial\((.*)\)/m;
            let [x0, y0, r0, x1, y1, r1] = JSON.parse(json.type.replace(rx, "[$1]"));
            let canvas = document.createElement('canvas');
            canvas.width = 2 * Math.max(x0, x1);
            canvas.height = 2 * Math.max(y0, y1);
            var context = canvas.getContext('2d');
            let gradient = context.createRadialGradient(x0, y0, r0, x1, y1, r1);
            mixin(gradient, {
                type: `radial(${[x0, y0, r0, x1, y1, r1].join(",")})`
            });
            return gradient;
        }
    }
    exports.StyleConverter = StyleConverter;
});
define("bower_components/ol3-symbolizer/index", ["require", "exports", "bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer"], function (require, exports, Symbolizer) {
    "use strict";
    return Symbolizer;
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
define("bower_components/ol3-layerswitcher/ol3-layerswitcher/ol3-layerswitcher", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function defaults(a, ...b) {
        b.forEach(b => {
            Object.keys(b).filter(k => a[k] === undefined).forEach(k => a[k] = b[k]);
        });
        return a;
    }
    function asArray(list) {
        let result = new Array(list.length);
        for (let i = 0; i < list.length; i++) {
            result.push(list[i]);
        }
        return result;
    }
    function allLayers(lyr) {
        let result = [];
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
    const DEFAULT_OPTIONS = {
        tipLabel: 'Layers',
        openOnMouseOver: false,
        closeOnMouseOut: false,
        openOnClick: true,
        closeOnClick: true,
        className: 'layer-switcher',
        target: null
    };
    class LayerSwitcher extends ol.control.Control {
        constructor(options) {
            options = defaults(options || {}, DEFAULT_OPTIONS);
            super(options);
            this.afterCreate(options);
        }
        afterCreate(options) {
            this.hiddenClassName = `ol-unselectable ol-control ${options.className}`;
            this.shownClassName = this.hiddenClassName + ' shown';
            let element = document.createElement('div');
            element.className = this.hiddenClassName;
            let button = this.button = document.createElement('button');
            button.setAttribute('title', options.tipLabel);
            element.appendChild(button);
            this.panel = document.createElement('div');
            this.panel.className = 'panel';
            element.appendChild(this.panel);
            this.unwatch = [];
            this.element = element;
            this.setTarget(options.target);
            if (options.openOnMouseOver) {
                element.addEventListener("mouseover", () => this.showPanel());
            }
            if (options.closeOnMouseOut) {
                element.addEventListener("mouseout", () => this.hidePanel());
            }
            if (options.openOnClick || options.closeOnClick) {
                button.addEventListener('click', e => {
                    this.isVisible() ? options.closeOnClick && this.hidePanel() : options.openOnClick && this.showPanel();
                    e.preventDefault();
                });
            }
        }
        dispatch(name, args) {
            let event = new Event(name);
            args && Object.keys(args).forEach(k => event[k] = args[k]);
            this["dispatchEvent"](event);
        }
        isVisible() {
            return this.element.className != this.hiddenClassName;
        }
        showPanel() {
            if (this.element.className != this.shownClassName) {
                this.element.className = this.shownClassName;
                this.renderPanel();
            }
        }
        hidePanel() {
            this.element.className = this.hiddenClassName;
            this.unwatch.forEach(f => f());
        }
        renderPanel() {
            this.ensureTopVisibleBaseLayerShown();
            while (this.panel.firstChild) {
                this.panel.removeChild(this.panel.firstChild);
            }
            var ul = document.createElement('ul');
            this.panel.appendChild(ul);
            this.state = [];
            let map = this.getMap();
            let view = map.getView();
            this.renderLayers(map, ul);
            {
                let doit = () => {
                    let res = view.getResolution();
                    this.state.filter(s => !!s.input).forEach(s => {
                        let min = s.layer.getMinResolution();
                        let max = s.layer.getMaxResolution();
                        console.log(res, min, max, s.layer.get("title"));
                        s.input.disabled = !(min <= res && (max === 0 || res < max));
                    });
                };
                let h = view.on("change:resolution", doit);
                doit();
                this.unwatch.push(() => view.unByKey(h));
            }
        }
        ;
        ensureTopVisibleBaseLayerShown() {
            let visibleBaseLyrs = allLayers(this.getMap()).filter(l => l.get('type') === 'base' && l.getVisible());
            if (visibleBaseLyrs.length)
                this.setVisible(visibleBaseLyrs.shift(), true);
        }
        ;
        setVisible(lyr, visible) {
            if (lyr.getVisible() !== visible) {
                if (visible && lyr.get('type') === 'base') {
                    allLayers(this.getMap()).filter(l => l !== lyr && l.get('type') === 'base' && l.getVisible()).forEach(l => this.setVisible(l, false));
                }
                lyr.setVisible(visible);
                this.dispatch(visible ? "show-layer" : "hide-layer", { layer: lyr });
            }
        }
        ;
        renderLayer(lyr, container) {
            let result;
            let li = document.createElement('li');
            container.appendChild(li);
            let lyrTitle = lyr.get('title');
            let label = document.createElement('label');
            label.htmlFor = uuid();
            lyr.on('load:start', () => li.classList.add("loading"));
            lyr.on('load:end', () => li.classList.remove("loading"));
            li.classList.toggle("loading", true === lyr.get("loading"));
            if ('getLayers' in lyr && !lyr.get('combine')) {
                if (!lyr.get('label-only')) {
                    let input = result = document.createElement('input');
                    input.id = label.htmlFor;
                    input.type = 'checkbox';
                    input.checked = lyr.getVisible();
                    input.addEventListener('change', () => {
                        ul.classList.toggle('hide-layer-group', !input.checked);
                        this.setVisible(lyr, input.checked);
                        let childLayers = lyr.getLayers();
                        this.state.filter(s => s.container === ul && s.input && s.input.checked).forEach(state => {
                            this.setVisible(state.layer, input.checked);
                        });
                    });
                    li.appendChild(input);
                }
                li.classList.add('group');
                label.innerHTML = lyrTitle;
                li.appendChild(label);
                let ul = document.createElement('ul');
                result && ul.classList.toggle('hide-layer-group', !result.checked);
                li.appendChild(ul);
                this.renderLayers(lyr, ul);
            }
            else {
                li.classList.add('layer');
                let input = result = document.createElement('input');
                input.id = label.htmlFor;
                if (lyr.get('type') === 'base') {
                    input.classList.add('basemap');
                    input.type = 'radio';
                    input.addEventListener("change", () => {
                        if (input.checked) {
                            asArray(this.panel.getElementsByClassName("basemap")).filter(i => i.tagName === "INPUT").forEach(i => {
                                if (i.checked && i !== input)
                                    i.checked = false;
                            });
                        }
                        this.setVisible(lyr, input.checked);
                    });
                }
                else {
                    input.type = 'checkbox';
                    input.addEventListener("change", () => {
                        this.setVisible(lyr, input.checked);
                    });
                }
                input.checked = lyr.get('visible');
                li.appendChild(input);
                label.innerHTML = lyrTitle;
                li.appendChild(label);
            }
            this.state.push({
                container: container,
                input: result,
                layer: lyr
            });
        }
        renderLayers(map, elm) {
            var lyrs = map.getLayers().getArray().slice().reverse();
            return lyrs.filter(l => !!l.get('title')).forEach(l => this.renderLayer(l, elm));
        }
    }
    exports.LayerSwitcher = LayerSwitcher;
});
define("bower_components/ol3-layerswitcher/index", ["require", "exports", "bower_components/ol3-layerswitcher/ol3-layerswitcher/ol3-layerswitcher"], function (require, exports, LayerSwitcher) {
    "use strict";
    return LayerSwitcher;
});
define("bower_components/ol3-popup/ol3-popup/paging/paging", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getInteriorPoint(geom) {
        if (geom["getInteriorPoint"])
            return geom["getInteriorPoint"]().getCoordinates();
        return ol.extent.getCenter(geom.getExtent());
    }
    const classNames = {
        pages: "pages",
        page: "page"
    };
    const eventNames = {
        add: "add",
        clear: "clear",
        goto: "goto"
    };
    class Paging {
        constructor(options) {
            this.options = options;
            this._pages = [];
            this.domNode = document.createElement("div");
            this.domNode.classList.add(classNames.pages);
            options.popup.domNode.appendChild(this.domNode);
        }
        get activePage() {
            return this._pages[this._activeIndex];
        }
        get activeIndex() {
            return this._activeIndex;
        }
        get count() {
            return this._pages.length;
        }
        dispatch(name) {
            this.domNode.dispatchEvent(new Event(name));
        }
        on(name, listener) {
            this.domNode.addEventListener(name, listener);
        }
        add(source, geom) {
            if (false) {
            }
            else if (typeof source === "string") {
                let page = document.createElement("div");
                page.innerHTML = source;
                this._pages.push({
                    element: page,
                    location: geom
                });
            }
            else if (source["appendChild"]) {
                let page = source;
                page.classList.add(classNames.page);
                this._pages.push({
                    element: page,
                    location: geom
                });
            }
            else if (source["then"]) {
                let d = source;
                let page = document.createElement("div");
                page.classList.add(classNames.page);
                this._pages.push({
                    element: page,
                    location: geom
                });
                $.when(d).then(v => {
                    if (typeof v === "string") {
                        page.innerHTML = v;
                    }
                    else {
                        page.appendChild(v);
                    }
                });
            }
            else if (typeof source === "function") {
                let page = document.createElement("div");
                page.classList.add("page");
                this._pages.push({
                    callback: source,
                    element: page,
                    location: geom
                });
            }
            else {
                throw `invalid source value: ${source}`;
            }
            this.dispatch(eventNames.add);
        }
        clear() {
            let activeChild = this._activeIndex >= 0 && this._pages[this._activeIndex];
            this._activeIndex = -1;
            this._pages = [];
            if (activeChild) {
                this.domNode.removeChild(activeChild.element);
                this.dispatch(eventNames.clear);
            }
        }
        goto(index) {
            let page = this._pages[index];
            if (!page)
                return;
            let activeChild = this._activeIndex >= 0 && this._pages[this._activeIndex];
            let d = $.Deferred();
            if (page.callback) {
                let refreshedContent = page.callback();
                $.when(refreshedContent).then(v => {
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
                        throw `invalid callback result: ${v}`;
                    }
                    d.resolve();
                });
            }
            else {
                d.resolve();
            }
            d.then(() => {
                activeChild && activeChild.element.remove();
                this._activeIndex = index;
                this.domNode.appendChild(page.element);
                if (page.location) {
                    this.options.popup.setPosition(getInteriorPoint(page.location));
                }
                this.dispatch(eventNames.goto);
            });
        }
        next() {
            (0 <= this.activeIndex) && (this.activeIndex < this.count) && this.goto(this.activeIndex + 1);
        }
        prev() {
            (0 < this.activeIndex) && this.goto(this.activeIndex - 1);
        }
    }
    exports.Paging = Paging;
});
define("bower_components/ol3-popup/ol3-popup/paging/page-navigator", ["require", "exports"], function (require, exports) {
    "use strict";
    const classNames = {
        prev: 'btn-prev',
        next: 'btn-next',
        hidden: 'hidden',
        active: 'active',
        inactive: 'inactive',
        pagenum: "page-num"
    };
    const eventNames = {
        show: "show",
        hide: "hide",
        prev: "prev",
        next: "next"
    };
    class PageNavigator {
        constructor(options) {
            this.options = options;
            let pages = options.pages;
            this.domNode = document.createElement("div");
            this.domNode.classList.add("pagination");
            this.domNode.innerHTML = this.template();
            this.prevButton = this.domNode.getElementsByClassName(classNames.prev)[0];
            this.nextButton = this.domNode.getElementsByClassName(classNames.next)[0];
            this.pageInfo = this.domNode.getElementsByClassName(classNames.pagenum)[0];
            pages.options.popup.domNode.appendChild(this.domNode);
            this.prevButton.addEventListener('click', () => this.dispatch(eventNames.prev));
            this.nextButton.addEventListener('click', () => this.dispatch(eventNames.next));
            pages.on("goto", () => pages.count > 1 ? this.show() : this.hide());
            pages.on("clear", () => this.hide());
            pages.on("goto", () => {
                let index = pages.activeIndex;
                let count = pages.count;
                let canPrev = 0 < index;
                let canNext = count - 1 > index;
                this.prevButton.classList.toggle(classNames.inactive, !canPrev);
                this.prevButton.classList.toggle(classNames.active, canPrev);
                this.nextButton.classList.toggle(classNames.inactive, !canNext);
                this.nextButton.classList.toggle(classNames.active, canNext);
                this.prevButton.disabled = !canPrev;
                this.nextButton.disabled = !canNext;
                this.pageInfo.innerHTML = `${1 + index} of ${count}`;
            });
        }
        dispatch(name) {
            this.domNode.dispatchEvent(new Event(name));
        }
        on(name, listener) {
            this.domNode.addEventListener(name, listener);
        }
        template() {
            return `<button class="arrow btn-prev"></button><span class="page-num">m of n</span><button class="arrow btn-next"></button>`;
        }
        hide() {
            this.domNode.classList.add(classNames.hidden);
            this.dispatch(eventNames.hide);
        }
        show() {
            this.domNode.classList.remove(classNames.hidden);
            this.dispatch(eventNames.show);
        }
    }
    return PageNavigator;
});
define("bower_components/ol3-popup/ol3-popup/ol3-popup", ["require", "exports", "jquery", "openlayers", "bower_components/ol3-popup/ol3-popup/paging/paging", "bower_components/ol3-popup/ol3-popup/paging/page-navigator"], function (require, exports, $, ol, paging_1, PageNavigator) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const css = `
.ol-popup {
    position: absolute;
    bottom: 12px;
    left: -50px;
}

.ol-popup:after {
    top: auto;
    bottom: -20px;
    left: 50px;
    border: solid transparent;
    border-top-color: inherit;
    content: " ";
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
    border-width: 10px;
    margin-left: -10px;
}

.ol-popup.docked {
    position:absolute;
    bottom:0;
    top:0;
    left:0;
    right:0;
    width:auto;
    height:auto;
    pointer-events: all;
}

.ol-popup.docked:after {
    display:none;
}

.ol-popup.docked .pages {
    max-height: inherit;
    overflow: auto;
    height: calc(100% - 60px);
}

.ol-popup.docked .pagination {
    position: absolute;
    bottom: 0;
}

.ol-popup .pagination .btn-prev::after {
    content: "⇦"; 
}

.ol-popup .pagination .btn-next::after {
    content: "⇨"; 
}

.ol-popup .pagination.hidden {
    display: none;
}

.ol-popup .ol-popup-closer {
    border: none;
    background: transparent;
    color: inherit;
    position: absolute;
    top: 0;
    right: 0;
    text-decoration: none;
}
    
.ol-popup .ol-popup-closer:after {
    content:'✖';
}

.ol-popup .ol-popup-docker {
    border: none;
    background: transparent;
    color: inherit;
    text-decoration: none;
    position: absolute;
    top: 0;
    right: 20px;
}

.ol-popup .ol-popup-docker:after {
    content:'□';
}
`;
    const classNames = {
        olPopup: 'ol-popup',
        olPopupDocker: 'ol-popup-docker',
        olPopupCloser: 'ol-popup-closer',
        olPopupContent: 'ol-popup-content',
        hidden: 'hidden',
        docked: 'docked'
    };
    const eventNames = {
        show: "show",
        hide: "hide"
    };
    function defaults(a, ...b) {
        b.forEach(b => {
            Object.keys(b).filter(k => a[k] === undefined).forEach(k => a[k] = b[k]);
        });
        return a;
    }
    function debounce(func, wait = 20, immediate = false) {
        let timeout;
        return ((...args) => {
            let later = () => {
                timeout = null;
                if (!immediate)
                    func.call(this, args);
            };
            let callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow)
                func.call(this, args);
        });
    }
    let isTouchDevice = () => {
        try {
            document.createEvent("TouchEvent");
            isTouchDevice = () => true;
        }
        catch (e) {
            isTouchDevice = () => false;
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
    const DEFAULT_OPTIONS = {
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
    class Popup extends ol.Overlay {
        constructor(options = DEFAULT_OPTIONS) {
            options = defaults({}, options, DEFAULT_OPTIONS);
            super(options);
            this.options = options;
            this.handlers = [];
            this.postCreate();
        }
        postCreate() {
            this.injectCss(css);
            let options = this.options;
            options.css && this.injectCss(options.css);
            let domNode = this.domNode = document.createElement('div');
            domNode.className = classNames.olPopup;
            this.setElement(domNode);
            if (typeof this.options.pointerPosition === "number") {
                this.setIndicatorPosition(this.options.pointerPosition);
            }
            if (this.options.dockContainer) {
                let dockContainer = $(this.options.dockContainer)[0];
                if (dockContainer) {
                    let docker = this.docker = document.createElement('label');
                    docker.className = classNames.olPopupDocker;
                    domNode.appendChild(docker);
                    docker.addEventListener('click', evt => {
                        this.isDocked() ? this.undock() : this.dock();
                        evt.preventDefault();
                    }, false);
                }
            }
            {
                let closer = this.closer = document.createElement('label');
                closer.className = classNames.olPopupCloser;
                domNode.appendChild(closer);
                closer.addEventListener('click', evt => {
                    this.hide();
                    evt.preventDefault();
                }, false);
            }
            {
                let content = this.content = document.createElement('div');
                content.className = classNames.olPopupContent;
                this.domNode.appendChild(content);
                isTouchDevice() && enableTouchScroll(content);
            }
            {
                let pages = this.pages = new paging_1.Paging({ popup: this });
                let pageNavigator = new PageNavigator({ pages: pages });
                pageNavigator.hide();
                pageNavigator.on("prev", () => pages.prev());
                pageNavigator.on("next", () => pages.next());
                pages.on("goto", () => this.panIntoView());
            }
            if (0) {
                let callback = this.setPosition;
                this.setPosition = debounce(args => callback.apply(this, args), 50);
            }
        }
        injectCss(css) {
            let style = $(`<style type='text/css'>${css}</style>`);
            style.appendTo('head');
            this.handlers.push(() => style.remove());
        }
        setIndicatorPosition(offset) {
            let [verticalPosition, horizontalPosition] = this.getPositioning().split("-", 2);
            let css = [];
            switch (verticalPosition) {
                case "bottom":
                    css.push(`.ol-popup { top: ${10 + this.options.yOffset}px; bottom: auto; }`);
                    css.push(`.ol-popup:after {  top: -20px; bottom: auto; transform: rotate(180deg);}`);
                    break;
                case "center":
                    break;
                case "top":
                    css.push(`.ol-popup { top: auto; bottom: ${10 + this.options.yOffset}px; }`);
                    css.push(`.ol-popup:after {  top: auto; bottom: -20px; transform: rotate(0deg);}`);
                    break;
            }
            switch (horizontalPosition) {
                case "center":
                    break;
                case "left":
                    css.push(`.ol-popup { left: auto; right: ${this.options.xOffset - offset - 10}px; }`);
                    css.push(`.ol-popup:after { left: auto; right: ${offset}px; }`);
                    break;
                case "right":
                    css.push(`.ol-popup { left: ${this.options.xOffset - offset - 10}px; right: auto; }`);
                    css.push(`.ol-popup:after { left: ${10 + offset}px; right: auto; }`);
                    break;
            }
            css.forEach(css => this.injectCss(css));
        }
        setPosition(position) {
            this.options.position = position;
            if (!this.isDocked()) {
                super.setPosition(position);
            }
            else {
                let view = this.options.map.getView();
                view.animate({
                    center: position
                });
            }
        }
        panIntoView() {
            if (!this.isOpened())
                return;
            if (this.isDocked())
                return;
            let p = this.getPosition();
            p && this.setPosition(p.map(v => v));
        }
        destroy() {
            this.handlers.forEach(h => h());
            this.handlers = [];
            this.getMap().removeOverlay(this);
            this.dispatch("dispose");
        }
        dispatch(name) {
            this["dispatchEvent"](new Event(name));
        }
        show(coord, html) {
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
        }
        hide() {
            this.isDocked() && this.undock();
            this.setPosition(undefined);
            this.pages.clear();
            this.dispatch(eventNames.hide);
            this.domNode.classList.add(classNames.hidden);
            return this;
        }
        isOpened() {
            return !this.domNode.classList.contains(classNames.hidden);
        }
        isDocked() {
            return this.domNode.classList.contains(classNames.docked);
        }
        dock() {
            let map = this.getMap();
            this.options.map = map;
            this.options.parentNode = this.domNode.parentElement;
            map.removeOverlay(this);
            this.domNode.classList.add(classNames.docked);
            $(this.options.dockContainer).append(this.domNode);
        }
        undock() {
            this.options.parentNode.appendChild(this.domNode);
            this.domNode.classList.remove(classNames.docked);
            this.options.map.addOverlay(this);
            this.setPosition(this.options.position);
        }
        applyOffset([x, y]) {
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
        }
    }
    exports.Popup = Popup;
});
define("bower_components/ol3-popup/index", ["require", "exports", "bower_components/ol3-popup/ol3-popup/ol3-popup"], function (require, exports, Popup) {
    "use strict";
    return Popup;
});
define("bower_components/ol3-symbolizer/ol3-symbolizer/common/ajax", ["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    class Ajax {
        constructor(url) {
            this.url = url;
            this.options = {
                use_json: true,
                use_cors: true
            };
        }
        jsonp(args, url = this.url) {
            let d = $.Deferred();
            args["callback"] = "define";
            let uri = url + "?" + Object.keys(args).map(k => `${k}=${args[k]}`).join('&');
            require([uri], (data) => d.resolve(data));
            return d;
        }
        ajax(method, args, url = this.url) {
            let isData = method === "POST" || method === "PUT";
            let isJson = this.options.use_json;
            let isCors = this.options.use_cors;
            let d = $.Deferred();
            let client = new XMLHttpRequest();
            if (isCors)
                client.withCredentials = true;
            let uri = url;
            let data = null;
            if (args) {
                if (isData) {
                    data = JSON.stringify(args);
                }
                else {
                    uri += '?';
                    let argcount = 0;
                    for (let key in args) {
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
            client.onload = () => {
                console.log("content-type", client.getResponseHeader("Content-Type"));
                if (client.status >= 200 && client.status < 300) {
                    isJson = isJson || 0 === client.getResponseHeader("Content-Type").indexOf("application/json");
                    d.resolve(isJson ? JSON.parse(client.response) : client.response);
                }
                else {
                    d.reject(client.statusText);
                }
            };
            client.onerror = () => d.reject(client.statusText);
            return d;
        }
        get(args) {
            return this.ajax('GET', args);
        }
        post(args) {
            return this.ajax('POST', args);
        }
        put(args) {
            return this.ajax('PUT', args);
        }
        delete(args) {
            return this.ajax('DELETE', args);
        }
    }
    return Ajax;
});
define("bower_components/ol3-symbolizer/ol3-symbolizer/ags/ags-catalog", ["require", "exports", "bower_components/ol3-symbolizer/ol3-symbolizer/common/ajax"], function (require, exports, Ajax) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function defaults(a, ...b) {
        b.filter(b => !!b).forEach(b => {
            Object.keys(b).filter(k => a[k] === undefined).forEach(k => a[k] = b[k]);
        });
        return a;
    }
    class Catalog {
        constructor(url) {
            this.ajax = new Ajax(url);
        }
        about(data) {
            let req = defaults({
                f: "pjson"
            }, data);
            return this.ajax.jsonp(req);
        }
        aboutFolder(folder) {
            let ajax = new Ajax(`${this.ajax.url}/${folder}`);
            let req = {
                f: "pjson"
            };
            return ajax.jsonp(req);
        }
        aboutFeatureServer(name) {
            let ajax = new Ajax(`${this.ajax.url}/${name}/FeatureServer`);
            let req = {
                f: "pjson"
            };
            return defaults(ajax.jsonp(req), { url: ajax.url });
        }
        aboutMapServer(name) {
            let ajax = new Ajax(`${this.ajax.url}/${name}/MapServer`);
            let req = {
                f: "pjson"
            };
            return defaults(ajax.jsonp(req), { url: ajax.url });
        }
        aboutLayer(layer) {
            let ajax = new Ajax(`${this.ajax.url}/${layer}`);
            let req = {
                f: "pjson"
            };
            return ajax.jsonp(req);
        }
    }
    exports.Catalog = Catalog;
});
define("bower_components/ol3-symbolizer/ol3-symbolizer/format/ags-symbolizer", ["require", "exports", "jquery", "bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer"], function (require, exports, $, Symbolizer) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const symbolizer = new Symbolizer.StyleConverter();
    const styleMap = {
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
        "esriSFSForwardDiagonal": "forward-diagonal",
    };
    const typeMap = {
        "esriSMS": "sms",
        "esriSLS": "sls",
        "esriSFS": "sfs",
        "esriPMS": "pms",
        "esriPFS": "pfs",
        "esriTS": "txt",
    };
    function range(a, b) {
        let result = new Array(b - a + 1);
        while (a <= b)
            result.push(a++);
        return result;
    }
    function clone(o) {
        return JSON.parse(JSON.stringify(o));
    }
    class StyleConverter {
        asWidth(v) {
            return v * 4 / 3;
        }
        asColor(color) {
            if (color.length === 4)
                return `rgba(${color[0]},${color[1]},${color[2]},${color[3] / 255})`;
            if (color.length === 3)
                return `rgb(${color[0]},${color[1]},${color[2]}})`;
            return "#" + color.map(v => ("0" + v.toString(16)).substr(0, 2)).join("");
        }
        fromSFSSolid(symbol, style) {
            style.fill = {
                color: this.asColor(symbol.color)
            };
            this.fromSLS(symbol.outline, style);
        }
        fromSFS(symbol, style) {
            switch (symbol.style) {
                case "esriSFSSolid":
                    this.fromSFSSolid(symbol, style);
                    break;
                case "esriSFSForwardDiagonal":
                    this.fromSFSSolid(symbol, style);
                    break;
                default:
                    throw `invalid-style: ${symbol.style}`;
            }
        }
        fromSMSCircle(symbol, style) {
            style.circle = {
                opacity: 1,
                radius: this.asWidth(symbol.size / 2),
                stroke: {
                    color: this.asColor(symbol.outline.color),
                },
                snapToPixel: true
            };
            this.fromSFSSolid(symbol, style.circle);
            this.fromSLS(symbol.outline, style.circle);
        }
        fromSMSCross(symbol, style) {
            style.star = {
                points: 4,
                angle: 0,
                radius: this.asWidth(symbol.size / Math.sqrt(2)),
                radius2: 0
            };
            this.fromSFSSolid(symbol, style.star);
            this.fromSLS(symbol.outline, style.star);
        }
        fromSMSDiamond(symbol, style) {
            style.star = {
                points: 4,
                angle: 0,
                radius: this.asWidth(symbol.size / Math.sqrt(2)),
                radius2: this.asWidth(symbol.size / Math.sqrt(2))
            };
            this.fromSFSSolid(symbol, style.star);
            this.fromSLS(symbol.outline, style.star);
        }
        fromSMSPath(symbol, style) {
            let size = 2 * this.asWidth(symbol.size);
            style.svg = {
                imgSize: [size, size],
                path: symbol.path,
                rotation: symbol.angle
            };
            this.fromSLSSolid(symbol, style.svg);
            this.fromSLS(symbol.outline, style.svg);
        }
        fromSMSSquare(symbol, style) {
            style.star = {
                points: 4,
                angle: Math.PI / 4,
                radius: this.asWidth(symbol.size / Math.sqrt(2)),
                radius2: this.asWidth(symbol.size / Math.sqrt(2))
            };
            this.fromSFSSolid(symbol, style.star);
            this.fromSLS(symbol.outline, style.star);
        }
        fromSMSX(symbol, style) {
            style.star = {
                points: 4,
                angle: Math.PI / 4,
                radius: this.asWidth(symbol.size / Math.sqrt(2)),
                radius2: 0
            };
            this.fromSFSSolid(symbol, style.star);
            this.fromSLS(symbol.outline, style.star);
        }
        fromSMS(symbol, style) {
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
                    throw `invalid-style: ${symbol.style}`;
            }
        }
        fromPMS(symbol, style) {
            style.image = {};
            style.image.src = symbol.url;
            if (symbol.imageData) {
                style.image.src = `data:image/png;base64,${symbol.imageData}`;
            }
            style.image["anchor-x"] = this.asWidth(symbol.xoffset);
            style.image["anchor-y"] = this.asWidth(symbol.yoffset);
            style.image.imgSize = [this.asWidth(symbol.width), this.asWidth(symbol.height)];
        }
        fromSLSSolid(symbol, style) {
            style.stroke = {
                color: this.asColor(symbol.color),
                width: this.asWidth(symbol.width),
                lineDash: [],
                lineJoin: "",
                miterLimit: 4
            };
        }
        fromSLS(symbol, style) {
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
                    console.warn(`invalid-style: ${symbol.style}`);
                    break;
            }
        }
        fromPFS(symbol, style) {
            throw "not-implemented";
        }
        fromTS(symbol, style) {
            throw "not-implemented";
        }
        fromJson(symbol) {
            let style = {};
            this.fromSymbol(symbol, style);
            return symbolizer.fromJson(style);
        }
        fromSymbol(symbol, style) {
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
                    throw `invalid-symbol-type: ${symbol.type}`;
            }
        }
        fromRenderer(renderer, args) {
            switch (renderer.type) {
                case "simple":
                    {
                        return this.fromJson(renderer.symbol);
                    }
                case "uniqueValue":
                    {
                        let styles = {};
                        let defaultStyle = (renderer.defaultSymbol) && this.fromJson(renderer.defaultSymbol);
                        if (renderer.uniqueValueInfos) {
                            renderer.uniqueValueInfos.forEach(info => {
                                styles[info.value] = this.fromJson(info.symbol);
                            });
                        }
                        return (feature) => styles[feature.get(renderer.field1)] || defaultStyle;
                    }
                case "classBreaks": {
                    let styles = {};
                    let classBreakRenderer = renderer;
                    if (classBreakRenderer.classBreakInfos) {
                        console.log("processing classBreakInfos");
                        if (classBreakRenderer.visualVariables) {
                            classBreakRenderer.visualVariables.forEach(vars => {
                                switch (vars.type) {
                                    case "sizeInfo": {
                                        let steps = range(classBreakRenderer.authoringInfo.visualVariables[0].minSliderValue, classBreakRenderer.authoringInfo.visualVariables[0].maxSliderValue);
                                        let dx = (vars.maxSize - vars.minSize) / steps.length;
                                        let dataValue = (vars.maxDataValue - vars.minDataValue) / steps.length;
                                        classBreakRenderer.classBreakInfos.forEach(classBreakInfo => {
                                            let icons = steps.map(step => {
                                                let json = $.extend({}, classBreakInfo.symbol);
                                                json.size = vars.minSize + dx * (dataValue - vars.minDataValue);
                                                let style = this.fromJson(json);
                                                styles[dataValue] = style;
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
                    return (feature) => {
                        debugger;
                        let value = feature.get(renderer.field1);
                        for (var key in styles) {
                            return styles[key];
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
        }
    }
    exports.StyleConverter = StyleConverter;
});
define("bower_components/ol3-symbolizer/ol3-symbolizer/common/common", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function getParameterByName(name, url = window.location.href) {
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
        Object.keys(b).forEach(k => a[k] = b[k]);
        return a;
    }
    exports.mixin = mixin;
    function defaults(a, b) {
        Object.keys(b).filter(k => a[k] == undefined).forEach(k => a[k] = b[k]);
        return a;
    }
    exports.defaults = defaults;
    function cssin(name, css) {
        let id = `style-${name}`;
        let styleTag = document.getElementById(id);
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = id;
            styleTag.innerText = css;
            document.head.appendChild(styleTag);
        }
        let dataset = styleTag.dataset;
        dataset["count"] = parseInt(dataset["count"] || "0") + 1 + "";
        return () => {
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
    Object.defineProperty(exports, "__esModule", { value: true });
    const esrijsonFormat = new ol.format.EsriJSON();
    function asParam(options) {
        return Object
            .keys(options)
            .map(k => `${k}=${options[k]}`)
            .join("&");
    }
    ;
    const DEFAULT_OPTIONS = {
        tileSize: 512,
        where: "1=1"
    };
    class ArcGisVectorSourceFactory {
        static create(options) {
            let d = $.Deferred();
            options = common_1.defaults(options, DEFAULT_OPTIONS);
            let srs = options.map.getView()
                .getProjection()
                .getCode()
                .split(":")
                .pop();
            let all = options.layers.map(layerId => {
                let d = $.Deferred();
                let tileGrid = ol.tilegrid.createXYZ({
                    tileSize: options.tileSize
                });
                let strategy = ol.loadingstrategy.tile(tileGrid);
                let loader = (extent, resolution, projection) => {
                    let box = {
                        xmin: extent[0],
                        ymin: extent[1],
                        xmax: extent[2],
                        ymax: extent[3]
                    };
                    let params = {
                        f: "json",
                        returnGeometry: true,
                        spatialRel: "esriSpatialRelIntersects",
                        geometry: encodeURIComponent(JSON.stringify(box)),
                        geometryType: "esriGeometryEnvelope",
                        resultType: "tile",
                        where: encodeURIComponent(options.where),
                        inSR: srs,
                        outSR: srs,
                        outFields: "*",
                    };
                    let query = `${options.services}/${options.serviceName}/FeatureServer/${layerId}/query?${asParam(params)}`;
                    $.ajax({
                        url: query,
                        dataType: 'jsonp',
                        success: response => {
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
                let source = new ol.source.Vector({
                    strategy: strategy,
                    loader: loader
                });
                let catalog = new AgsCatalog.Catalog(`${options.services}/${options.serviceName}/FeatureServer`);
                let converter = new Symbolizer.StyleConverter();
                catalog.aboutLayer(layerId).then(layerInfo => {
                    let layer = new ol.layer.Vector({
                        title: layerInfo.name,
                        source: source
                    });
                    let styleMap = converter.fromRenderer(layerInfo.drawingInfo.renderer, { url: "for icons?" });
                    layer.setStyle((feature, resolution) => {
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
            $.when.apply($, all).then((...args) => d.resolve(args));
            return d;
        }
    }
    exports.ArcGisVectorSourceFactory = ArcGisVectorSourceFactory;
});
define("ol3-lab/labs/ags-viewer", ["require", "exports", "jquery", "openlayers", "ol3-lab/labs/common/common", "bower_components/ol3-symbolizer/index", "bower_components/ol3-layerswitcher/index", "bower_components/ol3-popup/index", "bower_components/ol3-symbolizer/ol3-symbolizer/ags/ags-source"], function (require, exports, $, ol, common_2, ol3_symbolizer_1, ol3_layerswitcher_1, ol3_popup_1, ags_source_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let styler = new ol3_symbolizer_1.StyleConverter();
    function parse(v, type) {
        if (typeof type === "string")
            return v;
        if (typeof type === "number")
            return parseFloat(v);
        if (typeof type === "boolean")
            return (v === "1" || v === "true");
        if (Array.isArray(type)) {
            return (v.split(",").map(v => parse(v, type[0])));
        }
        throw `unknown type: ${type}`;
    }
    const html = `
<div class='popup'>
    <div class='popup-container'>
    </div>
</div>
`;
    const css = `
<style name="popup" type="text/css">
    html, body, .map {
        width: 100%;
        height: 100%;
        padding: 0;
        overflow: hidden;
        margin: 0;    
    }
</style>
`;
    const css_popup = `
.popup-container {
    position: absolute;
    top: 1em;
    right: 0.5em;
    width: 10em;
    bottom: 1em;
    z-index: 1;
    pointer-events: none;
}

.ol-popup {
    color: white;
    background-color: rgba(77,77,77,0.7);
    min-width: 200px;
}

.ol-popup:after {
    border-top-color: rgba(77,77,77,0.7);
}

`;
    let center = {
        fire: [-117.754430386, 34.2606862490001],
        wichita: [-97.4, 37.8],
        vegas: [-115.235, 36.173]
    };
    function run() {
        $(html).appendTo(".map");
        $(css).appendTo("head");
        let options = {
            srs: 'EPSG:4326',
            center: center.vegas,
            zoom: 10,
            services: "http://sampleserver3.arcgisonline.com/ArcGIS/rest/services",
            serviceName: "SanFrancisco/311Incidents",
            layers: [0]
        };
        {
            let opts = options;
            Object.keys(opts).forEach(k => {
                common_2.doif(common_2.getParameterByName(k), v => {
                    let value = parse(v, opts[k]);
                    if (value !== undefined)
                        opts[k] = value;
                });
            });
        }
        let map = new ol.Map({
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
        }).then(agsLayers => {
            agsLayers.forEach(agsLayer => map.addLayer(agsLayer));
            let layerSwitcher = new ol3_layerswitcher_1.LayerSwitcher();
            layerSwitcher.setMap(map);
            let popup = new ol3_popup_1.Popup({
                css: `
            .ol-popup {
                background-color: white;
            }
            .ol-popup .page {
                max-height: 200px;
                overflow-y: auto;
            }
            `
            });
            map.addOverlay(popup);
            map.on("click", (event) => {
                console.log("click");
                let coord = event.coordinate;
                popup.hide();
                let pageNum = 0;
                map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
                    let page = document.createElement('p');
                    let keys = Object.keys(feature.getProperties()).filter(key => {
                        let v = feature.get(key);
                        if (typeof v === "string")
                            return true;
                        if (typeof v === "number")
                            return true;
                        return false;
                    });
                    page.title = "" + ++pageNum;
                    page.innerHTML = `<table>${keys.map(k => `<tr><td>${k}</td><td>${feature.get(k)}</td></tr>`).join("")}</table>`;
                    popup.pages.add(page, feature.getGeometry());
                });
                popup.show(coord, `<label>${pageNum} Features Found</label>`);
                popup.pages.goto(0);
            });
        });
        return map;
    }
    exports.run = run;
});
define("ol3-lab/labs/facebook", ["require", "exports", "openlayers", "jquery"], function (require, exports, ol, $) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
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
    const css = `
<style id='authentication_css'>
    html, body, .map {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
    .authentication .facebook-toolbar {
        position: absolute;
        bottom: 30px;
        right: 20px;
    }

    .logout-button {
        background-color: #365899;
        border: 1px solid #365899;
        color: white;
        border-radius: 3px;
        font-size: 8pt !important;
        height: 20px;
        vertical-align: bottom;
    }
</style>
`;
    const html = `
<div class='authentication'>
    <div id="events"></div>

    <div class='facebook-toolbar'>
    <div class="fb-like" 
        data-href="${window.location}" 
        data-layout="button_count" 
        data-action="recommend" 
        data-size="small" 
        data-show-faces="true" 
        data-share="true">
    </div>

    <fb:login-button class='login-button' scope="public_profile,user_tagged_places,email" onlogin="$('#events').trigger('fb-login');"/>
    <button class='logout-button'>Logout</button>
    </div>
</div>
`;
    class Facebook {
        load(appId) {
            let d = $.Deferred();
            requirejs(['facebook'], (FB) => {
                this.FB = FB;
                FB.init({
                    appId: appId,
                    cookie: true,
                    xfbml: true,
                    version: 'v2.7'
                });
                d.resolve(FB);
            });
            return d;
        }
        on(event, cb) {
            this.FB.Event.subscribe(event, cb);
            return { off: () => this.FB.Event.unsubscribe(event, cb) };
        }
        api(name, args = {}) {
            let d = $.Deferred();
            this.FB.api(`${name}`, 'get', args, (args) => {
                d.resolve(args);
            });
            return d;
        }
        getUserInfo() {
            return this.api('me').done(v => {
                this.user_id = v.id;
            });
        }
        getPlaces(user_id = this.user_id) {
            return this.api(`${this.user_id}/tagged_places`);
        }
        getPicture() {
            return this.api(`${this.user_id}/picture`);
        }
    }
    function createMap(fb) {
        let features = new ol.Collection();
        let source = new ol.source.Vector({
            features: features
        });
        let vectorLayer = new ol.layer.Vector({
            source: source
        });
        let style = new ol.style.Style({
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
        let basemap = new ol.layer.Tile({
            source: new ol.source.OSM()
        });
        let map = new ol.Map({
            target: "map",
            view: new ol.View({
                projection: "EPSG:4326",
                center: [-82.4, 34.85],
                zoom: 10
            }),
            layers: [basemap, vectorLayer]
        });
        fb.getUserInfo().then(args => {
            fb.getPlaces(args.id).then(places => {
                places.data.forEach(data => {
                    let loc = data.place.location;
                    let geom = new ol.geom.Point([loc.longitude, loc.latitude]);
                    let feature = new ol.Feature(geom);
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
                let extent = source.getExtent();
                map.getView().fit(extent, map.getSize());
            });
        });
        return map;
    }
    function run() {
        $(css).appendTo("head");
        $(html).appendTo("body");
        $('.logout-button').hide();
        let fb = new Facebook();
        fb.load('639680389534759').then(FB => {
            let map;
            let onLoggedIn = () => {
                console.log("logged in");
                $('.login-button').hide();
                $('.logout-button').show();
                map = createMap(fb);
                fb.getPicture().then(picture => {
                    if (picture.data.is_silhouette)
                        return;
                    $(`<img class='fb-pic' src='${picture.data.url}'/>'`).prependTo('.facebook-toolbar');
                });
            };
            let onLoggedOut = () => {
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
            $('.logout-button').click(() => FB.logout());
            FB.getLoginStatus(args => {
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
define("bower_components/ol3-fun/ol3-fun/ol3-polyline", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    const Polyline = ol.format.Polyline;
    class PolylineEncoder {
        constructor(precision = 5, stride = 2) {
            this.precision = precision;
            this.stride = stride;
        }
        flatten(points) {
            let nums = new Array(points.length * this.stride);
            let i = 0;
            points.forEach(p => p.map(p => nums[i++] = p));
            return nums;
        }
        unflatten(nums) {
            let points = new Array(nums.length / this.stride);
            for (let i = 0; i < nums.length / this.stride; i++) {
                points[i] = nums.slice(i * this.stride, (i + 1) * this.stride);
            }
            return points;
        }
        round(nums) {
            let factor = Math.pow(10, this.precision);
            return nums.map(n => Math.round(n * factor) / factor);
        }
        decode(str) {
            let nums = Polyline.decodeDeltas(str, this.stride, Math.pow(10, this.precision));
            return this.unflatten(this.round(nums));
        }
        encode(points) {
            return Polyline.encodeDeltas(this.flatten(points), this.stride, Math.pow(10, this.precision));
        }
    }
    return PolylineEncoder;
});
define("ol3-lab/labs/common/ol3-polyline", ["require", "exports", "bower_components/ol3-fun/ol3-fun/ol3-polyline"], function (require, exports, PolylineEncoder) {
    "use strict";
    return PolylineEncoder;
});
define("bower_components/ol3-symbolizer/ol3-symbolizer/styles/stroke/linedash", ["require", "exports"], function (require, exports) {
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
define("bower_components/ol3-symbolizer/ol3-symbolizer/styles/stroke/dashdotdot", ["require", "exports", "bower_components/ol3-symbolizer/ol3-symbolizer/styles/stroke/linedash"], function (require, exports, Dashes) {
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
define("bower_components/ol3-symbolizer/ol3-symbolizer/styles/stroke/solid", ["require", "exports"], function (require, exports) {
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
define("bower_components/ol3-symbolizer/ol3-symbolizer/styles/text/text", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/labs/common/myjson", ["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MyJson {
        constructor(json, id = "4acgf", endpoint = "https://api.myjson.com/bins") {
            this.json = json;
            this.id = id;
            this.endpoint = endpoint;
        }
        get() {
            return $.ajax({
                url: `${this.endpoint}/${this.id}`,
                type: 'GET'
            }).then(json => this.json = json);
        }
        put() {
            return $.ajax({
                url: `${this.endpoint}/${this.id}`,
                type: 'PUT',
                data: JSON.stringify(this.json),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            }).then(json => this.json = json);
        }
        post() {
            return $.ajax({
                url: `${this.endpoint}`,
                type: 'POST',
                data: JSON.stringify(this.json),
                contentType: 'application/json; charset=utf-8',
                dataType: 'json'
            }).then(data => {
                debugger;
                this.id = data.uri.substr(1 + this.endpoint.length);
            });
        }
    }
    exports.MyJson = MyJson;
});
define("ol3-lab/labs/mapmaker", ["require", "exports", "jquery", "openlayers", "ol3-lab/labs/common/common", "ol3-lab/labs/common/ol3-polyline", "bower_components/ol3-symbolizer/index", "bower_components/ol3-symbolizer/ol3-symbolizer/styles/stroke/dashdotdot", "bower_components/ol3-symbolizer/ol3-symbolizer/styles/stroke/solid", "bower_components/ol3-symbolizer/ol3-symbolizer/styles/text/text", "ol3-lab/labs/common/myjson"], function (require, exports, $, ol, common_3, reduce, ol3_symbolizer_2, dashdotdot, strokeStyle, textStyle, myjson_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let styler = new ol3_symbolizer_2.StyleConverter();
    function parse(v, type) {
        if (typeof type === "string")
            return v;
        if (typeof type === "number")
            return parseFloat(v);
        if (typeof type === "boolean")
            return (v === "1" || v === "true");
        if (Array.isArray(type)) {
            return (v.split(",").map(v => parse(v, type[0])));
        }
        throw `unknown type: ${type}`;
    }
    let html = `
<div class='mapmaker'>
    <div class='toolbar'>
        <button class='share'>Share</button>
        <button class='clone'>Add</button>
    </div>
    <div class='dock-container'>
    </div>
</div>
`;
    let css = `
<style>
    html, body, .map {
        width: 100%;
        height: 100%;
        padding: 0;
        overflow: hidden;
        margin: 0;    
    }

    .map {
        background-color: black;
    }

    .map.dark {
        background: black;
    }

    .map.light {
        background: silver;
    }

    .map.bright {
        background: white;
    }

    .mapmaker {
        position: absolute;
        top: 0;
        left: 0;
        width: 0;
        height: 0;
        background: transparent;
        z-index: 1;
    }
    .mapmaker .toolbar {
        position: relative;
        top: 10px;
        left: 42px;
        width: 240px;
    }
    .mapmaker .toolbar button {
        border: 1px solid transparent;
        background: transparent;
    }

    .mapmaker .toolbar button:hover {
        border: 1px solid black;
        background: white;
    }

    .mapmaker .dock-container {
        position: relative;
        background: transparent;
        left: 10em;
        top: 1em;
        width: 12em;
        height: 15em;
    }

    button.clone {
        display:none;
    }
</style>
`;
    const DEFAULT_OPTIONS = {
        srs: 'EPSG:4326',
        center: [-82.4, 34.85],
        zoom: 15,
        background: "bright",
        myjson: "",
        geom: "",
        color: "red",
        modify: false,
        basemap: "osm"
    };
    function run(options) {
        options = common_3.defaults(options || {}, DEFAULT_OPTIONS);
        $(html).appendTo(".map");
        $(css).appendTo("head");
        {
            let opts = options;
            Object.keys(opts).forEach(k => {
                common_3.doif(common_3.getParameterByName(k), v => {
                    let value = parse(v, opts[k]);
                    if (value !== undefined)
                        opts[k] = value;
                });
            });
        }
        let d = $.Deferred();
        if (options.myjson) {
            let myjson = new myjson_1.MyJson(options, options.myjson);
            myjson.get().then(() => {
                myjson.json.myjson = options.myjson;
                d.resolve(myjson.json);
            });
        }
        else {
            d.resolve(options);
        }
        return d.then(options => {
            $("#map").addClass(options.background);
            let map = new ol.Map({
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
            let features = new ol.Collection();
            let layer = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: features
                })
            });
            map.addLayer(layer);
            strokeStyle[0].stroke.color = options.color;
            layer.setStyle(strokeStyle.map(s => styler.fromJson(s)));
            if (options.geom) {
                options.geom.split(",").forEach((encoded, i) => {
                    let geom;
                    let points = new reduce(6, 2).decode(encoded);
                    geom = new ol.geom.Polygon([points]);
                    let feature = new ol.Feature(geom);
                    textStyle[0].text.text = `${i + 1}`;
                    let style = textStyle.concat(strokeStyle).map(s => styler.fromJson(s));
                    feature.setStyle(style);
                    features.push(feature);
                });
                if (!common_3.getParameterByName("center")) {
                    map.getView().fit(layer.getSource().getExtent(), map.getSize());
                }
            }
            if (options.modify) {
                let modify = new ol.interaction.Modify({
                    features: features,
                    deleteCondition: event => ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event)
                });
                map.addInteraction(modify);
                $("button.clone").show().click(() => {
                    let [a, b, c, d] = map.getView().calculateExtent([100, 100]);
                    let geom = new ol.geom.Polygon([[[a, b], [c, b], [c, d], [a, d]]]);
                    let feature = new ol.Feature(geom);
                    feature.setStyle(styler.fromJson(dashdotdot[0]));
                    features.push(feature);
                    modify && map.removeInteraction(modify);
                    modify = new ol.interaction.Modify({
                        features: new ol.Collection([feature]),
                        deleteCondition: event => ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event)
                    });
                    map.addInteraction(modify);
                });
            }
            $("button.share").click(() => {
                let href = window.location.href;
                href = href.substring(0, href.length - window.location.search.length);
                options.center = new reduce(6, 2).round(map.getView().getCenter());
                options.zoom = map.getView().getZoom();
                if (options.modify) {
                    options.geom = features.getArray().map(feature => {
                        let geom = (feature && feature.getGeometry());
                        let points = geom.getCoordinates()[0];
                        return new reduce(6, 2).encode(points);
                    }).join(",");
                    console.log("geom size", options.geom.length);
                    if (options.myjson || (options.geom.length > 1000)) {
                        let myjson = new myjson_1.MyJson(options);
                        if (options.myjson) {
                            myjson.id = options.myjson;
                            myjson.put().then(() => {
                                let url = encodeURI(`${href}?run=ol3-lab/labs/mapmaker&myjson=${myjson.id}`);
                                window.open(url, "_blank");
                            });
                        }
                        else {
                            myjson.post().then(() => {
                                let url = encodeURI(`${href}?run=ol3-lab/labs/mapmaker&myjson=${myjson.id}`);
                                window.open(url, "_blank");
                            });
                        }
                    }
                    else {
                        let opts = options;
                        let querystring = Object.keys(options).map(k => `${k}=${opts[k]}`).join("&");
                        let url = encodeURI(`${href}?run=ol3-lab/labs/mapmaker&${querystring}`);
                        window.open(url, "_blank");
                    }
                }
                else {
                    let opts = options;
                    let querystring = Object.keys(options).map(k => `${k}=${opts[k]}`).join("&");
                    let url = encodeURI(`${href}?run=ol3-lab/labs/mapmaker&${querystring}`);
                    window.open(url, "_blank");
                }
            });
            return map;
        });
    }
    exports.run = run;
});
define("bower_components/ol3-input/ol3-input/ol3-input", ["require", "exports", "openlayers", "bower_components/ol3-fun/ol3-fun/common"], function (require, exports, ol, common_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const css = `
    .ol-input {
        position:absolute;
    }
    .ol-input.top {
        top: 0.5em;
    }
    .ol-input.top-1 {
        top: 1.5em;
    }
    .ol-input.top-2 {
        top: 2.5em;
    }
    .ol-input.top-3 {
        top: 3.5em;
    }
    .ol-input.top-4 {
        top: 4.5em;
    }
    .ol-input.left {
        left: 0.5em;
    }
    .ol-input.left-1 {
        left: 1.5em;
    }
    .ol-input.left-2 {
        left: 2.5em;
    }
    .ol-input.left-3 {
        left: 3.5em;
    }
    .ol-input.left-4 {
        left: 4.5em;
    }
    .ol-input.bottom {
        bottom: 0.5em;
    }
    .ol-input.bottom-1 {
        bottom: 1.5em;
    }
    .ol-input.bottom-2 {
        bottom: 2.5em;
    }
    .ol-input.bottom-3 {
        bottom: 3.5em;
    }
    .ol-input.bottom-4 {
        bottom: 4.5em;
    }
    .ol-input.right {
        right: 0.5em;
    }
    .ol-input.right-1 {
        right: 1.5em;
    }
    .ol-input.right-2 {
        right: 2.5em;
    }
    .ol-input.right-3 {
        right: 3.5em;
    }
    .ol-input.right-4 {
        right: 4.5em;
    }
    .ol-input button {
        min-height: 1.375em;
        min-width: 1.375em;
        width: auto;
        display: inline;
    }
    .ol-input.left button {
        float:right;
    }
    .ol-input.right button {
        float:left;
    }
    .ol-input input {
        height: 2.175em;
        width: 16em;
        border: none;
        padding: 0;
        margin: 0;
        margin-left: 2px;
        margin-top: 2px;
        vertical-align: top;
    }
    .ol-input input.ol-hidden {
        width: 0;
        margin: 0;
    }
`;
    let olcss = {
        CLASS_CONTROL: 'ol-control',
        CLASS_UNSELECTABLE: 'ol-unselectable',
        CLASS_UNSUPPORTED: 'ol-unsupported',
        CLASS_HIDDEN: 'ol-hidden'
    };
    const expando = {
        right: '»',
        left: '«'
    };
    const defaults = {
        className: 'ol-input bottom left',
        expanded: false,
        autoClear: false,
        autoCollapse: true,
        autoSelect: true,
        canCollapse: true,
        hideButton: false,
        closedText: expando.right,
        openedText: expando.left,
        placeholderText: 'Search'
    };
    class Input extends ol.control.Control {
        static create(options) {
            common_4.cssin('ol-input', css);
            options = common_4.mixin({
                openedText: options.className && -1 < options.className.indexOf("left") ? expando.left : expando.right,
                closedText: options.className && -1 < options.className.indexOf("left") ? expando.right : expando.left,
            }, options || {});
            options = common_4.mixin(common_4.mixin({}, defaults), options);
            let element = document.createElement('div');
            element.className = `${options.className} ${olcss.CLASS_UNSELECTABLE} ${olcss.CLASS_CONTROL}`;
            let geocoderOptions = common_4.mixin({
                element: element,
                target: options.target,
                expanded: false
            }, options);
            return new Input(geocoderOptions);
        }
        constructor(options) {
            if (options.hideButton) {
                options.canCollapse = false;
                options.autoCollapse = false;
                options.expanded = true;
            }
            super({
                element: options.element,
                target: options.target
            });
            let button = this.button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.title = options.placeholderText;
            options.element.appendChild(button);
            if (options.hideButton) {
                button.style.display = "none";
            }
            let input = this.input = document.createElement('input');
            input.placeholder = options.placeholderText;
            options.element.appendChild(input);
            button.addEventListener("click", () => {
                options.expanded ? this.collapse(options) : this.expand(options);
            });
            input.addEventListener("keypress", (args) => {
                if (args.key === "Enter") {
                    button.focus();
                    options.autoCollapse && this.collapse(options);
                }
            });
            input.addEventListener("change", () => {
                let args = {
                    type: "change",
                    value: input.value
                };
                if (options.autoSelect) {
                    input.select();
                }
                if (options.autoClear) {
                    input.value = "";
                }
                this.dispatchEvent(args);
                if (options.onChange)
                    options.onChange(args);
            });
            input.addEventListener("blur", () => {
            });
            options.expanded ? this.expand(options) : this.collapse(options);
        }
        collapse(options) {
            if (!options.canCollapse)
                return;
            options.expanded = false;
            this.input.classList.toggle(olcss.CLASS_HIDDEN, true);
            this.button.classList.toggle(olcss.CLASS_HIDDEN, false);
            this.button.innerHTML = options.closedText;
        }
        expand(options) {
            options.expanded = true;
            this.input.classList.toggle(olcss.CLASS_HIDDEN, false);
            this.button.classList.toggle(olcss.CLASS_HIDDEN, true);
            this.button.innerHTML = options.openedText;
            this.input.focus();
            this.input.select();
        }
        on(type, cb) {
            super.on(type, cb);
        }
    }
    exports.Input = Input;
});
define("bower_components/ol3-input/index", ["require", "exports", "bower_components/ol3-input/ol3-input/ol3-input"], function (require, exports, Input) {
    "use strict";
    return Input;
});
define("bower_components/ol3-input/ol3-input/providers/osm", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class OpenStreet {
        constructor() {
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
        getParameters(options) {
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
        }
        handleResponse(args) {
            return args.sort(v => v.importance || 1).map(result => ({
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
            }));
        }
    }
    exports.OpenStreet = OpenStreet;
});
define("ol3-lab/labs/geocoder", ["require", "exports", "ol3-lab/labs/mapmaker", "bower_components/ol3-input/index", "bower_components/ol3-input/ol3-input/providers/osm"], function (require, exports, MapMaker, ol3_input_1, osm_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function run() {
        MapMaker.run().then(map => {
            let searchProvider = new osm_1.OpenStreet();
            let changeHandler = (args) => {
                if (!args.value)
                    return;
                console.log("search", args.value);
                let searchArgs = searchProvider.getParameters({
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
                }).then(json => {
                    let results = searchProvider.handleResponse(json);
                    results.some(r => {
                        console.log(r);
                        if (r.original.boundingbox) {
                            let [lat1, lat2, lon1, lon2] = r.original.boundingbox.map(v => parseFloat(v));
                            map.getView().fit([lon1, lat1, lon2, lat2], map.getSize());
                        }
                        else {
                            map.getView().setCenter([r.lon, r.lat]);
                        }
                        return true;
                    });
                }).fail(() => {
                    console.error("geocoder failed");
                });
            };
            let geocoder = ol3_input_1.Input.create({
                closedText: "+",
                openedText: "−",
                placeholderText: "Bottom Left Search",
                onChange: changeHandler
            });
            map.addControl(geocoder);
            map.addControl(ol3_input_1.Input.create({
                className: 'ol-input bottom right',
                expanded: true,
                placeholderText: "Bottom Right Search",
                onChange: changeHandler
            }));
            map.addControl(ol3_input_1.Input.create({
                className: 'ol-input top right',
                expanded: false,
                placeholderText: "Top Right",
                onChange: changeHandler
            }));
            map.addControl(ol3_input_1.Input.create({
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
    Object.defineProperty(exports, "__esModule", { value: true });
    const client_id = '987911803084-a6cafnu52d7lkr8vfrtl4modrpinr1os.apps.googleusercontent.com';
    const api_key = 'AIzaSyCfuluThuQ0j7tCHg9GRf0lwDRHNUsZs6o';
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
    let html = `
    <div class="g-signin2" data-onsuccess="giAsyncInit" data-theme="dark"></div>
    <button class='logout-button'>Logout</button>
`;
    function createMap() {
        let basemap = new ol.layer.Tile({
            source: new ol.source.OSM()
        });
        let map = new ol.Map({
            target: "map",
            view: new ol.View({
                projection: "EPSG:4326",
                center: [-82.4, 34.85],
                zoom: 10
            }),
            layers: [basemap]
        });
    }
    class GoogleIdentity {
        constructor(client_id) {
            this.client_id = client_id;
        }
        load() {
            let d = $.Deferred();
            $(`
            <meta name="google-signin-scope" content="profile email https://www.googleapis.com/auth/calendar.readonly">
            <meta name="google-signin-client_id" content="${this.client_id}">
            <script src="https://apis.google.com/js/platform.js" async defer></script>
        `).appendTo('head');
            window.giAsyncInit = (args) => {
                this.id_token = args.getAuthResponse().id_token;
                d.resolve(args);
                delete window.giAsyncInit;
            };
            return d;
        }
        showInfo(googleUser) {
            createMap();
            let profile = googleUser.getBasicProfile();
            $(`<img src='${profile.getImageUrl()}'>${profile.getName()}</img>`).appendTo('body');
        }
        ;
        logout() {
            var auth2 = gapi.auth2.getAuthInstance();
            auth2.signOut().then(function () {
                console.log('User signed out.');
            });
        }
    }
    function run() {
        $(html).appendTo('body');
        require(["gapi"], (gapi) => {
            gapi.load('client', () => {
                debugger;
                gapi.client.setApiKey(api_key);
                gapi.auth2.init({
                    client_id: client_id,
                    scope: 'profile https://www.googleapis.com/auth/calendar.readonly'
                }).then(() => {
                    debugger;
                    let auth2 = gapi.auth2.getAuthInstance();
                });
            });
        });
        return;
        let gi = new GoogleIdentity(client_id);
        gi.load().then(args => {
            gi.showInfo(args);
            gapi.load('client', 'v3', () => {
                debugger;
            });
        });
        $('button.logout-button').click(() => {
            gi.logout();
        });
    }
    exports.run = run;
});
define("ol3-lab/labs/image-data-viewer", ["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAA9CAYAAAAd1W/BAAAFf0lEQVRoBe1ZSW/bRhT+uFMSZcmSAnlpHCcokKZo0QU9t7321n/QnnvqHyjQn9Cf0GuvRU89Feg5AdIGDro5tuPd1mItJKWhyOKNRMRwpFjcZAviAATJ4XDee998b97MGwGAhwUu4gLbzk1PAUgZsOAIpC6w4ARAyoCUAQuOwO1xAQEAXTMu8ozlDcUJQ1sFCRBEASK/Dz95A8AdAJ7rwXNH6/QEF+uzBUAAJBmQNRGyJkDPy1BzCjRDgZqVucG9Th9904HdZuh3HTg9D07f46AksWuZDQAjw5WMCOOOhtJGHssbeeRKOiRF4pcoivA8MtTlF7MddE5N1HZbaOx3YNYZHHsERIy0Ja9LkGBDv1Z0AUsrGqoPiyjfLyJXzkLNqJBUCYIw3vHJBViPWNBD58zE8fMazrfb6NYdDPrxqZwoAIIIqFkB5U0Db31UQWmjCD2fgSgHm3udngO7ZeHk7xoOntZwcWhz1/BiwCExALjxOQGr7xax/sEdLK8XoWRVTBjwa0lNjCAQajtN7D0+QW3H5C4RFYRk5gABINqvPCri7sdVFNcKkHUltPGEDkULfSmDytsSf/bcY9RemHyCvBa9NzRIBABFA8qbOaw+KqGwshTZeF9/AkHLqijdK4CiBbMH3B0GzG8R/B7MGafon2J6rqJh9b0SyvdLkWg/ThxnQj6D6jtlVB7koRnEiHEtp6uL8Ot4AZJKo2+guF6AEpH24yUM3UHL6ag+LKOwRpPqpJbX18cKAB/9sobCmoHscvDZ/np1X7WQNRm5SpbLogVVWBbEDsBSNYOlqsFj/Ct1k3kihhXXCWz19gCQK+vIFHSIUqzYjkVQVmUYlSz0vHI7APA8ClVvXuGNtSRkJU2ISkZGpqBC1WlVGbyjWIeJ2R669X4oRYKrPvyDltIiLamlENYD8aXE7o0sOHjamAn9fcDI1XRDgaLTntqvnf4eCwPI+N8A0L1b62Hvydn0GkRtKQiQJJEz4MZc4AcAmwC+Hxnz7JddMMuJatp0/3seHObCdVyE2RdEZsBnAL4cqfo1AHqnvfy/vx9OZ0DEVoOBC7vTh9Pz00fBOowMAI3+5eK/P/91D2bdvvwpkWfaJbojBoQREAmArwB8eEUqvVM9lT9+fjF6SuZG2SNmMljNHpg9YxcoAPBH+6p5VE/fD5/VcPbfxdXPsb07fQet0y6sFgvl/6RIaAZ8C6A4wRSqp+9UHv/0z+gp5psHMIvh4qADq8l4QjWMhFAAULjzZ/xJQuk7taN5IIkJkfKF7ZMOmodd9DrObAH4cZLVV+p9F6EJMc6wSCHPvrBw8lcdrSMLboSIG5gBFOY+v2LopFcKjzwsWg4IhDiKO/BgXZg42jrnWeK+GW7y83UJDMC0o+8L8NuTG0QNi2Q8JUbPt5s42mqgfdqPNPqkY6CsMK32aLETtBAIOwAqDwr49Jv3g/7OTy4o5JmNLs62G3j55AyNlxZ4LjBiajwQAME1f/2PL777BPqSBoGwv27z4oGfFjGbwawPaX/4Zw2dc4YB+X1E40m7CNm0142bVEOHoIouorieRWO/CaNMSQwdlNaiPT0vPhgjo/gix2Kw2zbap10cb9VR223DbtG6f5Kk4PUzYwDl7GQNyJZUlO4aWN4wkCtleOqMnw9KIh/QARvwjQ2NeufUQm2vjeZ+F3aLjsSIEcGNfNMfMwPAV4ISp5TFpVNizZCh5GS+n/dPh+0OA+Onw5T3d+EycLrTUXkSZeYAXDaCWMH38DQdjOIRN5R8nzZ3MY/2Zdn+840C4Ctxk/fA64CbVDYJ2SkASaA6T32mDJin0UpC15QBSaA6T32mDJin0UpC15QBSaA6T32mDJin0UpC15QBSaA6T30uPAP+B8Xv5/OOW6fPAAAAAElFTkSuQmCC";
    let css = `
<style>
    .image-data-viewer .area {
        padding: 20px;
    }

    .image-data-viewer img {
        width: auto;
        height: auto;
        border: 1px dashed rgba(0, 0, 0, 0.5);
        padding: 20px;
    }

    .image-data-viewer label {
        display: block;
    }

    .image-data-viewer textarea {
        width: 100%;
        height: 40px;
        white-space: nowrap;
    }
</style>
`;
    let ux = `
<div class="image-data-viewer">
    <h3>Tool for viewing image data</h3>
    <p>Paste an Image into Image Data to view the Image below</p>
    <div class='area'>
        <label>Image Data (paste image or text here)</label> 
        <textarea autocomplete="off" spellcheck="false" class='image-data-input'></textarea>
    </div>
    <div class='area'>
        <label>Image</label> 
        <img class='image'/>
    </div>
    <div class='area'>
        <label>Select an Image to update the Image Data and then the Image</label>
        <input class='image-file' type='file' accept='image/*' />
    </div>
</div>
`;
    let openFile = function (event) {
        var input = event.target;
        var reader = new FileReader();
        reader.onload = () => {
            let textarea = $(".image-data-input");
            textarea[0].value = reader.result;
            textarea.change();
        };
        reader.readAsDataURL(input.files[0]);
    };
    let pasteHandler = (evt) => {
        let event = (evt.originalEvent || evt);
        let items = event.clipboardData.items;
        let blob;
        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") === 0) {
                blob = items[i].getAsFile();
                break;
            }
        }
        if (blob) {
            var reader = new FileReader();
            reader.onload = readerEvent => {
                $(".image-data-input").val(readerEvent.target.result).change();
            };
            reader.readAsDataURL(blob);
        }
    };
    function run() {
        $(ux).appendTo(".map");
        $(css).appendTo("head");
        $(".image-data-input").change(() => {
            $(".image").attr("src", $(".image-data-input").val());
        }).val(data).change();
        $(".image-data-input").on("paste", pasteHandler);
        $(".image-file").change(openFile);
    }
    exports.run = run;
});
define("ol3-lab/labs/index", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function run() {
        let l = window.location;
        let path = `${l.origin}${l.pathname}?run=ol3-lab/labs/`;
        let labs = `
    geoserver/services
    wfs-map
    ol-draw
    ol-grid
    ol-input    
    ol-layerswitcher
    ol-panzoom
    ol-popup
    ol-search
    ol-symbolizer
    workflow/ol-workflow

    ../ux/ags-symbols

    ags-viewer&services=//sampleserver3.arcgisonline.com/ArcGIS/rest/services&serviceName=SanFrancisco/311Incidents&layers=0&debug=1&center=-122.49,37.738
    
    style-lab

    style-viewer
    style-viewer&geom=point&style=icon/png
    style-viewer&geom=point&style=icon/png,text/text
    style-viewer&geom=point&style=%5B%7B"image":%7B"imgSize":%5B45,45%5D,"rotation":0,"stroke":%7B"color":"rgba(255,25,0,0.8)","width":3%7D,"path":"M23%202%20L23%2023%20L43%2016.5%20L23%2023%20L35%2040%20L23%2023%20L11%2040%20L23%2023%20L3%2017%20L23%2023%20L23%202%20Z"%7D%7D%5D

    style-viewer&geom=point&style=%5B%7B"circle":%7B"fill":%7B"gradient":%7B"type":"linear(32,32,96,96)","stops":"rgba(0,255,0,0.1)%200%25;rgba(0,255,0,0.8)%20100%25"%7D%7D,"opacity":1,"stroke":%7B"color":"rgba(0,255,0,1)","width":1%7D,"radius":64%7D%7D,%7B"image":%7B"anchor":%5B16,48%5D,"size":%5B32,48%5D,"anchorXUnits":"pixels","anchorYUnits":"pixels","src":"http://openlayers.org/en/v3.20.1/examples/data/icon.png"%7D%7D,%7B"text":%7B"fill":%7B"color":"rgba(75,92,85,0.85)"%7D,"stroke":%7B"color":"rgba(255,255,255,1)","width":5%7D,"offset-x":0,"offset-y":16,"text":"fantasy%20light","font":"18px%20serif"%7D%7D%5D    

    style-viewer&geom=point&style=%5B%7B"image":%7B"imgSize":%5B13,21%5D,"fill":%7B"color":"rgba(0,0,0,0.5)"%7D,"path":"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z%20M6.3,8.8%20c-1.4,0-2.5-1.1-2.5-2.5c0-1.4,1.1-2.5,2.5-2.5c1.4,0,2.5,1.1,2.5,2.5C8.8,7.7,7.7,8.8,6.3,8.8z"%7D%7D%5D

    style-viewer&geom=point&style=%5B%7B"image":%7B"imgSize":%5B15,15%5D,"anchor":%5B0,0.5%5D,"fill":%7B"color":"rgba(255,0,0,0.1)"%7D,"stroke":%7B"color":"rgba(255,0,0,1)","width":0.1%7D,"scale":8,"rotation":0.7,"img":"lock"%7D%7D,%7B"image":%7B"imgSize":%5B15,15%5D,"anchor":%5B100,0.5%5D,"anchorXUnits":"pixels","fill":%7B"color":"rgba(0,255,0,0.4)"%7D,"stroke":%7B"color":"rgba(255,0,0,1)","width":0.1%7D,"scale":1.5,"rotation":0.7,"img":"lock"%7D%7D,%7B"image":%7B"imgSize":%5B15,15%5D,"anchor":%5B-10,0%5D,"anchorXUnits":"pixels","anchorOrigin":"top-right","fill":%7B"color":"rgba(230,230,80,1)"%7D,"stroke":%7B"color":"rgba(0,0,0,1)","width":0.5%7D,"scale":2,"rotation":0.8,"img":"lock"%7D%7D%5D


    style-viewer&geom=multipoint&style=icon/png

    style-viewer&geom=polyline&style=stroke/dot

    style-viewer&geom=polygon&style=fill/diagonal
    style-viewer&geom=polygon&style=fill/horizontal,fill/vertical,stroke/dashdotdot
    style-viewer&geom=polygon&style=stroke/solid,text/text
    style-viewer&geom=polygon-with-holes&style=fill/cross,stroke/solid

    style-viewer&geom=multipolygon&style=stroke/solid,fill/horizontal,text/text

    style-to-canvas
    polyline-encoder
    image-data-viewer

    mapmaker
    mapmaker&background=light
    mapmaker&geom=t\`syzE}gm_dAm_@A?r@p@Bp@Hp@Ph@Td@Z\`@\`@Vb@Nd@xUABmF
    mapmaker&geom=t\`syzE}gm_dAm_@A?r@p@Bp@Hp@Ph@Td@Z\`@\`@Vb@Nd@xUABmF&color=yellow&background=dark&modify=1
    
    geocoder&modify=1

    facebook
    google-identity
    index
    `;
        let styles = document.createElement("style");
        document.head.appendChild(styles);
        styles.innerText += `
    #map {
        display: none;
    }
    .test {
        margin: 20px;
    }
    `;
        let labDiv = document.createElement("div");
        document.body.appendChild(labDiv);
        labDiv.innerHTML = labs
            .split(/ /)
            .map(v => v.trim())
            .filter(v => !!v)
            .map(lab => `<div class='test'><a href='${path}${lab}&debug=1'>${lab}</a></div>`)
            .join("\n");
        let testDiv = document.createElement("div");
        document.body.appendChild(testDiv);
        testDiv.innerHTML = `<a href='${l.origin}${l.pathname}?run=ol3-lab/tests/index'>tests</a>`;
    }
    exports.run = run;
    ;
});
define("bower_components/ol3-draw/ol3-draw/ol3-button", ["require", "exports", "openlayers", "bower_components/ol3-fun/ol3-fun/common", "bower_components/ol3-symbolizer/index"], function (require, exports, ol, common_5, ol3_symbolizer_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function range(n) {
        let result = new Array(n);
        for (let i = 0; i < n; i++)
            result[i] = i;
        return result;
    }
    function pair(a1, a2) {
        let result = [];
        a1.forEach(v1 => a2.forEach(v2 => result.push([v1, v2])));
        return result;
    }
    class Button extends ol.control.Control {
        constructor(options) {
            super(options);
            this.options = options;
            this.handlers = [];
            this.symbolizer = new ol3_symbolizer_3.StyleConverter();
            this.cssin();
            options.element.className = `${options.className} ${options.position}`;
            let button = common_5.html(`<input type="button" value="${options.label}" />`);
            this.handlers.push(() => options.element.remove());
            button.title = options.title;
            options.element.appendChild(button);
            this.set("active", false);
            button.addEventListener("click", () => {
                this.dispatchEvent("click");
                this.set("active", !this.get("active"));
            });
            this.on("change:active", () => {
                this.options.element.classList.toggle("active", this.get("active"));
                options.map.dispatchEvent({
                    type: options.eventName,
                    control: this
                });
            });
        }
        static create(options) {
            options = common_5.mixin(common_5.mixin({}, Button.DEFAULT_OPTIONS), options);
            options.element = options.element || document.createElement("DIV");
            let button = new (options.buttonType)(options);
            if (options.map) {
                options.map.addControl(button);
            }
            return button;
        }
        setPosition(position) {
            this.options.position.split(' ')
                .forEach(k => this.options.element.classList.remove(k));
            position.split(' ')
                .forEach(k => this.options.element.classList.add(k));
            this.options.position = position;
        }
        destroy() {
            this.handlers.forEach(h => h());
            this.setTarget(null);
        }
        cssin() {
            let className = this.options.className;
            let positions = pair("top left right bottom".split(" "), range(24))
                .map(pos => `.${className}.${pos[0] + (-pos[1] || '')} { ${pos[0]}:${0.5 + pos[1]}em; }`);
            this.handlers.push(common_5.cssin(className, `
            .${className} {
                position: absolute;
                background-color: rgba(255,255,255,.4);
            }
            .${className}.active {
                background-color: white;
            }
            .${className}:hover {
                background-color: white;
            }
            .${className} input[type="button"] {
                color: rgba(0,60,136,1);
                background: transparent;
                border: none;
                width: 2em;
                height: 2em;
            }
            ${positions.join('\n')}
        `));
        }
        setMap(map) {
            let options = this.options;
            super.setMap(map);
            options.map = map;
            if (!map) {
                this.destroy();
                return;
            }
        }
    }
    Button.DEFAULT_OPTIONS = {
        className: "ol-button",
        position: "top right",
        label: "Button",
        title: "Button",
        eventName: "click:button",
        buttonType: Button
    };
    exports.Button = Button;
});
define("bower_components/ol3-draw/ol3-draw/ol3-draw", ["require", "exports", "openlayers", "bower_components/ol3-draw/ol3-draw/ol3-button", "bower_components/ol3-fun/ol3-fun/common"], function (require, exports, ol, ol3_button_1, common_6) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Draw extends ol3_button_1.Button {
        constructor(options) {
            super(options);
            this.interactions = {};
            this.handlers.push(() => Object.keys(this.interactions).forEach(k => {
                let interaction = this.interactions[k];
                interaction.setActive(false);
                options.map.removeInteraction(interaction);
            }));
            this.on("change:active", () => {
                let active = this.get("active");
                let interaction = this.interactions[options.geometryType];
                if (active) {
                    if (!interaction) {
                        interaction = this.interactions[options.geometryType] = this.createInteraction();
                    }
                    interaction.setActive(true);
                }
                else {
                    interaction && interaction.setActive(false);
                }
            });
            let style = this.options.style.map(s => this.symbolizer.fromJson(s));
            if (!options.layers) {
                let layer = new ol.layer.Vector({
                    style: style,
                    source: new ol.source.Vector()
                });
                options.map.addLayer(layer);
                options.layers = [layer];
            }
        }
        static create(options) {
            options = common_6.mixin(common_6.mixin({}, Draw.DEFAULT_OPTIONS), options);
            return ol3_button_1.Button.create(options);
        }
        createInteraction() {
            let options = this.options;
            let source = options.layers[0].getSource();
            let draw = new ol.interaction.Draw({
                type: options.geometryType,
                geometryName: options.geometryName,
                source: source
            });
            draw.setActive(false);
            draw.on("change:active", () => this.options.element.classList.toggle("active", draw.getActive()));
            options.map.addInteraction(draw);
            return draw;
        }
    }
    Draw.DEFAULT_OPTIONS = {
        className: "ol-draw",
        geometryType: "Point",
        geometryName: "geom",
        label: "Draw",
        title: "Draw",
        buttonType: Draw,
        eventName: "draw-feature",
        style: [
            {
                circle: {
                    radius: 12,
                    opacity: 1,
                    fill: {
                        color: "rgba(0,0,0,0.5)"
                    },
                    stroke: {
                        color: "rgba(255,255,255,1)",
                        width: 3
                    }
                }
            },
            {
                fill: {
                    color: "rgba(0,0,0,0.5)"
                },
                stroke: {
                    color: "rgba(255,255,255,1)",
                    width: 5
                }
            },
            {
                stroke: {
                    color: "rgba(0,0,0,1)",
                    width: 1
                }
            }
        ]
    };
    exports.Draw = Draw;
});
define("bower_components/ol3-draw/index", ["require", "exports", "bower_components/ol3-draw/ol3-draw/ol3-draw"], function (require, exports, Draw) {
    "use strict";
    return Draw;
});
define("bower_components/ol3-draw/ol3-draw/ol3-edit", ["require", "exports", "openlayers", "bower_components/ol3-fun/ol3-fun/common", "bower_components/ol3-draw/ol3-draw/ol3-button"], function (require, exports, ol, common_7, ol3_button_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Modify extends ol3_button_2.Button {
        constructor(options) {
            super(options);
            let select = new ol.interaction.Select({
                wrapX: false
            });
            let modify = new ol.interaction.Modify({
                features: select.getFeatures()
            });
            select.on("select", (args) => {
                modify.setActive(true);
            });
            this.once("change:active", () => {
                [select, modify].forEach(i => {
                    i.setActive(false);
                    options.map.addInteraction(i);
                });
                this.handlers.push(() => {
                    [select, modify].forEach(i => {
                        i.setActive(false);
                        options.map.removeInteraction(i);
                    });
                });
            });
            this.on("change:active", () => {
                let active = this.get("active");
                select.setActive(active);
                if (!active)
                    select.getFeatures().clear();
            });
        }
        static create(options) {
            options = common_7.mixin(common_7.mixin({}, Modify.DEFAULT_OPTIONS), options);
            return ol3_button_2.Button.create(options);
        }
    }
    Modify.DEFAULT_OPTIONS = {
        className: "ol-edit",
        label: "Edit",
        title: "Edit",
        eventName: "modify-feature",
        buttonType: Modify
    };
    exports.Modify = Modify;
});
define("ol3-lab/labs/ol-draw", ["require", "exports", "openlayers", "bower_components/ol3-fun/ol3-fun/common", "bower_components/ol3-draw/index", "bower_components/ol3-draw/ol3-draw/ol3-edit"], function (require, exports, ol, common_8, ol3_draw_1, ol3_edit_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function stopInteraction(map, type) {
        map.getInteractions()
            .getArray()
            .filter(i => i instanceof type)
            .forEach(t => t.setActive(false));
    }
    class MapMaker {
        static create(options) {
            options = common_8.mixin(common_8.mixin({}, MapMaker.DEFAULT_OPTIONS), options);
            options.target.classList.add("ol-map");
            common_8.cssin("mapmaker", `
        .ol-map {
            top: 0;
            left: 0;
            right: 0;
            bottom:0;
            position: absolute;
        }
        `);
            let map = new ol.Map({
                target: options.target,
                keyboardEventTarget: document,
                loadTilesWhileAnimating: true,
                loadTilesWhileInteracting: true,
                controls: ol.control.defaults({ attribution: false }),
                view: new ol.View({
                    projection: options.projection,
                    center: options.center,
                    zoom: options.zoom
                }),
                layers: [
                    new ol.layer.Tile({
                        opacity: 0.8,
                        source: new ol.source.OSM()
                    })
                ]
            });
            return map;
        }
    }
    MapMaker.DEFAULT_OPTIONS = {};
    exports.MapMaker = MapMaker;
    function run() {
        let map = MapMaker.create({
            target: document.getElementsByClassName("map")[0],
            projection: 'EPSG:4326',
            center: [-82.4, 34.85],
            zoom: 15,
            basemap: "osm"
        });
        map.addControl(new ol.control.MousePosition({
            className: "myMousePos",
            projection: "EPSG:4326",
            coordinateFormat: c => c.map(v => v.toFixed(4)).join(" ")
        }));
        let polyLayer = new ol.layer.Vector({ source: new ol.source.Vector() });
        map.addLayer(polyLayer);
        ol3_draw_1.Draw.create({ map: map, geometryType: "Polygon", label: "▧", position: "right-4 top", layers: [polyLayer] })
            .once("activate", () => {
            debugger;
        });
        ol3_draw_1.Draw.create({ map: map, geometryType: "MultiLineString", label: "▬", position: "right-2 top" });
        ol3_draw_1.Draw.create({ map: map, geometryType: "Point", label: "●" });
        ol3_edit_1.Modify.create({ map: map, position: "right top-2", label: "Δ" });
        {
            let element = document.createElement("div");
            element.className = "gmlOut";
            common_8.cssin('gmlOut', `
.myMousePos {
    position:absolute;
    top: auto;
    left: auto;
    bottom: 0;
    right: 0;    
}
.gmlOut {
    position: absolute;
    bottom: 0;
    left: 20%;
    width: 60%;
    height: 200px;
    border: 1px solid black;
    overflow-y: auto;
    overflow-x: auto;
    font-size: 12px;
    font-family: monospace;
    background: rgba(160, 160, 60, 0.5);
}        
        `);
            let esriFormatter = new ol.format.EsriJSON({
                geometryName: "geom"
            });
            let kmlFormatter = new ol.format.KML({});
            let gmlOut = new ol.control.Control({
                element: element,
                render: common_8.debounce((args) => {
                    console.log(args.map.getView().getCenter());
                    polyLayer.getSource().forEachFeature(f => {
                        element.innerText = esriFormatter.writeFeatures([f.clone()], {
                            dataProjection: "EPSG:4326",
                            featureProjection: "EPSG:4326",
                            decimals: 4
                        });
                        return true;
                    });
                })
            });
            map.addControl(gmlOut);
        }
    }
    exports.run = run;
});
define("bower_components/ol3-grid/ol3-grid/ol3-grid", ["require", "exports", "jquery", "openlayers"], function (require, exports, $, ol) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function mixin(a, b) {
        Object.keys(b).forEach(k => a[k] = b[k]);
        return a;
    }
    function cssin(name, css) {
        let id = `style-${name}`;
        let styleTag = document.getElementById(id);
        if (!styleTag) {
            styleTag = document.createElement("style");
            styleTag.id = id;
            styleTag.innerText = css;
            document.head.appendChild(styleTag);
        }
        let dataset = styleTag.dataset;
        dataset["count"] = parseInt(dataset["count"] || "0") + 1 + "";
        return () => {
            dataset["count"] = parseInt(dataset["count"] || "0") - 1 + "";
            if (dataset["count"] === "0") {
                styleTag.remove();
            }
        };
    }
    function debounce(func, wait = 50) {
        let h;
        return () => {
            clearTimeout(h);
            h = setTimeout(() => func(), wait);
        };
    }
    class Snapshot {
        static render(canvas, feature) {
            feature = feature.clone();
            let geom = feature.getGeometry();
            let extent = geom.getExtent();
            let isPoint = extent[0] === extent[2];
            let [dx, dy] = ol.extent.getCenter(extent);
            let scale = isPoint ? 1 : Math.min(canvas.width / ol.extent.getWidth(extent), canvas.height / ol.extent.getHeight(extent));
            geom.translate(-dx, -dy);
            geom.scale(scale, -scale);
            geom.translate(canvas.width / 2, canvas.height / 2);
            let vtx = ol.render.toContext(canvas.getContext("2d"));
            let styles = feature.getStyleFunction()(0);
            if (!Array.isArray(styles))
                styles = [styles];
            styles.forEach(style => vtx.drawFeature(feature, style));
        }
        static snapshot(feature) {
            let canvas = document.createElement("canvas");
            let geom = feature.getGeometry();
            this.render(canvas, feature);
            return canvas.toDataURL();
        }
    }
    const css = `
    .ol-grid {
        position:absolute;
    }
    .ol-grid.top {
        top: 0.5em;
    }
    .ol-grid.top-1 {
        top: 1.5em;
    }
    .ol-grid.top-2 {
        top: 2.5em;
    }
    .ol-grid.top-3 {
        top: 3.5em;
    }
    .ol-grid.top-4 {
        top: 4.5em;
    }
    .ol-grid.left {
        left: 0.5em;
    }
    .ol-grid.left-1 {
        left: 1.5em;
    }
    .ol-grid.left-2 {
        left: 2.5em;
    }
    .ol-grid.left-3 {
        left: 3.5em;
    }
    .ol-grid.left-4 {
        left: 4.5em;
    }
    .ol-grid.bottom {
        bottom: 0.5em;
    }
    .ol-grid.bottom-1 {
        bottom: 1.5em;
    }
    .ol-grid.bottom-2 {
        bottom: 2.5em;
    }
    .ol-grid.bottom-3 {
        bottom: 3.5em;
    }
    .ol-grid.bottom-4 {
        bottom: 4.5em;
    }
    .ol-grid.right {
        right: 0.5em;
    }
    .ol-grid.right-1 {
        right: 1.5em;
    }
    .ol-grid.right-2 {
        right: 2.5em;
    }
    .ol-grid.right-3 {
        right: 3.5em;
    }
    .ol-grid.right-4 {
        right: 4.5em;
    }
    .ol-grid .ol-grid-container {
        min-width: 8em;
        max-height: 16em;
        overflow-y: auto;
    }
    .ol-grid .ol-grid-container.ol-hidden {
        display: none;
    }
    .ol-grid .feature-row {
        cursor: pointer;
    }
    .ol-grid .feature-row:hover {
        background: black;
        color: white;
    }
    .ol-grid .feature-row:focus {
        background: #ccc;
        color: black;
    }
`;
    const grid_html = `
<div class='ol-grid-container'>
    <table class='ol-grid-table'>
        <tbody></tbody>
    </table>
</div>
`;
    let olcss = {
        CLASS_CONTROL: 'ol-control',
        CLASS_UNSELECTABLE: 'ol-unselectable',
        CLASS_UNSUPPORTED: 'ol-unsupported',
        CLASS_HIDDEN: 'ol-hidden'
    };
    const expando = {
        right: '»',
        left: '«'
    };
    const defaults = {
        className: 'ol-grid top right',
        expanded: false,
        autoCollapse: true,
        autoSelect: true,
        canCollapse: true,
        currentExtent: true,
        hideButton: false,
        showIcon: false,
        labelAttributeName: "",
        closedText: expando.right,
        openedText: expando.left,
        placeholderText: 'Search'
    };
    class Grid extends ol.control.Control {
        static create(options = {}) {
            cssin('ol-grid', css);
            options = mixin({
                openedText: options.className && -1 < options.className.indexOf("left") ? expando.left : expando.right,
                closedText: options.className && -1 < options.className.indexOf("left") ? expando.right : expando.left,
            }, options || {});
            options = mixin(mixin({}, defaults), options);
            let element = document.createElement('div');
            element.className = `${options.className} ${olcss.CLASS_UNSELECTABLE} ${olcss.CLASS_CONTROL}`;
            let gridOptions = mixin({
                element: element,
                expanded: false
            }, options);
            return new Grid(gridOptions);
        }
        constructor(options) {
            if (options.hideButton) {
                options.canCollapse = false;
                options.autoCollapse = false;
                options.expanded = true;
            }
            super({
                element: options.element,
                target: options.target
            });
            this.options = options;
            this.features = new ol.source.Vector();
            let button = this.button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.title = options.placeholderText;
            options.element.appendChild(button);
            if (options.hideButton) {
                button.style.display = "none";
            }
            let grid = $(grid_html.trim());
            this.grid = $(".ol-grid-table", grid)[0];
            grid.appendTo(options.element);
            if (this.options.autoCollapse) {
                button.addEventListener("mouseover", () => {
                    !options.expanded && this.expand();
                });
                button.addEventListener("focus", () => {
                    !options.expanded && this.expand();
                });
                button.addEventListener("blur", () => {
                    options.expanded && this.collapse();
                });
            }
            button.addEventListener("click", () => {
                options.expanded ? this.collapse() : this.expand();
            });
            options.expanded ? this.expand() : this.collapse();
            this.features.on(["addfeature", "addfeatures"], debounce(() => this.redraw()));
        }
        redraw() {
            let map = this.getMap();
            let extent = map.getView().calculateExtent(map.getSize());
            let tbody = this.grid.tBodies[0];
            tbody.innerHTML = "";
            let features = [];
            if (this.options.currentExtent) {
                this.features.forEachFeatureInExtent(extent, f => void features.push(f));
            }
            else {
                this.features.forEachFeature(f => void features.push(f));
            }
            features.forEach(feature => {
                let tr = $(`<tr tabindex="0" class="feature-row"></tr>`);
                if (this.options.showIcon) {
                    let td = $(`<td><canvas class="icon"></canvas></td>`);
                    let canvas = $(".icon", td)[0];
                    canvas.width = 160;
                    canvas.height = 64;
                    td.appendTo(tr);
                    Snapshot.render(canvas, feature);
                }
                if (this.options.labelAttributeName) {
                    let td = $(`<td><label class="label">${feature.get(this.options.labelAttributeName)}</label></td>`);
                    td.appendTo(tr);
                }
                ["click", "keypress"].forEach(k => tr.on(k, () => {
                    if (this.options.autoCollapse) {
                        this.collapse();
                    }
                    this.dispatchEvent({
                        type: "feature-click",
                        feature: feature,
                        row: tr[0]
                    });
                }));
                tr.appendTo(tbody);
            });
        }
        add(feature) {
            this.features.addFeature(feature);
        }
        clear() {
            let tbody = this.grid.tBodies[0];
            tbody.innerHTML = "";
        }
        setMap(map) {
            super.setMap(map);
            let vectorLayers = map.getLayers()
                .getArray()
                .filter(l => l instanceof ol.layer.Vector)
                .map(l => l);
            if (this.options.currentExtent) {
                map.getView().on(["change:center", "change:resolution"], debounce(() => this.redraw()));
            }
            vectorLayers.forEach(l => l.getSource().on("addfeature", (args) => {
                this.add(args.feature);
            }));
        }
        collapse() {
            let options = this.options;
            if (!options.canCollapse)
                return;
            options.expanded = false;
            this.grid.parentElement.classList.toggle(olcss.CLASS_HIDDEN, true);
            this.button.classList.toggle(olcss.CLASS_HIDDEN, false);
            this.button.innerHTML = options.closedText;
        }
        expand() {
            let options = this.options;
            options.expanded = true;
            this.grid.parentElement.classList.toggle(olcss.CLASS_HIDDEN, false);
            this.button.classList.toggle(olcss.CLASS_HIDDEN, true);
            this.button.innerHTML = options.openedText;
        }
        on(type, cb) {
            return super.on(type, cb);
        }
    }
    exports.Grid = Grid;
});
define("bower_components/ol3-grid/index", ["require", "exports", "bower_components/ol3-grid/ol3-grid/ol3-grid"], function (require, exports, Grid) {
    "use strict";
    return Grid;
});
define("ol3-lab/labs/ol-grid", ["require", "exports", "jquery", "openlayers", "ol3-lab/labs/common/common", "bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer", "bower_components/ol3-symbolizer/ol3-symbolizer/styles/star/flower", "bower_components/ol3-popup/index", "bower_components/ol3-grid/index"], function (require, exports, $, ol, common_9, ol3_symbolizer_4, pointStyle, ol3_popup_2, ol3_grid_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let styler = new ol3_symbolizer_4.StyleConverter();
    function parse(v, type) {
        if (typeof type === "string")
            return v;
        if (typeof type === "number")
            return parseFloat(v);
        if (typeof type === "boolean")
            return (v === "1" || v === "true");
        if (Array.isArray(type)) {
            return (v.split(",").map(v => parse(v, type[0])));
        }
        throw `unknown type: ${type}`;
    }
    function randomName() {
        const nouns = "cat,dog,bird,horse,pig,elephant,giraffe,tiger,bear,cow,chicken,moose".split(",");
        const adverbs = "running,walking,turning,jumping,hiding,pouncing,stomping,rutting,landing,floating,sinking".split(",");
        let noun = nouns[(Math.random() * nouns.length) | 0];
        let adverb = adverbs[(Math.random() * adverbs.length) | 0];
        return `${adverb} ${noun}`.toLocaleUpperCase();
    }
    const html = `
<div class='popup'>
    <div class='popup-container'>
    </div>
</div>
`;
    const css = `
<style name="popup" type="text/css">
    html, body, .map {
        width: 100%;
        height: 100%;
        padding: 0;
        overflow: hidden;
        margin: 0;    
    }
    .popup-container {
        position: absolute;
        top: 1em;
        right: 0.5em;
        width: 10em;
        bottom: 1em;
        z-index: 1;
        pointer-events: none;
    }
    .popup-container .ol-popup.docked {
        min-width: auto;
    }

    table.ol-grid-table {
        width: 100%;
    }

    table.ol-grid-table {
        border-collapse: collapse;
        width: 100%;
    }

    table.ol-grid-table > td {
        padding: 8px;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }

    
</style>
`;
    const css_popup = `
.ol-popup {
    color: white;
    background-color: rgba(77,77,77,0.7);
    border: 1px solid white;
    min-width: 200px;
    padding: 12px;
}

.ol-popup:after {
    border-top-color: white;
}
`;
    function run() {
        $(html).appendTo(".map");
        $(css).appendTo("head");
        let options = {
            srs: 'EPSG:4326',
            center: [-82.4, 34.85],
            zoom: 15,
            basemap: "bing"
        };
        {
            let opts = options;
            Object.keys(opts).forEach(k => {
                common_9.doif(common_9.getParameterByName(k), v => {
                    let value = parse(v, opts[k]);
                    if (value !== undefined)
                        opts[k] = value;
                });
            });
        }
        let map = new ol.Map({
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
        let features = new ol.Collection();
        let source = new ol.source.Vector({
            features: features
        });
        let layer = new ol.layer.Vector({
            source: source
        });
        map.addLayer(layer);
        let popup = new ol3_popup_2.Popup({
            dockContainer: '.popup-container',
            pointerPosition: 100,
            positioning: "bottom-left",
            yOffset: 20,
            css: css_popup
        });
        popup.setMap(map);
        map.on("click", (event) => {
            let location = event.coordinate.map(v => v.toFixed(5)).join(", ");
            let point = new ol.geom.Point(event.coordinate);
            point.set("location", location);
            let feature = new ol.Feature(point);
            feature.set("text", randomName());
            let textStyle = pointStyle.filter(p => p.text)[0];
            ;
            if (textStyle && textStyle.text) {
                textStyle.text["offset-y"] = -24;
                textStyle.text.text = feature.get("text");
            }
            pointStyle[0].star.points = 3 + (Math.random() * 12) | 0;
            pointStyle[0].star.stroke.width = 1 + Math.random() * 5;
            let style = pointStyle.map(s => styler.fromJson(s));
            feature.setStyle((resolution) => style);
            source.addFeature(feature);
            setTimeout(() => popup.show(event.coordinate, `<div>You clicked on ${location}</div>`), 50);
        });
        let grid = ol3_grid_1.Grid.create({
            currentExtent: false,
            labelAttributeName: "text"
        });
        map.addControl(grid);
        map.addControl(ol3_grid_1.Grid.create({
            className: "ol-grid top left-2",
            closedText: "+",
            openedText: "-",
            autoCollapse: false,
            showIcon: true
        }));
        map.addControl(ol3_grid_1.Grid.create({
            className: "ol-grid bottom left",
            currentExtent: true,
            hideButton: false,
            closedText: "+",
            openedText: "-",
            autoCollapse: true,
            canCollapse: true,
            showIcon: true,
            labelAttributeName: ""
        }));
        map.addControl(ol3_grid_1.Grid.create({
            className: "ol-grid bottom right",
            hideButton: true,
            showIcon: true,
            labelAttributeName: "text"
        }));
        map.getControls().getArray()
            .filter(c => c instanceof ol3_grid_1.Grid)
            .forEach(grid => grid.on("feature-click", (args) => {
            let center = args.feature.getGeometry().getClosestPoint(map.getView().getCenter());
            map.getView().animate({
                center: center
            });
            popup.show(center, args.feature.get("text"));
        }));
        return map;
    }
    exports.run = run;
});
define("ol3-lab/labs/ol-input", ["require", "exports", "openlayers", "jquery", "bower_components/ol3-grid/index", "bower_components/ol3-symbolizer/index", "bower_components/ol3-input/index", "bower_components/ol3-input/ol3-input/providers/osm", "bower_components/ol3-fun/ol3-fun/common", "bower_components/ol3-symbolizer/ol3-symbolizer/ags/ags-source"], function (require, exports, ol, $, ol3_grid_2, ol3_symbolizer_5, ol3_input_2, osm_2, common_10, ags_source_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function zoomToFeature(map, feature) {
        let extent = feature.getGeometry().getExtent();
        map.getView().animate({
            center: ol.extent.getCenter(extent),
            duration: 2500
        });
        let w1 = ol.extent.getWidth(map.getView().calculateExtent(map.getSize()));
        let w2 = ol.extent.getWidth(extent);
        map.getView().animate({
            zoom: map.getView().getZoom() + Math.round(Math.log(w1 / w2) / Math.log(2)) - 1,
            duration: 2500
        });
    }
    function run() {
        common_10.cssin("examples/ol3-input", `
.ol-grid .ol-grid-container.ol-hidden {
}

.ol-grid .ol-grid-container {
    width: 15em;
}

.ol-input.top.right > input {
    width: 18em;
}

.ol-grid-table {
    width: 100%;
}

table.ol-grid-table {
    border-collapse: collapse;
    width: 100%;
}

table.ol-grid-table > td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.ol-input input {
    height: 1.75em !important;
}

.ol-input.statecode > input {
    text-transform: uppercase;
    width: 2em;
    text-align: center;
}
    `);
        let searchProvider = new osm_2.OpenStreet();
        let center = ol.proj.transform([-120, 35], 'EPSG:4326', 'EPSG:3857');
        let mapContainer = document.getElementsByClassName("map")[0];
        let map = new ol.Map({
            loadTilesWhileAnimating: true,
            target: mapContainer,
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                center: center,
                projection: 'EPSG:3857',
                zoom: 6
            })
        });
        let source = new ol.source.Vector();
        let symbolizer = new ol3_symbolizer_5.StyleConverter();
        let vector = new ol.layer.Vector({
            source: source,
            style: (feature, resolution) => {
                let style = feature.getStyle();
                if (!style) {
                    style = symbolizer.fromJson({
                        circle: {
                            radius: 4,
                            fill: {
                                color: "rgba(33, 33, 33, 0.2)"
                            },
                            stroke: {
                                color: "#F00"
                            }
                        },
                        text: {
                            text: feature.get("text")
                        }
                    });
                    feature.setStyle(style);
                }
                return style;
            }
        });
        ags_source_2.ArcGisVectorSourceFactory.create({
            map: map,
            services: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services',
            serviceName: 'USA_States_Generalized',
            layers: [0]
        }).then(layers => {
            layers.forEach(layer => {
                let getStyleFunction = layer.getStyleFunction();
                layer.setStyle((f, resolution) => {
                    let style = f.getStyle();
                    if (!style) {
                        style = getStyleFunction(f, 0);
                        f.setStyle(style);
                    }
                    return style;
                });
                layer.setOpacity(0.5);
                map.addLayer(layer);
                let input = ol3_input_2.Input.create({
                    className: "ol-input statecode top left-2 ",
                    closedText: "+",
                    openedText: "−",
                    autoSelect: true,
                    autoClear: false,
                    autoCollapse: false,
                    placeholderText: "XX"
                });
                map.addControl(input);
                input.on("change", args => {
                    let value = args.value.toLocaleLowerCase();
                    let feature = layer.getSource().forEachFeature(feature => {
                        let text = feature.get("STATE_ABBR");
                        if (!text)
                            return;
                        if (-1 < text.toLocaleLowerCase().indexOf(value)) {
                            return feature;
                        }
                    });
                    if (feature) {
                        zoomToFeature(map, feature);
                    }
                    else {
                        changeHandler({ value: value });
                    }
                });
            });
        }).then(() => {
            let grid = ol3_grid_2.Grid.create({
                className: "ol-grid top-2 right",
                currentExtent: true,
                autoCollapse: false,
                labelAttributeName: "STATE_ABBR",
                showIcon: true
            });
            grid.on("feature-click", args => {
                zoomToFeature(map, args.feature);
            });
            map.addControl(grid);
            map.addLayer(vector);
        });
        let changeHandler = (args) => {
            if (!args.value)
                return;
            console.log("search", args.value);
            let searchArgs = searchProvider.getParameters({
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
            }).then(json => {
                let results = searchProvider.handleResponse(json);
                results.some(r => {
                    console.log(r);
                    if (r.original.boundingbox) {
                        let [lat1, lat2, lon1, lon2] = r.original.boundingbox.map(v => parseFloat(v));
                        [lon1, lat1] = ol.proj.transform([lon1, lat1], "EPSG:4326", "EPSG:3857");
                        [lon2, lat2] = ol.proj.transform([lon2, lat2], "EPSG:4326", "EPSG:3857");
                        let extent = [lon1, lat1, lon2, lat2];
                        let feature = new ol.Feature(new ol.geom.Polygon([[
                                ol.extent.getBottomLeft(extent),
                                ol.extent.getTopLeft(extent),
                                ol.extent.getTopRight(extent),
                                ol.extent.getBottomRight(extent),
                                ol.extent.getBottomLeft(extent)
                            ]]));
                        feature.set("text", r.original.display_name);
                        source.addFeature(feature);
                        zoomToFeature(map, feature);
                    }
                    else {
                        let [lon, lat] = ol.proj.transform([r.lon, r.lat], "EPSG:4326", "EPSG:3857");
                        let feature = new ol.Feature(new ol.geom.Point([lon, lat]));
                        feature.set("text", r.original.display_name);
                        source.addFeature(feature);
                        zoomToFeature(map, feature);
                    }
                    return true;
                });
            }).fail(() => {
                console.error("geocoder failed");
            });
        };
        map.addControl(ol3_input_2.Input.create({
            className: 'ol-input bottom-2 right',
            expanded: true,
            placeholderText: "Bottom Right Search",
            onChange: changeHandler
        }));
        map.addControl(ol3_input_2.Input.create({
            className: 'ol-input top right',
            expanded: true,
            openedText: "?",
            placeholderText: "Feature Finder",
            autoClear: true,
            autoCollapse: false,
            canCollapse: false,
            hideButton: true,
            onChange: args => {
                let value = args.value.toLocaleLowerCase();
                let feature = source.forEachFeature(feature => {
                    let text = feature.get("text");
                    if (!text)
                        return;
                    if (-1 < text.toLocaleLowerCase().indexOf(value)) {
                        return feature;
                    }
                });
                if (feature) {
                    map.getView().animate({
                        center: feature.getGeometry().getClosestPoint(map.getView().getCenter()),
                        duration: 1000
                    });
                }
                else {
                    changeHandler({ value: value });
                }
            }
        }));
    }
    exports.run = run;
});
define("bower_components/ol3-panzoom/ol3-panzoom/zoomslidercontrol", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    class ZoomSlider extends ol.control.ZoomSlider {
        constructor(opt_options) {
            super(opt_options);
        }
        getElement() {
            return this.element;
        }
    }
    return ZoomSlider;
});
define("bower_components/ol3-panzoom/ol3-panzoom/ol3-panzoom", ["require", "exports", "openlayers", "bower_components/ol3-panzoom/ol3-panzoom/zoomslidercontrol"], function (require, exports, ol, ZoomSlider) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function defaults(a, ...b) {
        b.forEach(b => {
            Object.keys(b).filter(k => a[k] === undefined).forEach(k => a[k] = b[k]);
        });
        return a;
    }
    function on(element, event, listener) {
        element.addEventListener(event, listener);
        return () => element.removeEventListener(event, listener);
    }
    const DEFAULT_OPTIONS = {};
    class PanZoom extends ol.control.Control {
        constructor(options = DEFAULT_OPTIONS) {
            options = defaults({}, options, DEFAULT_OPTIONS);
            super(options);
            this.className_ = options.className ? options.className : 'ol-panzoom';
            this.imgPath_ = options.imgPath || './ol3-panzoom/resources/ol2img';
            var element = this.element = this.element_ = this.createEl_();
            this.setTarget(options.target);
            this.listenerKeys_ = [];
            this.duration_ = options.duration !== undefined ? options.duration : 100;
            this.maxExtent_ = options.maxExtent ? options.maxExtent : null;
            this.maxZoom_ = options.maxZoom ? options.maxZoom : 19;
            this.minZoom_ = options.minZoom ? options.minZoom : 0;
            this.pixelDelta_ = options.pixelDelta !== undefined ? options.pixelDelta : 128;
            this.slider_ = options.slider !== undefined ? options.slider : false;
            this.zoomDelta_ = options.zoomDelta !== undefined ? options.zoomDelta : 1;
            this.panEastEl_ = this.createButtonEl_('pan-east');
            this.panNorthEl_ = this.createButtonEl_('pan-north');
            this.panSouthEl_ = this.createButtonEl_('pan-south');
            this.panWestEl_ = this.createButtonEl_('pan-west');
            this.zoomInEl_ = this.createButtonEl_('zoom-in');
            this.zoomOutEl_ = this.createButtonEl_('zoom-out');
            this.zoomMaxEl_ = (!this.slider_ && this.maxExtent_) ? this.createButtonEl_('zoom-max') : null;
            this.zoomSliderCtrl_ = (this.slider_) ? new ZoomSlider() : null;
            element.appendChild(this.panNorthEl_);
            element.appendChild(this.panWestEl_);
            element.appendChild(this.panEastEl_);
            element.appendChild(this.panSouthEl_);
            element.appendChild(this.zoomInEl_);
            element.appendChild(this.zoomOutEl_);
            if (this.zoomMaxEl_) {
                element.appendChild(this.zoomMaxEl_);
            }
        }
        setMap(map) {
            var keys = this.listenerKeys_;
            var zoomSlider = this.zoomSliderCtrl_;
            var currentMap = this.getMap();
            if (currentMap && currentMap instanceof ol.Map) {
                keys.forEach(k => k());
                keys.length = 0;
                if (this.zoomSliderCtrl_) {
                    this.zoomSliderCtrl_.setTarget(null);
                    window.setTimeout(function () {
                        currentMap.removeControl(zoomSlider);
                    }, 0);
                }
            }
            super.setMap(map);
            if (map) {
                keys.push(on(this.panEastEl_, "click", evt => this.pan_('east', evt)));
                keys.push(on(this.panNorthEl_, "click", evt => this.pan_('north', evt)));
                keys.push(on(this.panSouthEl_, "click", evt => this.pan_('south', evt)));
                keys.push(on(this.panWestEl_, "click", evt => this.pan_('west', evt)));
                keys.push(on(this.zoomInEl_, "click", evt => this.zoom_('in', evt)));
                keys.push(on(this.zoomOutEl_, "click", evt => this.zoom_('out', evt)));
                if (this.maxExtent_ && !this.slider_) {
                    keys.push(on(this.zoomMaxEl_, "click", evt => this.zoom_('max', evt)));
                }
                if (this.slider_) {
                    zoomSlider.setTarget(this.element_);
                    window.setTimeout(function () {
                        map.addControl(zoomSlider);
                    }, 0);
                    this.adjustZoomSlider_();
                }
            }
        }
        createEl_() {
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
        }
        createButtonEl_(action) {
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
        }
        pan_(direction, evt) {
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
        }
        zoom_(direction, evt) {
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
        }
        zoomByDelta_(delta) {
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
        }
        adjustZoomSlider_() {
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
        }
        getSliderSize_() {
            return (this.maxZoom_ - this.minZoom_ + 1) * 11;
        }
    }
    exports.PanZoom = PanZoom;
});
define("bower_components/ol3-panzoom/index", ["require", "exports", "bower_components/ol3-panzoom/ol3-panzoom/ol3-panzoom"], function (require, exports, Panzoom) {
    "use strict";
    return Panzoom;
});
define("ol3-lab/labs/ol-layerswitcher", ["require", "exports", "jquery", "openlayers", "ol3-lab/labs/common/common", "bower_components/ol3-symbolizer/index", "bower_components/ol3-layerswitcher/index", "bower_components/ol3-popup/index", "bower_components/ol3-panzoom/index", "bower_components/ol3-symbolizer/ol3-symbolizer/ags/ags-source"], function (require, exports, $, ol, common_11, ol3_symbolizer_6, ol3_layerswitcher_2, ol3_popup_3, index_1, ags_source_3) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let styler = new ol3_symbolizer_6.StyleConverter();
    function parse(v, type) {
        if (typeof type === "string")
            return v;
        if (typeof type === "number")
            return parseFloat(v);
        if (typeof type === "boolean")
            return (v === "1" || v === "true");
        if (Array.isArray(type)) {
            return (v.split(",").map(v => parse(v, type[0])));
        }
        throw `unknown type: ${type}`;
    }
    const html = `
<div class='popup'>
    <div class='popup-container'>
    </div>
</div>
`;
    const css = `
<style name="popup" type="text/css">
    html, body, .map {
        width: 100%;
        height: 100%;
        padding: 0;
        overflow: hidden;
        margin: 0;    
    }
</style>
`;
    const css_popup = `
.popup-container {
    position: absolute;
    top: 1em;
    right: 0.5em;
    width: 10em;
    bottom: 1em;
    z-index: 1;
    pointer-events: none;
}

.ol-popup {
    color: white;
    background-color: rgba(77,77,77,0.7);
    min-width: 200px;
}

.ol-popup:after {
    border-top-color: rgba(77,77,77,0.7);
}

`;
    let center = {
        fire: [-117.754430386, 34.2606862490001],
        wichita: [-97.4, 37.8],
        vegas: [-115.235, 36.173]
    };
    function run() {
        $(html).appendTo(".map");
        $(css).appendTo("head");
        let options = {
            srs: 'EPSG:4326',
            center: center.vegas,
            zoom: 10
        };
        {
            let opts = options;
            Object.keys(opts).forEach(k => {
                common_11.doif(common_11.getParameterByName(k), v => {
                    let value = parse(v, opts[k]);
                    if (value !== undefined)
                        opts[k] = value;
                });
            });
        }
        let map = new ol.Map({
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
        ags_source_3.ArcGisVectorSourceFactory.create({
            tileSize: 256,
            map: map,
            services: "https://services7.arcgis.com/k0UprFPHKieFB9UY/arcgis/rest/services",
            serviceName: "GoldServer860",
            layers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].reverse()
        }).then(agsLayers => {
            agsLayers.forEach(agsLayer => {
                agsLayer.setVisible(false);
                map.addLayer(agsLayer);
            });
            let layerSwitcher = new ol3_layerswitcher_2.LayerSwitcher();
            layerSwitcher.setMap(map);
            let popup = new ol3_popup_3.Popup({
                css: `
            .ol-popup {
                background-color: white;
            }
            .ol-popup .page {
                max-height: 200px;
                overflow-y: auto;
            }
            `
            });
            map.addOverlay(popup);
            map.on("click", (event) => {
                console.log("click");
                let coord = event.coordinate;
                popup.hide();
                let pageNum = 0;
                map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
                    let page = document.createElement('p');
                    let keys = Object.keys(feature.getProperties()).filter(key => {
                        let v = feature.get(key);
                        if (typeof v === "string")
                            return true;
                        if (typeof v === "number")
                            return true;
                        return false;
                    });
                    page.title = "" + ++pageNum;
                    page.innerHTML = `<table>${keys.map(k => `<tr><td>${k}</td><td>${feature.get(k)}</td></tr>`).join("")}</table>`;
                    popup.pages.add(page, feature.getGeometry());
                });
                popup.show(coord, `<label>${pageNum} Features Found</label>`);
                popup.pages.goto(0);
            });
        });
        return map;
    }
    exports.run = run;
});
define("ol3-lab/labs/ol-panzoom", ["require", "exports", "openlayers", "bower_components/ol3-panzoom/index"], function (require, exports, ol, ol3_panzoom_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function run() {
        let panZoom = new ol3_panzoom_1.PanZoom({
            imgPath: "https://raw.githubusercontent.com/ca0v/ol3-panzoom/v3.20.1/ol3-panzoom/resources/ol2img"
        });
        var map = new ol.Map({
            controls: ol.control.defaults({
                zoom: false
            }).extend([
                panZoom
            ]),
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            target: 'map',
            view: new ol.View({
                center: ol.proj.transform([-70, 50], 'EPSG:4326', 'EPSG:3857'),
                zoom: 5
            })
        });
    }
    exports.run = run;
});
define("ol3-lab/labs/ol-popup", ["require", "exports", "jquery", "openlayers", "ol3-lab/labs/common/common", "bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer", "bower_components/ol3-symbolizer/ol3-symbolizer/styles/star/flower", "bower_components/ol3-popup/index"], function (require, exports, $, ol, common_12, ol3_symbolizer_7, pointStyle, ol3_popup_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let styler = new ol3_symbolizer_7.StyleConverter();
    function parse(v, type) {
        if (typeof type === "string")
            return v;
        if (typeof type === "number")
            return parseFloat(v);
        if (typeof type === "boolean")
            return (v === "1" || v === "true");
        if (Array.isArray(type)) {
            return (v.split(",").map(v => parse(v, type[0])));
        }
        throw `unknown type: ${type}`;
    }
    function randomName() {
        const nouns = "cat,dog,bird,horse,pig,elephant,giraffe,tiger,bear,cow,chicken,moose".split(",");
        const adverbs = "running,walking,turning,jumping,hiding,pouncing,stomping,rutting,landing,floating,sinking".split(",");
        let noun = nouns[(Math.random() * nouns.length) | 0];
        let adverb = adverbs[(Math.random() * adverbs.length) | 0];
        return `${adverb} ${noun}`.toLocaleUpperCase();
    }
    const html = `
<div class='popup'>
    <div class='popup-container'>
    </div>
</div>
`;
    const css = `
<style name="popup" type="text/css">
    html, body, .map {
        width: 100%;
        height: 100%;
        padding: 0;
        overflow: hidden;
        margin: 0;    
    }
    .popup-container {
        position: absolute;
        top: 1em;
        right: 0.5em;
        width: 10em;
        bottom: 1em;
        z-index: 1;
        pointer-events: none;
    }
    .popup-container .ol-popup.docked {
        min-width: auto;
    }
    
</style>
`;
    const css_popup = `
.ol-popup {
    color: white;
    background-color: rgba(77,77,77,0.7);
    border: 1px solid white;
    min-width: 200px;
    padding: 12px;
}

.ol-popup:after {
    border-top-color: white;
}
`;
    function run() {
        $(html).appendTo(".map");
        $(css).appendTo("head");
        let options = {
            srs: 'EPSG:4326',
            center: [-82.4, 34.85],
            zoom: 15,
            basemap: "bing"
        };
        {
            let opts = options;
            Object.keys(opts).forEach(k => {
                common_12.doif(common_12.getParameterByName(k), v => {
                    let value = parse(v, opts[k]);
                    if (value !== undefined)
                        opts[k] = value;
                });
            });
        }
        let map = new ol.Map({
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
        let features = new ol.Collection();
        let source = new ol.source.Vector({
            features: features
        });
        let layer = new ol.layer.Vector({
            source: source
        });
        map.addLayer(layer);
        let popup = new ol3_popup_4.Popup({
            dockContainer: '.popup-container',
            pointerPosition: 100,
            positioning: "bottom-left",
            yOffset: 20,
            css: css_popup
        });
        popup.setMap(map);
        map.on("click", (event) => {
            let location = event.coordinate.map(v => v.toFixed(5)).join(", ");
            let point = new ol.geom.Point(event.coordinate);
            point.set("location", location);
            let feature = new ol.Feature(point);
            feature.set("text", randomName());
            let textStyle = pointStyle.filter(p => p.text)[0];
            ;
            if (textStyle && textStyle.text) {
                textStyle.text["offset-y"] = -24;
                textStyle.text.text = feature.get("text");
            }
            pointStyle[0].star.points = 3 + (Math.random() * 12) | 0;
            pointStyle[0].star.stroke.width = 1 + Math.random() * 5;
            let style = pointStyle.map(s => styler.fromJson(s));
            feature.setStyle((resolution) => style);
            source.addFeature(feature);
            setTimeout(() => popup.show(event.coordinate, `<div>You clicked on ${location}</div>`), 50);
        });
        return map;
    }
    exports.run = run;
});
define("bower_components/ol3-search/ol3-search/ol3-search", ["require", "exports", "openlayers", "bower_components/ol3-fun/ol3-fun/common"], function (require, exports, ol, common_13) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const css = (I => `
    .${I.name} {
        position:absolute;
    }
    .${I.name}.top {
        top: 0.5em;
    }
    .${I.name}.top-1 {
        top: 1.5em;
    }
    .${I.name}.top-2 {
        top: 2.5em;
    }
    .${I.name}.top-3 {
        top: 3.5em;
    }
    .${I.name}.top-4 {
        top: 4.5em;
    }
    .${I.name}.left {
        left: 0.5em;
    }
    .${I.name}.left-1 {
        left: 1.5em;
    }
    .${I.name}.left-2 {
        left: 2.5em;
    }
    .${I.name}.left-3 {
        left: 3.5em;
    }
    .${I.name}.left-4 {
        left: 4.5em;
    }
    .${I.name}.bottom {
        bottom: 0.5em;
    }
    .${I.name}.bottom-1 {
        bottom: 1.5em;
    }
    .${I.name}.bottom-2 {
        bottom: 2.5em;
    }
    .${I.name}.bottom-3 {
        bottom: 3.5em;
    }
    .${I.name}.bottom-4 {
        bottom: 4.5em;
    }
    .${I.name}.right {
        right: 0.5em;
    }
    .${I.name}.right-1 {
        right: 1.5em;
    }
    .${I.name}.right-2 {
        right: 2.5em;
    }
    .${I.name}.right-3 {
        right: 3.5em;
    }
    .${I.name}.right-4 {
        right: 4.5em;
    }
    .${I.name} button {
        min-height: 1.375em;
        min-width: 1.375em;
        width: auto;
        display: inline;
    }
    .${I.name}.left button {
        float:right;
    }
    .${I.name}.right button {
        float:left;
    }
    .${I.name} form {
        width: 16em;
        border: none;
        padding: 0;
        margin: 0;
        margin-left: 2px;
        margin-top: 2px;
        vertical-align: top;
    }
    .${I.name} form.ol-hidden {
        display: none;
    }
`)({ name: 'ol-search' });
    let olcss = {
        CLASS_CONTROL: 'ol-control',
        CLASS_UNSELECTABLE: 'ol-unselectable',
        CLASS_UNSUPPORTED: 'ol-unsupported',
        CLASS_HIDDEN: 'ol-hidden'
    };
    const expando = {
        right: '»',
        left: '«'
    };
    const defaults = {
        className: 'ol-search bottom left',
        expanded: false,
        autoChange: false,
        autoClear: false,
        autoCollapse: true,
        canCollapse: true,
        hideButton: false,
        closedText: expando.right,
        openedText: expando.left,
        placeholderText: 'Search',
    };
    class SearchForm extends ol.control.Control {
        static create(options) {
            common_13.cssin('ol-search', css);
            options = common_13.mixin({
                openedText: options.className && -1 < options.className.indexOf("left") ? expando.left : expando.right,
                closedText: options.className && -1 < options.className.indexOf("left") ? expando.right : expando.left,
            }, options || {});
            options = common_13.mixin(common_13.mixin({}, defaults), options);
            let element = document.createElement('div');
            element.className = `${options.className} ${olcss.CLASS_UNSELECTABLE} ${olcss.CLASS_CONTROL}`;
            let geocoderOptions = common_13.mixin({
                element: element,
                target: options.target,
                expanded: false
            }, options);
            return new SearchForm(geocoderOptions);
        }
        constructor(options) {
            if (options.hideButton) {
                options.canCollapse = false;
                options.autoCollapse = false;
                options.expanded = true;
            }
            super({
                element: options.element,
                target: options.target
            });
            this.options = options;
            let button = this.button = document.createElement('button');
            button.setAttribute('type', 'button');
            button.title = options.placeholderText;
            options.element.appendChild(button);
            if (options.hideButton) {
                button.style.display = "none";
            }
            let form = this.form = common_13.html(`
        <form>
            <label class="title">${options.placeholderText}</label>
            <section class="header"></section>
            <section class="body">
            <table class="fields">
                <thead>
                    <tr><td>Field</td><td>Value</td></tr>
                </thead>
                <tbody>
                    <tr><td>Field</td><td>Value</td></tr>
                </tbody>
            </table>
            </section>
            <section class="footer"></section>
        </form>
        `.trim());
            options.element.appendChild(form);
            {
                let body = form.getElementsByTagName("tbody")[0];
                body.innerHTML = "";
                options.fields.forEach(field => {
                    let tr = document.createElement("tr");
                    let label = document.createElement("td");
                    let value = document.createElement("td");
                    field.type = field.type || "string";
                    label.innerHTML = `<label for="${field.name}" class="ol-search-label">${field.alias}</label>`;
                    let input;
                    switch (field.type) {
                        case "boolean":
                            input = common_13.html(`<input class="input" name="${field.name}" type="checkbox" />`);
                            break;
                        case "integer":
                            input = common_13.html(`<input class="input" name="${field.name}" type="number" min="0" step="1" />`);
                            break;
                        case "number":
                            input = common_13.html(`<input class="input" name="${field.name}" type="number" min="0" max="${Array(field.length || 3).join("9")}" />`);
                            break;
                        case "string":
                        default:
                            input = common_13.html(`<input class="input" name="${field.name}" type="text" />`);
                            input.maxLength = field.length || 20;
                            break;
                    }
                    input.addEventListener("focus", () => tr.classList.add("focus"));
                    input.addEventListener("blur", () => tr.classList.remove("focus"));
                    value.appendChild(input);
                    tr.appendChild(label);
                    tr.appendChild(value);
                    body.appendChild(tr);
                });
            }
            {
                let footer = form.getElementsByClassName("footer")[0];
                let searchButton = common_13.html(`<input type="button" class="ol-search-button" value="Search"/>`);
                footer.appendChild(searchButton);
                form.addEventListener("keydown", (args) => {
                    if (args.key === "Enter") {
                        if (args.srcElement !== searchButton) {
                            searchButton.focus();
                        }
                        else {
                            options.autoCollapse && button.focus();
                        }
                    }
                });
                searchButton.addEventListener("click", () => {
                    this.dispatchEvent({
                        type: "change",
                        value: this.value
                    });
                });
            }
            button.addEventListener("click", () => {
                options.expanded ? this.collapse(options) : this.expand(options);
            });
            if (options.autoCollapse) {
                form.addEventListener("blur", () => {
                    this.collapse(options);
                });
            }
            if (options.autoChange) {
                form.addEventListener("keypress", common_13.debounce(() => {
                    this.dispatchEvent({
                        type: "change",
                        value: this.value
                    });
                }, 500));
            }
            options.expanded ? this.expand(options) : this.collapse(options);
        }
        collapse(options) {
            if (!options.canCollapse)
                return;
            options.expanded = false;
            this.form.classList.toggle(olcss.CLASS_HIDDEN, true);
            this.button.classList.toggle(olcss.CLASS_HIDDEN, false);
            this.button.innerHTML = options.closedText;
        }
        expand(options) {
            options.expanded = true;
            this.form.classList.toggle(olcss.CLASS_HIDDEN, false);
            this.button.classList.toggle(olcss.CLASS_HIDDEN, true);
            this.button.innerHTML = options.openedText;
            this.form.focus();
        }
        on(type, cb) {
            super.on(type, cb);
        }
        get value() {
            let result = {};
            this.options.fields.forEach(field => {
                let input = this.form.querySelector(`[name="${field.name}"]`);
                let value = input.value;
                switch (field.type) {
                    case "integer":
                        value = parseInt(value, 10);
                        value = isNaN(value) ? null : value;
                        break;
                    case "number":
                        value = parseFloat(value);
                        value = isNaN(value) ? null : value;
                        break;
                    case "boolean":
                        value = input.checked;
                        break;
                    case "string":
                        value = value || null;
                        break;
                }
                if (undefined !== value && null !== value) {
                    result[input.name] = value;
                }
            });
            return result;
        }
    }
    exports.SearchForm = SearchForm;
});
define("bower_components/ol3-search/index", ["require", "exports", "bower_components/ol3-search/ol3-search/ol3-search"], function (require, exports, Input) {
    "use strict";
    return Input;
});
define("bower_components/ol3-search/ol3-search/providers/osm", ["require", "exports", "openlayers", "bower_components/ol3-fun/ol3-fun/common"], function (require, exports, ol, common_14) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const DEFAULTS = {
        url: '//nominatim.openstreetmap.org/search/',
        params: {
            q: '',
            format: 'json',
            addressdetails: true,
            limit: 10,
            countrycodes: ['us'],
            'accept-language': 'en-US'
        }
    };
    class OpenStreet {
        constructor() {
            this.dataType = 'json';
            this.method = 'GET';
        }
        getParameters(options, map) {
            let result = {
                url: DEFAULTS.url,
                params: common_14.mixin(common_14.mixin({}, DEFAULTS.params), options)
            };
            if (!result.params.viewbox && map) {
                let extent = map.getView().calculateExtent(map.getSize());
                let [left, bottom] = ol.extent.getBottomLeft(extent);
                let [right, top] = ol.extent.getTopRight(extent);
                let inSrs = map.getView().getProjection();
                [left, top] = ol.proj.transform([left, top], inSrs, "EPSG:4326");
                [right, bottom] = ol.proj.transform([right, bottom], inSrs, "EPSG:4326");
                result.params.viewbox = {
                    bottom: bottom,
                    top: top,
                    left: left,
                    right: right
                };
            }
            if (result.params.countrycodes) {
                result.params.countrycodes = result.params.countrycodes.join(",");
            }
            if (result.params.viewbox) {
                let x = result.params.viewbox;
                result.params.viewbox = [x.left, x.top, x.right, x.bottom].map(v => v.toFixed(5)).join(",");
            }
            Object.keys(result.params).filter(k => typeof result.params[k] === "boolean").forEach(k => {
                result.params[k] = result.params[k] ? "1" : "0";
            });
            return result;
        }
        handleResponse(args) {
            return args.sort(v => v.importance || 1).map(result => ({
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
            }));
        }
    }
    exports.OpenStreet = OpenStreet;
});
define("ol3-lab/labs/ol-search", ["require", "exports", "openlayers", "jquery", "bower_components/ol3-popup/index", "bower_components/ol3-grid/index", "bower_components/ol3-symbolizer/index", "bower_components/ol3-search/index", "bower_components/ol3-search/ol3-search/providers/osm", "bower_components/ol3-fun/ol3-fun/common", "bower_components/ol3-symbolizer/ol3-symbolizer/ags/ags-source"], function (require, exports, ol, $, ol3_popup_5, ol3_grid_3, ol3_symbolizer_8, ol3_search_1, osm_3, common_15, ags_source_4) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function zoomToFeature(map, feature) {
        let extent = feature.getGeometry().getExtent();
        map.getView().animate({
            center: ol.extent.getCenter(extent),
            duration: 2500
        });
        let w1 = ol.extent.getWidth(map.getView().calculateExtent(map.getSize()));
        let w2 = ol.extent.getWidth(extent);
        map.getView().animate({
            zoom: map.getView().getZoom() + Math.round(Math.log(w1 / w2) / Math.log(2)) - 1,
            duration: 2500
        });
    }
    function run() {
        common_15.cssin("examples/ol3-search", `

.map {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}

.ol-popup {
    background-color: white;
}

.ol-popup .pages {
    max-height: 10em;
    min-width: 20em;
    overflow: auto;
}

.ol-grid.statecode .ol-grid-container {
    background-color: white;
    width: 10em;
}

.ol-grid .ol-grid-container.ol-hidden {
}

.ol-grid .ol-grid-container {
    width: 15em;
}

.ol-grid .ol-grid-table {
    width: 100%;
}

.ol-grid table.ol-grid-table {
    border-collapse: collapse;
    width: 100%;
}

.ol-grid table.ol-grid-table > td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.ol-search.nominatim form {
    width: 20em;
}

.ol-search tr.focus {
    background: white;
}

.ol-search:hover {
    background: white;
}

.ol-search label.ol-search-label {
    white-space: nowrap;
}

    `);
        let searchProvider = new osm_3.OpenStreet();
        let center = ol.proj.transform([-120, 35], 'EPSG:4326', 'EPSG:3857');
        let mapContainer = document.getElementsByClassName("map")[0];
        let map = new ol.Map({
            loadTilesWhileAnimating: true,
            target: mapContainer,
            layers: [
                new ol.layer.Tile({
                    source: new ol.source.OSM()
                })
            ],
            view: new ol.View({
                center: center,
                projection: 'EPSG:3857',
                zoom: 6
            })
        });
        let popup = new ol3_popup_5.Popup({
            yOffset: 0,
            positioning: "bottom-center"
        });
        popup.setMap(map);
        map.on("click", (event) => {
            console.log("click");
            let coord = event.coordinate;
            popup.hide();
            let pageNum = 0;
            map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
                let page = document.createElement('p');
                let keys = Object.keys(feature.getProperties()).filter(key => {
                    let v = feature.get(key);
                    if (typeof v === "string")
                        return true;
                    if (typeof v === "number")
                        return true;
                    return false;
                });
                page.title = "" + ++pageNum;
                page.innerHTML = `<table>${keys.map(k => `<tr><td>${k}</td><td>${feature.get(k)}</td></tr>`).join("")}</table>`;
                popup.pages.add(page, feature.getGeometry());
            });
            popup.show(coord, `<label>${pageNum} Features Found</label>`);
            popup.pages.goto(0);
        });
        let source = new ol.source.Vector();
        let symbolizer = new ol3_symbolizer_8.StyleConverter();
        let vector = new ol.layer.Vector({
            source: source,
            style: (feature, resolution) => {
                let style = feature.getStyle();
                if (!style) {
                    style = symbolizer.fromJson({
                        circle: {
                            radius: 4,
                            fill: {
                                color: "rgba(33, 33, 33, 0.2)"
                            },
                            stroke: {
                                color: "#F00"
                            }
                        },
                        text: {
                            text: feature.get("text").substring(0, 20)
                        }
                    });
                    if (feature.get("icon")) {
                        style.setImage(new ol.style.Icon({
                            src: feature.get("icon")
                        }));
                    }
                    feature.setStyle(style);
                }
                return style;
            }
        });
        ags_source_4.ArcGisVectorSourceFactory.create({
            map: map,
            services: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services',
            serviceName: 'USA_States_Generalized',
            layers: [0]
        }).then(layers => {
            layers.forEach(layer => {
                layer.getSource().on("addfeature", (args) => {
                    let feature = args.feature;
                    let style = symbolizer.fromJson({
                        fill: {
                            color: "rgba(200,200,200,0.5)"
                        },
                        stroke: {
                            color: "rgba(33,33,33,0.8)",
                            width: 3
                        },
                        text: {
                            text: feature.get("STATE_ABBR")
                        }
                    });
                    feature.setStyle(style);
                });
                map.addLayer(layer);
                let grid = ol3_grid_3.Grid.create({
                    className: "ol-grid statecode top left-2",
                    expanded: true,
                    currentExtent: true,
                    autoCollapse: true,
                    autoPan: false,
                    showIcon: true,
                    layers: [layer]
                });
                map.addControl(grid);
                grid.on("feature-click", args => {
                    zoomToFeature(map, args.feature);
                });
                grid.on("feature-hover", args => {
                });
            });
        }).then(() => {
            map.addLayer(vector);
        });
        let form = ol3_search_1.SearchForm.create({
            className: 'ol-search nominatim top right',
            expanded: true,
            placeholderText: "Nominatim Search Form",
            fields: [
                {
                    name: "q",
                    alias: "*"
                },
                {
                    name: "postalcode",
                    alias: "Postal Code"
                },
                {
                    name: "housenumber",
                    alias: "House Number",
                    length: 10,
                    type: "integer"
                },
                {
                    name: "streetname",
                    alias: "Street Name"
                },
                {
                    name: "city",
                    alias: "City"
                },
                {
                    name: "county",
                    alias: "County"
                },
                {
                    name: "country",
                    alias: "Country",
                    domain: {
                        type: "",
                        name: "",
                        codedValues: [
                            {
                                name: "us", code: "us"
                            }
                        ]
                    }
                },
                {
                    name: "bounded",
                    alias: "Current Extent?",
                    type: "boolean"
                }
            ]
        });
        form.on("change", args => {
            if (!args.value)
                return;
            console.log("search", args.value);
            let searchArgs = searchProvider.getParameters(args.value, map);
            $.ajax({
                url: searchArgs.url,
                method: searchProvider.method || 'GET',
                data: searchArgs.params,
                dataType: searchProvider.dataType || 'json'
            }).then(json => {
                let results = searchProvider.handleResponse(json);
                results.some(r => {
                    console.log(r);
                    if (r.original.boundingbox) {
                        let [lat1, lat2, lon1, lon2] = r.original.boundingbox.map(v => parseFloat(v));
                        [lon1, lat1] = ol.proj.transform([lon1, lat1], "EPSG:4326", "EPSG:3857");
                        [lon2, lat2] = ol.proj.transform([lon2, lat2], "EPSG:4326", "EPSG:3857");
                        let extent = [lon1, lat1, lon2, lat2];
                        let feature = new ol.Feature(new ol.geom.Polygon([[
                                ol.extent.getBottomLeft(extent),
                                ol.extent.getTopLeft(extent),
                                ol.extent.getTopRight(extent),
                                ol.extent.getBottomRight(extent),
                                ol.extent.getBottomLeft(extent)
                            ]]));
                        feature.set("text", r.original.display_name);
                        Object.keys(r.original).forEach(k => {
                            feature.set(k, r.original[k]);
                        });
                        source.addFeature(feature);
                        zoomToFeature(map, feature);
                    }
                    else {
                        let [lon, lat] = ol.proj.transform([r.lon, r.lat], "EPSG:4326", "EPSG:3857");
                        let feature = new ol.Feature(new ol.geom.Point([lon, lat]));
                        feature.set("text", r.original.display_name);
                        source.addFeature(feature);
                        zoomToFeature(map, feature);
                    }
                    return true;
                });
            }).fail(() => {
                console.error("geocoder failed");
            });
        });
        map.addControl(form);
    }
    exports.run = run;
});
define("ol3-lab/labs/ol-symbolizer", ["require", "exports", "openlayers", "bower_components/ol3-popup/index", "bower_components/ol3-symbolizer/ol3-symbolizer/ags/ags-source", "bower_components/ol3-fun/ol3-fun/common"], function (require, exports, ol, ol3_popup_6, ags_source_5, common_16) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function parse(v, type) {
        if (typeof type === "string")
            return v;
        if (typeof type === "number")
            return parseFloat(v);
        if (typeof type === "boolean")
            return (v === "1" || v === "true");
        if (Array.isArray(type)) {
            return (v.split(",").map(v => parse(v, type[0])));
        }
        throw `unknown type: ${type}`;
    }
    const html = `
<div class='popup'>
    <div class='popup-container'>
    </div>
</div>
`;
    const css = `
<style name="popup" type="text/css">
    html, body, .map {
        width: 100%;
        height: 100%;
        padding: 0;
        overflow: hidden;
        margin: 0;    
    }
</style>
`;
    const css_popup = `
.popup-container {
    position: absolute;
    top: 1em;
    right: 0.5em;
    width: 10em;
    bottom: 1em;
    z-index: 1;
    pointer-events: none;
}

.ol-popup {
    color: white;
    background-color: rgba(77,77,77,0.7);
    min-width: 200px;
}

.ol-popup:after {
    border-top-color: rgba(77,77,77,0.7);
}

`;
    let center = {
        fire: [-117.754430386, 34.2606862490001],
        wichita: [-97.4, 37.8],
        vegas: [-115.235, 36.173]
    };
    function run() {
        let target = document.getElementsByClassName("map")[0];
        target.appendChild(common_16.html(html));
        document.head.appendChild(common_16.html(css));
        let options = {
            srs: 'EPSG:4326',
            center: center.vegas,
            zoom: 10,
            services: "//sampleserver3.arcgisonline.com/ArcGIS/rest/services",
            serviceName: "SanFrancisco/311Incidents",
            where: "1=1",
            filter: {},
            layers: [0]
        };
        {
            let opts = options;
            Object.keys(opts).forEach(k => {
                common_16.doif(common_16.getParameterByName(k), v => {
                    let value = parse(v, opts[k]);
                    if (value !== undefined)
                        opts[k] = value;
                });
            });
        }
        let map = new ol.Map({
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
                })
            ]
        });
        ags_source_5.ArcGisVectorSourceFactory.create({
            tileSize: 256,
            map: map,
            services: options.services,
            serviceName: options.serviceName,
            where: options.where,
            layers: options.layers.reverse()
        }).then(agsLayers => {
            agsLayers.forEach(agsLayer => map.addLayer(agsLayer));
            let popup = new ol3_popup_6.Popup({
                css: `
            .ol-popup {
                background-color: white;
            }
            .ol-popup .page {
                max-height: 200px;
                overflow-y: auto;
            }
            `
            });
            map.addOverlay(popup);
            map.on("click", (event) => {
                console.log("click");
                let coord = event.coordinate;
                popup.hide();
                let pageNum = 0;
                map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
                    let page = document.createElement('p');
                    let keys = Object.keys(feature.getProperties()).filter(key => {
                        let v = feature.get(key);
                        if (typeof v === "string")
                            return true;
                        if (typeof v === "number")
                            return true;
                        return false;
                    });
                    page.title = "" + ++pageNum;
                    page.innerHTML = `<table>${keys.map(k => `<tr><td>${k}</td><td>${feature.get(k)}</td></tr>`).join("")}</table>`;
                    popup.pages.add(page, feature.getGeometry());
                });
                popup.show(coord, `<label>${pageNum} Features Found</label>`);
                popup.pages.goto(0);
            });
        });
        return map;
    }
    exports.run = run;
});
define("ol3-lab/labs/polyline-encoder", ["require", "exports", "jquery", "openlayers", "ol3-lab/labs/common/ol3-polyline", "ol3-lab/labs/common/google-polyline"], function (require, exports, $, ol, PolylineEncoder, GoogleEncoder) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const PRECISION = 6;
    const css = `
<style>
    .polyline-encoder .area {
        margin: 20px;
    }

    .polyline-encoder .area p {
        font-size: smaller;
    }

    .polyline-encoder .area canvas {
        vertical-align: top;
    }

    .polyline-encoder .area label {
        display: block;
        margin: 10px;
        border-bottom: 1px solid black;
    }

    .polyline-encoder .area textarea {
        min-width: 400px;
        min-height: 200px;
    }
</style>
`;
    const ux = `
<div class='polyline-encoder'>
    <p>
    Demonstrates simplifying a geometry and then encoding it.  Enter an Input Geometry (e.g. [[1,2],[3,4]]) and watch the magic happen
    </p>

    <div class='input area'>
        <label>Input Geometry</label>
        <p>Enter a geometry here as an array of points in the form [[x1,y1], [x2,y2], ..., [xn, yn]]</p>
        <textarea></textarea>
        <canvas></canvas>
    </div>

    <div class='simplified area'>
        <label>Simplified Geometry</label>
        <p>This is a 'simplified' version of the Input Geometry.  
        You can also enter a geometry here as an array of points in the form [[x1,y1], [x2,y2], ..., [xn, yn]]</p>
        <textarea></textarea>
        <canvas></canvas>
    </div>

    <div class='encoded area'>
        <label>Encoded Simplified Geometry</label>
        <p>This is an encoding of the Simplified Geometry.  You can also enter an encoded value here</p>
        <textarea>[encoding]</textarea>
        <div>Use google encoder?</div>
        <input type='checkbox' id='use-google' />
        <p>Ported to Typescript from https://github.com/DeMoehn/Cloudant-nyctaxi/blob/master/app/js/polyline.js</p>
    </div>

    <div class='decoded area'>
        <label>Decoded Simplified Geometry</label>
        <p>This is the decoding of the Encoded Geometry</p>
        <textarea>[decoded]</textarea>
        <canvas></canvas>
    </div>

</div>
`;
    let encoder;
    const sample_input = [
        [-115.25532322799027, 36.18318333413792], [-115.25480459088912, 36.18318418322269], [-115.25480456865377, 36.18318418316166], [-115.25480483306748, 36.1831581364999], [-115.25480781267404, 36.18315812665095], [-115.2548095138256, 36.183158095267615], [-115.25481120389723, 36.183158054840916], [-115.2548128940441, 36.18315799638853], [-115.2548145842662, 36.18315791991047], [-115.25481628564361, 36.18315783445006], [-115.25481797597863, 36.18315773093339], [-115.25481965527126, 36.18315760936059], [-115.25482134571912, 36.18315747880541], [-115.2548230362423, 36.18315733022459], [-115.25482471568543, 36.183157172600346], [-115.25482639524148, 36.183156987937565], [-115.25482807479749, 36.183156803274784], [-115.25482974334876, 36.183156591542996], [-115.2548314230553, 36.18315637082881], [-115.25483309171943, 36.18315613205847], [-115.25483476042122, 36.183155884275266], [-115.25483641808054, 36.18315561843585], [-115.25483807581516, 36.18315533457071], [-115.25483973358743, 36.18315504169277], [-115.25484138031726, 36.183154730758616], [-115.25484302712233, 36.18315440179879], [-115.25484467396501, 36.183154063826066], [-115.25484630976528, 36.1831537077972], [-115.2548479456032, 36.18315334275542], [-115.25484957043632, 36.183152950644654], [-115.25485119526944, 36.183152558533834], [-115.25485280906014, 36.183152148366815], [-115.2548544229261, 36.18315172017415], [-115.2548560257496, 36.18315127392525], [-115.25485762861075, 36.18315081866349], [-115.25485922039188, 36.18315035435842], [-115.25486081224824, 36.18314987202764], [-115.25486239306215, 36.183149371640624], [-115.25486396279601, 36.1831488622103], [-115.25486553260517, 36.18314833475428], [-115.2548670913342, 36.18314779825488], [-115.25486863902088, 36.183147243699295], [-115.25487018674515, 36.18314668013086], [-115.25487172342703, 36.18314609850624], [-115.25487324902879, 36.18314550783829], [-115.25487476358818, 36.18314489911408], [-115.25487627818518, 36.18314428137708], [-115.25487778173971, 36.18314364558384], [-115.25487928533187, 36.18314300077779], [-115.25488076676396, 36.18314233788503], [-115.25488224823366, 36.183141665979406], [-115.25488370754327, 36.1831409759871], [-115.25488516689049, 36.18314027698193], [-115.25488661519529, 36.183139559920576], [-115.25488805238238, 36.183138842828726], [-115.25488948968233, 36.183138098698365], [-115.2548909047846, 36.18313734549412], [-115.25489231992445, 36.18313658327705], [-115.25489371286662, 36.18313581198606], [-115.25489510588402, 36.18313502266943], [-115.25489647670366, 36.183134224279], [-115.25489784759858, 36.18313340786281], [-115.25489919629575, 36.18313258237279], [-115.25490054503052, 36.18313174786991], [-115.25490187156761, 36.18313090429319], [-115.25490319817993, 36.18313004269079], [-115.25490450259451, 36.183129172014546], [-115.25490580704671, 36.183128292325435], [-115.25490708933879, 36.18312739454964], [-115.25490836055086, 36.18312648773055], [-115.25490962068287, 36.183125571868075], [-115.25491086973481, 36.18312464696224], [-115.25491210774435, 36.183123704000224], [-115.25491332355611, 36.18312275196436], [-115.25491453940552, 36.183121790915635], [-115.25491573305723, 36.18312082079315], [-115.25491691562885, 36.183119841627246], [-115.25491808715805, 36.18311884440516], [-115.25491924756955, 36.18311784715259], [-115.25492038582102, 36.18311683181332], [-115.2549215129924, 36.18311580743071], [-115.25492262908377, 36.183114774004764], [-115.25492373409503, 36.18311373153546], [-115.25492481690861, 36.183112679992306], [-115.2549258886421, 36.18311161940585], [-115.25492694929561, 36.183110549776046], [-115.25492798775133, 36.183109471072356], [-115.25492901516465, 36.183108374312525], [-115.25493003146033, 36.1831072775222], [-115.25493102555829, 36.18310617165801], [-115.25493200857615, 36.18310505675048], [-115.25493298051404, 36.183103932799625], [-115.25493393025415, 36.18310279977493], [-115.25493486891426, 36.18310165770687], [-115.25493579649431, 36.183100506595494], [-115.25493670187666, 36.18309934641027], [-115.25493759614129, 36.18309818619454], [-115.25493846824591, 36.183097007892144], [-115.25493931811518, 36.18309582952875], [-115.25494016802205, 36.183094642152525], [-115.25494099573123, 36.18309344570244], [-115.25494180124268, 36.18309224017851], [-115.25494259567414, 36.183091025611276], [-115.25494336787024, 36.18308981098305], [-115.25494412898631, 36.183088587311474], [-115.2549448790223, 36.183087354596566], [-115.25494560682303, 36.18308612182065], [-115.25494631246364, 36.18308487095804], [-115.25494700698661, 36.18308362006498], [-115.25494767927427, 36.18308236911088], [-115.2549483404819, 36.18308110911343], [-115.25494897949177, 36.183079840042225], [-115.25494960742166, 36.183078561927644], [-115.25495021311626, 36.183077283752056], [-115.25495080769318, 36.183076005545956], [-115.25495138011001, 36.18307470925323], [-115.25495193025388, 36.183073421912326], [-115.25495246935542, 36.18307211651528], [-115.25495298618397, 36.18307082007], [-115.25495349197016, 36.183069505568625], [-115.2549539754834, 36.183068200019065], [-115.25495443679894, 36.18306688539569], [-115.25495488703444, 36.183065561728924], [-115.25495531503466, 36.183064238001236], [-115.25495573195485, 36.18306290523016], [-115.2553212003638, 36.183064339787606], [-115.25532322799027, 36.18318333413792]
    ];
    function updateEncoder() {
        let input = $(".simplified textarea")[0];
        let geom = new ol.geom.LineString(JSON.parse(input.value));
        let encoded = encoder.encode(geom.getCoordinates(), PRECISION);
        $(".encoded textarea").val(encoded).change();
    }
    function updateDecoder() {
        let input = $(".encoded textarea")[0];
        $(".decoded textarea").val(JSON.stringify(encoder.decode(input.value, PRECISION))).change();
        updateCanvas(".decoded canvas", ".decoded textarea");
    }
    function updateCanvas(canvas_id, features_id) {
        let canvas = $(canvas_id)[0];
        canvas.width = canvas.height = 200;
        let geom = new ol.geom.LineString(JSON.parse($(features_id)[0].value));
        let extent = geom.getExtent();
        let scale = (() => {
            let [w, h] = [ol.extent.getWidth(extent), ol.extent.getHeight(extent)];
            let [x0, y0] = ol.extent.getCenter(extent);
            let [dx, dy] = [canvas.width / 2, canvas.height / 2];
            let [sx, sy] = [dx / w, dy / h];
            return (x, y) => {
                return [sx * (x - x0) + dx, -sy * (y - y0) + dy];
            };
        })();
        let c = canvas.getContext("2d");
        c.beginPath();
        {
            c.strokeStyle = "#000000";
            c.lineWidth = 1;
            geom.getCoordinates().forEach((p, i) => {
                let [x, y] = scale(p[0], p[1]);
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
            geom.getCoordinates().forEach((p, i) => {
                let [x, y] = scale(p[0], p[1]);
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
        $("#use-google").change(args => {
            encoder = $("#use-google:checked").length ? new GoogleEncoder() : new PolylineEncoder(6, 2);
            $(".simplified textarea").change();
        }).change();
        $(".encoded textarea").change(updateDecoder);
        $(".simplified textarea").change(() => {
            updateCanvas(".simplified canvas", ".simplified textarea");
            updateEncoder();
        });
        $(".input textarea")
            .val(JSON.stringify(sample_input))
            .change(args => {
            let input = $(".input textarea")[0];
            let coords = JSON.parse(`${input.value}`);
            let geom = new ol.geom.LineString(coords);
            geom = geom.simplify(Math.pow(10, -PRECISION));
            $(".simplified textarea").val(JSON.stringify(geom.getCoordinates())).change();
            updateCanvas(".input canvas", ".input textarea");
        })
            .change();
    }
    exports.run = run;
});
define("ol3-lab/labs/route-editor", ["require", "exports", "openlayers", "bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer", "ol3-lab/labs/common/common"], function (require, exports, ol, ol3_symbolizer_9, common_17) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const delta = 16;
    let formatter = new ol3_symbolizer_9.StyleConverter();
    function fromJson(styles) {
        return styles.map(style => formatter.fromJson(style));
    }
    function asPoint(pt) {
        return pt.getGeometry().getFirstCoordinate();
    }
    const defaultLineStyle = (color) => [
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
    ];
    class Route {
        constructor(options) {
            this.options = common_17.defaults(options, {
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
        get delta() {
            return this.options.delta;
        }
        get start() {
            return this.startLocation && asPoint(this.startLocation);
        }
        get finish() {
            return this.finishLocation && asPoint(this.finishLocation);
        }
        get route() {
            return this.routeLine.getGeometry().getCoordinates();
        }
        get stops() {
            return this.routeStops.map(asPoint);
        }
        create() {
            let [color, start, finish, stops] = [this.options.color, this.options.start, this.options.finish, this.options.stops];
            if (this.options.showLines) {
                let feature = this.routeLine = new ol.Feature(new ol.geom.LineString(stops));
                feature.set("color", color);
                feature.setStyle(fromJson(this.options.lineStyle));
            }
            let points = this.routeStops = stops.map(p => new ol.Feature(new ol.geom.Point(p)));
            if (start) {
                let startingLocation = this.startLocation = new ol.Feature(new ol.geom.Point(start));
                startingLocation.on("change:geometry", () => {
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
                let endingLocation = this.finishLocation = new ol.Feature(new ol.geom.Point(finish));
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
            points.forEach((p, stopIndex) => {
                p.set("color", color);
                p.set("text", (1 + stopIndex) + "");
                p.setStyle((res) => [
                    new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: this.delta,
                            fill: new ol.style.Fill({
                                color: p.get("color")
                            })
                        })
                    }),
                    new ol.style.Style({
                        image: new ol.style.Circle({
                            radius: this.delta - 2,
                            stroke: new ol.style.Stroke({
                                color: "white",
                                width: 1
                            })
                        })
                    }),
                    new ol.style.Style({
                        text: new ol.style.Text({
                            font: `${this.delta * 0.75}pt Segoe UI`,
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
                ]);
            });
        }
        isNewVertex() {
            let lineSegmentCount = this.route.length;
            this.start && lineSegmentCount--;
            this.finish && lineSegmentCount--;
            let stopCount = this.routeStops.length;
            return stopCount < lineSegmentCount;
        }
        owns(feature) {
            return this.routeLine && feature === this.routeLine;
        }
        allowModify(collection) {
            if (this.options.showLines) {
                collection.push(this.routeLine);
            }
        }
        appendTo(layer) {
            this.routeLine && layer.getSource().addFeatures([this.routeLine]);
            this.startLocation && layer.getSource().addFeature(this.startLocation);
            this.routeStops && layer.getSource().addFeatures(this.routeStops);
            this.finishLocation && layer.getSource().addFeature(this.finishLocation);
        }
        findStop(map, location) {
            return this.findStops(map, location, this.stops)[0];
        }
        isStartingLocation(map, location) {
            return !!this.start && 1 === this.findStops(map, location, [this.start]).length;
        }
        isEndingLocation(map, location) {
            return !!this.finish && 1 === this.findStops(map, location, [this.finish]).length;
        }
        findStops(map, location, stops) {
            let pixel = map.getPixelFromCoordinate(location);
            let [x1, y1, x2, y2] = [pixel[0] - this.delta, pixel[1] + this.delta, pixel[0] + this.delta, pixel[1] - this.delta];
            [x1, y1] = map.getCoordinateFromPixel([x1, y1]);
            [x2, y2] = map.getCoordinateFromPixel([x2, y2]);
            let extent = [x1, y1, x2, y2];
            let result = [];
            stops.some((p, i) => {
                if (ol.extent.containsCoordinate(extent, p)) {
                    result.push(i);
                    return true;
                }
            });
            return result;
        }
        removeStop(index) {
            let stop = this.routeStops[index];
            this.routeStops.splice(index, 1);
            return stop;
        }
        addStop(stop, index) {
            if (index === undefined)
                this.routeStops.push(stop);
            else
                this.routeStops.splice(index, 0, stop);
        }
        refresh(map) {
            this.routeStops.map((stop, index) => {
                stop.set("color", this.options.color);
                stop.set("text", (1 + index) + "");
            });
            let coords = this.stops;
            this.start && coords.unshift(this.start);
            this.finish && coords.push(this.finish);
            this.routeLine && this.routeLine.setGeometry(new ol.geom.LineString(coords));
            if (this.options.modifyRoute || this.options.modifyFinishLocation || this.options.modifyStartLocation) {
                let modify = this.modify;
                if (modify) {
                    modify.setActive(false);
                    map.removeInteraction(modify);
                }
                let features = new ol.Collection();
                if (this.options.modifyStartLocation) {
                    this.startLocation && features.push(this.startLocation);
                }
                if (this.options.modifyFinishLocation) {
                    if (this.options.modifyStartLocation && this.startLocation && this.finishLocation) {
                        if (ol.coordinate.toStringXY(asPoint(this.startLocation), 5) === ol.coordinate.toStringXY(asPoint(this.finishLocation), 5)) {
                        }
                        else {
                            features.push(this.finishLocation);
                        }
                    }
                }
                if (this.options.modifyRoute) {
                    this.routeStops && this.routeStops.forEach(s => features.push(s));
                }
                modify = this.modify = new ol.interaction.Modify({
                    pixelTolerance: 8,
                    features: features
                });
                modify.on("modifyend", () => {
                    this.refresh(map);
                });
                map.addInteraction(modify);
            }
        }
    }
    exports.Route = Route;
});
define("ol3-lab/ux/serializers/serializer", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const geoJsonSimpleStyle = {
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
    Object.defineProperty(exports, "__esModule", { value: true });
    const converter = new ags_symbolizer_1.StyleConverter();
    class SimpleMarkerConverter {
        toJson(style) {
            throw "not-implemented";
        }
        fromJson(json) {
            return converter.fromJson(json);
        }
    }
    exports.SimpleMarkerConverter = SimpleMarkerConverter;
});
define("bower_components/ol3-symbolizer/ol3-symbolizer/styles/basic", ["require", "exports"], function (require, exports) {
    "use strict";
    let stroke = {
        color: 'black',
        width: 2
    };
    let fill = {
        color: 'red'
    };
    let radius = 10;
    let opacity = 0.5;
    let square = {
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: radius,
        angle: Math.PI / 4
    };
    let diamond = {
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: radius,
        angle: 0
    };
    let triangle = {
        fill: fill,
        stroke: stroke,
        points: 3,
        radius: radius,
        angle: 0
    };
    let star = {
        fill: fill,
        stroke: stroke,
        points: 5,
        radius: radius,
        radius2: 4,
        angle: 0
    };
    let cross = {
        opacity: opacity,
        fill: fill,
        stroke: stroke,
        points: 4,
        radius: radius,
        radius2: 0,
        angle: 0
    };
    let x = {
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
define("bower_components/ol3-symbolizer/ol3-symbolizer/styles/fill/gradient", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/labs/common/style-generator", ["require", "exports", "openlayers", "bower_components/ol3-symbolizer/ol3-symbolizer/styles/basic", "bower_components/ol3-symbolizer/index", "bower_components/ol3-fun/ol3-fun/common"], function (require, exports, ol, basic_styles, ol3_symbolizer_10, common_18) {
    "use strict";
    let converter = new ol3_symbolizer_10.StyleConverter();
    const orientations = "forward,backward,diagonal,horizontal,vertical,cross".split(",");
    let randint = (n) => Math.round(n * Math.random());
    class StyleGenerator {
        constructor(options) {
            this.options = options;
        }
        asPoints() {
            return 3 + Math.round(10 * Math.random());
        }
        asRadius() {
            return 14 + Math.round(10 * Math.random());
        }
        asWidth() {
            return 1 + Math.round(20 * Math.random() * Math.random());
        }
        asPastel() {
            let [r, g, b] = [255, 255, 255].map(n => Math.round((1 - Math.random() * Math.random()) * n));
            return [r, g, b, (10 + randint(50)) / 100];
        }
        asRgb() {
            return [255, 255, 255].map(n => Math.round((Math.random() * Math.random()) * n));
        }
        asRgba() {
            let color = this.asRgb();
            color.push((10 + randint(90)) / 100);
            return color;
        }
        asFill() {
            let fill = new ol.style.Fill({
                color: this.asPastel()
            });
            return fill;
        }
        asStroke() {
            let stroke = new ol.style.Stroke({
                width: this.asWidth(),
                color: this.asRgba()
            });
            return stroke;
        }
        addColorStops(gradient) {
            let stops = [
                {
                    stop: 0,
                    color: `rgba(${this.asRgba().join(",")})`
                },
                {
                    stop: 1,
                    color: `rgba(${this.asRgba().join(",")})`
                }
            ];
            while (0.5 < Math.random()) {
                stops.push({
                    stop: 0.1 + randint(80) / 100,
                    color: `rgba(${this.asRgba().join(",")})`
                });
            }
            stops = stops.sort((a, b) => a.stop - b.stop);
            stops.forEach(stop => gradient.addColorStop(stop.stop, stop.color));
            common_18.mixin(gradient, {
                stops: stops.map(stop => `${stop.color} ${Math.round(100 * stop.stop)}%`).join(";")
            });
        }
        asRadialGradient(context, radius) {
            let canvas = context.canvas;
            let [x0, y0, r0, x1, y1, r1] = [
                canvas.width / 2, canvas.height / 2, radius,
                canvas.width / 2, canvas.height / 2, 0
            ];
            let gradient = context.createRadialGradient(x0, y0, r0, x1, y1, r1);
            return common_18.mixin(gradient, {
                type: `radial(${[x0, y0, r0, x1, y1, r1].join(",")})`
            });
        }
        asLinearGradient(context, radius) {
            let [x0, y0, x1, y1] = [
                randint(radius), 0,
                randint(radius), 2 * radius
            ];
            let gradient = context.createLinearGradient(x0, y0, x1, y1);
            return common_18.mixin(gradient, { type: `linear(${[x0, y0, x1, y1].join(",")})` });
        }
        asGradient() {
            let radius = this.asRadius();
            let stroke = this.asStroke();
            let canvas = document.createElement('canvas');
            canvas.width = canvas.height = 2 * (radius + stroke.getWidth());
            var context = canvas.getContext('2d');
            let gradient;
            if (0.5 < Math.random()) {
                gradient = this.asLinearGradient(context, radius);
            }
            else {
                gradient = this.asRadialGradient(context, radius);
            }
            this.addColorStops(gradient);
            let fill = new ol.style.Fill({
                color: gradient
            });
            let style = new ol.style.Circle({
                fill: fill,
                radius: radius,
                stroke: stroke,
                snapToPixel: false
            });
            return style;
        }
        asPattern() {
            let radius = this.asRadius();
            let spacing = 3 + randint(5);
            let color = ol.color.asString(this.asRgb());
            let canvas = document.createElement('canvas');
            var context = canvas.getContext('2d');
            let orientation = orientations[Math.round((orientations.length - 1) * Math.random())];
            let pattern;
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
            common_18.mixin(pattern, {
                orientation: orientation,
                color: color,
                spacing: spacing,
                repitition: "repeat"
            });
            let fill = new ol.style.Fill({
                color: pattern
            });
            let style = new ol.style.Circle({
                fill: fill,
                radius: radius,
                stroke: this.asStroke(),
                snapToPixel: false
            });
            return style;
        }
        asBasic() {
            let basic = [basic_styles.cross, basic_styles.x, basic_styles.square, basic_styles.diamond, basic_styles.star, basic_styles.triangle];
            let config = basic[Math.round((basic.length - 1) * Math.random())];
            return converter.fromJson(config[0]).getImage();
        }
        asCircle() {
            let style = new ol.style.Circle({
                fill: this.asFill(),
                radius: this.asRadius(),
                stroke: this.asStroke(),
                snapToPixel: false
            });
            return style;
        }
        asStar() {
            let style = new ol.style.RegularShape({
                fill: this.asFill(),
                stroke: this.asStroke(),
                points: this.asPoints(),
                radius: this.asRadius(),
                radius2: this.asRadius()
            });
            return style;
        }
        asPoly() {
            let style = new ol.style.RegularShape({
                fill: this.asFill(),
                stroke: this.asStroke(),
                points: this.asPoints(),
                radius: this.asRadius(),
                radius2: 0
            });
            return style;
        }
        asText() {
            let style = new ol.style.Text({
                font: "18px fantasy",
                text: "Test",
                fill: this.asFill(),
                stroke: this.asStroke(),
                offsetY: 30 - Math.random() * 20
            });
            style.getFill().setColor(this.asRgba());
            style.getStroke().setColor(this.asPastel());
            return style;
        }
        asPoint() {
            let [x, y] = this.options.center;
            x += (Math.random() - 0.5);
            y += (Math.random() - 0.5);
            return new ol.geom.Point([x, y]);
        }
        asPointFeature(styleCount = 1) {
            let feature = new ol.Feature();
            let gens = [() => this.asStar(), () => this.asCircle(), () => this.asPoly(), () => this.asBasic(), () => this.asGradient(), () => this.asPattern()];
            feature.setGeometry(this.asPoint());
            let styles = common_18.range(styleCount).map(x => new ol.style.Style({
                image: gens[Math.round((gens.length - 1) * Math.random())](),
                text: null && this.asText()
            }));
            feature.setStyle(styles);
            return feature;
        }
        asLineFeature() {
            let feature = new ol.Feature();
            let p1 = this.asPoint();
            let p2 = this.asPoint();
            p2.setCoordinates([p2.getCoordinates()[0], p1.getCoordinates()[1]]);
            let polyline = new ol.geom.LineString([p1, p2].map(p => p.getCoordinates()));
            feature.setGeometry(polyline);
            feature.setStyle([new ol.style.Style({
                    stroke: this.asStroke(),
                    text: this.asText()
                })]);
            return feature;
        }
        asLineLayer() {
            let layer = new ol.layer.Vector();
            let source = new ol.source.Vector();
            layer.setSource(source);
            let features = common_18.range(10).map(i => this.asLineFeature());
            source.addFeatures(features);
            return layer;
        }
        asMarkerLayer(args) {
            let layer = new ol.layer.Vector();
            let source = new ol.source.Vector();
            layer.setSource(source);
            let features = common_18.range(args.markerCount || 100).map(i => this.asPointFeature(args.styleCount || 1));
            source.addFeatures(features);
            return layer;
        }
    }
    return StyleGenerator;
});
define("ol3-lab/labs/style-lab", ["require", "exports", "openlayers", "jquery", "bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer", "ol3-lab/labs/common/style-generator"], function (require, exports, ol, $, ol3_symbolizer_11, StyleGenerator) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const center = [-82.4, 34.85];
    let formatter = new ol3_symbolizer_11.StyleConverter();
    let generator = new StyleGenerator({
        center: center,
        fromJson: json => formatter.fromJson(json)
    });
    let ux = `
<div class='style-lab'>
    <label for='style-count'>How many styles per symbol?</label>
    <input id='style-count' type="number" value="1" min="1" max="5"/><button id='more'>More</button>
    <label for='style-out'>Click marker to see style here:</label>
    <textarea id='style-out'>[
	{
		"star": {
			"fill": {
				"color": "rgba(228,254,211,0.57)"
			},
			"opacity": 1,
			"stroke": {
				"color": "rgba(67,8,10,0.61)",
				"width": 8
			},
			"radius": 22,
			"radius2": 16,
			"points": 11,
			"angle": 0,
			"rotation": 0
		}
	}
]</textarea>
    <label for='apply-style'>Apply this style to some of the features</label>
    <button id='apply-style'>Apply</button>
    <div class='area'>
        <label>Last image clicked:</label>
        <img class='last-image-clicked light' />
        <img class='last-image-clicked bright' />
        <img class='last-image-clicked dark' />
    </div>
<div>
`;
    let css = `
<style>
    html, body, .map {
        width: 100%;
        height: 100%;
        padding: 0;
        overflow: hidden;
        margin: 0;    
    }

    .map {
        background-color: black;
    }

    .map.dark {
        background: black;
    }

    .map.light {
        background: silver;
    }

    .map.bright {
        background: white;
    }

    .style-lab {
        padding: 20px;
        position:absolute;
        top: 8px;
        left: 40px;
        z-index: 1;
        background-color: rgba(255, 255, 255, 0.8);
        border: 1px solid black;
    }

    .style-lab .area {
        padding-top: 20px;
    }

    .style-lab label {
        display: block;
    }

    .style-lab #style-count {
        vertical-align: top;
    }

    .style-lab #style-out {
        font-family: cursive;
        font-size: smaller;
        min-width: 320px;
        min-height: 240px;
    }

    .style-lab .dark {
        background: black;
    }

    .style-lab .light {
        background: silver;
    }

    .style-lab .bright {
        background: white;
    }

</style>
`;
    function run() {
        $(ux).appendTo(".map");
        $(css).appendTo("head");
        let formatter = new ol3_symbolizer_11.StyleConverter();
        let map = new ol.Map({
            target: "map",
            view: new ol.View({
                projection: 'EPSG:4326',
                center: center,
                zoom: 10
            }),
            layers: []
        });
        let styleOut = document.getElementById("style-out");
        $("#more").click(() => $("#style-count").change());
        $("#style-count").on("change", args => {
            map.addLayer(generator.asMarkerLayer({
                markerCount: 100,
                styleCount: args.target.valueAsNumber
            }));
        }).change();
        $("#apply-style").on("click", () => {
            let json = JSON.parse(styleOut.value);
            let styles = json.map(json => formatter.fromJson(json));
            map.getLayers().forEach(l => {
                if (l instanceof ol.layer.Vector) {
                    let s = l.getSource();
                    let features = s.getFeatures().filter((f, i) => 0.1 > Math.random());
                    features.forEach(f => f.setStyle(styles));
                    l.changed();
                }
            });
        });
        map.on("click", (args) => map.forEachFeatureAtPixel(args.pixel, (feature, layer) => {
            let style = feature.getStyle();
            let json = "";
            if (Array.isArray(style)) {
                let styles = style.map(s => formatter.toJson(s));
                json = JSON.stringify(styles, null, '\t');
            }
            else {
                throw "todo";
            }
            styleOut.value = json;
            {
                if (Array.isArray(style)) {
                    let s = style[0];
                    while (s) {
                        if (s instanceof HTMLCanvasElement) {
                            let dataUrl = s.toDataURL();
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
        }));
        $(".last-image-clicked").click(evt => {
            "light,dark,bright".split(",").forEach(c => $("#map").toggleClass(c, $(evt.target).hasClass(c)));
        });
        return map;
    }
    exports.run = run;
});
define("bower_components/ol3-fun/ol3-fun/snapshot", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    function getStyle(feature) {
        let style = feature.getStyle();
        if (!style) {
            let styleFn = feature.getStyleFunction();
            if (styleFn) {
                style = styleFn(0);
            }
        }
        if (!style) {
            style = new ol.style.Style({
                text: new ol.style.Text({
                    text: "?"
                })
            });
        }
        if (!Array.isArray(style))
            style = [style];
        return style;
    }
    class Snapshot {
        static render(canvas, feature) {
            feature = feature.clone();
            let geom = feature.getGeometry();
            let extent = geom.getExtent();
            let isPoint = extent[0] === extent[2];
            let [dx, dy] = ol.extent.getCenter(extent);
            let scale = isPoint ? 1 : Math.min(canvas.width / ol.extent.getWidth(extent), canvas.height / ol.extent.getHeight(extent));
            geom.translate(-dx, -dy);
            geom.scale(scale, -scale);
            geom.translate(canvas.width / 2, canvas.height / 2);
            let vtx = ol.render.toContext(canvas.getContext("2d"));
            let styles = getStyle(feature);
            if (!Array.isArray(styles))
                styles = [styles];
            styles.forEach(style => vtx.drawFeature(feature, style));
        }
        static snapshot(feature) {
            let canvas = document.createElement("canvas");
            let geom = feature.getGeometry();
            this.render(canvas, feature);
            return canvas.toDataURL();
        }
    }
    return Snapshot;
});
define("ol3-lab/labs/common/snapshot", ["require", "exports", "bower_components/ol3-fun/ol3-fun/snapshot"], function (require, exports, Snapshot) {
    "use strict";
    return Snapshot;
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
    Object.defineProperty(exports, "__esModule", { value: true });
    const html = `
<div class='style-to-canvas'>
    <h3>Renders a feature on a canvas</h3>
    <div class="area">
        <label>256 x 256 Canvas</label>
        <canvas id='canvas' width="256" height="256"></canvas>
    </div>
</div>
`;
    const css = `
<style>
    #map {
        display: none;
    }

    .style-to-canvas {
    }

    .style-to-canvas .area label {
        display: block;
        vertical-align: top;
    }

    .style-to-canvas .area {
        border: 1px solid black;
        padding: 20px;
        margin: 20px;
    }

    .style-to-canvas #canvas {
        font-family: sans serif;
        font-size: 20px;
        border: none;
        padding: 0;
        margin: 0;
    }
</style>
`;
    function run() {
        $(html).appendTo("body");
        $(css).appendTo("head");
        let font = `${$("#canvas").css("fontSize")} ${$("#canvas").css("fontFamily")}`;
        let style1 = new ol.style.Style({
            fill: new ol.style.Fill({
                color: "rgba(255, 0, 0, 0.5)"
            }),
            stroke: new ol.style.Stroke({
                width: 2,
                color: "blue"
            })
        });
        let style2 = new ol.style.Style({
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
        let canvas = document.getElementById("canvas");
        let feature = new ol.Feature(parcel);
        feature.setStyle([style1, style2]);
        Snapshot.render(canvas, feature);
    }
    exports.run = run;
});
define("bower_components/ol3-symbolizer/ol3-symbolizer/styles/icon/png", ["require", "exports"], function (require, exports) {
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
define("ol3-lab/labs/style-viewer", ["require", "exports", "openlayers", "jquery", "ol3-lab/labs/common/snapshot", "ol3-lab/labs/common/common", "bower_components/ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer", "bower_components/ol3-symbolizer/ol3-symbolizer/styles/icon/png"], function (require, exports, ol, $, Snapshot, common_19, ol3_symbolizer_12, pointStyle) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const html = `
<div class='style-to-canvas'>
    <h3>Renders a feature on a canvas</h3>
    <div class="area">
        <label>256 x 256 Canvas</label>
        <div id='canvas-collection'></div>
    </div>
    <div class="area">
        <label>Style</label>
        <textarea class='style'></textarea>
    </div>
    <div class="area">
        <label>Potential control for setting linear gradient start/stop locations</label>
        <div class="colorramp">
            <input class="top" type="range" min="0" max="100" value="20"/>
            <input class="bottom" type="range" min="0" max="100" value="80"/>
        </div>
    </div>
</div>
`;
    const css = `
<style>
    #map {
        display: none;
    }

    .style-to-canvas {
    }

    .style-to-canvas .area label {
        display: block;
        vertical-align: top;
    }

    .style-to-canvas .area {
        border: 1px solid black;
        padding: 20px;
        margin: 20px;
    }

    .style-to-canvas .area .style {
        width: 100%;
        height: 400px;
    }

    .style-to-canvas #canvas-collection canvas {
        font-family: sans serif;
        font-size: 20px;
        border: 1px solid black;
        padding: 20px;
        margin: 20px;
        background: linear-gradient(#333, #ccc);
    }

    div.colorramp {
        display: inline-block;
        background: linear-gradient(to right, rgba(250,0,0,0), rgba(250,0,0,1) 60%, rgba(250,100,0,1) 85%, rgb(250,250,0) 95%);
        width:100%;
    }

    div.colorramp > input[type=range] {
        -webkit-appearance: slider-horizontal;
        display:block;
        width:100%;
        background-color:transparent;
    }

    div.colorramp > label {
        display: inline-block;
    }

    div.colorramp > input[type='range'] {
        box-shadow: 0 0 0 white;
    }

    div.colorramp > input[type=range]::-webkit-slider-runnable-track {
        height: 0px;     
    }

    div.colorramp > input[type='range'].top::-webkit-slider-thumb {
        margin-top: -10px;
    }

    div.colorramp > input[type='range'].bottom::-webkit-slider-thumb {
        margin-top: -12px;
    }
    
</style>
`;
    const svg = `
<div style='display:none'>
<svg xmlns="http://www.w3.org/2000/svg">
<symbol viewBox="5 0 20 15" id="lock">
    <title>lock</title>
    <path d="M10.9,11.6c-0.3-0.6-0.3-2.3,0-2.8c0.4-0.6,3.4,1.4,3.4,1.4c0.9,0.4,0.9-6.1,0-5.7
	c0,0-3.1,2.1-3.4,1.4c-0.3-0.7-0.3-2.1,0-2.8C11.2,2.5,15,2.4,15,2.4C15,1.7,12.1,1,10.9,1S8.4,1.1,6.8,1.8C5.2,2.4,3.9,3.4,2.7,4.6
	S0,8.2,0,8.9s1.5,2.8,3.7,3.7s3.3,1.1,4.5,1.3c1.1,0.1,2.6,0,3.9-0.3c1-0.2,2.9-0.7,2.9-1.1C15,12.3,11.2,12.2,10.9,11.6z M4.5,9.3
	C3.7,9.3,3,8.6,3,7.8s0.7-1.5,1.5-1.5S6,7,6,7.8S5.3,9.3,4.5,9.3z"
    />
</symbol>
<symbol viewBox="0 0 37 37" id="marker">
      <title>marker</title>
      <path d="M19.75 2.75 L32.47792206135786 7.022077938642145 L36.75 19.75 L32.47792206135786 32.47792206135786 L19.75 36.75 L7.022077938642145 32.47792206135786 L2.75 19.750000000000004 L7.022077938642141 7.022077938642145 L19.749999999999996 2.75 Z" /> </symbol>
</svg>
</div>
`;
    function loadStyle(name) {
        let d = $.Deferred();
        if ('[' === name[0]) {
            d.resolve(JSON.parse(name));
        }
        else {
            let mids = name.split(",").map(name => `bower_components/ol3-symbolizer/ol3-symbolizer/styles/${name}`);
            require(mids, (...styles) => {
                let style = [];
                styles.forEach(s => style = style.concat(s));
                d.resolve(style);
            });
        }
        return d;
    }
    function loadGeom(name) {
        let mids = name.split(",").map(name => `../tests/data/geom/${name}`);
        let d = $.Deferred();
        require(mids, (...geoms) => {
            d.resolve(geoms);
        });
        return d;
    }
    const styles = {
        point: pointStyle
    };
    const serializer = new ol3_symbolizer_12.StyleConverter();
    class Renderer {
        constructor(geom) {
            this.feature = new ol.Feature(geom);
            this.canvas = this.createCanvas();
        }
        createCanvas(size = 256) {
            let canvas = document.createElement("canvas");
            canvas.width = canvas.height = size;
            return canvas;
        }
        draw(styles) {
            let canvas = this.canvas;
            let feature = this.feature;
            let style = styles.map(style => serializer.fromJson(style));
            feature.setStyle(style);
            canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
            Snapshot.render(canvas, feature);
        }
    }
    function run() {
        $(html).appendTo("body");
        $(svg).appendTo("body");
        $(css).appendTo("head");
        let geom = common_19.getParameterByName("geom") || "polygon-with-holes";
        let style = common_19.getParameterByName("style") || "fill/gradient";
        let save = () => {
            let style = JSON.stringify(JSON.parse($(".style").val()));
            let loc = window.location;
            let url = `${loc.origin}${loc.pathname}?run=ol3-lab/labs/style-viewer&geom=${geom}&style=${encodeURI(style)}`;
            history.replaceState({}, "Changes", url);
            return url;
        };
        loadStyle(style).then(styles => {
            loadGeom(geom).then(geoms => {
                let style = JSON.stringify(styles, null, ' ');
                $(".style").val(style);
                let renderers = geoms.map(g => new Renderer(g));
                renderers.forEach(r => $(r.canvas).appendTo("#canvas-collection"));
                setInterval(() => {
                    try {
                        let style = JSON.parse($(".style").val());
                        renderers.forEach(r => r.draw(style));
                        save();
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
    Object.defineProperty(exports, "__esModule", { value: true });
    const html = `
<div
    class="clear-margin-mobile space-left4 clearfix mobile-cols"
    data-reactid=".0.1.0.1.0">
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$airfield">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$airfield.0">
            <title
                data-reactid=".0.1.0.1.0.$airfield.0.0">airfield</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$airfield.0.1"></rect>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M6.8182,0.6818H4.7727  C4.0909,0.6818,4.0909,0,4.7727,0h5.4545c0.6818,0,0.6818,0.6818,0,0.6818H8.1818c0,0,0.8182,0.5909,0.8182,1.9545V4h6v2L9,8l-0.5,5  l2.5,1.3182V15H4v-0.6818L6.5,13L6,8L0,6V4h6V2.6364C6,1.2727,6.8182,0.6818,6.8182,0.6818z"
                data-reactid=".0.1.0.1.0.$airfield.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$airport">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$airport.0">
            <title
                data-reactid=".0.1.0.1.0.$airport.0.0">airport</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$airport.0.1"></rect>
            <path
                fill="#56b881"
                transform="translate(0 0)"
                d="M15,6.8182L15,8.5l-6.5-1  l-0.3182,4.7727L11,14v1l-3.5-0.6818L4,15v-1l2.8182-1.7273L6.5,7.5L0,8.5V6.8182L6.5,4.5v-3c0,0,0-1.5,1-1.5s1,1.5,1,1.5v2.8182  L15,6.8182z"
                data-reactid=".0.1.0.1.0.$airport.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$heliport">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$heliport.0">
            <title
                data-reactid=".0.1.0.1.0.$heliport.0.0">heliport</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$heliport.0.1"></rect>
            <path
                fill="#34a9ca"
                transform="translate(0 0)"
                d="M4,2C3,2,3,3,4,3h4v1C7.723,4,7.5,4.223,7.5,4.5V5H5H3.9707H3.9316  C3.7041,4.1201,2.9122,3.5011,2,3.5c-1.1046,0-2,0.8954-2,2s0.8954,2,2,2c0.3722-0.001,0.7368-0.1058,1.0527-0.3027L5.5,10.5  C6.5074,11.9505,8.3182,12,9,12h5c0,0,1,0,1-1v-0.9941C15,9.2734,14.874,8.874,14.5,8.5l-3-3c0,0-0.5916-0.5-1.2734-0.5H9.5V4.5  C9.5,4.223,9.277,4,9,4V3h4c1,0,1-1,0-1C13,2,4,2,4,2z M2,4.5c0.5523,0,1,0.4477,1,1s-0.4477,1-1,1s-1-0.4477-1-1  C1,4.9477,1.4477,4.5,2,4.5z M10,6c0.5,0,0.7896,0.3231,1,0.5L13.5,9H10c0,0-1,0-1-1V7C9,7,9,6,10,6z"
                data-reactid=".0.1.0.1.0.$heliport.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$rocket">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$rocket.0">
            <title
                data-reactid=".0.1.0.1.0.$rocket.0.0">rocket</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$rocket.0.1"></rect>
            <path
                fill="#ff9933"
                transform="translate(0 0)"
                d="M12.5547,1c-2.1441,0-5.0211,1.471-6.9531,4H4  C2.8427,5,2.1794,5.8638,1.7227,6.7773L1.1113,8h1.4434H4l1.5,1.5L7,11v1.4453v1.4434l1.2227-0.6113  C9.1362,12.8206,10,12.1573,10,11V9.3984c2.529-1.932,4-4.809,4-6.9531V1H12.5547z M10,4c0.5523,0,1,0.4477,1,1l0,0  c0,0.5523-0.4477,1-1,1l0,0C9.4477,6,9,5.5523,9,5v0C9,4.4477,9.4477,4,10,4L10,4z M3.5,10L3,10.5C2.2778,11.2222,2,13,2,13  s1.698-0.198,2.5-1L5,11.5L3.5,10z"
                data-reactid=".0.1.0.1.0.$rocket.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$mountain">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$mountain.0">
            <title
                data-reactid=".0.1.0.1.0.$mountain.0.0">mountain</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$mountain.0.1"></rect>
            <path
                fill="#8a8acb"
                transform="translate(0 0)"
                d="M7.5,2C7.2,2,7.1,2.2,6.9,2.4  l-5.8,9.5C1,12,1,12.2,1,12.3C1,12.8,1.4,13,1.7,13h11.6c0.4,0,0.7-0.2,0.7-0.7c0-0.2,0-0.2-0.1-0.4L8.2,2.4C8,2.2,7.8,2,7.5,2z   M7.5,3.5L10.8,9H10L8.5,7.5L7.5,9l-1-1.5L5,9H4.1L7.5,3.5z"
                data-reactid=".0.1.0.1.0.$mountain.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$volcano">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$volcano.0">
            <title
                data-reactid=".0.1.0.1.0.$volcano.0.0">volcano</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$volcano.0.1"></rect>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M8.4844,1.0002  c-0.1464,0.005-0.2835,0.0731-0.375,0.1875L6.4492,3.2619L4.8438,1.7385C4.4079,1.3374,3.7599,1.893,4.0899,2.385l1.666,2.4004  C5.9472,5.061,6.3503,5.0737,6.5586,4.8108C6.7249,4.6009,7,4.133,7.5,4.133s0.7929,0.4907,0.9414,0.6777  c0.175,0.2204,0.4973,0.2531,0.7129,0.0723l1.668-1.4004c0.4408-0.3741,0.0006-1.0735-0.5273-0.8379L9,3.2268V1.5002  C9.0002,1.2179,8.7666,0.9915,8.4844,1.0002L8.4844,1.0002z M5,6.0002L2.0762,11.924C1.9993,12.0009,2,12.155,2,12.3088  c0,0.5385,0.3837,0.6914,0.6914,0.6914h9.6172c0.3846,0,0.6914-0.153,0.6914-0.6914c0-0.1538,0.0008-0.2309-0.0762-0.3848L10,6.0002  c-0.5,0-1,0.5-1,1v0.5c0,0.277-0.223,0.5-0.5,0.5S8,7.7772,8,7.5002v-0.5c0-0.2761-0.2238-0.5-0.5-0.5S7,6.7241,7,7.0002v2  c0,0.277-0.223,0.5-0.5,0.5S6,9.2772,6,9.0002v-2C6,6.5002,5.5,6.0002,5,6.0002z"
                data-reactid=".0.1.0.1.0.$volcano.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$bakery">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$bakery.0">
            <title
                data-reactid=".0.1.0.1.0.$bakery.0.0">bakery</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$bakery.0.1"></rect>
            <path
                fill="#56b881"
                transform="translate(0 0)"
                d="M5.2941,4.3824L6,9.5  c0,0,0,1,1,1h1c1,0,1-1,1-1l0.7059-5.1176C9.7059,3,7.5,3,7.5,3S5.291,3,5.2941,4.3824z M3.5,5C2,5,2,6,2,6l1,4h1.5  c0.755,0,0.7941-0.7647,0.7941-0.7647L4.5,5H3.5z M1.5,7.5c0,0-0.6176-0.0294-1.0588,0.4118C0,8.3529,0,8.7941,0,8.7941V11h0.8824  C2,11,2,10,2,10L1.5,7.5z"
                data-reactid=".0.1.0.1.0.$bakery.0.5:$0"></path>
            <path
                fill="#56b881"
                transform="translate(0 0)"
                d="M11.5,5C13,5,13,6,13,6l-1,4h-1.5  c-0.755,0-0.7941-0.7647-0.7941-0.7647L10.5,5H11.5z M13.5,7.5c0,0,0.6176-0.0294,1.0588,0.4118C15,8.3529,15,8.7941,15,8.7941V11  h-0.8824C13,11,13,10,13,10L13.5,7.5z"
                data-reactid=".0.1.0.1.0.$bakery.0.5:$1"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$bar">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$bar.0">
            <title
                data-reactid=".0.1.0.1.0.$bar.0.0">bar</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$bar.0.1"></rect>
            <path
                fill="#34a9ca"
                transform="translate(0 0)"
                d="M7.5,1c-2,0-7,0.25-6.5,0.75L7,8v4  c0,1-3,0.5-3,2h7c0-1.5-3-1-3-2V8l6-6.25C14.5,1.25,9.5,1,7.5,1z M7.5,2c2.5,0,4.75,0.25,4.75,0.25L11.5,3h-8L2.75,2.25  C2.75,2.25,5,2,7.5,2z"
                data-reactid=".0.1.0.1.0.$bar.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$beer">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$beer.0">
            <title
                data-reactid=".0.1.0.1.0.$beer.0.0">beer</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$beer.0.1"></rect>
            <path
                fill="#ff9933"
                transform="translate(0 0)"
                d="M12,5V2c0,0-1-1-4.5-1S3,2,3,2v3c0.0288,1.3915,0.3706,2.7586,1,4c0.6255,1.4348,0.6255,3.0652,0,4.5c0,0,0,1,3.5,1  s3.5-1,3.5-1c-0.6255-1.4348-0.6255-3.0652,0-4.5C11.6294,7.7586,11.9712,6.3915,12,5z M7.5,13.5  c-0.7966,0.035-1.5937-0.0596-2.36-0.28c0.203-0.7224,0.304-1.4696,0.3-2.22h4.12c-0.004,0.7504,0.097,1.4976,0.3,2.22  C9.0937,13.4404,8.2966,13.535,7.5,13.5z M7.5,5C6.3136,5.0299,5.1306,4.8609,4,4.5v-2C5.131,2.1411,6.3137,1.9722,7.5,2  C8.6863,1.9722,9.869,2.1411,11,2.5v2C9.8694,4.8609,8.6864,5.0299,7.5,5z"
                data-reactid=".0.1.0.1.0.$beer.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$cafe">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$cafe.0">
            <title
                data-reactid=".0.1.0.1.0.$cafe.0.0">cafe</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$cafe.0.1"></rect>
            <path
                fill="#8a8acb"
                transform="translate(0 0)"
                d="M12,5h-2V3H2v4c0.0133,2.2091,1.8149,3.9891,4.024,3.9758C7.4345,10.9673,8.7362,10.2166,9.45,9H12c1.1046,0,2-0.8954,2-2  S13.1046,5,12,5z M12,8H9.86C9.9487,7.6739,9.9958,7.3379,10,7V6h2c0.5523,0,1,0.4477,1,1S12.5523,8,12,8z M10,12.5  c0,0.2761-0.2239,0.5-0.5,0.5h-7C2.2239,13,2,12.7761,2,12.5S2.2239,12,2.5,12h7C9.7761,12,10,12.2239,10,12.5z"
                data-reactid=".0.1.0.1.0.$cafe.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$fast-food">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$fast-food.0">
            <title
                data-reactid=".0.1.0.1.0.$fast-food.0.0">fast-food</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$fast-food.0.1"></rect>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M14,8c0,0.5523-0.4477,1-1,1H2C1.4477,9,1,8.5523,1,8s0.4477-1,1-1h11C13.5523,7,14,7.4477,14,8z M3.5,10H2  c0,1.6569,1.3431,3,3,3h5c1.6569,0,3-1.3431,3-3H3.5z M3,6H2V4c0-1.1046,0.8954-2,2-2h7c1.1046,0,2,0.8954,2,2v2H3z M11,4.5  C11,4.7761,11.2239,5,11.5,5S12,4.7761,12,4.5S11.7761,4,11.5,4S11,4.2239,11,4.5z M9,3.5C9,3.7761,9.2239,4,9.5,4S10,3.7761,10,3.5  S9.7761,3,9.5,3S9,3.2239,9,3.5z M7,4.5C7,4.7761,7.2239,5,7.5,5S8,4.7761,8,4.5S7.7761,4,7.5,4S7,4.2239,7,4.5z M5,3.5  C5,3.7761,5.2239,4,5.5,4S6,3.7761,6,3.5S5.7761,3,5.5,3S5,3.2239,5,3.5z M3,4.5C3,4.7761,3.2239,5,3.5,5S4,4.7761,4,4.5  S3.7761,4,3.5,4S3,4.2239,3,4.5z"
                data-reactid=".0.1.0.1.0.$fast-food.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$ice-cream">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$ice-cream.0">
            <title
                data-reactid=".0.1.0.1.0.$ice-cream.0.0">ice-cream</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$ice-cream.0.1"></rect>
            <path
                fill="#56b881"
                transform="translate(0 0)"
                d="M5.44,8.17c0.7156,0.0006,1.414-0.2194,2-0.63C7.9037,7.8634,8.4391,8.0693,9,8.14h0.44L8,13.7  c-0.1082,0.2541-0.4019,0.3723-0.656,0.264C7.2252,13.9134,7.1306,13.8188,7.08,13.7L5.44,8.17z"
                data-reactid=".0.1.0.1.0.$ice-cream.0.5:$0"></path>
            <path
                fill="#56b881"
                transform="translate(0 0)"
                d="M11.44,4.67c0,1.1046-0.8954,2-2,2s-2-0.8954-2-2l0,0l0,0l0,0c0,1.1046-0.8954,2-2,2s-2-0.8954-2-2s0.8954-2,2-2h0.12  C5.1756,1.6345,5.7035,0.4834,6.739,0.099s2.1866,0.1435,2.571,1.179c0.1667,0.449,0.1667,0.9429,0,1.3919h0.13  C10.5446,2.67,11.44,3.5654,11.44,4.67z"
                data-reactid=".0.1.0.1.0.$ice-cream.0.5:$1"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$restaurant">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$restaurant.0">
            <title
                data-reactid=".0.1.0.1.0.$restaurant.0.0">restaurant</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$restaurant.0.1"></rect>
            <path
                fill="#34a9ca"
                transform="translate(0 0)"
                d="M3.5,0l-1,5.5c-0.1464,0.805,1.7815,1.181,1.75,2L4,14c-0.0384,0.9993,1,1,1,1s1.0384-0.0007,1-1L5.75,7.5  c-0.0314-0.8176,1.7334-1.1808,1.75-2L6.5,0H6l0.25,4L5.5,4.5L5.25,0h-0.5L4.5,4.5L3.75,4L4,0H3.5z M12,0  c-0.7364,0-1.9642,0.6549-2.4551,1.6367C9.1358,2.3731,9,4.0182,9,5v2.5c0,0.8182,1.0909,1,1.5,1L10,14c-0.0905,0.9959,1,1,1,1  s1,0,1-1V0z"
                data-reactid=".0.1.0.1.0.$restaurant.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$college">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$college.0">
            <title
                data-reactid=".0.1.0.1.0.$college.0.0">college</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$college.0.1"></rect>
            <path
                fill="#ff9933"
                transform="translate(0 0)"
                d="M7.5,1L0,4.5l2,0.9v1.7C1.4,7.3,1,7.9,1,8.5s0.4,1.2,1,1.4V10l-0.9,2.1  C0.8,13,1,14,2.5,14s1.7-1,1.4-1.9L3,10c0.6-0.3,1-0.8,1-1.5S3.6,7.3,3,7.1V5.9L7.5,8L15,4.5L7.5,1z M11.9,7.5l-4.5,2L5,8.4v0.1  c0,0.7-0.3,1.3-0.8,1.8l0.6,1.4v0.1C4.9,12.2,5,12.6,4.9,13c0.7,0.3,1.5,0.5,2.5,0.5c3.3,0,4.5-2,4.5-3L11.9,7.5L11.9,7.5z"
                data-reactid=".0.1.0.1.0.$college.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$school">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$school.0">
            <title
                data-reactid=".0.1.0.1.0.$school.0.0">school</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$school.0.1"></rect>
            <path
                fill="#8a8acb"
                transform="translate(0 0)"
                d="M11,13v-1h2v-1H9.5v-1H13V9h-2V8h2V7h-2V6h2V5H9.5V4H13V3h-2V2h2V1H8v13h5v-1H11z M6,11H2V1h4V11z M6,12l-2,2l-2-2H6z"
                data-reactid=".0.1.0.1.0.$school.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$alcohol-shop">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$alcohol-shop.0">
            <title
                data-reactid=".0.1.0.1.0.$alcohol-shop.0.0">alcohol-shop</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$alcohol-shop.0.1"></rect>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M14,4h-4v3.44l0,0c0,0,0,0,0,0.06c0.003,0.9096,0.6193,1.7026,1.5,1.93V13H11c-0.2761,0-0.5,0.2239-0.5,0.5  S10.7239,14,11,14h2c0.2761,0,0.5-0.2239,0.5-0.5S13.2761,13,13,13h-0.5V9.43c0.8807-0.2274,1.497-1.0204,1.5-1.93c0,0,0,0,0-0.06  l0,0V4z M13,7.5c0,0.5523-0.4477,1-1,1s-1-0.4477-1-1V5h2V7.5z M5.5,2.5V2C5.7761,2,6,1.7761,6,1.5S5.7761,1,5.5,1V0.5  C5.5,0.2239,5.2761,0,5,0H4C3.7239,0,3.5,0.2239,3.5,0.5V1C3.2239,1,3,1.2239,3,1.5S3.2239,2,3.5,2v0.5C3.5,3.93,1,5.57,1,7v6  c0,0.5523,0.4477,1,1,1h5c0.5318-0.0465,0.9535-0.4682,1-1V7C8,5.65,5.5,3.85,5.5,2.5z M4.5,12C3.1193,12,2,10.8807,2,9.5  S3.1193,7,4.5,7S7,8.1193,7,9.5S5.8807,12,4.5,12z"
                data-reactid=".0.1.0.1.0.$alcohol-shop.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$amusement-park">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$amusement-park.0">
            <title
                data-reactid=".0.1.0.1.0.$amusement-park.0.0">amusement-park</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$amusement-park.0.1"></rect>
            <path
                fill="#56b881"
                transform="translate(0 0)"
                d="M7.5,0C3.919,0,1,2.919,1,6.5c0,2.3161,1.2251,4.3484,3.0566,5.5H4l-1,2h9l-1-2h-0.0566  C12.7749,10.8484,14,8.8161,14,6.5C14,2.919,11.081,0,7.5,0z M7.375,1.5059v3.5c-0.3108,0.026-0.6057,0.1482-0.8438,0.3496  L4.0566,2.8809C4.9243,2.0555,6.0851,1.5376,7.375,1.5059z M7.625,1.5059c1.2899,0.0317,2.4507,0.5496,3.3184,1.375L8.4688,5.3555  c-0.0007-0.0007-0.0013-0.0013-0.002-0.002C8.229,5.1532,7.9348,5.0317,7.625,5.0059V1.5059z M3.8809,3.0566l2.4746,2.4746  c-0.0007,0.0007-0.0013,0.0013-0.002,0.002C6.1532,5.771,6.0317,6.0652,6.0059,6.375h-3.5  C2.5376,5.0851,3.0555,3.9243,3.8809,3.0566z M11.1191,3.0566c0.8254,0.8676,1.3433,2.0285,1.375,3.3184h-3.5  c-0.026-0.3108-0.1482-0.6057-0.3496-0.8438L11.1191,3.0566z M2.5059,6.625h3.5c0.026,0.3108,0.1482,0.6057,0.3496,0.8438  L3.8809,9.9434C3.0555,9.0757,2.5376,7.9149,2.5059,6.625z M8.9941,6.625h3.5c-0.0317,1.2899-0.5496,2.4507-1.375,3.3184  L8.6445,7.4688c0.0007-0.0007,0.0013-0.0013,0.002-0.002C8.8468,7.229,8.9683,6.9348,8.9941,6.625z M6.5312,7.6445  c0.0007,0.0007,0.0013,0.0013,0.002,0.002C6.6716,7.7624,6.8297,7.8524,7,7.9121v3.5625c-1.1403-0.1124-2.1606-0.6108-2.9434-1.3555  L6.5312,7.6445z M8.4688,7.6445l2.4746,2.4746c-0.7828,0.7447-1.803,1.243-2.9434,1.3555V7.9121  C8.1711,7.852,8.33,7.7613,8.4688,7.6445z"
                data-reactid=".0.1.0.1.0.$amusement-park.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$aquarium">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$aquarium.0">
            <title
                data-reactid=".0.1.0.1.0.$aquarium.0.0">aquarium</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$aquarium.0.1"></rect>
            <path
                fill="#34a9ca"
                transform="translate(0 0)"
                d="M10.9,11.6c-0.3-0.6-0.3-2.3,0-2.8c0.4-0.6,3.4,1.4,3.4,1.4c0.9,0.4,0.9-6.1,0-5.7  c0,0-3.1,2.1-3.4,1.4c-0.3-0.7-0.3-2.1,0-2.8C11.2,2.5,15,2.4,15,2.4C15,1.7,12.1,1,10.9,1S8.4,1.1,6.8,1.8C5.2,2.4,3.9,3.4,2.7,4.6  S0,8.2,0,8.9s1.5,2.8,3.7,3.7s3.3,1.1,4.5,1.3c1.1,0.1,2.6,0,3.9-0.3c1-0.2,2.9-0.7,2.9-1.1C15,12.3,11.2,12.2,10.9,11.6z M4.5,9.3  C3.7,9.3,3,8.6,3,7.8s0.7-1.5,1.5-1.5S6,7,6,7.8S5.3,9.3,4.5,9.3z"
                data-reactid=".0.1.0.1.0.$aquarium.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$art-gallery">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$art-gallery.0">
            <title
                data-reactid=".0.1.0.1.0.$art-gallery.0.0">art-gallery</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$art-gallery.0.1"></rect>
            <path
                fill="#ff9933"
                transform="translate(0 0)"
                d="M10.71,4L7.85,1.15C7.6555,0.9539,7.339,0.9526,7.1429,1.1471C7.1419,1.1481,7.141,1.149,7.14,1.15L4.29,4H1.5  C1.2239,4,1,4.2239,1,4.5v9C1,13.7761,1.2239,14,1.5,14h12c0.2761,0,0.5-0.2239,0.5-0.5v-9C14,4.2239,13.7761,4,13.5,4H10.71z   M7.5,2.21L9.29,4H5.71L7.5,2.21z M13,13H2V5h11V13z M5,8C4.4477,8,4,7.5523,4,7s0.4477-1,1-1s1,0.4477,1,1S5.5523,8,5,8z M12,12  H4.5L6,9l1.25,2.5L9.5,7L12,12z"
                data-reactid=".0.1.0.1.0.$art-gallery.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$attraction">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$attraction.0">
            <title
                data-reactid=".0.1.0.1.0.$attraction.0.0">attraction</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$attraction.0.1"></rect>
            <path
                fill="#8a8acb"
                transform="translate(0 0)"
                d="M6,2C5.446,2,5.2478,2.5045,5,3L4.5,4h-2C1.669,4,1,4.669,1,5.5v5C1,11.331,1.669,12,2.5,12h10  c0.831,0,1.5-0.669,1.5-1.5v-5C14,4.669,13.331,4,12.5,4h-2L10,3C9.75,2.5,9.554,2,9,2H6z M2.5,5C2.7761,5,3,5.2239,3,5.5  S2.7761,6,2.5,6S2,5.7761,2,5.5S2.2239,5,2.5,5z M7.5,5c1.6569,0,3,1.3431,3,3s-1.3431,3-3,3s-3-1.3431-3-3S5.8431,5,7.5,5z   M7.5,6.5C6.6716,6.5,6,7.1716,6,8l0,0c0,0.8284,0.6716,1.5,1.5,1.5l0,0C8.3284,9.5,9,8.8284,9,8l0,0C9,7.1716,8.3284,6.5,7.5,6.5  L7.5,6.5z"
                data-reactid=".0.1.0.1.0.$attraction.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$bank">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$bank.0">
            <title
                data-reactid=".0.1.0.1.0.$bank.0.0">bank</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$bank.0.1"></rect>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M1,3C0.446,3,0,3.446,0,4v7c0,0.554,0.446,1,1,1h13c0.554,0,1-0.446,1-1V4c0-0.554-0.446-1-1-1H1z M1,4h1.5  C2.7761,4,3,4.2239,3,4.5S2.7761,5,2.5,5S2,4.7761,2,4.5L1.5,5C1.7761,5,2,5.2239,2,5.5S1.7761,6,1.5,6S1,5.7761,1,5.5V4z M7.5,4  C8.8807,4,10,5.567,10,7.5l0,0C10,9.433,8.8807,11,7.5,11S5,9.433,5,7.5S6.1193,4,7.5,4z M12.5,4H14v1.5C14,5.7761,13.7761,6,13.5,6  S13,5.7761,13,5.5S13.2239,5,13.5,5L13,4.5C13,4.7761,12.7761,5,12.5,5S12,4.7761,12,4.5S12.2239,4,12.5,4z M7.5,5.5  c-0.323,0-0.5336,0.1088-0.6816,0.25h1.3633C8.0336,5.6088,7.823,5.5,7.5,5.5z M6.625,6C6.5795,6.091,6.5633,6.1711,6.5449,6.25  h1.9102C8.4367,6.1711,8.4205,6.091,8.375,6H6.625z M6.5,6.5v0.25h2V6.5H6.5z M6.5,7v0.25h2V7H6.5z M6.5,7.5v0.25h2V7.5H6.5z M6.5,8  L6.25,8.25h2L8.5,8H6.5z M6,8.5c0,0,0.0353,0.1024,0.1016,0.25H8.375L8,8.5H6z M1.5,9C1.7761,9,2,9.2239,2,9.5S1.7761,10,1.5,10  L2,10.5C2,10.2239,2.2239,10,2.5,10S3,10.2239,3,10.5S2.7761,11,2.5,11H1V9.5C1,9.2239,1.2239,9,1.5,9z M6.2383,9  C6.2842,9.0856,6.3144,9.159,6.375,9.25h2.2676C8.7092,9.1121,8.75,9,8.75,9H6.2383z M13.5,9C13.7761,9,14,9.2239,14,9.5V11h-1.5  c-0.2761,0-0.5-0.2239-0.5-0.5s0.2239-0.5,0.5-0.5s0.5,0.2239,0.5,0.5l0.5-0.5C13.2239,10,13,9.7761,13,9.5S13.2239,9,13.5,9z   M6.5664,9.5c0.0786,0.0912,0.1647,0.1763,0.2598,0.25h1.4199C8.3462,9.6727,8.4338,9.5883,8.5,9.5H6.5664z"
                data-reactid=".0.1.0.1.0.$bank.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$bicycle">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$bicycle.0">
            <title
                data-reactid=".0.1.0.1.0.$bicycle.0.0">bicycle</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$bicycle.0.1"></rect>
            <path
                fill="#56b881"
                transform="translate(0 0)"
                d="  M7.5,2c-0.6761-0.01-0.6761,1.0096,0,1H9v1.2656l-2.8027,2.334L5.2226,4H5.5c0.6761,0.01,0.6761-1.0096,0-1h-2  c-0.6761-0.01-0.6761,1.0096,0,1h0.6523L5.043,6.375C4.5752,6.1424,4.0559,6,3.5,6C1.5729,6,0,7.5729,0,9.5S1.5729,13,3.5,13  S7,11.4271,7,9.5c0-0.6699-0.2003-1.2911-0.5293-1.8242L9.291,5.3262l0.4629,1.1602C8.7114,7.0937,8,8.2112,8,9.5  c0,1.9271,1.5729,3.5,3.5,3.5S15,11.4271,15,9.5S13.4271,6,11.5,6c-0.2831,0-0.5544,0.0434-0.8184,0.1074L10,4.4023V2.5  c0-0.2761-0.2239-0.5-0.5-0.5H7.5z M3.5,7c0.5923,0,1.1276,0.2119,1.5547,0.5527l-1.875,1.5625  c-0.5109,0.4273,0.1278,1.1945,0.6406,0.7695l1.875-1.5625C5.8835,8.674,6,9.0711,6,9.5C6,10.8866,4.8866,12,3.5,12S1,10.8866,1,9.5  S2.1133,7,3.5,7L3.5,7z M11.5,7C12.8866,7,14,8.1134,14,9.5S12.8866,12,11.5,12S9,10.8866,9,9.5c0-0.877,0.4468-1.6421,1.125-2.0879  l0.9102,2.2734c0.246,0.6231,1.1804,0.2501,0.9297-0.3711l-0.9082-2.2695C11.2009,7.0193,11.3481,7,11.5,7L11.5,7z"
                data-reactid=".0.1.0.1.0.$bicycle.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$bicycle-share">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$bicycle-share.0">
            <title
                data-reactid=".0.1.0.1.0.$bicycle-share.0.0">bicycle-share</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$bicycle-share.0.1"></rect>
            <path
                fill="#34a9ca"
                transform="translate(0 0)"
                d="  M10,1C9.4477,1,9,1.4477,9,2c0,0.5523,0.4477,1,1,1s1-0.4477,1-1C11,1.4477,10.5523,1,10,1z M8.1445,2.9941  c-0.13,0.0005-0.2547,0.0517-0.3477,0.1426l-2.6406,2.5c-0.2256,0.2128-0.2051,0.5775,0.043,0.7637L7,7.75v2.75  c-0.01,0.6762,1.0096,0.6762,1,0v-3c0.0003-0.1574-0.0735-0.3057-0.1992-0.4004L7.0332,6.5234l1.818-1.7212l0.7484,0.9985  C9.6943,5.9265,9.8426,6.0003,10,6h1.5c0.6761,0.01,0.6761-1.0096,0-1h-1.25L9.5,4L8.9004,3.1992  C8.8103,3.0756,8.6685,3,8.5156,2.9941H8.1445z M3,7c-1.6569,0-3,1.3432-3,3s1.3431,3,3,3s3-1.3432,3-3S4.6569,7,3,7z M12,7  c-1.6569,0-3,1.3432-3,3s1.3431,3,3,3s3-1.3432,3-3S13.6569,7,12,7z M3,8c1.1046,0,2,0.8954,2,2s-0.8954,2-2,2s-2-0.8954-2-2  S1.8954,8,3,8z M12,8c1.1046,0,2,0.8954,2,2s-0.8954,2-2,2s-2-0.8954-2-2S10.8954,8,12,8z"
                data-reactid=".0.1.0.1.0.$bicycle-share.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$car">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$car.0">
            <title
                data-reactid=".0.1.0.1.0.$car.0.0">car</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$car.0.1"></rect>
            <path
                fill="#ff9933"
                transform="translate(0 0)"
                d="M14,7c-0.004-0.6904-0.4787-1.2889-1.15-1.45l-1.39-3.24l0,0l0,0l0,0C11.3833,2.1233,11.2019,2.001,11,2H4  C3.8124,2.0034,3.6425,2.1115,3.56,2.28l0,0l0,0l0,0L2.15,5.54C1.475,5.702,0.9994,6.3059,1,7v3.5h1v1c0,0.5523,0.4477,1,1,1  s1-0.4477,1-1v-1h7v1c0,0.5523,0.4477,1,1,1s1-0.4477,1-1v-1h1V7z M4.3,3h6.4l1.05,2.5h-8.5L4.3,3z M3,9C2.4477,9,2,8.5523,2,8  s0.4477-1,1-1s1,0.4477,1,1S3.5523,9,3,9z M12,9c-0.5523,0-1-0.4477-1-1s0.4477-1,1-1s1,0.4477,1,1S12.5523,9,12,9z"
                data-reactid=".0.1.0.1.0.$car.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$castle">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$castle.0">
            <title
                data-reactid=".0.1.0.1.0.$castle.0.0">castle</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$castle.0.1"></rect>
            <path
                fill="#8a8acb"
                transform="translate(0 0)"
                d="M11,4H4C3.4477,4,3,3.5523,3,3V0.5C3,0.2239,3.2239,0,3.5,0S4,0.2239,4,0.5V2h1V1c0-0.5523,0.4477-1,1-1s1,0.4477,1,1v1h1V1  c0-0.5523,0.4477-1,1-1s1,0.4477,1,1v1h1V0.5C11,0.2239,11.2239,0,11.5,0S12,0.2239,12,0.5V3C12,3.5523,11.5523,4,11,4z M14,14.5  c0,0.2761-0.2239,0.5-0.5,0.5h-12C1.2239,15,1,14.7761,1,14.5S1.2239,14,1.5,14H2c0.5523,0,1-0.4477,1-1c0,0,1-6,1-7  c0-0.5523,0.4477-1,1-1h5c0.5523,0,1,0.4477,1,1c0,1,1,7,1,7c0,0.5523,0.4477,1,1,1h0.5c0.2723-0.0001,0.4946,0.2178,0.5,0.49V14.5z   M9,10.5C9,9.6716,8.3284,9,7.5,9S6,9.6716,6,10.5V14h3V10.5z"
                data-reactid=".0.1.0.1.0.$castle.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$cinema">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$cinema.0">
            <title
                data-reactid=".0.1.0.1.0.$cinema.0.0">cinema</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$cinema.0.1"></rect>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M14,7.5v2c0,0.2761-0.2239,0.5-0.5,0.5S13,9.7761,13,9.5c0,0,0.06-0.5-1-0.5h-1v2.5c0,0.2761-0.2239,0.5-0.5,0.5h-8  C2.2239,12,2,11.7761,2,11.5v-4C2,7.2239,2.2239,7,2.5,7h8C10.7761,7,11,7.2239,11,7.5V8h1c1.06,0,1-0.5,1-0.5  C13,7.2239,13.2239,7,13.5,7S14,7.2239,14,7.5z M4,3C2.8954,3,2,3.8954,2,5s0.8954,2,2,2s2-0.8954,2-2S5.1046,3,4,3z M4,6  C3.4477,6,3,5.5523,3,5s0.4477-1,1-1s1,0.4477,1,1S4.5523,6,4,6z M8.5,2C7.1193,2,6,3.1193,6,4.5S7.1193,7,8.5,7S11,5.8807,11,4.5  S9.8807,2,8.5,2z M8.5,6C7.6716,6,7,5.3284,7,4.5S7.6716,3,8.5,3S10,3.6716,10,4.5S9.3284,6,8.5,6z"
                data-reactid=".0.1.0.1.0.$cinema.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$circle">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$circle.0">
            <title
                data-reactid=".0.1.0.1.0.$circle.0.0">circle</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$circle.0.1"></rect>
            <path
                fill="#56b881"
                transform="translate(0 0)"
                d="M14,7.5c0,3.5899-2.9101,6.5-6.5,6.5S1,11.0899,1,7.5S3.9101,1,7.5,1S14,3.9101,14,7.5z"
                data-reactid=".0.1.0.1.0.$circle.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$circle-stroked">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$circle-stroked.0">
            <title
                data-reactid=".0.1.0.1.0.$circle-stroked.0.0">circle-stroked</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$circle-stroked.0.1"></rect>
            <path
                fill="#34a9ca"
                transform="translate(0 0)"
                d="M7.5,0C11.6422,0,15,3.3578,15,7.5S11.6422,15,7.5,15  S0,11.6422,0,7.5S3.3578,0,7.5,0z M7.5,1.6666c-3.2217,0-5.8333,2.6117-5.8333,5.8334S4.2783,13.3334,7.5,13.3334  s5.8333-2.6117,5.8333-5.8334S10.7217,1.6666,7.5,1.6666z"
                data-reactid=".0.1.0.1.0.$circle-stroked.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$clothing-store">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$clothing-store.0">
            <title
                data-reactid=".0.1.0.1.0.$clothing-store.0.0">clothing-store</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$clothing-store.0.1"></rect>
            <path
                fill="#ff9933"
                transform="translate(0 0)"
                d="  M3.5,1L0,4v3h2.9L3,14h9V7h3V4l-3.5-3H10L7.5,5L5,1H3.5z"
                data-reactid=".0.1.0.1.0.$clothing-store.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$drinking-water">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$drinking-water.0">
            <title
                data-reactid=".0.1.0.1.0.$drinking-water.0.0">drinking-water</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$drinking-water.0.1"></rect>
            <path
                fill="#8a8acb"
                transform="translate(0 0)"
                d="M5,1h9v3H6.5C6.2239,4,6,4.2239,6,4.5V7H3V3C3,1.8954,3.8954,1,5,1z M5.9,11.94L5.9,11.94L5.9,11.94L5.9,11.94L4.5,9  l-1.39,2.93C3.0535,12.1156,3.0166,12.3067,3,12.5c-0.0021,0.8284,0.6678,1.5017,1.4962,1.5038  C5.3246,14.0059,5.9979,13.3361,6,12.5076c0.0005-0.1946-0.0369-0.3873-0.11-0.5676H5.9z"
                data-reactid=".0.1.0.1.0.$drinking-water.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$embassy">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$embassy.0">
            <title
                data-reactid=".0.1.0.1.0.$embassy.0.0">embassy</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$embassy.0.1"></rect>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M6.65,2C5.43,2,4.48,3.38,4.11,3.82C4.0365,3.9102,3.9975,4.0237,4,4.14v4.4C3.9884,8.7827,4.1758,8.9889,4.4185,9.0005  C4.528,9.0057,4.6355,8.9699,4.72,8.9c0.4665-0.6264,1.1589-1.0461,1.93-1.17C8.06,7.73,8.6,9,10.07,9  c0.9948-0.0976,1.9415-0.4756,2.73-1.09c0.1272-0.0934,0.2016-0.2422,0.2-0.4V2.45c0.0275-0.2414-0.1459-0.4595-0.3874-0.487  C12.5332,1.954,12.4527,1.9668,12.38,2c-0.6813,0.5212-1.4706,0.8834-2.31,1.06C8.6,3.08,8.12,2,6.65,2z M2.5,3  c-0.5523,0-1-0.4477-1-1s0.4477-1,1-1s1,0.4477,1,1S3.0523,3,2.5,3z M3,4v9.48c0,0.2761-0.2239,0.5-0.5,0.5S2,13.7561,2,13.48V4  c0-0.2761,0.2239-0.5,0.5-0.5S3,3.7239,3,4z"
                data-reactid=".0.1.0.1.0.$embassy.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$fire-station">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$fire-station.0">
            <title
                data-reactid=".0.1.0.1.0.$fire-station.0.0">fire-station</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$fire-station.0.1"></rect>
            <path
                fill="#56b881"
                transform="translate(0 0)"
                d="M7.5,0.5L5,4.5l-1.5-2  C2.9452,3.4753,0.8036,5.7924,0.8036,8.3036C0.8036,12.002,3.8017,15,7.5,15s6.6964-2.998,6.6964-6.6964  c0-2.5112-2.1416-4.8283-2.6964-5.8036l-1.5,2L7.5,0.5z M7.5,7c0,0,2.5,2.5618,2.5,4.5c0,0.8371-0.8259,2-2.5,2S5,12.3371,5,11.5  C5,9.6283,7.5,7,7.5,7z"
                data-reactid=".0.1.0.1.0.$fire-station.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$fuel">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$fuel.0">
            <title
                data-reactid=".0.1.0.1.0.$fuel.0.0">fuel</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$fuel.0.1"></rect>
            <path
                fill="#34a9ca"
                transform="translate(0 0)"
                d="M13,6L13,6v5.5c0,0.2761-0.2239,0.5-0.5,0.5S12,11.7761,12,11.5v-2C12,8.6716,11.3284,8,10.5,8H9V2c0-0.5523-0.4477-1-1-1H2  C1.4477,1,1,1.4477,1,2v11c0,0.5523,0.4477,1,1,1h6c0.5523,0,1-0.4477,1-1V9h1.5C10.7761,9,11,9.2239,11,9.5v2  c0,0.8284,0.6716,1.5,1.5,1.5s1.5-0.6716,1.5-1.5V5c0-0.5523-0.4477-1-1-1l0,0V2.49C12.9946,2.2178,12.7723,1.9999,12.5,2  c-0.2816,0.0047-0.5062,0.2367-0.5015,0.5184C11.9987,2.5289,11.9992,2.5395,12,2.55V5C12,5.5523,12.4477,6,13,6s1-0.4477,1-1  s-0.4477-1-1-1 M8,6.5C8,6.7761,7.7761,7,7.5,7h-5C2.2239,7,2,6.7761,2,6.5v-3C2,3.2239,2.2239,3,2.5,3h5C7.7761,3,8,3.2239,8,3.5  V6.5z"
                data-reactid=".0.1.0.1.0.$fuel.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$grocery">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$grocery.0">
            <title
                data-reactid=".0.1.0.1.0.$grocery.0.0">grocery</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$grocery.0.1"></rect>
            <path
                fill="#ff9933"
                transform="translate(0 0)"
                d="M 13.199219 1.5 C 13.199219 1.5 11.808806 1.4588 11.253906 2 C 10.720406 2.5202 10.5 2.9177 10.5 4 L 1.1992188 4 L 2.59375 8.8144531 C 2.59725 8.8217531 2.6036219 8.8287375 2.6074219 8.8359375 C 2.8418219 9.4932375 3.4545469 9.9666406 4.1855469 9.9941406 C 4.1885469 9.9954406 4.1992187 10 4.1992188 10 L 10.699219 10 L 10.699219 10.199219 C 10.699219 10.199219 10.7 10.500391 10.5 10.900391 C 10.3 11.300391 10.200391 11.5 9.4003906 11.5 L 2.9003906 11.5 C 1.9003906 11.5 1.9003906 13 2.9003906 13 L 4.0996094 13 L 4.1992188 13 L 9.0996094 13 L 9.1992188 13 L 9.3007812 13 C 10.500781 13 11.399219 12.299609 11.699219 11.599609 C 11.999219 10.899609 12 10.300781 12 10.300781 L 12 10 L 12 4 C 12 3.4764 12.228619 3 12.699219 3 L 13.25 3 C 13.6642 3 14 2.6642 14 2.25 C 14 1.8358 13.6642 1.5 13.25 1.5 L 13.199219 1.5 z M 9.1992188 13 C 8.5992188 13 8.1992188 13.4 8.1992188 14 C 8.1992188 14.6 8.5992187 15 9.1992188 15 C 9.7992187 15 10.199219 14.6 10.199219 14 C 10.199219 13.4 9.7992188 13 9.1992188 13 z M 4.1992188 13 C 3.5992188 13 3.1992188 13.4 3.1992188 14 C 3.1992188 14.6 3.5992187 15 4.1992188 15 C 4.7992188 15 5.1992188 14.6 5.1992188 14 C 5.1992188 13.4 4.7992187 13 4.1992188 13 z "
                data-reactid=".0.1.0.1.0.$grocery.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$harbor">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$harbor.0">
            <title
                data-reactid=".0.1.0.1.0.$harbor.0.0">harbor</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$harbor.0.1"></rect>
            <path
                fill="#8a8acb"
                transform="translate(0 0)"
                d="M7.5,0C5.5,0,4,1.567,4,3.5c0.0024,1.5629,1.0397,2.902,2.5,3.3379v6.0391  c-0.9305-0.1647-1.8755-0.5496-2.6484-1.2695C2.7992,10.6273,2.002,9.0676,2.002,6.498c0.0077-0.5646-0.4531-1.0236-1.0176-1.0137  C0.4329,5.493-0.0076,5.9465,0,6.498c0,3.0029,1.0119,5.1955,2.4902,6.5723C3.9685,14.4471,5.8379,15,7.5,15  c1.6656,0,3.535-0.5596,5.0117-1.9395S14.998,9.4868,14.998,6.498c0.0648-1.3953-2.0628-1.3953-1.998,0  c0,2.553-0.7997,4.1149-1.8535,5.0996C10.3731,12.3203,9.4288,12.7084,8.5,12.875V6.8418C9.9607,6.4058,10.9986,5.0642,11,3.5  C11,1.567,9.5,0,7.5,0z M7.5,2C8.3284,2,9,2.6716,9,3.5S8.3284,5,7.5,5S6,4.3284,6,3.5S6.6716,2,7.5,2z"
                data-reactid=".0.1.0.1.0.$harbor.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$information">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$information.0">
            <title
                data-reactid=".0.1.0.1.0.$information.0.0">information</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$information.0.1"></rect>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M7.5,1  C6.7,1,6,1.7,6,2.5S6.7,4,7.5,4S9,3.3,9,2.5S8.3,1,7.5,1z M4,5v1c0,0,2,0,2,2v2c0,2-2,2-2,2v1h7v-1c0,0-2,0-2-2V6c0-0.5-0.5-1-1-1H4  z"
                data-reactid=".0.1.0.1.0.$information.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$laundry">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$laundry.0">
            <title
                data-reactid=".0.1.0.1.0.$laundry.0.0">laundry</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$laundry.0.1"></rect>
            <path
                fill="#56b881"
                transform="translate(0 0)"
                d="M8,1L6,3H3c0,0-1,0-1,1v9c0,1,1,1,1,1h9c0,0,1,0,1-1V2c0-1-1-1-1-1  S8,1,8,1z M8.5,2h2C10.777,2,11,2.223,11,2.5S10.777,3,10.5,3h-2C8.223,3,8,2.777,8,2.5S8.223,2,8.5,2z M7.5,6  c1.6569,0,3,1.3431,3,3s-1.3431,3-3,3s-3-1.3431-3-3S5.8431,6,7.5,6z"
                data-reactid=".0.1.0.1.0.$laundry.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$library">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$library.0">
            <title
                data-reactid=".0.1.0.1.0.$library.0.0">library</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$library.0.1"></rect>
            <path
                fill="#34a9ca"
                transform="translate(0 0)"
                d="M7.47,4.92C7.47,4.92,5.7,3,1,3v8c4.7,0,6.47,2,6.47,2S9.3,11,14,11V3C9.3,3,7.47,4.92,7.47,4.92z M13,10  c-1.9614,0.0492-3.8727,0.6299-5.53,1.68C5.836,10.6273,3.9432,10.0459,2,10V4c3.4,0.26,4.73,1.6,4.75,1.61l0.73,0.74L8.2,5.6  c0,0,1.4-1.34,4.8-1.6V10z M8,10.24l-0.1-0.17c1.3011-0.5931,2.6827-0.9907,4.1-1.18v0.2c-1.3839,0.1953-2.7316,0.5929-4,1.18V10.24  z M8,9.24L7.9,9.07C9.2016,8.4802,10.5832,8.086,12,7.9v0.2c-1.3844,0.1988-2.7321,0.5997-4,1.19V9.24z M8,8.24L7.9,8.07  C9.2015,7.48,10.5831,7.0857,12,6.9v0.2c-1.3845,0.1981-2.7323,0.599-4,1.19V8.24z M8,7.24L7.9,7.07  C9.2013,6.4794,10.583,6.0851,12,5.9v0.2c-1.3844,0.1986-2.7321,0.5996-4,1.19V7.24z M6.9,10.24C5.6639,9.6641,4.3499,9.2733,3,9.08  v-0.2c1.3872,0.2028,2.7358,0.6141,4,1.22L6.9,10.24z M6.9,9.24C5.6629,8.671,4.3488,8.2869,3,8.1V7.9  c1.386,0.2027,2.7341,0.6105,4,1.21L6.9,9.24z M6.9,8.24C5.6631,7.6705,4.3489,7.2863,3,7.1V6.9c1.3868,0.199,2.7354,0.607,4,1.21  L6.9,8.24z M6.9,7.24C5.6629,6.671,4.3488,6.2869,3,6.1V5.9c1.386,0.2024,2.7342,0.6102,4,1.21L6.9,7.24z"
                data-reactid=".0.1.0.1.0.$library.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$lodging">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$lodging.0">
            <title
                data-reactid=".0.1.0.1.0.$lodging.0.0">lodging</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$lodging.0.1"></rect>
            <path
                fill="#ff9933"
                transform="translate(0 0)"
                d="M0.5,2.5C0.2,2.5,0,2.7,0,3v7.5v2C0,12.8,0.2,13,0.5,13S1,12.8,1,12.5V11h13v1.5  c0,0.3,0.2,0.5,0.5,0.5s0.5-0.2,0.5-0.5v-2c0-0.3-0.2-0.5-0.5-0.5H1V3C1,2.7,0.8,2.5,0.5,2.5z M3.5,3C2.7,3,2,3.7,2,4.5l0,0  C2,5.3,2.7,6,3.5,6l0,0C4.3,6,5,5.3,5,4.5l0,0C5,3.7,4.3,3,3.5,3L3.5,3z M7,4C5.5,4,5.5,5.5,5.5,5.5V7h-3C2.2,7,2,7.2,2,7.5v1  C2,8.8,2.2,9,2.5,9H6h9V6.5C15,4,12.5,4,12.5,4H7z"
                data-reactid=".0.1.0.1.0.$lodging.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$marker">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$marker.0">
            <title
                data-reactid=".0.1.0.1.0.$marker.0.0">marker</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$marker.0.1"></rect>
            <path
                fill="#8a8acb"
                transform="translate(0 0)"
                d="M7.5,0C5.0676,0,2.2297,1.4865,2.2297,5.2703  C2.2297,7.8378,6.2838,13.5135,7.5,15c1.0811-1.4865,5.2703-7.027,5.2703-9.7297C12.7703,1.4865,9.9324,0,7.5,0z"
                data-reactid=".0.1.0.1.0.$marker.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$monument">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$monument.0">
            <title
                data-reactid=".0.1.0.1.0.$monument.0.0">monument</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$monument.0.1"></rect>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M7.5,0L6,2.5v7h3v-7L7.5,0z M3,11.5  L3,15h9v-3.5L10.5,10h-6L3,11.5z"
                data-reactid=".0.1.0.1.0.$monument.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$museum">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$museum.0">
            <title
                data-reactid=".0.1.0.1.0.$museum.0.0">museum</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$museum.0.1"></rect>
            <path
                fill="#56b881"
                transform="translate(0 0)"
                d="M7.5,0L1,3.4453V4h13V3.4453L7.5,0z M2,5v5l-1,1.5547V13h13v-1.4453L13,10  V5H2z M4.6152,6c0.169-0.0023,0.3318,0.0639,0.4512,0.1836L7.5,8.6172l2.4336-2.4336c0.2445-0.2437,0.6402-0.2432,0.884,0.0013  C10.9341,6.3017,10.9997,6.46,11,6.625v4.2422c0.0049,0.3452-0.271,0.629-0.6162,0.6338c-0.3452,0.0049-0.629-0.271-0.6338-0.6162  c-0.0001-0.0059-0.0001-0.0118,0-0.0177V8.1328L7.9414,9.9414c-0.244,0.2433-0.6388,0.2433-0.8828,0L5.25,8.1328v2.7344  c0.0049,0.3452-0.271,0.629-0.6162,0.6338C4.2887,11.5059,4.0049,11.2301,4,10.8849c-0.0001-0.0059-0.0001-0.0118,0-0.0177V6.625  C4,6.2836,4.2739,6.0054,4.6152,6z"
                data-reactid=".0.1.0.1.0.$museum.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$music">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$music.0">
            <title
                data-reactid=".0.1.0.1.0.$music.0.0">music</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$music.0.1"></rect>
            <path
                fill="#34a9ca"
                transform="translate(0 0)"
                d="M13.5,1c-0.0804,0.0008-0.1594,0.0214-0.23,0.06L4.5,3.5C4.2239,3.5,4,3.7239,4,4v6.28C3.6971,10.1002,3.3522,10.0037,3,10  c-1.1046,0-2,0.8954-2,2s0.8954,2,2,2s2-0.8954,2-2V7.36l8-2.22v3.64c-0.3029-0.1798-0.6478-0.2763-1-0.28c-1.1046,0-2,0.8954-2,2  s0.8954,2,2,2s2-0.8954,2-2v-9C14,1.2239,13.7761,1,13.5,1z M13,4.14L5,6.36v-2l8-2.22C13,2.14,13,4.14,13,4.14z"
                data-reactid=".0.1.0.1.0.$music.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$place-of-worship">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$place-of-worship.0">
            <title
                data-reactid=".0.1.0.1.0.$place-of-worship.0.0">place-of-worship</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$place-of-worship.0.1"></rect>
            <path
                fill="#ff9933"
                transform="translate(0 0)"
                d="M7.5,0l-2,2v2h4V2  L7.5,0z M5.5,4.5L4,6h7L9.5,4.5H5.5z M2,6.5c-0.5523,0-1,0.4477-1,1V13h2V7.5C3,6.9477,2.5523,6.5,2,6.5z M4,6.5V13h7V6.5H4z   M13,6.5c-0.5523,0-1,0.4477-1,1V13h2V7.5C14,6.9477,13.5523,6.5,13,6.5z"
                data-reactid=".0.1.0.1.0.$place-of-worship.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$police">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$police.0">
            <title
                data-reactid=".0.1.0.1.0.$police.0.0">police</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$police.0.1"></rect>
            <path
                fill="#8a8acb"
                transform="translate(0 0)"
                d="M5.5,1L6,2h5l0.5-1H5.5z M6,2.5v1.25c0,0,0,2.75,2.5,2.75S11,3.75,11,3.75V2.5H6z M1.9844,3.9863  C1.4329,3.9949,0.9924,4.4485,1,5v4c-0.0001,0.6398,0.5922,1.1152,1.2168,0.9766L5,9.3574V14l5.8789-6.9297  C10.7391,7.0294,10.5947,7,10.4414,7H6.5L3,7.7539V5C3.0077,4.4362,2.5481,3.9775,1.9844,3.9863z M11.748,7.7109L6.4121,14H12  V8.5586C12,8.2451,11.9061,7.9548,11.748,7.7109z"
                data-reactid=".0.1.0.1.0.$police.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$post">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$post.0">
            <title
                data-reactid=".0.1.0.1.0.$post.0.0">post</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$post.0.1"></rect>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M14,6.5V12c0,0.5523-0.4477,1-1,1H2c-0.5523,0-1-0.4477-1-1V6.5C1,6.2239,1.2239,6,1.5,6  c0.0692-0.0152,0.1408-0.0152,0.21,0l0,0l5.79,4l5.8-4l0,0c0.066-0.0138,0.134-0.0138,0.2,0C13.7761,6,14,6.2239,14,6.5z M1.25,3.92  L1.25,3.92L1.33,4L7.5,8l6.19-4l0,0h0.06l0,0c0.1796-0.0981,0.2792-0.2975,0.25-0.5C14,3.2239,13.7761,3,13.5,3h-12  C1.2239,3,1,3.2239,1,3.5C1.0026,3.6745,1.0978,3.8345,1.25,3.92z"
                data-reactid=".0.1.0.1.0.$post.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$prison">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$prison.0">
            <title
                data-reactid=".0.1.0.1.0.$prison.0.0">prison</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$prison.0.1"></rect>
            <path
                fill="#56b881"
                transform="translate(0 0)"
                d="M3.5,1v13H12V1H3.5z M9.5,2H11v3.5H9.5V2z M4.5,2.0547H6V7H4.5V2.0547z M7,2.0547h1.5V7H7V2.0547z M10.25,6.5  C10.6642,6.5,11,6.8358,11,7.25S10.6642,8,10.25,8l0,0C9.8358,8,9.5,7.6642,9.5,7.25l0,0C9.5,6.8358,9.8358,6.5,10.25,6.5z M7,8  h1.4727L8.5,13H7.0273L7,8z M4.5,8.166H6V13H4.5V8.166z M9.5,9H11v4H9.5V9z"
                data-reactid=".0.1.0.1.0.$prison.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$religious-christian">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$religious-christian.0">
            <title
                data-reactid=".0.1.0.1.0.$religious-christian.0.0">religious-christian</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$religious-christian.0.1"></rect>
            <path
                fill="#34a9ca"
                transform="translate(0 0)"
                d="M6,0.9552V4H3v3h3v8h3V7h3V4H9V1  c0-1-0.9776-1-0.9776-1H6.9887C6.9887,0,6,0,6,0.9552z"
                data-reactid=".0.1.0.1.0.$religious-christian.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$religious-jewish">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$religious-jewish.0">
            <title
                data-reactid=".0.1.0.1.0.$religious-jewish.0.0">religious-jewish</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$religious-jewish.0.1"></rect>
            <path
                fill="#ff9933"
                transform="translate(0 0)"
                d="M15,12H9.78L7.5,15l-2.26-3H0l2.7-4L0,4h5.3l2.2-4l2.34,4H15l-2.56,4L15,12z"
                data-reactid=".0.1.0.1.0.$religious-jewish.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$religious-muslim">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$religious-muslim.0">
            <title
                data-reactid=".0.1.0.1.0.$religious-muslim.0.0">religious-muslim</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$religious-muslim.0.1"></rect>
            <path
                fill="#8a8acb"
                transform="translate(0 0)"
                d="M6.7941,0C3,0,0,3,0,6.7941  s3,6.7941,6.7941,6.7941c2.1176,0,4.4118-0.7059,5.6471-2.2941C11.6471,11.8235,10.1471,12.4412,9,12.4412  c-2.9118,0-5.1176-2.9118-5.1176-5.8235S6.0882,1.1471,9,1.1471c1.0588,0,2.5588,0.6176,3.4412,1.1471  C11.2059,0.7059,8.9118,0,6.7941,0z M11,3l-1,2.5H7L9.5,7l-1,3L11,8.5l2.5,1.5l-1-3L15,5.5h-3L11,3z"
                data-reactid=".0.1.0.1.0.$religious-muslim.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$shop">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$shop.0">
            <title
                data-reactid=".0.1.0.1.0.$shop.0.0">shop</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$shop.0.1"></rect>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M13.33,6H11.5l-0.39-2.33c-0.1601-0.7182-0.7017-1.2905-1.41-1.49C9.3507,2.0676,8.9869,2.007,8.62,2H6.38  C6.0131,2.007,5.6493,2.0676,5.3,2.18C4.5917,2.3795,4.0501,2.9518,3.89,3.67L3.5,6H1.67C1.3939,5.9983,1.1687,6.2208,1.167,6.497  C1.1667,6.5489,1.1744,6.6005,1.19,6.65l1.88,6.3l0,0C3.2664,13.5746,3.8453,13.9996,4.5,14h6c0.651-0.0047,1.2247-0.4289,1.42-1.05  l0,0l1.88-6.3c0.0829-0.2634-0.0635-0.5441-0.3269-0.627C13.4268,6.0084,13.3786,6.0007,13.33,6z M4.52,6l0.36-2.17  c0.0807-0.3625,0.3736-0.6395,0.74-0.7C5.8663,3.0524,6.1219,3.0087,6.38,3h2.24c0.2614,0.0078,0.5205,0.0515,0.77,0.13  c0.3664,0.0605,0.6593,0.3375,0.74,0.7L10.48,6h-6H4.52z"
                data-reactid=".0.1.0.1.0.$shop.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$stadium">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$stadium.0">
            <title
                data-reactid=".0.1.0.1.0.$stadium.0.0">stadium</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$stadium.0.1"></rect>
            <path
                fill="#56b881"
                transform="translate(0 0)"
                d="M7,1v2v1.5v0.5098C4.1695,5.1037,2.0021,5.9665,2,7v4.5c0,1.1046,2.4624,2,5.5,2s5.5-0.8954,5.5-2V7  c-0.0021-1.0335-2.1695-1.8963-5-1.9902V4.0625L11,2.75L7,1z M3,8.1465c0.5148,0.2671,1.2014,0.4843,2,0.6328v2.9668  C3.7948,11.477,3,11.0199,3,10.5V8.1465z M12,8.1484V10.5c0,0.5199-0.7948,0.977-2,1.2461V8.7812  C10.7986,8.6328,11.4852,8.4155,12,8.1484z M6,8.9219C6.4877,8.973,6.9925,8.9992,7.5,9C8.0073,8.9999,8.5121,8.9743,9,8.9238  v2.9844C8.5287,11.964,8.0288,12,7.5,12S6.4713,11.964,6,11.9082V8.9219z"
                data-reactid=".0.1.0.1.0.$stadium.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$star">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$star.0">
            <title
                data-reactid=".0.1.0.1.0.$star.0.0">star</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$star.0.1"></rect>
            <path
                fill="#34a9ca"
                transform="translate(0 0)"
                d="M7.5,0l-2,5h-5l4,3.5l-2,6l5-3.5  l5,3.5l-2-6l4-3.5h-5L7.5,0z"
                data-reactid=".0.1.0.1.0.$star.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$suitcase">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$suitcase.0">
            <title
                data-reactid=".0.1.0.1.0.$suitcase.0.0">suitcase</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$suitcase.0.1"></rect>
            <path
                fill="#ff9933"
                transform="translate(0 0)"
                d="M11,4V2c0-1-1-1-1-1H5.0497  c0,0-1.1039,0.0015-1.0497,1v2H2c0,0-1,0-1,1v7c0,1,1,1,1,1h11c0,0,1,0,1-1V5c0-1-1-1-1-1H11z M5.5,2.5h4V4h-4V2.5z"
                data-reactid=".0.1.0.1.0.$suitcase.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$swimming">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$swimming.0">
            <title
                data-reactid=".0.1.0.1.0.$swimming.0.0">swimming</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$swimming.0.1"></rect>
            <path
                fill="#8a8acb"
                transform="translate(0 0)"
                d="M10.1113,2C9.9989,2,9.6758,2.1465,9.6758,2.1465L6.3535,3.8262  C5.9111,4.0024,5.7358,4.7081,6.002,5.0605l0.9707,1.4082L3.002,8.498L5,9.998l2.502-1.5l2.5,1.5l1.002-1.002l-3-4l2.5566-1.5293  c0.5286-0.2662,0.4434-0.7045,0.4434-0.9707C10.9999,2.2861,10.6437,2,10.1113,2z M12.252,5C11.2847,5,10.5,5.7827,10.5,6.75  s0.7847,1.752,1.752,1.752s1.75-0.7847,1.75-1.752S13.2192,5,12.252,5z M2.5,10L0,11.5V13l2.5-1.5L5,13l2.502-1.5l2.5,1.5L12,11.5  l3,1.5v-1.5L12,10l-1.998,1.5l-2.5-1.5L5,11.5L2.5,10z"
                data-reactid=".0.1.0.1.0.$swimming.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$theatre">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$theatre.0">
            <title
                data-reactid=".0.1.0.1.0.$theatre.0.0">theatre</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$theatre.0.1"></rect>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M2,1c0,0-1,0-1,1v5.1582C1,8.8885,1.354,11,4.5,11H5V8L2.5,9c0,0,0-2.5,2.5-2.5V5  c0-0.7078,0.0868-1.3209,0.5-1.7754C5.8815,2.805,6.5046,1.9674,8.1562,2.7539L9,3.3027V2c0,0,0-1-1-1C7.2922,1,6.0224,2,5,2  S2.7865,1,2,1z M3,3c0.5523,0,1,0.4477,1,1S3.5523,5,3,5S2,4.5523,2,4S2.4477,3,3,3z M7,4c0,0-1,0-1,1v5c0,2,1,4,4,4s4-2,4-4V5  c0-1-1-1-1-1c-0.7078,0-1.9776,1-3,1S7.7865,4,7,4z M8,6c0.5523,0,1,0.4477,1,1S8.5523,8,8,8S7,7.5523,7,7S7.4477,6,8,6z M12,6  c0.5523,0,1,0.4477,1,1s-0.4477,1-1,1s-1-0.4477-1-1S11.4477,6,12,6z M7.5,10H10h2.5c0,0,0,2.5-2.5,2.5S7.5,10,7.5,10z"
                data-reactid=".0.1.0.1.0.$theatre.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$toilet">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$toilet.0">
            <title
                data-reactid=".0.1.0.1.0.$toilet.0.0">toilet</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$toilet.0.1"></rect>
            <path
                fill="#56b881"
                transform="translate(0 0)"
                d="M4.5,3C3.6716,3,3,2.3284,3,1.5S3.6716,0,4.5,0S6,0.6716,6,1.5S5.3284,3,4.5,3z M14,1.5C14,0.6716,13.3284,0,12.5,0  S11,0.6716,11,1.5S11.6716,3,12.5,3S14,2.3284,14,1.5z M8.86,6.64L8.86,6.64L6.38,4.15l0,0C6.2798,4.0492,6.142,3.9949,6,4H3  C2.8697,4.0003,2.7445,4.0503,2.65,4.14l0,0L0.14,6.63c-0.2261,0.177-0.2659,0.5039-0.0889,0.73s0.5039,0.2659,0.73,0.0889  C0.8142,7.423,0.8441,7.3931,0.87,7.36L3,5.2L1,11h2v3.33c-0.0075,0.0497-0.0075,0.1003,0,0.15  c0.0555,0.2761,0.3244,0.455,0.6005,0.3995C3.802,14.839,3.9595,14.6815,4,14.48l0,0V11h1v3.5l0,0  c0.0555,0.2761,0.3244,0.455,0.6005,0.3995C5.802,14.859,5.9595,14.7015,6,14.5c0.0075-0.0497,0.0075-0.1003,0-0.15V11h2L6,5.2  l2.14,2.16l0,0c0.0967,0.1081,0.2349,0.17,0.38,0.17C8.7954,7.5088,9.0061,7.2761,9,7C9.0023,6.8663,8.9521,6.737,8.86,6.64z   M14.5,4h-4C10.2239,4,10,4.2239,10,4.5v5c0,0.2761,0.2239,0.5,0.5,0.5S11,9.7761,11,9.5v5c0,0.2761,0.2239,0.5,0.5,0.5  s0.5-0.2239,0.5-0.5v-5h1v5c0,0.2761,0.2239,0.5,0.5,0.5s0.5-0.2239,0.5-0.5v-5c0,0.2761,0.2239,0.5,0.5,0.5S15,9.7761,15,9.5v-5  C15,4.2239,14.7761,4,14.5,4z"
                data-reactid=".0.1.0.1.0.$toilet.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$town-hall">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$town-hall.0">
            <title
                data-reactid=".0.1.0.1.0.$town-hall.0.0">town-hall</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$town-hall.0.1"></rect>
            <path
                fill="#34a9ca"
                transform="translate(0 0)"
                d="M7.5,0L1,3.4453V4h13V3.4453L7.5,0z M2,5v5l-1,1.5547V13h13v-1.4453L13,10V5H2z M4,6h1v5.5H4V6z M7,6h1v5.5H7  V6z M10,6h1v5.5h-1V6z"
                data-reactid=".0.1.0.1.0.$town-hall.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$triangle">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$triangle.0">
            <title
                data-reactid=".0.1.0.1.0.$triangle.0.0">triangle</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$triangle.0.1"></rect>
            <path
                fill="#ff9933"
                transform="translate(0 0)"
                d="M7.5385,2  C7.2437,2,7.0502,2.1772,6.9231,2.3846l-5.8462,9.5385C1,12,1,12.1538,1,12.3077C1,12.8462,1.3846,13,1.6923,13h11.6154  C13.6923,13,14,12.8462,14,12.3077c0-0.1538,0-0.2308-0.0769-0.3846L8.1538,2.3846C8.028,2.1765,7.7882,2,7.5385,2z"
                data-reactid=".0.1.0.1.0.$triangle.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$triangle-stroked">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$triangle-stroked.0">
            <title
                data-reactid=".0.1.0.1.0.$triangle-stroked.0.0">triangle-stroked</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$triangle-stroked.0.1"></rect>
            <path
                fill="#8a8acb"
                transform="translate(0 0)"
                d="M7.5243,1.5004  C7.2429,1.4913,6.9787,1.6423,6.8336,1.8952l-5.5,9.8692C1.0218,12.3078,1.395,12.9999,2,13h11  c0.605-0.0001,0.9782-0.6922,0.6664-1.2355l-5.5-9.8692C8.0302,1.6579,7.7884,1.5092,7.5243,1.5004z M7.5,3.8993l4.1267,7.4704  H3.3733L7.5,3.8993z"
                data-reactid=".0.1.0.1.0.$triangle-stroked.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$veterinary">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$veterinary.0">
            <title
                data-reactid=".0.1.0.1.0.$veterinary.0.0">veterinary</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$veterinary.0.1"></rect>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M7.5,6c-2.5,0-3,2.28-3,3.47l0,0c-0.6097,0.2059-1.1834,0.5062-1.7,0.89  c-0.871,0.6614-1.0492,1.8998-0.4,2.78c0.6799,0.8542,1.9081,1.0297,2.8,0.4c0.6779-0.4601,1.4808-0.701,2.3-0.69  c0.8192-0.011,1.6221,0.2299,2.3,0.69c0.8575,0.6854,2.1072,0.5515,2.8-0.3c0.6888-0.8134,0.5878-2.0313-0.2256-2.7201  c-0.0243-0.0206-0.0491-0.0406-0.0744-0.0599l-0.1-0.1c-0.5333-0.3564-1.1032-0.6548-1.7-0.89l0,0C10.5,8.29,10,6,7.5,6z"
                data-reactid=".0.1.0.1.0.$veterinary.0.5:$0"></path>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M2.08,4.3c-0.7348,0.3676-1.0652,1.2371-0.76,2c0.064,0.8282,0.7809,1.4517,1.61,1.4  c0.7348-0.3676,1.0652-1.2371,0.76-2C3.626,4.8718,2.9091,4.2483,2.08,4.3z"
                data-reactid=".0.1.0.1.0.$veterinary.0.5:$1"></path>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M12.93,4.3c0.7348,0.3676,1.0653,1.2371,0.76,2c-0.064,0.8282-0.7809,1.4517-1.61,1.4  c-0.7348-0.3676-1.0653-1.2371-0.76-2C11.384,4.8718,12.1009,4.2483,12.93,4.3z"
                data-reactid=".0.1.0.1.0.$veterinary.0.5:$2"></path>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M5.08,1.3c-0.68,0.09-1,0.94-0.76,1.87C4.4301,3.9951,5.1003,4.6321,5.93,4.7c0.68-0.09,1-0.94,0.76-1.87  C6.5799,2.0049,5.9097,1.3679,5.08,1.3z"
                data-reactid=".0.1.0.1.0.$veterinary.0.5:$3"></path>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M9.93,1.3c0.68,0.09,1,0.94,0.76,1.87C10.5791,3.9986,9.9036,4.6365,9.07,4.7c-0.68-0.08-1-0.94-0.76-1.87  C8.4209,2.0014,9.0964,1.3634,9.93,1.3z"
                data-reactid=".0.1.0.1.0.$veterinary.0.5:$4"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$dentist">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$dentist.0">
            <title
                data-reactid=".0.1.0.1.0.$dentist.0.0">dentist</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$dentist.0.1"></rect>
            <path
                fill="#56b881"
                transform="translate(0 0)"
                d="M4.36,14c-1,0-0.56-2.67-0.86-5c-0.1-0.76-1-1.49-1.12-2.06C2,5,1.39,1.44,3.66,1S6,3,7.54,3s1.57-2.36,3.85-2  s1.59,3.9,1.29,5.9c-0.1,0.45-1.1,1.48-1.18,2.06c-0.33,2.4,0.32,5-0.8,5c-0.93,0-1.32-2.72-2-4.5C8.43,8.63,8.06,8,7.54,8  C6,8,5.75,14,4.36,14z"
                data-reactid=".0.1.0.1.0.$dentist.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$doctor">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$doctor.0">
            <title
                data-reactid=".0.1.0.1.0.$doctor.0.0">doctor</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$doctor.0.1"></rect>
            <path
                fill="#34a9ca"
                transform="translate(0 0)"
                d="M5.5,7C4.1193,7,3,5.8807,3,4.5l0,0v-2C3,2.2239,3.2239,2,3.5,2H4c0.2761,0,0.5-0.2239,0.5-0.5S4.2761,1,4,1H3.5  C2.6716,1,2,1.6716,2,2.5v2c0.0013,1.1466,0.5658,2.2195,1.51,2.87l0,0C4.4131,8.1662,4.9514,9.297,5,10.5C5,12.433,6.567,14,8.5,14  s3.5-1.567,3.5-3.5V9.93c1.0695-0.2761,1.7126-1.367,1.4365-2.4365C13.1603,6.424,12.0695,5.7809,11,6.057  C9.9305,6.3332,9.2874,7.424,9.5635,8.4935C9.7454,9.198,10.2955,9.7481,11,9.93v0.57c0,1.3807-1.1193,2.5-2.5,2.5S6,11.8807,6,10.5  c0.0511-1.2045,0.5932-2.3356,1.5-3.13l0,0C8.4404,6.7172,9.001,5.6448,9,4.5v-2C9,1.6716,8.3284,1,7.5,1H7  C6.7239,1,6.5,1.2239,6.5,1.5S6.7239,2,7,2h0.5C7.7761,2,8,2.2239,8,2.5v2l0,0C8,5.8807,6.8807,7,5.5,7 M11.5,9  c-0.5523,0-1-0.4477-1-1s0.4477-1,1-1s1,0.4477,1,1S12.0523,9,11.5,9z"
                data-reactid=".0.1.0.1.0.$doctor.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$hospital">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$hospital.0">
            <title
                data-reactid=".0.1.0.1.0.$hospital.0.0">hospital</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$hospital.0.1"></rect>
            <path
                fill="#ff9933"
                transform="translate(0 0)"
                d="M7,1C6.4,1,6,1.4,6,2v4H2C1.4,6,1,6.4,1,7v1  c0,0.6,0.4,1,1,1h4v4c0,0.6,0.4,1,1,1h1c0.6,0,1-0.4,1-1V9h4c0.6,0,1-0.4,1-1V7c0-0.6-0.4-1-1-1H9V2c0-0.6-0.4-1-1-1H7z"
                data-reactid=".0.1.0.1.0.$hospital.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$pharmacy">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$pharmacy.0">
            <title
                data-reactid=".0.1.0.1.0.$pharmacy.0.0">pharmacy</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$pharmacy.0.1"></rect>
            <path
                fill="#8a8acb"
                transform="translate(0 0)"
                d="M9.5,4l1.07-1.54c0.0599,0.0046,0.1201,0.0046,0.18,0c0.6904-0.0004,1.2497-0.5603,1.2494-1.2506  C11.999,0.519,11.4391-0.0404,10.7487-0.04C10.0584-0.0396,9.499,0.5203,9.4994,1.2106c0,0.0131,0.0002,0.0262,0.0006,0.0394  c0,0,0,0.07,0,0.1L7,4H9.5z M12,6V5H3v1l1.5,3.5L3,13v1h9v-1l-1-3.5L12,6z M10,10H8v2H7v-2H5V9h2V7h1v2h2V10z"
                data-reactid=".0.1.0.1.0.$pharmacy.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$campsite">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$campsite.0">
            <title
                data-reactid=".0.1.0.1.0.$campsite.0.0">campsite</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$campsite.0.1"></rect>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M7,1.5  l-5.5,9H1c-1,0-1,1-1,1v1c0,0,0,1,1,1h13c1,0,1-1,1-1v-1c0,0,0-1-1-1h-0.5L8,1.5C7.8,1.1,7.2,1.1,7,1.5z M7.5,5l3.2,5.5H4.2L7.5,5z"
                data-reactid=".0.1.0.1.0.$campsite.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$cemetery">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$cemetery.0">
            <title
                data-reactid=".0.1.0.1.0.$cemetery.0.0">cemetery</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$cemetery.0.1"></rect>
            <path
                fill="#56b881"
                transform="translate(0 0)"
                d="M11.46,12h-0.68L12,3.55c0.0175-0.2867-0.2008-0.5332-0.4874-0.5507C11.4884,2.9979,11.4641,2.9981,11.44,3h-1.18  c0-0.92-1.23-2-2.75-2S4.77,2.08,4.77,3H3.54C3.253,2.9885,3.0111,3.2117,2.9995,3.4987C2.9988,3.5158,2.999,3.5329,3,3.55L4.2,12  H3.55C3.2609,11.9886,3.0162,12.2112,3,12.5V14h9v-1.51C11.9839,12.2067,11.7435,11.9886,11.46,12z M4.5,5h6v1h-6V5z"
                data-reactid=".0.1.0.1.0.$cemetery.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$dog-park">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$dog-park.0">
            <title
                data-reactid=".0.1.0.1.0.$dog-park.0.0">dog-park</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$dog-park.0.1"></rect>
            <path
                fill="#34a9ca"
                transform="translate(0 0)"
                d="M 10.300781 1.2207031 C 9.9144812 1.2207031 9.6 1.2 9.5 2 L 9.0996094 4.5214844 L 11.5 6.5 L 13.5 6.5 C 14.9 6.5 15 5.5410156 15 5.5410156 L 13.099609 3.3222656 C 12.399609 2.6222656 11.7 2.5 11 2.5 L 11 2 C 11 2 11.067481 1.2206031 10.300781 1.2207031 z M 4.75 1.5 C 4.75 1.5 3.7992187 1.5206031 3.1992188 1.7207031 C 2.5992187 1.9207031 2 2.6210938 2 3.6210938 L 2 7.5214844 C 2 9.2214844 1.3 9.5 1 9.5 C 1 9.5 0 9.5214844 0 10.521484 L 0 12.720703 C 0 12.720703 0.00078125 13.521484 0.80078125 13.521484 L 1 13.521484 L 1.5 13.521484 L 2 13.521484 L 2 13.021484 L 2 12.822266 C 2 12.422266 1.8 12.221094 1.5 12.121094 L 1.5 11.021484 C 2.5 11.021484 2.6 10.820703 3 10.720703 L 3.5507812 12.917969 C 3.6507813 13.217969 3.7507813 13.417578 4.0507812 13.517578 L 5.0507812 13.517578 L 6 13.5 L 6 12.699219 C 6 12.022819 5 12 5 12 L 5 9.5 L 8.5 9.5 L 9.1992188 12.121094 C 9.5992188 13.521094 10.5 13.5 10.5 13.5 L 11 13.5 L 12 13.5 L 12 12.699219 C 12 11.987419 11 12 11 12 L 11.099609 7.921875 L 8 5.5 L 3.5 5.5 L 3.5 3.5 C 3.5 3.1 3.7765 3.0053 4 3 C 4.4941 2.9882 4.75 3 4.75 3 C 5.1642 3 5.5 2.6642 5.5 2.25 C 5.5 1.8358 5.1642 1.5 4.75 1.5 z M 11.75 4 C 11.8881 4 12 4.1119 12 4.25 C 12 4.3881 11.8881 4.5 11.75 4.5 C 11.6119 4.5 11.5 4.3881 11.5 4.25 C 11.5 4.1119 11.6119 4 11.75 4 z "
                data-reactid=".0.1.0.1.0.$dog-park.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$garden">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$garden.0">
            <title
                data-reactid=".0.1.0.1.0.$garden.0.0">garden</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$garden.0.1"></rect>
            <path
                fill="#ff9933"
                transform="translate(0 0)"
                d="M13,8c0,3.31-2.19,6-5.5,6S2,11.31,2,8c2.2643,0.0191,4.2694,1.4667,5,3.61V7H4.5C3.6716,7,3,6.3284,3,5.5v-3  C3,2.2239,3.2239,2,3.5,2c0.1574,0,0.3056,0.0741,0.4,0.2l1.53,2l1.65-3c0.1498-0.232,0.4593-0.2985,0.6913-0.1487  C7.8308,1.0898,7.8815,1.1404,7.92,1.2l1.65,3l1.53-2c0.1657-0.2209,0.4791-0.2657,0.7-0.1C11.9259,2.1944,12,2.3426,12,2.5v3  C12,6.3284,11.3284,7,10.5,7H8v4.61C8.7306,9.4667,10.7357,8.0191,13,8z"
                data-reactid=".0.1.0.1.0.$garden.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$golf">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$golf.0">
            <title
                data-reactid=".0.1.0.1.0.$golf.0.0">golf</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$golf.0.1"></rect>
            <path
                fill="#8a8acb"
                transform="translate(0 0)"
                d="  M3.3999,1.1c0,0.1,0,0.2,0,0.2c0,0.4,0.3,0.7,0.7,0.7c0.3,0,0.5-0.2,0.6-0.5l0,0L4.9,1l5.6,2.3L6.6,6C6.2,6.3,6.2,6.7,6.3,7.1  l0.9,2.1l-1.3,3.9C5.7,13.6,6.1,14,6.5,14c0.3,0,0.5-0.1,0.6-0.5l1.4-4l0.1,0.3v3.5c0,0,0,0.7,0.7,0.7s0.7-0.7,0.7-0.7V10  c0-0.2,0-0.3-0.1-0.5L8.5,6.1l2.7-1.9c0.2-0.2,0.4-0.3,0.4-0.6s-0.2-0.5-0.4-0.6L4,0.1c-0.0878,0-0.118,0.0179-0.2001,0.1  L3.3999,1.1z M5.5,3C4.7,3,4,3.7,4,4.5S4.7,6,5.5,6S7,5.3,7,4.5S6.2999,3,5.5,3z"
                data-reactid=".0.1.0.1.0.$golf.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$park">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$park.0">
            <title
                data-reactid=".0.1.0.1.0.$park.0.0">park</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$park.0.1"></rect>
            <path
                fill="#e55e5e"
                transform="translate(0 0)"
                d="M14,5.75c0.0113-0.6863-0.3798-1.3159-1-1.61C12.9475,3.4906,12.4014,2.9926,11.75,3  c-0.0988,0.0079-0.1962,0.0281-0.29,0.06c-0.0607-0.66-0.6449-1.1458-1.3048-1.0851C9.8965,1.9987,9.6526,2.1058,9.46,2.28l0,0  c0-0.6904-0.5596-1.25-1.25-1.25S6.96,1.5896,6.96,2.28C6.96,2.28,7,2.3,7,2.33C6.4886,1.8913,5.7184,1.9503,5.2797,2.4618  C5.1316,2.6345,5.0347,2.8451,5,3.07C4.8417,3.0195,4.6761,2.9959,4.51,3C3.6816,2.9931,3.0044,3.659,2.9975,4.4874  C2.9958,4.6872,3.0341,4.8852,3.11,5.07C2.3175,5.2915,1.8546,6.1136,2.0761,6.9061C2.2163,7.4078,2.6083,7.7998,3.11,7.94  c0.2533,0.7829,1.0934,1.2123,1.8763,0.959C5.5216,8.7258,5.9137,8.2659,6,7.71C6.183,7.8691,6.4093,7.9701,6.65,8v5L5,14h5l-1.6-1  v-2c0.7381-0.8915,1.6915-1.5799,2.77-2c0.8012,0.1879,1.603-0.3092,1.7909-1.1103C12.9893,7.7686,13.0025,7.6444,13,7.52  c0.0029-0.0533,0.0029-0.1067,0-0.16C13.6202,7.0659,14.0113,6.4363,14,5.75z M8.4,10.26V6.82C8.6703,7.3007,9.1785,7.5987,9.73,7.6  h0.28c0.0156,0.4391,0.2242,0.849,0.57,1.12C9.7643,9.094,9.0251,9.6162,8.4,10.26z"
                data-reactid=".0.1.0.1.0.$park.0.5:$0"></path>
        </svg>
    </div>
    <div
        class="pad1 col1"
        data-reactid=".0.1.0.1.0.$picnic-site">
        <svg
            viewBox="0 0 15 15"
            height="15"
            width="15"
            data-reactid=".0.1.0.1.0.$picnic-site.0">
            <title
                data-reactid=".0.1.0.1.0.$picnic-site.0.0">picnic-site</title>
            <rect
                fill="none"
                x="0"
                y="0"
                width="15"
                height="15"
                data-reactid=".0.1.0.1.0.$picnic-site.0.1"></rect>
            <path
                fill="#56b881"
                transform="translate(0 0)"
                d="M4,3C3.446,3,3,3.446,3,4s0.446,1,1,1h1.2969  L4.6523,7H2.5c-0.554,0-1,0.446-1,1s0.446,1,1,1h1.5098L3.041,12.0098c-0.1284,0.3939,0.0868,0.8173,0.4807,0.9457  s0.8173-0.0868,0.9457-0.4807c0.0005-0.0013,0.0009-0.0027,0.0013-0.004L5.5859,9h3.8281l1.1172,3.4707  c0.1273,0.3943,0.5501,0.6107,0.9443,0.4834s0.6107-0.5501,0.4834-0.9443l0,0L10.9902,9H12.5c0.554,0,1-0.446,1-1s-0.446-1-1-1  h-2.1523L9.7031,5H11c0.554,0,1-0.446,1-1s-0.446-1-1-1H4z M6.873,5H8.127l0.6445,2h-2.543L6.873,5z"
                data-reactid=".0.1.0.1.0.$picnic-site.0.5:$0"></path>
        </svg>
    </div>
</div>
`;
    function find(id) {
        let svgNodes = document.getElementsByTagName("div");
        for (let i = 0; i < svgNodes.length; i++) {
            let n = svgNodes[i];
            if (n.dataset.reactid === `.0.1.0.1.0.$${id}`) {
                let svg = n.getElementsByTagName("svg")[0];
                svg.id = id;
                return svg;
            }
        }
        return undefined;
    }
    function run() {
        $(html).appendTo("body");
        let svg = find("aquarium");
        console.log(svg);
        $(svg).clone().appendTo(".map");
        $(`<svg viewBox="0 0 15 15" height="200" width="200"><use href='#${svg.id}'/></svg>`).appendTo(".map");
    }
    exports.run = run;
});
define("ol3-lab/labs/wfs-map", ["require", "exports", "openlayers", "ol3-lab/labs/mapmaker"], function (require, exports, ol, MapMaker) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const idealTextColor = ([a, b, c]) => (150 < (a * 0.299) + (b * 0.587) + (c * 0.114)) ? "black" : "white";
    function asColor(value) {
        let seed = value.length;
        for (let i = 0; i < value.length; i++)
            seed += value.charCodeAt(i);
        return seed % 255;
    }
    function run() {
        let url = 'http://localhost:8083/geoserver/cite/wfs?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&outputFormat=text/javascript';
        let map = MapMaker.run().then(map => {
            let format = new ol.format.GeoJSON();
            window.___parseResponse___ = function (data) {
                let features = data.features.map(f => format.readFeature(f));
                wfsSource.addFeatures(features);
            };
            let strategy = ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
                tileSize: 1024
            }));
            let wfsSource = new ol.source.Vector({
                loader: (extent, resolution, projection) => {
                    let srs = projection.getCode();
                    $.ajax({
                        url: `${url}&typename=cite:usa_adm2&srsname=${srs}&bbox=${extent.join(",")},${encodeURIComponent(srs)}&format_options=callback:___parseResponse___`,
                        jsonp: false,
                        dataType: "jsonp"
                    });
                },
                strategy: strategy
            });
            let wfsLayer = new ol.layer.Vector({
                source: wfsSource,
                style: (feature, resolution) => {
                    let style = feature.getStyle();
                    if (!style) {
                        let stateColor = asColor(feature.get("name_1"));
                        let color = asColor(feature.get("name_2"));
                        let style = new ol.style.Style({
                            text: new ol.style.Text({
                                text: feature.get("name_2"),
                                fill: new ol.style.Fill({
                                    color: idealTextColor([color, color, color])
                                })
                            }),
                            fill: new ol.style.Fill({
                                color: `rgba(${color}, ${color}, ${color}, 0.5)`,
                            }),
                            stroke: new ol.style.Stroke({
                                color: `rgba(${stateColor}, ${stateColor}, ${stateColor}, 1.0)`,
                                width: 1
                            })
                        });
                        feature.setStyle(style);
                    }
                    return style;
                }
            });
            map.addLayer(wfsLayer);
        });
    }
    exports.run = run;
});
define("ol3-lab/labs/common/ol3-patch", ["require", "exports", "openlayers", "ol3-lab/labs/common/common"], function (require, exports, ol3, common_20) {
    "use strict";
    if (!ol3.geom.SimpleGeometry.prototype.scale) {
        let scale = (flatCoordinates, offset, end, stride, deltaX, deltaY, opt_dest) => {
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
        common_20.mixin(ol3.geom.SimpleGeometry.prototype, {
            scale: function (deltaX, deltaY) {
                let it = this;
                it.applyTransform((flatCoordinates, output, stride) => {
                    scale(flatCoordinates, 0, flatCoordinates.length, stride, deltaX, deltaY, flatCoordinates);
                    return flatCoordinates;
                });
                it.changed();
            }
        });
    }
    return ol3;
});
define("bower_components/ol3-draw/ol3-draw/ol3-delete", ["require", "exports", "openlayers", "bower_components/ol3-draw/ol3-draw/ol3-button", "bower_components/ol3-fun/ol3-fun/common"], function (require, exports, ol, ol3_button_3, common_21) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Delete extends ol3_button_3.Button {
        constructor(options) {
            super(options);
            let map = options.map;
            let featureLayers = [];
            let selection = new ol.interaction.Select({
                condition: ol.events.condition.click,
                multi: false,
                style: (feature, res) => {
                    let index = selection.getFeatures().getArray().indexOf(feature);
                    let fillColor = "rgba(0,0,0,0.2)";
                    let strokeColor = "red";
                    let textTemplate = {
                        text: "X" + (index + 1),
                        fill: {
                            color: strokeColor
                        },
                        stroke: {
                            color: fillColor,
                            width: 2
                        },
                        scale: 3
                    };
                    let style = options.style[feature.getGeometry().getType()]
                        .map(s => this.symbolizer.fromJson(common_21.defaults({ text: textTemplate }, s)));
                    return style;
                }
            });
            let boxSelect = new ol.interaction.DragBox({
                condition: options.boxSelectCondition
            });
            boxSelect.on("boxend", args => {
                let extent = boxSelect.getGeometry().getExtent();
                let features = selection.getFeatures().getArray();
                options.map.getLayers()
                    .getArray()
                    .filter(l => l instanceof ol.layer.Vector)
                    .map(l => l)
                    .forEach(l => l.getSource().forEachFeatureIntersectingExtent(extent, feature => {
                    if (-1 === features.indexOf(feature)) {
                        selection.getFeatures().push(feature);
                        this.addFeatureLayerAssociation(feature, l);
                    }
                    else {
                        selection.getFeatures().remove(feature);
                        this.addFeatureLayerAssociation(feature, null);
                    }
                }));
            });
            let doit = () => {
                selection.getFeatures().forEach(f => {
                    let l = selection.getLayer(f) || this.featureLayerAssociation_[f.getId()];
                    l && l.getSource().removeFeature(f);
                });
                selection.getFeatures().clear();
                this.featureLayerAssociation_ = [];
            };
            this.once("change:active", () => {
                [selection, boxSelect].forEach(i => {
                    i.setActive(false);
                    map.addInteraction(i);
                });
                this.handlers.push(() => {
                    [selection, boxSelect].forEach(i => {
                        i.setActive(false);
                        map.removeInteraction(i);
                    });
                });
            });
            this.on("change:active", () => {
                let active = this.get("active");
                if (!active) {
                    doit();
                    selection.getFeatures().clear();
                }
                [boxSelect, selection].forEach(i => i.setActive(active));
            });
        }
        static create(options) {
            options = common_21.defaults({}, options, Delete.DEFAULT_OPTIONS);
            return ol3_button_3.Button.create(options);
        }
        addFeatureLayerAssociation(feature, layer) {
            if (!this.featureLayerAssociation_)
                this.featureLayerAssociation_ = [];
            var key = feature.getId();
            this.featureLayerAssociation_[key] = layer;
        }
    }
    Delete.DEFAULT_OPTIONS = {
        className: "ol-delete",
        label: "␡",
        title: "Delete",
        buttonType: Delete,
        eventName: "delete-feature",
        boxSelectCondition: ol.events.condition.shiftKeyOnly,
        style: {
            "Point": [{
                    circle: {
                        radius: 20,
                        fill: {
                            color: "blue"
                        },
                        stroke: {
                            color: "red",
                            width: 2
                        },
                        opacity: 1
                    }
                }],
            "MultiLineString": [{
                    stroke: {
                        color: "red",
                        width: 2
                    }
                }],
            "Circle": [{
                    fill: {
                        color: "blue"
                    },
                    stroke: {
                        color: "red",
                        width: 2
                    }
                }],
            "Polygon": [{
                    fill: {
                        color: "blue"
                    },
                    stroke: {
                        color: "red",
                        width: 2
                    }
                }],
            "MultiPolygon": [{
                    fill: {
                        color: "blue"
                    },
                    stroke: {
                        color: "red",
                        width: 2
                    }
                }]
        }
    };
    exports.Delete = Delete;
});
define("bower_components/ol3-draw/ol3-draw/ol3-translate", ["require", "exports", "openlayers", "bower_components/ol3-draw/ol3-draw/ol3-button", "bower_components/ol3-fun/ol3-fun/common"], function (require, exports, ol, ol3_button_4, common_22) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Translate extends ol3_button_4.Button {
        constructor(options) {
            super(options);
            let map = options.map;
            let select = new ol.interaction.Select({
                wrapX: false
            });
            let translate = new ol.interaction.Translate({
                features: select.getFeatures()
            });
            select.on("select", (args) => {
                translate.setActive(true);
            });
            this.once("change:active", () => {
                [select, translate].forEach(i => {
                    i.setActive(false);
                    options.map.addInteraction(i);
                });
                this.handlers.push(() => {
                    [select, translate].forEach(i => {
                        i.setActive(false);
                        options.map.removeInteraction(i);
                    });
                });
            });
            this.on("change:active", () => {
                let active = this.get("active");
                this.options.element.classList.toggle("active", active);
                select.setActive(active);
                if (!active)
                    select.getFeatures().clear();
            });
        }
        static create(options) {
            options = common_22.defaults({}, options, Translate.DEFAULT_OPTIONS);
            return ol3_button_4.Button.create(options);
        }
    }
    Translate.DEFAULT_OPTIONS = {
        className: "ol-translate",
        position: "top right",
        label: "XY",
        title: "Translate",
        eventName: "translate-feature",
        buttonType: Translate
    };
    exports.Translate = Translate;
});
define("bower_components/ol3-draw/ol3-draw/services/wfs-sync", ["require", "exports", "openlayers", "jquery", "bower_components/ol3-fun/ol3-fun/common"], function (require, exports, ol, $, common_23) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const serializer = new XMLSerializer();
    class WfsSync {
        constructor(options) {
            this.options = options;
            this.lastSavedTime = Date.now();
            this.deletes = [];
            this.watch();
        }
        static create(options) {
            options = common_23.defaults(options || {}, WfsSync.DEFAULT_OPTIONS);
            if (!options.formatter) {
                options.formatter = new ol.format.WFS();
            }
            if (!options.srsName) {
                options.srsName = options.source.getProjection().getCode();
            }
            let result = new WfsSync(options);
            return result;
        }
        watch() {
            let save = common_23.debounce(() => this.saveDrawings({
                features: this.options.source.getFeatures().filter(f => !!f.get(this.options.lastUpdateFieldName))
            }), 1000);
            let touch = (f) => {
                f.set(this.options.lastUpdateFieldName, Date.now());
                save();
            };
            let watch = (f) => {
                f.getGeometry().on("change", () => touch(f));
                f.on("propertychange", (args) => {
                    if (args.key === this.options.lastUpdateFieldName)
                        return;
                    touch(f);
                });
            };
            let source = this.options.source;
            source.forEachFeature(f => watch(f));
            source.on("addfeature", (args) => {
                args.feature.set("strname", "29615");
                watch(args.feature);
                touch(args.feature);
            });
            source.on("removefeature", (args) => {
                this.deletes.push(args.feature);
                touch(args.feature);
            });
        }
        saveDrawings(args) {
            let features = args.features.filter(f => this.lastSavedTime <= f.get(this.options.lastUpdateFieldName));
            features.forEach(f => f.set(this.options.lastUpdateFieldName, undefined));
            console.log("saving", features.map(f => f.get(this.options.lastUpdateFieldName)));
            let saveTo = (featureType, geomType) => {
                let toSave = features.filter(f => f.getGeometry().getType() === geomType);
                let toDelete = this.deletes.filter(f => !!f.get(this.options.featureIdFieldName));
                if (0 === (toSave.length + toDelete.length)) {
                    console.info("nothing to save", featureType, geomType);
                    return;
                }
                if (this.options.sourceSrs && this.options.sourceSrs !== this.options.srsName) {
                    let srsIn = new ol.proj.Projection({ code: this.options.sourceSrs });
                    let srsOut = new ol.proj.Projection({ code: this.options.srsName });
                    toSave = toSave.map(f => f.clone());
                    toSave.forEach(f => f.getGeometry().transform(srsIn, srsOut));
                    throw "should not be necessary, perform on server, cloning will prevent insert key from updating";
                }
                let format = this.options.formatter;
                let toInsert = toSave.filter(f => !f.get(this.options.featureIdFieldName));
                let toUpdate = toSave.filter(f => !!f.get(this.options.featureIdFieldName));
                let requestBody = format.writeTransaction(toInsert, toUpdate, toDelete, {
                    featureNS: this.options.featureNS,
                    featurePrefix: this.options.featurePrefix,
                    featureType: featureType,
                    srsName: this.options.srsName,
                    nativeElements: []
                });
                $.ajax({
                    type: "POST",
                    url: this.options.wfsUrl,
                    data: serializer.serializeToString(requestBody),
                    contentType: "application/xml",
                    dataType: "xml",
                    success: (response) => {
                        let responseInfo = format.readTransactionResponse(response);
                        if (responseInfo.transactionSummary.totalDeleted) {
                            console.log("totalDeleted: ", responseInfo.transactionSummary.totalDeleted);
                        }
                        if (responseInfo.transactionSummary.totalInserted) {
                            console.log("totalInserted: ", responseInfo.transactionSummary.totalInserted);
                        }
                        if (responseInfo.transactionSummary.totalUpdated) {
                            console.log("totalUpdated: ", responseInfo.transactionSummary.totalUpdated);
                        }
                        console.assert(toInsert.length === responseInfo.transactionSummary.totalInserted, "number inserted should equal number of new keys");
                        toInsert.forEach((f, i) => {
                            let id = responseInfo.insertIds[i];
                            f.set("gid", id.split(".").pop());
                            f.setId(id);
                        });
                    }
                });
            };
            this.lastSavedTime = Date.now();
            Object.keys(this.options.targets).forEach(k => {
                saveTo(this.options.targets[k], k);
            });
        }
    }
    WfsSync.DEFAULT_OPTIONS = {
        featureIdFieldName: "gid",
        lastUpdateFieldName: "touched",
    };
    exports.WfsSync = WfsSync;
});
define("ol3-lab/labs/geoserver/services", ["require", "exports", "jquery", "openlayers", "ol3-lab/labs/mapmaker", "bower_components/ol3-symbolizer/index", "bower_components/ol3-popup/index", "bower_components/ol3-draw/index", "bower_components/ol3-draw/ol3-draw/ol3-edit", "bower_components/ol3-draw/ol3-draw/ol3-delete", "bower_components/ol3-draw/ol3-draw/ol3-translate", "bower_components/ol3-draw/ol3-draw/services/wfs-sync"], function (require, exports, $, ol, MapMaker, Symbolizer, ol3_popup_7, ol3_draw_2, ol3_edit_2, ol3_delete_1, ol3_translate_1, wfs_sync_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const symbolizer = new Symbolizer.StyleConverter();
    const serializer = new XMLSerializer();
    function run() {
        let srsName = "EPSG:3857";
        let wfsUrl = "http://localhost:8080/geoserver/cite/wfs";
        let featureNS = "http://www.opengeospatial.net/cite";
        let featurePrefix = "cite";
        let targets = {
            Point: "addresses",
            MultiLineString: "streets",
            MultiPolygon: "parcels",
        };
        MapMaker.run({
            srs: srsName,
            basemap: "bing"
        }).then(map => {
            let source = new ol.source.Vector();
            let layer = new ol.layer.Vector({ source: source });
            layer.setStyle(symbolizer.fromJson({
                fill: {
                    color: "rgba(33,33,33,0.5)"
                },
                stroke: {
                    color: "rgba(50,100,50,0.8)",
                    width: 3
                },
                circle: {
                    fill: {
                        color: "rgba(99,33,33,1)"
                    },
                    stroke: {
                        color: "rgba(255,255,255,1)"
                    },
                    radius: 5,
                    opacity: 1
                }
            }));
            map.addLayer(layer);
            {
                let format = new ol.format.WFS();
                let requestBody = format.writeGetFeature({
                    featureNS: featureNS,
                    featurePrefix: featurePrefix,
                    featureTypes: Object.keys(targets).map((k) => targets[k]),
                    srsName: srsName,
                    filter: ol.format.filter.equalTo("strname", "29615")
                });
                let data = serializer.serializeToString(requestBody);
                $.ajax({
                    type: "POST",
                    url: wfsUrl,
                    data: data,
                    contentType: "application/xml",
                    dataType: "xml",
                    success: (response) => {
                        let features = format.readFeatures(response);
                        features = features.filter(f => !!f.getGeometry());
                        source.addFeatures(features);
                        let extent = ol.extent.createEmpty();
                        features.forEach(f => ol.extent.extend(extent, f.getGeometry().getExtent()));
                        map.getView().fit(extent, map.getSize());
                    }
                });
            }
            {
                let popup = new ol3_popup_7.Popup({
                    css: `
            .ol-popup {
                background-color: white;
            }
            .ol-popup .page {
                max-height: 200px;
                overflow-y: auto;
            }
            `,
                    dockContainer: map.getViewport()
                });
                map.addOverlay(popup);
                map.on("click", (event) => {
                    let interactions = map
                        .getInteractions()
                        .getArray()
                        .filter(i => i instanceof ol.interaction.Draw || i instanceof ol.interaction.Modify || i instanceof ol.interaction.Translate);
                    console.log(interactions);
                    if (interactions.length)
                        return;
                    let coord = event.coordinate;
                    popup.hide();
                    let pageNum = 0;
                    map.forEachFeatureAtPixel(event.pixel, (feature, layer) => {
                        let page = document.createElement('p');
                        let keys = Object.keys(feature.getProperties()).filter(key => {
                            let v = feature.get(key);
                            if (typeof v === "string")
                                return true;
                            if (typeof v === "number")
                                return true;
                            return false;
                        });
                        page.title = "" + ++pageNum;
                        page.innerHTML = `<table>${keys.map(k => `<tr><td>${k}</td><td>${feature.get(k)}</td></tr>`).join("")}</table>`;
                        popup.pages.add(page, new ol.geom.Point(event.coordinate));
                    });
                    popup.show(coord, `<label>${pageNum} Features Found</label>`);
                    popup.pages.goto(0);
                });
            }
            map.addControl(ol3_draw_2.Draw.create({ geometryType: "MultiPolygon", label: "▧", position: "right-4 top", layers: [layer] }));
            map.addControl(ol3_draw_2.Draw.create({ geometryType: "MultiLineString", label: "▬", position: "right-2 top", layers: [layer] }));
            map.addControl(ol3_draw_2.Draw.create({ geometryType: "Point", label: "●", position: "right top", layers: [layer] }));
            map.addControl(ol3_translate_1.Translate.create({ position: "right-4 top-2" }));
            map.addControl(ol3_edit_2.Modify.create({ label: "Δ", position: "right-2 top-2" }));
            map.addControl(ol3_delete_1.Delete.create({ label: "X", position: "right top-2" }));
            wfs_sync_1.WfsSync.create({
                wfsUrl: wfsUrl,
                featureNS: featureNS,
                featurePrefix: featurePrefix,
                srsName: srsName,
                source: source,
                targets: targets
            });
        });
    }
    exports.run = run;
});
define("ol3-lab/tests/data/maplet", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.maplet = {
        "data": {
            "Map": {
                "Symbology": {
                    "Symbols": [{
                            "Icons": [{
                                    "id": "*",
                                    "type": "json",
                                    "style": "[{\r\n    \"star\": {\r\n        \"fill\": {\r\n            \"color\": \"rgba(238,162,144,1)\"\r\n        },\r\n        \"opacity\": 1,\r\n        \"stroke\": {\r\n            \"color\": \"rgba(169,141,168,0.8)\",\r\n            \"width\": 1\r\n        },\r\n        \"radius\": 7,\r\n        \"radius2\": 2,\r\n        \"points\": 5\r\n    }\r\n},\r\n{\r\n    \"icon\": {\r\n        \"src\": \"app/icons/solid.png\",\r\n        \"anchor-y\": 1,\r\n        \"color\": \"rgba(94, 94, 94, 1)\",\r\n        \"scale\": 0.8\r\n    }\r\n},\r\n{\r\n    \"text\": {\r\n        \"text\": \"9\",\r\n        \"font\": \"16px Helvetica\",\r\n        \"offset-y\": -32,\r\n        \"fill\": {\r\n            \"color\": \"rgba(255,255,255,1)\"\r\n        },\r\n        \"stroke\": {\r\n            \"color\": \"rgba(94, 94, 94, 1)\",\r\n            \"width\": 1\r\n        }\r\n    }\r\n}]",
                                    "Width": 0,
                                    "Height": 0,
                                    "Label": "Point Feature"
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "somecount_0_10",
                                                "Value": "<10"
                                            }]
                                    },
                                    "id": "tiny",
                                    "type": "json",
                                    "style": "[{\r\n    \"star\": {\r\n        \"fill\": {\r\n            \"color\": \"rgba(94, 94, 94, 0.5)\"\r\n        },\r\n        \"opacity\": 1,\r\n        \"rotation\": 0,\r\n        \"stroke\": {\r\n            \"color\": \"rgba(94, 94, 94, 1)\",\r\n            \"width\": 1\r\n        },\r\n        \"radius\": 55,\r\n        \"radius2\": 20,\r\n        \"points\": 2\r\n    }\r\n},\r\n{\r\n    \"svg\": {\r\n        \"imgSize\": [\r\n        13, 20],\r\n        \"anchor\": [0.5, 1],\r\n        \"scale\": 1,\r\n        \"rotation\": 0,\r\n        \"fill\": {\r\n            \"color\": \"rgba(94, 94, 94, 1)\"\r\n        },\r\n        \"stroke\": {\r\n            \"color\": \"rgba(255, 255, 255, 1)\",\r\n            \"width\": 1\r\n        },\r\n        \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n    }\r\n},\r\n{\r\n    \"text\": {\r\n        \"text\": \"9\",\r\n        \"font\": \"12px Helvetica\",\r\n        \"scale\": 1,\r\n        \"rotation\": 0,\r\n        \"offset-x\": 0,\r\n        \"offset-y\": -12,\r\n        \"fill\": {\r\n            \"color\": \"rgba(255,255,255,1)\"\r\n        },\r\n        \"stroke\": {\r\n            \"color\": \"rgba(94, 94, 94, 1)\",\r\n            \"width\": 0\r\n        }\r\n    }\r\n}]",
                                    "Width": 0,
                                    "Height": 0,
                                    "Label": "Point Feature"
                                }],
                            "id": "point-features",
                            "Label": "Point Features"
                        },
                        {
                            "Icons": [{
                                    "id": "*",
                                    "type": "style",
                                    "style": "{\r\n    \"type\": \"mixed\",\r\n    \"fill\": {\r\n        \"style\": \"solid\",\r\n        \"color\": [255, 0, 0, 0.9]\r\n    },\r\n    \"stroke\": {\r\n        \"style\": \"solid\",\r\n        \"color\": [170, 220, 170, 1],\r\n        \"width\": 3\r\n    }\r\n}",
                                    "Width": 0,
                                    "Height": 0,
                                    "Label": "Red Zone"
                                }],
                            "id": "red-zones",
                            "Label": "Red Zone"
                        },
                        {
                            "Icons": [{
                                    "id": "*",
                                    "type": "style",
                                    "style": "{\r\n    \"type\": \"mixed\",\r\n    \"fill\": {\r\n        \"style\": \"solid\",\r\n        \"color\": [150, 220, 130, 0.5]\r\n    },\r\n    \"stroke\": {\r\n        \"style\": \"solid\",\r\n        \"color\": [170, 220, 170, 1],\r\n        \"width\": 3\r\n    }\r\n}",
                                    "Width": 0,
                                    "Height": 0,
                                    "Label": "Green Zone"
                                }],
                            "id": "green-zones",
                            "Label": "Green Zone"
                        },
                        {
                            "Icons": [{
                                    "id": "*",
                                    "type": "json",
                                    "style": "[{\r\n    \"fill\": {\r\n        \"pattern\": {\r\n            \"orientation\": \"horizontal\",\r\n            \"color\": \"rgba(192,192,192, 0.5)\",\r\n            \"spacing\": 10,\r\n            \"repitition\": \"repeat\"\r\n        }\r\n    }\r\n},\r\n{\r\n    \"fill\": {\r\n        \"pattern\": {\r\n            \"orientation\": \"vertical\",\r\n            \"color\": \"rgba(192,192,192, 0.5)\",\r\n            \"spacing\": 10,\r\n            \"repitition\": \"repeat\"\r\n        }\r\n    }\r\n},\r\n{\r\n    \"stroke\": {\r\n        \"color\": \"white\",\r\n        \"width\": 3\r\n    }\r\n},\r\n{\r\n    \"stroke\": {\r\n        \"color\": \"black\",\r\n        \"width\": 1\r\n    }\r\n},\r\n{\r\n    \"image\": {\r\n        \"scale\": 2,\r\n        \"imgSize\": [13, 21],\r\n        \"stroke\": {\r\n            \"color\": \"rgba(255,255,255,1)\"\r\n        },\r\n        \"fill\": {\r\n            \"color\": \"rgba(50,50,50,1)\"\r\n        },\r\n        \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n    }\r\n}]",
                                    "Width": 0,
                                    "Height": 0
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "selected",
                                                "Value": ">0"
                                            }]
                                    },
                                    "id": "selected",
                                    "type": "json",
                                    "style": "[{\r\n    \"fill\": {\r\n        \"color\": \"rgba(6,151,232,0.5)\"\r\n    }\r\n},\r\n{\r\n    \"stroke\": {\r\n        \"color\": \"white\",\r\n        \"width\": 3\r\n    }\r\n},\r\n{\r\n    \"stroke\": {\r\n        \"color\": \"rgba(6,151,232,1)\",\r\n        \"width\": 1\r\n    }\r\n},\r\n{\r\n    \"image\": {\r\n        \"scale\": 2,\r\n        \"imgSize\": [13, 21],\r\n        \"stroke\": {\r\n            \"color\": \"rgba(255,255,255,1)\"\r\n        },\r\n        \"fill\": {\r\n            \"color\": \"rgba(6,151,232,1)\"\r\n        },\r\n        \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n    }\r\n}]",
                                    "Width": 0,
                                    "Height": 0
                                }],
                            "id": "parcels",
                            "Label": "PARCEL <%- PRCLID %>",
                            "template": "app/templates/parcel-template"
                        },
                        {
                            "Icons": [{
                                    "id": "*",
                                    "type": "json",
                                    "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 1.5,\r\n                            \"imgSize\": [13, 21],\r\n                            \"stroke\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(50,50,50,1)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    }\r\n]",
                                    "Width": 0,
                                    "Height": 0
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "lon",
                                                "Value": ">-99999999999"
                                            }]
                                    },
                                    "id": "coordinates",
                                    "type": "json",
                                    "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 1.5,\r\n                            \"imgSize\": [13, 21],\r\n                            \"stroke\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(50,50,50,1)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    }\r\n]",
                                    "Width": 0,
                                    "Height": 0,
                                    "Label": "<%= parseFloat(lat).toFixed(5) %>,<%= parseFloat(lon).toFixed(5) %>"
                                }],
                            "id": "points",
                            "Label": "Default"
                        },
                        {
                            "Icons": [{
                                    "id": "*",
                                    "type": "json",
                                    "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 2,\r\n                            \"imgSize\": [13, 21],\r\n                            \"stroke\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(50,50,50,1)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    }\r\n]",
                                    "Width": 0,
                                    "Height": 0,
                                    "Label": "<%= address_symbol_title %>"
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "count",
                                                "Value": ">0"
                                            },
                                            {
                                                "id": "selected",
                                                "Value": ">0"
                                            }]
                                    },
                                    "id": "selected-cluster",
                                    "type": "json",
                                    "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 2,\r\n                            \"imgSize\": [13, 21],\r\n                            \"stroke\": {\r\n                                \"color\": \"rgba(6,151,232,1)\", \r\n                                \"width\": 1\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(6,151,232,1)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    },\r\n                    {\r\n                        \"text\": {\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"stroke\": {\r\n                                \"color\": \"rgba(0,0,0,1)\",\r\n                                \"width\": 1\r\n                            },\r\n                            \"offset-x\": 0,\r\n                            \"offset-y\": -24,\r\n                            \"text\": \"<%=count%>\",\r\n                            \"font\": \"14pt serif\"\r\n                        }\r\n                    }]",
                                    "Width": 0,
                                    "Height": 0
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "count",
                                                "Value": ">0"
                                            }]
                                    },
                                    "id": "cluster",
                                    "type": "json",
                                    "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 2,\r\n                            \"imgSize\": [13, 21],\r\n                            \"stroke\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(51,51,51,0.85)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    },\r\n                    {\r\n                        \"text\": {\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"stroke\": {\r\n                                \"color\": \"rgba(51,51,51,1)\",\r\n                                \"width\": 3\r\n                            },\r\n                            \"offset-x\": 0,\r\n                            \"offset-y\": -24,\r\n                            \"text\": \"<%=count%>\",\r\n                            \"font\": \"14pt serif\"\r\n                        }\r\n                    }]",
                                    "Width": 0,
                                    "Height": 0
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "selected",
                                                "Value": ">0"
                                            }]
                                    },
                                    "id": "selected-address",
                                    "type": "json",
                                    "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 2,\r\n                            \"imgSize\": [13, 21],\r\n                            \"stroke\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(6,151,232,1)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    }\r\n]",
                                    "Width": 0,
                                    "Height": 0,
                                    "Label": "<%= address_symbol_title %>"
                                }],
                            "id": "addresses",
                            "Label": "Address"
                        },
                        {
                            "Icons": [{
                                    "id": "*",
                                    "type": "style",
                                    "style": "{\r\n    \"type\": \"mixed\",\r\n    \"image\": {\r\n        \"icon\": \"silver-pink.png\",\r\n        \"anchorYValue\": 1\r\n    }\r\n}",
                                    "Width": 0,
                                    "Height": 0
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "count",
                                                "Value": ">1"
                                            }]
                                    },
                                    "id": "int-cluster-selected",
                                    "type": "json",
                                    "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 2,\r\n                            \"imgSize\": [\r\n                                13, 21],                            \"stroke\": {\r\n                                \"color\": \"rgba(150,150,150,0.3)\",\r\n                                \"width\": 1\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(21,120,205,1)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    },\r\n                    {\r\n                        \"text\": {\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"stroke\": {\r\n\r\n                            },\r\n                            \"offset-x\": 0,\r\n                            \"offset-y\": -25,\r\n                            \"text\": \"<%=count%>\",\r\n                            \"font\": \"13pt sans-serif\"\r\n                        }\r\n                    }]",
                                    "Width": 0,
                                    "Height": 0
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "selected",
                                                "Value": ">0"
                                            }]
                                    },
                                    "id": "int-selected",
                                    "type": "json",
                                    "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 2,\r\n                            \"imgSize\": [\r\n                                13, 21],                            \"stroke\": {\r\n                                \"color\": \"rgba(150,150,150,0.3)\",\r\n                                \"width\": 1\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(21,120,205,1)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    }]",
                                    "Width": 0,
                                    "Height": 0
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "count",
                                                "Value": ">0"
                                            }]
                                    },
                                    "id": "int-cluster",
                                    "type": "json",
                                    "style": "[\r\n                    {\r\n                        \"image\": {\r\n                            \"scale\": 2,\r\n                            \"imgSize\": [\r\n                                13, 21],                            \"stroke\": {\r\n                                \"color\": \"rgba(150,150,150,0.3)\",\r\n                                \"width\": 1\r\n                            },\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(94,94,94,1)\"\r\n                            },\r\n                            \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n                        }\r\n                    },\r\n                    {\r\n                        \"text\": {\r\n                            \"fill\": {\r\n                                \"color\": \"rgba(255,255,255,1)\"\r\n                            },\r\n                            \"stroke\": {\r\n\r\n                            },\r\n                            \"offset-x\": 0,\r\n                            \"offset-y\": -25,\r\n                            \"text\": \"<%=count%>\",\r\n                            \"font\": \"13pt sans-serif\"\r\n                        }\r\n                    }]",
                                    "Width": 0,
                                    "Height": 0
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "_dataType",
                                                "Value": "ServiceRequest,serviceRequest"
                                            }]
                                    },
                                    "id": "ServiceRequest.png",
                                    "type": "json",
                                    "style": "[\n{ \r\n   \"image\": {\"scale\":2.0,\r\n     \"imgSize\": [\r\n        13,\r\n        21\r\n     ], \"stroke\": {\r\n        \"color\": \"rgba(150,150,150,0.3)\",\r\n        \"width\": 1\r\n      },  \r\n     \"fill\": {\r\n        \"color\": \"rgba(94,94,94,1)\"\r\n     },\r\n     \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n   }\r\n}]\r\n",
                                    "Width": 0,
                                    "Height": 0
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "_dataType",
                                                "Value": "planning,Planning"
                                            }]
                                    },
                                    "id": "Planning_Application.png",
                                    "type": "json",
                                    "style": "[\n{ \r\n   \"image\": {\"scale\":2.0,\r\n     \"imgSize\": [\r\n        13,\r\n        21\r\n     ], \"stroke\": {\r\n        \"color\": \"rgba(150,150,150,0.3)\",\r\n        \"width\": 1\r\n      },  \r\n     \"fill\": {\r\n        \"color\": \"rgba(94,94,94,1)\"\r\n     },\r\n     \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n   }\r\n}]\r\n",
                                    "Width": 0,
                                    "Height": 0,
                                    "template": "app/templates/civics-infoviewer-template"
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "_dataType",
                                                "Value": "businessLicense,BusinessLicense"
                                            }]
                                    },
                                    "id": "License_Application.png",
                                    "type": "json",
                                    "style": "[\n{ \r\n   \"image\": {\"scale\":2.0,\r\n     \"imgSize\": [\r\n        13,\r\n        21\r\n     ], \"stroke\": {\r\n        \"color\": \"rgba(150,150,150,0.3)\",\r\n        \"width\": 1\r\n      },  \r\n     \"fill\": {\r\n        \"color\": \"rgba(94,94,94,1)\"\r\n     },\r\n     \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n   }\r\n}]\r\n",
                                    "Width": 0,
                                    "Height": 0
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "_dataType",
                                                "Value": "building,Building"
                                            }]
                                    },
                                    "id": "Building_Review.png",
                                    "type": "json",
                                    "style": "[\n{ \r\n   \"image\": {\"scale\":2.0,\r\n     \"imgSize\": [\r\n        13,\r\n        21\r\n     ], \"stroke\": {\r\n        \"color\": \"rgba(150,150,150,0.3)\",\r\n        \"width\": 1\r\n      },  \r\n     \"fill\": {\r\n        \"color\": \"rgba(94,94,94,1)\"\r\n     },\r\n     \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n   }\r\n}]\r\n",
                                    "Width": 0,
                                    "Height": 0
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "_dataType",
                                                "Value": "project,Project"
                                            }]
                                    },
                                    "id": "Project_Application.png",
                                    "type": "json",
                                    "style": "[\n{ \r\n   \"image\": {\"scale\":2.0,\r\n     \"imgSize\": [\r\n        13,\r\n        21\r\n     ], \"stroke\": {\r\n        \"color\": \"rgba(150,150,150,0.3)\",\r\n        \"width\": 1\r\n      },  \r\n     \"fill\": {\r\n        \"color\": \"rgba(94,94,94,1)\"\r\n     },\r\n     \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n   }\r\n}]\r\n",
                                    "Width": 0,
                                    "Height": 0
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "_dataType",
                                                "Value": "use,Use"
                                            }]
                                    },
                                    "id": "Use_Application.png",
                                    "type": "json",
                                    "style": "[\n{ \r\n   \"image\": {\"scale\":2.0,\r\n     \"imgSize\": [\r\n        13,\r\n        21\r\n     ], \"stroke\": {\r\n        \"color\": \"rgba(150,150,150,0.3)\",\r\n        \"width\": 1\r\n      },  \r\n     \"fill\": {\r\n        \"color\": \"rgba(94,94,94,1)\"\r\n     },\r\n     \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n   }\r\n}]\r\n",
                                    "Width": 0,
                                    "Height": 0
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "_dataType",
                                                "Value": "codeEnforcement,CodeEnforcement"
                                            }]
                                    },
                                    "id": "Case.png",
                                    "type": "json",
                                    "style": "[\n{ \r\n   \"image\": {\"scale\":2.0,\r\n     \"imgSize\": [\r\n        13,\r\n        21\r\n     ], \"stroke\": {\r\n        \"color\": \"rgba(150,150,150,0.3)\",\r\n        \"width\": 1\r\n      },  \r\n     \"fill\": {\r\n        \"color\": \"rgba(94,94,94,1)\"\r\n     },\r\n     \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n   }\r\n}]\r\n",
                                    "Width": 0,
                                    "Height": 0
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "_dataType",
                                                "Value": "tradeLicense,TradeLicense"
                                            }]
                                    },
                                    "id": "trade-license",
                                    "type": "json",
                                    "style": "[\n{ \r\n   \"image\": {\"scale\":2.0,\r\n     \"imgSize\": [\r\n        13,\r\n        21\r\n     ], \"stroke\": {\r\n        \"color\": \"rgba(150,150,150,0.3)\",\r\n        \"width\": 1\r\n      },  \r\n     \"fill\": {\r\n        \"color\": \"rgba(94,94,94,1)\"\r\n     },\r\n     \"path\": \"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z\"\r\n   }\r\n}]\r\n",
                                    "Width": 0,
                                    "Height": 0
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "type",
                                                "Value": "address"
                                            }]
                                    },
                                    "id": "address-marker",
                                    "type": "style",
                                    "style": "{\r\n    \"type\": \"mixed\",\r\n    \"image\": {\r\n        \"icon\": \"white-hole.png\",\r\n        \"anchor\": [0.5, 1.0],\r\n        \"color\": [255, 0, 0], \r\n        \"opacity\": 0.5,\r\n        \"scale\": 0.75\r\n    },\r\n    \"text\": {\r\n        \"text\": \"<%=text %>\",\r\n        \"textAlign\": \"center\",\r\n        \"textBaseline\": \"top\"\r\n    }\r\n}",
                                    "Width": 0,
                                    "Height": 0,
                                    "Label": "<address><%= text %></address>"
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "type",
                                                "Value": "text,address"
                                            }]
                                    },
                                    "id": "text-only-marker",
                                    "type": "style",
                                    "style": "{\"type\":\"circle\",\"radius\":7,\"fill\":{\"color\":[247,96,84]}}",
                                    "Width": 0,
                                    "Height": 0,
                                    "Label": "<address><%= text %></address>"
                                },
                                {
                                    "id": "MapPin.png",
                                    "Width": 0,
                                    "Height": 0
                                }],
                            "id": "*",
                            "Label": "<%= computedDescription %>",
                            "template": "app/templates/civics-infoviewer-template"
                        },
                        {
                            "Icons": [{
                                    "id": "*",
                                    "type": "style",
                                    "style": "{\"type\":\"sfs\",\"style\":\"solid\",\"color\":[0,246,0,0.5],\"outline\":{\"type\":\"sls\",\"style\":\"solid\",\"color\":[246,103,197],\"width\":1}}",
                                    "Width": 0,
                                    "Height": 0
                                }],
                            "id": "properties",
                            "Label": "<%= PROPID %> - <%= PROPNAME %> <h6><%= Comment %></h6>"
                        },
                        {
                            "Icons": [{
                                    "id": "*",
                                    "type": "style",
                                    "style": "{\"type\":\"circle\",\"radius\":9,\"fill\":{\"color\":[247,96,247]}}",
                                    "Width": 0,
                                    "Height": 0
                                },
                                {
                                    "Filters": {
                                        "Filters": [{
                                                "id": "requestType.type",
                                                "Value": "GISTest"
                                            }]
                                    },
                                    "id": "ServiceRequest.png",
                                    "type": "style",
                                    "style": "{\r\n    \"type\": \"mixed\",\r\n    \"image\": {\r\n        \"icon\": \"white-hole.png\",\r\n        \"anchorYUnits\": \"pixels\",\r\n        \"anchorYValue\": 62,\r\n        \"color\": [203, 28, 99, 10]\r\n    },\r\n    \"text\": {\r\n        \"text\": \"SR <%=id%>\",\r\n        \"textAlign\": \"center\",\r\n        \"textBaseline\": \"top\",\r\n        \"offsetY\": 64,\r\n        \"scale\": 2\r\n    }\r\n}",
                                    "Width": 0,
                                    "Height": 0,
                                    "Label": "<address>Service Request <%= id %></address><address><%= address.displayText %></address><comment><%= requestType.description %></comment>"
                                }],
                            "id": "crm-servicerequest",
                            "Label": "<address><%= locationLine1 %></address><address><%= locationLine2 %></address>"
                        }],
                    "IconWidth": 0,
                    "IconHeight": 0
                },
                "Layers": {
                    "Layers": [{
                            "Layers": {
                                "Layers": [{
                                        "Options": {
                                            "Values": [{
                                                    "id": "symbology",
                                                    "about": "Render as a zone",
                                                    "value": "green-zones"
                                                },
                                                {
                                                    "id": "resultRecordCount",
                                                    "about": "Do not return more than 100 results",
                                                    "value": "100"
                                                },
                                                {
                                                    "id": "visible",
                                                    "value": "true"
                                                },
                                                {
                                                    "id": "filter",
                                                    "value": "<%= green_zone_filter %>"
                                                }]
                                        },
                                        "id": "green-zone",
                                        "text": "Green Zones",
                                        "url": "<%= primary_featureserver_url %>/<%= zone_layer_id %>",
                                        "type": "app/layer-factory/ags-featureserver",
                                        "basemap": false,
                                        "minlevel": 0,
                                        "maxlevel": 22,
                                        "disabled": false
                                    },
                                    {
                                        "Options": {
                                            "Values": [{
                                                    "id": "symbology",
                                                    "about": "Render as a zone",
                                                    "value": "red-zones"
                                                },
                                                {
                                                    "id": "resultRecordCount",
                                                    "about": "Do not return more than 100 results",
                                                    "value": "100"
                                                },
                                                {
                                                    "id": "visible",
                                                    "value": "true"
                                                },
                                                {
                                                    "id": "filter",
                                                    "value": "<%= red_zone_filter %>"
                                                }]
                                        },
                                        "id": "red-zone",
                                        "text": "Red Zones",
                                        "url": "<%= primary_featureserver_url %>/<%= zone_layer_id %>",
                                        "type": "app/layer-factory/ags-featureserver",
                                        "basemap": false,
                                        "minlevel": 0,
                                        "maxlevel": 22,
                                        "disabled": false
                                    }]
                            },
                            "Options": {
                                "Values": [{
                                        "id": "visible",
                                        "value": "true"
                                    }]
                            },
                            "id": "zones",
                            "text": "Zones",
                            "type": "app/layer-factory/group",
                            "basemap": false,
                            "minlevel": 0,
                            "maxlevel": 22,
                            "disabled": false
                        },
                        {
                            "id": "parcels",
                            "basemap": false,
                            "minlevel": 0,
                            "maxlevel": 0,
                            "disabled": false,
                            "Events": {
                                "Events": [{
                                        "name": "attempt-parcel-reverse-geocode,universal-search",
                                        "id": "reverse-geoquery-multiplexer",
                                        "about": "Wait for parcel and address results",
                                        "mid": "app/commands/multiplexer",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "once",
                                                    "about": "Only do this once per \"use-this-parcel\" event",
                                                    "value": "true"
                                                },
                                                {
                                                    "id": "in",
                                                    "value": "parcel-result-ready,address-join-results-ready"
                                                },
                                                {
                                                    "id": "out",
                                                    "about": "civics:map-click-results is picked up by liferay-interpreter and given to civics, notify show-coordinates so it can render a location marker if no features are found",
                                                    "value": "civics:map-click-results"
                                                },
                                                {
                                                    "id": "when-visible",
                                                    "about": "Wait for parcels and associated addresses only when this parcel layer is visible",
                                                    "value": "true"
                                                }]
                                        }
                                    },
                                    {
                                        "name": "attempt-parcel-reverse-geocode,universal-search",
                                        "id": "reverse-geoquery-multiplexer-no-parcel",
                                        "about": "Wait for address results",
                                        "mid": "app/commands/multiplexer",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "once",
                                                    "about": "Only do this once per \"use-this-parcel\" event",
                                                    "value": "true"
                                                },
                                                {
                                                    "id": "in",
                                                    "about": "Once this multiplexer is activated it will wait for the address results to be ready before notifying civics of a a map-click-result",
                                                    "value": "address-result-ready"
                                                },
                                                {
                                                    "id": "out",
                                                    "about": "civics:map-click-results is picked up by liferay-interpreter and given to civics, notify show-coordinates so it can render a location marker if no features are found",
                                                    "value": "civics:map-click-results"
                                                },
                                                {
                                                    "id": "when-visible",
                                                    "about": "Do not attempt to wait for addresses unless this parcel layer is not visible",
                                                    "value": "false"
                                                }]
                                        }
                                    },
                                    {
                                        "name": "attempt-parcel-reverse-geocode",
                                        "id": "attempt-parcel-reverse-geocode",
                                        "about": "If parcel layer visible then search for a parcel otherwise spoof an empty result",
                                        "mid": "app/commands/trigger",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "event",
                                                    "about": "When this layer is checked attempt to locate a parcel via a reverse geoquery",
                                                    "value": "parcel-reverse-geoquery"
                                                },
                                                {
                                                    "id": "when-visible",
                                                    "about": "Do not attempt to locate a parcel when this layer is not visible",
                                                    "value": "true"
                                                }]
                                        }
                                    },
                                    {
                                        "name": "attempt-parcel-reverse-geocode",
                                        "id": "do-not-attempt-parcel-reverse-geocode",
                                        "about": "If parcel layer visible then search for a parcel",
                                        "mid": "app/commands/trigger",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "when-visible",
                                                    "about": "only trigger this event when this layer is not visible",
                                                    "value": "false"
                                                },
                                                {
                                                    "id": "event",
                                                    "about": "Spoof a parcel ready with no results so the multiplexer can continue",
                                                    "value": "parcel-result-ready"
                                                }]
                                        }
                                    },
                                    {
                                        "name": "layer-visible",
                                        "id": "clear-features-on-hide",
                                        "about": "Clear all the parcel features when unchecked",
                                        "mid": "app/commands/trigger",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "event",
                                                    "value": "clear-features-from-layer"
                                                },
                                                {
                                                    "id": "when-visible",
                                                    "about": "When this layer is no longer visible clear features from the parcel-features layer",
                                                    "value": "false"
                                                },
                                                {
                                                    "id": "layer-name",
                                                    "about": "Clears the features from the parcel-features layers",
                                                    "value": "parcel-features"
                                                }]
                                        }
                                    },
                                    {
                                        "name": "universal-search",
                                        "id": "ags-parcel-locator",
                                        "about": "Use the AGS find service to search for parcels",
                                        "mid": "app/commands/ags-geoquery-locator",
                                        "text": "Parcel Locator",
                                        "type": "find",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "query-service",
                                                    "value": "<%= primary_mapserver_url %>/<%= parcel_layer_id %>&sr=4326"
                                                },
                                                {
                                                    "id": "symbology",
                                                    "about": "Directs the renderer to use the 'parcels' symbologies instead of the default (*) symbologies",
                                                    "value": "parcels"
                                                },
                                                {
                                                    "id": "zoommap",
                                                    "value": "true"
                                                },
                                                {
                                                    "id": "key-template",
                                                    "value": "<%= layer_key_template %>"
                                                },
                                                {
                                                    "id": "event",
                                                    "about": "Once the results are gathered forward them to the 'geoquery-result' handler",
                                                    "value": "parcel-result-ready,auto-zoom,report-search-status"
                                                },
                                                {
                                                    "id": "layer-name",
                                                    "about": "merge features into the parcel-features layer",
                                                    "value": "parcel-features"
                                                },
                                                {
                                                    "id": "keywords",
                                                    "value": "parcel"
                                                },
                                                {
                                                    "id": "type",
                                                    "value": "find"
                                                },
                                                {
                                                    "id": "message",
                                                    "value": "Parcel Search Completed"
                                                }]
                                        }
                                    }]
                            },
                            "Options": {
                                "Values": [{
                                        "id": "showLayers",
                                        "about": "Parcels Only",
                                        "value": "<%= parcel_layer_id %>"
                                    },
                                    {
                                        "id": "layerType",
                                        "value": "rest"
                                    },
                                    {
                                        "id": "visible",
                                        "value": "true"
                                    }]
                            },
                            "text": "Parcels",
                            "url": "<%= primary_mapserver_url %>",
                            "type": "app/layer-factory/arcgis-tile"
                        },
                        {
                            "id": "addresses",
                            "basemap": false,
                            "minlevel": 0,
                            "maxlevel": 0,
                            "disabled": false,
                            "Events": {
                                "Events": [{
                                        "name": "add-to-parcel-layer,is-address-layer-checked",
                                        "id": "trigger-if-address-checked",
                                        "about": "Do not need is-address-layer-checked if using add-to-parcel-layer handler",
                                        "mid": "app/commands/trigger",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "event",
                                                    "value": "address-layer-checked"
                                                },
                                                {
                                                    "id": "when-visible",
                                                    "about": "Forwards the address-layer-checked event only when this addresses layer is visible",
                                                    "value": "true"
                                                }]
                                        }
                                    },
                                    {
                                        "name": "add-to-parcel-layer",
                                        "id": "trigger-if-address-not-checked",
                                        "about": "Do not need is-address-layer-checked if using add-to-parcel-layer handler",
                                        "mid": "app/commands/trigger",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "event",
                                                    "value": "address-join-results-ready"
                                                },
                                                {
                                                    "id": "when-visible",
                                                    "about": "If the addresses layer is not checked then forward address-join-results-ready (with no results) to allow listeners to continue working",
                                                    "value": "false"
                                                }]
                                        }
                                    },
                                    {
                                        "name": "layer-visible",
                                        "id": "clear-features-on-hide",
                                        "about": "Clear all the parcel features when unchecked",
                                        "mid": "app/commands/trigger",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "event",
                                                    "value": "clear-features-from-layer"
                                                },
                                                {
                                                    "id": "when-visible",
                                                    "about": "Only when the addresses layer is not visible should we clear the address features from the address-feature layer",
                                                    "value": "false"
                                                },
                                                {
                                                    "id": "layer-name",
                                                    "about": "Clears the features from the parcel-features layers",
                                                    "value": "address-features"
                                                }]
                                        }
                                    },
                                    {
                                        "name": "universal-search",
                                        "id": "ags-address-locator",
                                        "about": "Use the AGS find service to search for addresses",
                                        "mid": "app/commands/ags-geoquery-locator",
                                        "text": "Address Locator",
                                        "type": "find",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "event",
                                                    "about": "Signal the address results are ready and zoom to them",
                                                    "value": "address-result-raw,auto-zoom,report-search-status"
                                                },
                                                {
                                                    "id": "query-service",
                                                    "value": "<%= primary_mapserver_url %>/<%= address_layer_id %>&sr=4326"
                                                },
                                                {
                                                    "id": "symbology",
                                                    "about": "Directs the renderer to use the 'parcels' symbologies instead of the default (*) symbologies",
                                                    "value": "addresses"
                                                },
                                                {
                                                    "id": "key-template",
                                                    "value": "<%= layer_key_template %>"
                                                },
                                                {
                                                    "id": "layer-name",
                                                    "about": "merge features into the parcel-features layer",
                                                    "value": "address-features"
                                                },
                                                {
                                                    "id": "keywords",
                                                    "value": "address"
                                                },
                                                {
                                                    "id": "max-feature-count",
                                                    "value": "<%= max_feature_count %>"
                                                },
                                                {
                                                    "id": "type",
                                                    "value": "find"
                                                },
                                                {
                                                    "id": "message",
                                                    "value": "Address Search Completed"
                                                }]
                                        }
                                    },
                                    {
                                        "name": "attempt-address-reverse-geocode",
                                        "id": "attempt-address-reverse-geocode",
                                        "about": "If address layer visible then search for a address",
                                        "mid": "app/commands/trigger",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "event",
                                                    "about": "If address layer checked allow an attempt to geocode",
                                                    "value": "address-reverse-geoquery"
                                                },
                                                {
                                                    "id": "when-visible",
                                                    "about": "Only attempt an address-reverse-geoquery when this address layer is visible",
                                                    "value": "true"
                                                }]
                                        }
                                    },
                                    {
                                        "name": "attempt-address-reverse-geocode",
                                        "id": "do-not-attempt-address-reverse-geocode",
                                        "about": "If address layer visible then search for a address",
                                        "mid": "app/commands/trigger",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "event",
                                                    "about": "Report an empty result set",
                                                    "value": "address-result-ready"
                                                },
                                                {
                                                    "id": "when-visible",
                                                    "about": "When the addresses layer is not visible signal address-result-ready (no results) to prevent downstream handlers from blocking",
                                                    "value": "false"
                                                }]
                                        }
                                    }]
                            },
                            "Options": {
                                "Values": [{
                                        "id": "layerType",
                                        "value": "rest"
                                    },
                                    {
                                        "id": "showLayers",
                                        "about": "Addresses",
                                        "value": "<%= address_layer_id %>"
                                    },
                                    {
                                        "id": "visible",
                                        "value": "true"
                                    }]
                            },
                            "text": "Addresses",
                            "url": "<%= primary_mapserver_url %>",
                            "type": "app/layer-factory/arcgis-tile"
                        },
                        {
                            "id": "parcel-features",
                            "basemap": false,
                            "minlevel": 0,
                            "maxlevel": 0,
                            "disabled": false,
                            "Commands": {
                                "Commands": [{
                                        "id": "get-associated-addresses",
                                        "about": "Triggers request to get addresses that reside within this parcel",
                                        "mid": "app/commands/trigger",
                                        "type": "infoviewer-extension",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "event",
                                                    "about": "Invokes the handler which queries for addresses within this parcel only if the address layer is checked",
                                                    "value": "is-address-layer-checked"
                                                }]
                                        }
                                    }]
                            },
                            "Events": {
                                "Events": [{
                                        "name": "address-join-results-ready",
                                        "id": "render-address-to-infoviewer",
                                        "about": "Add the address information into the infoviewer (used the 'type' to identify this as a special infoviewer-extension event)",
                                        "mid": "app/commands/trigger",
                                        "type": "infoviewer-extension",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "field-list",
                                                    "about": "Address fields to render in the parcel info viewer",
                                                    "value": "locationLine1,locationLine2"
                                                },
                                                {
                                                    "id": "primary-field",
                                                    "value": "locationLine1,locationLine2"
                                                },
                                                {
                                                    "id": "show-labels",
                                                    "value": "false"
                                                },
                                                {
                                                    "id": "template",
                                                    "value": "app/templates/parcel-address-template"
                                                },
                                                {
                                                    "id": "event",
                                                    "value": "render-address-to-infoviewer"
                                                }]
                                        }
                                    },
                                    {
                                        "name": "address-layer-checked",
                                        "id": "get-associated-addresses",
                                        "about": "Runs a join query unless the address layer is unchecked",
                                        "mid": "app/commands/ags-geoquery-locator",
                                        "type": "join",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "query-service",
                                                    "value": "<%= primary_mapserver_url %>"
                                                },
                                                {
                                                    "id": "layers",
                                                    "value": "<%= address_layer_id %>"
                                                },
                                                {
                                                    "id": "debug",
                                                    "value": "false"
                                                },
                                                {
                                                    "id": "type",
                                                    "value": "spatial"
                                                },
                                                {
                                                    "id": "event",
                                                    "about": "notify raw results are ready to be transformed before being rendered as detail data within the parcel popup",
                                                    "value": "address-join-results-raw"
                                                },
                                                {
                                                    "id": "key-template",
                                                    "value": "<%= layer_key_template %>"
                                                },
                                                {
                                                    "id": "returnGeometry",
                                                    "value": "true"
                                                },
                                                {
                                                    "id": "keywords",
                                                    "value": "parcel"
                                                }]
                                        }
                                    },
                                    {
                                        "name": "layer-addfeature",
                                        "id": "add-parcel-feature",
                                        "about": "Opens the popup after adding features to this layer",
                                        "mid": "app/commands/synthetic-add-features",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "event",
                                                    "about": "open info viewer for added features",
                                                    "value": "show-info"
                                                }]
                                        }
                                    }]
                            },
                            "Options": {
                                "Values": [{
                                        "id": "layerType",
                                        "value": "cluster"
                                    },
                                    {
                                        "id": "cluster-symbology",
                                        "value": "addresses"
                                    },
                                    {
                                        "id": "field-list",
                                        "value": "<%= secondary_parcel_fields %>",
                                        "about": "List the fields in the order you'd like them to appear in the infoViewer"
                                    },
                                    {
                                        "id": "cluster-distance",
                                        "value": "10"
                                    },
                                    {
                                        "id": "show-labels",
                                        "value": "false",
                                        "about": "False to show the field-list values but not the field names"
                                    },
                                    {
                                        "id": "symbology",
                                        "value": "parcels",
                                        "about": "Identifies the symbology rule to apply to these features"
                                    }]
                            },
                            "text": "Parcels Features",
                            "type": "app/layer-factory/configuration-features"
                        },
                        {
                            "id": "address-features",
                            "basemap": false,
                            "minlevel": 0,
                            "maxlevel": 0,
                            "disabled": false,
                            "Commands": {
                                "Commands": []
                            },
                            "Events": {
                                "Events": [{
                                        "name": "layer-addfeature",
                                        "id": "add-address-feature",
                                        "about": "Opens the popup after adding features to this layer",
                                        "mid": "app/commands/synthetic-add-features",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "event",
                                                    "about": "open info viewer for added features",
                                                    "value": "show-info"
                                                }]
                                        }
                                    }]
                            },
                            "Options": {
                                "Values": [{
                                        "id": "symbology",
                                        "value": "addresses",
                                        "about": "Identifies the symbology rule to apply to these features"
                                    },
                                    {
                                        "id": "show-labels",
                                        "value": "false",
                                        "about": "False to show the field-list values but not the field names"
                                    },
                                    {
                                        "id": "field-list",
                                        "value": "<%= secondary_address_fields %>",
                                        "about": "List the fields in the order you'd like them to appear in the infoViewer"
                                    },
                                    {
                                        "id": "layerType",
                                        "value": "cluster"
                                    },
                                    {
                                        "id": "cluster-distance",
                                        "value": "40"
                                    },
                                    {
                                        "id": "cluster-symbology",
                                        "value": "addresses"
                                    }]
                            },
                            "text": "Address Features",
                            "type": "app/layer-factory/configuration-features"
                        },
                        {
                            "id": "points",
                            "basemap": false,
                            "minlevel": 0,
                            "maxlevel": 0,
                            "disabled": false,
                            "Events": {
                                "Events": [{
                                        "name": "layer-addfeature",
                                        "id": "add-point-feature",
                                        "about": "Opens the popup after adding features to this layer",
                                        "mid": "app/commands/synthetic-add-features",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "event",
                                                    "about": "open info viewer for added features",
                                                    "value": "show-info"
                                                }]
                                        }
                                    }]
                            },
                            "Options": {
                                "Values": [{
                                        "id": "symbology",
                                        "about": "Use this symbology rule when rendering features on this layer",
                                        "value": "points"
                                    },
                                    {
                                        "id": "field-list",
                                        "about": "Display these field values",
                                        "value": "lon,lat"
                                    },
                                    {
                                        "id": "show-labels",
                                        "about": "Render labels as well as field values",
                                        "value": "true"
                                    },
                                    {
                                        "id": "field-labels",
                                        "about": "Labels to use to identify the fields in the field-list",
                                        "value": "↔,↕"
                                    }]
                            },
                            "text": "Point Features",
                            "type": "app/layer-factory/configuration-features",
                            "Commands": {
                                "Commands": [{
                                        "id": "get-zone-info",
                                        "about": "Immediately executes a query and provides results back to the info viewer",
                                        "mid": "app/commands/ags-geoquery-locator",
                                        "text": "Zone query",
                                        "type": "query",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "query-service",
                                                    "value": "<%= primary_featureserver_url %>"
                                                },
                                                {
                                                    "id": "filter",
                                                    "value": "<%= green_zone_filter %> OR <%= red_zone_filter %>"
                                                },
                                                {
                                                    "id": "layers",
                                                    "value": "<%= zone_layer_id %>"
                                                },
                                                {
                                                    "id": "debug",
                                                    "value": "false"
                                                },
                                                {
                                                    "id": "map",
                                                    "value": "false"
                                                },
                                                {
                                                    "id": "event",
                                                    "value": "zone-results"
                                                },
                                                {
                                                    "id": "returnGeometry",
                                                    "value": "false"
                                                },
                                                {
                                                    "id": "field-list",
                                                    "about": "Identify the field(s) used to distinguish a red zone from a green zone",
                                                    "value": "<%= primary_zone_field %>"
                                                },
                                                {
                                                    "id": "field-labels",
                                                    "value": "Zone"
                                                },
                                                {
                                                    "id": "show-labels",
                                                    "value": "true"
                                                },
                                                {
                                                    "id": "type",
                                                    "value": "query"
                                                }]
                                        }
                                    }]
                            }
                        },
                        {
                            "Commands": {
                                "Commands": [{
                                        "id": "more-info",
                                        "about": "Adds a 'more info' button to the info viewer popup",
                                        "mid": "app/commands/trigger",
                                        "text": "View Details",
                                        "type": "action",
                                        "disabled": false,
                                        "Options": {
                                            "Values": [{
                                                    "id": "event",
                                                    "about": "Event which fires when clicked",
                                                    "value": "civics:show-details"
                                                },
                                                {
                                                    "id": "css-name",
                                                    "about": "css class name to apply to this button",
                                                    "value": "btn btn-secondary"
                                                }]
                                        }
                                    }]
                            },
                            "Options": {
                                "Values": [{
                                        "id": "field-list",
                                        "about": "List the fields in the order you'd like them to appear in the infoViewer",
                                        "value": "id"
                                    },
                                    {
                                        "id": "anchorYValue",
                                        "about": "The vertical offset of the markers associated with this layer, a 1 will shift the marker up so the bottom edge touches the point-feature; use 0.5 to center.",
                                        "value": "1"
                                    },
                                    {
                                        "id": "show-labels",
                                        "about": "Inform infoviewer to not show field labels for these features (only applies if field-labels are defined)",
                                        "value": "false"
                                    },
                                    {
                                        "id": "layerType",
                                        "about": "Cluster the features",
                                        "value": "cluster"
                                    },
                                    {
                                        "id": "cluster-distance",
                                        "about": "Only cluster features within 20 pixels apart",
                                        "value": "20"
                                    }]
                            },
                            "id": "civics",
                            "text": "Search Results",
                            "type": "app/layer-factory/configuration-features",
                            "basemap": false,
                            "minlevel": 0,
                            "maxlevel": 0,
                            "disabled": false
                        },
                        {
                            "Layers": {
                                "Layers": [{
                                        "Options": {
                                            "Values": [{
                                                    "id": "layerType",
                                                    "value": "tile"
                                                },
                                                {
                                                    "id": "visible",
                                                    "value": "false"
                                                }]
                                        },
                                        "id": "ags-world-imagery",
                                        "text": "Esri World Imagery",
                                        "url": "http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer",
                                        "type": "app/layer-factory/arcgis-tile",
                                        "basemap": true,
                                        "minlevel": 0,
                                        "maxlevel": 0,
                                        "disabled": false
                                    },
                                    {
                                        "Options": {
                                            "Values": [{
                                                    "id": "layerType",
                                                    "value": "tile"
                                                },
                                                {
                                                    "id": "visible",
                                                    "value": "false"
                                                }]
                                        },
                                        "id": "ags-world-street-map",
                                        "text": "Esri World Street Map",
                                        "url": "http://services.arcgisonline.com/arcgis/rest/services/World_Street_Map/MapServer",
                                        "type": "app/layer-factory/arcgis-tile",
                                        "basemap": true,
                                        "minlevel": 0,
                                        "maxlevel": 0,
                                        "disabled": false
                                    },
                                    {
                                        "Options": {
                                            "Values": [{
                                                    "id": "layerType",
                                                    "value": "tile"
                                                },
                                                {
                                                    "id": "visible",
                                                    "value": "true"
                                                }]
                                        },
                                        "id": "ags-world-terrain",
                                        "text": "Esri Topo Map",
                                        "url": "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer",
                                        "type": "app/layer-factory/arcgis-tile",
                                        "basemap": true,
                                        "minlevel": 0,
                                        "maxlevel": 0,
                                        "disabled": false
                                    },
                                    {
                                        "Options": {
                                            "Values": [{
                                                    "id": "layerType",
                                                    "value": "osm"
                                                },
                                                {
                                                    "id": "layerStyle",
                                                    "value": "osm"
                                                },
                                                {
                                                    "id": "visible",
                                                    "value": "false"
                                                }]
                                        },
                                        "id": "mapquest-osm",
                                        "text": "Map Quest",
                                        "type": "app/layer-factory/native",
                                        "basemap": true,
                                        "minlevel": 10,
                                        "maxlevel": 20,
                                        "disabled": false
                                    }]
                            },
                            "id": "basemap-layer-group",
                            "text": "Basemaps",
                            "type": "app/layer-factory/group",
                            "basemap": true,
                            "minlevel": 0,
                            "maxlevel": 0,
                            "disabled": false
                        }]
                },
                "Options": {
                    "Values": [{
                            "id": "default-controls",
                            "about": "See http://openlayers.org/en/latest/apidoc/ol.control.html#.defaults",
                            "value": "{\r\n    \"attribution\": false,\r\n    \"rotate\": false,\r\n    \"zoom\": false\r\n}"
                        },
                        {
                            "id": "default-interactions",
                            "about": "See http://openlayers.org/en/latest/apidoc/ol.interaction.html#.defaults",
                            "value": "{\r\n    \"altShiftDragRotate\": true,\r\n    \"doubleClickZoom\": true,\r\n    \"keyboard\": true,\r\n    \"mouseWheelZoom\": true,\r\n    \"shiftDragZoom\": true,\r\n    \"dragPan\": true,\r\n    \"pinchRotate\": false,\r\n    \"pinchZoom\": true,\r\n    \"zoomDuration\": 500\r\n}"
                        },
                        {
                            "id": "enable-rotation",
                            "about": "Allows user to rotate the map",
                            "value": "true"
                        },
                        {
                            "id": "resize-sensor",
                            "about": "detect when the container changes size",
                            "value": "true"
                        },
                        {
                            "id": "init-zoom",
                            "about": "Zoom into to about 10 block radius",
                            "value": "17"
                        },
                        {
                            "id": "extent",
                            "about": "Las Vegas and surrounding area",
                            "value": "-115.435,36.000, -114.938, 36.342"
                        },
                        {
                            "id": "init-center",
                            "about": "Somewhere in Las Vegas",
                            "value": "-115.2322,36.1822"
                        },
                        {
                            "id": "max-zoom",
                            "about": "To be moved to VIEWPORT",
                            "value": "19"
                        },
                        {
                            "id": "min-zoom",
                            "about": "To be moved to VIEWPORT",
                            "value": "10"
                        }]
                }
            },
            "id": "rhythm-civics-wizard",
            "parentId": "rhythm-civics-address-parcel-selector-mixin,rhythm-civics-submit-record,rhythm-civics-wizard-mixin",
            "Commands": {
                "Commands": [{
                        "id": "liferay-interpreter",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "forward",
                                    "about": "events to forward to liferay",
                                    "value": "civics:zone-validation,civics:map-click-results,flash-buffer"
                                },
                                {
                                    "id": "channel-name",
                                    "value": "civics-channel",
                                    "about": "Radio channel to communicate with"
                                },
                                {
                                    "id": "liferay-echo-prefix",
                                    "value": "liferay",
                                    "about": "Prefix messages with this text"
                                },
                                {
                                    "id": "debug",
                                    "value": "false",
                                    "about": "True to hit a breakpoint each time this event fires"
                                },
                                {
                                    "id": "snapshot",
                                    "about": "take a snapshot of the feature(s)",
                                    "value": "true"
                                },
                                {
                                    "id": "stub",
                                    "about": "Creates a stub listener (liferay will not get events)",
                                    "value": "false"
                                },
                                {
                                    "id": "trace",
                                    "about": "write to console",
                                    "value": "false"
                                }]
                        },
                        "about": "Listens for mediator events, re-interprets the arguments and triggers a new event on the civics channel",
                        "mid": "app/commands/liferay-interpreter",
                        "type": "startup"
                    },
                    {
                        "id": "reverse-locator",
                        "about": "detect when map is clicked",
                        "mid": "app/commands/feature-selection-tool",
                        "type": "startup",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "type",
                                    "about": "User can click the map to query feature info (set value to point+box for multi-select)",
                                    "value": "point"
                                },
                                {
                                    "id": "event",
                                    "about": "Identifies the desired EVENT handler",
                                    "value": "map-or-feature-click"
                                },
                                {
                                    "id": "buffer-size",
                                    "about": "Make the buffer area large enough to easily select point features",
                                    "value": "16"
                                },
                                {
                                    "id": "condition",
                                    "about": "shift, ctrl, alt must not be pressed",
                                    "value": "none"
                                },
                                {
                                    "id": "max-feature-count",
                                    "about": "only consider the first feature",
                                    "value": "<%= max_feature_count %>"
                                },
                                {
                                    "id": "exclude-layer",
                                    "value": "green-zone"
                                }]
                        }
                    },
                    {
                        "id": "get-info-tool",
                        "about": "Allow user to click a feature to display information about that feature; this is failing because the map is not loaded by the time this runs so moving it into a toolbar control",
                        "mid": "app/commands/feature-selection-tool",
                        "text": "Get Info",
                        "type": "startup",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "type",
                                    "about": "User can click the map to query feature info (set value to point+box for multi-select)",
                                    "value": "point"
                                },
                                {
                                    "id": "event",
                                    "about": "Identifies the desired EVENT handler",
                                    "value": "show-info"
                                },
                                {
                                    "id": "buffer-size",
                                    "about": "Make the buffer area large enough to easily select point features",
                                    "value": "16"
                                },
                                {
                                    "id": "condition",
                                    "value": "none"
                                },
                                {
                                    "id": "exclude-layer",
                                    "value": "green-zone"
                                }]
                        }
                    },
                    {
                        "id": "add-projection",
                        "about": "defines available proj4 projections",
                        "mid": "app/commands/add-projection",
                        "type": "startup",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "EPSG:102707",
                                    "value": "+proj=tmerc +lat_0=34.75 +lon_0=-115.5833333333333 +k=0.9999 +x_0=200000 +y_0=7999999.999999999 +datum=NAD83 +units=us-ft +no_defs"
                                },
                                {
                                    "id": "EPSG:3421",
                                    "value": "+proj=tmerc +lat_0=34.75 +lon_0=-115.5833333333333 +k=0.9999 +x_0=200000.00001016 +y_0=8000000.000010163 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs"
                                },
                                {
                                    "id": "EPSG:4269",
                                    "value": "+proj=longlat +ellps=GRS80 +datum=NAD83 +no_defs"
                                },
                                {
                                    "id": "EPSG:102113",
                                    "value": "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"
                                },
                                {
                                    "id": "EPSG:3857",
                                    "value": "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"
                                },
                                {
                                    "id": "EPSG:26729",
                                    "value": "+proj=tmerc +lat_0=30.5 +lon_0=-85.83333333333333 +k=0.99996 +x_0=152400.3048006096 +y_0=0 +datum=NAD27 +units=us-ft +no_defs"
                                },
                                {
                                    "id": "EPSG:102726",
                                    "value": "+proj=lcc +lat_1=44.33333333333334 +lat_2=46 +lat_0=43.66666666666666 +lon_0=-120.5 +x_0=2500000 +y_0=0 +ellps=GRS80 +datum=NAD83 +to_meter=0.3048006096012192 +no_defs"
                                },
                                {
                                    "id": "EPSG:102100",
                                    "value": "+proj=merc +a=6378137 +b=6378137 +lat_ts=0.0 +lon_0=0.0 +x_0=0.0 +y_0=0 +k=1.0 +units=m +nadgrids=@null +wktext  +no_defs"
                                },
                                {
                                    "id": "EPSG:2193",
                                    "value": "+proj=tmerc +lat_0=0 +lon_0=173 +k=0.9996 +x_0=1600000 +y_0=10000000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
                                }]
                        }
                    },
                    {
                        "id": "feature-collection-handler",
                        "about": "watches the feature collection and keeps it in sync with a vector layer",
                        "mid": "app/commands/feature-collection-handler",
                        "type": "startup",
                        "disabled": false
                    }]
            },
            "about": "Allows user to click the map to find parcels and associated addresses.  If no parcel is found then an address search is attempted.  It will only search if the associated layer is visible.",
            "text": "test mixin",
            "Events": {
                "Events": [{
                        "name": "address-result-raw",
                        "id": "address-attribute-mapper",
                        "about": "Modify the raw address data by adding locationLine1 and locationLine2 to the feature models",
                        "mid": "app/commands/view-model",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "in",
                                    "about": "These are localization references which each map into the \"out\" fields.  Both lines can contain multiple fields.",
                                    "value": "<%= address_location_line_1 %>, <%= address_location_line_2 %>"
                                },
                                {
                                    "id": "out",
                                    "about": "These are the attributes that are added to the feature model",
                                    "value": "locationLine1, locationLine2"
                                },
                                {
                                    "id": "event",
                                    "about": "The address model is now ready to be consumed because it now has the desired attributes",
                                    "value": "address-result-ready"
                                }]
                        }
                    },
                    {
                        "name": "address-join-results-raw",
                        "id": "address-join-attribute-mapper",
                        "about": "Modify the raw detail address data by adding locationLine1 and locationLine2 to the feature models",
                        "mid": "app/commands/view-model",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "in",
                                    "about": "These are localization references which each map into the \"out\" fields.  Both lines can contain multiple fields.",
                                    "value": "<%= address_location_line_1 %>, <%= address_location_line_2 %>"
                                },
                                {
                                    "id": "out",
                                    "about": "These are the attributes that are added to the feature model",
                                    "value": "locationLine1, locationLine2"
                                },
                                {
                                    "id": "event",
                                    "about": "Notify that the addresses associated with the parcel are ready; it now has the desired attributes.",
                                    "value": "address-join-results-ready"
                                }]
                        }
                    },
                    {
                        "name": "liferay:universal-search",
                        "id": "universal-search-interpreter",
                        "about": "redirects a liferay 'universal-search' event to a native 'universal-search' event allowing liferay to invoke map searches",
                        "mid": "app/commands/trigger",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "event",
                                    "value": "universal-search"
                                }]
                        }
                    },
                    {
                        "id": "feature-is-not-click-validator",
                        "about": "Overridden to attempt a parcel geocode when no feature has been clicked",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "event",
                                    "about": "No feature clicked, clear existing features, attempt parcel reverse-geocode if parcel layer is visible",
                                    "value": "clear-features-from-layer,attempt-parcel-reverse-geocode"
                                },
                                {
                                    "id": "max-result-count",
                                    "about": "We don't want any zones!",
                                    "value": "0"
                                },
                                {
                                    "id": "trigger-invalid",
                                    "about": "Do not trigger if there is at least one feature",
                                    "value": "false"
                                },
                                {
                                    "id": "debug",
                                    "value": "false"
                                }]
                        },
                        "name": "map-or-feature-click",
                        "mid": "app/commands/validator",
                        "type": "action"
                    },
                    {
                        "id": "ags-address-locator",
                        "about": "Overridden to disable, should only happen when address layer is visible",
                        "disabled": true,
                        "name": "universal-search",
                        "mid": "app/commands/ags-geoquery-locator",
                        "text": "Address Locator",
                        "type": "find",
                        "Options": {
                            "Values": [{
                                    "id": "query-service",
                                    "value": "<%= primary_mapserver_url %>/<%= address_layer_id %>&sr=4326"
                                },
                                {
                                    "id": "key-template",
                                    "value": "<%= layer_key_template %>"
                                },
                                {
                                    "id": "keywords",
                                    "value": "address"
                                },
                                {
                                    "id": "event",
                                    "about": "Once the results are gathered forward them to the 'geoquery-result' handler",
                                    "value": "auto-zoom,report-search-status"
                                },
                                {
                                    "id": "max-feature-count",
                                    "value": "<%= max_feature_count %>"
                                },
                                {
                                    "id": "type",
                                    "value": "find"
                                },
                                {
                                    "id": "message",
                                    "value": "Address Search Completed"
                                }]
                        }
                    },
                    {
                        "id": "ags-parcel-locator",
                        "about": "Overridden to disable, only perform when the parcel layer is checked so moved to that layer",
                        "disabled": true,
                        "name": "universal-search",
                        "mid": "app/commands/ags-geoquery-locator",
                        "text": "Parcel Locator",
                        "type": "find",
                        "Options": {
                            "Values": [{
                                    "id": "query-service",
                                    "value": "<%= primary_mapserver_url %>/<%= parcel_layer_id %>&sr=4326"
                                },
                                {
                                    "id": "key-template",
                                    "value": "<%= layer_key_template %>"
                                },
                                {
                                    "id": "keywords",
                                    "value": "parcel"
                                },
                                {
                                    "id": "event",
                                    "about": "Once the results are gathered forward them to the 'geoquery-result' handler",
                                    "value": "auto-zoom,report-search-status"
                                },
                                {
                                    "id": "max-feature-count",
                                    "value": "<%= max_feature_count %>"
                                },
                                {
                                    "id": "type",
                                    "value": "find"
                                },
                                {
                                    "id": "message",
                                    "value": "Parcel Search Completed"
                                },
                                {
                                    "id": "symbology",
                                    "about": "Directs the renderer to use the 'parcels' symbologies instead of the default (*) symbologies",
                                    "value": "parcels"
                                },
                                {
                                    "id": "zoommap",
                                    "value": "true"
                                },
                                {
                                    "id": "layer-name",
                                    "about": "merge features into the parcel-features layer",
                                    "value": "parcel-features"
                                }]
                        }
                    },
                    {
                        "name": "address-reverse-geoquery",
                        "id": "ags-address-reverse-locator",
                        "about": "Override to only respond to address-reverse-geoquery",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "event",
                                    "about": "once the addresses are found notify the handler that will transform the attribute data",
                                    "value": "address-result-raw"
                                },
                                {
                                    "id": "buffer-size",
                                    "value": "16"
                                },
                                {
                                    "id": "debug",
                                    "value": "false"
                                },
                                {
                                    "id": "query-service",
                                    "value": "<%= primary_mapserver_url %>"
                                },
                                {
                                    "id": "key-template",
                                    "value": "<%= layer_key_template %>"
                                },
                                {
                                    "id": "layers",
                                    "value": "<%= address_layer_id %>"
                                },
                                {
                                    "id": "type",
                                    "value": "spatial"
                                }]
                        },
                        "mid": "app/commands/ags-geoquery-locator",
                        "type": "spatial"
                    },
                    {
                        "name": "parcel-reverse-geoquery",
                        "id": "ags-parcel-reverse-locator",
                        "about": "Override to only respond to parcel-reverse-geoquery",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "event",
                                    "about": "once the parcels are found notify that parcel results are ready",
                                    "value": "parcel-result-ready"
                                },
                                {
                                    "id": "buffer-size",
                                    "value": "1"
                                },
                                {
                                    "id": "query-service",
                                    "value": "<%= primary_mapserver_url %>"
                                },
                                {
                                    "id": "symbology",
                                    "value": "parcels"
                                },
                                {
                                    "id": "layers",
                                    "value": "<%= parcel_layer_id %>"
                                },
                                {
                                    "id": "key-template",
                                    "value": "<%= layer_key_template %>"
                                },
                                {
                                    "id": "type",
                                    "value": "spatial"
                                }]
                        },
                        "mid": "app/commands/ags-geoquery-locator",
                        "text": "Parcel Locator",
                        "type": "spatial"
                    },
                    {
                        "name": "address-result-ready",
                        "id": "address-found",
                        "about": "If address found add it to the address layer",
                        "mid": "app/commands/validator",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "event",
                                    "about": "No feature clicked, clear existing features, perform reverse geocoding, show the click location",
                                    "value": "add-to-address-layer"
                                },
                                {
                                    "id": "min-result-count",
                                    "about": "We don't want any zones!",
                                    "value": "1"
                                },
                                {
                                    "id": "trigger-invalid",
                                    "about": "Do not trigger if there is at least one feature",
                                    "value": "false"
                                },
                                {
                                    "id": "debug",
                                    "value": "false"
                                },
                                {
                                    "id": "max-result-count",
                                    "about": "Do not perform max test",
                                    "value": ""
                                }]
                        }
                    },
                    {
                        "name": "address-result-ready",
                        "id": "address-not-found",
                        "about": "If address not found render the click location",
                        "mid": "app/commands/validator",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "event",
                                    "about": "No feature clicked, clear existing features, perform reverse geocoding, show the click location",
                                    "value": "show-coordinates"
                                },
                                {
                                    "id": "max-result-count",
                                    "about": "No address found so show click location",
                                    "value": "0"
                                },
                                {
                                    "id": "trigger-invalid",
                                    "about": "Do not trigger if there is at least one feature",
                                    "value": "false"
                                },
                                {
                                    "id": "debug",
                                    "value": "false"
                                },
                                {
                                    "id": "min-result-count",
                                    "about": "No results",
                                    "value": "0"
                                },
                                {
                                    "id": "trace",
                                    "value": "true"
                                }]
                        }
                    },
                    {
                        "name": "parcel-result-ready",
                        "id": "parcel-found",
                        "about": "If parcel found add it to the parcel layer",
                        "mid": "app/commands/validator",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "event",
                                    "about": "No feature clicked, clear existing features, perform reverse geocoding, show the click location",
                                    "value": "add-to-parcel-layer"
                                },
                                {
                                    "id": "min-result-count",
                                    "about": "We don't want any zones!",
                                    "value": "1"
                                },
                                {
                                    "id": "trigger-invalid",
                                    "about": "Do not trigger if there is at least one feature",
                                    "value": "false"
                                },
                                {
                                    "id": "debug",
                                    "value": "false"
                                },
                                {
                                    "id": "max-result-count",
                                    "about": "Do not perform max test",
                                    "value": ""
                                }]
                        }
                    },
                    {
                        "name": "parcel-result-ready",
                        "id": "parcel-not-found",
                        "about": "If parcel not found attempt an address reverse-geocode",
                        "mid": "app/commands/validator",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "event",
                                    "about": "No parcel was found so search for an address if the address layer is checked",
                                    "value": "attempt-address-reverse-geocode"
                                },
                                {
                                    "id": "max-result-count",
                                    "about": "No parcel found okay to attempt address search",
                                    "value": "0"
                                },
                                {
                                    "id": "trigger-invalid",
                                    "about": "Do not trigger if there is at least one feature",
                                    "value": "false"
                                },
                                {
                                    "id": "debug",
                                    "value": "false"
                                },
                                {
                                    "id": "min-result-count",
                                    "about": "No results found",
                                    "value": "0"
                                }]
                        }
                    },
                    {
                        "name": "show-click-location",
                        "id": "forward-show-click-location",
                        "mid": "app/commands/trigger",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "event",
                                    "value": "civics:map-click-results"
                                },
                                {
                                    "id": "trace",
                                    "value": "true"
                                }]
                        }
                    },
                    {
                        "id": "reverse-geoquery-multiplexer",
                        "disabled": true,
                        "name": "reverse-geoquery",
                        "about": "Each time reverse-geoquery initiates wait until both the address and parcel search returns before raising show-coordinates",
                        "mid": "app/commands/multiplexer",
                        "Options": {
                            "Values": [{
                                    "id": "once",
                                    "about": "Only do this once per \"use-this-parcel\" event",
                                    "value": "true"
                                },
                                {
                                    "id": "in",
                                    "value": "add-to-address-layer,add-to-parcel-layer,associated-addresses,find-associated-addresses"
                                },
                                {
                                    "id": "out",
                                    "about": "civics:map-click-results is picked up by liferay-interpreter and given to civics, notify show-coordinates so it can render a location marker if no features are found",
                                    "value": "show-coordinates,civics:map-click-results"
                                }]
                        }
                    },
                    {
                        "name": "find-associated-addresses",
                        "id": "find-associated-addresses-handler",
                        "about": "Get addresses associated with a parcel",
                        "mid": "app/commands/ags-geoquery-locator",
                        "text": "",
                        "type": "join",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "query-service",
                                    "value": "<%= primary_mapserver_url %>"
                                },
                                {
                                    "id": "layers",
                                    "value": "<%= address_layer_id %>"
                                },
                                {
                                    "id": "type",
                                    "value": "spatial"
                                },
                                {
                                    "id": "event",
                                    "value": "associated-addresses"
                                },
                                {
                                    "id": "key-template",
                                    "value": "<%= layer_key_template %>"
                                }]
                        }
                    },
                    {
                        "name": "map-or-feature-click",
                        "id": "feature-is-click-validator",
                        "about": "If one or more features are clicked...",
                        "mid": "app/commands/validator",
                        "type": "action",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "event",
                                    "about": "Identifies the desired EVENT handler",
                                    "value": "show-feature-info"
                                },
                                {
                                    "id": "min-result-count",
                                    "about": "There is no constraint on the minimum result count because we don't want any zones",
                                    "value": "1"
                                },
                                {
                                    "id": "trigger-invalid",
                                    "about": "Do not trigger if there is not at least one feature",
                                    "value": "false"
                                }]
                        }
                    },
                    {
                        "name": "add-to-points-layer,liferay:add-to-points-layer",
                        "id": "add-to-points-layer-handler",
                        "about": "Adds a point to the points layer",
                        "mid": "app/commands/add-features-to-layer",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "layer-name",
                                    "value": "points"
                                },
                                {
                                    "id": "debug",
                                    "value": "false"
                                }]
                        }
                    },
                    {
                        "name": "show-coordinates",
                        "id": "show-coordinates-validator",
                        "about": "If no features are found create a feature from the coordinate and render it",
                        "mid": "app/commands/validator",
                        "type": "action",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "event",
                                    "about": "Create a point at the clicked location only when there are no features present",
                                    "value": "show-click-location"
                                },
                                {
                                    "id": "max-result-count",
                                    "about": "We don't want any zones!",
                                    "value": "0"
                                },
                                {
                                    "id": "trigger-invalid",
                                    "value": "false"
                                },
                                {
                                    "id": "show-coordinates",
                                    "value": "true"
                                }]
                        }
                    },
                    {
                        "name": "show-click-location",
                        "id": "show-click-location-handler",
                        "about": "Adds a feature to the map every time the user clicks on a non-feature (features are after every click so this has to happen last)",
                        "mid": "app/commands/create-point-feature",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "event",
                                    "about": "Renders the click location as a point on the points layer",
                                    "value": "add-to-points-layer"
                                },
                                {
                                    "id": "symbology",
                                    "value": "points"
                                },
                                {
                                    "id": "debug",
                                    "value": "false"
                                }]
                        }
                    },
                    {
                        "id": "show-info-handler",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "template",
                                    "about": "Default to the civics template which renders the label and the field values listed in the 'field-list'",
                                    "value": "app/templates/civics-infoviewer-template"
                                },
                                {
                                    "id": "use-svg",
                                    "value": "false"
                                }]
                        },
                        "name": "show-info",
                        "about": "Opens an infoviewer on the map",
                        "mid": "app/commands/popup-tool"
                    },
                    {
                        "name": "universal-search",
                        "id": "google-locator",
                        "about": "Listens for 'universal-search' and attempts to find an address or intersection via a google search",
                        "mid": "app/commands/google-geocoder",
                        "text": "Google Address Locator",
                        "type": "find",
                        "disabled": true,
                        "Options": {
                            "Values": [{
                                    "id": "region",
                                    "about": "limit search results to the United States (not working)",
                                    "value": "US"
                                },
                                {
                                    "id": "event",
                                    "about": "Once the results are gathered forward them to the 'geoquery-result' handler",
                                    "value": "geoquery-result"
                                },
                                {
                                    "id": "key-template",
                                    "value": "<%=place_id %>"
                                }]
                        }
                    },
                    {
                        "name": "map-click",
                        "id": "google-reverse-locator",
                        "about": "reverse-geocode on every map-click",
                        "mid": "app/commands/google-geocoder",
                        "disabled": true,
                        "Options": {
                            "Values": [{
                                    "id": "reverse",
                                    "about": "one of true,false,auto but in this case true will try to find an address when the map is clicked",
                                    "value": "true"
                                },
                                {
                                    "id": "google-result-type",
                                    "about": "valid values include street_address, neighborhood, political, postal_code, administrative_area_level_1, administrative_area_level_2",
                                    "value": "street_address"
                                },
                                {
                                    "id": "key-template",
                                    "about": "the place_id is a google feature identifier, use it as our feature key",
                                    "value": "<%=place_id %>"
                                },
                                {
                                    "id": "event",
                                    "about": "Place the marker on the map (the marker has a label so don't show the info viewer)",
                                    "value": "geoquery-result"
                                },
                                {
                                    "id": "condition",
                                    "about": "Only executes when the shift key is pressed",
                                    "value": "shift"
                                }]
                        }
                    },
                    {
                        "name": "universal-search",
                        "id": "ags-property-locator",
                        "about": "Use the AGS find service to search for properties",
                        "mid": "app/commands/ags-geoquery-locator",
                        "text": "Property Locator",
                        "type": "find",
                        "disabled": true,
                        "Options": {
                            "Values": [{
                                    "id": "query-service",
                                    "value": "<%= primary_mapserver_url %>/15&sr=4326"
                                },
                                {
                                    "id": "symbology",
                                    "about": "Directs the renderer to use the 'parcels' symbologies instead of the default (*) symbologies",
                                    "value": "properties"
                                },
                                {
                                    "id": "zoommap",
                                    "value": "true"
                                },
                                {
                                    "id": "key-template",
                                    "value": "<%= layer_key_template %>"
                                },
                                {
                                    "id": "event",
                                    "about": "Once the results are gathered forward them to the 'geoquery-result' handler",
                                    "value": "geoquery-result"
                                },
                                {
                                    "id": "type",
                                    "value": "find"
                                }]
                        }
                    },
                    {
                        "name": "show-in-map",
                        "id": "show-in-map-handler",
                        "about": "Add features on the map",
                        "mid": "app/commands/render-features",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "grid",
                                    "value": "false"
                                },
                                {
                                    "id": "map",
                                    "value": "true"
                                },
                                {
                                    "id": "preserve-extent",
                                    "value": "false"
                                }]
                        }
                    },
                    {
                        "name": "add-to-address-layer",
                        "id": "add-to-address-layer-handler",
                        "about": "Adds features on argument stack to the address-features layer",
                        "mid": "app/commands/add-features-to-layer",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "layer-name",
                                    "about": "Identifies the layer that will receive the features",
                                    "value": "address-features"
                                },
                                {
                                    "id": "symbology",
                                    "about": "Identify the default feature symbology",
                                    "value": "addresses"
                                }]
                        }
                    },
                    {
                        "name": "add-to-parcel-layer",
                        "id": "add-to-parcel-layer-handler",
                        "about": "Adds features on argument stack to the parcel-features layer",
                        "mid": "app/commands/add-features-to-layer",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "layer-name",
                                    "about": "Identifies the layer that will receive the features",
                                    "value": "parcel-features"
                                },
                                {
                                    "id": "symbology",
                                    "about": "Identify the default feature symbology",
                                    "value": "parcels"
                                }]
                        }
                    },
                    {
                        "name": "auto-zoom,liferay:auto-zoom",
                        "id": "auto-zoom-handler",
                        "about": "When invoked, changes the map extent to include the features on the event stack",
                        "mid": "app/commands/auto-zoom",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "panmap",
                                    "about": "Allow the map to pan",
                                    "value": "true"
                                },
                                {
                                    "id": "zoommap",
                                    "about": "Allow the map to zoom",
                                    "value": "true"
                                },
                                {
                                    "id": "preserve-extent",
                                    "about": "true => Prevent the current viewport to pan out of view",
                                    "value": "false"
                                }]
                        }
                    },
                    {
                        "name": "current-location",
                        "id": "current-location-handler",
                        "about": "pan to current location, chrome requires https",
                        "mid": "app/commands/geolocation-tool",
                        "type": "action",
                        "disabled": false
                    },
                    {
                        "name": "universal-search",
                        "id": "ips-address-locator",
                        "about": "Search addresses for universal search value",
                        "mid": "app/commands/ips-geoquery-locator",
                        "text": "Address Locator",
                        "type": "find",
                        "disabled": true,
                        "Options": {
                            "Values": [{
                                    "id": "query-service",
                                    "value": "property/addresses"
                                },
                                {
                                    "id": "service-query-template",
                                    "value": "{\r\n    \"formulaName\": \"FalseMapValidation\",\r\n    \"Data\": {\r\n        \"attributes\": {\r\n            \"PARCLKEY\": 10153454,\r\n            \"PARCLID\": \"00005-44454-4546\"\r\n        }\r\n    }\r\n}"
                                },
                                {
                                    "id": "symbology",
                                    "value": "addresses"
                                },
                                {
                                    "id": "event",
                                    "about": "Once the results are gathered forward them to the 'geoquery-result' handler",
                                    "value": "geoquery-result"
                                }]
                        }
                    },
                    {
                        "name": "universal-search",
                        "id": "ips-crm-servicerequest-locator",
                        "about": "Search service requests for universal search value",
                        "mid": "app/commands/ips-geoquery-locator",
                        "text": "Address Locator",
                        "type": "find",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "query-service",
                                    "value": "crm/ServiceRequests"
                                },
                                {
                                    "id": "service-query-template",
                                    "value": "{filter:{property:id,operator:Equals,value:\"<%- location %>\"}}"
                                },
                                {
                                    "id": "symbology",
                                    "value": "crm-servicerequest"
                                },
                                {
                                    "id": "event",
                                    "about": "Once the results are gathered forward them to the 'geoquery-result' handler",
                                    "value": "geoquery-result"
                                }]
                        }
                    },
                    {
                        "name": "show-info-handler-controller",
                        "id": "synthetic-click",
                        "about": "When paging occurs treat that as if the user clicked the associated feature",
                        "mid": "app/commands/infoviewer-paging-as-feature-click-event",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "event",
                                    "about": "highlight the feature each time the user pages",
                                    "value": "flash-buffer"
                                },
                                {
                                    "id": "debug",
                                    "value": "false"
                                }]
                        }
                    },
                    {
                        "name": "flash-buffer",
                        "id": "flash-buffer-handler",
                        "about": "Temporarily display geometry",
                        "mid": "app/commands/flash-feature",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "delay",
                                    "about": "wait one second before removing feature",
                                    "value": "0"
                                }]
                        }
                    },
                    {
                        "name": "liferay:map-trace-extent",
                        "id": "map-trace-extent-handler",
                        "about": "return map extent for filtering",
                        "mid": "app/commands/api/get-current-extent",
                        "disabled": false
                    },
                    {
                        "name": "command",
                        "id": "command-handler",
                        "about": "Allows commands to execute via trigger(\"command\", args), facilitates command interception",
                        "mid": "app/commands/command-handler",
                        "disabled": false
                    },
                    {
                        "name": "map-resolution",
                        "id": "map-event-handler",
                        "about": "logs the maps viewstate",
                        "mid": "app/commands/map-event-handler",
                        "disabled": true
                    },
                    {
                        "name": "feature-hover",
                        "id": "feature-hover-handler",
                        "about": "Highlight feature when cursor moves over it",
                        "mid": "app/commands/feature-highlight-handler",
                        "disabled": true,
                        "Options": {
                            "Values": [{
                                    "id": "symbology",
                                    "about": "Identify styling rules for features under the cursor",
                                    "value": "hover"
                                }]
                        }
                    },
                    {
                        "name": "show-in-grid",
                        "id": "show-in-grid-handler",
                        "about": "Add features to the grid",
                        "mid": "app/commands/render-features",
                        "disabled": true,
                        "Options": {
                            "Values": [{
                                    "id": "grid",
                                    "value": "true"
                                },
                                {
                                    "id": "map",
                                    "value": "false"
                                }]
                        }
                    },
                    {
                        "name": "show-layer",
                        "id": "show-layer-handler",
                        "about": "If layer is decorated with an extent then ensure that extent is visible when layer is made visible",
                        "mid": "app/commands/show-layer-handler",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "panmap",
                                    "value": "true"
                                },
                                {
                                    "id": "zoommap",
                                    "value": "true"
                                }]
                        }
                    },
                    {
                        "name": "geoquery-result",
                        "id": "geoquery-result-handler",
                        "mid": "app/commands/geoquery-result-handler",
                        "text": "Query Results",
                        "type": "geoquery-form",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "panmap",
                                    "about": "overrides auto-zoom configuration to ensure map pans",
                                    "value": "true"
                                },
                                {
                                    "id": "zoommap",
                                    "about": "overrides auto-zoom configuration to ensure map zooms",
                                    "value": "true"
                                },
                                {
                                    "id": "event",
                                    "about": "show the feature on the map and pan+zoom the feature(s) into view",
                                    "value": "show-in-map,auto-zoom"
                                }]
                        }
                    },
                    {
                        "name": "report-search-status",
                        "id": "report-search-status-handler",
                        "about": "Add \"growl\" handler to support notifying user when no results are found",
                        "mid": "app/commands/growl",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "remove-delay",
                                    "about": "Clear message after 5 seconds",
                                    "value": "5"
                                },
                                {
                                    "id": "className",
                                    "value": "ol-control top-4 left-3 growl"
                                }]
                        }
                    },
                    {
                        "name": "liferay:use-this-parcel",
                        "id": "parcel-selection-handler",
                        "about": "Once user selects a parcel broadcast events to run a zones query, zone validation query and parcel validation query",
                        "mid": "app/commands/trigger",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "event",
                                    "value": "in-red-zone,in-green-zone,in-zone"
                                },
                                {
                                    "id": "trace",
                                    "value": "true"
                                }]
                        }
                    },
                    {
                        "name": "in-zone",
                        "id": "in-zone-handler",
                        "about": "invoke a zone query for any zones that intersect the currently selected feature",
                        "mid": "app/commands/ags-geoquery-locator",
                        "type": "spatial",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "event",
                                    "value": "in-zone-handler"
                                },
                                {
                                    "id": "query-service",
                                    "value": "<%= primary_featureserver_url %>"
                                },
                                {
                                    "id": "layers",
                                    "about": "This is the 'areas' layer on the IPS drawings",
                                    "value": "<%= zone_layer_id %>"
                                },
                                {
                                    "id": "filter",
                                    "about": "get all zones",
                                    "value": "1=1"
                                },
                                {
                                    "id": "returnGeometry",
                                    "value": "false"
                                },
                                {
                                    "id": "type",
                                    "value": "spatial"
                                }]
                        }
                    },
                    {
                        "name": "in-red-zone",
                        "id": "in-red-zone-handler",
                        "about": "invoke a zone query for the total count of zones that intersect the currently selected feature",
                        "mid": "app/commands/ags-geoquery-locator",
                        "type": "spatial",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "event",
                                    "value": "red-zone-count"
                                },
                                {
                                    "id": "query-service",
                                    "value": "<%= primary_featureserver_url %>"
                                },
                                {
                                    "id": "layers",
                                    "about": "This is the 'areas' layer on the IPS drawings",
                                    "value": "<%= zone_layer_id %>"
                                },
                                {
                                    "id": "filter",
                                    "about": "Just an example of filtering out valid zones, here only 'RED' zones are counted",
                                    "value": "<%= red_zone_filter %>"
                                },
                                {
                                    "id": "returnCountOnly",
                                    "value": "true"
                                },
                                {
                                    "id": "type",
                                    "value": "spatial"
                                }]
                        }
                    },
                    {
                        "name": "in-green-zone",
                        "id": "in-green-zone-handler",
                        "about": "invoke a zone query for the total count of zones that intersect the currently selected feature",
                        "mid": "app/commands/ags-geoquery-locator",
                        "type": "spatial",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "event",
                                    "value": "green-zone-count"
                                },
                                {
                                    "id": "query-service",
                                    "value": "<%= primary_featureserver_url %>"
                                },
                                {
                                    "id": "layers",
                                    "about": "This is the 'areas' layer on the IPS drawings",
                                    "value": "<%= zone_layer_id %>"
                                },
                                {
                                    "id": "filter",
                                    "about": "Just an example of filtering out valid zones, here only 'GREEN' zones are counted",
                                    "value": "<%= green_zone_filter %>"
                                },
                                {
                                    "id": "returnCountOnly",
                                    "value": "true"
                                },
                                {
                                    "id": "type",
                                    "value": "spatial"
                                }]
                        }
                    },
                    {
                        "name": "red-zone-count",
                        "id": "red-zone-valid",
                        "about": "Validates the zone-count-handler results, if the count=0 then valid",
                        "mid": "app/commands/validator",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "max-result-count",
                                    "about": "We do not want any zones!",
                                    "value": "0"
                                }]
                        }
                    },
                    {
                        "name": "green-zone-count",
                        "id": "green-zone-valid",
                        "about": "Validates the zone-count-handler results, if the count>1 then valid",
                        "mid": "app/commands/validator",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "min-result-count",
                                    "about": "must be in the green zone",
                                    "value": "1"
                                }]
                        }
                    },
                    {
                        "name": "liferay:use-this-parcel,civics:show-details,liferay:which-zone",
                        "id": "parcel-validation-multiplexer",
                        "about": "Report the current feature, validation results and intersecting zones back to civics",
                        "mid": "app/commands/multiplexer",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "once",
                                    "about": "Only do this once per \"use-this-parcel\" event",
                                    "value": "true"
                                },
                                {
                                    "id": "in",
                                    "value": "in-zone-handler,red-zone-valid,green-zone-valid"
                                },
                                {
                                    "id": "out",
                                    "value": "civics:zone-validation"
                                },
                                {
                                    "id": "trace",
                                    "value": "true"
                                },
                                {
                                    "id": "debug",
                                    "value": "true"
                                }]
                        }
                    },
                    {
                        "name": "civics:zone-validation",
                        "id": "parcel-zone-package-handler",
                        "about": "Prepare the results before sending to civics",
                        "mid": "app/commands/trigger",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "trace",
                                    "value": "true"
                                }]
                        }
                    }]
            },
            "Controls": {
                "Controls": [{
                        "Events": {
                            "Events": [{
                                    "name": "change",
                                    "id": "change-handler",
                                    "about": "When the input changes trigger a universal search event",
                                    "mid": "app/commands/trigger",
                                    "disabled": false,
                                    "Options": {
                                        "Values": [{
                                                "id": "event",
                                                "about": "When the input changes trigger a universal search",
                                                "value": "clear-features-from-layer,universal-search"
                                            }]
                                    }
                                }]
                        },
                        "id": "universal-search-input",
                        "about": "Creates an 'input' control on the map",
                        "mid": "app/controls/ol3-control",
                        "text": "🔍",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "className",
                                    "about": "Position the input in the top-left corner, configure the control to keep the expander to the left (via 'right')",
                                    "value": "ol-control top-2 left-2 ol-input right"
                                },
                                {
                                    "id": "control-type",
                                    "about": "identify the ol3 constructor/class",
                                    "value": "Input"
                                },
                                {
                                    "id": "valueName",
                                    "about": "output 'location' instead of 'value'",
                                    "value": "location"
                                },
                                {
                                    "id": "expanded",
                                    "about": "Start the control already expanded",
                                    "value": "true"
                                },
                                {
                                    "id": "autoCollapse",
                                    "about": "When user presses enter collapse the control",
                                    "value": "false"
                                },
                                {
                                    "id": "closedText",
                                    "about": "Text when the control is collapsed",
                                    "value": "🔍"
                                },
                                {
                                    "id": "openedText",
                                    "about": "Text when the control is expanded (collapses to the left)",
                                    "value": "«"
                                },
                                {
                                    "id": "placeholderText",
                                    "value": "Search by location or parcel"
                                }]
                        }
                    },
                    {
                        "id": "map-overview-map",
                        "about": "alternative zoom control",
                        "mid": "app/controls/ol3-control",
                        "disabled": true,
                        "Options": {
                            "Values": [{
                                    "id": "control-type",
                                    "about": "identify the ol3 constructor/class",
                                    "value": "OverviewMap"
                                },
                                {
                                    "id": "className",
                                    "about": "top-left",
                                    "value": "top-3 right-2 ol-overviewmap"
                                },
                                {
                                    "id": "label",
                                    "about": "Text to display when the map is collapsed",
                                    "value": "«"
                                },
                                {
                                    "id": "collapseLabel",
                                    "about": "text to display when the control is expanded (click to collapse)",
                                    "value": "»"
                                }]
                        }
                    },
                    {
                        "id": "map-mouse-position",
                        "about": "adds mouse coordinates to map, for testing and demonstration of why generic ol3-control is a trade-off",
                        "mid": "app/controls/ol3-control",
                        "disabled": true,
                        "Options": {
                            "Values": [{
                                    "id": "control-type",
                                    "about": "identify the ol3 constructor/class",
                                    "value": "MousePosition"
                                },
                                {
                                    "id": "className",
                                    "about": "top-left container",
                                    "value": "ol-control top-2 right-3 ol-mouse-position"
                                },
                                {
                                    "id": "undefinedHTML",
                                    "about": "see http://openlayers.org/en/latest/apidoc/ol.control.MousePosition.html",
                                    "value": "X,Y"
                                },
                                {
                                    "id": "projection",
                                    "about": "render coordinates using this projection",
                                    "value": "EPSG:4326"
                                },
                                {
                                    "id": "coordinateFormat",
                                    "about": "example of why generic control will not work, requires an interpreter like map-hover-handler otherwise no way to specify 'coordinateFormat'",
                                    "value": "eval(ol.coordinate.createStringXY(5))"
                                }]
                        }
                    },
                    {
                        "Controls": {
                            "Controls": [{
                                    "id": "map-full-screen",
                                    "about": "Display the map full screen",
                                    "mid": "app/controls/ol3-control",
                                    "type": "na",
                                    "disabled": false,
                                    "Options": {
                                        "Values": [{
                                                "id": "control-type",
                                                "about": "identify the ol3 constructor/class",
                                                "value": "FullScreen"
                                            },
                                            {
                                                "id": "label",
                                                "about": "http://openlayers.org/en/latest/apidoc/ol.control.FullScreen.html",
                                                "value": "⤢"
                                            }]
                                    }
                                },
                                {
                                    "id": "map-rotate",
                                    "about": "Restores the map view to the original orientation",
                                    "mid": "app/controls/ol3-control",
                                    "disabled": true,
                                    "Options": {
                                        "Values": [{
                                                "id": "control-type",
                                                "about": "identify the ol3 constructor/class",
                                                "value": "Rotate"
                                            },
                                            {
                                                "id": "className",
                                                "about": "top-left",
                                                "value": "ol-zoom-extent"
                                            }]
                                    }
                                },
                                {
                                    "id": "map-zoom-to-extent",
                                    "about": "Restores the map to the original \"full\" extent",
                                    "mid": "app/controls/ol3-control",
                                    "disabled": true,
                                    "Options": {
                                        "Values": [{
                                                "id": "control-type",
                                                "about": "identify the ol3 constructor/class",
                                                "value": "ZoomToExtent"
                                            },
                                            {
                                                "id": "extent",
                                                "about": "experimenting with eval",
                                                "value": "eval([-12830000, 4320000,-12820000, 4330000])"
                                            },
                                            {
                                                "id": "className",
                                                "about": "top-left",
                                                "value": "ol-zoom-extent"
                                            }]
                                    }
                                }]
                        },
                        "id": "top-right-toolbar",
                        "about": "adds a control to the ol3 map control collection",
                        "mid": "app/controls/map-panel",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "stack",
                                    "value": "vertical"
                                },
                                {
                                    "id": "position",
                                    "value": "top-2 right-2"
                                }]
                        }
                    },
                    {
                        "Commands": {
                            "Commands": [{
                                    "id": "current-location",
                                    "about": "Invokes the 'current-location' handler, switch type to \"action\" to make it a button",
                                    "mid": "app/commands/trigger",
                                    "text": "⌖",
                                    "type": "action",
                                    "disabled": false,
                                    "Options": {
                                        "Values": [{
                                                "id": "region",
                                                "value": "current-location-tool"
                                            },
                                            {
                                                "id": "title",
                                                "value": "Go to current Location"
                                            },
                                            {
                                                "id": "css-name",
                                                "value": "current-location"
                                            },
                                            {
                                                "id": "event",
                                                "about": "This button triggers this event for the actual handler",
                                                "value": "current-location"
                                            }]
                                    }
                                }]
                        },
                        "id": "current-location",
                        "about": "adds a control to the ol3 map control collection",
                        "mid": "app/controls/map-panel",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "position",
                                    "value": "bottom-3 left-2"
                                }]
                        }
                    },
                    {
                        "id": "layer-switcher",
                        "about": "adds a control to the ol3 map control collection, note 'text' is not honored because labels are defined in CSS for this control",
                        "mid": "app/controls/ol3-control",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "className",
                                    "about": "Position in the bottom-left of the map, decorate as necessary",
                                    "value": "layer-switcher bottom-2 left-2"
                                },
                                {
                                    "id": "control-type",
                                    "about": "identify the ol3 constructor/class",
                                    "value": "LayerSwitcher"
                                },
                                {
                                    "id": "closeOnMouseOut",
                                    "value": "false"
                                },
                                {
                                    "id": "openOnMouseOver",
                                    "value": "false"
                                }]
                        }
                    },
                    {
                        "id": "map-scale-line",
                        "about": "scaleline",
                        "mid": "app/controls/ol3-control",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "control-type",
                                    "about": "identify the ol3 constructor/class",
                                    "value": "ScaleLine"
                                },
                                {
                                    "id": "className",
                                    "about": "top-left container",
                                    "value": "ol-control bottom-2 right-3 ol-scale-line"
                                },
                                {
                                    "id": "units",
                                    "about": "Use imperial measurements (degrees, imperial, nautical, metric, us)",
                                    "value": "us"
                                }]
                        }
                    },
                    {
                        "Commands": {
                            "Commands": [{
                                    "id": "zoom-in",
                                    "mid": "app/commands/zoom",
                                    "text": "+",
                                    "type": "action",
                                    "disabled": false,
                                    "Options": {
                                        "Values": [{
                                                "id": "direction",
                                                "value": "in"
                                            },
                                            {
                                                "id": "css-name",
                                                "value": "zoom-in"
                                            },
                                            {
                                                "id": "title",
                                                "about": "Tooltip Description",
                                                "value": "Zoom In"
                                            }]
                                    }
                                }]
                        },
                        "id": "zoom-in-tool",
                        "about": "adds a control to the ol3 map control collection",
                        "mid": "app/controls/map-panel",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "position",
                                    "value": "bottom-3 right-2"
                                }]
                        }
                    },
                    {
                        "Commands": {
                            "Commands": [{
                                    "id": "zoom-out",
                                    "mid": "app/commands/zoom",
                                    "text": "−",
                                    "type": "action",
                                    "disabled": false,
                                    "Options": {
                                        "Values": [{
                                                "id": "direction",
                                                "value": "out"
                                            },
                                            {
                                                "id": "css-name",
                                                "value": "zoom-out"
                                            },
                                            {
                                                "id": "title",
                                                "about": "Tooltip Description",
                                                "value": "Zoom Out"
                                            }]
                                    }
                                }]
                        },
                        "id": "zoom-out-tool",
                        "about": "adds a control to the ol3 map control collection",
                        "mid": "app/controls/map-panel",
                        "disabled": false,
                        "Options": {
                            "Values": [{
                                    "id": "position",
                                    "value": "bottom-2 right-2"
                                }]
                        }
                    }]
            },
            "Options": {
                "Values": [{
                        "id": "css-name",
                        "about": "loads a custom css to manipulate toolbar layout",
                        "value": "rhythm-civics-base"
                    },
                    {
                        "id": "css",
                        "about": "stylesheet to load for this maplet",
                        "value": "app/css/rhythm-civics-base.css"
                    },
                    {
                        "id": "template",
                        "about": "Markup for the view and regions",
                        "value": "app/templates/rhythm-gis-template"
                    },
                    {
                        "id": "region",
                        "about": "Identifies the maplet container",
                        "value": "gis-map-region"
                    }]
            },
            "Localizations": {
                "Resources": [{
                        "id": "agency-customization",
                        "disabled": false,
                        "Resources": [{
                                "id": "primary_mapserver_url",
                                "value": "https://localhost/ags/rest/services/IPS850/ORA2850/MapServer",
                                "about": "AGS MapServer url containing the address and parcel layers"
                            },
                            {
                                "id": "primary_featureserver_url",
                                "value": "https://localhost/ags/rest/services/ANNOTATIONS/IPS860_ANNOTATIONS/FeatureServer",
                                "about": "AGS MapServer url containing the zoning layer"
                            },
                            {
                                "id": "parcel_layer_id",
                                "value": "19",
                                "about": "Parcel layer identifier"
                            },
                            {
                                "id": "address_layer_id",
                                "value": "1",
                                "about": "Address layer identifier"
                            },
                            {
                                "id": "zone_layer_id",
                                "value": "3",
                                "about": "Zone layer identifier (red and green zones)"
                            },
                            {
                                "id": "layer_key_template",
                                "value": "<%- FID %>",
                                "about": "Field name template for uniquely identifying a feature"
                            },
                            {
                                "id": "address_location_line_1",
                                "value": "<%- STRNO %> <%- STRNAME %>",
                                "about": "Address field template for rendering the first line of the address"
                            },
                            {
                                "id": "address_location_line_2",
                                "value": "<%- CITY %> <%- ZIP %>",
                                "about": "Address field template for rendering the second line of the address"
                            },
                            {
                                "id": "primary_address_fields",
                                "value": "LONGNAME",
                                "about": "Identify the address fields that should represent an address title (CSV)"
                            },
                            {
                                "id": "secondary_address_fields",
                                "value": "OWNER,STRDIR,STRNAME,STRTYPE",
                                "about": "Identify the address fields that you want to see in the parcel infoviewer when the address is expanded"
                            },
                            {
                                "id": "green_zone_filter",
                                "value": "H8REGION in ('GREEN')",
                                "about": "Filter to apply to the zones layer to find only \"green\" zones."
                            },
                            {
                                "id": "red_zone_filter",
                                "value": "H8REGION NOT IN ('GREEN')",
                                "about": "Filter to apply to the zones layer to find only \"red\" zones."
                            },
                            {
                                "id": "primary_zone_field",
                                "value": "H8REGION",
                                "about": "Identify the field(s) used to distinguish a red zone from a green zone"
                            },
                            {
                                "id": "max_feature_count",
                                "value": "25",
                                "about": "The number of features to return when geocoding for an address or parcel"
                            },
                            {
                                "id": "address_symbol_title",
                                "value": "<%- STRNO %> <%- STRNAME %> <%- STRTYPE %><br>\r\n<%- CITY%> <%- STATE%>",
                                "about": "Title template for address markers"
                            },
                            {
                                "id": "parcel_symbol_title",
                                "value": "PARCEL <%- PRCLID %>",
                                "about": "Title template for parcel markers"
                            },
                            {
                                "id": "secondary_parcel_fields",
                                "value": "PRCLID",
                                "about": "These are the fields that are listed in the body of the feature infoviewer popup window"
                            }]
                    }]
            }
        },
        "href": "http://localhost/850rs/api/property/agencymaps/rhythm-civics-wizard"
    };
});
define("ol3-lab/labs/workflow/ol-workflow", ["require", "exports", "openlayers", "ol3-lab/tests/data/maplet"], function (require, exports, ol, maplet_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const styleInfo = {
        textScale: 2,
        controlFillColor: "#ccc",
        controlStrokeColor: "#333",
        connectorStrokeColor: "#fff",
        connectorStrokeWidth: 1,
        connectorTextFillColor: "#ccc",
        connectorTextStrokeColor: "#333",
        connectorTextWidth: 2,
        workflowItemRadius: 50,
        workflowItemStrokeColor: "#ccc",
        workflowItemStrokeWidth: 2,
        workflowItemFillColor: "#333",
        workflowItemTextFillColor: "#ccc",
        workflowItemTextStrokeColor: "#333",
        workflowItemTextWidth: 2,
        rightArrow: "►",
        plus: "➕"
    };
    function rotation([x1, y1], [x2, y2]) {
        let dx = x2 - x1;
        let dy = y2 - y1;
        return Math.atan2(dy, dx);
    }
    function computeRoute([x1, y1], [x2, y2]) {
        return [[x1, y1], [x1, y1 + 20], [x2, y1 + 20], [x2, y2]];
    }
    function createWorkflowItemGeometry(item) {
        const [dx, dy] = [30, 20];
        let [x, y] = [100 * item.column, -100 * item.row];
        return new ol.geom.Point([x, y]);
    }
    class WorkFlow {
        constructor(map, workFlowItem = []) {
            this.map = map;
            this.workFlowItem = workFlowItem;
            workFlowItem.forEach((item, i) => item.column = i);
        }
        execute(context, event) {
            alert(`${event}: ${context.title}`);
        }
        render() {
            if (this.source)
                this.source.clear();
            this.workFlowItem.forEach((item1, i) => {
                item1.column = Math.max(i, item1.column);
                item1.row = Math.max(0, item1.row);
                item1.connections.forEach(item2 => {
                    item2.column = Math.max(item1.column + 1, item2.column);
                    item2.row = Math.max(item1.row + 1, item2.row);
                });
            });
            this.source = renderWorkflow(this.map, this);
            this.workFlowItem.forEach(item1 => {
                item1.connections.forEach(item2 => {
                    let style = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: styleInfo.connectorStrokeColor,
                            width: styleInfo.connectorStrokeWidth,
                        })
                    });
                    let f1 = this.source.getFeatureById(item1.id);
                    let f2 = this.source.getFeatureById(item2.id);
                    let p1 = f1.getGeometry().getClosestPoint(ol.extent.getCenter(f2.getGeometry().getExtent()));
                    let p2 = f2.getGeometry().getClosestPoint(ol.extent.getCenter(f1.getGeometry().getExtent()));
                    let route = computeRoute(p1, p2);
                    let feature = new ol.Feature();
                    feature.setGeometry(new ol.geom.LineString(route));
                    let downArrow = p1[1] > p2[1];
                    let arrowStyle = new ol.style.Style({
                        geometry: new ol.geom.Point(p2),
                        text: new ol.style.Text({
                            text: styleInfo.rightArrow,
                            textAlign: "end",
                            fill: new ol.style.Fill({
                                color: styleInfo.connectorStrokeColor,
                            }),
                            stroke: new ol.style.Stroke({
                                color: styleInfo.connectorStrokeColor,
                                width: styleInfo.connectorStrokeWidth,
                            }),
                            scale: 1,
                            rotation: Math.PI / 2 * (downArrow ? 1 : -1)
                        })
                    });
                    feature.setStyle([style, arrowStyle]);
                    this.source.addFeature(feature);
                });
            });
        }
        connect(item1, item2, title = "") {
            item1.connect(item2, title);
        }
        addControl(item) {
            let geom = new ol.geom.Point([item.column * 100, item.row * -100]);
            let element = document.createElement("div");
            element.className = "control";
            {
                let label = document.createElement("label");
                label.innerText = item.title;
                element.appendChild(label);
            }
            {
                let input = document.createElement("input");
                input.className = "control add-child";
                input.type = "button";
                input.value = styleInfo.plus;
                input.addEventListener("click", () => {
                    this.execute(item, "add-child");
                });
                element.appendChild(input);
            }
            let overlay = new ol.Overlay({
                element: element,
                offset: [-100, 0]
            });
            overlay.setPosition(geom.getLastCoordinate());
            this.map.addOverlay(overlay);
        }
    }
    class WorkFlowItem {
        constructor(title = "untitled", type = "") {
            this.title = title;
            this.type = type;
            this.id = `wf_${Math.random() * Number.MAX_VALUE}`;
            this.column = this.row = 0;
            this.connections = [];
        }
        connect(item, title = "") {
            if (this === item)
                return;
            this.connections.push(item);
        }
    }
    function renderWorkflow(map, workflow) {
        let source = new ol.source.Vector();
        let layer = new ol.layer.Vector({
            map: map,
            source: source
        });
        map.addLayer(layer);
        workflow.workFlowItem.forEach(item => {
            let style = new ol.style.Style({});
            let feature = new ol.Feature();
            feature.setId(item.id);
            feature.set("workflowitem", item);
            feature.setGeometry(createWorkflowItemGeometry(item));
            source.addFeature(feature);
            feature.setStyle([style]);
        });
        return source;
    }
    function run() {
        let options = {
            target: document.getElementsByClassName("map")[0],
            projection: "EPSG:3857",
            center: [0, 0],
            zoom: 19
        };
        let map = new ol.Map({
            target: options.target,
            keyboardEventTarget: document,
            loadTilesWhileAnimating: true,
            loadTilesWhileInteracting: true,
            controls: ol.control.defaults({ attribution: false }),
            view: new ol.View({
                projection: options.projection,
                center: options.center,
                zoom: options.zoom
            })
        });
        let items = [
            new WorkFlowItem("item 1"),
            new WorkFlowItem("item 2"),
            new WorkFlowItem("item 3"),
            new WorkFlowItem("item 4"),
            new WorkFlowItem("item 5"),
        ];
        let workflow = new WorkFlow(map, items);
        items[0].connect(items[2], "13");
        items[0].connect(items[1], "12");
        items[1].connect(items[2], "23");
        items[1].connect(items[3], "24");
        items[4].connect(items[2], "53");
        let maplet = maplet_1.maplet.data;
        let eventHash = new Map();
        importEvents(maplet.Events.Events, eventHash);
        maplet.Map.Layers.Layers.forEach(l => {
            l.Events && importEvents(l.Events.Events, eventHash);
        });
        eventHash.forEach(v => workflow.workFlowItem.push(v));
        workflow.render();
        items.forEach(item => workflow.addControl(item));
    }
    exports.run = run;
    function importEvents(events, eventHash) {
        events.forEach(event => {
            if (!event.name)
                return;
            event.name.split(",").forEach(eventName => {
                let workflowItem = eventHash.get(eventName);
                if (!workflowItem) {
                    workflowItem = new WorkFlowItem(eventName);
                    eventHash.set(eventName, workflowItem);
                }
                let eventOption = (event.Options && event.Options.Values && event.Options.Values.filter(v => v.id === "event")[0]);
                if (!eventOption)
                    return;
                eventOption.value.split(",").forEach(trigger => {
                    let childItem = eventHash.get(trigger);
                    if (!childItem) {
                        childItem = new WorkFlowItem(trigger);
                        eventHash.set(trigger, childItem);
                    }
                    workflowItem.connect(childItem);
                });
            });
        });
    }
});
define("ol3-lab/tests/ags-format", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function run() {
        let formatter = (new ol.format.EsriJSON());
        let olFeature = new ol.Feature(new ol.geom.Point([0, 0]));
        let esriFeature = formatter.writeFeatureObject(olFeature);
        olFeature = formatter.readFeature(esriFeature);
        console.log("esriFeature", esriFeature);
        {
            let geom = esriFeature.geometry;
            console.assert(geom.x === 0);
            console.assert(geom.y === 0);
        }
        olFeature.setGeometry(new ol.geom.LineString([[0, 0], [0, 0]]));
        esriFeature = formatter.writeFeatureObject(olFeature);
        olFeature = formatter.readFeature(esriFeature);
        console.log("esriFeature", esriFeature);
        {
            let geom = esriFeature.geometry;
            console.assert(geom.paths[0][0][0] === 0);
        }
        olFeature.setGeometry(new ol.geom.MultiLineString([[[0, 0], [0, 0]], [[0, 0], [0, 0]]]));
        esriFeature = formatter.writeFeatureObject(olFeature);
        olFeature = formatter.readFeature(esriFeature);
        console.log("esriFeature", esriFeature);
        {
            let geom = esriFeature.geometry;
            console.assert(geom.paths[0][0][0] === 0);
        }
        olFeature.setGeometry(new ol.geom.Polygon([[[0, 0], [0, 0]]]));
        esriFeature = formatter.writeFeatureObject(olFeature);
        olFeature = formatter.readFeature(esriFeature);
        console.log("esriFeature", esriFeature);
        {
            let geom = esriFeature.geometry;
            console.assert(geom.rings[0][0][0] === 0);
        }
        olFeature.setGeometry(new ol.geom.MultiPolygon([[[[0, 0], [0, 0]]], [[[0, 0], [0, 0]]]]));
        esriFeature = formatter.writeFeatureObject(olFeature);
        olFeature = formatter.readFeature(esriFeature);
        console.log("esriFeature", esriFeature);
        {
            let geom = esriFeature.geometry;
            console.assert(geom.rings[0][0][0] === 0);
        }
        olFeature.setGeometry(new ol.geom.MultiPoint([[0, 0], [0, 0]]));
        esriFeature = formatter.writeFeatureObject(olFeature);
        olFeature = formatter.readFeature(esriFeature);
        console.log("esriFeature", esriFeature);
        {
            let geom = esriFeature.geometry;
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
    Object.defineProperty(exports, "__esModule", { value: true });
    function run() {
        let [cw, ch] = [600, 600];
        let canvas = document.createElement("canvas");
        canvas.style.border = "1px solid black";
        canvas.width = cw;
        canvas.height = ch;
        let ctx = canvas.getContext("2d");
        document.getElementById("map").appendChild(canvas);
        let path = new Path2D("M12 0 L24 24 L0 24 L12 0 Z");
        let [dw, dh] = [24, 24];
        let positions = [[0, -60], [-60, 60], [60, 60]];
        let tick = 0;
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
                    positions.forEach(position => {
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
define("ol3-lab/tests/drop-vertex-on-marker-detection", ["require", "exports", "openlayers", "ol3-lab/labs/mapmaker", "ol3-lab/labs/route-editor", "bower_components/ol3-fun/ol3-fun/common"], function (require, exports, ol, mapmaker_1, route_editor_1, common_24) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function midpoint(points) {
        let p0 = points.reduce((sum, p) => p.map((v, i) => v + sum[i]));
        return p0.map(v => v / points.length);
    }
    function run() {
        let features = new ol.Collection([]);
        let activeFeature;
        features.on("add", (args) => {
            let feature = args.element;
            feature.on("change", (args) => {
                activeFeature = feature;
            });
            feature.on("change:geometry", (args) => {
                console.log("feature change:geometry", args);
            });
        });
        let layer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: features
            })
        });
        let colors = ['229966', 'cc6633', 'cc22cc', '331199'].map(v => '#' + v);
        mapmaker_1.run().then(map => {
            map.addLayer(layer);
            let [a, b, c, d] = map.getView().calculateExtent(map.getSize().map(v => v * 0.25));
            let routes = [];
            let shift = [-0.001, -0.005];
            while (colors.length) {
                let stops = common_24.range(8).map(v => [a + (c - a) * Math.random(), b + (d - b) * Math.random()].map((v, i) => v + shift[i]));
                let startstop = [a + (c - a) * Math.random(), b + (d - b) * Math.random()].map((v, i) => v + shift[i]);
                let route = new route_editor_1.Route({
                    color: colors.pop(),
                    start: startstop,
                    finish: startstop,
                    stops: stops
                });
                shift = shift.map(v => v + 0.005);
                routes.push(route);
            }
            let redRoute = new route_editor_1.Route({
                color: "red",
                showLines: false,
                modifyRoute: true
            });
            routes.push(redRoute);
            routes.forEach(r => {
                r.refresh(map);
                r.appendTo(layer);
            });
            let editFeatures = new ol.Collection();
            routes.map(route => route.allowModify(editFeatures));
            let modify = new ol.interaction.Modify({
                pixelTolerance: 8,
                condition: (evt) => {
                    if (!ol.events.condition.noModifierKeys(evt))
                        return false;
                    if (routes.some(r => r.isStartingLocation(map, evt.coordinate)))
                        return false;
                    if (routes.some(r => r.isEndingLocation(map, evt.coordinate)))
                        return false;
                    return true;
                },
                features: editFeatures
            });
            map.addInteraction(modify);
            modify.on("modifyend", (args) => {
                console.log("modifyend", args);
                let dropLocation = args.mapBrowserEvent.coordinate;
                console.log("drop-location", dropLocation);
                let dropInfo = {
                    route: null,
                    stops: null
                };
                let targetInfo = {
                    route: null,
                    vertexIndex: null
                };
                targetInfo.route = routes.filter(route => route.owns(activeFeature))[0];
                console.log("target-route", targetInfo.route);
                {
                    let geom = activeFeature.getGeometry();
                    let coords = geom.getCoordinates();
                    let vertex = coords.filter(p => p[0] === dropLocation[0])[0];
                    let vertexIndex = coords.indexOf(vertex);
                    console.log("vertex", vertexIndex);
                    targetInfo.vertexIndex = vertexIndex;
                    if (targetInfo.vertexIndex == 0) {
                        targetInfo.vertexIndex = targetInfo.route.stops.length;
                    }
                }
                routes.some(route => {
                    let stop = route.findStop(map, dropLocation);
                    if (stop >= 0) {
                        console.log("drop", route, stop);
                        dropInfo.route = route;
                        dropInfo.stops = [stop];
                        return true;
                    }
                });
                let isNewVertex = targetInfo.route.isNewVertex();
                let dropOnStop = dropInfo.route && 0 < dropInfo.stops.length;
                let isSameRoute = dropOnStop && dropInfo.route === targetInfo.route;
                let stopIndex = targetInfo.vertexIndex;
                if (targetInfo.route.startLocation)
                    stopIndex--;
                if (stopIndex < 0) {
                    console.log("moving the starting vertex is not allowed");
                }
                else if (stopIndex > targetInfo.route.stops.length) {
                    console.log("moving the ending vertex is not allowed");
                }
                else if (dropOnStop && isNewVertex) {
                    let stop = dropInfo.route.removeStop(dropInfo.stops[0]);
                    targetInfo.route.addStop(stop, stopIndex);
                }
                else if (dropOnStop && !isNewVertex && !isSameRoute) {
                    let stop = targetInfo.route.removeStop(stopIndex);
                    redRoute.addStop(stop);
                    stop = dropInfo.route.removeStop(dropInfo.stops[0]);
                    targetInfo.route.addStop(stop, stopIndex);
                }
                else if (dropOnStop && !isNewVertex && isSameRoute) {
                    let count = dropInfo.stops[0] - stopIndex;
                    if (count > 1)
                        while (count--) {
                            let stop = targetInfo.route.removeStop(stopIndex);
                            redRoute.addStop(stop);
                        }
                }
                else if (!dropOnStop && isNewVertex) {
                    console.log("dropping a new vertex on empty space has not effect");
                }
                else if (!dropOnStop && !isNewVertex) {
                    let stop = targetInfo.route.removeStop(stopIndex);
                    stop && redRoute.addStop(stop);
                }
                routes.map(r => r.refresh(map));
            });
        });
    }
    exports.run = run;
});
define("ol3-lab/tests/google-polyline", ["require", "exports", "ol3-lab/labs/common/ol3-polyline", "ol3-lab/labs/common/google-polyline"], function (require, exports, OlEncoder, Encoder) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const polyline = [[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]];
    const encoding = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";
    function run() {
        {
            let encoder = new Encoder();
            console.assert(encoder.encode(encoder.decode(encoding)) === encoding);
            console.assert(encoding === encoder.encode(polyline));
        }
        {
            let olEncoder = new OlEncoder();
            console.assert(olEncoder.encode(olEncoder.decode(encoding)) === encoding);
            console.assert(encoding === olEncoder.encode(polyline));
        }
    }
    exports.run = run;
});
define("ol3-lab/tests/index", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function run() {
        let l = window.location;
        let path = `${l.origin}${l.pathname}?run=ol3-lab/tests/`;
        let labs = `
    ags-format
    google-polyline
    webmap
    map-resize-defect
    drop-vertex-on-marker-detection
    index
    `;
        document.writeln(`
    <p>
    Watch the console output for failed assertions (blank is good).
    </p>
    `);
        document.writeln(labs
            .split(/ /)
            .map(v => v.trim())
            .filter(v => !!v)
            .sort()
            .map(lab => `<a href=${path}${lab}&debug=1>${lab}</a>`)
            .join("<br/>"));
    }
    exports.run = run;
    ;
});
define("ol3-lab/tests/map-resize-defect", ["require", "exports", "openlayers", "jquery"], function (require, exports, ol, $) {
    "use strict";
    let html = `
<lab class='map-resize-defect'>
    <div class='outer'>
        <div id='map' class='map fill'>
        </div>
    </div>
    <button class='event grow'>Update CSS</button>
    <button class='event resize'>Resize Map</button>
</lab>
`;
    let css = `
<style>

    .outer {
        padding: 20px;
        border: 1px solid orange;
        width: 0;
        height: 0;
        overflow:hidden;
    }

    .map {
        padding: 20px;
        border: 1px solid yellow;
        width: 80%;
        height: 80%;
    }

</style>
`;
    let css2 = `
<style>

    html, body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        border: none;
    }

    .outer {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        border: none;
    }

    .map {
        border: none;
    }

</style>
`;
    const fail = 0;
    return function run() {
        $('#map').remove();
        $(html).appendTo('body');
        $(css).appendTo('head');
        let map = new ol.Map({
            target: "map",
            view: new ol.View({
                projection: 'EPSG:4326',
                center: [-82.4, 34.85],
                zoom: 15
            }),
            layers: [new ol.layer.Tile({ source: new ol.source.OSM() })]
        });
        $('#map').resize(() => {
            throw "this will never happen because jquery only listens for the window size to change";
        });
        $('button.event.grow').click(evt => {
            $(css2).appendTo("head");
            $(evt.target).remove();
        });
        $('button.event.resize').click(evt => {
            map.updateSize();
            $(evt.target).remove();
        });
        require(["https://rawgit.com/marcj/css-element-queries/master/src/ResizeSensor.js"], (ResizeSensor) => {
            let target = map.getTargetElement();
            new ResizeSensor(target, () => {
                console.log("ResizeSensor resize detected!");
                if (!fail)
                    map.updateSize();
            });
        });
    };
});
define("ol3-lab/tests/webmap", ["require", "exports", "jquery"], function (require, exports, $) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const webmap = "ae85c9d9c5ae409bb1f351617ea0bffc";
    let portal = "https://www.arcgis.com";
    const items_endpoint = "http://www.arcgis.com/sharing/rest/content/items";
    function endpoint() {
        return `${items_endpoint}/${webmap}/data?f=json`;
    }
    function run() {
        if (1)
            $.ajax({
                url: endpoint(),
                dataType: "json"
            }).done((webmap) => {
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
define("bower_components/ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-circle", ["require", "exports"], function (require, exports) {
    "use strict";
    const styles = [{
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
define("bower_components/ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-cross", ["require", "exports"], function (require, exports) {
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
define("bower_components/ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-square", ["require", "exports"], function (require, exports) {
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
define("bower_components/ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-diamond", ["require", "exports"], function (require, exports) {
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
define("bower_components/ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-path", ["require", "exports"], function (require, exports) {
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
define("bower_components/ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-x", ["require", "exports"], function (require, exports) {
    "use strict";
    return [{
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
        }];
});
define("bower_components/ol3-symbolizer/ol3-symbolizer/styles/ags/picturemarkersymbol", ["require", "exports"], function (require, exports) {
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
define("bower_components/ol3-symbolizer/ol3-symbolizer/styles/ags/picturemarkersymbol-imagedata", ["require", "exports"], function (require, exports) {
    "use strict";
    const style = [{
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
define("ol3-lab/ux/ags-symbols", ["require", "exports", "openlayers", "ol3-lab/labs/common/style-generator", "bower_components/ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-circle", "bower_components/ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-cross", "bower_components/ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-square", "bower_components/ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-diamond", "bower_components/ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-path", "bower_components/ol3-symbolizer/ol3-symbolizer/styles/ags/simplemarkersymbol-x", "bower_components/ol3-symbolizer/ol3-symbolizer/styles/ags/picturemarkersymbol", "bower_components/ol3-symbolizer/ol3-symbolizer/styles/ags/picturemarkersymbol-imagedata", "bower_components/ol3-symbolizer/ol3-symbolizer/format/ags-symbolizer"], function (require, exports, ol, StyleGenerator, circleSymbol, crossSymbol, squareSymbol, diamondSymbol, pathSymbol, xSymbol, iconurl, iconimagedata, ags_symbolizer_2) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const center = [-82.4, 34.85];
    function run() {
        let formatter = new ags_symbolizer_2.StyleConverter();
        let generator = new StyleGenerator({
            center: center,
            fromJson: json => formatter.fromJson(json)
        });
        let layer = generator.asMarkerLayer({
            markerCount: 50,
            styleCount: 1
        });
        let map = new ol.Map({
            target: "map",
            view: new ol.View({
                projection: 'EPSG:4326',
                center: center,
                zoom: 10
            }),
            layers: [layer]
        });
        let circleStyle = formatter.fromJson(circleSymbol[0]);
        let crossStyle = formatter.fromJson(crossSymbol[0]);
        let squareStyle = formatter.fromJson(squareSymbol[0]);
        let diamondStyle = formatter.fromJson(diamondSymbol[0]);
        let pathStyle = formatter.fromJson(pathSymbol[0]);
        let xStyle = formatter.fromJson(xSymbol[0]);
        let styles = [
            circleStyle,
            crossStyle,
            diamondStyle,
            pathStyle,
            squareStyle,
            xStyle,
            formatter.fromJson(iconurl[0]),
            formatter.fromJson(iconimagedata[0])
        ];
        layer.getSource().getFeatures().forEach((f, i) => f.setStyle([styles[i % styles.length]]));
    }
    exports.run = run;
});
define("ol3-lab/ux/download", ["require", "exports", "openlayers", "jquery"], function (require, exports, ol, $) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const proxy = 'http://localhost:94/proxy/proxy.ashx?';
    const center = [-82.4, 34.85];
    const html = `
<div class='download'>
    <h3>Print Preview Lab - Capturing Map Canvas</h3>
    <p>
    This lab only works locally because it requires a proxy and I'm not aware of a github proxy.
    (Good luck searching for github+proxy) 
    </p>

    <div class='area'>    
        <label>Copy Map into toDataURL</label>
        <div class='map'></div>
        <button class='download-map'>Download</button>
    </div>

    <div class='area'>    
        <label>We want to get the map to render into this canvas so that we can right-click and save the image</label>
        <canvas class='canvas-preview'></canvas>
    </div>

    <div class='area'>    
        <label>We want to get the map into this image so that we can get the image data</label>
        <img class='image-preview'></img>
    </div>

    <div class='area'>    
        <label>toDataURL</label>
        <input class='data-url' spellcheck='false autocomplete='off' wrap='hard'></input>
    </div>
</div>`;
    const css = `
<style>
    #map { 
        display: none;
    }
    .download {
        padding: 20px;
    }
    .download .map {
        width: 400px;
        height: 400px;
    }
    .download label {
        display: block;
        vertical-align: top;
    }
    .download .area {
        padding: 20px;
        margin: 20px;
        border: 1px solid black;
    }
    .download .image-preview, .download .canvas-preview {
        border: 1px solid black;
        padding: 20px;
    }
    .download .data-url {
        overflow: auto;
        width: 400px;
    }
</style>`;
    const imageUrl = 'http://sampleserver1.arcgisonline.com/arcgis/rest/services/Demographics/ESRI_Census_USA/MapServer/export?F=image&FORMAT=PNG32&TRANSPARENT=true&layers=show%3A4&SIZE=256%2C256&BBOX=-10488383.273178745%2C4148390.399093086%2C-10410111.756214725%2C4226661.916057106&BBOXSR=3857&IMAGESR=3857&DPI=83';
    function copyTo(image, canvas) {
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0);
    }
    function makeMap() {
        let map = new ol.Map({
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
        $(() => {
            ol.source.Image.defaultImageLoadFunction =
                (image, src) => image.getImage().src = `${proxy}${src}`;
            let map = makeMap();
            map.addLayer(new ol.layer.Image({
                source: new ol.source.ImageArcGISRest({
                    ratio: 1,
                    params: {},
                    url: 'http://sampleserver1.arcgisonline.com/arcgis/rest/services/Demographics/ESRI_Census_USA/MapServer'
                })
            }));
            $('.download-map').click(() => {
                map.once('postcompose', (event) => {
                    let canvas = event.context.canvas;
                    img.src = canvas.toDataURL();
                });
                map.updateSize();
            });
        });
        let img = $('.image-preview')[0];
        let canvas = $('.canvas-preview')[0];
        img.setAttribute("crossOrigin", "anonymous");
        img.src = proxy + imageUrl;
        img.onload = () => {
            copyTo(img, canvas);
            document.getElementsByClassName('data-url')[0].value = canvas.toDataURL();
        };
    }
    exports.run = run;
});
define("ol3-lab/ux/serializers/ags-simplefillsymbol", ["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class SimpleFillConverter {
        toJson() {
            return null;
        }
        fromJson(json) {
            return null;
        }
    }
    exports.SimpleFillConverter = SimpleFillConverter;
});
//# sourceMappingURL=index.js.map