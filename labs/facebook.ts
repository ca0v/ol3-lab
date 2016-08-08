import ol = require("openlayers");
import $ = require("jquery");

declare var window: any;

declare namespace FacebookPlaces {

    export interface Location {
        city: string;
        country: string;
        latitude: number;
        longitude: number;
        state: string;
        street: string;
        zip: string;
    }

    export interface Place {
        id: string;
        location: Location;
        name: string;
    }

    export interface Datum {
        id: string;
        created_time: Date;
        place: Place;
    }

    export interface Cursors {
        before: string;
        after: string;
    }

    export interface Paging {
        cursors: Cursors;
    }

    export interface Response {
        data: Datum[];
        paging: Paging;
    }

}

interface FB {
    // core methods
    init: (args: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
    }) => void;
    api: <U>(
        path: string,
        method: 'get' | 'post' | 'delete',
        params: any,
        cb: (args: U) => void) => void;
    ui: Function;

    // login methods    
    getLoginStatus(cb: (response: {
        status: 'connected' | 'not_authorized' | 'unknown';
        authResponse: {
            accessToken: string;
            expiresIn: string;
            signedRequest: string;
            userID: string;
        }
    }) => void): void;
    logout(): void;
    login(): void;


}

const css = `
<style id='authentication_css'>
    html, body, .map {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
    .authentication .facebook-toolbar {
        position: absolute;
        bottom: 30px;
        right: 20px;
    }
    .authentication .facebook-toolbar .login-button {
        display: none;
    }
</style>
`;

const html = `
<div class='authentication'>
    <div id="events"></div>

    <div class='facebook-toolbar'>
    <div class="fb-like" 
        data-href="http://localhost:94/code/ol3-lab/index.html?run=labs/authentication" 
        data-layout="button_count" 
        data-action="recommend" 
        data-size="small" 
        data-show-faces="true" 
        data-share="true">
    </div>

    <fb:login-button class='login-button' scope="public_profile,user_tagged_places,email" onlogin="$('#events').trigger('fb-login');"/>
    <button class='logout-button'>Logout</button>
    </div>
</div>
`;

class Facebook {

    FB: FB;
    user_id: string;

    load(appId: string) {

        let d = $.Deferred<FB>();
        window.fbAsyncInit = () => {
            this.FB = window.FB;

            this.FB.init({
                appId: appId,
                cookie: true,
                xfbml: true,
                version: 'v2.7'
            });

            d.resolve(window.FB);
            delete window.fbAsyncInit;
        };

        ((d: Document, s: string, id: string) => {
            let fjs = <HTMLScriptElement>d.getElementsByTagName(s)[0];
            if (d.getElementById(id)) { return; }
            let js = <HTMLScriptElement>d.createElement(s);
            js.id = id;
            js.src = "//connect.facebook.net/en_US/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        })(document, 'script', 'facebook-jssdk');

        return d;
    }

    getUserInfo() {
        type Response = {
            id: string;
            name: string;
        };
        let d = $.Deferred<Response>();
        this.FB.api<Response>('/me', 'get', {
            fields: 'last_name'
        }, response => {
            this.user_id = response.id;
            d.resolve(response);
        });
        return d;
    }

    getPlaces(user_id = this.user_id) {
        type response = FacebookPlaces.Response;

        let d = $.Deferred<response>();
        this.FB.api(`${this.user_id}/tagged_places`, 'get', {}, (args: response) => {
            d.resolve(args);
        });
        return d;
    }

}

function createMap(fb: Facebook) {

    let features = new ol.Collection<ol.Feature>();

    let source = new ol.source.Vector({
        features: features
    });

    let vectorLayer = new ol.layer.Vector({
        source: source
    });

    let style = new ol.style.Style({
        image: new ol.style.Circle({
            radius: 12,
            fill: new ol.style.Fill({ color: "#4267b2" }),
            stroke: new ol.style.Stroke({
                width: 3,
                color: "#29487d"
            })
        }),
        text: new ol.style.Text({
            fill: new ol.style.Fill({
                color: "#ffffff"
            }),
            stroke: new ol.style.Stroke({
                width: 3,
                color: "#4267b2"
            }),
            font: "15pt arial",
            text: "f"
        })

    });

    vectorLayer.setStyle(style);

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
        layers: [basemap, vectorLayer]
    });

    fb.getUserInfo().then(args => {
        fb.getPlaces(args.id).then(places => {
            places.data.forEach(data => {
                let loc = data.place.location;
                let geom = new ol.geom.Point([loc.longitude, loc.latitude]);
                let feature = new ol.Feature(geom);
                feature.setProperties({
                    name: data.place.name
                });
                feature.setStyle([style, new ol.style.Style({
                    text: new ol.style.Text({
                        fill: new ol.style.Fill({
                            color: "#ffffff"
                        }),
                        stroke: new ol.style.Stroke({
                            width: 3,
                            color: "#4267b2"
                        }),
                        font: "12pt arial",
                        text: data.place.name,
                        offsetY: 30
                    })
                })]);
                features.push(feature);
            });
            let extent = source.getExtent();
            map.getView().fit(extent, map.getSize());
        });
    });


}

export function run() {

    $(html).appendTo("body");
    $(css).appendTo("head");

    let fb = new Facebook();

    fb.load('639680389534759').then(FB => {

        $('.logout-button').click(() => {
            $('.login-button').show();
            $('.logout-button').hide();
            FB.logout();
        });

        FB.getLoginStatus(response => {
            switch (response.status) {
                case 'connected':
                    $('.login-button').hide();
                    $('.logout-button').show();
                    createMap(fb);
                    break;
                case 'not_authorized':
                    break;
                default:
                    $('#events').on("fb-login", () => {
                        $('.login-button').hide();
                        $('.logout-button').show();
                        createMap(fb);
                    });
                    $('.login-button').show();
                    $('.logout-button').hide();
            }
        });
    });


}