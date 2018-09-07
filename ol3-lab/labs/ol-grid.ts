import $ = require("jquery");
import ol = require("openlayers");
import { doif, getParameterByName } from "./common/common";
import { StyleConverter } from "ol3-symbolizer/ol3-symbolizer/format/ol3-symbolizer";
import pointStyle = require("ol3-symbolizer/examples/styles/star/flower");
import { Popup } from "ol3-popup/index";
import { Grid } from "ol3-grid/index";
import { MapMaker } from "./common/map-maker";

let styler = new StyleConverter();

function parse<T>(v: string, type: T): T {
    if (typeof type === "string") return <any>v;
    if (typeof type === "number") return <any>parseFloat(v);
    if (typeof type === "boolean") return <any>(v === "1" || v === "true");
    if (Array.isArray(type)) {
        return <any>v.split(",").map((v) => parse(v, (<any>type)[0]));
    }
    throw `unknown type: ${type}`;
}

function randomName() {
    const nouns = "cat,dog,bird,horse,pig,elephant,giraffe,tiger,bear,cow,chicken,moose".split(",");
    const adverbs = "running,walking,turning,jumping,hiding,pouncing,stomping,rutting,landing,floating,sinking".split(
        ","
    );
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

export function run() {
    $(html).appendTo(".map");
    $(css).appendTo("head");

    let options = {
        srs: "EPSG:4326",
        center: <[number, number]>[-82.4, 34.85],
        zoom: 15,
        basemap: "bing"
    };

    {
        let opts = <any>options;
        Object.keys(opts).forEach((k) => {
            doif(getParameterByName(k), (v) => {
                let value = parse(v, opts[k]);
                if (value !== undefined) opts[k] = value;
            });
        });
    }

    let map = MapMaker.create({
        target: document.getElementById("map"),
        projection: options.srs,
        center: options.center,
        zoom: options.zoom,
        basemap: "bing"
    });

    let features = new ol.Collection<ol.Feature>();

    let source = new ol.source.Vector({
        features: features
    });

    let layer = new ol.layer.Vector({
        source: source
    });

    map.addLayer(layer);

    let popup = Popup.create({
        map: map,
        dockContainer: $(".popup-container")[0],
        pointerPosition: 10,
        positioning: "bottom-left",
        offset: [0, 20],
        css: css_popup
    });
    popup.setMap(map);

    map.on("click", (event: Event & { coordinate: [number, number] }) => {
        let location = event.coordinate.map((v) => v.toFixed(5)).join(", ");
        let point = new ol.geom.Point(event.coordinate);
        point.set("location", location);
        let feature = new ol.Feature(point);
        feature.set("text", randomName());

        let textStyle = pointStyle.filter((p) => p.text)[0];
        if (textStyle && textStyle.text) {
            textStyle.text["offset-y"] = -24;
            textStyle.text.text = feature.get("text");
        }
        pointStyle[0].star.points = (3 + Math.random() * 12) | 0;
        pointStyle[0].star.stroke.width = 1 + Math.random() * 5;
        let style = pointStyle.map((s) => styler.fromJson(s));
        feature.setStyle(style);

        source.addFeature(feature);

        setTimeout(() => popup.show(event.coordinate, `<div>You clicked on ${location}</div>`), 50);
    });

    let grid = Grid.create({
        currentExtent: false,
        labelAttributeName: "text",
        map: map,
        layers: [layer]
    });

    Grid.create({
        map: map,
        className: "ol-grid",
        position: "top left-2",
        closedText: "+",
        openedText: "-",
        autoCollapse: false,
        showIcon: true,
        layers: [layer]
    });

    Grid.create({
        map: map,
        className: "ol-grid",
        position: "bottom left",
        currentExtent: true,
        hideButton: false,
        closedText: "+",
        openedText: "-",
        autoCollapse: true,
        canCollapse: true,
        showIcon: true,
        labelAttributeName: "",
        layers: [layer]
    });

    Grid.create({
        map: map,
        className: "ol-grid",
        position: "bottom right",
        hideButton: true,
        showIcon: true,
        labelAttributeName: "text",
        layers: [layer]
    });

    map.getControls()
        .getArray()
        .filter((c) => c instanceof Grid)
        .forEach((grid) =>
            grid.on("feature-click", (args: Event & { feature: ol.Feature }) => {
                let center = args.feature.getGeometry().getClosestPoint(map.getView().getCenter());
                map.getView().animate({
                    center: center
                });
                popup.show(center, args.feature.get("text"));
            })
        );

    return map;
}
