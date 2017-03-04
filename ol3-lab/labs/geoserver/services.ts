import $ = require("jquery");
import ol = require("openlayers");
import { getParameterByName } from "../common/common";
import MapMaker = require("../mapmaker");
import Symbolizer = require("ol3-symbolizer");
import { Popup } from "ol3-popup";
import { Draw } from "ol3-draw";
import { Modify } from "ol3-draw/ol3-draw/ol3-edit";
import { Delete } from "ol3-draw/ol3-draw/ol3-delete";
import { Translate } from "ol3-draw/ol3-draw/ol3-translate";
import { WfsSync } from "ol3-draw/ol3-draw/services/wfs-sync";

const symbolizer = new Symbolizer.StyleConverter();
const serializer = new XMLSerializer();

export function run() {

    let srsName = "EPSG:3857";
    let wfsUrl = "http://localhost:8080/geoserver/cite/wfs";
    let featureNS = "http://www.opengeospatial.net/cite";
    let featurePrefix = "cite";
    let targets = {
        Point: "addresses",
        MultiLineString: "streets",
        MultiPolygon: "parcels",
    };

    MapMaker.run({
        srs: srsName,
        basemap: "bing"
    }).then(map => {

        let source = new ol.source.Vector();
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

        {
            let format = new ol.format.WFS();
            let requestBody = format.writeGetFeature({
                featureNS: featureNS,
                featurePrefix: featurePrefix,
                featureTypes: Object.keys(targets).map((k: keyof typeof targets) => targets[k]),
                srsName: srsName,
                filter: ol.format.filter.equalTo("strname", "29615")
            });
            let data = serializer.serializeToString(requestBody);

            $.ajax({
                type: "POST",
                url: wfsUrl,
                data: data,
                contentType: "application/xml",
                dataType: "xml",
                success: (response: XMLDocument) => {
                    let features = format.readFeatures(response);

                    features = features.filter(f => !!f.getGeometry());
                    source.addFeatures(features);
                    let extent = ol.extent.createEmpty();
                    features.forEach(f => ol.extent.extend(extent, f.getGeometry().getExtent()));
                    map.getView().fit(extent, map.getSize());
                }
            });
        }

        {
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

            map.on("click", (event: { coordinate: any; pixel: any }) => {
                let interactions = map
                    .getInteractions()
                    .getArray()
                    .filter(i => i instanceof ol.interaction.Draw || i instanceof ol.interaction.Modify || i instanceof ol.interaction.Translate);
                console.log(interactions);
                if (interactions.length) return;

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
        }

        map.addControl(Draw.create({ geometryType: "MultiPolygon", label: "▧", position: "right-4 top", layers: [layer] }));
        map.addControl(Draw.create({ geometryType: "MultiLineString", label: "▬", position: "right-2 top", layers: [layer] }));
        map.addControl(Draw.create({ geometryType: "Point", label: "●", position: "right top", layers: [layer] }));
        map.addControl(Translate.create({ position: "right-4 top-2" }));
        map.addControl(Modify.create({ label: "Δ", position: "right-2 top-2" }));
        map.addControl(Delete.create({ label: "X", position: "right top-2" }));

        WfsSync.create({
            wfsUrl: wfsUrl,
            featureNS: featureNS,
            featurePrefix: featurePrefix,
            srsName: srsName,
            source: source,
            targets: targets
        });

    });

}