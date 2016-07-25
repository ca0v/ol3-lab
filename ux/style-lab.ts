import ol = require("openlayers");
import $ = require("jquery");
import Formatter = require("./format");
import StyleGenerator = require("./style-generator");

const center = [-82.4, 34.85];

let formatter = new Formatter.CoretechConverter();

let generator = new StyleGenerator({
    center: center, 
    fromJson: json => formatter.fromJson(json)
});

function stringify(value: Object) {
    return JSON.stringify(value, null, '\t');
}

export function run() {

    let basemap = new ol.layer.Tile({
        source: new ol.source.OSM()
    });

    let map = new ol.Map({
        target: "map",
        view: new ol.View({
            projection: 'EPSG:4326',
            center: center,
            zoom: 10
        }),
        layers: [generator.asLineLayer(), generator.asMarkerLayer()]
    });

    let out = $("<textarea style='width:100%;height:400px'>").appendTo(".map");

    map.on("click", args => map.forEachFeatureAtPixel(args.pixel, (feature, layer) => {
        let style = feature.getStyle();
        let json = "";
        if (Array.isArray(style)) {
            let styles = style.map(s => formatter.toJson(s));
            json = stringify(styles);
        } else {
            throw "todo";
        }
        out.text(json);
    }));
    return map;
}
