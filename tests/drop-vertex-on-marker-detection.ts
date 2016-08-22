import ol = require("openlayers");
import {run as mapmaker} from "../labs/mapmaker";
import {Format, StyleConverter} from "../alpha/format/ol3-symbolizer";

const delta = 16;

let formatter = new StyleConverter();

function fromJson(styles: Format.Style[]) {
    return styles.map(style => formatter.fromJson(style));
}

function midpoint(points: number[][]) {
    let p0 = points.reduce((sum, p) => p.map((v, i) => v + sum[i]));
    return p0.map(v => v / points.length);
}

var range = (n: number) => {
    var r = new Array(n);
    for (var i = 0; i < n; i++) r[i] = i;
    return r;
}

class Route {

    private routeLine: ol.Feature;

    public startLocation: ol.Feature;
    public finishLocation: ol.Feature;
    private routeStops: ol.Feature[];

    get route() {
        return this.routeLine;
    }

    isNewVertex() {
        let lineSegmentCount = (<ol.geom.LineString>this.routeLine.getGeometry()).getCoordinates().length;
        this.start && lineSegmentCount--;
        this.finish && lineSegmentCount--;
        let stopCount = this.routeStops.length;
        return stopCount < lineSegmentCount;
    }

    get stops() {
        return this.routeStops.map(stop => (<ol.geom.Point>stop.getGeometry()).getFirstCoordinate());
    }

    owns(feature: ol.Feature) {
        return feature === this.routeLine;
    }

    constructor(public color: string, private start: ol.Coordinate, private finish: ol.Coordinate, stops: ol.Coordinate[], lineStyle?: Format.Style[]) {

        let feature = this.routeLine = new ol.Feature(new ol.geom.LineString(stops));
        feature.set("color", color);

        if (!lineStyle) lineStyle = [
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
            }];

        let styles = fromJson(lineStyle);
        feature.setStyle(styles);

        let points = this.routeStops = stops.map(p => new ol.Feature(new ol.geom.Point(p)));
        if (start) {
            let startingLocation = this.startLocation = new ol.Feature(new ol.geom.Point(start));
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
                        "radius": delta
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
                        "radius": delta
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
                        "radius": delta * 0.75,
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
                        "radius": delta * 0.75,
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

            p.setStyle((res: number) => <any>[
                new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: delta,
                        fill: new ol.style.Fill({
                            color: p.get("color")
                        })
                    })
                }),
                new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: delta - 2,
                        stroke: new ol.style.Stroke({
                            color: "white",
                            width: 1
                        })
                    })
                }),
                new ol.style.Style({
                    text: new ol.style.Text({
                        font: `${delta * 0.75}pt Segoe UI`,
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

    appendTo(layer: ol.layer.Vector) {
        this.refresh();
        layer.getSource().addFeatures([this.routeLine]);
        this.startLocation && layer.getSource().addFeature(this.startLocation);
        layer.getSource().addFeatures(this.routeStops);
        this.finishLocation && layer.getSource().addFeature(this.finishLocation);
    }

    findStop(map: ol.Map, location: ol.Coordinate) {
        return this.findStops(map, location, this.stops)[0];
    }

    isStartingLocation(map: ol.Map, location: ol.Coordinate) {
        return !!this.start && 1 === this.findStops(map, location, [this.start]).length;
    }

    isEndingLocation(map: ol.Map, location: ol.Coordinate) {
        return !!this.finish && 1 === this.findStops(map, location, [this.finish]).length;
    }

    findStops(map: ol.Map, location: ol.Coordinate, stops: ol.Coordinate[]) {
        let pixel = map.getPixelFromCoordinate(location);
        let [x1, y1, x2, y2] = [pixel[0] - delta, pixel[1] + delta, pixel[0] + delta, pixel[1] - delta];
        [x1, y1] = map.getCoordinateFromPixel([x1, y1]);
        [x2, y2] = map.getCoordinateFromPixel([x2, y2]);
        let extent = [x1, y1, x2, y2];

        let result = <number[]>[];
        stops.forEach((p, i) => {
            if (ol.extent.containsCoordinate(extent, p)) result.push(i);
        });
        return result;
    }

    removeStop(index: number) {
        let stop = this.routeStops[index];
        console.log("removeStop", this.color, stop);
        this.routeStops.splice(index, 1);
        return stop;
    }

    addStop(stop: ol.Feature, index?: number) {
        console.log("addStop", this.color, stop, index);
        if (index === undefined) this.routeStops.push(stop)
        else this.routeStops.splice(index, 0, stop);
    }

    refresh() {
        this.routeStops.map((stop, index) => {
            stop.set("color", this.color);
            stop.set("text", (1 + index) + "");
        });
        let coords = this.stops;

        this.start && coords.unshift(this.start);
        this.finish && coords.push(this.finish);

        if (coords.length) {
            this.routeLine.setGeometry(new ol.geom.LineString(coords));
        }
    }
}

export function run() {

    let features = new ol.Collection([]);
    let activeFeature: ol.Feature;

    features.on("add", (args: { element: ol.Feature }) => {

        let feature = args.element;

        feature.on("change", (args: any) => {
            activeFeature = feature;
        });

        feature.on("change:geometry", (args: any) => {
            console.log("feature change:geometry", args);
        });

    });

    let layer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: features
        })
    });

    let colors = ['229966', 'cc6633', 'cc22cc', '331199'].map(v => '#' + v);

    mapmaker().then(map => {

        map.addLayer(layer);

        let [a, b, c, d] = map.getView().calculateExtent(map.getSize().map(v => v * 0.25));

        let routes = <Route[]>[];

        let shift = [-0.001, -0.005];        
        while (colors.length) {
            let startstop = [a + (c - a) * Math.random(), b + (d - b) * Math.random()].map((v, i) => v + shift[i]);
            let route = new Route(colors.pop(), startstop, startstop, range(8).map(v => [a + (c - a) * Math.random(), b + (d - b) * Math.random()].map((v, i) => v + shift[i])));
            shift = shift.map(v => v + 0.005);
            routes.push(route);
        }
        
        let redRoute = new Route("red", null, null, [], [{
            "stroke": {
                "color": "transparent",
                "width": 0
            }
        }]
        );
        routes.push(redRoute);

        routes.forEach(r => r.appendTo(layer));

        let modify = new ol.interaction.Modify({
            pixelTolerance: 8,
            condition: (evt: ol.MapBrowserEvent) => {
                if (!ol.events.condition.noModifierKeys(evt)) return false; // ol.events.condition.primaryAction
                // only if it is not a starting or ending location for any route
                if (routes.some(r => r.isStartingLocation(map, evt.coordinate))) return false;
                if (routes.some(r => r.isEndingLocation(map, evt.coordinate))) return false;
                return true;
            },
            features: new ol.Collection(routes.map(route => route.route))
        });

        map.addInteraction(modify);

        /**
         * Can drag existing or new vertex onto stops of a route
         * Can be same route or another route
         * A drop on the 1st stop has no effect
         * A drop of an existing vertex on stop orphans [vertexindex..end] transfers ownership of [stop..end]
         * A drop of new vertex transfers ownership of [stop]  
         */
        modify.on("modifyend", (args: { mapBrowserEvent: ol.MapBrowserEvent }) => {
            console.log("modifyend", args);
            let dropLocation = args.mapBrowserEvent.coordinate;
            console.log("drop-location", dropLocation);

            let dropInfo = {
                route: <Route>null,
                stops: <number[]>null
            };
            let targetInfo = {
                route: <Route>null,
                vertexIndex: <number>null
            };

            targetInfo.route = routes.filter(route => route.owns(activeFeature))[0];
            console.log("target-route", targetInfo.route.color);

            {
                let geom = <ol.geom.LineString>activeFeature.getGeometry();
                let coords = geom.getCoordinates();
                let vertex = coords.filter(p => p[0] === dropLocation[0])[0];
                let vertexIndex = coords.indexOf(vertex);
                console.log("vertex", vertexIndex);
                targetInfo.vertexIndex = vertexIndex;

                // use endpoint of line segment of length 0
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

            // new or existing vertex?
            let isNewVertex = targetInfo.route.isNewVertex();
            let dropOnStop = dropInfo.route && 0 < dropInfo.stops.length;
            let isSameRoute = dropOnStop && dropInfo.route === targetInfo.route;

            let stopIndex = targetInfo.vertexIndex;
            if (targetInfo.route.startLocation) stopIndex--;

            if (stopIndex < 0) {
                // do nothing
                console.log("moving the starting vertex is not allowed");
            }

            else if (stopIndex > targetInfo.route.stops.length) {
                console.log("moving the ending vertex is not allowed");
            }

            else if (dropOnStop && isNewVertex) {
                // adopt stop
                let stop = dropInfo.route.removeStop(dropInfo.stops[0]);
                targetInfo.route.addStop(stop, stopIndex);
            }

            else if (dropOnStop && !isNewVertex && !isSameRoute) {
                // ophan remaining stops and adopt new stops
                let count = targetInfo.route.stops.length - stopIndex;
                while (count--) {
                    let stop = targetInfo.route.removeStop(stopIndex);
                    redRoute.addStop(stop);
                }
                count = dropInfo.route.stops.length - dropInfo.stops[0];
                while (count--) {
                    let stop = dropInfo.route.removeStop(dropInfo.stops[0]);
                    targetInfo.route.addStop(stop);
                }
            }

            else if (dropOnStop && !isNewVertex && isSameRoute) {
                // ophan in-betweens
                let count = dropInfo.stops[0] - stopIndex;
                if (count > 1) while (count--) {
                    let stop = targetInfo.route.removeStop(stopIndex);
                    redRoute.addStop(stop);
                }
            }

            else if (!dropOnStop && isNewVertex) {
                // meaningless
                console.log("dropping a new vertex on empty space has not effect");
            }

            else if (!dropOnStop && !isNewVertex) {
                // orphan the stop (unless it is the last stop)
                let stop = targetInfo.route.removeStop(stopIndex);
                stop && redRoute.addStop(stop);
            }

            routes.map(r => r.refresh());
        });

    });

}