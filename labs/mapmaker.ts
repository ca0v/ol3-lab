import ol = require("openlayers");

export function run() {

    let map = new ol.Map({
        target: "map",
        view: new ol.View({
            projection: 'EPSG:4326',
            center: [-82.4, 34.85],
            zoom: 15
        }),
        layers: [new ol.layer.Tile({
            source: new ol.source.OSM({
                layer: "sat"
            })
        })]
    });

    return map;
}