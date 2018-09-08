(() => {
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

	let debug = getParameterByName("debug") === "1";
	let localhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

	document.body.classList.add(localhost ? "dark" : "light");
	let mochaNode = document.getElementById("mocha");
	if (!mochaNode) throw "mocha node required";
	mochaNode.classList.add(!debug ? "terse" : "verbose");

	loadCss(
		localhost ? "../node_modules/mocha/mocha.css" : "https://cdnjs.cloudflare.com/ajax/libs/mocha/5.2.0/mocha.css"
	);
	loadCss(
		localhost
			? "../node_modules/ol3-fun/static/ol/v5.1.3/ol.css"
			: "https://cdn.rawgit.com/openlayers/openlayers.github.io/master/en/v5.1.3/css/ol.css"
	);

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
		deps: ["../index"],

		callback: () => {
			requirejs(["mocha"], nomocha => {
				let Mocha = nomocha || window["mocha"];

				let mocha = Mocha.setup({
					timeout: 6000,
					ui: "bdd",
					bail: false
				});

				if (!nomocha || !nomocha.describe) {
					define("mocha", [], () => ({ describe, it }));
				}

				// execute "describe" and "it" methods before running mocha
				requirejs(["tests/index"], () => {
					mocha.run();
				});
			});
		}
	});
})();
