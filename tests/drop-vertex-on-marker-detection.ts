import ol = require("openlayers");
import {run as mapmaker} from "../labs/mapmaker";

const delta = 16;

function midpoint(points: number[][]) {
    let p0 = points.reduce((sum, p) => p.map((v, i) => v + sum[i]));
    return p0.map(v => v / points.length);
}

class Route {

    static removeVertex(geom: ol.geom.LineString, vertex: number) {
        let coords = geom.getCoordinates();
        if (coords.length < 3) return;
        coords.splice(vertex, 1);
        geom.setCoordinates(coords);
    }

    private routeLine: ol.Feature;
    private routeStops: ol.Feature[];

    get route() {
        return this.routeLine;
    }

    get lines() {
        return <ol.geom.LineString>this.routeLine.getGeometry();
    }

    get points() {
        return this.routeStops.map(stop => <ol.geom.Point>stop.getGeometry());
    }

    owns(feature: ol.Feature) {
        return feature === this.routeLine;
    }

    constructor(public color: string, stops: ol.Coordinate[]) {

        let feature = this.routeLine = new ol.Feature(new ol.geom.LineString(stops));
        feature.set("color", color);

        feature.setStyle((res: number) => <any>[
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: feature.get("color"),
                    width: 4
                })
            }),
            new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: "white",
                    width: 1
                })
            })
        ]);

        let points = this.routeStops = stops.map(p => new ol.Feature(new ol.geom.Point(p)));
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
        layer.getSource().addFeatures(this.routeStops);
    }

    findStops(extent: ol.Extent) {
        let result = <number[]>[];
        this.points.forEach((p, i) => {
            if (ol.extent.containsCoordinate(extent, p.getFirstCoordinate())) result.push(i);
        });
        return result;
    }

    removeStop(index: number) {
        let stop = this.routeStops[index];
        console.log("removeStop", this.color, stop);
        this.routeStops.splice(index, 1);
        let coords = this.lines.getCoordinates();
        coords.splice(index, 1);
        this.lines.setCoordinates(coords);
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
        let coords = this.points.map(p => p.getCoordinates());
        if (coords.length) {
            coords.push(coords[coords.length - 1].map((v, i) => v + 0.001 * i))
            this.routeLine.setGeometry(new ol.geom.LineString(coords));
        }
    }
}

export function run() {

    let features = new ol.Collection([]);
    let activeFeature: ol.Feature;

    features.on("add", (args: { element: ol.Feature }) => {
        console.log("add", args);

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

    mapmaker().then(map => {

        map.addLayer(layer);

        let [a, b, c, d] = map.getView().calculateExtent([100, 100]);

        let blueRoute = new Route("blue", [[a, b], [c, b], [c, d], [a, d]].map(v => v.map(v => v + 0.001)));
        blueRoute.appendTo(layer);

        let greenRoute = new Route("green", [[a, b], [c, b], [c, d], [a, d]].map(v => v.map(v => v * 1.0001)));
        greenRoute.appendTo(layer);

        let redRoute = new Route("red", []);
        redRoute.appendTo(layer);

        let routes = [blueRoute, greenRoute, redRoute];

        let modify = new ol.interaction.Modify({
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
        modify.on("modifyend", (args: any) => {
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
            }

            {
                let pixel = map.getPixelFromCoordinate(dropLocation);
                let [x1, y1, x2, y2] = [pixel[0] - delta, pixel[1] + delta, pixel[0] + delta, pixel[1] - delta];
                [x1, y1] = map.getCoordinateFromPixel([x1, y1]);
                [x2, y2] = map.getCoordinateFromPixel([x2, y2]);

                routes.some(route => {
                    let stops = route.findStops([x1, y1, x2, y2]);
                    if (stops.length) {
                        console.log("drop", route, stops);
                        dropInfo.route = route;
                        dropInfo.stops = stops;
                        return true;
                    }
                })
            }

            // new or existing vertex?
            let isNewVertex = (targetInfo.route.lines.getCoordinates().length > targetInfo.route.points.length + 1);
            let dropOnStop = dropInfo.route && 0 < dropInfo.stops.length;
            let isSameRoute = dropOnStop && dropInfo.route === targetInfo.route;

            if (0 === targetInfo.vertexIndex) {
                // do nothing
            }

            else if (dropOnStop && dropInfo.stops[0] === 0 && dropInfo.route !== redRoute) {
                // do nothing
            }

            else if (dropOnStop && isNewVertex) {
                // adopt stop
                let stop = dropInfo.route.removeStop(dropInfo.stops[0]);
                targetInfo.route.addStop(stop, targetInfo.vertexIndex);
            }

            else if (dropOnStop && !isNewVertex && !isSameRoute) {
                // ophan remaining stops and adopt new stops
                let count = targetInfo.route.points.length - targetInfo.vertexIndex;
                while (count--) {
                    let stop = targetInfo.route.removeStop(targetInfo.vertexIndex);
                    redRoute.addStop(stop);
                }
                count = dropInfo.route.points.length - dropInfo.stops[0];
                while (count--) {
                    let stop = dropInfo.route.removeStop(dropInfo.stops[0]);
                    targetInfo.route.addStop(stop);
                }
            }

            else if (dropOnStop && !isNewVertex && isSameRoute) {
                // ophan in-betweens
                let count = dropInfo.stops[0] - targetInfo.vertexIndex;
                if (count > 1) while (count--) {
                    let stop = targetInfo.route.removeStop(targetInfo.vertexIndex);
                    redRoute.addStop(stop);
                }
            }

            else if (!dropOnStop && isNewVertex) {
                // meaningless
            }

            else if (!dropOnStop && !isNewVertex) {
                // orphan the stop (unless it is the last stop)
                let stop = targetInfo.route.removeStop(targetInfo.vertexIndex);
                stop && redRoute.addStop(stop);
            }

            routes.map(r => r.refresh());
        });

    });

}