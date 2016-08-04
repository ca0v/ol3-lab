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
    let styles = name.split(",").map(style => `../ux/styles/${style}`);
    let d = $.Deferred<Serializer.Coretech.Style[]>();
    require(styles, (...styles: Serializer.Coretech.Style[][]) => {
        let style = <Serializer.Coretech.Style[]>[];
        styles.forEach(s => style = style.concat(s));
        d.resolve(style);
    });
    return d;
}

export function run() {

    let serializer = new Serializer.CoretechConverter();

    $(html).appendTo("body");
    $(css).appendTo("head");

    let canvas = <HTMLCanvasElement>document.getElementById("canvas");
    let feature = new ol.Feature(new ol.geom.MultiPolygon([polygonGeom]));

    let style = getParameterByName("style");
    if (style) {
        loadStyle(style).then(styles => {
            let style = styles.map(style => serializer.fromJson(style));
            feature.setStyle(style);
            Snapshot.render(canvas, feature);
            $(".style").val(JSON.stringify(styles, null, 2));
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

        console.log("style1", JSON.stringify(serializer.toJson(style1), null, '\t'));
        console.log("style2", JSON.stringify(serializer.toJson(style2), null, '\t'));
        feature.setStyle([style1, style2]);
        Snapshot.render(canvas, feature);
    }
}

