import ol = require("openlayers");
import { run as mapmaker } from "../labs/mapmaker";
import { Route } from "../labs/route-editor";
import { range } from "ol3-fun/index";

function midpoint(points: number[][]) {
	let p0 = points.reduce((sum, p) => p.map((v, i) => v + sum[i]));
	return p0.map(v => v / points.length);
}

export function run() {
	let features = new ol.Collection([]);
	let activeFeature: ol.Feature;

	features.on("add", (args: Event & { element: ol.Feature }) => {
		let feature = args.element;

		feature.on("change", (args: any) => {
			activeFeature = feature;
		});

		feature.on("change:geometry", (args: any) => {
			console.log("feature change:geometry", args);
		});
	});

	let layer = new ol.layer.Vector({
		source: new ol.source.Vector({
			features: features
		})
	});

	let colors = ["229966", "cc6633", "cc22cc", "331199"].map(v => "#" + v);

	mapmaker().then(map => {
		map.addLayer(layer);

		let [a, b, c, d] = map.getView().calculateExtent(map.getSize().map(v => v * 0.25) as ol.Coordinate);

		let routes = <Route[]>[];

		let shift = [-0.001, -0.005];
		while (colors.length) {
			let stops = range(8).map(
				v =>
					<ol.Coordinate>(
						[a + (c - a) * Math.random(), b + (d - b) * Math.random()].map((v, i) => v + shift[i])
					)
			);
			let startstop = <ol.Coordinate>(
				[a + (c - a) * Math.random(), b + (d - b) * Math.random()].map((v, i) => v + shift[i])
			);

			let route = new Route({
				color: colors.pop(),
				start: startstop,
				finish: startstop,
				stops: stops
			});
			shift = shift.map(v => v + 0.005);
			routes.push(route);
		}

		let redRoute = new Route({
			color: "red",
			showLines: false,
			modifyRoute: true
		});
		routes.push(redRoute);

		routes.forEach(r => {
			r.refresh(map);
			r.appendTo(layer);
		});

		let editFeatures = new ol.Collection<ol.Feature>();
		routes.map(route => route.allowModify(editFeatures));

		let modify = new ol.interaction.Modify({
			pixelTolerance: 8,
			condition: (evt: ol.MapBrowserEvent) => {
				if (!ol.events.condition.noModifierKeys(evt)) return false; // ol.events.condition.primaryAction
				// only if it is not a starting or ending location for any route
				if (routes.some(r => r.isStartingLocation(map, evt.coordinate))) return false;
				if (routes.some(r => r.isEndingLocation(map, evt.coordinate))) return false;
				return true;
			},
			features: editFeatures
		});

		map.addInteraction(modify);

		/**
		 * Can drag existing or new vertex onto stops of a route
		 * Can be same route or another route
		 * A drop on the 1st stop has no effect
		 * A drop of an existing vertex on stop orphans [vertexindex..end] transfers ownership of [stop..end]
		 * A drop of new vertex transfers ownership of [stop]
		 */
		modify.on("modifyend", (args: Event & { mapBrowserEvent: ol.MapBrowserEvent }) => {
			console.log("modifyend", args);
			let dropLocation = args.mapBrowserEvent.coordinate;
			console.log("drop-location", dropLocation);

			let dropInfo = {
				route: <Route>null,
				stops: <number[]>null
			};
			let targetInfo = {
				route: <Route>null,
				vertexIndex: <number>null
			};

			targetInfo.route = routes.filter(route => route.owns(activeFeature))[0];
			console.log("target-route", targetInfo.route);

			{
				let geom = <ol.geom.LineString>activeFeature.getGeometry();
				let coords = geom.getCoordinates();
				let vertex = coords.filter(p => p[0] === dropLocation[0])[0];
				let vertexIndex = coords.indexOf(vertex);
				console.log("vertex", vertexIndex);
				targetInfo.vertexIndex = vertexIndex;

				// use endpoint of line segment of length 0
				if (targetInfo.vertexIndex == 0) {
					targetInfo.vertexIndex = targetInfo.route.stops.length;
				}
			}

			routes.some(route => {
				let stop = route.findStop(map, dropLocation);
				if (stop >= 0) {
					console.log("drop", route, stop);
					dropInfo.route = route;
					dropInfo.stops = [stop];
					return true;
				}
			});

			// new or existing vertex?
			let isNewVertex = targetInfo.route.isNewVertex();
			let dropOnStop = dropInfo.route && 0 < dropInfo.stops.length;
			let isSameRoute = dropOnStop && dropInfo.route === targetInfo.route;

			let stopIndex = targetInfo.vertexIndex;
			if (targetInfo.route.startLocation) stopIndex--;

			if (stopIndex < 0) {
				// do nothing
				console.log("moving the starting vertex is not allowed");
			} else if (stopIndex > targetInfo.route.stops.length) {
				console.log("moving the ending vertex is not allowed");
			} else if (dropOnStop && isNewVertex) {
				// adopt stop
				let stop = dropInfo.route.removeStop(dropInfo.stops[0]);
				targetInfo.route.addStop(stop, stopIndex);
			} else if (dropOnStop && !isNewVertex && !isSameRoute) {
				// ophan stop
				let stop = targetInfo.route.removeStop(stopIndex);
				redRoute.addStop(stop);
				// adopt stop
				stop = dropInfo.route.removeStop(dropInfo.stops[0]);
				targetInfo.route.addStop(stop, stopIndex);
			} else if (dropOnStop && !isNewVertex && isSameRoute) {
				// ophan in-betweens
				let count = dropInfo.stops[0] - stopIndex;
				if (count > 1)
					while (count--) {
						let stop = targetInfo.route.removeStop(stopIndex);
						redRoute.addStop(stop);
					}
			} else if (!dropOnStop && isNewVertex) {
				// meaningless
				console.log("dropping a new vertex on empty space has not effect");
			} else if (!dropOnStop && !isNewVertex) {
				// orphan the stop (unless it is the last stop)
				let stop = targetInfo.route.removeStop(stopIndex);
				stop && redRoute.addStop(stop);
			}

			routes.map(r => r.refresh(map));
		});
	});
}
