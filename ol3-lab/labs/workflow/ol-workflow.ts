import ol = require("openlayers");

const styleInfo = {
    textScale: 2,
    connectorStrokeColor: "#fff",
    connectorStrokeWidth: 1,
    connectorTextFillColor: "#ccc",
    connectorTextStrokeColor: "#333",
    connectorTextWidth: 2,
    workflowItemRadius: 50,
    workflowItemStrokeColor: "#ccc",
    workflowItemStrokeWidth: 2,
    workflowItemFill: "#333",
    workflowItemTextFillColor: "#ccc",
    workflowItemTextStrokeColor: "#333",
    workflowItemTextWidth: 2,
}

function rotation([x1, y1]: [number, number], [x2, y2]: [number, number]) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    return Math.atan2(dy, dx);
}

function computeRoute([x1, y1]: [number, number], [x2, y2]: [number, number]) {
    return <Array<[number, number]>>[[x1, y1], [x2, y1], [x2, y2]];
}


class WorkFlow {

    private source: ol.source.Vector;

    constructor(public map: ol.Map, public workFlowItem: Array<WorkFlowItem> = []) {
        workFlowItem.forEach((item, i) => item.column = i);
    }

    render() {
        if (this.source) this.source.clear();

        // render connections
        this.workFlowItem.forEach(item1 => {
            item1.connections.forEach(item2 => {
                item2.row = Math.max(item1.row + 1, item2.row);
            });
        });

        this.source = renderWorkflow(this.map, this);
        // render connections
        this.workFlowItem.forEach(item1 => {

            item1.connections.forEach(item2 => {
                let style = new ol.style.Style({
                    text: new ol.style.Text({
                        text: `${item1.title}-${item2.title}`,
                        fill: new ol.style.Fill({
                            color: styleInfo.connectorTextFillColor,
                        }),
                        stroke: new ol.style.Stroke({
                            color: styleInfo.connectorTextStrokeColor,
                            width: styleInfo.connectorTextWidth,
                        }),
                        scale: styleInfo.textScale
                    }),
                    stroke: new ol.style.Stroke({
                        color: styleInfo.connectorStrokeColor,
                        width: styleInfo.connectorStrokeWidth,
                    })
                });

                let f1 = this.source.getFeatureById(item1.id);
                let f2 = this.source.getFeatureById(item2.id);
                let p1 = f1.getGeometry().getClosestPoint(ol.extent.getCenter(f2.getGeometry().getExtent()));
                let p2 = f2.getGeometry().getClosestPoint(ol.extent.getCenter(f1.getGeometry().getExtent()));
                let route = computeRoute(p1, p2);

                let feature = new ol.Feature();
                feature.setGeometry(new ol.geom.LineString(route));
                //style.getText().setRotation(rotation(p1, p2));

                // using a real coordinate system (EPSG:3857)
                let downArrow = p1[1] > p2[1];

                let arrowStyle = new ol.style.Style({
                    geometry: new ol.geom.Point(p2),
                    text: new ol.style.Text({
                        text: `>`,
                        fill: new ol.style.Fill({
                            color: styleInfo.connectorTextFillColor,
                        }),
                        stroke: new ol.style.Stroke({
                            color: styleInfo.connectorTextStrokeColor,
                            width: styleInfo.connectorTextWidth,
                        }),
                        offsetY: styleInfo.workflowItemRadius * (downArrow ? -1 : 1),
                        scale: styleInfo.textScale,
                        rotation: Math.PI / 2 * (downArrow ? 1 : -1)
                    })
                });

                feature.setStyle([style, arrowStyle]);
                this.source.addFeature(feature);
            });
        });
    }

    connect(item1: WorkFlowItem, item2: WorkFlowItem, title = "") {
        item1.connect(item2);
    }
}

class WorkFlowItem {

    public readonly id: string;
    public column: number;
    public row: number;
    public connections: Array<WorkFlowItem>;

    constructor(public title = "untitled", public type = "") {
        this.id = `wf_${Math.random() * Number.MAX_VALUE}`;
        this.column = this.row = 0;
        this.connections = [];
    }

    connect(item: WorkFlowItem) {
        this.connections.push(item);
    }
}

function renderWorkflow(map: ol.Map, workflow: WorkFlow) {
    let source = new ol.source.Vector();
    let layer = new ol.layer.Vector({
        map: map,
        source: source
    });
    map.addLayer(layer);

    workflow.workFlowItem.forEach(item => {
        let location: ol.Coordinate = [100 * item.column, - 100 * item.row];

        let style = new ol.style.Style({
            text: new ol.style.Text({
                text: `${item.title}`,
                stroke: new ol.style.Stroke({
                    color: styleInfo.workflowItemTextStrokeColor,
                    width: styleInfo.workflowItemTextWidth,
                }),
                fill: new ol.style.Fill({
                    color: styleInfo.workflowItemTextFillColor,
                }),
                scale: styleInfo.textScale
            }),
            image: new ol.style.RegularShape({
                points: 4,
                angle: 0,
                radius: styleInfo.workflowItemRadius,
                radius2: styleInfo.workflowItemRadius,
                fill: new ol.style.Fill({
                    color: styleInfo.workflowItemFill,
                }),
                stroke: new ol.style.Stroke({
                    color: styleInfo.workflowItemStrokeColor,
                    width: styleInfo.workflowItemStrokeWidth,
                })
            })
        });

        let feature = new ol.Feature();
        feature.setId(item.id);
        feature.set("workflowitem", item);

        feature.setGeometry(new ol.geom.Point(location));
        source.addFeature(feature);
        feature.setStyle([style]);
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

    let [item1, item2, item3, item4] = [
        new WorkFlowItem("item 1"),
        new WorkFlowItem("item 2"),
        new WorkFlowItem("item 3"),
        new WorkFlowItem("item 4"),
    ];

    let workflow = new WorkFlow(map, [item1, item2, item3, item4]);
    workflow.connect(item1, item3, "13");
    workflow.connect(item1, item2, "12");
    workflow.connect(item2, item3, "23");
    workflow.connect(item2, item4, "24");
    workflow.render();

}