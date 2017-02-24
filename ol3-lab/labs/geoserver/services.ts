import $ = require("jquery");
import ol = require("openlayers");
import MapMaker = require("../mapmaker");
import Symbolizer = require("ol3-symbolizer");
import { Popup } from "ol3-popup";
import { Draw } from "ol3-draw";
import { Modify } from "ol3-draw/ol3-draw/ol3-edit";
import { Delete } from "ol3-draw/ol3-draw/ol3-delete";
import { Translate } from "ol3-draw/ol3-draw/ol3-translate";

// workspaces
declare module namespace {

    export interface Workspace {
        name: string;
        href: string;
    }

    export interface Workspaces {
        workspace: Workspace[];
    }

    export interface RootObject {
        workspaces: Workspaces;
    }

}

// namespaces
declare module namespace {

    export interface Namespace {
        name: string;
        href: string;
    }

    export interface Namespaces {
        namespace: Namespace[];
    }

    export interface RootObject {
        namespaces: Namespaces;
    }

}

// namespaces/namespace
declare module namespace {

    export interface Namespace {
        prefix: string;
        uri: string;
        featureTypes: string;
    }

    export interface RootObject {
        namespace: Namespace;
    }

}

// about/version
declare module namespace {

    export interface Resource {
        name: string;
        "Build-Timestamp": string;
        Version: any;
        "Git-Revision": string;
    }

    export interface About {
        resource: Resource[];
    }

    export interface RootObject {
        about: About;
    }

}

// about/status
declare module namespace {

    export interface Status {
        module: string;
        name: string;
        isEnabled: boolean;
        isAvailable: boolean;
        component: string;
        version: string;
        message: string;
    }

    export interface About {
        status: Status[];
    }

    export interface RootObject {
        about: About;
    }

}

// styles
declare module namespace {

    export interface Style {
        name: string;
        href: string;
    }

    export interface Styles {
        style: Style[];
    }

    export interface RootObject {
        styles: Styles;
    }

}

// styles/style
declare module namespace {

    export interface LanguageVersion {
        version: string;
    }

    export interface Style {
        name: string;
        format: string;
        languageVersion: LanguageVersion;
        filename: string;
    }

    export interface RootObject {
        style: Style;
    }

}

// layers
declare module namespace {

    export interface Layer {
        name: string;
        href: string;
    }

    export interface Layers {
        layer: Layer[];
    }

    export interface RootObject {
        layers: Layers;
    }

}

// layers/layer
declare module namespace {

    export interface DefaultStyle {
        name: string;
        href: string;
    }

    export interface Resource {
        "class": string;
        name: string;
        href: string;
    }

    export interface Attribution {
        logoWidth: number;
        logoHeight: number;
    }

    export interface Layer {
        name: string;
        type: string;
        defaultStyle: DefaultStyle;
        resource: Resource;
        attribution: Attribution;
    }

    export interface RootObject {
        layer: Layer;
    }

}

const symbolizer = new Symbolizer.StyleConverter();
const serializer = new XMLSerializer();

let filter = <{
    and(a: string, b: string): string;
    bbox(geom: string, extent: ol.Extent, srs?: string): string;
    equalTo(a: string, b: string): string;
}>ol.format.filter;

function saveTigerAddr(feature: ol.Feature) {
    let format = new ol.format.WFS();
    let requestBody = format.writeTransaction(
        [feature], [], [],
        {
            featureNS: "http://www.census.gov",
            featurePrefix: "tiger",
            featureType: "vegas_addresses",
            srsName: "EPSG:3421",
            nativeElements: []
        });

    let data = serializer.serializeToString(requestBody);

    $.ajax({
        type: "POST",
        url: "http://localhost:8080/geoserver/tiger/wfs",
        data: data,
        contentType: "application/xml",
        dataType: "xml",
        success: (response: XMLDocument) => {
            console.warn(serializer.serializeToString(response));
        }
    });
}

export function run() {

    // get "WARM RIVER" addresses
    let format = new ol.format.WFS();
    let requestBody = format.writeGetFeature({
        featureNS: "http://geoserver.org/vegas11",
        featurePrefix: "vegas11",
        featureTypes: ["addresses", "parcels"],
        srsName: "EPSG:3857",
        filter: filter.equalTo("strname", "WARM RIVER")
    });

    let data = serializer.serializeToString(requestBody);
    console.log("data", data);

    $.ajax({
        type: "POST",
        url: "http://localhost:8080/geoserver/vegas11/wfs",
        data: data,
        contentType: "application/xml",
        dataType: "xml",
        success: (response: XMLDocument) => {
            console.log("response", serializer.serializeToString(response));
            let features = format.readFeatures(response);
            console.log("features", features);
            saveTigerAddr(features[0]);
            return;

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
                        color: "rgba(33,33,33,1)"
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
                        popup.pages.add(page, new ol.geom.Point(event.coordinate));
                    });

                    popup.show(coord, `<label>${pageNum} Features Found</label>`);
                    popup.pages.goto(0);
                });

                map.addControl(Draw.create({ geometryType: "Polygon", label: "▧", position: "right-4 top" }));
                map.addControl(Draw.create({ geometryType: "MultiLineString", label: "▬", position: "right-2 top" }));
                map.addControl(Draw.create({ geometryType: "Point", label: "●", position: "right top" }));
                map.addControl(Translate.create({ position: "right-4 top-2" }));
                map.addControl(Modify.create({ label: "Δ", position: "right-2 top-2" }));
                map.addControl(Delete.create({ label: "X", position: "right top-2" }));

                source.forEachFeature(f => {
                    f.on("change", () => {
                        console.log("feature change", f);
                        f.set("touched", Date.now());
                    });

                    f.on("propertychange", (args: { key: string; oldValue: any }) => {
                        if (args.key === "touched") return;
                        f.set("touched", Date.now());
                    });
                });

            });

        }
    });
}