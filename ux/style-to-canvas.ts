/**
 * Give an feature and a style convert it to canvas
 * See polyline-encoder for how this was done without styling
 * See ol.renderer.vector.GEOMETRY_RENDERERS_ for how it is done with styling
 * See ol.renderer.vector.renderPolygonGeometry_
 * See ol.render.canvas.Immediate.prototype.setFillStrokeStyle
 */

import ol = require("openlayers");
import $ = require("jquery");

import ags_simplefillsymbol = require("./styles/ags/simplefillsymbol");
import ags_serializer = require("./serializers/ags-simplefillsymbol");
import parcel = require("./geom/parcel");

const identity = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];

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

/**
 * @param {ol.Coordinate} center Center.
 * @param {number} resolution Resolution.
 * @param {number} pixelRatio Pixel ratio.
 * @param {ol.Size} size Size.
 * @return {!goog.vec.Mat4.Number} Transform.
 * @private
 */
let getTransform = (center: ol.Coordinate, resolution: number, pixelRatio: number, size: ol.Size) => {
    let Mat4 = ol.vec.Mat4;

    return Mat4.makeTransform2D(identity,
        size[0] / 2, size[1] / 2,
        pixelRatio / resolution, -pixelRatio / resolution,
        0,
        -center[0], -center[1]);
};

/**
 * @param {CanvasRenderingContext2D} context Context.
 * @param {number} pixelRatio Pixel ratio.
 * @param {ol.Extent} extent Extent.
 * @param {goog.vec.Mat4.Number} transform Transform.
 * @param {number} viewRotation View rotation.
 */
function createImmediate(
    context: CanvasRenderingContext2D,
    pixelRatio: number,
    extent: ol.Extent,
    transform: any,
    viewRotation: number) {
    let result = new ol.render.canvas.Immediate(context, pixelRatio, extent, transform, viewRotation);
    return <{
        drawFeature(feature: ol.Feature, style: ol.style.Style);
        drawGeometry(geom: ol.geom.Geometry);
    }>result;
}

export function run() {

    $(html).appendTo("body");
    $(css).appendTo("head");

    let converter = new ags_serializer.SimpleFillConverter();
    let style = converter.fromJson(ags_simplefillsymbol[0]);

    style = style || new ol.style.Style({
        fill: new ol.style.Fill({
            color: "red"
        })
    });

    let coordinates = parcel;
    let geom = new ol.geom.Polygon([coordinates]);
    let extent = geom.getExtent();
    let center = ol.extent.getCenter(extent);

    let feature = new ol.Feature({
        geometry: geom,
        style: style
    });

    // now utilize the style information to render the feature to a canvas
    // without using a layer

    let canvas = <HTMLCanvasElement>document.getElementById("canvas");

    let ctx = canvas.getContext("2d");

    let Mat4 = ol.vec.Mat4;

    console.log("Mat4", Mat4);

    let scale = Math.min(canvas.width / ol.extent.getWidth(extent), canvas.height / ol.extent.getHeight(extent));
    console.log("scale", scale);

    let transform = Mat4.makeTransform2D(identity,
        canvas.width / 2, canvas.height / 2, // translate to origin
        scale, -scale, //scale
        0, // rotation
        -center[0], -center[1] // translate back
    );
    console.log("transform", transform);

    let renderer = createImmediate(ctx, 1, extent, transform, 1);
    renderer.drawFeature(feature, style);
} 