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
    style-viewer&geom=point&style=icon/png,text/text
    style-viewer&style=%5B%0A%20%20%7B%0A%20%20%20%20%22circle%22:%20%7B%0A%20%20%20%20%20%20%22fill%22:%20%7B%0A%20%20%20%20%20%20%20%20%22gradient%22:%20%7B%0A%20%20%20%20%20%20%20%20%20%20%22type%22:%20%22linear(32,32,96,96)%22,%0A%20%20%20%20%20%20%20%20%20%20%22stops%22:%20%22rgba(0,255,0,0.1)%200%25;rgba(0,255,0,0.8)%20100%25%22%0A%20%20%20%20%20%20%20%20%7D%0A%20%20%20%20%20%20%7D,%0A%20%20%20%20%20%20%22opacity%22:%201,%0A%20%20%20%20%20%20%22stroke%22:%20%7B%0A%20%20%20%20%20%20%20%20%22color%22:%20%22rgba(0,255,0,1)%22,%0A%20%20%20%20%20%20%20%20%22width%22:%201%0A%20%20%20%20%20%20%7D,%0A%20%20%20%20%20%20%22radius%22:%2064%0A%20%20%20%20%7D%0A%20%20%7D,%0A%20%20%7B%0A%20%20%20%20%22icon%22:%20%7B%0A%20%20%20%20%20%20%22anchor%22:%20%5B%0A%20%20%20%20%20%20%20%2016,%0A%20%20%20%20%20%20%20%2048%0A%20%20%20%20%20%20%5D,%0A%20%20%20%20%20%20%22size%22:%20%5B%0A%20%20%20%20%20%20%20%2032,%0A%20%20%20%20%20%20%20%2048%0A%20%20%20%20%20%20%5D,%0A%20%20%20%20%20%20%22anchorXUnits%22:%20%22pixels%22,%0A%20%20%20%20%20%20%22anchorYUnits%22:%20%22pixels%22,%0A%20%20%20%20%20%20%22src%22:%20%22http://openlayers.org/en/v3.17.1/examples/data/icon.png%22%0A%20%20%20%20%7D%0A%20%20%7D,%0A%20%20%7B%0A%20%20%20%20%22text%22:%20%7B%0A%20%20%20%20%20%20%22fill%22:%20%7B%0A%20%20%20%20%20%20%20%20%22color%22:%20%22rgba(75,92,85,0.85)%22%0A%20%20%20%20%20%20%7D,%0A%20%20%20%20%20%20%22stroke%22:%20%7B%0A%20%20%20%20%20%20%20%20%22color%22:%20%22rgba(255,255,255,1)%22,%0A%20%20%20%20%20%20%20%20%22width%22:%205%0A%20%20%20%20%20%20%7D,%0A%20%20%20%20%20%20%22offset-x%22:%200,%0A%20%20%20%20%20%20%22offset-y%22:%2016,%0A%20%20%20%20%20%20%22text%22:%20%22fantasy%20light%22,%0A%20%20%20%20%20%20%22font%22:%20%2218px%20serif%22%0A%20%20%20%20%7D%0A%20%20%7D%0A%5D&geom=point
    style-to-canvas
    polyline-encoder
    image-data-viewer
    mapmaker
    mapmaker&background=light
    mapmaker&geom=t\`syzE}gm_dAm_@A?r@p@Bp@Hp@Ph@Td@Z\`@\`@Vb@Nd@xUABmF
    mapmaker&geom=t\`syzE}gm_dAm_@A?r@p@Bp@Hp@Ph@Td@Z\`@\`@Vb@Nd@xUABmF&color=yellow&background=dark&modify=1
    facebook
    google-identity
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