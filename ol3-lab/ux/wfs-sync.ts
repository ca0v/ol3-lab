import { debounce, defaults } from "ol3-fun/ol3-fun/common";

export interface IOptions {
    wfsUrl: string;
    source: ol.source.Vector;
    formatter: ol.format.WFS;
    targets: { [name: string]: string }; // ol.geom.GeometryType
    lastUpdateFieldName?: string;
    featureNS: string;
    featurePrefix: string;
    srsName: string;
    featureIdFieldName?: string;
}

const serializer = new XMLSerializer();

export class WfsSync {

    private options: IOptions;
    private lastSavedTime: number;
    private deletes: ol.Feature[];

    static DEFAULT_OPTIONS = <IOptions>{
        wfsUrl: "http://localhost:8080/geoserver/cite/wfs",
        featureNS: "http://www.opengeospatial.net/cite",
        featurePrefix: "cite",
        featureIdFieldName: "gid",
        lastUpdateFieldName: "touched",
        srsName: "EPSG:3857",
    }

    static create(options?: IOptions) {
        options = defaults(options || {}, WfsSync.DEFAULT_OPTIONS);
        let result = new WfsSync(options);
        return result;
    }

    constructor(options: IOptions) {
        this.options = options;
        this.lastSavedTime = Date.now();
        this.deletes = [];
        this.watch();
    }

    private watch() {

        let save = debounce(() => this.saveDrawings({
            features: this.options.source.getFeatures().filter(f => !!f.get(this.options.lastUpdateFieldName))
        }), 1000);

        let touch = (f: ol.Feature) => {
            f.set(this.options.lastUpdateFieldName, Date.now());
            save();
        };

        let watch = (f: ol.Feature) => {
            f.getGeometry().on("change", () => touch(f));
            f.on("propertychange", (args: { key: string; oldValue: any }) => {
                if (args.key === this.options.lastUpdateFieldName) return;
                touch(f);
            });
        };

        let source = this.options.source;
        source.forEachFeature(f => watch(f));

        source.on("addfeature", (args: ol.source.VectorEvent) => {
            args.feature.set("strname", "WARM RIVER");
            watch(args.feature);
            touch(args.feature);
        });

        source.on("removefeature", (args: ol.source.VectorEvent) => {
            this.deletes.push(args.feature);
            touch(args.feature);
        });

    }

    private saveDrawings(args: {
        features: ol.Feature[];
    }) {
        let features = args.features.filter(f => this.lastSavedTime <= f.get(this.options.lastUpdateFieldName));
        features.forEach(f => f.set(this.options.lastUpdateFieldName, undefined));
        console.log("saving", features.map(f => f.get(this.options.lastUpdateFieldName)));

        let saveTo = (featureType: string, geomType: ol.geom.GeometryType) => {
            let toSave = features.filter(f => f.getGeometry().getType() === geomType);
            let toDelete = this.deletes.filter(f => !!f.get(this.options.featureIdFieldName));

            if (0 === (toSave.length + toDelete.length)) {
                console.info("nothing to save", featureType, geomType);
                return;
            }

            let format = this.options.formatter;
            let requestBody = format.writeTransaction(
                toSave.filter(f => !f.get(this.options.featureIdFieldName)),
                toSave.filter(f => !!f.get(this.options.featureIdFieldName)),
                toDelete,
                {
                    featureNS: this.options.featureNS,
                    featurePrefix: this.options.featurePrefix,
                    featureType: featureType,
                    srsName: this.options.srsName,
                    nativeElements: []
                });

            let data = serializer.serializeToString(requestBody);
            console.log("data", data);

            $.ajax({
                type: "POST",
                url: this.options.wfsUrl,
                data: data,
                contentType: "application/xml",
                dataType: "xml",
                success: (response: XMLDocument) => {
                    console.warn("TODO: key assignment", serializer.serializeToString(response));
                }
            });
        };

        this.lastSavedTime = Date.now();
        Object.keys(this.options.targets).forEach(k => {
            saveTo(this.options.targets[k], <ol.geom.GeometryType>k);
        });

    }


}