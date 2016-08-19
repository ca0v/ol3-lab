import ol = require("openlayers");
import $ = require("jquery");

let html = `
<div class='outer'>
    <div id='map' class='map'>
    </div>
    <button class='event grow'>Update CSS</button>
    <button class='event resize'>Resize Map</button>
</div>
`;

let css = `
<style>

    html {
        border: 1px solid black;
    }

    body {
        border: 1px solid red;
    }

    .outer {
        padding: 50px;
        border: 1px solid orange;
    }

    .map {
        padding: 50px;
        border: 1px solid yellow;
    }

    .outer {
        width: 0;
        height: 100%;
    }

    .map {
        width: 50%;
        height: 50%;
    }

</style>
`;

let css2 = `
<style>

    html, body {
        width: 100%;
        height: 100%;
        padding: 0;
        overflow: hidden;
        margin: 0;
    }

    .outer {
        width: 50%;
        height: 50%;
    }

</style>
`;

const fail = 1;
export = function run() {

    $('#map').remove();
    $(html).appendTo('body');
    $(css).appendTo('head');

    let map = new ol.Map({
        target: "map",

        view: new ol.View({
            projection: 'EPSG:4326',
            center: [-82.4, 34.85],
            zoom: 15
        }),

        layers: [new ol.layer.Tile({ source: new ol.source.OSM() })]
    });

    $('button.event.grow').click(() => {
        $(css2).appendTo("head");
        //map.updateSize();
    });

    $('button.event.resize').click(() => {
        map.updateSize();
    });
} 