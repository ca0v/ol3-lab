import ol = require("openlayers");
import { cssin, debounce, mixin } from "ol3-fun/ol3-fun/common";
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

    map.addControl(new ol.control.MousePosition({
        className: "myMousePos",
        projection: "EPSG:4326",
        coordinateFormat: c => c.map(v => v.toFixed(4)).join(" ")
    }));

    //▲ ▬ ◇ ● ◯ ▧ ★
    let polyLayer = new ol.layer.Vector({ source: new ol.source.Vector() });
    map.addLayer(polyLayer);

    Draw.create({ map: map, geometryType: "Polygon", label: "▧", position: "right-4 top", layers: [polyLayer] })
        .once("activate", () => {
            debugger;
        });

    Draw.create({ map: map, geometryType: "MultiLineString", label: "▬", position: "right-2 top" });
    Draw.create({ map: map, geometryType: "Point", label: "●" });
    Modify.create({ map: map, position: "right top-2", label: "Δ" });

    {
        let element = document.createElement("div");
        element.className = "gmlOut";

        cssin('gmlOut', `
.myMousePos {
    position:absolute;
    top: auto;
    left: auto;
    bottom: 0;
    right: 0;    
}
.gmlOut {
    position: absolute;
    bottom: 0;
    left: 20%;
    width: 60%;
    height: 200px;
    border: 1px solid black;
    overflow-y: auto;
    overflow-x: auto;
    font-size: 12px;
    font-family: monospace;
    background: rgba(160, 160, 60, 0.5);
}        
        `);

        let esriFormatter = new ol.format.EsriJSON({
            geometryName: "geom"
        });

        let kmlFormatter = new ol.format.KML({
            
        });

        let gmlOut = new ol.control.Control({
            element: element,
            render: debounce((args: ol.MapEvent) => {
                console.log(args.map.getView().getCenter());
                polyLayer.getSource().forEachFeature(f => {
                    element.innerText = esriFormatter.writeFeatures([f.clone()], {
                        dataProjection: "EPSG:4326",
                        featureProjection: "EPSG:4326",
                        decimals: 4
                    });
                    return true;
                });
            })
        });
        map.addControl(gmlOut);
    }
}