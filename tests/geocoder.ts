import MapMaker = require("../labs/mapmaker");

import {Geocoder} from "../ux/controls/input";

export function run() {

    let map = MapMaker.run();

    // vertical elipsis: &#x22EE;
    let geocoder = Geocoder.create({ label: "»" });
    map.addControl(geocoder);

    geocoder.on("change", (args: { value: string }) => {
        args.value && console.log("search", args.value);
    })

}