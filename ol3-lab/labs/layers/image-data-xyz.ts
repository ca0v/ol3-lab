import ol = require("openlayers");
import * as imageData from "../../tests/data/image-data";

// not sure how to declare TileState outside of the ol.d.ts so duplicating here
enum TileState {
    IDLE = 0,
    LOADING = 1,
    LOADED = 2,
    ERROR = 3,
    EMPTY = 4,
    ABORT = 5
}

// not in ol typings
declare namespace olx {
    class TileCache {
        get(key: string): ol.Tile;
        set(key: string, tile: ol.Tile): void;
        containsKey(key: string): boolean;
    }

}

class ImageDataTile extends ol.Tile {

    private imageSize = [672,527]; // where to set this?
    private context: CanvasRenderingContext2D;

    constructor(public tileCoord: [number, number, number], public state = TileState.IDLE) {
        super(tileCoord, state);
        this.load();
    }

    load() {
        if (this.state !== TileState.IDLE) {
            console.log("load not IDLE");
            return;
        }
        let [width, height] = this.imageSize;
        let context = this.context;
        if (!context) {
            context = this.context = ol.dom.createCanvasContext2D(width, height) as CanvasRenderingContext2D;
            let image = new Image();
            image.onload = () => {
                context.fillStyle = "silver";
                context.fillRect(0, 0, width, height);
                context.drawImage(image, 0, 0);
                this.state = TileState.LOADED;
                this.changed();
            }
            image.src = imageData;
        }
    }

    getImage() {
        return this.context.canvas;
    }

}


class ImageDataLayer extends ol.layer.Tile {
    constructor(options: ol.olx.layer.TileOptions) {
        super(options);
    }
}

class ImageDataSource extends ol.source.Tile {

    tileCache: olx.TileCache;

    constructor(options: { opaque: boolean } & ol.SourceTileOptions) {
        super(options);
    }

    private getKeyZXY(z: number, x: number, y: number) {
        return `${z}/${x}/${y}`;
    }

    getTile(z: number, x: number, y: number) {
        let tileCoordKey = this.getKeyZXY(z, x, y);

        let tile: ol.Tile;

        if (!this.tileCache.containsKey(tileCoordKey)) {
            tile = new ImageDataTile([z, x, y]);
            this.tileCache.set(tileCoordKey, tile);
        } else {
            tile = this.tileCache.get(tileCoordKey);
        }
        return tile;
    }
}

export function run() {
    console.log("running layers/image-data-xyz");

    let projection = "EPSG:4326";

    let map = new ol.Map({
        target: "map",
        view: new ol.View({
            projection: projection,
            center: [-82.4, 34.85],
            zoom: 15
        }),
        layers: [new ImageDataLayer({
            source: new ImageDataSource({
                opaque: false,
                projection: projection
            })
        })]
    });

}