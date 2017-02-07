/**
 * possible solution is to use https://github.com/marcj/css-element-queries
 */
import ol = require("openlayers");
import $ = require("jquery");

let html = `
<lab class='map-resize-defect'>
    <div class='outer'>
        <div id='map' class='map fill'>
        </div>
    </div>
    <button class='event grow'>Update CSS</button>
    <button class='event resize'>Resize Map</button>
</lab>
`;

let css = `
<style>

    .outer {
        padding: 20px;
        border: 1px solid orange;
        width: 0;
        height: 0;
        overflow:hidden;
    }

    .map {
        padding: 20px;
        border: 1px solid yellow;
        width: 80%;
        height: 80%;
    }

</style>
`;

let css2 = `
<style>

    html, body {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        border: none;
    }

    .outer {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        border: none;
    }

    .map {
        border: none;
    }

</style>
`;

const fail = 0;
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

    $('#map').resize(() => {
        throw "this will never happen because jquery only listens for the window size to change";
    });

    $('button.event.grow').click(evt => {
        $(css2).appendTo("head");
        $(evt.target).remove();
    });

    $('button.event.resize').click(evt => {
        map.updateSize();
        $(evt.target).remove();
    });

    // https://rawgit.com/marcj/css-element-queries/v0.2.1/src/ResizeSensor.js is not compatible with AMD so use master..    
    require(["https://rawgit.com/marcj/css-element-queries/master/src/ResizeSensor.js"], (ResizeSensor: any) => {
        let target = map.getTargetElement();
        new ResizeSensor(target, () => {
            console.log("ResizeSensor resize detected!");
            if (!fail) map.updateSize();
        });
    });
} 