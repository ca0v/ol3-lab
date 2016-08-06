import $ = require("jquery");
import ol = require("openlayers");
import {doif, getParameterByName, mixin} from "./common/common";
import reduce = require("./common/ol3-polyline");
import styler = require("../ux/serializers/coretech");
import stroke = require("../ux/styles/stroke/dashdotdot");

function parse<T>(v: string, type: T): T {
    if (typeof type === "string") return <any>v;
    if (typeof type === "number") return <any>parseFloat(v);
    if (Array.isArray(type)) {
        return <any>(v.split(",").map(v => parse(v, (<any>type)[0])));
    }
    throw `unknown type: ${type}`;
}

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
</style>
`;

export function run() {

    $(css).appendTo("head");

    let options = {
        projection: 'EPSG:4326',
        center: [-82.4, 34.85],
        zoom: 15,
        background: "bright",
        geom: "",//t`syzE}gm_dAm_@A?r@p@Bp@Hp@Ph@Td@Z`@`@Vb@Nd@xUABmF",
        color: "red"
    }

    {
        let opts = <any>options;
        Object.keys(opts).forEach(k => {
            doif(getParameterByName(k), v => opts[k] = parse(v, opts[k]));
        });        
        console.log("querystring", Object.keys(opts).map(k => `${k}=${opts[k]}`).join("&"));
    }


    $(".map").addClass(options.background);

    let map = new ol.Map({
        target: "map",
        keyboardEventTarget: document,
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        view: new ol.View({
            projection: options.projection,
            center: options.center,
            zoom: options.zoom
        }),
        layers: [
            new ol.layer.Tile({
                opacity: 0.8,
                source: new ol.source.OSM()
            })]
    });

    if (options.geom) {
        let layer = new ol.layer.Vector({
            source: new ol.source.Vector()
        });
        map.addLayer(layer);

        if (options.color) {
            debugger;
            stroke[0].stroke.color = options.color;
            let style = new styler.CoretechConverter().fromJson(stroke[0]);
            layer.setStyle(style);
        }

        let points = new reduce(6, 2).decode(options.geom);
        let geom = new ol.geom.Polygon([points]);
        let feature = new ol.Feature(geom);
        layer.getSource().addFeature(feature);

        map.getView().fit(geom, map.getSize());

    }
    return map;
}