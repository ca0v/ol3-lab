/// <reference path="../typings/index.d.ts" />
export function run() {
    let l = window.location;
    let path = `${l.origin}${l.pathname}?run=tests/`;
    let labs = `
    ags-format
    google-polyline
    webmap
    index
    `;
    
    document.writeln(`
    <p>
    Watch the console output for failed assertions (blank is good).
    </p>
    `);

    document.writeln(labs
        .split(/ /)
        .map(v => v.trim())
        .filter(v => !!v)
        .sort()
        .map(lab => `<a href=${path}${lab}&debug=1>${lab}</a>`)
        .join("<br/>"));
    
};