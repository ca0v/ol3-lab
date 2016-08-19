import ol = require("openlayers");
import {run as mapmaker} from "../labs/mapmaker";

export function run() {

    let features = new ol.Collection([]);

    features.on("add", (args: { element: ol.Feature }) => {
        console.log("add", args);

        let feature = args.element;

        feature.on("change", (args: any) => {
            console.log("feature change", args);
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

    let modify = new ol.interaction.Modify({
        features: features,
        deleteCondition: event => ol.events.condition.shiftKeyOnly(event) && ol.events.condition.singleClick(event)
    });

    mapmaker().then(map => {

        let layer = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: features
            }),
            style: (feature: ol.Feature, scale: number) => {
                let color = feature.get("color") || "white";
                return new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: 10,
                        stroke: new ol.style.Stroke({ color: "red", width: 1 }),
                        fill: new ol.style.Fill({ color: color })
                    })
                })
            }
        });
        map.addLayer(layer);

        let [a, b, c, d] = map.getView().calculateExtent([100, 100]);
        let geom = new ol.geom.LineString([[a, b], [c, d]]);
        let feature = new ol.Feature(geom);

        feature.setStyle(new ol.style.Style({
            stroke: new ol.style.Stroke({
                color: "white",
                width: 4
            }),
            fill: new ol.style.Fill({
                color: "white"
            })
        }));

        features.push(feature);

        {
            let points = [[a, b], [c, b], [c, d], [a, d]].map(p => new ol.Feature(new ol.geom.Point(p.map(v => v += 0.001))));
            points.forEach(p => p.set("color", "blue"));
            layer.getSource().addFeatures(points);
        }
        {
            let points = [[a, b], [c, b], [c, d], [a, d]].map(p => new ol.Feature(new ol.geom.Point(p.map(v => v *= 1.0001))));
            points.forEach(p => p.set("color", "green"));
            layer.getSource().addFeatures(points);
        }

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
            let coords = geom.getCoordinates();
            let vertex = coords.filter(p => p[0] === dropLocation[0])[0];
            console.log("vertex", coords.indexOf(vertex));
        });

        modify.on("modifystart", () => {
            console.log("modifystart");
        });

        modify.on("propertychange", () => {
            console.log("propertychange");
        });

    });

}