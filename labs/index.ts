export function run() {
    let l = window.location;
    let path = `${l.origin}${l.pathname}?run=labs/`;
    let labs = `
    style-lab
    style-viewer
    style-viewer&geom=parcel
    style-viewer&geom=polygon-with-holes
    style-viewer&style=fill/gradient,text/text
    style-viewer&geom=parcel&style=fill/gradient,text/text
    style-to-canvas
    polyline-encoder
    image-data-viewer
    mapmaker
    index
    `;
    
    document.write(labs
        .split(/ /)
        .map(v => v.trim())
        .filter(v => !!v)
        .sort()
        .map(lab => `<a href=${path}${lab}&debug=1>${lab}</a>`)
        .join("<br/>"));
    
};