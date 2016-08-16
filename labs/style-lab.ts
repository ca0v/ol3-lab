import ol = require("openlayers");
import $ = require("jquery");
import {Format,StyleConverter} from "../alpha/format/ol3-symbolizer";
import AgsMarkerSerializer = require("../ux/serializers/ags-simplemarkersymbol");
import StyleGenerator = require("./common/style-generator");

const center = [-82.4, 34.85];

let formatter = new StyleConverter();

let generator = new StyleGenerator({
    center: center,
    fromJson: json => formatter.fromJson(json)
});

let ux = `
<div class='style-lab'>
    <label for='use-ags-serializer'>use-ags-serializer?</label>
    <input type="checkbox" id="use-ags-serializer"/>
    <label for='style-count'>How many styles per symbol?</label>
    <input id='style-count' type="number" value="1" min="1" max="5"/><button id='more'>More</button>
    <label for='style-out'>Click marker to see style here:</label>
    <textarea id='style-out'>[
	{
		"star": {
			"fill": {
				"color": "rgba(228,254,211,0.57)"
			},
			"opacity": 1,
			"stroke": {
				"color": "rgba(67,8,10,0.61)",
				"width": 8
			},
			"radius": 22,
			"radius2": 16,
			"points": 11,
			"angle": 0,
			"rotation": 0
		}
	}
]</textarea>
    <label for='apply-style'>Apply this style to some of the features</label>
    <button id='apply-style'>Apply</button>
    <div class='area'>
        <label>Last image clicked:</label>
        <img class='last-image-clicked light' />
        <img class='last-image-clicked bright' />
        <img class='last-image-clicked dark' />
    </div>
<div>
`;

let css = `
<style>
    html, body, .map {
        width: 100%;
        height: 100%;
        padding: 0;
        overflow: hidden;
        margin: 0;    
    }

    .map {
        background-color: black;
    }

    .map.dark {
        background: black;
    }

    .map.light {
        background: silver;
    }

    .map.bright {
        background: white;
    }

    .style-lab {
        padding: 20px;
        position:absolute;
        top: 8px;
        left: 40px;
        z-index: 1;
        background-color: rgba(255, 255, 255, 0.8);
        border: 1px solid black;
    }

    .style-lab .area {
        padding-top: 20px;
    }

    .style-lab label {
        display: block;
    }

    .style-lab #style-count {
        vertical-align: top;
    }

    .style-lab #style-out {
        font-family: cursive;
        font-size: smaller;
        min-width: 320px;
        min-height: 240px;
    }

    .style-lab .dark {
        background: black;
    }

    .style-lab .light {
        background: silver;
    }

    .style-lab .bright {
        background: white;
    }

</style>
`;

export function run() {

    let formatter: StyleConverter;

    $(ux).appendTo(".map");
    $(css).appendTo("head");

    $("#use-ags-serializer").change(args => {
        if (args.target.checked) {
            formatter = <any>new AgsMarkerSerializer.SimpleMarkerConverter();
        } else {
            formatter = new StyleConverter();
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

    $("#more").click(() => $("#style-count").change());

    $("#style-count").on("change", args => {
        map.addLayer(generator.asMarkerLayer({
            markerCount: 100,
            styleCount: (<any>args.target).valueAsNumber
        }));
    }).change();

    $("#apply-style").on("click", () => {
        let json = <any[]>JSON.parse(styleOut.value);
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

        {
            if (Array.isArray(style)) {
                let s = <HTMLImageElement | HTMLCanvasElement | ol.style.Style>style[0];
                while (s) {
                    if (s instanceof HTMLCanvasElement) {
                        let dataUrl = s.toDataURL();
                        $(".last-image-clicked").attr("src", dataUrl);
                        break;
                    }
                    if (s instanceof HTMLImageElement) {
                        $(".last-image-clicked").attr("src", s.src);
                        break;                        
                    }
                    s = (<ol.style.Style>s).getImage();
                }
            }
        }
    }));

    $(".last-image-clicked").click(evt => {
        "light,dark,bright".split(",").forEach(c => $("#map").toggleClass(c, $(evt.target).hasClass(c)));
    });

    return map;
}
