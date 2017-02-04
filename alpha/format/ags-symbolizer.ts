/**
 * Converts style information from arcgis.com into a format compatible with the symbolizer
 * The symbolizer converts the object to an actual ol3 style
 */
import $ = require("jquery");
import Symbolizer = require("./ol3-symbolizer");

const symbolizer = new Symbolizer.StyleConverter();

declare namespace ArcGisFeatureServerLayer {

    type SpatialReference = {
        wkid: string
    };

    type Extent = {
        xmin: number
    };

    type Styles =
        "esriSMSCircle" | "esriSMSCross" | "esriSMSDiamond" | "esriSMSPath" | "esriSLSSolid" | "esriSMSSquare" | "esriSMSX"
        | "esriSFSSolid" | "esriSFSForwardDiagonal"
        | "esriSLSDot" | "esriSLSDash" | "esriSLSDashDot" | "esriSLSDashDotDot";

    type SymbolTypes = "esriSMS" | "esriSLS" | "esriSFS" | "esriPMS" | "esriPFS" | "esriTS";

    type Color = number[];

    export interface AdvancedQueryCapabilities {
        supportsPagination: boolean;
        supportsStatistics: boolean;
        supportsOrderBy: boolean;
        supportsDistinct: boolean;
    }

    interface Outline {
        style?: Styles;
        color?: number[];
        width?: number;
        type?: SymbolTypes;
        d?: Date;
    }

    interface Font {
        weight: string;
        style: string;
        family: string;
        size: number;
    }

    interface Symbol {
        type: SymbolTypes;
        style?: Styles;
        color?: number[];
        outline?: Outline;
        width?: number;
        horizontalAlignment?: string;
        verticalAlignment?: string;
        font?: Font;
        height?: number;
        xoffset?: number;
        yoffset?: number;
        contentType?: string;
        url?: string;
        size?: number;
        angle?: number;
        imageData?: string;
        path?: string;
    }

    export interface UniqueValueInfo {
        symbol: Symbol;
        value?: string;
        label?: string;
        description?: string;
    }

    export interface VisualVariable {
        type: string;
        field: string;
        valueUnit: string;
        minSize: number;
        maxSize: number;
        minDataValue: number;
        maxDataValue: number;
        minSliderValue: number;
        maxSliderValue: number;
    }

    export interface ClassBreakInfo {
        symbol: Symbol;
        classMaxValue: number;
    }

    export interface Renderer extends Attributes {
        type: string;
        label?: string;
        description?: string;
        field1?: string;
        field2?: string;
        field3?: string;
        fieldDelimiter?: string;
        defaultSymbol?: Symbol;
        defaultLabel?: any;
        symbol?: Symbol;
        uniqueValueInfos?: UniqueValueInfo[];
    }

    export interface ClassBreakRenderer extends Renderer {
        field?: string;
        minValue?: number;
        classBreakInfos?: ClassBreakInfo[];
        visualVariables?: VisualVariable[];
        authoringInfo: { visualVariables: VisualVariable[] }
    }

    export interface DrawingInfo {
        renderer: Renderer;
        transparency?: number;
        labelingInfo?: any;
    }

    export interface CodedValue {
        name: string;
        code: string;
    }

    export interface Domain {
        type: string;
        name: string;
        codedValues: CodedValue[];
    }

    export interface Field {
        name: string;
        type: string;
        alias: string;
        domain: Domain;
        editable: boolean;
        nullable: boolean;
        length?: number;
    }


    export interface Domains {
    }

    interface Attributes {
        [attribute: string]: any;
    }

    export interface Prototype {
        attributes: Attributes;
    }

    export interface Template {
        name: string;
        description: string;
        prototype: Prototype;
        drawingTool: string;
    }

    export interface Type {
        id: string;
        name: string;
        domains: Domains;
        templates: Template[];
    }

    export interface RootObject {
        currentVersion: string | number;
        id: number;
        name: string;
        type: string;
        description: string;
        copyrightText: string;
        defaultVisibility: boolean;
        editFieldsInfo?: any;
        ownershipBasedAccessControlForFeatures?: any;
        syncCanReturnChanges: boolean;
        relationships: any[];
        isDataVersioned: boolean;
        supportsRollbackOnFailureParameter: boolean;
        supportsStatistics: boolean;
        supportsAdvancedQueries: boolean;
        advancedQueryCapabilities: AdvancedQueryCapabilities;
        geometryType: string;
        minScale: number;
        maxScale: number;
        extent: Extent;
        drawingInfo: DrawingInfo;
        hasM: boolean;
        hasZ: boolean;
        allowGeometryUpdates: boolean;
        hasAttachments: boolean;
        htmlPopupType: string;
        objectIdField: string;
        globalIdField: string;
        displayField: string;
        typeIdField: string;
        fields: Field[];
        types: Type[];
        templates: any[];
        maxRecordCount: number;
        supportedQueryFormats: string;
        capabilities: string;
        useStandardizedQueries: boolean;
        spatialReference?: SpatialReference;
        displayFieldName?: string;
    }

}

// esri -> ol mappings
const styleMap = {
    "esriSMSCircle": "circle",
    "esriSMSDiamond": "diamond",
    "esriSMSX": "x",
    "esriSMSCross": "cross",
    "esriSLSSolid": "solid",
    "esriSFSSolid": "solid",
    "esriSLSDot": "dot",
    "esriSLSDash": "dash",
    "esriSLSDashDot": "dashdot",
    "esriSLSDashDotDot": "dashdotdot",
    "esriSFSForwardDiagonal": "forward-diagonal",
};

// esri -> ol mappings
const typeMap = {
    "esriSMS": "sms", // simple marker symbol
    "esriSLS": "sls", // simple line symbol
    "esriSFS": "sfs", // simple fill symbol
    "esriPMS": "pms", // picture marker symbol
    "esriPFS": "pfs", // picture fill symbol
    "esriTS": "txt", // text symbol
}

function range(a: number, b: number) {
    let result = new Array(b - a + 1);
    while (a <= b) result.push(a++);
    return result;
}

function clone(o: Object) {
    return JSON.parse(JSON.stringify(o));
}

// convert from ags style to an internal format
export class StyleConverter {

    private asWidth(v: number) {
        return v * 4 / 3; // not sure why
    }

    private asRadius(v: number) {
        return v * 2 / 3; // not sure why
    }

    // see ol.color.asString
    private asColor(color: ArcGisFeatureServerLayer.Color) {
        if (color.length === 4) return `rgba(${color[0]},${color[1]},${color[2]},${color[3] / 255})`;
        if (color.length === 3) return `rgb(${color[0]},${color[1]},${color[2]}})`;
        return "#" + color.map(v => ("0" + v.toString(16)).substr(0, 2)).join("");
    }

    private fromSFSSolid(symbol: ArcGisFeatureServerLayer.Symbol, style: Symbolizer.Format.Style) {
        style.fill = {
            color: this.asColor(symbol.color)
        };
        this.fromSLS(symbol.outline, style);
    }

    private fromSFS(symbol: ArcGisFeatureServerLayer.Symbol, style: Symbolizer.Format.Style) {
        switch (symbol.style) {
            case "esriSFSSolid":
                this.fromSFSSolid(symbol, style);
                break;
            default:
                debugger;
                break;
        }
    }

    private fromSMSCircle(symbol: ArcGisFeatureServerLayer.Symbol, style: Symbolizer.Format.Style) {
        style.circle = {
            opacity: 1,
            radius: this.asRadius(symbol.size),
            stroke: {
                color: this.asColor(symbol.outline.color),
            },
            snapToPixel: true
        };
        this.fromSFSSolid(symbol, style.circle);
        this.fromSLS(symbol.outline, style.circle);
    }

    private fromSMSCross(symbol: ArcGisFeatureServerLayer.Symbol, style: Symbolizer.Format.Style) {
        style.star = {
            points: 4,
            angle: 0,
            radius: this.asRadius(symbol.size),
            radius2: 0
        };
        this.fromSFSSolid(symbol, style.star);
        this.fromSLS(symbol.outline, style.star);
    }

    private fromSMSDiamond(symbol: ArcGisFeatureServerLayer.Symbol, style: Symbolizer.Format.Style) {
        style.star = {
            points: 4,
            angle: 0,
            radius: this.asRadius(symbol.size),
            radius2: this.asRadius(symbol.size)
        };
        this.fromSFSSolid(symbol, style.star);
        this.fromSLS(symbol.outline, style.star);
    }

    private fromSMSPath(symbol: ArcGisFeatureServerLayer.Symbol, style: Symbolizer.Format.Style) {
        let size = 2 * this.asWidth(symbol.size);
        style.svg = {
            imgSize: [size, size],
            path: symbol.path,
            rotation: symbol.angle
        };
        this.fromSLSSolid(symbol, style.svg);
        this.fromSLS(symbol.outline, style.svg);
    }

    private fromSMSSquare(symbol: ArcGisFeatureServerLayer.Symbol, style: Symbolizer.Format.Style) {
        style.star = {
            points: 4,
            angle: Math.PI / 4,
            radius: this.asRadius(symbol.size / Math.sqrt(2)),
            radius2: this.asRadius(symbol.size / Math.sqrt(2))
        };
        this.fromSFSSolid(symbol, style.star);
        this.fromSLS(symbol.outline, style.star);
    }

    private fromSMSX(symbol: ArcGisFeatureServerLayer.Symbol, style: Symbolizer.Format.Style) {
        style.star = {
            points: 4,
            angle: 0,
            radius: this.asRadius(symbol.size / Math.sqrt(2)),
            radius2: 0
        };
        this.fromSFSSolid(symbol, style.star);
        this.fromSLS(symbol.outline, style.star);
    }

    private fromSMS(symbol: ArcGisFeatureServerLayer.Symbol, style: Symbolizer.Format.Style) {
        switch (symbol.style) {
            case "esriSMSCircle":
                this.fromSMSCircle(symbol, style);
                break;
            case "esriSMSCross":
                this.fromSMSCross(symbol, style);
                break;
            case "esriSMSDiamond":
                this.fromSMSDiamond(symbol, style);
                break;
            case "esriSMSPath":
                this.fromSMSPath(symbol, style);
                break;
            case "esriSMSSquare":
                this.fromSMSSquare(symbol, style);
                break;
            case "esriSMSX":
                this.fromSMSX(symbol, style);
                break;
            default:
                throw `invalid-style: ${symbol.style}`;
        }
    }

    private fromPMS(symbol: ArcGisFeatureServerLayer.Symbol, style: Symbolizer.Format.Style) {
        throw "not-implemented";
    }

    private fromSLSSolid(symbol: ArcGisFeatureServerLayer.Outline, style: Symbolizer.Format.Style) {
        style.stroke = {
            color: this.asColor(symbol.color),
            width: this.asWidth(symbol.width),
            lineDash: [],
            lineJoin: "",
            miterLimit: 4
        };
    }

    private fromSLS(symbol: ArcGisFeatureServerLayer.Outline, style: Symbolizer.Format.Style) {
        switch (symbol.style) {
            case "esriSLSSolid":
                this.fromSLSSolid(symbol, style);
                break;
            default:
                throw `invalid-style: ${symbol.style}`;
        }
    }

    private fromPFS(symbol: ArcGisFeatureServerLayer.Symbol, style: Symbolizer.Format.Style) {
        throw "not-implemented";
    }

    private fromTS(symbol: ArcGisFeatureServerLayer.Symbol, style: Symbolizer.Format.Style) {
        throw "not-implemented";
    }

    public fromJson(symbol: ArcGisFeatureServerLayer.Symbol) {
        let style = <Symbolizer.Format.Style>{};
        this.fromSymbol(symbol, style);
        return symbolizer.fromJson(style);
    }

    private fromSymbol(symbol: ArcGisFeatureServerLayer.Symbol, style: Symbolizer.Format.Style) {

        switch (symbol.type) {
            case "esriSFS":
                this.fromSFS(symbol, style);
                break;

            case "esriSLS":
                this.fromSLS(symbol, style);
                break;

            case "esriPMS":
                this.fromPMS(symbol, style);
                break;

            case "esriPFS":
                this.fromPFS(symbol, style);
                break;

            case "esriSMS":
                this.fromSMS(symbol, style);
                break;

            case "esriTS":
                this.fromTS(symbol, style);
                break;

            default:
                throw `invalid-symbol-type: ${symbol.type}`
        }
    }

    // convert drawing info into a symbology rule
    public fromRenderer(renderer: ArcGisFeatureServerLayer.Renderer, args: {
        url: string
    }) {

        switch (renderer.type) {

            case "simple":
                {
                    return this.fromJson(renderer.symbol);
                }

            case "uniqueValue":
                {
                    let styles = <{ [name: string]: ol.style.Style }>{};

                    let defaultStyle = (renderer.defaultSymbol) && this.fromJson(renderer.defaultSymbol);

                    if (renderer.uniqueValueInfos) {
                        renderer.uniqueValueInfos.forEach(info => {
                            styles[info.value] = this.fromJson(info.symbol);
                        });
                    }

                    return (feature: ol.Feature) => styles[feature.get(renderer.field1)] || defaultStyle;
                }

            case "classBreaks": {
                let styles = <{ [name: number]: ol.style.Style }>{};
                let classBreakRenderer = <ArcGisFeatureServerLayer.ClassBreakRenderer>renderer;
                if (classBreakRenderer.classBreakInfos) {
                    console.log("processing classBreakInfos");
                    if (classBreakRenderer.visualVariables) {
                        classBreakRenderer.visualVariables.forEach(vars => {
                            switch (vars.type) {
                                /**
                                 * This renderer adjusts the size of the symbol to between [minSize..maxSize] 
                                 * based on the range of values [minDataValue, maxDataValue]
                                 */
                                case "sizeInfo": {
                                    let steps = range(classBreakRenderer.authoringInfo.visualVariables[0].minSliderValue, classBreakRenderer.authoringInfo.visualVariables[0].maxSliderValue);
                                    let dx = (vars.maxSize - vars.minSize) / steps.length;
                                    let dataValue = (vars.maxDataValue - vars.minDataValue) / steps.length;

                                    classBreakRenderer.classBreakInfos.forEach(classBreakInfo => {
                                        let icons = steps.map(step => {
                                            let json = $.extend({}, classBreakInfo.symbol);
                                            json.size = vars.minSize + dx * (dataValue - vars.minDataValue);
                                            let style = this.fromJson(json);
                                            styles[dataValue] = style;
                                        });
                                    });
                                    debugger;
                                    break;
                                }
                                default:
                                    debugger;
                                    break;
                            }
                        });
                    }
                }
                return (feature: ol.Feature) => {
                    debugger;
                    let value = feature.get(renderer.field1);
                    for (var key in styles) {
                        // TODO: scan until key > value, return prior style
                        return styles[key];
                    }
                };
            }

            default:
                {
                    debugger;
                    console.error("unsupported renderer type: ", renderer.type);
                    break;
                }
        }

    }

}

