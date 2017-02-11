/**
 * See https://openlayers.org/en/latest/examples/vector-esri.html
 * Ultimately this will only query for features it does not already have
 * It will make use the map SRS and the resulttype="tile" and exceededTransferLimit
 * See https://github.com/ca0v/ol3-lab/issues/4
 */

/**
 * There are several similarly incomplete solutions
 * See ux/serializer/ags-simplefillsymbol and ags-simplemarkersymbol as two examples
 * It is also in the ol3-layerswitcher project under extras/ags-webmap
 * This is in the "alpha" folder because I want it to become a stand-alone solutions
 * for rendering ArcGIS FeatureServer content in openlayers
 * 
 * It couples with a style readi
 */
import $ = require("jquery");
import ol = require("openlayers");

import AgsCatalog = require("ol3-symbolizer/ol3-symbolizer/ags/ags-catalog");
import Symbolizer = require("ol3-symbolizer/ol3-symbolizer/format/ags-symbolizer");

const esrijsonFormat = new ol.format.EsriJSON();

function asParam(options: any) {
    return Object
        .keys(options)
        .map(k => `${k}=${options[k]}`)
        .join("&");
}

export interface IOptions extends olx.source.VectorOptions {
    services: string;
    serviceName: string;
    map: ol.Map;
    layers: number[];
    tileSize: number;
};

const DEFAULT_OPTIONS = {
    tileSize: 512
};

export class ArcGisVectorSourceFactory {

    static create(options: IOptions) {

        let d = $.Deferred<ol.layer.Vector[]>();

        options = $.extend(options, DEFAULT_OPTIONS);

        let srs = options.map.getView()
            .getProjection()
            .getCode()
            .split(":")
            .pop();


        let all = options.layers.map(layerId => {

            let d = $.Deferred<ol.layer.Vector>();

            let tileGrid = ol.tilegrid.createXYZ({
                tileSize: options.tileSize
            });

            let strategy = ol.loadingstrategy.tile(tileGrid);

            let loader = (extent: ol.Extent, resolution: number, projection: ol.proj.Projection) => {

                let box = {
                    xmin: extent[0],
                    ymin: extent[1],
                    xmax: extent[2],
                    ymax: extent[3]
                };

                let params = {
                    f: "json",
                    returnGeometry: true,
                    spatialRel: "esriSpatialRelIntersects",
                    geometry: encodeURIComponent(JSON.stringify(box)),
                    geometryType: "esriGeometryEnvelope",
                    resultType: "tile",
                    inSR: srs,
                    outSR: srs,
                    outFields: "*",
                }

                let query = `${options.services}/${options.serviceName}/FeatureServer/${layerId}/query?${asParam(params)}`;

                $.ajax({
                    url: query,
                    dataType: 'jsonp',
                    success: response => {
                        if (response.error) {
                            alert(response.error.message + '\n' +
                                response.error.details.join('\n'));
                        } else {
                            // dataProjection will be read from document
                            var features = esrijsonFormat.readFeatures(response, {
                                featureProjection: projection,
                                dataProjection: projection
                            });
                            if (features.length > 0) {
                                source.addFeatures(features);
                            }
                        }
                    }
                });
            };

            let source = new ol.source.Vector({
                strategy: strategy,
                loader: loader
            });

            let catalog = new AgsCatalog.Catalog(`${options.services}/${options.serviceName}/FeatureServer`);
            let converter = new Symbolizer.StyleConverter();

            catalog.aboutLayer(layerId).then(layerInfo => {
                
                let layer = new ol.layer.Vector({
                    title: layerInfo.name,
                    source: source
                })

                let styleMap = converter.fromRenderer(<any>layerInfo.drawingInfo.renderer, { url: "for icons?" });
                layer.setStyle((feature: ol.Feature, resolution: number) => {
                    if (styleMap instanceof ol.style.Style) {
                        return styleMap;
                    } else {
                        return styleMap(feature);
                    }
                });

                d.resolve(layer);
            });

            return d;
        });

        $.when.apply($, all).then((...args: Array<ol.layer.Vector>) => d.resolve(args));

        return d;
    }

}
