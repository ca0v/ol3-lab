import ol = require("openlayers");
import $ = require("jquery");
import { Popup } from "ol3-popup";

import { Grid } from "ol3-grid";
import { StyleConverter } from "ol3-symbolizer";
import { SearchForm } from "ol3-search";
import { OpenStreet } from "ol3-search/ol3-search/providers/osm";
import { cssin, mixin } from "ol3-fun/ol3-fun/common";
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

    cssin("examples/ol3-search", `

.map {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}

.ol-popup {
    background-color: white;
}

.ol-popup .pages {
    max-height: 10em;
    min-width: 20em;
    overflow: auto;
}

.ol-grid.statecode .ol-grid-container {
    background-color: white;
    width: 10em;
}

.ol-grid .ol-grid-container.ol-hidden {
}

.ol-grid .ol-grid-container {
    width: 15em;
}

.ol-grid .ol-grid-table {
    width: 100%;
}

.ol-grid table.ol-grid-table {
    border-collapse: collapse;
    width: 100%;
}

.ol-grid table.ol-grid-table > td {
    padding: 8px;
    text-align: left;
    border-bottom: 1px solid #ddd;
}

.ol-search.nominatim form {
    width: 20em;
}

.ol-search tr.focus {
    background: white;
}

.ol-search:hover {
    background: white;
}

.ol-search label.ol-search-label {
    white-space: nowrap;
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

    let popup = new Popup({
        yOffset: 0,
        positioning: "bottom-center"
    });
    popup.setMap(map);

    map.on("click", (event: { coordinate: any; pixel: any }) => {
        console.log("click");
        let coord = event.coordinate;
        popup.hide();

        let pageNum = 0;
        map.forEachFeatureAtPixel(event.pixel, (feature: ol.Feature, layer) => {
            let page = document.createElement('p');
            let keys = Object.keys(feature.getProperties()).filter(key => {
                let v = feature.get(key);
                if (typeof v === "string") return true;
                if (typeof v === "number") return true;
                return false;
            });
            page.title = "" + ++pageNum;
            page.innerHTML = `<table>${keys.map(k => `<tr><td>${k}</td><td>${feature.get(k)}</td></tr>`).join("")}</table>`;
            popup.pages.add(page, feature.getGeometry());
        });

        popup.show(coord, `<label>${pageNum} Features Found</label>`);
        popup.pages.goto(0);
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
                        text: (<string>feature.get("text")).substring(0, 20)
                    }
                });
                if (feature.get("icon")) {
                    style.setImage(new ol.style.Icon({
                        src: feature.get("icon")
                    }));
                }
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
            layer.getSource().on("addfeature", (args: { feature: ol.Feature }) => {
                let feature = args.feature;
                let style = symbolizer.fromJson({
                    fill: {
                        color: "rgba(200,200,200,0.5)"
                    },
                    stroke: {
                        color: "rgba(33,33,33,0.8)",
                        width: 3
                    },
                    text: {
                        text: feature.get("STATE_ABBR")
                    }
                });
                feature.setStyle(style);
            });

            map.addLayer(layer);

            let grid = Grid.create({
                className: "ol-grid statecode top left-2",
                expanded: true,
                currentExtent: true,
                autoCollapse: true,
                // we do it ourselves
                autoPan: false,
                showIcon: true,
                layers: [layer]
            });
            map.addControl(grid);

            grid.on("feature-click", args => {
                zoomToFeature(map, args.feature);
            });

            grid.on("feature-hover", args => {
                // TODO: highlight args.feature
            });

        });
    }).then(() => {
        map.addLayer(vector);
    });

    let form = SearchForm.create({
        className: 'ol-search nominatim top right',
        expanded: true,
        placeholderText: "Nominatim Search Form",
        fields: [
            {
                name: "q",
                alias: "*"
            },
            {
                name: "postalcode",
                alias: "Postal Code"
            },
            {
                name: "housenumber",
                alias: "House Number",
                length: 10,
                type: "integer"
            },
            {
                name: "streetname",
                alias: "Street Name"
            },
            {
                name: "city",
                alias: "City"
            },
            {
                name: "county",
                alias: "County"
            },
            {
                name: "country",
                alias: "Country",
                domain: {
                    type: "",
                    name: "",
                    codedValues: [
                        {
                            name: "us", code: "us"
                        }
                    ]
                }
            },
            {
                name: "bounded",
                alias: "Current Extent?",
                type: "boolean"
            }
        ]
    });

    form.on("change", args => {
        if (!args.value) return;
        console.log("search", args.value);

        let searchArgs = searchProvider.getParameters(args.value, map);

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
                    Object.keys(r.original).forEach(k => {
                        feature.set(k, r.original[k]);
                    });
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

    });

    map.addControl(form);

}