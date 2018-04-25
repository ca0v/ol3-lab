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

function drawImageScaled(img: HTMLImageElement, ctx: CanvasRenderingContext2D) {
    var canvas = ctx.canvas;
    var hRatio = canvas.width / img.width;
    var vRatio = canvas.height / img.height;
    var ratio = Math.max(hRatio, vRatio);
    var centerShift_x = (canvas.width - img.width * ratio) / 2;
    var centerShift_y = (canvas.height - img.height * ratio) / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, img.width, img.height,
        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
}

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

    private state: TileState; // does not shadow
    private changed: Function; // does not shadow
    private tileSize: [number, number];
    private context: CanvasRenderingContext2D;

    constructor(public tileCoord: [number, number, number], options : {
        tileSize: [number, number]
    }) {        
        super(tileCoord, TileState.IDLE);
        this.tileSize = options.tileSize;
        this.load();
    }

    load() {
        if (this.state !== TileState.IDLE) {
            console.log("load not IDLE");
            return;
        }
        let [width, height] = this.tileSize;
        let context = this.context;
        if (!context) {
            context = this.context = ol.dom.createCanvasContext2D(width, height) as CanvasRenderingContext2D;
            let image = new Image();
            image.onload = () => {
                drawImageScaled(image, context);
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
            let tileGrid = this.getTileGrid();
            let tileSize = ol.size.toSize(tileGrid.getTileSize(z)) as [number, number];
            tile = new ImageDataTile([z, x, y], {
                tileSize: tileSize
            });
            this.tileCache.set(tileCoordKey, tile);
        } else {
            tile = this.tileCache.get(tileCoordKey);
        }
        return tile;
    }
}

export function run() {
    console.log("running layers/image-data-xyz");

    let projection = ol.proj.get("EPSG:4326");

    let tileGrid = ol.tilegrid.createXYZ({
        extent: projection.getExtent(),
        minZoom: 0,
        maxZoom: 20,
        tileSize: 512,
    });

    let map = new ol.Map({
        target: "map",
        view: new ol.View({
            projection: projection,
            center: [-82.4, 34.85],
            zoom: 15,
            minZoom: tileGrid.getMinZoom(),
            maxZoom: tileGrid.getMaxZoom(),
        }),
        layers: [new ImageDataLayer({
            source: new ImageDataSource({
                opaque: false,
                projection: projection,
                tileGrid: tileGrid,
            })
        })]
    });

}