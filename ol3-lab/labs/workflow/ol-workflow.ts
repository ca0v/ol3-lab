import $ = require("jquery");
import ol = require("openlayers");
import { maplet as MapletData } from "../../tests/data/maplet";

const styleInfo = {
    sx: 10,
    sy: 5,
    textScale: 1,
    controlFillColor: "#ccc",
    controlStrokeColor: "#333",
    connectorStrokeColor: "#666",
    connectorStrokeWidth: 3,
    connectorTextFillColor: "#ccc",
    connectorTextStrokeColor: "#333",
    connectorTextWidth: 4,
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
    let moveLeft = (x2 < x2) ? 1 : 0;
    let moveUp = (y1 < y2) ? 1 : 0;
    let dx = [-styleInfo.sx / 8, styleInfo.sx / 8];
    let dy = [styleInfo.sy / 8, styleInfo.sy / 8];

    return <Array<[number, number]>>[
        [x1, y1], // start
        //[x1, y1 + dy[moveUp]],
        //[x1 + dx[moveRight], y1 + dy[moveUp]],
        //[x2 + dx[moveLeft], y2 + dy[1 - moveUp]],
        [x2, y2 + dy[1 - moveUp]],
        [x2, y2] // end
    ];
}

function createWorkflowItemGeometry(item: WorkFlowItem) {
    const [dx, dy] = [30, 20];
    let [x, y] = [styleInfo.sx * item.column, - styleInfo.sy * item.row];
    return new ol.geom.Point([x, y]);
}

class WorkFlow {

    private source: ol.source.Vector;

    constructor(public map: ol.Map, public workflows: Array<WorkFlowItem> = []) {
        workflows.forEach((item, i) => item.column = i);
    }

    asNetwork() {
        console.log(this.workflows);
        let nodeMap = new Map<string, Node<WorkFlowItem>>();

        let asSubNetwork = (workflowItem: WorkFlowItem) => {
            // find node and return children
            let node = nodeMap.get(workflowItem.id);
            if (node) {
                console.log("found node for", workflowItem.title);
                return node.children;
            }
            else {
                // create node
                node = {
                    item: workflowItem,
                    children: [],
                    parents: [],
                };
                nodeMap.set(workflowItem.id, node);
                console.log("created node for", workflowItem.title);
            }

            // convert connectors to children
            workflowItem.connections.forEach(child => {
                let childNode = nodeMap.get(child.item.id);
                if (!childNode) {
                    childNode = {
                        item: child.item,
                        children: asSubNetwork(child.item),
                        parents: []
                    };
                    nodeMap.set(child.item.id, childNode);
                }
                node.children.push(childNode);
            });

            // return children
            return node.children;
        };

        let network = new WorkFlowItem();
        this.workflows.forEach(wfi => network.connect(wfi));
        return asSubNetwork(network);

    }

    execute(context: WorkFlowItem, event: string) {
        alert(`${event}: ${context.title}`);
    }

    render() {
        if (this.source) this.source.clear();

        this.source = renderWorkflow(this.map, this);
        // render connections
        this.workflows.forEach(item1 => {

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
                        placement: "line",
                        fill: new ol.style.Fill({
                            color: styleInfo.connectorTextFillColor,
                        }),
                        stroke: new ol.style.Stroke({
                            color: styleInfo.connectorTextStrokeColor,
                            width: styleInfo.connectorTextWidth,
                        }),
                        scale: styleInfo.textScale
                    })
                });

                let arrowStyle = new ol.style.Style({
                    geometry: new ol.geom.Point(p2),
                    text: new ol.style.Text({
                        text: `${styleInfo.rightArrow}`,
                        placement: "point",
                        textBaseline: "middle",
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

        return this.source;
    }

    connect(item1: WorkFlowItem, item2: WorkFlowItem, title = "") {
        item1.connect(item2, title);
    }

    addControl(item: WorkFlowItem) {
        let geom = new ol.geom.Point([item.column * styleInfo.sx, item.row * -styleInfo.sy]);

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
            offset: [-40, 0]
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
        this.id = `wf_${Math.floor(Math.random() * 100000000000)}`;
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

    workflow.workflows.forEach(item => {
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
        condition: ol.events.condition.click,
    });
    select.set("hitTolerance", 10);

    let selectStyle = new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: "#fff",
            width: 2 * styleInfo.connectorStrokeWidth,
        }),
    });

    let source: ol.source.Vector;

    select.on("select", (args: { selected: ol.Feature[], deselected: ol.Feature[] }) => {
        args.selected.forEach(f => {
            let originalStyle = f.getStyle();
            f.set("original-style", originalStyle);

            // bring to front
            source.removeFeature(f);
            source.addFeature(f);
            f.changed();

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
                        width: styleInfo.connectorStrokeWidth,
                    }),
                    scale: 1.5 * styleInfo.textScale,
                    rotation: Math.PI / 2
                })
            });

            let connector = f.get("connection") as Connection;
            if (connector) {
                let titleStyle = new ol.style.Style({
                    text: new ol.style.Text({
                        text: connector.purpose,
                        fill: new ol.style.Fill({
                            color: styleInfo.connectorTextFillColor,
                        }),
                        stroke: new ol.style.Stroke({
                            color: styleInfo.connectorTextStrokeColor,
                            width: 1.5 * styleInfo.connectorTextWidth,
                        }),
                        scale: 1.5 * styleInfo.textScale
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
        new WorkFlowItem("item 0"),
        new WorkFlowItem("item 1"),
        new WorkFlowItem("item 2"),
        new WorkFlowItem("item 3"),
        new WorkFlowItem("item 4"),
    ];

    let workflow = new WorkFlow(map, items);
    items[0].connect(items[1], "0->1");
    items[0].connect(items[2], "0->2");
    items[1].connect(items[3], "1->3");
    items[2].connect(items[3], "2->3");
    items[3].connect(items[4], "3->4");

    if (true) {
        workflow = new WorkFlow(map);

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

        eventHash.forEach(v => workflow.workflows.push(v));
    }


    let network = workflow.asNetwork();
    let graph = new DrawGraph<WorkFlowItem>({ item: null, children: network });
    graph.position();

    graph.visit(n => {
        console.log("visiting", n);
        n.item.row = n.dy;
        n.item.column = n.dx;

        if (n.parents.length) {
            let [dx, dy] = [0, 0];
            n.parents.some(p => {
                dx = p.item.column;
                dy = p.item.row;
                return true;
            });
            n.item.column += dx;
            n.item.row += dy;
            n.parents.filter(p => p.children.length === 1 && p.parents.length === 0).forEach(p => {
                p.item.column = n.item.column + 0.5;
                p.item.row = Math.max(p.item.row, n.item.row - 0.5);
            });
            n.parents.filter(p => p.children.length > 1 && p.parents.length === 0).forEach(p => {
                p.item.column = n.item.column + 0.5;
                p.item.row--;
            });
        }
        return false;
    });

    console.log(network);

    source = workflow.render();

    workflow.workflows.forEach(item => workflow.addControl(item));
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
                workflowItem.connect(childItem, event.id);
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
    children?: NodeList<T>;
    parents?: NodeList<T>;
    dx?: number;
    dy?: number;
    visited?: boolean;
};

type NodeList<T> = Array<Node<T>>;

class DrawGraph<T> {

    constructor(public rootNode: Node<T>) {
    }

    visit(cb: (node: Node<T>) => boolean, nodes = this.rootNode.children.filter(v => !v.parents.length)): boolean {
        if (nodes.some(n => cb(n))) return true;
        return nodes.some(n => this.visit(cb, n.children));
    }

    position(node = this.rootNode) {

        // assign parents to children, 
        // assign dx to all children (relative to parent position)
        let visit = (n: Node<T>) => {
            if (n.visited) return;
            n.visited = true;

            if (n.children) {
                let dy = n.dy;
                let dx = Math.floor(-n.children.length / 2);
                n.children.forEach(c => {
                    // center left-to-right
                    c.dx = dx++;
                    // below parent(s)
                    c.dy = Math.max(c.dy || 0, 1 + dy);
                    // do not consider the top node a parent
                    n.item && c.parents.push(n);
                    visit(c);
                });
            }
        };

        node.dx = node.dy = 0;

        // assign dx, dy and parents
        visit(node);

        // order nodes left-to-right based on child count
        {
            let orderChildren = (nodes: Node<T>[], dy = 0) => {
                let childCount = 0;
                nodes.forEach(n => childCount += Math.max(0, n.children.length - 1));
                let dx = -Math.floor(childCount / 2);
                nodes.forEach(v => {
                    let childCount = Math.max(0, v.children.length - 1);
                    v.dx = dx + Math.floor(childCount / 2);
                    v.dy = 1;
                    dx += 1 + childCount;
                });
                nodes.forEach(v => {
                    orderChildren(v.children, v.dy);
                });
            };

            // start with parentless nodes
            let nodes = node.children.filter(v => !v.parents.length);
            orderChildren(nodes, -1);
        }
    }

}