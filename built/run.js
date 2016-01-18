define("app", ["require", "exports"], function (require, exports) {
    "use strict";
    function run() {
        debugger;
        require(["openlayers"], function (ol3) {
            debugger;
            console.log("ol3 playground", ol3);
        });
    }
    return run;
});
