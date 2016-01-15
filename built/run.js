System.register("app", ["openlayers"], function(exports_1) {
    "use strict";
    var ol3;
    function run() {
        console.log("ol3 playground", ol3);
    }
    exports_1("default", run);
    return {
        setters:[
            function (ol3_1) {
                ol3 = ol3_1;
            }],
        execute: function() {
        }
    }
});
