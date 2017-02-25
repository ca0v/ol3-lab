import ol = require("openlayers");
import { cssin, mixin } from "ol3-fun/ol3-fun/common";
import { Draw } from "ol3-draw";
import { Modify } from "ol3-draw/ol3-draw/ol3-edit";

function stopInteraction(map: ol.Map, type: any) {
    map.getInteractions()
        .getArray()
        .filter(i => i instanceof type)
        .forEach(t => t.setActive(false));
}

export class MapMaker {
    static DEFAULT_OPTIONS: olx.MapOptions = {
    }
    static create(options: {
        target: Element;
        center: [number, number];
        projection: string;
        zoom: number;
        basemap: string;
    }) {
        options = mixin(mixin({}, MapMaker.DEFAULT_OPTIONS), options);

        options.target.classList.add("ol-map");
        cssin("mapmaker", `
        .ol-map {
            top: 0;
            left: 0;
            right: 0;
            bottom:0;
            position: absolute;
        }
        `);
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
            layers: [
                new ol.layer.Tile({
                    opacity: 0.8,
                    source: new ol.source.OSM()
                })]
        });
        return map;
    }
}

export function run() {

    let map = MapMaker.create({
        target: document.getElementsByClassName("map")[0],
        projection: 'EPSG:4326',
        center: <[number, number]>[-82.4, 34.85],
        zoom: 15,
        basemap: "osm"
    });

    //▲ ▬ ◇ ● ◯ ▧ ★
    map.addControl(Draw.create({ geometryType: "Polygon", label: "▧", className: "ol-draw right-4 top" }));
    map.addControl(Draw.create({ geometryType: "MultiLineString", label: "▬", className: "ol-draw right-2 top" }));
    map.addControl(Draw.create({ geometryType: "Point", label: "●" }));
    map.addControl(Modify.create({ label: "Δ", className: "ol-draw right top-2" }));
}