/**
 * See https://openlayers.org/en/latest/examples/vector-esri.html
 * Ultimately this will only query for features it does not already have
 * It will make use the map SRS and the resulttype="tile" and exceededTransferLimit
 * See https://github.com/ca0v/ol3-lab/issues/4
 */
import $ = require("jquery");
import ol = require("openlayers");
import AgsCatalog = require("../bower_components/ol3-layerswitcher/src/extras/ags-catalog");
import Symbolizer = require("./format/ags-symbolizer");

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
    layer: number;
    title: string;
    tileSize: number;
};

const DEFAULT_OPTIONS = {
    tileSize: 512
};

export class ArcGisVectorSourceFactory {

    static create(options: IOptions) {

        let d = $.Deferred<ol.layer.Vector>();

        options = $.extend(options, DEFAULT_OPTIONS);

        let srs = options.map.getView()
            .getProjection()
            .getCode()
            .split(":")
            .pop();

        let tileGrid = ol.tilegrid.createXYZ({
            tileSize: options.tileSize
        });

        let strategy = ol.loadingstrategy.tile(tileGrid);

        let loader = (extent: ol.Extent, resolution: number, projection: ol.proj.Projection) => {
            //let url = <string>options.url;
            let layer = options.layer;

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
                inSR: srs,
                outSR: srs,
                outFields: "*",
            }

            let query = `${options.services}/${options.serviceName}/FeatureServer/${layer}/query?${asParam(params)}`;

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

        let layer = new ol.layer.Vector({
            title: options.title,
            source: source
        })

        let catalog = new AgsCatalog.Catalog(`${options.services}/${options.serviceName}/FeatureServer`);
        let converter = new Symbolizer.StyleConverter();

        catalog.aboutLayer(options.layer).then(layerInfo => {

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
    }

}
