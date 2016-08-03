
declare var goog;

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
        width: 800px;
        height: 800px;
        overflow: auto;
    }
</style>
`;

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

/**
 * @param {!goog.vec.Mat4.Number} mat Matrix.
 * @param {number} translateX1 Translate X1.
 * @param {number} translateY1 Translate Y1.
 * @param {number} scaleX Scale X.
 * @param {number} scaleY Scale Y.
 * @param {number} rotation Rotation.
 * @param {number} translateX2 Translate X2.
 * @param {number} translateY2 Translate Y2.
 * @return {!goog.vec.Mat4.Number} Matrix.
 */
let makeTransform2D = (mat: any, translateX1: number, translateY1: number,
    scaleX: number, scaleY: number, rotation: number, translateX2: number, translateY2: number) => {
    
    goog.vec.Mat4.makeIdentity(mat);
    
  if (translateX1 !== 0 || translateY1 !== 0) {
    goog.vec.Mat4.translate(mat, translateX1, translateY1, 0);
    }
    
  if (scaleX != 1 || scaleY != 1) {
    goog.vec.Mat4.scale(mat, scaleX, scaleY, 1);
  }
    
  if (rotation !== 0) {
    goog.vec.Mat4.rotateZ(mat, rotation);
  }
    
  if (translateX2 !== 0 || translateY2 !== 0) {
    goog.vec.Mat4.translate(mat, translateX2, translateY2, 0);
  }
    
  return mat;
};

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
    let center = ol.extent.getTopLeft(extent);

    let feature = new ol.Feature({
        geometry: geom,
        style: style
    });

    // now utilize the style information to render the feature to a canvas
    // without using a layer

    let canvas = <HTMLCanvasElement>document.getElementById("canvas");

    let ctx = canvas.getContext("2d");

    let mat4 = goog.vec.Mat4;
    console.log("goog.vec.Mat4", mat4);

    let transform = makeTransform2D(mat4.createIdentity(),
        0, 0, // translate to origin
        500000, -500000, //scale
        0, // rotation
        -center[0], -center[1] // translate back
    );    
    console.log("makeTransform2D", transform);

    console.log(parcel.map(p => mat4.multVec4(transform, [p[0], p[1], 0, 1], [])));
    
    let renderer = createImmediate(ctx, 1, extent, transform, 1);
    renderer.drawFeature(feature, style);
} 