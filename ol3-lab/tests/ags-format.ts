/// <reference path="../typings/index.d.ts" />
import Point = require("esri/geometry/Point"); // global typings
import Polyline = require("esri/geometry/Polyline"); // global typings
import Polygon = require("esri/geometry/Polygon"); // global typings
import MultiPoint = require("esri/geometry/Multipoint"); // global typings
import EsriGraphic = require("esri/graphic"); // global typings
import ol = require("openlayers");

interface EsriJSONObject extends EsriGraphic {
    geometry: (Point | Polyline | Polygon | MultiPoint);
}

type ProjectionLike = ol.proj.Projection | string;
type Source = EsriJSONObject | Document | Node | Object | string;

type Options = {
    dataProjection: ProjectionLike;
    featureProjection: ProjectionLike;
};

type WriteOptions = Options & {
    rightHanded: boolean;
    decimals: number;
};

interface EsriJSON extends ol.format.Feature {
    readFeature(source: Source, options?: Options): ol.Feature;
    readFeatures(source: Source, options?: Options): ol.Feature[];
    readGeometry(source: Source, options?: Options): ol.geom.Geometry;
    readProjection(source: Source): ol.proj.Projection;

    writeFeature(feature: ol.Feature, options?: WriteOptions): string;
    writeFeatureObject(feature: ol.Feature, options?: Options): EsriJSONObject;
    writeFeatures(features: ol.Feature[], options?: WriteOptions): string;
    writeFeaturesObject(features: ol.Feature[], options?: WriteOptions): EsriJSONObject;
    writeGeometry(geometry: ol.geom.Geometry, options?: WriteOptions): string;
    writeGeometryObject(geometry: ol.geom.Geometry, options?: WriteOptions): EsriJSONObject;
}

export function run() {
    let formatter = <EsriJSON>(new ol.format.EsriJSON());
    let olFeature = new ol.Feature(new ol.geom.Point([0, 0]));
    let esriFeature = formatter.writeFeatureObject(olFeature);
    olFeature = formatter.readFeature(esriFeature);
    console.log("esriFeature", esriFeature);
    {
        let geom = <Point>esriFeature.geometry;
        console.assert(geom.x === 0);
        console.assert(geom.y === 0);
    }

    olFeature.setGeometry(new ol.geom.LineString([[0, 0], [0, 0]]));
    esriFeature = formatter.writeFeatureObject(olFeature);
    olFeature = formatter.readFeature(esriFeature);
    console.log("esriFeature", esriFeature);
    {
        let geom = <Polyline>esriFeature.geometry;
        console.assert(geom.paths[0][0][0] === 0);
    }

    olFeature.setGeometry(new ol.geom.MultiLineString([[[0, 0], [0, 0]],[[0, 0], [0, 0]]]));
    esriFeature = formatter.writeFeatureObject(olFeature);
    olFeature = formatter.readFeature(esriFeature);
    console.log("esriFeature", esriFeature);
    {
        let geom = <Polyline>esriFeature.geometry;
        console.assert(geom.paths[0][0][0] === 0);
    }

    olFeature.setGeometry(new ol.geom.Polygon([[[0, 0], [0, 0]]]));
    esriFeature = formatter.writeFeatureObject(olFeature);
    olFeature = formatter.readFeature(esriFeature);
    console.log("esriFeature", esriFeature);
    {
        let geom = <Polygon>esriFeature.geometry;
        console.assert(geom.rings[0][0][0] === 0);
    }

    olFeature.setGeometry(new ol.geom.MultiPolygon([[[[0, 0], [0, 0]]], [[[0, 0], [0, 0]]]]));
    esriFeature = formatter.writeFeatureObject(olFeature);
    olFeature = formatter.readFeature(esriFeature);
    console.log("esriFeature", esriFeature);
    {
        let geom = <Polygon>esriFeature.geometry;
        console.assert(geom.rings[0][0][0] === 0);
    }

    olFeature.setGeometry(new ol.geom.MultiPoint([[0, 0], [0, 0]]));
    esriFeature = formatter.writeFeatureObject(olFeature);
    olFeature = formatter.readFeature(esriFeature);
    console.log("esriFeature", esriFeature);
    {
        let geom = <MultiPoint>esriFeature.geometry;
        console.assert(geom.points[0][0] === 0);
    }

    olFeature.setProperties({foo: "bar"});
    esriFeature = formatter.writeFeatureObject(olFeature);
    olFeature = formatter.readFeature(esriFeature);
    console.log("esriFeature", esriFeature);
    {
        console.assert(olFeature.get("foo") === "bar");
    }
} 