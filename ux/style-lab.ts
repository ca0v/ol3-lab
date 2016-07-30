import ol = require("openlayers");
import $ = require("jquery");
import CoretechSerializer = require("./serializers/coretech");
import AgsMarkerSerializer = require("./serializers/ags-simplemarkersymbol");
import StyleGenerator = require("./style-generator");

const center = [-82.4, 34.85];

let formatter = new CoretechSerializer.CoretechConverter();

let generator = new StyleGenerator({
    center: center,
    fromJson: json => formatter.fromJson(json)
});

let ux = `
<div class='form'>
    <label for='use-ags-serializer'>use-ags-serializer?</label>
    <input type="checkbox" id="use-ags-serializer"/>
    <label for='style-count'>How many styles per symbol?</label>
    <input id='style-count' type="number" value="1" />
    <label for='style-out'>Click marker to see style here:</label>
    <textarea id='style-out'></textarea>
    <label for='apply-style'>Apply this style to some of the features</label>
    <button id='apply-style'>Apply</button>
<div>
`;

let css = `
<style>
    html, body, .map {
        width: 100%;
        height: 100%;
        overflow: hidden;    
    }

    label {
        display: block;
    }

    .form {
        padding: 20px;
        position:absolute;
        top: 40px;
        right: 40px;
        z-index: 1;
        background-color: rgba(255, 255, 255, 0.8);
        border: 1px solid black;
    }

    #style-count {
        vertical-align: top;
    }

    #style-out {
        font-family: cursive;
        font-size: smaller;
        min-width: 320px;
        min-height: 240px;
    }
</style>
`;

export function run() {

    let formatter: CoretechSerializer.CoretechConverter;

    $(ux).appendTo(".map");
    $(css).appendTo("head");

    $("#use-ags-serializer").change(args => {
        if (args.target.checked) {
            formatter = <any>new AgsMarkerSerializer.SimpleMarkerConverter();
        } else {
            formatter = new CoretechSerializer.CoretechConverter();
        }
    }).change();

    let map = new ol.Map({
        target: "map",
        view: new ol.View({
            projection: 'EPSG:4326',
            center: center,
            zoom: 10
        }),
        layers: []
    });

    let styleOut = <HTMLTextAreaElement>document.getElementById("style-out");

    $("#style-count").on("change", args => {
        map.addLayer(generator.asMarkerLayer({
            markerCount: 100,
            styleCount: (<any>args.target).valueAsNumber
        }));
    }).change();

    $("#apply-style").on("click", () => {
        let json = <any[]>JSON.parse(styleOut.value);
        console.log(json);
        let styles = json.map(json => formatter.fromJson(json));
        map.getLayers().forEach(l => {
            if (l instanceof ol.layer.Vector) {
                let s = l.getSource();
                let features = s.getFeatures().filter((f, i) => 0.1 > Math.random());
                features.forEach(f => f.setStyle(styles));
                l.changed();
            }
        });
    });

    map.on("click", (args: ol.MapBrowserEvent) => map.forEachFeatureAtPixel(args.pixel, (feature, layer) => {
        let style = feature.getStyle();
        let json = "";
        if (Array.isArray(style)) {
            let styles = style.map(s => formatter.toJson(s));
            json = JSON.stringify(styles, null, '\t');
        } else {
            throw "todo";
        }
        styleOut.value = json;
    }));
    return map;
}
