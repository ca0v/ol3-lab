import ol3 = require("openlayers");
import {mixin} from "./common";

/**
 * https://github.com/openlayers/ol3/issues/5684
 */

if (!ol3.geom.SimpleGeometry.prototype.scale) {

    let scale = (flatCoordinates: number[], offset: number, end: number, stride: number, deltaX: number, deltaY: number, opt_dest: number[]) => {
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

    mixin(ol3.geom.SimpleGeometry.prototype, {
        scale: function (deltaX: number, deltaY: number) {
            let it = <ol.geom.SimpleGeometry>this;
            it.applyTransform((flatCoordinates, output, stride) => {
                scale(flatCoordinates, 0, flatCoordinates.length, stride,
                    deltaX, deltaY, flatCoordinates);
                return flatCoordinates;
            });
            it.changed();
        }
    });

}

export = ol3;