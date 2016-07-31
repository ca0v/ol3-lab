import ol = require("openlayers");
import basic_styles = require("./styles/basic");
import Coretech = require("./serializers/coretech");
import gradient_style = require("./styles/gradient");

let converter = new Coretech.CoretechConverter();

function makePattern() {
    var cnv = document.createElement('canvas');
    var ctx = cnv.getContext('2d');
    cnv.width = 6;
    cnv.height = 6;
    ctx.fillStyle = 'rgb(255, 0, 0)';

    for (var i = 0; i < 6; ++i) {
        ctx.fillRect(i, i, 1, 1);
    }

    return ctx.createPattern(cnv, 'repeat');
}

let range = (n: number) => {
    var result = new Array(n);
    for (var i = 0; i < n; i++) result[i] = i;
    return result;
};

class StyleGenerator {
    constructor(public options: {
        center: number[],
        fromJson: (json: any) => ol.style.Style;
    }) {

    }

    asPoints() {
        return 3 + Math.round(10 * Math.random());
    }

    asRadius() {
        return 14 + (10 * Math.random());
    }

    asWidth() {
        return 1 + (20 * Math.random() * Math.random());
    }

    asPastel() {
        let [r, g, b] = [255, 255, 255].map(n => Math.round((1 - Math.random() * Math.random()) * n));
        return [r, g, b, 0.1 + (0.5 * Math.random())];
    }

    asColor() {
        let [r, g, b] = [255, 255, 255].map(n => Math.round((Math.random() * Math.random()) * n));
        return [r, g, b, 0.1 + (0.9 * Math.random())];
    }

    asFill() {
        let fill = new ol.style.Fill({
            color: this.asPastel()
        });
        return fill;
    }

    asStroke() {
        let stroke = new ol.style.Stroke({
            width: this.asWidth(),
            color: this.asColor()
        });
        return stroke;
    }

    /**
     * Does not work...the first color is the only one used?
     */
    asGradient() {

        let radius = this.asRadius();
        let canvas = document.createElement('canvas');
        var context = canvas.getContext('2d');

        var gradient = context.createLinearGradient(Math.random() * radius, 0, Math.random() * radius, 2 * radius);
        gradient.addColorStop(0, `rgba(${this.asColor().join(",")})`);
        while (0.5 < Math.random()) {
            gradient.addColorStop(Math.random(), `rgba(${this.asColor().join(",")})`);
        }
        gradient.addColorStop(1, `rgba(${this.asColor().join(",")})`);

        // for (let n = 0; n < 3; n++) {
        //     let color = this.asColor();
        //     color[3] = 1;
        //     gradient.addColorStop(n / 3, `rgba(${color.join(",")})`);
        // }

        let fill = new ol.style.Fill({
            color: gradient
        });

        let style = new ol.style.Circle({
            fill: fill,
            radius: radius,
            stroke: this.asStroke(),
            snapToPixel: false
        });

        return style;
    }

    asBasic() {
        let basic = [basic_styles.cross, basic_styles.x, basic_styles.square, basic_styles.diamond, basic_styles.star, basic_styles.triangle];
        let config = basic[Math.round((basic.length - 1) * Math.random())];
        return converter.fromJson(config[0]).getImage();
    }

    asCircle() {
        let style = new ol.style.Circle({
            fill: this.asFill(),
            radius: this.asRadius(),
            stroke: this.asStroke(),
            snapToPixel: false
        });
        return style;
    }

    asStar() {
        let style = new ol.style.RegularShape({
            fill: this.asFill(),
            stroke: this.asStroke(),
            points: this.asPoints(),
            radius: this.asRadius(),
            radius2: this.asRadius()
        });
        return style;
    }

    asPoly() {
        let style = new ol.style.RegularShape({
            fill: this.asFill(),
            stroke: this.asStroke(),
            points: this.asPoints(),
            radius: this.asRadius(),
            width: this.asWidth(),
            radius2: 0
        });
        return style;
    }

    asText() {
        let style = new ol.style.Text({
            font: "18px fantasy",
            text: "Test",
            fill: this.asFill(),
            stroke: this.asStroke(),
            offsetY: 30 - Math.random() * 20
        });
        style.getFill().setColor(this.asColor());
        style.getStroke().setColor(this.asPastel());
        return style;
    }

    asPoint() {
        let [x, y] = this.options.center;
        x += (Math.random() - 0.5);
        y += (Math.random() - 0.5);
        return new ol.geom.Point([x, y]);
    }

    asPointFeature(styleCount = 1) {
        let feature = new ol.Feature();

        let gens = [() => this.asStar(), () => this.asCircle(), () => this.asPoly(), () => this.asBasic(), () => this.asGradient()];

        feature.setGeometry(this.asPoint());

        let styles = range(styleCount).map(x => new ol.style.Style({
            image: gens[Math.round((gens.length - 1) * Math.random())](),
            text: null && this.asText()
        }));

        feature.setStyle(styles);

        return feature;
    }

    asLineFeature() {
        let feature = new ol.Feature();

        let p1 = this.asPoint();
        let p2 = this.asPoint();
        p2.setCoordinates([p2.getCoordinates()[0], p1.getCoordinates()[1]]);

        let polyline = new ol.geom.LineString([p1, p2].map(p => p.getCoordinates()));
        feature.setGeometry(polyline);

        feature.setStyle([new ol.style.Style({
            stroke: this.asStroke(),
            text: this.asText()
        })]);

        return feature;
    }

    asLineLayer() {
        let layer = new ol.layer.Vector();
        let source = new ol.source.Vector();
        layer.setSource(source);
        let features = range(10).map(i => this.asLineFeature());
        source.addFeatures(features);
        return layer;
    }

    asMarkerLayer(args: {
        markerCount?: number;
        styleCount?: number;
    }) {
        let layer = new ol.layer.Vector();
        let source = new ol.source.Vector();
        layer.setSource(source);
        let features = range(args.markerCount || 100).map(i => this.asPointFeature(args.styleCount || 1));
        source.addFeatures(features);
        return layer;
    }
}

export = StyleGenerator;