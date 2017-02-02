/**
 * See https://openlayers.org/en/latest/examples/vector-esri.html
 * Ultimately this will only query for features it does not already have
 * It will make use the map SRS and the resulttype="tile" and exceededTransferLimit
 * See https://github.com/ca0v/ol3-lab/issues/4
 */
import $ = require("jquery");
import ol = require("openlayers");

const esrijsonFormat = new ol.format.EsriJSON();

function asParam(options: any) {
    return Object
        .keys(options)
        .map(k => `${k}=${options[k]}`)
        .join("&");
}

export class ArcGisVectorSourceFactory {

    static create(options?: olx.source.VectorOptions & {
        url: string;
        map: ol.Map;
        layer: string;
        title: string;
        styleCache: { [name: string]: ol.style.Style };
    }) {

        let srs = options.map.getView().getProjection().getCode().split(":").pop();

        let strategy = ol.loadingstrategy.tile(ol.tilegrid.createXYZ({
            tileSize: 512
        }));

        let loader = (extent: ol.Extent, resolution: number, projection: ol.proj.Projection) => {
            let url = <string>options.url;
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

            url = `${url}/${layer}/query?${asParam(params)}`;

            $.ajax({
                url: url,
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
            source: source,
            style: (feature: ol.Feature) => {
                var classify = feature.get('activeprod');
                return options.styleCache[classify];
            }
        })


        return layer;
    }

}
