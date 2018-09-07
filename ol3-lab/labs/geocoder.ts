import MapMaker = require("../labs/mapmaker");

import { Input, OsmSearchProvider } from "ol3-input/index";

export function run() {
    MapMaker.run().then((map) => {
        let searchProvider = new OsmSearchProvider();

        let changeHandler = (args: { value: string }) => {
            if (!args.value) return;
            console.log("search", args.value);

            let searchArgs = searchProvider.getParameters({
                query: args.value,
                limit: 1,
                countrycodes: "us",
                lang: "en"
            });

            $.ajax({
                url: searchArgs.url,
                method: searchProvider.method || "GET",
                data: searchArgs.params,
                dataType: searchProvider.dataType || "json"
            })
                .then((json) => {
                    let results = searchProvider.handleResponse(json);
                    results.some((r) => {
                        console.log(r);
                        if (r.original.boundingbox) {
                            let [lat1, lat2, lon1, lon2] = r.original.boundingbox.map((v) => parseFloat(v));
                            map.getView().fit([lon1, lat1, lon2, lat2]);
                        } else {
                            map.getView().setCenter([r.lon, r.lat]);
                        }
                        return true;
                    });
                })
                .fail(() => {
                    console.error("geocoder failed");
                });
        };

        // vertical elipsis: &#x22EE;
        Input.create({
            map: map,
            closedText: "+",
            openedText: "−",
            placeholderText: "Bottom Left Search"
        }).on("change", changeHandler);

        Input.create({
            map: map,
            position: "bottom right",
            expanded: true,
            placeholderText: "Bottom Right Search"
        }).on("change", changeHandler);

        Input.create({
            map: map,
            position: "top right",
            expanded: false,
            placeholderText: "Top Right"
        }).on("change", changeHandler);

        Input.create({
            map: map,
            position: "top left",
            expanded: false,
            placeholderText: "Top Left Search"
        }).on("change", changeHandler);
    });
}
