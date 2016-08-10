import $ = require("jquery");
import ol = require("openlayers");
import {mixin} from "../../labs/common/common";

export interface GeocoderOptions {
    // what css class name to assign to the main element
    className?: string;
    label?: HTMLElement | string;
    labelActive?: string;
    source?: HTMLElement | string;
    target?: HTMLElement;
    // what to show on the tooltip
    tipLabel?: string;
}

const defaults: GeocoderOptions = {
    className: 'ol-geocoder',
    label: '»',
    labelActive: 'Search',
    tipLabel: 'Search'
};

const css = `
<style id='locator'>
.ol-geocoder {
    position:absolute;
    bottom: 0.5em;
    left: 0.5em;
}
.ol-geocoder button {
    width: auto;
    display: inline;
}
.ol-geocoder input {
    height: 22px;
    display: none;
    border: none;
    padding: 0;
    margin: 0;
    margin-left: 2px;
}
.ol-geocoder input.visible {
    display: inline-block;
    min-width: 240px;
}
</style>
`;

function asElement(value: HTMLElement | string) {
    if (typeof value === "string") {
        let div = document.createElement("span");
        div.innerHTML = value;
        return div;
    } else {
        return value;
    }
}

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
            labelNode: asElement(options.label),
            labelActiveNode: asElement(options.labelActive),
            expanded: false
        }, options);

        let geocoder = new Geocoder(geocoderOptions);
        return geocoder;
    }

    constructor(options: GeocoderOptions & {
        element: HTMLElement;
        target: HTMLElement;
        labelNode: HTMLElement;
        labelActiveNode: HTMLElement;
        expanded: boolean;
    }) {

        super({
            element: options.element,
            target: options.target
        });

        let button = document.createElement('button');
        button.className = `${options.className}-button`;
        button.setAttribute('type', 'button');
        button.title = options.tipLabel;
        button.appendChild(options.labelNode);
        options.element.appendChild(button);

        let input = document.createElement('input');
        input.className = `${options.className}-input ${options.expanded ? "visible" : ""}`;
        options.element.appendChild(input);

        button.addEventListener("click", () => {
            options.expanded = !options.expanded;
            input.classList.toggle("visible", options.expanded);
            options.expanded && input.focus();
        });

        input.addEventListener("keypress", (args: KeyboardEvent) => {
            if (args.key === "Enter") {
                options.expanded = false;
                input.classList.toggle("visible", options.expanded);
                button.focus();
            }
        });

        input.addEventListener("change", () => {
            this.dispatchEvent({
                type: "change",
                value: input.value
            });
        });

        input.addEventListener("blur", () => {
            options.expanded = false;
            input.classList.toggle("visible", options.expanded);
        });
    }

    setMap(map: ol.Map) {
        super.setMap(map);
    }

}