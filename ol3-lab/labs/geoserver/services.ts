import $ = require("jquery");
import ol = require("openlayers");
import MapMaker = require("../mapmaker");
import Symbolizer = require("ol3-symbolizer");
import { Popup } from "ol3-popup";
import { Draw } from "ol3-draw";
import { Modify } from "ol3-draw/ol3-draw/ol3-edit";
import { Delete } from "ol3-draw/ol3-draw/ol3-delete";
import { Translate } from "ol3-draw/ol3-draw/ol3-translate";
import { WfsSync } from "../../ux/wfs-sync";

const symbolizer = new Symbolizer.StyleConverter();
const serializer = new XMLSerializer();

let filter = <{
    and(a: string, b: string): string;
    bbox(geom: string, extent: ol.Extent, srs?: string): string;
    equalTo(a: string, b: string): string;
}>ol.format.filter;

export function run() {

    // get "WARM RIVER" addresses
    let format = new ol.format.WFS();
    let requestBody = format.writeGetFeature({
        featureNS: "http://www.opengeospatial.net/cite",
        featurePrefix: "cite",
        featureTypes: ["addresses", "streets", "parcels"],
        srsName: "EPSG:3857",
        filter: filter.equalTo("strname", "WARM RIVER")
    });

    let data = serializer.serializeToString(requestBody);

    $.ajax({
        type: "POST",
        url: "http://localhost:8080/geoserver/cite/wfs",
        data: data,
        contentType: "application/xml",
        dataType: "xml",
        success: (response: XMLDocument) => {
            let features = format.readFeatures(response);

            features = features.filter(f => !!f.getGeometry());

            let extent = ol.extent.createEmpty();
            features.forEach(f => ol.extent.extend(extent, f.getGeometry().getExtent()));

            MapMaker.run({ srs: "EPSG:3857", basemap: "bing" }).then(map => {

                let source = new ol.source.Vector({ features: features });
                let layer = new ol.layer.Vector({ source: source });

                layer.setStyle(symbolizer.fromJson({
                    fill: {
                        color: "rgba(33,33,33,0.5)"
                    },
                    stroke: {
                        color: "rgba(50,100,50,0.8)",
                        width: 3
                    },
                    circle: {
                        fill: {
                            color: "rgba(99,33,33,1)"
                        },
                        stroke: {
                            color: "rgba(255,255,255,1)"
                        },
                        radius: 5,
                        opacity: 1
                    }
                }));
                map.addLayer(layer);

                map.getView().animate({
                    center: ol.extent.getCenter(extent),
                    zoom: 18
                });

                let popup = new Popup({
                    css: `
            .ol-popup {
                background-color: white;
            }
            .ol-popup .page {
                max-height: 200px;
                overflow-y: auto;
            }
            `,
                    dockContainer: <HTMLElement>map.getViewport()
                });
                map.addOverlay(popup);

                false && map.on("click", (event: { coordinate: any; pixel: any }) => {
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
                        popup.pages.add(page, new ol.geom.Point(event.coordinate));
                    });

                    popup.show(coord, `<label>${pageNum} Features Found</label>`);
                    popup.pages.goto(0);
                });

                map.addControl(Draw.create({ geometryType: "MultiPolygon", label: "▧", position: "right-4 top", layers: [layer] }));
                map.addControl(Draw.create({ geometryType: "MultiLineString", label: "▬", position: "right-2 top", layers: [layer] }));
                map.addControl(Draw.create({ geometryType: "Point", label: "●", position: "right top", layers: [layer] }));
                map.addControl(Translate.create({ position: "right-4 top-2" }));
                map.addControl(Modify.create({ label: "Δ", position: "right-2 top-2" }));
                map.addControl(Delete.create({ label: "X", position: "right top-2" }));

                WfsSync.create({
                    wfsUrl: "http://localhost:8080/geoserver/cite/wfs",
                    srsName: "EPSG:3857",
                    formatter: format,
                    source: source,
                    featureNS: "http://www.opengeospatial.net/cite",
                    featurePrefix: "cite",
                    targets: {
                        Point: "addresses",
                        MultiLineString: "streets",
                        MultiPolygon: "parcels",
                    }
                });

            });
        }
    });
}