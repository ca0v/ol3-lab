import $ = require("jquery");
import ol = require("openlayers");
import { doif, getParameterByName } from "./common/common";
import { LayerSwitcher, LayerTileOptions } from "ol3-layerswitcher/index";
import { Popup } from "ol3-popup/index";
import { PanZoom } from "ol3-panzoom/index";

import { ArcGisVectorSourceFactory } from "ol3-symbolizer/ol3-symbolizer/ags/ags-source";

function loadCss(url: string) {
	let link = document.createElement("link");
	link.type = "text/css";
	link.rel = "stylesheet";
	link.href = url;
	document.getElementsByTagName("head")[0].appendChild(link);
}

function parse<T>(v: string, type: T): T {
	if (typeof type === "string") return <any>v;
	if (typeof type === "number") return <any>parseFloat(v);
	if (typeof type === "boolean") return <any>(v === "1" || v === "true");
	if (Array.isArray(type)) {
		return <any>v.split(",").map(v => parse(v, (<any>type)[0]));
	}
	throw `unknown type: ${type}`;
}

const html = `
<div class='popup'>
    <div class='popup-container'>
    </div>
</div>
`;

const css = `
<style name="popup" type="text/css">
    html, body, .map {
        width: 100%;
        height: 100%;
        padding: 0;
        overflow: hidden;
        margin: 0;    
    }
</style>
`;

let center = {
	fire: [-117.754430386, 34.2606862490001],
	wichita: [-97.4, 37.8],
	vegas: [-115.235, 36.173]
};

export function run() {
	$(html).appendTo(".map");
	$(css).appendTo("head");

	// relative to root/built but need way to prevent loading multiple copies (cssin should be extended to support urls)
	loadCss("../static/css/ol3-layerswitcher.css");
	loadCss("../static/css/ol3-popup.css"); // <-- does not exist!!!

	let options = {
		srs: "EPSG:4326",
		center: <[number, number]>center.vegas,
		zoom: 10
	};

	{
		let opts = <any>options;
		Object.keys(opts).forEach(k => {
			doif(getParameterByName(k), v => {
				let value = parse(v, opts[k]);
				if (value !== undefined) opts[k] = value;
			});
		});
	}

	let map = new ol.Map({
		target: "map",
		keyboardEventTarget: document,
		loadTilesWhileAnimating: true,
		loadTilesWhileInteracting: true,
		controls: ol.control
			.defaults({
				attribution: false,
				zoom: false
			})
			.extend([
				new PanZoom({
					minZoom: 5,
					maxZoom: 21,
					imgPath:
						"https://raw.githubusercontent.com/ca0v/ol3-panzoom/master/ol3-panzoom/resources/zoombar_black",
					slider: true
				})
			]),
		view: new ol.View({
			projection: options.srs,
			center: options.center,
			minZoom: 5,
			maxZoom: 21,
			zoom: options.zoom
		}),
		layers: [
			new ol.layer.Tile(<LayerTileOptions>{
				title: "OSM",
				type: "base",
				opacity: 0.8,
				visible: true,
				source: new ol.source.OSM()
			}),
			new ol.layer.Tile(<LayerTileOptions>{
				title: "Bing",
				type: "base",
				opacity: 0.8,
				visible: false,
				source: new ol.source.BingMaps({
					key: "AuPHWkNxvxVAL_8Z4G8Pcq_eOKGm5eITH_cJMNAyYoIC1S_29_HhE893YrUUbIGl",
					imagerySet: "Aerial"
				})
			})
		]
	});

	ArcGisVectorSourceFactory.create({
		tileSize: 256,
		map: map,
		services: "https://services7.arcgis.com/k0UprFPHKieFB9UY/arcgis/rest/services",
		serviceName: "GoldServer860",
		serviceType: "FeatureServer",
		layers: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].reverse()
	}).then(agsLayers => {
		agsLayers.forEach(agsLayer => {
			agsLayer.setVisible(false);
			map.addLayer(agsLayer);
		});

		let layerSwitcher = new LayerSwitcher({});
		layerSwitcher.setMap(map);

		let popup = Popup.create({
			map: map,
			css: `
            .ol-popup {
                background-color: white;
            }
            .ol-popup .page {
                max-height: 200px;
                overflow-y: auto;
            }
            `
		});

		map.on("click", (event: Event & { coordinate: any; pixel: any }) => {
			console.log("click");
			let coord = event.coordinate;
			popup.hide();

			let pageNum = 0;
			map.forEachFeatureAtPixel(event.pixel, (feature: ol.Feature, layer) => {
				let page = document.createElement("p");
				let keys = Object.keys(feature.getProperties()).filter(key => {
					let v = feature.get(key);
					if (typeof v === "string") return true;
					if (typeof v === "number") return true;
					return false;
				});
				page.title = "" + ++pageNum;
				page.innerHTML = `<table>${keys
					.map(k => `<tr><td>${k}</td><td>${feature.get(k)}</td></tr>`)
					.join("")}</table>`;

				popup.pages.add(page, feature.getGeometry());
			});

			popup.show(coord, `<label>${pageNum} Features Found</label>`);
			popup.pages.goto(0);
		});
	});

	return map;
}
