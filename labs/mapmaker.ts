import $ = require("jquery");
import ol = require("openlayers");
import {doif, getParameterByName, mixin} from "./common/common";
import reduce = require("./common/ol3-polyline");
import {StyleConverter} from "../alpha/format/ol3-symbolizer";
import dashdotdot = require("../ux/styles/stroke/dashdotdot");
import strokeStyle = require("../ux/styles/stroke/solid");
import textStyle = require("../ux/styles/text/text");

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

let html = `
<div class='mapmaker'>
    <div class='toolbar'>
        <button class='share'>Share</button>
        <button class='clone'>Add</button>
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
    button.clone {
        display:none;
    }
</style>
`;

export function run() {

    $(html).appendTo(".map");
    $(css).appendTo("head");

    let options = {
        srs: 'EPSG:4326',
        center: [-82.4, 34.85],
        zoom: 15,
        background: "bright",
        geom: "",//t`syzE}gm_dAm_@A?r@p@Bp@Hp@Ph@Td@Z`@`@Vb@Nd@xUABmF",
        color: "red",
        modify: false,
        basemap: "bing"
    }

    {
        let opts = <any>options;
        Object.keys(opts).forEach(k => {
            doif(getParameterByName(k), v => opts[k] = parse(v, opts[k]));
        });
    }


    $(".map").addClass(options.background);



    let map = new ol.Map({
        target: "map",
        keyboardEventTarget: document,
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        controls: ol.control.defaults({attribution: false}),
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
            let geom: ol.geom.Polygon;
            let points = new reduce(6, 2).decode(encoded);
            geom = new ol.geom.Polygon([points]);
            let feature = new ol.Feature(geom);
            textStyle[0].text.text = `${i + 1}`;
            let style = textStyle.concat(<any>strokeStyle).map(s => styler.fromJson(s)); 
            feature.setStyle(style);
            features.push(feature);
        });

        if (!getParameterByName("center")) {
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
                let geom = <ol.geom.Polygon>(feature && feature.getGeometry());
                let points = geom.getCoordinates()[0];
                return new reduce(6, 2).encode(points);
            }).join(",");
        }

        let opts = <any>options;
        let querystring = Object.keys(options).map(k => `${k}=${opts[k]}`).join("&");

        let url = encodeURI(`${href}?run=labs/mapmaker&${querystring}`);
        window.open(url, "_blank");
    });

    return map;

}