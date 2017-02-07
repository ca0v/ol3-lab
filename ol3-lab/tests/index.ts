export function run() {
    let l = window.location;
    let path = `${l.origin}${l.pathname}?run=ol3-lab/tests/`;
    let labs = `
    ags-format
    google-polyline
    webmap
    map-resize-defect
    drop-vertex-on-marker-detection
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