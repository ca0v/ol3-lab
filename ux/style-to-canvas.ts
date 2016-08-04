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

import parcel = require("../data/geom/parcel");

const html = `
<div class='style-to-canvas'>
    <h3>Renders a feature on a canvas</h3>
    <div class="area">
        <label>256 x 256 Canvas</label>
        <canvas id='canvas' width="256" height="256"></canvas>
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

    .style-to-canvas #canvas {
        font-family: sans serif;
        font-size: 20px;
        border: none;
        padding: 0;
        margin: 0;
    }
</style>
`;

/**
 * https://github.com/openlayers/ol3/issues/5684
 */
{
    ol.geom.SimpleGeometry.prototype.scale = ol.geom.SimpleGeometry.prototype.scale || function (deltaX, deltaY) {
        var flatCoordinates = this.getFlatCoordinates();
        if (flatCoordinates) {
            var stride = this.getStride();
            ol.geom.flat.transform.scale(
                flatCoordinates, 0, flatCoordinates.length, stride,
                deltaX, deltaY, flatCoordinates);
            this.changed();
        }
    }

    ol.geom.flat.transform.scale = ol.geom.flat.transform.scale ||
        function (flatCoordinates, offset, end, stride, deltaX, deltaY, opt_dest) {
            var dest = opt_dest ? opt_dest : [];
            var i = 0;
            var j, k;
            for (j = offset; j < end; j += stride) {
                dest[i++] = flatCoordinates[j] * deltaX;
                dest[i++] = flatCoordinates[j + 1] * deltaY;
                for (k = j + 2; k < j + stride; ++k) {
                    dest[i++] = flatCoordinates[k];
                }
            }
            if (opt_dest && dest.length != i) {
                dest.length = i;
            }
            return dest;
        };
}

class Snapshot {

    static render(canvas: HTMLCanvasElement, feature: ol.Feature) {
        feature = feature.clone();
        let geom = feature.getGeometry();
        let extent = geom.getExtent();

        let [dx, dy] = ol.extent.getCenter(extent);
        let scale = Math.min(canvas.width / ol.extent.getWidth(extent), canvas.height / ol.extent.getHeight(extent));

        geom.translate(-dx, -dy);
        geom.scale(scale, -scale);
        geom.translate(canvas.width / 2, canvas.height / 2);

        let vtx = ol.render.toContext(canvas.getContext("2d"));
        let styles = <ol.style.Style[]><any>feature.getStyleFunction()(0);
        if (!Array.isArray(styles)) styles = <any>[styles];
        styles.forEach(style => vtx.drawFeature(feature, style));
    }

    /**
     * convert features into data:image/png;base64;  
     */
    static snapshot(feature: ol.Feature) {
        let canvas = document.createElement("canvas");
        let geom = feature.getGeometry();
        this.render(canvas, feature);
        return canvas.toDataURL();
    }
}


export function run() {

    $(html).appendTo("body");
    $(css).appendTo("head");

    let font = `${$("#canvas").css("fontSize")} ${$("#canvas").css("fontFamily")}`;

    let style1 = new ol.style.Style({
        fill: new ol.style.Fill({
            color: "rgba(255, 0, 0, 0.5)"
        }),
        stroke: new ol.style.Stroke({
            width: 2,
            color: "blue"
        })
    });

    let style2 = new ol.style.Style({
        text: new ol.style.Text({
            text: "style-to-canvas",
            font: font,
            fill: new ol.style.Fill({
                color: "rgba(0, 0, 0, 1)"
            }),
            stroke: new ol.style.Stroke({
                width: 4,
                color: "rgba(255, 255, 255, 0.8)"
            })
        })
    })

    let canvas = <HTMLCanvasElement>document.getElementById("canvas");
    let feature = new ol.Feature(new ol.geom.Polygon(parcel));
    feature.setStyle([style1, style2]);

    Snapshot.render(canvas, feature);
} 