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

import Serializer = require("../ux/serializers/coretech");
import polygonGeom = require("../data/geom/polygon-with-holes");
import parcelGeom = require("../data/geom/parcel");
import pointGeom = require("../data/geom/point");

const html = `
<div class='style-to-canvas'>
    <h3>Renders a feature on a canvas</h3>
    <div class="area">
        <label>256 x 256 Canvas</label>
        <canvas id='canvas' width="256" height="256"></canvas>
    </div>
    <div class="area">
        <label>Style</label>
        <textarea class='style'></textarea>
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

    .style-to-canvas #canvas {
        font-family: sans serif;
        font-size: 20px;
        border: none;
        padding: 0;
        margin: 0;
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

function getParameterByName(name: string, url = window.location.href) {
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

function loadStyle(name: string) {
    type T = Serializer.Coretech.Style[];
    let mids = name.split(",").map(name => `../ux/styles/${name}`);
    let d = $.Deferred<T>();
    require(mids, (...styles: T[]) => {
        let style = <T>[];
        styles.forEach(s => style = style.concat(s));
        d.resolve(style);
    });
    return d;
}

function loadGeom(name: string) {
    type T = ol.geom.Geometry[];
    let mids = name.split(",").map(name => `../data/geom/${name}`);
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

export function run() {

    let serializer = new Serializer.CoretechConverter();

    $(html).appendTo("body");
    $(css).appendTo("head");

    let canvas = <HTMLCanvasElement>document.getElementById("canvas");
    let feature = new ol.Feature();
    feature.setGeometry(new ol.geom.MultiPolygon([polygonGeom]));

    let redraw = () => {
        let styles = <any[]>JSON.parse($(".style").val());
        let style = styles.map(style => serializer.fromJson(style));
        feature.setStyle(style);
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        Snapshot.render(canvas, feature);
    };

    setInterval(() => {
        try {
            redraw();
        } catch (ex) {
            // keep trying
        }
    }, 2500);

    let geom = getParameterByName("geom");
    if (geom) {
        loadGeom(geom).then(geoms => {
            feature.setGeometry(geoms[0]);
            redraw();
        });
    }

    let style = getParameterByName("style");
    if (style) {
        loadStyle(style).then(styles => {
            let style = styles.map(style => serializer.fromJson(style));
            $(".style").val(JSON.stringify(styles, null, 2));
            redraw();
        });
    } else {
        let font = `${$("#canvas").css("fontSize")} ${$("#canvas").css("fontFamily")}`;

        let style1 = serializer.fromJson({
            "fill": {
                "color": "rgba(255, 0, 0, 0.5)"
            },
            "stroke": {
                "color": "blue",
                "width": 2
            }
        });

        let style2 = serializer.fromJson({
            "text": {
                "fill": {
                    "color": "rgba(0, 0, 0, 1)"
                },
                "stroke": {
                    "color": "rgba(255, 255, 255, 0.8)",
                    "width": 4
                },
                "text": "style-to-canvas",
                "offset-x": 0,
                "offset-y": 0,
                "font": "20px 'sans serif'"
            }
        });

        let styles = [style1, style2];
        $(".style").val(JSON.stringify(styles.map(s => serializer.toJson(s)), null, 2));
        redraw();
    }

}

