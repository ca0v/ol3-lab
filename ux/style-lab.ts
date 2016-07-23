import ol = require("openlayers");

const center = [-82.4, 34.85];

const default_styles = {
    orange_orb: [
        {
            "image": {
                "fill": {
                    "color": "rgba(233,28,15,0.6522512028569203)"
                },
                "opacity": 1,
                "stroke": {
                    "color": "rgba(247,241,63,0.5428737737274676)",
                    "width": 3.9007170103692133
                },
                "radius": 11.861454274819344
            }
        },
        {
            "image": {
                "fill": {
                    "color": "rgba(4,252,189,0.014666108233186703)"
                },
                "opacity": 1,
                "stroke": {
                    "color": "rgba(161,219,102,0.17870206015083068)",
                    "width": 1.4527415019474796
                },
                "radius": 7.569151036868188
            }
        }
    ]
};

function asStyle(json = default_styles.orange_orb) {
    return json.map(json => {
        let s = <any>new ol.style.Style({});
        if (json.image) s.setImage(asImage(json.image));
        return s;
    })
}

function asImage(json = default_styles.orange_orb[0].image) {
    let image = <any>new ol.style.Image();
    if (json.fill) image.setFill(json.fill);
    if (json.opacity) image.setOpacity(json.opacity);
    if (json.radius) image.setRadius(json.radius);
    if (json.stroke) image.setStroke(json.stroke);
    return image;
}

let range = (n: number) => {
    var result = new Array(n);
    for (var i = 0; i < n; i++) result[i] = i;
    return result;
};

function stringify(value: Object) {
    return JSON.stringify(value, null, '\t');
}

function asRadius() {
    return 4 + 10 * Math.random();
}

function asWidth() {
    return 1 + 4 * Math.random();
}

function asColor() {
    let [r, g, b] = [255, 255, 255].map(n => Math.floor(Math.random() * n));
    return [r, g, b, Math.random()];
}

function asFill() {
    let fill = new ol.style.Fill({
        color: asColor(),

    });
    return fill;
}

function asStroke() {
    let stroke = new ol.style.Stroke({
        width: asWidth(),
        color: asColor()
    });
    return stroke;
}

function asCircle() {
    let style = new ol.style.Circle({
        fill: asFill(),
        radius: asRadius(),
        stroke: asStroke(),
        snapToPixel: false
    });
    return style;
}

function asPoint() {
    let [x, y] = center;
    x += 0.1 * (Math.random() - 0.5);
    y += 0.1 * (Math.random() - 0.5);
    return new ol.geom.Point([x, y]);
}

function asFeature() {
    let feature = new ol.Feature();
    feature.setGeometry(asPoint());

    false && feature.setStyle(asStyle());

    true && feature.setStyle(range(1 + Math.round(2 * Math.random())).map(x => new ol.style.Style({
        image: asCircle()
    })));
    return feature;
}

function asVectorLayer() {
    let layer = new ol.layer.Vector();
    let source = new ol.source.Vector();
    layer.setSource(source);
    for (var i = 0; i < 1000; i++) source.addFeature(asFeature());
    return layer;
}

function assign(obj: any, prop: string, value: Object) {
    //let getter = prop[0].toUpperCase() + prop.substring(1);
    if (value === null) return;
    if (value === undefined) return;
    if (typeof value === "object") {
        if (Object.keys(value).length === 0) return;
    }
    if (prop === "image") {
        if (value.hasOwnProperty("radius")) {
            prop = "circle";
        }
    }
    obj[prop] = value;
}

function serializeStyle(style: any) {
    let s = <any>{};
    if (!style) return null;
    if (style.getColor) assign(s, "color", serializeColor(style.getColor()));
    if (style.getImage) assign(s, "image", serializeStyle(style.getImage()));
    if (style.getFill) assign(s, "fill", serializeFill(style.getFill()));
    if (style.getOpacity) assign(s, "opacity", style.getOpacity());
    if (style.getStroke) assign(s, "stroke", serializeStyle(style.getStroke()));
    if (style.getText) assign(s, "text", serializeStyle(style.getText()));
    if (style.getWidth) assign(s, "width", style.getWidth());
    if (style.getFont) assign(s, "font", style.getFont());
    if (style.getRadius) assign(s, "radius", style.getRadius());
    return s;
}

function serializeColor(color: ol.Color) {
    return ol.color.asString(ol.color.asArray(color));
}

function serializeFill(fill: ol.style.Fill) {
    return serializeStyle(fill);
}

export function run() {

    let basemap = new ol.layer.Tile({
        source: new ol.source.OSM()
    });

    let markers = asVectorLayer();

    let map = new ol.Map({
        target: "map",
        view: new ol.View({
            projection: 'EPSG:4326',
            center: center,
            zoom: 15
        }),
        layers: [basemap, markers]
    });

    map.on("click", args => map.forEachFeatureAtPixel(args.pixel, (feature, layer) => {
        let style = feature.getStyle();
        if (Array.isArray(style)) {
            let styles = style.map(s => serializeStyle(s));
            console.log(stringify(styles));
        } else {
            let styles = [style].map(s => serializeStyle(s));
            console.log(stringify(styles[0]));
        }
    }));
    return map;
}
