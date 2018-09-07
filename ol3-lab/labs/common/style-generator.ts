import ol = require("openlayers");
import basic_styles = require("ol3-symbolizer/examples/styles/basic");
import { StyleConverter } from "ol3-symbolizer/index";
import { mixin, range } from "ol3-fun/ol3-fun/common";

let converter = new StyleConverter();

// TODO: do these have pre-defined names on ol3/ags?
const orientations = "forward,backward,diagonal,horizontal,vertical,cross".split(",");
type Rgba = [number, number, number, number];
type Rgb = [number, number, number, 1];

let randint = (n: number) => Math.round(n * Math.random());

class StyleGenerator {
    constructor(
        public options: {
            center: number[];
            fromJson: (json: any) => ol.style.Style;
        }
    ) {}

    asPoints() {
        return 3 + Math.round(10 * Math.random());
    }

    asRadius() {
        return 14 + Math.round(10 * Math.random());
    }

    asWidth() {
        return 1 + Math.round(20 * Math.random() * Math.random());
    }

    asPastel() {
        let [r, g, b] = [255, 255, 255].map((n) => Math.round((1 - Math.random() * Math.random()) * n));
        return <Rgba>[r, g, b, (10 + randint(50)) / 100];
    }

    asRgb() {
        return <Rgb>[255, 255, 255].map((n) => Math.round(Math.random() * Math.random() * n));
    }

    asRgba() {
        let color = this.asRgb();
        color.push((10 + randint(90)) / 100);
        return <Rgba>color;
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
            color: this.asRgba()
        });
        return stroke;
    }

    private addColorStops(gradient: CanvasGradient) {
        let stops = [
            {
                stop: 0,
                color: `rgba(${this.asRgba().join(",")})`
            },
            {
                stop: 1,
                color: `rgba(${this.asRgba().join(",")})`
            }
        ];

        while (0.5 < Math.random()) {
            stops.push({
                stop: 0.1 + randint(80) / 100,
                color: `rgba(${this.asRgba().join(",")})`
            });
        }

        stops = stops.sort((a, b) => a.stop - b.stop);
        stops.forEach((stop) => gradient.addColorStop(stop.stop, stop.color));
        mixin(gradient, {
            stops: stops.map((stop) => `${stop.color} ${Math.round(100 * stop.stop)}%`).join(";")
        });
    }

    private asRadialGradient(context: CanvasRenderingContext2D, radius: number) {
        let canvas = context.canvas;
        let [x0, y0, r0, x1, y1, r1] = [
            canvas.width / 2,
            canvas.height / 2,
            radius,
            canvas.width / 2,
            canvas.height / 2,
            0
        ];
        let gradient = context.createRadialGradient(x0, y0, r0, x1, y1, r1);

        return mixin(gradient, {
            type: `radial(${[x0, y0, r0, x1, y1, r1].join(",")})`
        });
    }

    private asLinearGradient(context: CanvasRenderingContext2D, radius: number) {
        let [x0, y0, x1, y1] = [
            randint(radius),
            0, // start
            randint(radius),
            2 * radius // end
        ];
        let gradient = context.createLinearGradient(x0, y0, x1, y1);

        return mixin(gradient, { type: `linear(${[x0, y0, x1, y1].join(",")})` });
    }

    asGradient() {
        let radius = this.asRadius();
        let stroke = this.asStroke();

        let canvas = document.createElement("canvas");
        canvas.width = canvas.height = 2 * (radius + stroke.getWidth());
        var context = canvas.getContext("2d");

        let gradient: CanvasGradient;

        if (0.5 < Math.random()) {
            gradient = this.asLinearGradient(context, radius);
        } else {
            gradient = this.asRadialGradient(context, radius);
        }

        this.addColorStops(gradient);

        let fill = new ol.style.Fill({
            color: gradient
        });

        let style = new ol.style.Circle({
            fill: fill,
            radius: radius,
            stroke: stroke,
            snapToPixel: false
        });

        return style;
    }

    asPattern() {
        let radius = this.asRadius();
        let spacing = 3 + randint(5);

        let color = ol.color.asString(this.asRgb());

        let canvas = document.createElement("canvas");

        var context = canvas.getContext("2d");

        let orientation = orientations[Math.round((orientations.length - 1) * Math.random())];

        let pattern: CanvasPattern;

        switch (orientation) {
            case "horizontal":
                canvas.width = 1;
                canvas.height = 1 + randint(10);
                context.strokeStyle = color;

                context.beginPath();
                context.lineWidth = 1 + randint(canvas.height);
                context.strokeStyle = color;
                context.moveTo(0, 0);
                context.lineTo(canvas.width, 0);
                context.stroke();
                context.closePath();
                pattern = context.createPattern(canvas, "repeat");
                break;
            case "vertical":
                canvas.width = spacing;
                canvas.height = spacing;
                context.fillStyle = ol.color.asString(this.asRgba());

                for (var i = 0; i < spacing; i++) {
                    context.fillRect(0, i, 1, 1);
                }
                pattern = context.createPattern(canvas, "repeat");
                break;
            case "cross":
                canvas.width = spacing;
                canvas.height = spacing;
                context.fillStyle = color;

                for (var i = 0; i < spacing; i++) {
                    context.fillRect(i, 0, 1, 1);
                    context.fillRect(0, i, 1, 1);
                }
                pattern = context.createPattern(canvas, "repeat");
                break;
            case "forward":
                canvas.width = spacing;
                canvas.height = spacing;
                context.fillStyle = color;

                for (var i = 0; i < spacing; i++) {
                    context.fillRect(i, i, 1, 1);
                }
                pattern = context.createPattern(canvas, "repeat");
                break;
            case "backward":
                canvas.width = spacing;
                canvas.height = spacing;
                context.fillStyle = color;

                for (var i = 0; i < spacing; i++) {
                    context.fillRect(spacing - 1 - i, i, 1, 1);
                }
                pattern = context.createPattern(canvas, "repeat");
                break;
            case "diagonal":
                canvas.width = spacing;
                canvas.height = spacing;
                context.fillStyle = color;

                for (var i = 0; i < spacing; i++) {
                    context.fillRect(i, i, 1, 1);
                    context.fillRect(spacing - 1 - i, i, 1, 1);
                }
                pattern = context.createPattern(canvas, "repeat");
                break;
            default:
                throw "invalid orientation";
        }

        mixin(pattern, {
            orientation: orientation,
            color: color,
            spacing: spacing,
            repitition: "repeat"
        });

        let fill = new ol.style.Fill({
            color: pattern
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
        let basic = [
            basic_styles.cross,
            basic_styles.x,
            basic_styles.square,
            basic_styles.diamond,
            basic_styles.star,
            basic_styles.triangle
        ];
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
        style.getFill().setColor(this.asRgba());
        style.getStroke().setColor(this.asPastel());
        return style;
    }

    asPoint() {
        let [x, y] = this.options.center;
        x += Math.random() - 0.5;
        y += Math.random() - 0.5;
        return new ol.geom.Point([x, y]);
    }

    asPointFeature(styleCount = 1) {
        let feature = new ol.Feature();

        let gens = [
            () => this.asStar(),
            () => this.asCircle(),
            () => this.asPoly(),
            () => this.asBasic(),
            () => this.asGradient(),
            () => this.asPattern()
        ];

        feature.setGeometry(this.asPoint());

        let styles = range(styleCount).map(
            (x) =>
                new ol.style.Style({
                    image: gens[Math.round((gens.length - 1) * Math.random())](),
                    text: null && this.asText()
                })
        );

        feature.setStyle(styles);

        return feature;
    }

    asLineFeature() {
        let feature = new ol.Feature();

        let p1 = this.asPoint();
        let p2 = this.asPoint();
        p2.setCoordinates([p2.getCoordinates()[0], p1.getCoordinates()[1]]);

        let polyline = new ol.geom.LineString([p1, p2].map((p) => p.getCoordinates()));
        feature.setGeometry(polyline);

        feature.setStyle([
            new ol.style.Style({
                stroke: this.asStroke(),
                text: this.asText()
            })
        ]);

        return feature;
    }

    asLineLayer() {
        let layer = new ol.layer.Vector();
        let source = new ol.source.Vector();
        layer.setSource(source);
        let features = range(10).map((i) => this.asLineFeature());
        source.addFeatures(features);
        return layer;
    }

    asMarkerLayer(args: { markerCount?: number; styleCount?: number }) {
        let layer = new ol.layer.Vector();
        let source = new ol.source.Vector();
        layer.setSource(source);
        let features = range(args.markerCount || 100).map((i) => this.asPointFeature(args.styleCount || 1));
        source.addFeatures(features);
        return layer;
    }
}

export = StyleGenerator;
