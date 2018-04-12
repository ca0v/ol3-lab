import ol = require("openlayers");
import { maplet as MapletData } from "../../tests/data/maplet";

const styleInfo = {
    textScale: 2,
    controlFillColor: "#ccc",
    controlStrokeColor: "#333",
    connectorStrokeColor: "#fff",
    connectorStrokeWidth: 1,
    connectorTextFillColor: "#ccc",
    connectorTextStrokeColor: "#333",
    connectorTextWidth: 2,
    workflowItemRadius: 50,
    workflowItemStrokeColor: "#ccc",
    workflowItemStrokeWidth: 2,
    workflowItemFillColor: "#333",
    workflowItemTextFillColor: "#ccc",
    workflowItemTextStrokeColor: "#333",
    workflowItemTextWidth: 2,
    rightArrow: "►",
    plus: "➕"
}

function rotation([x1, y1]: [number, number], [x2, y2]: [number, number]) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    return Math.atan2(dy, dx);
}

function computeRoute([x1, y1]: [number, number], [x2, y2]: [number, number]) {
    return <Array<[number, number]>>[[x1, y1], [x1, y1 + 20], [x2, y1 + 20], [x2, y2]];
}

function createWorkflowItemGeometry(item: WorkFlowItem) {
    const [dx, dy] = [30, 20];
    let [x, y] = [100 * item.column, - 100 * item.row];
    return new ol.geom.Point([x, y]);
}

class WorkFlow {

    private source: ol.source.Vector;

    constructor(public map: ol.Map, public workFlowItem: Array<WorkFlowItem> = []) {
        workFlowItem.forEach((item, i) => item.column = i);
    }

    execute(context: WorkFlowItem, event: string) {
        alert(`${event}: ${context.title}`);
    }

    render() {
        if (this.source) this.source.clear();

        // render connections
        this.workFlowItem.forEach((item1, i) => {
            item1.column = Math.max(i, item1.column);
            item1.row = Math.max(0, item1.row);
            item1.connections.forEach(item2 => {
                item2.column = Math.max(item1.column + 1, item2.column);
                item2.row = Math.max(item1.row + 1, item2.row);
            });
        });

        this.source = renderWorkflow(this.map, this);
        // render connections
        this.workFlowItem.forEach(item1 => {

            item1.connections.forEach(item2 => {
                let style = new ol.style.Style({
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
                        text: styleInfo.rightArrow,
                        textAlign: "end",
                        fill: new ol.style.Fill({
                            color: styleInfo.connectorStrokeColor,
                        }),
                        stroke: new ol.style.Stroke({
                            color: styleInfo.connectorStrokeColor,
                            width: styleInfo.connectorStrokeWidth,
                        }),
                        scale: 1,
                        rotation: Math.PI / 2 * (downArrow ? 1 : -1)
                    })
                });

                feature.setStyle([style, arrowStyle]);
                this.source.addFeature(feature);
            });
        });
    }

    connect(item1: WorkFlowItem, item2: WorkFlowItem, title = "") {
        item1.connect(item2, title);
    }

    addControl(item: WorkFlowItem) {
        let geom = new ol.geom.Point([item.column * 100, item.row * -100]);

        let element = document.createElement("div");
        element.className = "control";

        {
            let label = document.createElement("label");
            label.innerText = item.title;
            element.appendChild(label);
        }

        {
            let input = document.createElement("input");
            input.className = "control add-child"
            input.type = "button";
            input.value = styleInfo.plus;
            input.addEventListener("click", () => {
                this.execute(item, "add-child");
            });
            element.appendChild(input);
        }

        let overlay = new ol.Overlay({
            element: element,
            offset: [-100, 0]
        });

        overlay.setPosition(geom.getLastCoordinate());
        this.map.addOverlay(overlay);
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

    connect(item: WorkFlowItem, title = "") {
        if (this === item) return;
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
        let style = new ol.style.Style({
        });

        let feature = new ol.Feature();
        feature.setId(item.id);
        feature.set("workflowitem", item);

        feature.setGeometry(createWorkflowItemGeometry(item));
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
        zoom: 19
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

    let items = [
        new WorkFlowItem("item 1"),
        new WorkFlowItem("item 2"),
        new WorkFlowItem("item 3"),
        new WorkFlowItem("item 4"),
        new WorkFlowItem("item 5"),
    ];

    let workflow = new WorkFlow(map, items);
    items[0].connect(items[2], "13");
    items[0].connect(items[1], "12");
    items[1].connect(items[2], "23");
    items[1].connect(items[3], "24");
    items[4].connect(items[2], "53");

    let maplet = MapletData.data;

    let eventHash = new Map<string, WorkFlowItem>();
    importEvents(maplet.Events.Events, eventHash);
    maplet.Map.Layers.Layers.forEach(l => {
        l.Events && importEvents(l.Events.Events, eventHash);
    });

    eventHash.forEach(v => workflow.workFlowItem.push(v));

    workflow.render();

    items.forEach(item => workflow.addControl(item));
}

function importEvents(events: typeof MapletData.data.Events.Events, eventHash: Map<string, WorkFlowItem>) {

    events.forEach(event => {
        if (!event.name) return;

        event.name.split(",").forEach(eventName => {
            let workflowItem = eventHash.get(eventName);
            if (!workflowItem) {
                workflowItem = new WorkFlowItem(eventName);
                eventHash.set(eventName, workflowItem);
            }

            let eventOption: { value: string } = (event.Options && event.Options.Values && event.Options.Values.filter(v => v.id === "event")[0]);
            if (!eventOption) return;

            eventOption.value.split(",").forEach(trigger => {
                let childItem = eventHash.get(trigger);
                if (!childItem) {
                    childItem = new WorkFlowItem(trigger);
                    eventHash.set(trigger, childItem);
                }
                workflowItem.connect(childItem);
            });

        });

    });
}