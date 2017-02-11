import $ = require("jquery");
import ol = require("openlayers");
import { doif, getParameterByName } from "./common/common";
import { StyleConverter } from "ol3-symbolizer/ol3-symbolizer";
import pointStyle = require("ol3-symbolizer/ol3-symbolizer/styles/star/flower");
import { LayerSwitcher } from "ol3-layerswitcher/ol3-layerswitcher";
import { Popup } from "ol3-popup/ol3-popup";
import { ArcGisVectorSourceFactory } from "ol3-symbolizer/ol3-symbolizer/ags/ags-source";

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

let center = {
    fire: [-117.754430386, 34.2606862490001],
    wichita: [-97.4, 37.8],
    vegas: [-115.235, 36.173]
}

export function run() {

    $(html).appendTo(".map");
    $(css).appendTo("head");

    let options = {
        srs: 'EPSG:4326',
        center: <[number, number]>center.vegas,
        zoom: 10,
        services: "http://sampleserver3.arcgisonline.com/ArcGIS/rest/services",
        serviceName: "SanFrancisco/311Incidents",
        layers: [0]
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

    ArcGisVectorSourceFactory.create({
        tileSize: 256,
        map: map,
        services: options.services,
        serviceName: options.serviceName,
        layers: options.layers.reverse()
    }).then(agsLayers => {

        agsLayers.forEach(agsLayer => map.addLayer(agsLayer));

        let layerSwitcher = new LayerSwitcher();
        layerSwitcher.setMap(map);

        let popup = new Popup({
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

        map.on("click", (event: { coordinate: any; pixel: any }) => {
            console.log("click");
            let coord = event.coordinate;
            popup.hide();

            let pageNum = 0;
            map.forEachFeatureAtPixel(event.pixel, (feature: ol.Feature, layer) => {
                let page = document.createElement('p');
                let keys = Object.keys(feature.getProperties()).filter(key => {
                    let v = feature.get(key);
                    if (typeof v === "string") return true;
                    if (typeof v === "number") return true;
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