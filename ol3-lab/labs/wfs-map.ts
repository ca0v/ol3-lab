import ol = require("openlayers");
import { cssin, mixin } from "ol3-fun/ol3-fun/common";
import MapMaker = require("./mapmaker");

const idealTextColor = ([a, b, c]: number[]) => (150 < a * 0.299 + b * 0.587 + c * 0.114 ? "black" : "white");

function asColor(value: string) {
	let seed = value.length;
	for (let i = 0; i < value.length; i++) seed += value.charCodeAt(i);
	return seed % 255;
}

export function run() {
	let url =
		"http://localhost:8083/geoserver/cite/wfs?SERVICE=WFS&VERSION=1.1.0&REQUEST=GetFeature&outputFormat=text/javascript";

	let map = MapMaker.run().then(map => {
		let format = new ol.format.GeoJSON();

		(<any>window).___parseResponse___ = function(data: { features: any[] }) {
			let features = data.features.map(f => format.readFeature(f));
			wfsSource.addFeatures(features);
		};

		let strategy = ol.loadingstrategy.tile(
			ol.tilegrid.createXYZ({
				tileSize: 1024
			})
		);

		let wfsSource = new ol.source.Vector({
			loader: (extent, resolution, projection) => {
				let srs = projection.getCode();
				$.ajax({
					url: `${url}&typename=cite:usa_adm2&srsname=${srs}&bbox=${extent.join(",")},${encodeURIComponent(
						srs
					)}&format_options=callback:___parseResponse___`,
					jsonp: false,
					dataType: "jsonp"
				});
			},
			strategy: strategy
		});

		let wfsLayer = new ol.layer.Vector({
			source: wfsSource,
			style: (feature: ol.Feature, resolution) => {
				let style = <ol.style.Style>feature.getStyle();
				if (!style) {
					let stateColor = asColor(feature.get("name_1"));
					let color = asColor(feature.get("name_2"));
					let style = new ol.style.Style({
						text: new ol.style.Text({
							text: feature.get("name_2"),
							fill: new ol.style.Fill({
								color: idealTextColor([color, color, color])
							})
						}),
						fill: new ol.style.Fill({
							color: `rgba(${color}, ${color}, ${color}, 0.5)`
						}),
						stroke: new ol.style.Stroke({
							color: `rgba(${stateColor}, ${stateColor}, ${stateColor}, 1.0)`,
							width: 1
						})
					});
					feature.setStyle(style);
				}
				return style;
			}
		});

		map.addLayer(wfsLayer);
	});
}
