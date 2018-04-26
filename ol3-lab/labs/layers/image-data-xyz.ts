import * as $ from "jquery";
import ol = require("openlayers");
import * as imageData from "../../tests/data/image-data";

$(`<style name="popup" type="text/css">
.map {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0
}
</style>`).appendTo("head");

// not sure how to declare TileState outside of the ol.d.ts so duplicating here
enum TileState {
    IDLE = 0,
    LOADING = 1,
    LOADED = 2,
    ERROR = 3,
    EMPTY = 4,
    ABORT = 5
}

export function run() {
    console.log("running layers/image-data-xyz");

    let projection = ol.proj.get("EPSG:4326");

    let [minZoom, maxZoom] = [0, 20];

    let tileGrid = ol.tilegrid.createXYZ({
        extent: projection.getExtent(),
        minZoom: minZoom,
        maxZoom: maxZoom,
        tileSize: 512,
    });

    let map = new ol.Map({
        target: "map",
        view: new ol.View({
            projection: projection,
            center: [-82.4, 34.85],
            zoom: 15,
            minZoom: minZoom,
            maxZoom: maxZoom,
        }),
        layers: [new ol.layer.Tile({
            source: new ol.source.TileImage({
                opaque: false,
                projection: projection,
                tileGrid: tileGrid,
                tileUrlFunction: (coords: ol.TileCoord, pixelRatio: number, proj: ol.proj.Projection) => imageData,
            })
        })]
    });

}