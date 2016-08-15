// Class
interface Path2D {
    addPath(path: Path2D, transform?: SVGMatrix): void;
    closePath(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    bezierCurveTo(cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;
    arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void;
    /*ellipse(x: number, y: number, radiusX: number, radiusY: number, rotation: number, startAngle: number, endAngle: number, anticlockwise?: boolean): void;*/
    rect(x: number, y: number, w: number, h: number): void;
}

// Constructor
interface Path2DConstructor {
    new (): Path2D;
    new (d: string): Path2D;
    new (path: Path2D, fillRule?: string): Path2D;
    prototype: Path2D;
}
declare var Path2D: Path2DConstructor;

// Extend CanvasRenderingContext2D
interface CanvasRenderingContext2Dext {
    fill(path: Path2D): void;
    stroke(path: Path2D): void;
    clip(path: Path2D, fillRule?: string): void;
}

export function run() {

    // setup a 100 x 100 canvas
    let [cw, ch] = [600, 600];
    let canvas = document.createElement("canvas");
    canvas.style.border = "1px solid black";
    canvas.width = cw;
    canvas.height = ch;
    let ctx = canvas.getContext("2d");

    // show the canvas
    document.getElementById("map").appendChild(canvas);

    // setup a path that is a upward pointing triangle
    let path = new Path2D("M12 0 L24 24 L0 24 L12 0 Z");
    let [dw, dh] = [24, 24];
    let positions = [[0, -60], [-60, 60], [60, 60]];

    let tick = 0;

    requestAnimationFrame(animate);
    function animate(time: number) {
        tick++;

        ctx.clearRect(0, 0, cw, ch);
        ctx.strokeStyle = "red";

        ctx.save();
        {
            ctx.translate(cw / 2, ch / 2);
            ctx.scale(Math.cos(tick * Math.PI / 180), Math.cos(tick * Math.PI / 180));
            ctx.rotate(tick * Math.PI / 180);
            ctx.translate(-cw / 2, -ch / 2);

            ctx.save();
            {
                ctx.translate(cw / 2, ch / 2);
                ctx.rotate(tick * Math.PI / 180);
                ctx.scale(5, 5);
                ctx.translate(-12, -12);
                ctx.stroke(path);
            }
            ctx.restore();
            
            ctx.save();
            {
                ctx.strokeStyle = "orange";
                positions.forEach(position => {
                    ctx.save();
                    {
                        // draw
                        ctx.translate(position[0], position[1]);
                        ctx.translate(cw / 2, ch / 2);

                        // make it 3 times bigger
                        ctx.scale(3, 3);
                        ctx.rotate(tick * Math.PI / 180);

                        // center on the top-center peak
                        ctx.translate(-12, -12);
                        ctx.stroke(path);
                    }
                    ctx.restore();
                });
            }
            ctx.restore();
        }
        ctx.restore();

        // request another animation loop
        if (tick < 360) requestAnimationFrame(animate);
    }

}