import ol = require("openlayers");
import { Popup } from "ol3-popup/index";
import { ArcGisVectorSourceFactory } from "ol3-symbolizer/ol3-symbolizer/ags/ags-source";
import { doif, getParameterByName, html as asHtml } from "ol3-fun/ol3-fun/common";
import { LayerTileOptions } from "ol3-layerswitcher/ol3-layerswitcher/@types/LayerTileOptions";

function parse<T>(v: string, type: T): T {
    if (typeof type === "string") return <any>v;
    if (typeof type === "number") return <any>parseFloat(v);
    if (typeof type === "boolean") return <any>(v === "1" || v === "true");
    if (Array.isArray(type)) {
        return <any>v.split(",").map((v) => parse(v, (<any>type)[0]));
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
<style name="ol-symbolizer" type="text/css">
    html, body, .map {
        width: 100%;
        height: 100%;
        padding: 0;
        overflow: hidden;
        margin: 0;    
    }
</style>
`;

let center = {
    fire: [-117.754430386, 34.2606862490001],
    wichita: [-97.4, 37.8],
    vegas: [-115.235, 36.173]
};

export function run() {
    let target = document.getElementsByClassName("map")[0];
    target.appendChild(asHtml(html));
    document.head.appendChild(asHtml(css));

    let options = {
        srs: "EPSG:4326",
        center: <[number, number]>center.vegas,
        zoom: 10,
        services: "//sampleserver3.arcgisonline.com/ArcGIS/rest/services",
        serviceName: "SanFrancisco/311Incidents",
        where: "1=1",
        filter: <{ [name: string]: any }>{},
        layers: [0]
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
            new ol.layer.Tile(<LayerTileOptions>{
                title: "OSM",
                type: "base",
                opacity: 0.8,
                visible: true,
                source: new ol.source.OSM()
            })
        ]
    });

    ArcGisVectorSourceFactory.create({
        tileSize: 256,
        map: map,
        services: options.services,
        serviceName: options.serviceName,
        serviceType: "FeatureServer",
        where: options.where,
        layers: options.layers.reverse()
    }).then((agsLayers) => {
        agsLayers.forEach((agsLayer) => map.addLayer(agsLayer));

        let popup = Popup.create({
            map: map,
            pointerPosition: 0,
            css: `
            .ol-popup-element {
                height: 6em;
                width: 12em;
                margin: 1em;
                padding: 1em;
                background-color: white;
            }
            .ol-popup .page {
                overflow-y: auto;
            }
            `
        });

        map.on("click", (event: Event & { coordinate: any; pixel: any }) => {
            console.log("click");
            let coord = event.coordinate;
            popup.hide();

            let pageNum = 0;
            map.forEachFeatureAtPixel(event.pixel, (feature: ol.Feature, layer) => {
                let page = document.createElement("p");
                let keys = Object.keys(feature.getProperties()).filter((key) => {
                    let v = feature.get(key);
                    if (typeof v === "string") return true;
                    if (typeof v === "number") return true;
                    return false;
                });
                page.title = "" + ++pageNum;
                page.innerHTML = `<table>${keys
                    .map((k) => `<tr><td>${k}</td><td>${feature.get(k)}</td></tr>`)
                    .join("")}</table>`;
                popup.pages.add(page, feature.getGeometry());
            });

            popup.show(coord, `<label>${pageNum} Features Found</label>`);
            popup.pages.goto(0);
        });
    });

    return map;
}
