import Encoder = require("../google-polyline");

export function run() {
    let encoder = new Encoder();
    let polyline = [[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]];
    console.assert(encoder.decode(encoder.encode(polyline)).join() === polyline.join());
    // this google encoded value of the same array places x first so the x/y values are reversed
    console.assert("_p~iF~ps|U_ulLnnqC_mqNvxq`@" === encoder.encode(polyline.map(p => p.reverse())));
}
