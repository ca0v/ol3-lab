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