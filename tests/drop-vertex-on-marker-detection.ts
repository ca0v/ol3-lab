import ol = require("openlayers");
import {run as mapmaker} from "../labs/mapmaker";

const delta = 16;

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
        if (index === 0 && this.color !== "red") return;
        let stop = this.routeStops[index];
        console.log("removeStop", this.color, stop);
        this.routeStops.splice(index, 1);
        let coords = this.lines.getCoordinates();
        coords.splice(index, 1);
        this.lines.setCoordinates(coords);
        return stop;
    }

    addStop(stop: ol.Feature, index: number) {
        console.log("addStop", this.color, stop, index);
        this.routeStops.splice(index, 0, stop);
    }

    refresh() {
        this.routeStops.map((stop, index) => {
            stop.set("color", this.color);
            stop.set("text", (1 + index) + "");
        });
        let coords = this.points.map(p => p.getCoordinates());
        if (coords.length) {
            coords.push(coords[0]);
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

    features.on("change", (args: any) => {
        console.log("change", args);
    });

    features.on("remove", (args: any) => {
        console.log("remove", args);
    });

    mapmaker().then(map => {

        let layer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: features
            })
        });
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
            features: new ol.Collection(routes.map(route => route.route)),
            deleteCondition: event => ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event)
        });

        map.addInteraction(modify);

        modify.on("change", (args: any) => {
            console.log("change", args);
        });

        modify.on("change:active", () => {
            console.log("change:active");
        });

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

            if (!dropInfo.route) {
                if (targetInfo.route !== redRoute) {
                    let stop = targetInfo.route.removeStop(targetInfo.vertexIndex);
                    if (stop) {
                        redRoute.addStop(stop, 0);
                        targetInfo.route.refresh();
                        redRoute.refresh();
                    }
                }
            } else {
                dropInfo.stops.map(stopIndex => {
                    let stop = dropInfo.route.removeStop(stopIndex);
                    stop && targetInfo.route.addStop(stop, targetInfo.vertexIndex);
                });
                targetInfo.route.refresh();
                dropInfo.route.refresh();
            }
        });

        modify.on("modifystart", () => {
            console.log("modifystart");
        });

        modify.on("propertychange", () => {
            console.log("propertychange");
        });

    });

}