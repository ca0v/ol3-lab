import ol = require("openlayers");
import $ = require("jquery");

requirejs.config({
    shim: {
        'facebook': {
            exports: 'FB'
        }
    },
    paths: {
        'facebook': '//connect.facebook.net/en_US/sdk'
    }
});

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

    // events
    Event: {
        subscribe: (name: string, cb: Function) => void
        unsubscribe: (name: string, cb: Function) => void
    };
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

    .logout-button {
        background-color: #365899;
        border: 1px solid #365899;
        color: white;
        border-radius: 3px;
        font-size: 8pt !important;
        height: 20px;
        vertical-align: bottom;
    }
</style>
`;

const html = `
<div class='authentication'>
    <div id="events"></div>

    <div class='facebook-toolbar'>
    <div class="fb-like" 
        data-href="${window.location}" 
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

        requirejs(['facebook'], (FB: FB) => {
            this.FB = FB;
            FB.init({
                appId: appId,
                cookie: true,
                xfbml: true,
                version: 'v2.7'
            });

            d.resolve(FB);
        });

        return d;
    }

    on(event: string, cb: Function) {
        this.FB.Event.subscribe(event, cb);
        return { off: () => this.FB.Event.unsubscribe(event, cb) };
    }

    private api<T>(name: string, args = {}) {
        let d = $.Deferred<T>();
        this.FB.api(`${name}`, 'get', args, (args: T) => {
            d.resolve(args);
        });
        return d;
    }

    getUserInfo() {
        return this.api<{
            id: string;
            name: string;
        }>('me').done(v => {
            this.user_id = v.id;
        });
    }

    getPlaces(user_id = this.user_id) {
        return this.api<FacebookPlaces.Response>(`${this.user_id}/tagged_places`);
    }

    getPicture() {
        return this.api<{ data: { is_silhouette: boolean; url: string } }>(`${this.user_id}/picture`);
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

    return map;
}

export function run() {

    $(css).appendTo("head");
    $(html).appendTo("body");

    //$('.login-button').hide();
    $('.logout-button').hide();

    let fb = new Facebook();

    fb.load('639680389534759').then(FB => {

        let map: ol.Map;

        let onLoggedIn = () => {
            console.log("logged in");
            $('.login-button').hide();
            $('.logout-button').show();
            map = createMap(fb);
            fb.getPicture().then(picture => {
                if (picture.data.is_silhouette) return;
                $(`<img class='fb-pic' src='${picture.data.url}'/>'`).prependTo('.facebook-toolbar');
            });
        };

        let onLoggedOut = () => {
            console.log("logged out");
            $('.login-button').show();
            $('.logout-button').hide();
            if (map) {
                map.dispose();
                map = null;
            }
            $('.fb-pic').remove();
        };

        fb.on('auth.login', onLoggedIn);

        fb.on('auth.logout', onLoggedOut);

        $('.logout-button').click(() => FB.logout());

        FB.getLoginStatus(args => {
            switch (args.status) {
                case 'connected':
                    onLoggedIn();
                    break;
                case 'not_authorized':
                    break;
                default:
                    onLoggedOut();
                    break;
            }
        });

        //FB.login();
    });


}