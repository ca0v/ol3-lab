import ol = require("openlayers");

/**
 * https://github.com/openlayers/ol3/issues/5684
 */
{
    ol.geom.SimpleGeometry.prototype.scale = ol.geom.SimpleGeometry.prototype.scale || function (deltaX: number, deltaY: number) {
        var flatCoordinates = this.getFlatCoordinates();
        if (flatCoordinates) {
            var stride = this.getStride();
            ol.geom.flat.transform.scale(
                flatCoordinates, 0, flatCoordinates.length, stride,
                deltaX, deltaY, flatCoordinates);
            this.changed();
        }
    }

    ol.geom.flat.transform.scale = ol.geom.flat.transform.scale ||
        function (flatCoordinates: number[], offset: number, end: number, stride: number, deltaX: number, deltaY: number, opt_dest: number[]) {
            var dest = opt_dest ? opt_dest : [];
            var i = 0;
            var j: number, k: number;
            for (j = offset; j < end; j += stride) {
                dest[i++] = flatCoordinates[j] * deltaX;
                dest[i++] = flatCoordinates[j + 1] * deltaY;
                for (k = j + 2; k < j + stride; ++k) {
                    dest[i++] = flatCoordinates[k];
                }
            }
            if (opt_dest && dest.length != i) {
                dest.length = i;
            }
            return dest;
        };
}


class Snapshot {

    static render(canvas: HTMLCanvasElement, feature: ol.Feature) {
        feature = feature.clone();
        let geom = feature.getGeometry();
        let extent = geom.getExtent();

        let isPoint = extent[0] === extent[2];
        let [dx, dy] = ol.extent.getCenter(extent);
        let scale = isPoint ? 1 : Math.min(canvas.width / ol.extent.getWidth(extent), canvas.height / ol.extent.getHeight(extent));

        geom.translate(-dx, -dy);
        geom.scale(scale, -scale);
        geom.translate(canvas.width / 2, canvas.height / 2);

        let vtx = ol.render.toContext(canvas.getContext("2d"));
        let styles = <ol.style.Style[]><any>feature.getStyleFunction()(0);
        if (!Array.isArray(styles)) styles = <any>[styles];
        styles.forEach(style => vtx.drawFeature(feature, style));
    }

    /**
     * convert features into data:image/png;base64;  
     */
    static snapshot(feature: ol.Feature) {
        let canvas = document.createElement("canvas");
        let geom = feature.getGeometry();
        this.render(canvas, feature);
        return canvas.toDataURL();
    }
}

export = Snapshot;