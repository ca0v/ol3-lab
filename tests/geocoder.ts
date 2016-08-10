import MapMaker = require("../labs/mapmaker");

import {Geocoder} from "../ux/controls/input";

export function run() {

    let map = MapMaker.run();

    // vertical elipsis: &#x22EE;
    let geocoder = Geocoder.create({
        closedText: "+",
        openedText: "−"
    });
    map.addControl(geocoder);

    geocoder.on("change", (args: { value: string }) => {
        args.value && console.log("search", args.value);
    });

    map.addControl(Geocoder.create({
        className: 'ol-input bottom right',
        expanded: true
    }));

    map.addControl(Geocoder.create({
        className: 'ol-input top right',
        expanded: false
    }));

    map.addControl(Geocoder.create({
        className: 'ol-input top left',
        expanded: false
    }));

}