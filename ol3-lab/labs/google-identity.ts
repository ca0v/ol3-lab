// see https://developers.google.com/identity/sign-in/web/reference

import $ = require("jquery");
import ol = require("openlayers");

declare var gapi: any;
declare var window: any;

const client_id = "987911803084-a6cafnu52d7lkr8vfrtl4modrpinr1os.apps.googleusercontent.com";
const api_key = "AIzaSyCfuluThuQ0j7tCHg9GRf0lwDRHNUsZs6o";

requirejs.config({
	shim: {
		gapi: {
			exports: "gapi"
		}
	},
	paths: {
		gapi: "https://apis.google.com/js/api.js"
	}
});

declare namespace GoogleSignIn {
	export interface ExtraQueryParams {
		authuser: string;
	}

	export interface SessionState {
		extraQueryParams: ExtraQueryParams;
	}

	export interface Identity {
		token_type: string;
		access_token: string;
		scope: string;
		login_hint: string;
		expires_in: number;
		id_token: string;
		session_state: SessionState;
	}

	interface UserInfo {
		getGrantedScopes(): string;
		getBasicProfile(): BasicProfile;
	}

	interface BasicProfile {
		getId(): string;
		getName(): string;
		getGivenName(): string;
		getFamilyName(): string;
		getEmail(): string;
		getImageUrl(): string;
	}

	interface Auth2 {
		init(args: {
			client_id?: string;
			cookie_policy?: string;
			scope?: string;
			fetch_basic_profile?: boolean;
		}): GoogleAuth;

		signIn(args: { scope?: string; fetch_basic_profile?: boolean }): JQueryPromise<void>;

		signOut(): JQueryPromise<void>;
	}

	interface GoogleAuth {
		then(cb: (args: any) => void): GoogleAuth;
	}
}

let html = `
    <div class="g-signin2" data-onsuccess="giAsyncInit" data-theme="dark"></div>
    <button class='logout-button'>Logout</button>
`;

function createMap() {
	let basemap = new ol.layer.Tile({
		source: new ol.source.OSM()
	});

	let map = new ol.Map({
		target: "map",
		view: new ol.View({
			projection: "EPSG:4326",
			center: [-82.4, 34.85],
			zoom: 10
		}),
		layers: [basemap]
	});
}
class GoogleIdentity {
	/**
	 * The ID token to pass to backend
	 * Server must do the following:
	 * - ensure ID is properly signed by Google
	 * - ensure aud matches of of the apps client ID
	 * - ensure iss equals [https://]accounts.google.com
	 * - exp has not passed
	 * - ensure hd matches apps host domain (if provided)
	 * NOTE: google has a `tokeninfo` validation endpoint to parse this token
	 * [tokeninfo](https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=XYZ123)
	 */
	id_token: string;

	constructor(public client_id: string) {}

	load() {
		let d = $.Deferred();

		// https://apis.google.com/js/client.js
		$(`
            <meta name="google-signin-scope" content="profile email https://www.googleapis.com/auth/calendar.readonly">
            <meta name="google-signin-client_id" content="${this.client_id}">
            <script src="https://apis.google.com/js/platform.js" async defer></script>
        `).appendTo("head");

		window.giAsyncInit = (args: any) => {
			// The ID token you need to pass to your backend:
			this.id_token = args.getAuthResponse().id_token;
			d.resolve(args);
			delete window.giAsyncInit;
		};

		return d;
	}

	showInfo(googleUser: GoogleSignIn.UserInfo) {
		createMap();
		let profile = googleUser.getBasicProfile();
		$(`<img src='${profile.getImageUrl()}'>${profile.getName()}</img>`).appendTo("body");
	}

	logout() {
		var auth2 = gapi.auth2.getAuthInstance();
		auth2.signOut().then(function() {
			console.log("User signed out.");
		});
	}
}

export function run() {
	$(html).appendTo("body");

	require(["gapi"], (gapi: any) => {
		gapi.load("client", () => {
			debugger;
			gapi.client.setApiKey(api_key);
			gapi.auth2
				.init({
					client_id: client_id,
					scope: "profile https://www.googleapis.com/auth/calendar.readonly"
				})
				.then(() => {
					debugger;
					let auth2 = gapi.auth2.getAuthInstance();
				});
		});
	});

	return;

	let gi = new GoogleIdentity(client_id);

	gi.load().then(args => {
		gi.showInfo(args);

		gapi.load("client", "v3", () => {
			debugger;
		});
	});

	$("button.logout-button").click(() => {
		gi.logout();
	});
}
