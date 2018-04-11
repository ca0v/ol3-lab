import ol = require("openlayers");

class WorkFlow {

    private source: ol.source.Vector;

    constructor(public map: ol.Map, public workFlowItem: Array<WorkFlowItem> = []) {
    }

    render() {
        if (this.source) this.source.clear();
        this.source = renderWorkflow(this.map, this);
    }

    connect(item1: WorkFlowItem, item2: WorkFlowItem) {
        let style = new ol.style.Style({
            text: new ol.style.Text({
                text: `connector ${item1.title}->${item2.title}`
            }),
            fill: new ol.style.Fill({
                color: 'rgba(255,255,255,0.1)'
            }),
            stroke: new ol.style.Stroke({
                color: '#ff0',
                width: 5
            })
        });

        let f1 = this.source.getFeatureById(item1.id);
        let f2 = this.source.getFeatureById(item2.id);
        let p1 = f1.getGeometry().getClosestPoint(ol.extent.getCenter(f2.getGeometry().getExtent()));
        let p2 = f2.getGeometry().getClosestPoint(ol.extent.getCenter(f1.getGeometry().getExtent()));
        let feature = new ol.Feature();
        feature.setGeometry(new ol.geom.LineString([
            p1, p2
        ]));

        feature.setStyle(style);
        this.source.addFeature(feature);
    }
}

class WorkFlowItem {

    public readonly id: string;

    constructor(public title = "untitled", public type = "") {
        this.id = `wf_${Math.random() * Number.MAX_VALUE}`;
    }

}

function renderWorkflow(map: ol.Map, workflow: WorkFlow) {
    let source = new ol.source.Vector();
    let layer = new ol.layer.Vector({
        map: map,
        source: source
    });
    map.addLayer(layer);

    workflow.workFlowItem.forEach((item, index) => {
        let style = new ol.style.Style({
            text: new ol.style.Text({
                text: item.title
            }),
            image: new ol.style.Circle({
                fill: new ol.style.Fill({
                    color: 'rgba(255,255,255,0.1)'
                }),
                radius: 50,
                stroke: new ol.style.Stroke({
                    color: '#ff0',
                    width: 5
                })
            })
        });

        let feature = new ol.Feature();
        feature.setId(item.id);
        feature.set("workflowitem", item);
        feature.setGeometry(new ol.geom.Point([100 - Math.random() * 200, 100 - Math.random() * 200]));
        source.addFeature(feature);
        feature.setStyle(style);
    });

    return source;
}

export function run() {
    let options = {
        target: document.getElementsByClassName("map")[0],
        projection: "EPSG:3857",
        center: <[number, number]>[0, 0],
        zoom: 20
    }

    let map = new ol.Map({
        target: options.target,
        keyboardEventTarget: document,
        loadTilesWhileAnimating: true,
        loadTilesWhileInteracting: true,
        controls: ol.control.defaults({ attribution: false }),
        view: new ol.View({
            projection: options.projection,
            center: options.center,
            zoom: options.zoom
        })
    });

    let [item1, item2, item3] = [
        new WorkFlowItem("item 1"),
        new WorkFlowItem("item 2"),
        new WorkFlowItem("item 3"),
    ];

    let workflow = new WorkFlow(map, [item1, item2, item3]);
    workflow.render();
    workflow.connect(item1, item3);
    workflow.connect(item1, item2);
    workflow.connect(item2, item3);

}