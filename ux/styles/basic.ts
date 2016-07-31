let stroke = {
    color: 'black',
    width: 2
};

let fill = {
    color: 'red'
};

let radius = 10;
let opacity = 0.5;

let square = {
    fill: fill,
    stroke: stroke,
    points: 4,
    radius: radius,
    angle: Math.PI / 4
};

let diamond = {
    fill: fill,
    stroke: stroke,
    points: 4,
    radius: radius,
    angle: 0
};

let triangle = {
    fill: fill,
    stroke: stroke,
    points: 3,
    radius: radius,
    angle: 0
};

let star = {
    fill: fill,
    stroke: stroke,
    points: 5,
    radius: radius,
    radius2: 4,
    angle: 0
};

let cross = {
    opacity: opacity,
    fill: fill,
    stroke: stroke,
    points: 4,
    radius: radius,
    radius2: 0,
    angle: 0
};

let x = {
    fill: fill,
    stroke: stroke,
    points: 4,
    radius: radius,
    radius2: 0,
    angle: Math.PI / 4
};

export = {
    cross: [{ star: cross }],
    square: [{ star: square }],
    diamond: [{ star: diamond }],
    star: [{ star: star }],
    triangle: [{ star: triangle }],
    x: [{ star: x }]
}