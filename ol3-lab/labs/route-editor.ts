import ol = require("openlayers");
import { StyleConverter, Format } from "ol3-symbolizer/index";
import { defaults } from "./common/common";

const delta = 16;

let formatter = new StyleConverter();

function fromJson(styles: Format.Style[]) {
	return styles.map(style => formatter.fromJson(style));
}

function asPoint(pt: ol.Feature) {
	return (<ol.geom.Point>pt.getGeometry()).getFirstCoordinate();
}

const defaultLineStyle = (color: string) => [
	{
		stroke: {
			color: color,
			width: 4
		}
	},
	{
		stroke: {
			color: "white",
			width: 1
		}
	}
];

export interface RouteOptions {
	color?: string;
	delta?: number;
	start?: ol.Coordinate;
	finish?: ol.Coordinate;
	stops?: ol.Coordinate[];
	lineStyle?: Format.Style[];
	showLines?: boolean;
	modifyRoute?: boolean;
	modifyStartLocation?: boolean;
	modifyFinishLocation?: boolean;
}

export class Route {
	private modify: ol.interaction.Modify;
	private options: RouteOptions;
	private routeLine: ol.Feature;
	public routeStops: ol.Feature[];
	public startLocation: ol.Feature;
	public finishLocation: ol.Feature;

	constructor(options: RouteOptions) {
		this.options = defaults(options, {
			color: "black",
			delta: delta,
			stops: [],
			showLines: true,
			modifyRoute: false,
			modifyStartLocation: true,
			modifyFinishLocation: true,
			lineStyle: defaultLineStyle(options.color || "black")
		});

		this.create();
	}

	get delta() {
		return this.options.delta;
	}

	get start() {
		return this.startLocation && asPoint(this.startLocation);
	}

	get finish() {
		return this.finishLocation && asPoint(this.finishLocation);
	}

	get route() {
		return (<ol.geom.LineString>this.routeLine.getGeometry()).getCoordinates();
	}

	get stops() {
		return this.routeStops.map(asPoint);
	}

	create() {
		let [color, start, finish, stops] = [
			this.options.color,
			this.options.start,
			this.options.finish,
			this.options.stops
		];

		if (this.options.showLines) {
			let feature = (this.routeLine = new ol.Feature(new ol.geom.LineString(stops)));
			feature.set("color", color);
			feature.setStyle(fromJson(this.options.lineStyle));
		}

		let points = (this.routeStops = stops.map(p => new ol.Feature(new ol.geom.Point(p))));
		if (start) {
			let startingLocation = (this.startLocation = new ol.Feature(new ol.geom.Point(start)));

			startingLocation.on("change:geometry", () => {
				console.log("moved start location");
			});

			startingLocation.set("color", color);
			startingLocation.set("text", "A");

			startingLocation.setStyle(
				fromJson([
					{
						circle: {
							fill: {
								color: "transparent"
							},
							opacity: 0.5,
							stroke: {
								color: "green",
								width: 5
							},
							radius: this.delta
						}
					},
					{
						circle: {
							fill: {
								color: "transparent"
							},
							opacity: 1,
							stroke: {
								color: "white",
								width: 1
							},
							radius: this.delta
						}
					}
				])
			);
		}

		if (finish) {
			let endingLocation = (this.finishLocation = new ol.Feature(new ol.geom.Point(finish)));

			endingLocation.set("color", color);
			endingLocation.set("text", "Z");

			endingLocation.setStyle(
				fromJson([
					{
						star: {
							fill: {
								color: "transparent"
							},
							opacity: 1,
							stroke: {
								color: "red",
								width: 5
							},
							radius: this.delta * 0.75,
							points: 8,
							angle: 0.39
						}
					},
					{
						star: {
							fill: {
								color: "transparent"
							},
							opacity: 1,
							stroke: {
								color: "white",
								width: 1
							},
							radius: this.delta * 0.75,
							points: 8,
							angle: 0.39
						}
					},
					{
						circle: {
							fill: {
								color: color
							},
							opacity: 0.5,
							stroke: {
								color: color,
								width: 1
							},
							radius: 5
						}
					}
				])
			);
		}

		points.forEach((p, stopIndex) => {
			p.set("color", color);
			p.set("text", 1 + stopIndex + "");

			p.setStyle(
				(res: number) =>
					<any>[
						new ol.style.Style({
							image: new ol.style.Circle({
								radius: this.delta,
								fill: new ol.style.Fill({
									color: p.get("color")
								})
							})
						}),
						new ol.style.Style({
							image: new ol.style.Circle({
								radius: this.delta - 2,
								stroke: new ol.style.Stroke({
									color: "white",
									width: 1
								})
							})
						}),
						new ol.style.Style({
							text: new ol.style.Text({
								font: `${this.delta * 0.75}pt Segoe UI`,
								text: p.get("text"),
								fill: new ol.style.Fill({
									color: "white"
								}),
								stroke: new ol.style.Stroke({
									color: "black",
									width: 1
								})
							})
						})
					]
			);
		});
	}

	isNewVertex() {
		let lineSegmentCount = this.route.length;
		this.start && lineSegmentCount--;
		this.finish && lineSegmentCount--;
		let stopCount = this.routeStops.length;
		return stopCount < lineSegmentCount;
	}

	owns(feature: ol.Feature) {
		return this.routeLine && feature === this.routeLine;
	}

	allowModify(collection: ol.Collection<ol.Feature>) {
		if (this.options.showLines) {
			collection.push(this.routeLine);
		}
	}

	appendTo(layer: ol.layer.Vector) {
		this.routeLine && layer.getSource().addFeatures([this.routeLine]);
		this.startLocation && layer.getSource().addFeature(this.startLocation);
		this.routeStops && layer.getSource().addFeatures(this.routeStops);
		this.finishLocation && layer.getSource().addFeature(this.finishLocation);
	}

	findStop(map: ol.Map, location: ol.Coordinate) {
		return this.findStops(map, location, this.stops)[0];
	}

	isStartingLocation(map: ol.Map, location: ol.Coordinate) {
		return !!this.start && 1 === this.findStops(map, location, [this.start]).length;
	}

	isEndingLocation(map: ol.Map, location: ol.Coordinate) {
		return !!this.finish && 1 === this.findStops(map, location, [this.finish]).length;
	}

	findStops(map: ol.Map, location: ol.Coordinate, stops: ol.Coordinate[]) {
		let pixel = map.getPixelFromCoordinate(location);
		let [x1, y1, x2, y2] = [
			pixel[0] - this.delta,
			pixel[1] + this.delta,
			pixel[0] + this.delta,
			pixel[1] - this.delta
		];
		[x1, y1] = map.getCoordinateFromPixel([x1, y1]);
		[x2, y2] = map.getCoordinateFromPixel([x2, y2]);
		let extent = [x1, y1, x2, y2] as ol.Extent;

		let result = <number[]>[];
		stops.some((p, i) => {
			if (ol.extent.containsCoordinate(extent, p)) {
				result.push(i);
				return true;
			}
		});
		return result;
	}

	removeStop(index: number) {
		let stop = this.routeStops[index];
		this.routeStops.splice(index, 1);
		return stop;
	}

	addStop(stop: ol.Feature, index?: number) {
		if (index === undefined) this.routeStops.push(stop);
		else this.routeStops.splice(index, 0, stop);
	}

	refresh(map: ol.Map) {
		this.routeStops.map((stop, index) => {
			stop.set("color", this.options.color);
			stop.set("text", 1 + index + "");
		});
		let coords = this.stops;

		this.start && coords.unshift(this.start);
		this.finish && coords.push(this.finish);

		this.routeLine && this.routeLine.setGeometry(new ol.geom.LineString(coords));

		if (this.options.modifyRoute || this.options.modifyFinishLocation || this.options.modifyStartLocation) {
			let modify = this.modify;
			if (modify) {
				modify.setActive(false);
				map.removeInteraction(modify);
			}
			let features = new ol.Collection<ol.Feature>();

			if (this.options.modifyStartLocation) {
				this.startLocation && features.push(this.startLocation);
			}
			if (this.options.modifyFinishLocation) {
				if (this.options.modifyStartLocation && this.startLocation && this.finishLocation) {
					if (
						ol.coordinate.toStringXY(asPoint(this.startLocation), 5) ===
						ol.coordinate.toStringXY(asPoint(this.finishLocation), 5)
					) {
						// just let the start location move for the time being
					} else {
						features.push(this.finishLocation);
					}
				}
			}

			if (this.options.modifyRoute) {
				this.routeStops && this.routeStops.forEach(s => features.push(s));
			}

			modify = this.modify = new ol.interaction.Modify({
				pixelTolerance: 8,
				features: features
			});

			modify.on("modifyend", () => {
				this.refresh(map);
			});
			map.addInteraction(modify);
		}
	}
}
