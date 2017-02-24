import $ = require("jquery");
import ol = require("openlayers");
import MapMaker = require("../mapmaker");
import Symbolizer = require("ol3-symbolizer");
import { Popup } from "ol3-popup";

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

let filter = <{
    and(a: string, b: string): string;
    bbox(geom: string, extent: ol.Extent, srs?: string): string;
    equalTo(a: string, b: string): string;
}>ol.format.filter;

let symbolizer = new Symbolizer.StyleConverter();

export function run() {
    // get "WARM RIVER" addresses
    let format = new ol.format.WFS();
    let requestBody = format.writeGetFeature({
        featureNS: "http://geoserver.org/vegas11",
        featurePrefix: "vegas11",
        featureTypes: ["addresses"],
        srsName: "EPSG:3857",
        filter: filter.equalTo("strname", "WARM RIVER")
    });

    let serializer = new XMLSerializer();
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

            let extent = ol.extent.createEmpty();
            features.forEach(f => ol.extent.extend(extent, f.getGeometry().getExtent()));

            MapMaker.run({ srs: "EPSG:3857" }).then(map => {

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
                            color: "rgba(33,33,33,0.5)"
                        },
                        stroke: {
                            color: "rgba(33,33,33,1)"
                        },
                        radius: 10,
                        opacity: 1
                    }
                }));
                map.addLayer(layer);

                map.getView().animate({
                    center: ol.extent.getCenter(extent)
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
            `
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
                        popup.pages.add(page, feature.getGeometry());
                    });

                    popup.show(coord, `<label>${pageNum} Features Found</label>`);
                    popup.pages.goto(0);
                });


            });

        }
    });
}