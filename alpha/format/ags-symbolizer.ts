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
        "esriSMSCircle" | "esriSMSDiamond" | "esriSMSX" | "esriSMSCross" | "esriSLSSolid"
        | "esriSFSSolid" | "esriSLSDot" | "esriSLSDash"
        | "esriSLSDashDot" | "esriSLSDashDotDot" | "esriSFSForwardDiagonal";

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

const typeMap = {
    "esriSMS": "sms", // simple marker symbol
    "esriSLS": "sls", // simple line symbol
    "esriSFS": "sfs", // simple fill symbol
    "esriPMS": "pms", // picture marker symbol
    "esriPFS": "pfs", // picture fill symbol
    "esriTS": "txt", // text symbol
}

function as(v: number) {
    return "" + v + "px";
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

    private asColor(color: ArcGisFeatureServerLayer.Color) {
        if (color.length === 4) return `rgba(${color[0]},${color[1]},${color[2]},${color[3] / 255})`;
        if (color.length === 3) return `rgb(${color[0]},${color[1]},${color[2]}})`;
        return "#" + color.map(v => ("0" + v.toString(16)).substr(0, 2)).join("");
    }

    private asStroke(outline: ArcGisFeatureServerLayer.Outline) {
        let stroke = <Symbolizer.Format.Stroke>{};

        switch (outline.type) {
            case "esriSLS": {
                switch (outline.style) {
                    case "esriSLSSolid": {
                        stroke.color = this.asColor(outline.color);
                        stroke.width = outline.width;
                        break;
                    }
                    default: {
                        debugger;
                        break;
                    }
                }
                break;
            }
            default: {
                debugger;
                break;
            }
        }
        return stroke;
    }

    public fromJson(symbol: ArcGisFeatureServerLayer.Symbol) {
        let style = <Symbolizer.Format.Style>{};

        switch (symbol.type) {
            case "esriSFS": {
                switch (symbol.style) {
                    case "esriSFSSolid": {
                        style.fill = {
                            color: this.asColor(symbol.color)
                        };
                        style.stroke = this.asStroke(symbol.outline);
                        break;
                    }
                    default: {
                        debugger;
                        break;
                    }
                }
                break;
            }

            case "esriSMS": {
                switch (symbol.style) {
                    case "esriSMSCircle": {
                        style.circle = {
                            fill: symbol.color,
                            opacity: 1,
                            radius: symbol.size,
                            stroke: {
                                color: this.asColor(symbol.outline.color),
                            },
                            snapToPixel: true
                        };
                        style.circle.stroke.color
                        break;
                    }
                    default: {
                        debugger;
                        break;
                    }
                }
            }

            default: {
                debugger;
                break;
            }

        }
        return symbolizer.fromJson(style);
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

