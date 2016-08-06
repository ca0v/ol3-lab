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
    mapmaker&background=light
    mapmaker&geom=t\`syzE}gm_dAm_@A?r@p@Bp@Hp@Ph@Td@Z\`@\`@Vb@Nd@xUABmF
    mapmaker&geom=t\`syzE}gm_dAm_@A?r@p@Bp@Hp@Ph@Td@Z\`@\`@Vb@Nd@xUABmF&color=yellow&background=dark
    index
    `;

    let styles = document.createElement("style");
    document.head.appendChild(styles);

    styles.innerText += `
    #map {
        display: none;
    }
    `;

    let labDiv = document.createElement("div");
    document.body.appendChild(labDiv);

    labDiv.innerHTML = labs
        .split(/ /)
        .map(v => v.trim())
        .filter(v => !!v)
        .sort()
        .map(lab => `<a href='${path}${lab}&debug=1'>${lab}</a>`)
        .join("<br/>");


    let testDiv = document.createElement("div");
    document.body.appendChild(testDiv);

    testDiv.innerHTML = `<a href='${l.origin}${l.pathname}?run=tests/index'>tests</a>`;
};