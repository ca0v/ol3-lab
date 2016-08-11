/**
 * Give an feature and a style convert it to canvas
 * See polyline-encoder for how this was done without styling
 * See ol.renderer.vector.GEOMETRY_RENDERERS_ for how it is done with styling
 * See ol.renderer.vector.renderPolygonGeometry_
 * See ol.render.canvas.Immediate.prototype.setFillStrokeStyle
 * Good Grief!
 * http://openlayers.org/en/latest/examples/render-geometry.html
 */

import ol = require("openlayers");
import $ = require("jquery");
import Snapshot = require("./common/snapshot");
import {getParameterByName} from "./common/common";
import Serializer = require("../ux/serializers/coretech");
import polygonGeom = require("../tests/data/geom/polygon");
import pointStyle = require("../ux/styles/icon/png");

const html = `
<div class='style-to-canvas'>
    <h3>Renders a feature on a canvas</h3>
    <div class="area">
        <label>256 x 256 Canvas</label>
        <div id='canvas-collection'></div>
    </div>
    <div class="area">
        <label>Style</label>
        <textarea class='style'></textarea>
        <button class="save">Save</button>
    </div>
    <div class="area">
        <label>Potential control for setting linear gradient start/stop locations</label>
        <div class="colorramp">
            <input class="top" type="range" min="0" max="100" value="20"/>
            <input class="bottom" type="range" min="0" max="100" value="80"/>
        </div>
    </div>
</div>
`;

const css = `
<style>
    #map {
        display: none;
    }

    .style-to-canvas {
    }

    .style-to-canvas .area label {
        display: block;
        vertical-align: top;
    }

    .style-to-canvas .area {
        border: 1px solid black;
        padding: 20px;
        margin: 20px;
    }

    .style-to-canvas .area .style {
        width: 100%;
        height: 400px;
    }

    .style-to-canvas #canvas-collection canvas {
        font-family: sans serif;
        font-size: 20px;
        border: 1px solid black;
        padding: 20px;
        margin: 20px;
    }

    div.colorramp {
        display: inline-block;
        background: linear-gradient(to right, rgba(250,0,0,0), rgba(250,0,0,1) 60%, rgba(250,100,0,1) 85%, rgb(250,250,0) 95%);
        width:100%;
    }

    div.colorramp > input[type=range] {
        -webkit-appearance: slider-horizontal;
        display:block;
        width:100%;
        background-color:transparent;
    }

    div.colorramp > label {
        display: inline-block;
    }

    div.colorramp > input[type='range'] {
        box-shadow: 0 0 0 white;
    }

    div.colorramp > input[type=range]::-webkit-slider-runnable-track {
        height: 0px;     
    }

    div.colorramp > input[type='range'].top::-webkit-slider-thumb {
        margin-top: -10px;
    }

    div.colorramp > input[type='range'].bottom::-webkit-slider-thumb {
        margin-top: -12px;
    }
    
</style>
`;

const svg = `
<div style='display:none'>
<svg xmlns="http://www.w3.org/2000/svg">
<symbol viewBox="0 0 17.7 22.1" id="lock">
    <title>lock</title>
    <path d="M15.7,10c-0.3,0-0.4,0-0.4,0V6.5c0-4.2-2.9-6.5-6.4-6.5C5.4,0,2.2,2.4,2.3,6.5l0,3.5c0,0,0.1,0-0.2,0 C1.8,10,0,10.3,0,12v7.9c0,1.8,2.1,2.2,2.1,2.2c3.7,0,9.8,0,13.5,0c0,0,2-0.2,2-2.2v-7.8C17.7,10.2,15.8,10,15.7,10z M10.4,19H7.3 l0.7-3.2c-0.5-0.3-0.8-0.9-0.8-1.5c0-1,0.8-1.8,1.7-1.8c0.9,0,1.7,0.8,1.7,1.8c0,0.6-0.3,1.2-0.8,1.5L10.4,19z M5.3,10l0-3.4 c0-2.2,1.3-4,3.5-4c2.2,0,3.5,1.5,3.5,4l0,3.4H5.3z"
    />
</symbol>
</svg>
</div>
`;

function loadStyle(name: string) {
    type T = Serializer.Coretech.Style[];
    let d = $.Deferred<T>();

    if ('[' === name[0]) {
        d.resolve(JSON.parse(name));
    } else {
        let mids = name.split(",").map(name => `../ux/styles/${name}`);
        require(mids, (...styles: T[]) => {
            let style = <T>[];
            styles.forEach(s => style = style.concat(s));
            d.resolve(style);
        });

    }
    return d;
}

function loadGeom(name: string) {
    type T = ol.geom.Geometry[];
    let mids = name.split(",").map(name => `../tests/data/geom/${name}`);
    let d = $.Deferred<T>();
    require(mids, (...shapes: any[]) => {
        let geoms = shapes.map(shape => {
            if (typeof shape[0] === "number") {
                return new ol.geom.Point(shape);
            }
            if (typeof shape[0][0] === "number") {
                return new ol.geom.LineString(shape);
            }
            if (typeof shape[0][0][0] === "number") {
                return new ol.geom.Polygon(shape);
            }
            if (typeof shape[0][0][0][0] === "number") {
                return new ol.geom.MultiPolygon(shape);
            }
            throw `invalid shape: ${shape}`;
        });
        d.resolve(geoms);
    });
    return d;
}

const geoms = {
    point: new ol.geom.Point(polygonGeom[0][0]),
    multipoint: new ol.geom.MultiPoint(polygonGeom[0]),
    line: new ol.geom.LineString(polygonGeom[0]),
    multiline: new ol.geom.MultiLineString(polygonGeom),
    polygon: new ol.geom.Polygon(polygonGeom),
    multipolygon: new ol.geom.MultiPolygon([polygonGeom]),
};

const styles = {
    point: pointStyle
};

const serializer = new Serializer.CoretechConverter();

class Renderer {

    canvas: HTMLCanvasElement;
    feature: ol.Feature;

    constructor(geom: ol.geom.Geometry) {
        this.feature = new ol.Feature(geom);
        this.canvas = this.createCanvas();
    }

    private createCanvas(size = 256) {
        let canvas = document.createElement("canvas");
        canvas.width = canvas.height = size;
        return canvas;
    }

    draw(styles: Serializer.Coretech.Style[]) {
        let canvas = this.canvas;
        let feature = this.feature;
        let style = styles.map(style => serializer.fromJson(style));
        feature.setStyle(style);
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        Snapshot.render(canvas, feature);
    }

}

export function run() {

    $(html).appendTo("body");
    $(svg).appendTo("body");
    $(css).appendTo("head");

    let geom = getParameterByName("geom") || "polygon-with-holes";
    let style = getParameterByName("style") || "fill/gradient";

    $(".save").click(() => {
        let style = JSON.stringify(JSON.parse($(".style").val()));
        let loc = window.location;
        let url = `${loc.origin}${loc.pathname}?run=labs/style-viewer&style=${encodeURI(style)}&geom=${geom}`;
        loc.replace(url); // replace will not save history, assign will save history
    });

    loadStyle(style).then(styles => {
        loadGeom(geom).then(geoms => {
            let style = JSON.stringify(styles, null, ' ');
            $(".style").val(style);

            let renderers = geoms.map(g => new Renderer(g));
            renderers.forEach(r => $(r.canvas).appendTo("#canvas-collection"));

            setInterval(() => {
                try {
                    let style = JSON.parse($(".style").val());
                    renderers.forEach(r => r.draw(style));
                } catch (ex) {
                    // invalid json, try later
                }
            }, 2000);

        });
    });


}

