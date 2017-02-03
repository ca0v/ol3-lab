import $ = require("jquery");
import ol = require("openlayers");
import { doif, getParameterByName } from "./common/common";
import { StyleConverter } from "../alpha/format/ol3-symbolizer";
import pointStyle = require("../ux/styles/star/flower");
import { LayerSwitcher } from "../bower_components/ol3-layerswitcher/src/ol3-layerswitcher";
import { ArcGisVectorSourceFactory } from "../alpha/arcgis-source";

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

export function run() {

    $(html).appendTo(".map");
    $(css).appendTo("head");

    let options = {
        srs: 'EPSG:4326',
        center: <[number, number]>[-97.4, 37.8],
        zoom: 10
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
            })]
    });

    let features = new ol.Collection<ol.Feature>();

    let source = new ol.source.Vector({
        features: features
    });


    let layer = new ol.layer.Vector({
        title: "Features",
        source: source,
        style: (feature: ol.render.Feature, resolution: number) => {
            let style = pointStyle.filter(p => p.text)[0];
            if (style) {
                style.text.text = feature.getGeometry().get("location") || "unknown location";
            }
            return pointStyle.map(s => styler.fromJson(s));
        }
    });

    map.on("click", (event: {
        coordinate: [number, number];
    }) => {
        let location = event.coordinate.map(v => v.toFixed(5)).join(", ");
        let point = new ol.geom.Point(event.coordinate);
        point.set("location", location);
        let feature = new ol.Feature(point);
        source.addFeature(feature);
    });

    ArcGisVectorSourceFactory.create({
        title: "Petro",
        tileSize: 256,
        map: map,
        services: "https://sampleserver3.arcgisonline.com/ArcGIS/rest/services",
        serviceName: "Petroleum/KSFields",
        layer: 0
    }).then(agsLayer => {
        
        map.addLayer(agsLayer);
        map.addLayer(layer);

        let layerSwitcher = new LayerSwitcher();
        layerSwitcher.setMap(map);

    });


    return map;

}