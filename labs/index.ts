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
    style-viewer&style=%5B%7B"circle":%7B"fill":%7B"gradient":%7B"type":"linear(32,32,96,96)","stops":"rgba(0,255,0,0.1)%200%25;rgba(0,255,0,0.8)%20100%25"%7D%7D,"opacity":1,"stroke":%7B"color":"rgba(0,255,0,1)","width":1%7D,"radius":64%7D%7D,%7B"icon":%7B"anchor":%5B16,48%5D,"size":%5B32,48%5D,"anchorXUnits":"pixels","anchorYUnits":"pixels","src":"http://openlayers.org/en/v3.17.1/examples/data/icon.png"%7D%7D,%7B"text":%7B"fill":%7B"color":"rgba(75,92,85,0.85)"%7D,"stroke":%7B"color":"rgba(255,255,255,1)","width":5%7D,"offset-x":0,"offset-y":16,"text":"fantasy%20light","font":"18px%20serif"%7D%7D%5D&geom=point    
    style-viewer&style=%5B%7B"svg":%7B"imgSize":%5B48,48%5D,"stroke":%7B"color":"rgba(255,25,0,0.8)","width":10%7D,"path":"M23%202%20L23%2023%20L43%2016.5%20L23%2023%20L35%2040%20L23%2023%20L11%2040%20L23%2023%20L3%2017%20L23%2023%20L23%202%20Z"%7D%7D%5D&geom=point
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