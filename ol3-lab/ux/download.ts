import ol = require("openlayers");
import $ = require("jquery");

/**
 * Similar to right-clicking and saving the image but proxies everything first
 * Therefore we need a proxy service for this to work.
 * [ESRI's Proxy](https://github.com/Esri/resource-proxy/tree/master/DotNet)
 *
 * Step 1 is to get imagery from a remote system and render it into a canvas
 */

// see [ESRI's Proxy](https://github.com/Esri/resource-proxy/tree/master/DotNet)
const proxy = "http://localhost:94/proxy/proxy.ashx?";

const center = [-82.4, 34.85] as ol.Coordinate;

const html = `
<div class='download'>
    <h3>Print Preview Lab - Capturing Map Canvas</h3>
    <p>
    This lab only works locally because it requires a proxy and I'm not aware of a github proxy.
    (Good luck searching for github+proxy) 
    </p>

    <div class='area'>    
        <label>Copy Map into toDataURL</label>
        <div class='map'></div>
        <button class='download-map'>Download</button>
    </div>

    <div class='area'>    
        <label>We want to get the map to render into this canvas so that we can right-click and save the image</label>
        <canvas class='canvas-preview'></canvas>
    </div>

    <div class='area'>    
        <label>We want to get the map into this image so that we can get the image data</label>
        <img class='image-preview'></img>
    </div>

    <div class='area'>    
        <label>toDataURL</label>
        <input class='data-url' spellcheck='false autocomplete='off' wrap='hard'></input>
    </div>
</div>`;

const css = `
<style>
    #map { 
        display: none;
    }
    .download {
        padding: 20px;
    }
    .download .map {
        width: 400px;
        height: 400px;
    }
    .download label {
        display: block;
        vertical-align: top;
    }
    .download .area {
        padding: 20px;
        margin: 20px;
        border: 1px solid black;
    }
    .download .image-preview, .download .canvas-preview {
        border: 1px solid black;
        padding: 20px;
    }
    .download .data-url {
        overflow: auto;
        width: 400px;
    }
</style>`;

const imageUrl =
	"http://sampleserver1.arcgisonline.com/arcgis/rest/services/Demographics/ESRI_Census_USA/MapServer/export?F=image&FORMAT=PNG32&TRANSPARENT=true&layers=show%3A4&SIZE=256%2C256&BBOX=-10488383.273178745%2C4148390.399093086%2C-10410111.756214725%2C4226661.916057106&BBOXSR=3857&IMAGESR=3857&DPI=83";

function copyTo(image: HTMLImageElement, canvas: HTMLCanvasElement) {
	canvas.width = image.naturalWidth;
	canvas.height = image.naturalHeight;
	let ctx = canvas.getContext("2d");
	ctx.drawImage(image, 0, 0);
}

function makeMap() {
	let map = new ol.Map({
		target: $(".download .map")[0],
		view: new ol.View({
			projection: "EPSG:4326",
			center: center,
			zoom: 15
		}),
		layers: [
			new ol.layer.Tile({
				source: new ol.source.OSM()
			})
		]
	});
	return map;
}

export function run() {
	$(html).appendTo("body");
	$(css).appendTo("head");

	$(() => {
		(<any>ol.source.Image).defaultImageLoadFunction = (image: { getImage: () => HTMLImageElement }, src: string) =>
			(image.getImage().src = `${proxy}${src}`);

		let map = makeMap();

		map.addLayer(
			new ol.layer.Image({
				source: new ol.source.ImageArcGISRest({
					ratio: 1,
					params: {},
					projection: "EPSG:3857",
					url:
						"http://sampleserver1.arcgisonline.com/arcgis/rest/services/Demographics/ESRI_Census_USA/MapServer"
				})
			})
		);

		$(".download-map").click(() => {
			map.once("postcompose", (event: ol.MapEvent & { context: CanvasRenderingContext2D }) => {
				let canvas = event.context.canvas;
				//download.ts:107 Uncaught SecurityError: Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported.
				img.src = canvas.toDataURL();
			});
			map.updateSize();
		});
	});

	let img = <HTMLImageElement>$(".image-preview")[0];

	let canvas = <HTMLCanvasElement>$(".canvas-preview")[0];

	// Image from origin 'http://sampleserver1.arcgisonline.com' has been blocked...
	img.setAttribute("crossOrigin", "anonymous");

	img.src = proxy + imageUrl;

	img.onload = () => {
		copyTo(img, canvas);
		// Uncaught SecurityError: Failed to execute 'toDataURL' on 'HTMLCanvasElement': Tainted canvases may not be exported.
		(<HTMLTextAreaElement>document.getElementsByClassName("data-url")[0]).value = canvas.toDataURL();
	};
}
