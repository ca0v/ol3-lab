import OlEncoder = require("../labs/common/ol3-polyline");
import Encoder = require("../labs/common/google-polyline");

const polyline = [[38.5, -120.2], [40.7, -120.95], [43.252, -126.453]];
const encoding = "_p~iF~ps|U_ulLnnqC_mqNvxq`@";

export function run() {
    {
        // sanity check on encoder
        let encoder = new Encoder();
        console.assert(encoder.encode(encoder.decode(encoding)) === encoding);
        console.assert(encoding === encoder.encode(polyline));
    }
    {
        // sanity check on ol encoder (failing)
        let olEncoder = new OlEncoder();
        console.assert(olEncoder.encode(olEncoder.decode(encoding)) === encoding);
        console.assert(encoding === olEncoder.encode(polyline));
    }

}
