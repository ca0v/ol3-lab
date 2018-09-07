import $ = require("jquery");
import ol = require("openlayers");
import PolylineEncoder = require("./common/ol3-polyline");
import GoogleEncoder = require("./common/google-polyline");

const PRECISION = 6;

const css = `
<style>
    .polyline-encoder .area {
        margin: 20px;
    }

    .polyline-encoder .area p {
        font-size: smaller;
    }

    .polyline-encoder .area canvas {
        vertical-align: top;
    }

    .polyline-encoder .area label {
        display: block;
        margin: 10px;
        border-bottom: 1px solid black;
    }

    .polyline-encoder .area textarea {
        min-width: 400px;
        min-height: 200px;
    }
</style>
`;

const ux = `
<div class='polyline-encoder'>
    <p>
    Demonstrates simplifying a geometry and then encoding it.  Enter an Input Geometry (e.g. [[1,2],[3,4]]) and watch the magic happen
    </p>

    <div class='input area'>
        <label>Input Geometry</label>
        <p>Enter a geometry here as an array of points in the form [[x1,y1], [x2,y2], ..., [xn, yn]]</p>
        <textarea></textarea>
        <canvas></canvas>
    </div>

    <div class='simplified area'>
        <label>Simplified Geometry</label>
        <p>This is a 'simplified' version of the Input Geometry.  
        You can also enter a geometry here as an array of points in the form [[x1,y1], [x2,y2], ..., [xn, yn]]</p>
        <textarea></textarea>
        <canvas></canvas>
    </div>

    <div class='encoded area'>
        <label>Encoded Simplified Geometry</label>
        <p>This is an encoding of the Simplified Geometry.  You can also enter an encoded value here</p>
        <textarea>[encoding]</textarea>
        <div>Use google encoder?</div>
        <input type='checkbox' id='use-google' />
        <p>Ported to Typescript from https://github.com/DeMoehn/Cloudant-nyctaxi/blob/master/app/js/polyline.js</p>
    </div>

    <div class='decoded area'>
        <label>Decoded Simplified Geometry</label>
        <p>This is the decoding of the Encoded Geometry</p>
        <textarea>[decoded]</textarea>
        <canvas></canvas>
    </div>

</div>
`;

let encoder: GoogleEncoder | PolylineEncoder;

const sample_input = [
	[-115.25532322799027, 36.18318333413792],
	[-115.25480459088912, 36.18318418322269],
	[-115.25480456865377, 36.18318418316166],
	[-115.25480483306748, 36.1831581364999],
	[-115.25480781267404, 36.18315812665095],
	[-115.2548095138256, 36.183158095267615],
	[-115.25481120389723, 36.183158054840916],
	[-115.2548128940441, 36.18315799638853],
	[-115.2548145842662, 36.18315791991047],
	[-115.25481628564361, 36.18315783445006],
	[-115.25481797597863, 36.18315773093339],
	[-115.25481965527126, 36.18315760936059],
	[-115.25482134571912, 36.18315747880541],
	[-115.2548230362423, 36.18315733022459],
	[-115.25482471568543, 36.183157172600346],
	[-115.25482639524148, 36.183156987937565],
	[-115.25482807479749, 36.183156803274784],
	[-115.25482974334876, 36.183156591542996],
	[-115.2548314230553, 36.18315637082881],
	[-115.25483309171943, 36.18315613205847],
	[-115.25483476042122, 36.183155884275266],
	[-115.25483641808054, 36.18315561843585],
	[-115.25483807581516, 36.18315533457071],
	[-115.25483973358743, 36.18315504169277],
	[-115.25484138031726, 36.183154730758616],
	[-115.25484302712233, 36.18315440179879],
	[-115.25484467396501, 36.183154063826066],
	[-115.25484630976528, 36.1831537077972],
	[-115.2548479456032, 36.18315334275542],
	[-115.25484957043632, 36.183152950644654],
	[-115.25485119526944, 36.183152558533834],
	[-115.25485280906014, 36.183152148366815],
	[-115.2548544229261, 36.18315172017415],
	[-115.2548560257496, 36.18315127392525],
	[-115.25485762861075, 36.18315081866349],
	[-115.25485922039188, 36.18315035435842],
	[-115.25486081224824, 36.18314987202764],
	[-115.25486239306215, 36.183149371640624],
	[-115.25486396279601, 36.1831488622103],
	[-115.25486553260517, 36.18314833475428],
	[-115.2548670913342, 36.18314779825488],
	[-115.25486863902088, 36.183147243699295],
	[-115.25487018674515, 36.18314668013086],
	[-115.25487172342703, 36.18314609850624],
	[-115.25487324902879, 36.18314550783829],
	[-115.25487476358818, 36.18314489911408],
	[-115.25487627818518, 36.18314428137708],
	[-115.25487778173971, 36.18314364558384],
	[-115.25487928533187, 36.18314300077779],
	[-115.25488076676396, 36.18314233788503],
	[-115.25488224823366, 36.183141665979406],
	[-115.25488370754327, 36.1831409759871],
	[-115.25488516689049, 36.18314027698193],
	[-115.25488661519529, 36.183139559920576],
	[-115.25488805238238, 36.183138842828726],
	[-115.25488948968233, 36.183138098698365],
	[-115.2548909047846, 36.18313734549412],
	[-115.25489231992445, 36.18313658327705],
	[-115.25489371286662, 36.18313581198606],
	[-115.25489510588402, 36.18313502266943],
	[-115.25489647670366, 36.183134224279],
	[-115.25489784759858, 36.18313340786281],
	[-115.25489919629575, 36.18313258237279],
	[-115.25490054503052, 36.18313174786991],
	[-115.25490187156761, 36.18313090429319],
	[-115.25490319817993, 36.18313004269079],
	[-115.25490450259451, 36.183129172014546],
	[-115.25490580704671, 36.183128292325435],
	[-115.25490708933879, 36.18312739454964],
	[-115.25490836055086, 36.18312648773055],
	[-115.25490962068287, 36.183125571868075],
	[-115.25491086973481, 36.18312464696224],
	[-115.25491210774435, 36.183123704000224],
	[-115.25491332355611, 36.18312275196436],
	[-115.25491453940552, 36.183121790915635],
	[-115.25491573305723, 36.18312082079315],
	[-115.25491691562885, 36.183119841627246],
	[-115.25491808715805, 36.18311884440516],
	[-115.25491924756955, 36.18311784715259],
	[-115.25492038582102, 36.18311683181332],
	[-115.2549215129924, 36.18311580743071],
	[-115.25492262908377, 36.183114774004764],
	[-115.25492373409503, 36.18311373153546],
	[-115.25492481690861, 36.183112679992306],
	[-115.2549258886421, 36.18311161940585],
	[-115.25492694929561, 36.183110549776046],
	[-115.25492798775133, 36.183109471072356],
	[-115.25492901516465, 36.183108374312525],
	[-115.25493003146033, 36.1831072775222],
	[-115.25493102555829, 36.18310617165801],
	[-115.25493200857615, 36.18310505675048],
	[-115.25493298051404, 36.183103932799625],
	[-115.25493393025415, 36.18310279977493],
	[-115.25493486891426, 36.18310165770687],
	[-115.25493579649431, 36.183100506595494],
	[-115.25493670187666, 36.18309934641027],
	[-115.25493759614129, 36.18309818619454],
	[-115.25493846824591, 36.183097007892144],
	[-115.25493931811518, 36.18309582952875],
	[-115.25494016802205, 36.183094642152525],
	[-115.25494099573123, 36.18309344570244],
	[-115.25494180124268, 36.18309224017851],
	[-115.25494259567414, 36.183091025611276],
	[-115.25494336787024, 36.18308981098305],
	[-115.25494412898631, 36.183088587311474],
	[-115.2549448790223, 36.183087354596566],
	[-115.25494560682303, 36.18308612182065],
	[-115.25494631246364, 36.18308487095804],
	[-115.25494700698661, 36.18308362006498],
	[-115.25494767927427, 36.18308236911088],
	[-115.2549483404819, 36.18308110911343],
	[-115.25494897949177, 36.183079840042225],
	[-115.25494960742166, 36.183078561927644],
	[-115.25495021311626, 36.183077283752056],
	[-115.25495080769318, 36.183076005545956],
	[-115.25495138011001, 36.18307470925323],
	[-115.25495193025388, 36.183073421912326],
	[-115.25495246935542, 36.18307211651528],
	[-115.25495298618397, 36.18307082007],
	[-115.25495349197016, 36.183069505568625],
	[-115.2549539754834, 36.183068200019065],
	[-115.25495443679894, 36.18306688539569],
	[-115.25495488703444, 36.183065561728924],
	[-115.25495531503466, 36.183064238001236],
	[-115.25495573195485, 36.18306290523016],
	[-115.2553212003638, 36.183064339787606],
	[-115.25532322799027, 36.18318333413792]
];

function updateEncoder() {
	let input = <HTMLTextAreaElement>$(".simplified textarea")[0];
	let geom = new ol.geom.LineString(<Array<ol.Coordinate>>JSON.parse(input.value));
	let encoded = encoder.encode(geom.getCoordinates());
	$(".encoded textarea")
		.val(encoded)
		.change();
}

function updateDecoder() {
	let input = <HTMLTextAreaElement>$(".encoded textarea")[0];
	$(".decoded textarea")
		.val(JSON.stringify(encoder.decode(input.value)))
		.change();
	updateCanvas(".decoded canvas", ".decoded textarea");
}

function updateCanvas(canvas_id: string, features_id: string) {
	let canvas = <HTMLCanvasElement>$(canvas_id)[0];

	canvas.width = canvas.height = 200;

	let geom = new ol.geom.LineString(<Array<ol.Coordinate>>JSON.parse((<HTMLTextAreaElement>$(features_id)[0]).value));

	let extent = geom.getExtent();

	let scale = (() => {
		let [w, h] = [ol.extent.getWidth(extent), ol.extent.getHeight(extent)];
		let [x0, y0] = ol.extent.getCenter(extent);
		let [dx, dy] = [canvas.width / 2, canvas.height / 2];
		let [sx, sy] = [dx / w, dy / h];
		return (x: number, y: number) => {
			return [sx * (x - x0) + dx, -sy * (y - y0) + dy];
		};
	})();

	let c = canvas.getContext("2d");

	//c.fillStyle = "#FF0000";
	// c.fillRect(0, 0, canvas.width, canvas.height);

	c.beginPath();
	{
		c.strokeStyle = "#000000";
		c.lineWidth = 1;
		geom.getCoordinates().forEach((p, i) => {
			let [x, y] = scale(p[0], p[1]);
			console.log(x, y);
			i === 0 && c.moveTo(x, y);
			c.lineTo(x, y);
		});

		c.stroke();
		c.closePath();
	}

	c.beginPath();
	{
		c.strokeStyle = "#FF0000";
		c.lineWidth = 1;
		geom.getCoordinates().forEach((p, i) => {
			let [x, y] = scale(p[0], p[1]);
			c.moveTo(x, y);
			c.rect(x, y, 1, 1);
		});

		c.stroke();

		c.closePath();
	}
}

export function run() {
	$(css).appendTo("head");
	$(ux).appendTo(".map");

	$("#use-google")
		.change(args => {
			encoder = $("#use-google:checked").length ? new GoogleEncoder() : new PolylineEncoder(6, 2);
			$(".simplified textarea").change();
		})
		.change();

	$(".encoded textarea").change(updateDecoder);

	$(".simplified textarea").change(() => {
		updateCanvas(".simplified canvas", ".simplified textarea");
		updateEncoder();
	});

	$(".input textarea")
		.val(JSON.stringify(sample_input))
		.change(args => {
			let input = <HTMLTextAreaElement>$(".input textarea")[0];
			let coords = <ol.Coordinate[]>JSON.parse(`${input.value}`);

			let geom = new ol.geom.LineString(coords);
			geom = geom.simplify(Math.pow(10, -PRECISION)) as ol.geom.LineString;

			$(".simplified textarea")
				.val(JSON.stringify(geom.getCoordinates()))
				.change();

			updateCanvas(".input canvas", ".input textarea");
		})
		.change();
}
