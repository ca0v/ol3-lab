import MapMaker = require("../labs/mapmaker");

import {Geocoder} from "../ux/controls/input";
import {OpenStreet} from "../labs/providers/osm";

export function run() {

    let map = MapMaker.run();
    let searchProvider = new OpenStreet();

    // vertical elipsis: &#x22EE;
    let geocoder = Geocoder.create({
        closedText: "+",
        openedText: "−"
    });
    map.addControl(geocoder);

    geocoder.on("change", (args: { value: string }) => {
        if (!args.value) return;
        console.log("search", args.value);

        let searchArgs = searchProvider.getParameters({
            query: args.value,
            limit: 1,
            countrycodes: 'us',
            lang: 'en'
        });

        $.ajax({
            url: searchArgs.url,
            method: searchProvider.method || 'GET',
            data: searchArgs.params,
            dataType: searchProvider.dataType || 'json'
        }).then(json => {
            let results = searchProvider.handleResponse(json);
            results.some(r => {
                console.log(r);
                map.getView().setCenter([r.lon, r.lat]);
                return true;
            });
        }).fail(() => {
            console.error("geocoder failed");
        });

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