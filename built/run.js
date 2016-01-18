define("app", ["require", "exports", "openlayers"], function (require, exports, ol) {
    "use strict";
    var Tests = (function () {
        function Tests() {
        }
        Tests.prototype.heatmap = function () {
            var map = new ol.Map({
                target: "map",
                view: new ol.View({
                    projection: 'EPSG:4326',
                    center: [-82.4, 34.85],
                    zoom: 15
                }),
                layers: [new ol.layer.Tile({
                        source: new ol.source.MapQuest({
                            layer: "sat"
                        })
                    })]
            });
        };
        return Tests;
    }());
    function run() {
        console.log("ol3 playground", ol);
        var tests = new Tests();
        tests.heatmap();
    }
    return run;
});
