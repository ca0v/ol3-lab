define(["require", "exports", "./ajax", "jquery"], function (require, exports, ajax, $) {
    var MapQuestKey = "cwm3pF5yuEGNp54sh96TF0irs5kCLd5y";
    var Geocoding = (function () {
        function Geocoding() {
        }
        Geocoding.prototype.reverse = function (url, data) {
            var req = $.extend({
                inFormat: "kvp",
                outFormat: "json"
            }, data);
            return ajax.jsonp(url, req).then(function (response) {
                return response;
            });
        };
        Geocoding.prototype.address = function (url, data) {
            var req = $.extend({
                maxResults: 1,
                thumbMaps: false,
                ignoreLatLngInput: false,
                delimiter: ",",
                intlMode: "AUTO",
                inFormat: "kvp",
                outFormat: "json"
            }, data);
            return ajax.jsonp(url, req).then(function (response) {
                return response;
            });
        };
        Geocoding.test = function () {
            new Geocoding().address("http://www.mapquestapi.com/geocoding/v1/address", {
                key: MapQuestKey,
                location: "50 Datastream Plaza, Greenville, SC 29615",
                boundingBox: [34.85, -82.4, 35, -82]
            }).then(function (result) {
                console.log("geocoding address", result);
                result.results.forEach(function (r) { return console.log(r.providedLocation.location, r.locations.map(function (l) { return l.linkId; }).join(",")); });
            });
            new Geocoding().reverse("http://www.mapquestapi.com/geocoding/v1/reverse", {
                key: MapQuestKey,
                lat: 34.790672,
                lng: -82.407674
            }).then(function (result) {
                console.log("geocoding reverse", result);
                result.results.forEach(function (r) { return console.log(r.providedLocation.latLng, r.locations.map(function (l) { return l.linkId; }).join(",")); });
            });
        };
        return Geocoding;
    })();
    return Geocoding;
});
/**
 * Sample response:
 * reverse:
 define({
    "info": {
        "statuscode": 0,
        "copyright": {
            "text": "\u00A9 2016 MapQuest, Inc.",
            "imageUrl": "http://api.mqcdn.com/res/mqlogo.gif",
            "imageAltText": "\u00A9 2016 MapQuest, Inc."
        },
        "messages": []
    },
    "options": {
        "maxResults": 1,
        "thumbMaps": true,
        "ignoreLatLngInput": false
    },
    "results": [{
        "providedLocation": {
            "latLng": {
                "lat": 34.790672,
                "lng": -82.407674
            }
        },
        "locations": [{
            "street": "49 Datastream Plz",
            "adminArea6": "",
            "adminArea6Type": "Neighborhood",
            "adminArea5": "Greenville",
            "adminArea5Type": "City",
            "adminArea4": "Greenville",
            "adminArea4Type": "County",
            "adminArea3": "SC",
            "adminArea3Type": "State",
            "adminArea1": "US",
            "adminArea1Type": "Country",
            "postalCode": "29605-3451",
            "geocodeQualityCode": "L1AAA",
            "geocodeQuality": "ADDRESS",
            "dragPoint": false,
            "sideOfStreet": "L",
            "linkId": "0",
            "unknownInput": "",
            "type": "s",
            "latLng": {
                "lat": 34.790654,
                "lng": -82.407669
            },
            "displayLatLng": {
                "lat": 34.790654,
                "lng": -82.407669
            },
            "mapUrl": "http://www.mapquestapi.com/staticmap/v4/getmap?key=cwm3pF5yuEGNp54sh96TF0irs5kCLd5y&type=map&size=225,160&pois=purple-1,34.790654,-82.407669,0,0,|&center=34.790654,-82.407669&zoom=15&rand=1077291555"
        }]
    }]
})
 
 * address:
 
 define({
    "info": {
        "statuscode": 0,
        "copyright": {
            "text": "\u00A9 2016 MapQuest, Inc.",
            "imageUrl": "http://api.mqcdn.com/res/mqlogo.gif",
            "imageAltText": "\u00A9 2016 MapQuest, Inc."
        },
        "messages": []
    },
    "options": {
        "boundingBox": {
            "ul": {
                "lat": 34.85,
                "lng": -82.4
            },
            "lr": {
                "lat": 35.0,
                "lng": -82.0
            }
        },
        "maxResults": 1,
        "thumbMaps": false,
        "ignoreLatLngInput": false
    },
    "results": [{
        "providedLocation": {
            "location": "50 Datastream Plaza, Greenville, SC 29615"
        },
        "locations": [{
            "street": "50 Datastream Plz",
            "adminArea6": "",
            "adminArea6Type": "Neighborhood",
            "adminArea5": "Greenville",
            "adminArea5Type": "City",
            "adminArea4": "Greenville",
            "adminArea4Type": "County",
            "adminArea3": "SC",
            "adminArea3Type": "State",
            "adminArea1": "US",
            "adminArea1Type": "Country",
            "postalCode": "29605-3451",
            "geocodeQualityCode": "L1AAB",
            "geocodeQuality": "ADDRESS",
            "dragPoint": false,
            "sideOfStreet": "R",
            "linkId": "25112378i35469743r64987841",
            "unknownInput": "",
            "type": "s",
            "latLng": {
                "lat": 34.790672,
                "lng": -82.407674
            },
            "displayLatLng": {
                "lat": 34.790672,
                "lng": -82.407674
            }
        }]
    }]
})
 */ 
