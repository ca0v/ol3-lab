(function () {
    function loadCss(url) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = url;
        document.getElementsByTagName("head")[0].appendChild(link);
    }
    function getParameterByName(name, url) {
        if (url === void 0) { url = window.location.href; }
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"), results = regex.exec(url);
        if (!results)
            return null;
        if (!results[2])
            return "";
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    var run = getParameterByName("run") || "ol3-lab/labs/index";
    var debug = getParameterByName("debug") === "1";
    var localhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    loadCss(localhost
        ? "./node_modules/ol3-fun/static/ol/v5.1.3/ol.css"
        : "https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.1.3/css/ol.css");
    requirejs.config({
        shim: {
            // no need to wrap ol in a define method when using a shim
            // build this using the "npm run build-legacy" (see ol package.json)
            openlayers: {
                deps: [],
                exports: "ol" // tell requirejs which global this library defines
            }
        },
        packages: [
            {
                name: "xstyle",
                location: "https://cdn.rawgit.com/kriszyp/xstyle/v0.3.2",
                main: "xstyle"
            }
        ],
        paths: {
            "resize-sensor": "https://rawgit.com/marcj/css-element-queries/master/src/ResizeSensor",
            openlayers: localhost
                ? "./node_modules/ol3-fun/static/ol/v5.1.3/ol"
                : "https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.1.3/build/ol",
            jquery: localhost
                ? "./node_modules/jquery/dist/jquery.min"
                : "https://cdnjs.cloudflare.com/ajax/libs/jquery/3.1.1/jquery.min"
        },
        deps: ["./index"],
        callback: function () {
            requirejs([run], function (test) {
                test.run ? test.run() : test();
            });
        }
    });
})();
