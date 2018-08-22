/**
 * Creates a map in a container of height = 0
 * calls fit on the map of a given extent
 * Sets the container height to 500px
 * Notice the extent is not correct.  This lab is to find a way
 * to call fit once the size is non-zero so extent is correct
 */

import ol = require("openlayers");

export function run() {
    let outerDiv = document.createElement("div");
    var mapDiv = document.createElement("div");
    document.body.appendChild(outerDiv);
    outerDiv.appendChild(mapDiv);

    outerDiv.style.width = "500px";
    outerDiv.style.height = "0";
    mapDiv.style.width = mapDiv.style.height = "100%";

    let options = {
        srs: 'EPSG:4326',
        center: <[number, number]>[-82.4, 34.85],
        zoom: 8,
        basemap: "bing"
    }

    let map = new ol.Map({
        target: mapDiv,
        keyboardEventTarget: document,
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        controls: ol.control.defaults({ attribution: false }),
        view: new ol.View({
            projection: options.srs,
            center: options.center,
            zoom: options.zoom
        }),
        layers: [
            new ol.layer.Tile({
                opacity: 0.8,
                source: options.basemap !== "bing" ? new ol.source.OSM() : new ol.source.BingMaps({
                    key: 'AuPHWkNxvxVAL_8Z4G8Pcq_eOKGm5eITH_cJMNAyYoIC1S_29_HhE893YrUUbIGl',
                    imagerySet: 'Aerial'
                })
            })]
    });

    function showDefect() {
        map.getView().fit([-82.40, 34.85, -82.39, 34.851], {
            size: map.getSize()
        });
    }

    function showSolution() {
        fit(map, [-82.40, 34.85, -82.39, 34.851]);
    }

    setTimeout(() => {
        console.log("size", map.getSize());
        showSolution();
        setTimeout(() => {
            outerDiv.style.height = "500px";
            map.updateSize();
            console.log("size", map.getSize());
        }, 1000);
    }, 1000);


    function fit(map: ol.Map, extent: [number, number, number, number]) {
        let size = map.getSize();
        var doit = () => map.getView().fit(extent);
        size.every(v => v > 0) ? doit() : map.once("change:size", doit);
    }
}