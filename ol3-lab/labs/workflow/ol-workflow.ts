import $ = require("jquery");
import ol = require("openlayers");
import { maplet as MapletData } from "../../tests/data/maplet";

const styleInfo = {
    textScale: 1,
    controlFillColor: "#ccc",
    controlStrokeColor: "#333",
    connectorStrokeColor: "rgba(255, 255, 255, 0.1)",
    connectorStrokeWidth: 4,
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

function injectCss(css: string) {
    let style = $(`<style type='text/css'>${css}</style>`);
    style.appendTo('head');
}

function rotation([x1, y1]: [number, number], [x2, y2]: [number, number]) {
    let dx = x2 - x1;
    let dy = y2 - y1;
    return Math.atan2(dy, dx);
}

function computeRoute([x1, y1]: [number, number], [x2, y2]: [number, number]) {
    let moveRight = (x1 < x2) ? 1 : 0;
    let moveUp = (y1 < y2) ? 1 : 0;
    let dx = [-20, 25];
    let dy = [10, 15];

    return <Array<[number, number]>>[
        [x1, y1], // start
        [x1, y1 + dy[moveUp]],
        [x1 + dx[moveRight], y1 + dy[moveUp]],
        [x2 + dx[1 - moveRight], y2 + dy[1 - moveUp]],
        [x2, y2 + dy[1 - moveUp]],
        [x2, y2] // end
    ];
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
            item1.column = i;
            item1.row = 0;
            let columnOffset = 0;
            let rowOffset = 1;
            item1.connections.forEach((item2, j) => {
                let child = item2.item;
                child.column = Math.max(child.column, item1.column);
                child.row = Math.max(child.row, item1.row + rowOffset++);
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
                let f2 = this.source.getFeatureById(item2.item.id);
                let p1 = f1.getGeometry().getClosestPoint(ol.extent.getCenter(f2.getGeometry().getExtent()));
                let p2 = f2.getGeometry().getClosestPoint(ol.extent.getCenter(f1.getGeometry().getExtent()));
                let route = computeRoute(p1, p2);

                let feature = new ol.Feature();
                feature.setGeometry(new ol.geom.LineString(route));
                feature.set("connection", item2);
                //style.getText().setRotation(rotation(p1, p2));

                // using a real coordinate system (EPSG:3857)
                let downArrow = true;

                let titleStyle = new ol.style.Style({
                    text: new ol.style.Text({
                        text: item2.purpose,
                        fill: new ol.style.Fill({
                            color: "white",
                        }),
                        stroke: new ol.style.Stroke({
                            color: "black",
                            width: 1,
                        }),
                        scale: styleInfo.textScale
                    })
                });

                let arrowStyle = new ol.style.Style({
                    geometry: new ol.geom.Point(p2),
                    text: new ol.style.Text({
                        text: styleInfo.rightArrow,
                        offsetX: 0,
                        offsetY: downArrow ? -5 : 105,
                        fill: new ol.style.Fill({
                            color: styleInfo.connectorStrokeColor,
                        }),
                        stroke: new ol.style.Stroke({
                            color: styleInfo.connectorStrokeColor,
                            width: 1,
                        }),
                        scale: styleInfo.textScale,
                        rotation: Math.PI / 2 * (downArrow ? 1 : -1)
                    })
                });

                feature.setStyle([style, titleStyle, arrowStyle]);
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

type Connection = {
    purpose: string;
    item: WorkFlowItem
};

type Connections = Map<string, Connection>;

class WorkFlowItem {

    public readonly id: string;
    public column: number;
    public row: number;
    public connections: Connections;

    constructor(public title = "untitled", public type = "") {
        this.id = `wf_${Math.random() * Number.MAX_VALUE}`;
        this.column = this.row = 0;
        this.connections = new Map<string, Connection>();
    }

    connect(item: WorkFlowItem, title = "") {
        if (this === item) return;
        this.connections.set(item.id, {
            purpose: title,
            item: item
        });
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

    injectCss(`html, body, .map {
        width: 100%;
        height: 100%;
        overflow: none;
    }`);

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

    let select = new ol.interaction.Select({
        condition: ol.events.condition.click
    });

    let selectStyle = new ol.style.Style({
        fill: new ol.style.Fill({
            color: "#fff",
        }),
        stroke: new ol.style.Stroke({
            color: "#fff",
            width: 3,
        }),
    });

    select.on("select", (args: { selected: ol.Feature[], deselected: ol.Feature[] }) => {
        args.selected.forEach(f => {
            let originalStyle = f.getStyle();
            f.set("original-style", originalStyle);

            let geom = f.getGeometry() as ol.geom.LineString;

            let arrowStyle = new ol.style.Style({
                geometry: new ol.geom.Point(geom.getLastCoordinate()),
                text: new ol.style.Text({
                    text: styleInfo.rightArrow,
                    offsetY: -5,
                    fill: new ol.style.Fill({
                        color: "#fff",
                    }),
                    stroke: new ol.style.Stroke({
                        color: styleInfo.connectorStrokeColor,
                        width: 1,
                    }),
                    scale: styleInfo.textScale,
                    rotation: Math.PI / 2
                })
            });

            let connector = f.get("connection") as Connection;
            if (connector) {
                let titleStyle = new ol.style.Style({
                    text: new ol.style.Text({
                        text: connector.purpose,
                        fill: new ol.style.Fill({
                            color: "white",
                        }),
                        stroke: new ol.style.Stroke({
                            color: "black",
                            width: 2,
                        }),
                        scale: 1 + styleInfo.textScale
                    })
                });
                f.setStyle([selectStyle, arrowStyle, titleStyle]);
            } else {
                f.setStyle([selectStyle, arrowStyle]);
            }
        });

        args.deselected.forEach(f => {
            f.setStyle(f.get("original-style"));
        })
    });

    map.addInteraction(select);

    let items = [
        new WorkFlowItem("item 1"),
        new WorkFlowItem("item 2"),
        new WorkFlowItem("item 3"),
        new WorkFlowItem("item 4"),
        new WorkFlowItem("item 5"),
    ];

    let workflow = new WorkFlow(map, items);
    items[0].connect(items[2], "1->3");
    items[0].connect(items[1], "1->2");
    items[1].connect(items[2], "2->3");
    items[1].connect(items[3], "2->4");
    items[4].connect(items[2], "5->3");

    let maplet = MapletData.data;

    let eventHash = new Map<string, WorkFlowItem>();

    importCommands(maplet.Commands.Commands, eventHash);

    maplet.Map.Layers.Layers.forEach(l => {
        l.Commands && importCommands(l.Commands.Commands, eventHash);
    });

    maplet.Controls.Controls.forEach(l => {
        l.Commands && importCommands(l.Commands.Commands, eventHash);
    });

    importEvents(maplet.Events.Events, eventHash);

    maplet.Map.Layers.Layers.forEach(l => {
        l.Events && importEvents(l.Events.Events, eventHash);
    });

    maplet.Controls.Controls.forEach(l => {
        l.Events && importEvents(l.Events.Events, eventHash);
    });

    eventHash.forEach(v => workflow.workFlowItem.push(v));

    workflow.render();

    items.forEach(item => workflow.addControl(item));
}

function importEvents(events: typeof MapletData.data.Events.Events, eventHash: Map<string, WorkFlowItem>) {

    events.forEach(event => {
        if (!event.name) event.name = event.id;

        event.name.split(",").forEach(eventName => {
            let workflowItem = eventHash.get(eventName);
            if (!workflowItem) {
                workflowItem = new WorkFlowItem(eventName);
                eventHash.set(eventName, workflowItem);
            }

            let eventOption: { value: string } = (event.Options && event.Options.Values && event.Options.Values.filter(v => v.id === "event")[0]);
            if (!eventOption) eventOption = { value: event.id };

            eventOption.value.split(",").forEach(trigger => {
                let childItem = eventHash.get(trigger);
                if (!childItem) {
                    childItem = new WorkFlowItem(trigger);
                    eventHash.set(trigger, childItem);
                }
                workflowItem.connect(childItem, event.mid);
            });

        });

    });
}

function importCommands(events: typeof MapletData.data.Commands.Commands, eventHash: Map<string, WorkFlowItem>) {

    events.forEach(event => {
        let eventName = event.id;

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
            workflowItem.connect(childItem, event.mid);
        });

    });

}


type Node<T> = {
    item: T;
    children: NodeList<T>;
    parents: NodeList<T>;
    dx: number;
    dy: number;
};

type NodeList<T> = Array<Node<T>>;

class DrawGraph<T> {

    position(node: Node<T>) {
        let _visited = [] as NodeList<T>;
        let visited = (n: Node<T>) => 0 <= _visited.indexOf(n);

        // assign parents to children, 
        // assign dx to all children (relative to parent position)
        let visit = (n: Node<T>) => {
            if (visited(n)) return;
            if (n.children) {
                let dx = -n.children.length / 2;
                n.children.forEach(c => {
                    c.dx = dx++;
                    if (!c.parents) {
                        c.parents = [];
                    }
                    c.parents.push(n);
                    visit(c);
                });
            }
        };

        node.dx = node.dy = 0;
        // all children have dx and parents
        visit(node);

        // top-down visitation ensures children are one or more levels below parent
        let assignDy = (n: Node<T>) => {
            let dy = n.dy;
            if (n.children) {
                n.children.forEach(c => {
                    c.dy = Math.max(c.dy, 1 + dy);
                    assignDy(c);
                });
            }
        };

    }

}