/**
 * Use [ol.format.Polyline](http://openlayers.org/en/master/apidoc/ol.format.Polyline.html)
 */

import ol = require("openlayers");

class PolylineEncoder {

    private flatten(coordinates: number[][]) {
        let nums = new Array(coordinates.length * 2);
        let i = 0;
        coordinates.forEach(p => {
            nums[i++] = p[0];
            nums[i++] = p[1];
        });
        return nums;
    }

    private unflatten(nums: number[]) {
        let coordinates = <number[][]>new Array(nums.length / 2);
        for (let i = 0; i < nums.length; i += 2) {
            coordinates[i / 2] = [nums[i], nums[i + 1]]
        }
        return coordinates;
    }

    decode(str: string, precision = 5) {
        let factor = Math.pow(10, precision);
        let nums = <number[]>ol.format.Polyline.decodeDeltas(str, 2, factor);
        return this.unflatten(nums.map(n => Math.round(n * factor) / factor));
    }

    encode(coordinates: number[][], precision = 5) {
        return <string>(ol.format.Polyline.encodeDeltas(this.flatten(coordinates), 2, Math.pow(10, precision)));
    }

}

export = PolylineEncoder;
