import ol = require("openlayers");
import $ = require("jquery");

import { Grid } from "ol3-grid";
import { StyleConverter } from "ol3-symbolizer";
import { Input } from "ol3-input";
import { OpenStreet } from "ol3-input/ol3-input/providers/osm";
import { cssin } from "ol3-fun/ol3-fun/common";
import { ArcGisVectorSourceFactory } from "ol3-symbolizer/ol3-symbolizer/ags/ags-source";

function zoomToFeature(map: ol.Map, feature: ol.Feature) {
    let extent = feature.getGeometry().getExtent();
    map.getView().animate({
        center: ol.extent.getCenter(extent),
        duration: 2500
    });
    let w1 = ol.extent.getWidth(map.getView().calculateExtent(map.getSize()));
    let w2 = ol.extent.getWidth(extent);

    map.getView().animate({
        zoom: map.getView().getZoom() + Math.round(Math.log(w1 / w2) / Math.log(2)) - 1,
        duration: 2500
    });

}

export function run() {

    cssin("examples/ol3-input", `
.ol-grid .ol-grid-container.ol-hidden {
}

.ol-grid .ol-grid-container {
    width: 15em;
}

.ol-input.top.right > input {
    width: 18em;
}

.ol-grid-table {
    width: 100%;
}

table.ol-grid-table {
    border-collapse: collapse;
    width: 100%;
}

table.ol-grid-table > td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.ol-input input {
    height: 1.75em !important;
}

.ol-input.statecode > input {
    text-transform: uppercase;
    width: 2em;
    text-align: center;
}
    `);

    let searchProvider = new OpenStreet();

    let center = ol.proj.transform([-120, 35], 'EPSG:4326', 'EPSG:3857');

    let mapContainer = document.getElementsByClassName("map")[0];

    let map = new ol.Map({
        loadTilesWhileAnimating: true,
        target: mapContainer,
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: center,
            projection: 'EPSG:3857',
            zoom: 6
        })
    });

    let source = new ol.source.Vector();

    let symbolizer = new StyleConverter();

    let vector = new ol.layer.Vector({
        source: source,
        style: (feature: ol.Feature, resolution: number) => {
            let style = feature.getStyle();
            if (!style) {
                style = symbolizer.fromJson({
                    circle: {
                        radius: 4,
                        fill: {
                            color: "rgba(33, 33, 33, 0.2)"
                        },
                        stroke: {
                            color: "#F00"
                        }
                    },
                    text: {
                        text: feature.get("text")
                    }
                });
                feature.setStyle(style);
            }
            return <ol.style.Style>style;
        }
    });

    ArcGisVectorSourceFactory.create({
        map: map,
        services: 'https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services',
        serviceName: 'USA_States_Generalized',
        layers: [0]
    }).then(layers => {
        layers.forEach(layer => {
            let getStyleFunction = layer.getStyleFunction();

            // trick so grid will render state outline
            layer.setStyle((f: ol.Feature, resolution: number) => {
                let style = f.getStyle();
                if (!style) {
                    style = getStyleFunction(f, 0);
                    f.setStyle(style);
                }
                return <ol.style.Style>style;
            });

            layer.setOpacity(0.5);
            map.addLayer(layer);

            let input = Input.create({
                className: "ol-input statecode top left-2 ",
                closedText: "+",
                openedText: "−",
                autoSelect: true,
                autoClear: false,
                autoCollapse: false,
                placeholderText: "XX"
            });

            map.addControl(input);
            input.on("change", args => {
                let value = args.value.toLocaleLowerCase();
                let feature = layer.getSource().forEachFeature(feature => {
                    let text = <string>feature.get("STATE_ABBR");
                    if (!text) return;
                    if (-1 < text.toLocaleLowerCase().indexOf(value)) {
                        return feature;
                    }
                });
                if (feature) {
                    zoomToFeature(map, feature);
                } else {
                    changeHandler({ value: value });
                }
            });

        });
    }).then(() => {
        // due to timing, grid will be aware of states but not query results
        let grid = Grid.create({
            className: "ol-grid top-2 right",
            currentExtent: true,
            autoCollapse: false,
            labelAttributeName: "STATE_ABBR",
            showIcon: true
        });

        grid.on("feature-click", args => {
            zoomToFeature(map, args.feature);
        });

        map.addControl(grid);

        map.addLayer(vector);
    });

    let changeHandler = (args: { value: string }) => {
        if (!args.value) return;
        console.log("search", args.value);

        let searchArgs = searchProvider.getParameters({
            query: args.value,
            limit: 1,
            countrycodes: 'us',
            lang: 'en'
        });

        $.ajax({
            url: searchArgs.url,
            method: searchProvider.method || 'GET',
            data: searchArgs.params,
            dataType: searchProvider.dataType || 'json'
        }).then(json => {
            let results = searchProvider.handleResponse(json);
            results.some(r => {
                console.log(r);
                if (r.original.boundingbox) {
                    let [lat1, lat2, lon1, lon2] = r.original.boundingbox.map(v => parseFloat(v));
                    [lon1, lat1] = ol.proj.transform([lon1, lat1], "EPSG:4326", "EPSG:3857");
                    [lon2, lat2] = ol.proj.transform([lon2, lat2], "EPSG:4326", "EPSG:3857");
                    let extent = <ol.Extent>[lon1, lat1, lon2, lat2];

                    let feature = new ol.Feature(new ol.geom.Polygon([[
                        ol.extent.getBottomLeft(extent),
                        ol.extent.getTopLeft(extent),
                        ol.extent.getTopRight(extent),
                        ol.extent.getBottomRight(extent),
                        ol.extent.getBottomLeft(extent)
                    ]]));

                    feature.set("text", r.original.display_name);
                    source.addFeature(feature);
                    zoomToFeature(map, feature);
                } else {
                    let [lon, lat] = ol.proj.transform([r.lon, r.lat], "EPSG:4326", "EPSG:3857");
                    let feature = new ol.Feature(new ol.geom.Point([lon, lat]));
                    feature.set("text", r.original.display_name);
                    source.addFeature(feature);
                    zoomToFeature(map, feature);
                }
                return true;
            });
        }).fail(() => {
            console.error("geocoder failed");
        });

    };

    map.addControl(Input.create({
        className: 'ol-input bottom-2 right',
        expanded: true,
        placeholderText: "Bottom Right Search",
        onChange: changeHandler
    }));

    map.addControl(Input.create({
        className: 'ol-input top right',
        expanded: true,
        openedText: "?",
        placeholderText: "Feature Finder",
        autoClear: true,
        autoCollapse: false,
        canCollapse: false,
        hideButton: true,
        onChange: args => {
            let value = args.value.toLocaleLowerCase();
            let feature = source.forEachFeature(feature => {
                let text = <string>feature.get("text");
                if (!text) return;
                if (-1 < text.toLocaleLowerCase().indexOf(value)) {
                    return feature;
                }
            });
            if (feature) {
                map.getView().animate({
                    center: feature.getGeometry().getClosestPoint(map.getView().getCenter()),
                    duration: 1000
                });
            } else {
                changeHandler({ value: value });
            }
        }
    }));

}