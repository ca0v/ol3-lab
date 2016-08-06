export function run() {
    let l = window.location;
    let path = `${l.origin}${l.pathname}?run=tests/`;
    let labs = `
    google-polyline
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