// http://www.w3schools.com/charsets/ref_utf_arrows.asp

import $ = require("jquery");
import ol = require("openlayers");
import Snapshot = require("../labs/common/snapshot");

export function cssin(name: string, css: string) {
    let id = `style-${name}`;
    let styleTag = <HTMLStyleElement>document.getElementById(id);
    if (!styleTag) {
        styleTag = document.createElement("style");
        styleTag.id = id;
        styleTag.innerText = css;
        document.head.appendChild(styleTag);
    }

    let dataset = styleTag.dataset;
    dataset["count"] = parseInt(dataset["count"] || "0") + 1 + "";

    return () => {
        dataset["count"] = parseInt(dataset["count"] || "0") - 1 + "";
        if (dataset["count"] === "0") {
            styleTag.remove();
        }
    };
}

export function mixin<A extends any, B extends any>(a: A, b: B) {
    Object.keys(b).forEach(k => a[k] = b[k]);
    return <A & B>a;
}

const css = `
    .ol-grid {
        position:absolute;
    }
    .ol-grid.top {
        top: 0.5em;
    }
    .ol-grid.top-1 {
        top: 1.5em;
    }
    .ol-grid.top-2 {
        top: 2.5em;
    }
    .ol-grid.top-3 {
        top: 3.5em;
    }
    .ol-grid.top-4 {
        top: 4.5em;
    }
    .ol-grid.left {
        left: 0.5em;
    }
    .ol-grid.left-1 {
        left: 1.5em;
    }
    .ol-grid.left-2 {
        left: 2.5em;
    }
    .ol-grid.left-3 {
        left: 3.5em;
    }
    .ol-grid.left-4 {
        left: 4.5em;
    }
    .ol-grid.bottom {
        bottom: 0.5em;
    }
    .ol-grid.bottom-1 {
        bottom: 1.5em;
    }
    .ol-grid.bottom-2 {
        bottom: 2.5em;
    }
    .ol-grid.bottom-3 {
        bottom: 3.5em;
    }
    .ol-grid.bottom-4 {
        bottom: 4.5em;
    }
    .ol-grid.right {
        right: 0.5em;
    }
    .ol-grid.right-1 {
        right: 1.5em;
    }
    .ol-grid.right-2 {
        right: 2.5em;
    }
    .ol-grid.right-3 {
        right: 3.5em;
    }
    .ol-grid.right-4 {
        right: 4.5em;
    }
    .ol-grid .ol-grid-container {
        min-width: 8em;
        max-height: 16em;
        overflow-y: auto;
    }
    .ol-grid .ol-grid-container.ol-hidden {
        display: none;
    }
    .ol-grid .feature-row {
        cursor: pointer;
        border: 1px transparent;
    }
    .ol-grid .feature-row:hover {
        background: black;
        color: white;
        border: 1px solid white;
    }
`;

const grid_html = `
<div class='ol-grid-container'>
    <table class='ol-grid-table'>
        <tbody></tbody>
    </table>
</div>
`;

let olcss = {
    CLASS_CONTROL: 'ol-control',
    CLASS_UNSELECTABLE: 'ol-unselectable',
    CLASS_UNSUPPORTED: 'ol-unsupported',
    CLASS_HIDDEN: 'ol-hidden'
};

export interface IOptions {
    // what css class name to assign to the main element
    className?: string;
    expanded?: boolean;
    hideButton?: boolean;
    autoClear?: boolean;
    autoCollapse?: boolean;
    autoSelect?: boolean;
    canCollapse?: boolean;
    currentExtent?: boolean;
    closedText?: string;
    openedText?: string;
    source?: HTMLElement;
    target?: HTMLElement;
    // what to show on the tooltip
    placeholderText?: string;
    onChange?: (args: { value: string }) => void;
}

const expando = {
    right: '»',
    left: '«'
};

const defaults: IOptions = {
    className: 'ol-grid top right',
    expanded: false,
    autoClear: false,
    autoCollapse: true,
    autoSelect: true,
    canCollapse: true,
    currentExtent: true,
    hideButton: false,
    closedText: expando.right,
    openedText: expando.left,
    placeholderText: 'Search'
};

export class Grid extends ol.control.Control {

    static create(options: IOptions = {}): Grid {

        cssin('ol-grid', css);

        // provide computed defaults        
        options = mixin({
            openedText: options.className && -1 < options.className.indexOf("left") ? expando.left : expando.right,
            closedText: options.className && -1 < options.className.indexOf("left") ? expando.right : expando.left,
        }, options || {});

        // provide static defaults        
        options = mixin(mixin({}, defaults), options);

        let element = document.createElement('div');
        element.className = `${options.className} ${olcss.CLASS_UNSELECTABLE} ${olcss.CLASS_CONTROL}`;

        let geocoderOptions = mixin({
            element: element,
            target: options.target,
            expanded: false
        }, options);

        return new Grid(geocoderOptions);
    }

    private button: HTMLButtonElement;
    private grid: HTMLTableElement;

    private options: IOptions & {
        element: HTMLElement;
        target: HTMLElement;
    };

    constructor(options: IOptions & {
        element: HTMLElement;
        target: HTMLElement;
    }) {

        if (options.hideButton) {
            options.canCollapse = false;
            options.autoCollapse = false;
            options.expanded = true;
        }

        super({
            element: options.element,
            target: options.target
        });

        let button = this.button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.title = options.placeholderText;
        options.element.appendChild(button);
        if (options.hideButton) {
            button.style.display = "none";
        }

        let grid = $(grid_html.trim());
        this.grid = <HTMLTableElement>$(".ol-grid-table", grid)[0];

        grid.appendTo(options.element);

        button.addEventListener("click", () => {
            options.expanded ? this.collapse(options) : this.expand(options);
        });

        options.expanded ? this.expand(options) : this.collapse(options);

        this.options = options;
    }

    add(feature: ol.Feature) {
        let tbody = this.grid.tBodies[0];
        let data = $(`<tr class="feature-row"><td><a href="#"><canvas class="icon"></canvas></a></td></tr>`);

        let canvas = <HTMLCanvasElement>$(".icon", data)[0];
        canvas.width = 160;
        canvas.height = 64;
        Snapshot.render(canvas, feature);

        data.on("click", () => {
            this.dispatchEvent({
                type: "feature-click",
                feature: feature,
                row: data[0]
            });
        });
        data.appendTo(tbody);
    }

    clear() {
        let tbody = this.grid.tBodies[0];
        tbody.innerHTML = "";
    }

    setMap(map: ol.Map) {
        super.setMap(map);

        let vectorLayers = map.getLayers()
            .getArray()
            .filter(l => l instanceof ol.layer.Vector)
            .map(l => <ol.layer.Vector>l);

        if (this.options.currentExtent) {
            let redraw = () => {
                this.clear();
                let extent = map.getView().calculateExtent(map.getSize());
                vectorLayers
                    .map(l => l.getSource())
                    .forEach(source => {
                        source.forEachFeatureInExtent(extent, feature => {
                            this.add(feature);
                        });
                    })
            };

            map.getView().on(["change:center", "change:resolution"], () => {
                redraw();
            });

            vectorLayers.forEach(l => l.getSource().on("addfeature", () => {
                redraw();
            }));

        }
        else {
            vectorLayers.forEach(l => l.getSource().on("addfeature", (args: { feature: ol.Feature }) => {
                this.add(args.feature);
            }));

        }


    }

    collapse(options: IOptions) {
        if (!options.canCollapse) return;
        options.expanded = false;
        this.grid.parentElement.classList.toggle(olcss.CLASS_HIDDEN, true);
        this.button.classList.toggle(olcss.CLASS_HIDDEN, false);
        this.button.innerHTML = options.closedText;
    }

    expand(options: IOptions) {
        options.expanded = true;
        this.grid.parentElement.classList.toggle(olcss.CLASS_HIDDEN, false);
        this.button.classList.toggle(olcss.CLASS_HIDDEN, true);
        this.button.innerHTML = options.openedText;
    }

    on(type: string, cb: Function): ol.Object | ol.Object[];
    on(type: "change", cb: (args: {
        type: string;
        target: Grid;
        value: string;
    }) => void): void;
    on(type: string, cb: Function) {
        return super.on(type, cb);
    }
}