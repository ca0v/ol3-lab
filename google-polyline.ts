/**
 * https://developers.google.com/maps/documentation/utilities/polylinealgorithm?csw=1
 * https://github.com/DeMoehn/Cloudant-nyctaxi/blob/2e48cb6c53bd4ac4f58d50d9302f00fc72f6681e/app/js/polyline.js
 * Use [ol.format.Polyline](http://openlayers.org/en/master/apidoc/ol.format.Polyline.html) instead
 */

import ol = require("openlayers");

let reader = new ol.format.Polyline();

class PolylineEncoder {

    decode(str: string, precision = 5) {
        return (<ol.geom.LineString>reader.readGeometryFromText(str, {
            factor: Math.pow(10, precision)
        })).getCoordinates();
    }

    encode(coordinates: number[][], precision = 5) {
        return <string>(reader.writeGeometryText(new ol.geom.LineString(coordinates)));
    }

}

export = PolylineEncoder;
