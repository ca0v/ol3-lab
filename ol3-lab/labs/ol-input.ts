import ol = require("openlayers");
import $ = require("jquery");

import { Input } from "ol3-input/ol3-input/ol3-input";
import { OpenStreet } from "ol3-input/ol3-input/providers/osm";
import { cssin, navigation } from "ol3-fun/index";
import { ArcGisVectorSourceFactory } from "ol3-symbolizer/ol3-symbolizer/ags/ags-source";

const css = `
html,body,.map {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
}

.ol-input input {
    height: 1.75em !important;
}

.ol-input.statecode > input {
    text-transform: uppercase;
    width: 2em;
    text-align: center;
}
`;

const DEFAULT_STYLE = new ol.style.Style({
	image: new ol.style.Circle({
		radius: 4,
		fill: new ol.style.Fill({
			color: "rgba(33, 33, 33, 0.2)"
		}),
		stroke: new ol.style.Stroke({
			color: "#F00"
		})
	}),
	text: new ol.style.Text({
		text: "TEXT GOES HERE"
	})
});

export function run() {
	cssin("examples/ol3-input", css);

	let searchProvider = new OpenStreet();

	let center = ol.proj.transform([-85, 35], "EPSG:4326", "EPSG:3857");

	let mapContainer = document.getElementsByClassName("map")[0];

	let map = new ol.Map({
		loadTilesWhileAnimating: true,
		target: mapContainer,
		layers: [],
		view: new ol.View({
			center: center,
			projection: "EPSG:3857",
			zoom: 6
		})
	});

	let source = new ol.source.Vector();

	let vector = new ol.layer.Vector({
		source: source
	});

	ArcGisVectorSourceFactory.create({
		map: map,
		services: "https://services.arcgis.com/P3ePLMYs2RVChkJx/ArcGIS/rest/services",
		serviceName: "USA_States_Generalized",
		serviceType: "FeatureServer",
		uidFieldName: "FID",
		layers: [0]
	})
		.then(layers => {
			layers.forEach(layer => {
				map.addLayer(layer);

				Input.create({
					map: map,
					className: "ol-input statecode",
					position: "top left-2",
					closedText: "+",
					openedText: "−",
					autoSelect: true,
					autoClear: false,
					autoCollapse: false,
					placeholderText: "XX"
				}).on("change", args => {
					let value = args.value.toLocaleLowerCase();
					let feature = layer.getSource().forEachFeature(feature => {
						let text = <string>feature.get("STATE_ABBR");
						if (!text) return;
						if (-1 < text.toLocaleLowerCase().indexOf(value)) {
							return feature;
						}
					});
					if (feature) {
						navigation.zoomToFeature(map, feature);
					} else {
						changeHandler({ value: value });
					}
				});
			});
		})
		.then(() => {
			map.addLayer(vector);
		});

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
			.then(json => {
				let results = searchProvider.handleResponse(json);
				results.some(r => {
					console.log(r);
					if (r.original.boundingbox) {
						let [lat1, lat2, lon1, lon2] = r.original.boundingbox.map(v => parseFloat(v));
						[lon1, lat1] = ol.proj.transform([lon1, lat1], "EPSG:4326", "EPSG:3857");
						[lon2, lat2] = ol.proj.transform([lon2, lat2], "EPSG:4326", "EPSG:3857");
						let extent = <ol.Extent>[lon1, lat1, lon2, lat2];

						let feature = new ol.Feature(
							new ol.geom.Polygon([
								[
									ol.extent.getBottomLeft(extent),
									ol.extent.getTopLeft(extent),
									ol.extent.getTopRight(extent),
									ol.extent.getBottomRight(extent),
									ol.extent.getBottomLeft(extent)
								]
							])
						);

						feature.set("text", r.original.display_name);
						source.addFeature(feature);
						navigation.zoomToFeature(map, feature);
					} else {
						let [lon, lat] = ol.proj.transform([r.lon, r.lat], "EPSG:4326", "EPSG:3857");
						let feature = new ol.Feature(new ol.geom.Point([lon, lat]));
						feature.set("text", r.original.display_name);
						source.addFeature(feature);
						navigation.zoomToFeature(map, feature);
					}
					return true;
				});
			})
			.fail(() => {
				console.error("geocoder failed");
			});
	};

	let input = Input.create({
		map: map,
		className: "ol-input",
		position: "bottom-2 right",
		expanded: true,
		placeholderText: "Bottom Right Search"
	});
	input.on("change", changeHandler);

	Input.create({
		map: map,
		className: "ol-input",
		position: "top right",
		expanded: true,
		openedText: "?",
		placeholderText: "Feature Finder",
		autoClear: true,
		autoCollapse: false,
		canCollapse: false,
		hideButton: true
	}).on("change", args => {
		let value = args.value.toLocaleLowerCase();
		let feature = source.forEachFeature(feature => {
			let text = <string>feature.get("text");
			if (!text) return;
			if (-1 < text.toLocaleLowerCase().indexOf(value)) {
				return feature;
			}
		});
		if (feature) {
			map.getView().animate({
				center: feature.getGeometry().getClosestPoint(map.getView().getCenter()),
				duration: 1000
			});
		} else {
			changeHandler({ value: value });
		}
	});
}
