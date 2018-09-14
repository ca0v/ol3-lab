(() => {
	function cssin(css: string) {
		let styleTag = document.createElement("style");
		styleTag.type = "text/css";
		if (!document.head) throw "document must have a head element to use css-injection";
		document.head.appendChild(styleTag);
		styleTag.appendChild(document.createTextNode(css));
	}

	function loadCss(url: string) {
		let link = document.createElement("link");
		link.type = "text/css";
		link.rel = "stylesheet";
		link.href = url;
		document.getElementsByTagName("head")[0].appendChild(link);
	}

	function getParameterByName(name: string, url?: string) {
		url = url || window.location.href;
		name = name.replace(/[\[\]]/g, "\\$&");
		var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
			results = regex.exec(url);
		if (!results) return null;
		if (!results[2]) return "";
		return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	let isTest = !!getParameterByName("test");
	let isRun = !!getParameterByName("run");
	if (isTest && isRun) isRun = false;

	let debug = getParameterByName("debug") === "1";
	let localhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
	let dark = getParameterByName("theme") === "dark";

	document.body.classList.toggle("dark", dark);
	document.body.classList.toggle("verbose", !localhost);
	document.body.classList.toggle("light", !dark);
	document.body.classList.toggle("terse", localhost && !debug);

	let deps = ["../index"] as Array<string>;

	loadCss(
		localhost ? "../node_modules/mocha/mocha.css" : "https://cdnjs.cloudflare.com/ajax/libs/mocha/5.2.0/mocha.css"
	);
	loadCss(
		localhost
			? "../node_modules/ol3-fun/static/ol/v5.1.3/ol.css"
			: "https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.1.3/css/ol.css"
	);

	if (isTest) {
		cssin(`map, .map { position: initial; width: 400px; height: 400px; border: 1px solid black;}`);
	}

	if (isRun) {
		cssin(`head,body,.map {
			position: absolute;
			top: 0;
			left: 0;
			bottom: 0;
			right: 0;
		}
		
		`);
	}

	// setup require js packaging system and load the "spec" before running mocha
	requirejs.config({
		shim: {
			// no need to wrap ol in a define method when using a shim
			// build this using the "npm run build-legacy" (see ol package.json)
			openlayers: {
				deps: [], // no dependencies, needs path to indicate where to find "openlayers"
				exports: "ol" // tell requirejs which global this library defines
			}
		},
		paths: {
			openlayers: localhost
				? "../../node_modules/ol3-fun/static/ol/v5.1.3/ol"
				: "https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.1.3/build/ol"
		},
		packages: [
			{
				name: "jquery",
				location: localhost ? "../../node_modules/jquery" : "https://code.jquery.com",
				main: localhost ? "dist/jquery.min" : "jquery-3.3.1.min"
			},
			{
				name: "mocha",
				location: localhost ? "../../node_modules/mocha" : "https://cdnjs.cloudflare.com/ajax/libs/mocha/5.2.0",
				main: localhost ? "mocha" : "mocha.min"
			}
		],
		deps: deps,

		callback: () => {
			if (isRun) {
				let testNames = getParameterByName("run") || "*";
				if (testNames === "*") testNames = "examples/index";
				let map = document.createElement("div");
				map.id = map.className = "map";
				document.body.appendChild(map);
				requirejs(testNames.split(","), (...tests) => tests.forEach(test => test.run()));
			}
			if (isTest) {
				let testNames = getParameterByName("test") || "*";
				if (testNames === "*") testNames = "tests/index";
				requirejs(["mocha"], () => {
					// window.Mocha is a
					let Mocha = (<any>window)["mocha"];
					let mocha = Mocha.setup({
						timeout: 5000,
						ui: "bdd",
						bail: debug
					});
					console.log(mocha);

					// mocha is putting out globals...hide them (should only be when running as CLI so not sure what's happening)
					define("mocha", [], () => ({ describe, it }));

					// execute "describe" and "it" methods before running mocha
					requirejs(testNames.split(","), () => mocha.run());
				});
			}
			if (!isRun && !isTest) {
				let mids = Object.keys((<any>requirejs).s.contexts._.registry);
				let examples = mids
					.filter(m => 0 === m.indexOf("ol3-lab/labs/"))
					.filter(n => -1 === n.indexOf("/common/"));
				let tests = mids.filter(m => 0 === m.indexOf("tests/")).filter(n => -1 === n.indexOf("/extras/"));
				console.log(examples, tests);
				examples = examples.map(n => `<a href="${location}${location.search ? "&" : "?"}run=${n}">${n}</a>`);
				tests = tests.map(n => `<a href="${location}${location.search ? "&" : "?"}test=${n}">${n}</a>`);
				document.body.innerHTML = `
				<label>Examples</label>
				<div>${examples.join("<br/>")}</div>
				<br/>
				<label>Tests</label>
				<div>${tests.join("<br/>")}</div>
				`;
			}
		}
	});
})();
