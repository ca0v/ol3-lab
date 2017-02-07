let symbol = () => ({
    "type": "esriSLS",
    "style": "esriSLSLongDashDot",
    "color": [
        152,
        230,
        0,
        255
    ],
    "width": 1,
    // these settings make it a CartographicLineSymbol (butt & bevel are the same as a SimpleLineSymbol)
    "cap": "esriLCSButt",
    "join": "esriLJSBevel",
    "miterLimit": 9.75
});

const styles = "Dash,DashDot,DashDotDot,Dot,LongDash,LongDashDot,ShortDash,ShortDashDot,ShortDashDotDot,ShortDot,Solid".split(",");
const caps = "Butt,Round,Square".split(",");
const joins = "Bevel,Miter,Round".split(",");

let symbols = styles.map((style, i) => {
    let result = symbol();
    result.style = `esriSLS${style}`;
    result.cap = `esriLCS${caps[i % caps.length]}`;
    result.join = `esriLJS${joins[i % joins.length]}`;
    return result;
})

export = symbols;
