import MapMaker = require("../labs/mapmaker");

import {Input as Geocoder} from "ol3-input";
import {OpenStreet} from "ol3-input/ol3-input/providers/osm";

export function run() {

    MapMaker.run().then(map => {
        let searchProvider = new OpenStreet();

        let changeHandler = (args: { value: string }) => {
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
                    if (r.original.boundingbox) {
                        let [lat1, lat2, lon1, lon2] = r.original.boundingbox.map(v => parseFloat(v));
                        map.getView().fit([lon1, lat1, lon2, lat2], map.getSize());
                    } else {
                        map.getView().setCenter([r.lon, r.lat]);
                    }
                    return true;
                });
            }).fail(() => {
                console.error("geocoder failed");
            });

        };

        // vertical elipsis: &#x22EE;
        let geocoder = Geocoder.create({
            closedText: "+",
            openedText: "−",
            placeholderText: "Bottom Left Search",
            onChange: changeHandler
        });
        map.addControl(geocoder);

        map.addControl(Geocoder.create({
            className: 'ol-input bottom right',
            expanded: true,
            placeholderText: "Bottom Right Search",
            onChange: changeHandler
        }));

        map.addControl(Geocoder.create({
            className: 'ol-input top right',
            expanded: false,
            placeholderText: "Top Right",
            onChange: changeHandler
        }));

        map.addControl(Geocoder.create({
            className: 'ol-input top left',
            expanded: false,
            placeholderText: "Top Left Search",
            onChange: changeHandler
        }));

    });
}