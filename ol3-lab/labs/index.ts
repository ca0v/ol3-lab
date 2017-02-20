export function run() {
    let l = window.location;
    let path = `${l.origin}${l.pathname}?run=ol3-lab/labs/`;
    let labs = `
    ol-draw
    ol-grid
    ol-input    
    ol-layerswitcher
    ol-panzoom
    ol-popup
    ol-search
    ol-symbolizer

    ../ux/ags-symbols

    ags-viewer&services=//sampleserver3.arcgisonline.com/ArcGIS/rest/services&serviceName=SanFrancisco/311Incidents&layers=0&debug=1&center=-122.49,37.738
    
    style-lab

    style-viewer
    style-viewer&geom=point&style=icon/png
    style-viewer&geom=point&style=icon/png,text/text
    style-viewer&geom=point&style=%5B%7B"image":%7B"imgSize":%5B45,45%5D,"rotation":0,"stroke":%7B"color":"rgba(255,25,0,0.8)","width":3%7D,"path":"M23%202%20L23%2023%20L43%2016.5%20L23%2023%20L35%2040%20L23%2023%20L11%2040%20L23%2023%20L3%2017%20L23%2023%20L23%202%20Z"%7D%7D%5D

    style-viewer&geom=point&style=%5B%7B"circle":%7B"fill":%7B"gradient":%7B"type":"linear(32,32,96,96)","stops":"rgba(0,255,0,0.1)%200%25;rgba(0,255,0,0.8)%20100%25"%7D%7D,"opacity":1,"stroke":%7B"color":"rgba(0,255,0,1)","width":1%7D,"radius":64%7D%7D,%7B"image":%7B"anchor":%5B16,48%5D,"size":%5B32,48%5D,"anchorXUnits":"pixels","anchorYUnits":"pixels","src":"http://openlayers.org/en/v3.20.1/examples/data/icon.png"%7D%7D,%7B"text":%7B"fill":%7B"color":"rgba(75,92,85,0.85)"%7D,"stroke":%7B"color":"rgba(255,255,255,1)","width":5%7D,"offset-x":0,"offset-y":16,"text":"fantasy%20light","font":"18px%20serif"%7D%7D%5D    

    style-viewer&geom=point&style=%5B%7B"image":%7B"imgSize":%5B13,21%5D,"fill":%7B"color":"rgba(0,0,0,0.5)"%7D,"path":"M6.3,0C6.3,0,0,0.1,0,7.5c0,3.8,6.3,12.6,6.3,12.6s6.3-8.8,6.3-12.7C12.6,0.1,6.3,0,6.3,0z%20M6.3,8.8%20c-1.4,0-2.5-1.1-2.5-2.5c0-1.4,1.1-2.5,2.5-2.5c1.4,0,2.5,1.1,2.5,2.5C8.8,7.7,7.7,8.8,6.3,8.8z"%7D%7D%5D

    style-viewer&geom=point&style=%5B%7B"image":%7B"imgSize":%5B15,15%5D,"anchor":%5B0,0.5%5D,"fill":%7B"color":"rgba(255,0,0,0.1)"%7D,"stroke":%7B"color":"rgba(255,0,0,1)","width":0.1%7D,"scale":8,"rotation":0.7,"img":"lock"%7D%7D,%7B"image":%7B"imgSize":%5B15,15%5D,"anchor":%5B100,0.5%5D,"anchorXUnits":"pixels","fill":%7B"color":"rgba(0,255,0,0.4)"%7D,"stroke":%7B"color":"rgba(255,0,0,1)","width":0.1%7D,"scale":1.5,"rotation":0.7,"img":"lock"%7D%7D,%7B"image":%7B"imgSize":%5B15,15%5D,"anchor":%5B-10,0%5D,"anchorXUnits":"pixels","anchorOrigin":"top-right","fill":%7B"color":"rgba(230,230,80,1)"%7D,"stroke":%7B"color":"rgba(0,0,0,1)","width":0.5%7D,"scale":2,"rotation":0.8,"img":"lock"%7D%7D%5D


    style-viewer&geom=multipoint&style=icon/png

    style-viewer&geom=polyline&style=stroke/dot

    style-viewer&geom=polygon&style=fill/diagonal
    style-viewer&geom=polygon&style=fill/horizontal,fill/vertical,stroke/dashdotdot
    style-viewer&geom=polygon&style=stroke/solid,text/text
    style-viewer&geom=polygon-with-holes&style=fill/cross,stroke/solid

    style-viewer&geom=multipolygon&style=stroke/solid,fill/horizontal,text/text

    style-to-canvas
    polyline-encoder
    image-data-viewer

    mapmaker
    mapmaker&background=light
    mapmaker&geom=t\`syzE}gm_dAm_@A?r@p@Bp@Hp@Ph@Td@Z\`@\`@Vb@Nd@xUABmF
    mapmaker&geom=t\`syzE}gm_dAm_@A?r@p@Bp@Hp@Ph@Td@Z\`@\`@Vb@Nd@xUABmF&color=yellow&background=dark&modify=1
    
    geocoder&modify=1

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
    .test {
        margin: 20px;
    }
    `;

    let labDiv = document.createElement("div");
    document.body.appendChild(labDiv);

    labDiv.innerHTML = labs
        .split(/ /)
        .map(v => v.trim())
        .filter(v => !!v)
        //.sort()
        .map(lab => `<div class='test'><a href='${path}${lab}&debug=1'>${lab}</a></div>`)
        .join("\n");


    let testDiv = document.createElement("div");
    document.body.appendChild(testDiv);

    testDiv.innerHTML = `<a href='${l.origin}${l.pathname}?run=ol3-lab/tests/index'>tests</a>`;
};