/**
 * https://developers.google.com/maps/documentation/utilities/polylinealgorithm?csw=1
 * https://github.com/DeMoehn/Cloudant-nyctaxi/blob/2e48cb6c53bd4ac4f58d50d9302f00fc72f6681e/app/js/polyline.js
 */
class PolylineEncoder {

    private encodeCoordinate(coordinate: number, factor: number) {
        coordinate = Math.round(coordinate * factor);
        coordinate <<= 1;
        if (coordinate < 0) {
            coordinate = ~coordinate;
        }
        let output = '';
        while (coordinate >= 0x20) {
            output += String.fromCharCode((0x20 | (coordinate & 0x1f)) + 0x3f);
            coordinate >>= 5;
        }
        output += String.fromCharCode(coordinate + 0x3f);
        return output;
    }

    decode(str: string, precision = 5) {
        let index = 0,
            lat = 0,
            lng = 0,
            coordinates = <number[][]>[],
            latitude_change: number,
            longitude_change: number,
            factor = Math.pow(10, precision);

        while (index < str.length) {

            let byte = 0;
            let shift = 0;
            let result = 0;

            do {
                byte = str.charCodeAt(index++) - 0x3f;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);

            let latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

            shift = result = 0;

            do {
                byte = str.charCodeAt(index++) - 0x3f;
                result |= (byte & 0x1f) << shift;
                shift += 5;
            } while (byte >= 0x20);

            longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

            lat += latitude_change;
            lng += longitude_change;

            coordinates.push([lat / factor, lng / factor]);
        }

        return coordinates;
    }

    encode(coordinates: number[][], precision = 5) {
        if (!coordinates.length) return '';

        let factor = Math.pow(10, precision),
            output = this.encodeCoordinate(coordinates[0][0], factor) + this.encodeCoordinate(coordinates[0][1], factor);

        for (let i = 1; i < coordinates.length; i++) {
            let a = coordinates[i], 
            b = coordinates[i - 1];
            output += this.encodeCoordinate(a[0] - b[0], factor);
            output += this.encodeCoordinate(a[1] - b[1], factor);
        }

        return output;
    }

}

export = PolylineEncoder;