import $ = require("jquery");
import ol = require("openlayers");
import { doif, getParameterByName } from "./common/common";
import { StyleConverter } from "../alpha/format/ol3-symbolizer";
import pointStyle = require("../ux/styles/circle/alert");
import { Popup } from "../bower_components/ol3-popup/src/ol3-popup";

let styler = new StyleConverter();

function parse<T>(v: string, type: T): T {
    if (typeof type === "string") return <any>v;
    if (typeof type === "number") return <any>parseFloat(v);
    if (typeof type === "boolean") return <any>(v === "1" || v === "true");
    if (Array.isArray(type)) {
        return <any>(v.split(",").map(v => parse(v, (<any>type)[0])));
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
<style>
    html, body, .map {
        width: 100%;
        height: 100%;
        padding: 0;
        overflow: hidden;
        margin: 0;    
    }

    .popup-container {
        position: absolute;
        top: 20px;
        right: 20px;
        width: 300px;
        height: 200px;
        background: transparent;
        z-index: 1;
    }
</style>
`;

export function run() {

    $(html).appendTo(".map");
    $(css).appendTo("head");

    let options = {
        srs: 'EPSG:4326',
        center: <[number, number]>[-82.4, 34.85],
        zoom: 15,
        basemap: "bing"
    }

    {
        let opts = <any>options;
        Object.keys(opts).forEach(k => {
            doif(getParameterByName(k), v => {
                let value = parse(v, opts[k]);
                if (value !== undefined) opts[k] = value;
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
            })]
    });

    let features = new ol.Collection<ol.Feature>();

    let source = new ol.source.Vector({
        features: features
    });


    let layer = new ol.layer.Vector({
        source: source,
        style: (feature: ol.render.Feature, resolution: number) => {
            pointStyle[0].text.text = feature.getGeometry().get("location") || "unknown location";
            return pointStyle.map(s => styler.fromJson(s));
        }
    });

    map.addLayer(layer);

    let popup = new Popup({
        dockContainer: '.popup-container'
    });
    popup.setMap(map);

    map.on("click", (event: {
        coordinate: [number, number];
    }) => {
        popup.show(event.coordinate, `<div>You clicked on ${event.coordinate}</div>`);
        let point = new ol.geom.Point(event.coordinate);
        point.set("location", event.coordinate.join(","));
        let feature = new ol.Feature(point);
        source.addFeature(feature);
    });

    return map;

}