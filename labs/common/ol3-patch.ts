import ol3 = require("openlayers");
import {mixin} from "./common";

/**
 * https://github.com/openlayers/ol3/issues/5684
 */
ol3.geom.SimpleGeometry.prototype.scale = ol3.geom.SimpleGeometry.prototype.scale ||
    function (deltaX: number, deltaY: number) {
        var flatCoordinates = this.getFlatCoordinates();
        if (flatCoordinates) {
            var stride = this.getStride();
            ol3.geom.flat.transform.scale(
                flatCoordinates, 0, flatCoordinates.length, stride,
                deltaX, deltaY, flatCoordinates);
            this.changed();
        }
    }

ol3.geom.flat.transform.scale = ol3.geom.flat.transform.scale ||
    function (flatCoordinates: number[], offset: number, end: number, stride: number, deltaX: number, deltaY: number, opt_dest: number[]) {
        var dest = opt_dest ? opt_dest : [];
        var i = 0;
        var j: number, k: number;
        for (j = offset; j < end; j += stride) {
            dest[i++] = flatCoordinates[j] * deltaX;
            dest[i++] = flatCoordinates[j + 1] * deltaY;
            for (k = j + 2; k < j + stride; ++k) {
                dest[i++] = flatCoordinates[k];
            }
        }
        if (opt_dest && dest.length != i) {
            dest.length = i;
        }
        return dest;
    };


export = ol3;