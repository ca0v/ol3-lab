import ol = require("openlayers");

import Serializer = require("./serializer");
import { StyleConverter } from "ol3-symbolizer/ol3-symbolizer/format/ags-symbolizer";


const converter = new StyleConverter();

export class SimpleMarkerConverter implements Serializer.IConverter<any> {

    toJson(style: ol.style.Style) {
        throw "not-implemented";
    }

    fromJson(json: any) {
        return converter.fromJson(json);
    }

} 