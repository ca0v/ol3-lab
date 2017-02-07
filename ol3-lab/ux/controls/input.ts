// http://www.w3schools.com/charsets/ref_utf_arrows.asp

import $ = require("jquery");
import ol = require("openlayers");
import {mixin, cssin} from "../../labs/common/common";

const css = `
    .ol-input {
        position:absolute;
    }
    .ol-input.top {
        top: 0.5em;
    }
    .ol-input.left {
        left: 0.5em;
    }
    .ol-input.bottom {
        bottom: 0.5em;
    }
    .ol-input.right {
        right: 0.5em;
    }
    .ol-input.top.left {
        top: 4.5em;
    }
    .ol-input button {
        min-height: 1.375em;
        min-width: 1.375em;
        width: auto;
        display: inline;
    }
    .ol-input.left button {
        float:right;
    }
    .ol-input.right button {
        float:left;
    }
    .ol-input input {
        height: 24px;
        min-width: 240px;
        border: none;
        padding: 0;
        margin: 0;
        margin-left: 2px;
        margin-top: 1px;
        vertical-align: top;
    }
    .ol-input input.hidden {
        display: none;
    }
`;

let olcss = {
    CLASS_CONTROL: 'ol-control',
    CLASS_UNSELECTABLE: 'ol-unselectable',
    CLASS_UNSUPPORTED: 'ol-unsupported',
    CLASS_HIDDEN: 'ol-hidden'
};

export interface GeocoderOptions {
    // what css class name to assign to the main element
    className?: string;
    expanded?: boolean;
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

const defaults: GeocoderOptions = {
    className: 'ol-input bottom left',
    expanded: false,
    closedText: expando.right,
    openedText: expando.left,
    placeholderText: 'Search'
};

export class Geocoder extends ol.control.Control {

    static create(options?: GeocoderOptions): Geocoder {

        cssin('ol-input', css);

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

        return new Geocoder(geocoderOptions);
    }

    private button: HTMLButtonElement;
    private input: HTMLInputElement;

    constructor(options: GeocoderOptions & {
        element: HTMLElement;
        target: HTMLElement;
    }) {

        super({
            element: options.element,
            target: options.target
        });

        let button = this.button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.title = options.placeholderText;
        options.element.appendChild(button);

        let input = this.input = document.createElement('input');
        input.placeholder = options.placeholderText;

        options.element.appendChild(input);

        button.addEventListener("click", () => {
            options.expanded ? this.collapse(options) : this.expand(options);
        });

        input.addEventListener("keypress", (args: KeyboardEvent) => {
            if (args.key === "Enter") {
                button.focus();
                this.collapse(options);
            }
        });

        input.addEventListener("change", () => {
            let args = {
                type: "change",
                value: input.value
            };

            this.dispatchEvent(args);
            if (options.onChange) options.onChange(args);
        });

        input.addEventListener("blur", () => {
            //this.collapse(options);
        });

        options.expanded ? this.expand(options) : this.collapse(options);
    }

    dispose() {
        debugger;
    }

    collapse(options: GeocoderOptions) {
        options.expanded = false;
        this.input.classList.toggle("hidden", true);
        this.button.classList.toggle("hidden", false);
        this.button.innerHTML = options.closedText;
    }

    expand(options: GeocoderOptions) {
        options.expanded = true;
        this.input.classList.toggle("hidden", false);
        this.button.classList.toggle("hidden", true);
        this.button.innerHTML = options.openedText;
        this.input.focus();
        this.input.select();
    }
}