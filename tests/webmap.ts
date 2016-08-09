import $ = require("jquery");

const webmap = "ae85c9d9c5ae409bb1f351617ea0bffc";

let portal = "https://www.arcgis.com";
const items_endpoint = "http://www.arcgis.com/sharing/rest/content/items";

declare module WebMap {

    export interface Outline {
        style: string;
        color: number[];
        width: number;
        type: string;
    }

    export interface Font {
        weight: string;
        style: string;
        family: string;
        size: number;
    }

    export interface Symbol {
        style: string;
        color: number[];
        outline: Outline;
        type: string;
        width?: number;
        horizontalAlignment: string;
        backgroundColor: number[];
        font: Font;
        height?: number;
        contentType: string;
        url: string;
    }

    export interface UniqueValueInfo {
        symbol: Symbol;
        description: string;
        value: string;
        label: string;
    }

    export interface Renderer {
        field1: string;
        type: string;
        uniqueValueInfos: UniqueValueInfo[];
    }

    export interface DrawingInfo {
        renderer: Renderer;
    }

    export interface Attributes {
        VISIBLE: number;
        TITLE: string;
        TYPEID: number;
    }

    export interface Prototype {
        attributes: Attributes;
    }

    export interface Template {
        drawingTool: string;
        description: string;
        name: string;
        prototype: Prototype;
    }

    export interface Domains {
    }

    export interface Type {
        id: number;
        templates: Template[];
        domains: Domains;
        name: string;
    }

    export interface Field {
        alias: string;
        name: string;
        type: string;
        editable: boolean;
        length?: number;
    }

    export interface SpatialReference {
        wkid: number;
        latestWkid: number;
    }

    export interface Extent {
        xmin: number;
        ymin: number;
        xmax: number;
        ymax: number;
        spatialReference: SpatialReference;
    }

    export interface LayerDefinition {
        objectIdField: string;
        templates: any[];
        type: string;
        drawingInfo: DrawingInfo;
        displayField: string;
        visibilityField: string;
        name: string;
        hasAttachments: boolean;
        typeIdField: string;
        capabilities: string;
        types: Type[];
        geometryType: string;
        fields: Field[];
        extent: Extent;
    }

    export interface Value {
        sourceURL: string;
        linkURL: string;
    }

    export interface MediaInfo {
        value: Value;
        type: string;
    }

    export interface PopupInfo {
        mediaInfos: MediaInfo[];
        title: string;
        description: string;
    }

    export interface Geometry {
        rings: number[][][];
        spatialReference: SpatialReference;
        x?: number;
        y?: number;
    }

    export interface Attributes {
        OBJECTID: number;
    }

    export interface Feature {
        geometry: Geometry;
        attributes: Attributes;
        symbol: Symbol;
    }

    export interface FeatureSet {
        geometryType: string;
        features: Feature[];
    }

    export interface Layer {
        layerDefinition: LayerDefinition;
        popupInfo: PopupInfo;
        featureSet: FeatureSet;
        nextObjectId: number;
    }

    export interface FeatureCollection {
        layers: Layer[];
        showLegend: boolean;
    }

    export interface OperationalLayer {
        layerType: string;
        id: string;
        title: string;
        featureCollection: FeatureCollection;
        opacity: number;
        visibility: boolean;
    }

    export interface BaseMapLayer {
        id: string;
        layerType: string;
        url: string;
        visibility: boolean;
        opacity: number;
        title: string;
    }

    export interface BaseMap {
        baseMapLayers: BaseMapLayer[];
        title: string;
    }

    export interface WebMap {
        operationalLayers: OperationalLayer[];
        baseMap: BaseMap;
        spatialReference: SpatialReference;
        authoringApp: string;
        authoringAppVersion: string;
        version: string;
    }

}


function endpoint() {
    return `${items_endpoint}/${webmap}/data?f=json`;
}

export function run() {

    // if the webmap is not private then we can easily get at the configuration
	// actually only a webapp can be private, all configs are public...I think    
    if (1) $.ajax({
        url: endpoint(),
		dataType: "json"
    }).done((webmap: WebMap.WebMap) => {
        console.assert(webmap.authoringApp === "WebMapViewer", "authoringApp");
        console.assert(webmap.authoringAppVersion === "4.2");
        webmap.operationalLayers;
        webmap.baseMap;
        console.assert(webmap.spatialReference.latestWkid === 3857);
        console.assert(webmap.version === "2.5");
        console.log("done");
	});

}