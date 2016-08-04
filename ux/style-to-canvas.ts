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

import parcel = require("./geom/parcel");

const html = `
<div class='style-to-canvas'>
    <canvas id='canvas'></canvas>
</div>
`;

const css = `
<style>
    #map {
        display: none;
    }

    .style-to-canvas #canvas {
        border: 1px solid black;
        padding: 20px;
        width: 400px;
        height: 400px;
        overflow: auto;
    }
</style>
`;

function translate(points: number[][], vector: number[]) {
    return points.map(p => vector.map((v, i) => v + p[i]));
}

function rotate(points: number[][], a: number) {
    return points.map(p => {
        let [x, y, cos, sin] = [p[0], p[1], Math.cos(a), Math.sin(a)];
        return [
            x * cos - y * sin,
            x * sin + y * cos
        ];
    });
}

function scale(points: number[][], vector: number[]) {
    return points.map(p => vector.map((v, i) => v * p[i]));
}

function render(canvas: HTMLCanvasElement, line: ol.Coordinate[], style: ol.style.Style) {
    let extent = ol.extent.boundingExtent(line);
    let [dx, dy] = ol.extent.getCenter(extent);
    let [sx, sy] = [canvas.width / ol.extent.getWidth(extent), canvas.height / ol.extent.getHeight(extent)];
    line = translate(line, [-dx, -dy]);
    line = scale(line, [Math.min(sx, sy), -Math.min(sx, sy)]);
    line = translate(line, [canvas.width / 2, canvas.height / 2]);

    let feature = new ol.Feature({
        geometry: new ol.geom.Polygon([line]),
        style: style
    });

    let vtx = ol.render.toContext(canvas.getContext("2d"));
    vtx.drawFeature(feature, style);
}

export function run() {

    $(html).appendTo("body");
    $(css).appendTo("head");

    let style = new ol.style.Style({
        fill: new ol.style.Fill({
            color: "red"
        }),
        stroke: new ol.style.Stroke({
            width: 1,
            color: "blue"
        })
    });

    let canvas = <HTMLCanvasElement>document.getElementById("canvas");
    render(canvas, parcel, style);
} 