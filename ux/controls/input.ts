// http://www.w3schools.com/charsets/ref_utf_arrows.asp

import $ = require("jquery");
import ol = require("openlayers");
import {mixin} from "../../labs/common/common";

const css = `
<style id='locator'>
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
</style>
`;

export interface GeocoderOptions {
    // what css class name to assign to the main element
    className?: string;
    expanded?: boolean;
    label?: string;
    labelActive?: string;
    source?: HTMLElement;
    target?: HTMLElement;
    // what to show on the tooltip
    tipLabel?: string;
}

const defaults: GeocoderOptions = {
    className: 'ol-input bottom left',
    expanded: false,
    label: '»',
    labelActive: '«',
    tipLabel: 'Search'
};

export class Geocoder extends ol.control.Control {

    static create(options?: GeocoderOptions): Geocoder {

        $("style#locator").length || $(css).appendTo('head');

        options = mixin(mixin({}, defaults), options || {});

        let cssClasses = `${options.className} ${ol.css.CLASS_UNSELECTABLE} ${ol.css.CLASS_CONTROL}`;
        let element = document.createElement('div');
        element.className = cssClasses;

        let geocoderOptions = mixin({
            element: element,
            target: options.target,
            expanded: false
        }, options);

        let geocoder = new Geocoder(geocoderOptions);
        return geocoder;
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
        button.title = options.tipLabel;
        options.element.appendChild(button);

        let input = this.input = document.createElement('input');
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
            this.dispatchEvent({
                type: "change",
                value: input.value
            });
        });

        input.addEventListener("blur", () => {
            //this.collapse(options);
        });

        options.expanded ? this.expand(options) : this.collapse(options);
    }

    collapse(options: GeocoderOptions) {
        options.expanded = false;
        this.input.classList.toggle("hidden", true);
        this.button.classList.toggle("hidden", false);
        this.button.innerHTML = options.label;
    }

    expand(options: GeocoderOptions) {
        options.expanded = true;
        this.input.classList.toggle("hidden", false);
        this.button.classList.toggle("hidden", true);
        this.button.innerHTML = options.labelActive;
        this.input.focus();
        this.input.select();
    }
}