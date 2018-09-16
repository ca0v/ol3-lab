import ol = require("openlayers");
import { cssin, mixin } from "ol3-fun/index";
export class MapMaker {
	static DEFAULT_OPTIONS: ol.olx.MapOptions = {};
	static create(options: {
		target: Element;
		center: [number, number];
		projection: string;
		zoom: number;
		basemap: "osm" | "bing";
	}) {
		options = mixin(mixin({}, MapMaker.DEFAULT_OPTIONS), options);
		options.target.classList.add("ol-map");
		cssin(
			"mapmaker",
			`
        .ol-map {
            top: 0;
            left: 0;
            right: 0;
            bottom:0;
            position: absolute;
        }
        `
		);

		let map = new ol.Map({
			target: options.target,
			keyboardEventTarget: document,
			loadTilesWhileAnimating: true,
			loadTilesWhileInteracting: true,
			controls: ol.control.defaults({ attribution: false }),
			view: new ol.View({
				projection: options.projection,
				center: options.center,
				zoom: options.zoom
			}),
			layers: []
		});

		switch (options.basemap) {
			case "osm":
				map.addLayer(
					new ol.layer.Tile({
						opacity: 0.8,
						source: new ol.source.OSM()
					})
				);
				break;
			case "bing":
				map.addLayer(
					new ol.layer.Tile({
						opacity: 0.8,
						source:
							options.basemap !== "bing"
								? new ol.source.OSM()
								: new ol.source.BingMaps({
										key: "AuPHWkNxvxVAL_8Z4G8Pcq_eOKGm5eITH_cJMNAyYoIC1S_29_HhE893YrUUbIGl",
										imagerySet: "Aerial"
								  })
					})
				);
		}
		return map;
	}
}
