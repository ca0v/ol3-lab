/**
 * Use [ol.format.Polyline](http://openlayers.org/en/master/apidoc/ol.format.Polyline.html)
 */

import ol = require("openlayers");

interface Polyline extends ol.format.Polyline {
    decodeDeltas(code: string, stride: number, factor: number): number[];
    encodeDeltas(points: number[], stride: number, factor: number): string;
}

const Polyline = <Polyline><any>ol.format.Polyline;

class PolylineEncoder {

    constructor(public precision = 5, public stride = 2) {
    }

    private flatten(points: number[][]) {
        let nums = new Array(points.length * this.stride);
        let i = 0;
        points.forEach(p => p.map(p => nums[i++] = p));
        return nums;
    }

    private unflatten(nums: number[]) {
        let points = <number[][]>new Array(nums.length / this.stride);
        for (let i = 0; i < nums.length / this.stride; i++) {
            points[i] = nums.slice(i * this.stride, (i + 1) * this.stride);
        }
        return points;
    }

    round(nums: number[]) {
        let factor = Math.pow(10, this.precision);
        return nums.map(n => Math.round(n * factor) / factor);
    }

    decode(str: string) {
        let nums = Polyline.decodeDeltas(str, this.stride, Math.pow(10, this.precision));
        return this.unflatten(this.round(nums));
    }

    encode(points: number[][]) {
        return Polyline.encodeDeltas(this.flatten(points), this.stride, Math.pow(10, this.precision));
    }

}

export = PolylineEncoder;
