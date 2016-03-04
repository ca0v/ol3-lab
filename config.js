requirejs.config({
    paths: {
        "openlayers": "bower_components/ol3/ol",
        "jquery": "bower_components/jquery/dist/jquery.min"
    },
    deps: ["built/run"],
    callback: () => {
        requirejs(["app"], run => run());
    }
});
