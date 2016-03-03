define(["require", "exports", "./ajax"], function (require, exports, ajax) {
    var MapQuestKey = "cwm3pF5yuEGNp54sh96TF0irs5kCLd5y";
    var Traffic = (function () {
        function Traffic() {
        }
        Traffic.prototype.incidents = function (url, data) {
            var req = $.extend({
                inFormat: "kvp",
                outFormat: "json"
            }, data);
            return ajax.jsonp(url, req).then(function (response) {
                return response;
            });
        };
        Traffic.test = function () {
            var serviceUrl = "http://www.mapquestapi.com/traffic/v2/incidents";
            var request = {
                key: MapQuestKey,
                filters: "construction,incidents",
                boundingBox: [34.85, -82.4, 35, -82]
            };
            new Traffic().incidents(serviceUrl, request).then(function (result) {
                console.log("traffic incidents", result);
                result.incidents.forEach(function (i) {
                    console.log(i.shortDesc, i.fullDesc);
                });
            });
        };
        return Traffic;
    })();
    return Traffic;
});
/**
 * Example:
 define({
    "incidents": [{
        "parameterizedDescription": {
            "crossRoad2": "SC-290 Locust Hill Rd / SC-253 Mountain View Rd",
            "crossRoad1": "",
            "position2": "",
            "direction": "both ways",
            "position1": "around",
            "eventText": "Intermittent Lane Closures, construction work",
            "toLocation": "Taylors",
            "roadName": "SC-290"
        },
        "delayFromFreeFlow": 0,
        "delayFromTypical": 0,
        "fullDesc": "Intermittent lane closures due to construction work on SC-290 Locust Hill Rd both ways around SC-253 Mountain View Rd.",
        "severity": 2,
        "lng": -82.345451,
        "shortDesc": "SC-290 Locust Hill Rd: intermittent lane closures around SC-253 Mountain View Rd",
        "type": 1,
        "endTime": "2016-12-21T23:59:00",
        "id": "343010",
        "startTime": "2015-09-23T00:01:00",
        "distance": 0.01,
        "impacting": true,
        "eventCode": 701,
        "lat": 34.993832,
        "iconURL": "http://api.mqcdn.com/mqtraffic/const_mod.png"
    },
    {
        "parameterizedDescription": {
            "crossRoad2": "US-29 Wade Hampton Blvd / SC-290 Buncombe Rd / Buncombe St",
            "crossRoad1": "SC-290 O'Neal Rd",
            "position2": "to",
            "direction": "both ways",
            "position1": "from",
            "eventText": "Intermittent Lane Closures, construction work",
            "fromLocation": "Greer",
            "toLocation": "Greer",
            "roadName": "SC-290"
        },
        "delayFromFreeFlow": 0.07999999821186066,
        "delayFromTypical": 0,
        "fullDesc": "Intermittent lane closures due to construction work on SC-101 both ways from SC-290 O'Neal Rd to US-29 Wade Hampton Blvd.",
        "severity": 2,
        "lng": -82.259537,
        "shortDesc": "SC-101: intermittent lane closures from SC-290 O'Neal Rd to US-29 Wade Hampton Blvd",
        "type": 1,
        "endTime": "2016-05-31T23:59:00",
        "id": "5274176",
        "startTime": "2015-11-26T09:37:25",
        "distance": 1.01,
        "impacting": false,
        "eventCode": 701,
        "lat": 34.94186,
        "iconURL": "http://api.mqcdn.com/mqtraffic/const_mod.png"
    },
    {
        "parameterizedDescription": {
            "crossRoad2": "US-29 Wade Hampton Blvd / SC-290 Buncombe Rd / Buncombe St",
            "crossRoad1": "",
            "position2": "",
            "direction": "both ways",
            "position1": "at",
            "eventText": "Intermittent Lane Closures, construction work",
            "toLocation": "Greer",
            "roadName": "US-29"
        },
        "delayFromFreeFlow": 0.019999999552965164,
        "delayFromTypical": 0.019999999552965164,
        "fullDesc": "Intermittent lane closures due to construction work on US-29 Wade Hampton Blvd both ways at SC-290 Buncombe Rd.",
        "severity": 2,
        "lng": -82.258942,
        "shortDesc": "US-29 Wade Hampton Blvd: intermittent lane closures at SC-290 Buncombe Rd",
        "type": 1,
        "endTime": "2016-05-31T23:59:00",
        "id": "5019586",
        "startTime": "2015-04-27T00:01:00",
        "distance": 0.01,
        "impacting": true,
        "eventCode": 701,
        "lat": 34.942001,
        "iconURL": "http://api.mqcdn.com/mqtraffic/const_mod.png"
    },
    {
        "parameterizedDescription": {
            "crossRoad2": "Leonard Rd / Mayfield Rd",
            "crossRoad1": "Abner Creek Rd / Mayfield Rd",
            "position2": "to",
            "direction": "both ways",
            "position1": "from",
            "eventText": "Road closed, construction work",
            "fromLocation": "Reidville",
            "toLocation": "Reidville",
            "roadName": "Mayfield Rd"
        },
        "delayFromFreeFlow": 0,
        "delayFromTypical": 0,
        "fullDesc": "Road closed due to construction work on Mayfield Rd both ways from Abner Creek Rd to Leonard Rd.",
        "severity": 2,
        "lng": -82.164932,
        "shortDesc": "Mayfield Rd: road closed from Abner Creek Rd to Leonard Rd",
        "type": 1,
        "endTime": "2016-02-29T23:59:00",
        "id": "5261488",
        "startTime": "2015-11-16T00:01:00",
        "distance": 0,
        "impacting": false,
        "eventCode": 401,
        "lat": 34.879845,
        "iconURL": "http://api.mqcdn.com/mqtraffic/const_mod.png"
    },
    {
        "parameterizedDescription": {
            "crossRoad2": "I-85 Exit 68 / SC-129",
            "crossRoad1": "I-85 Exit 56 / SC-14",
            "position2": "and",
            "direction": "both ways",
            "position1": "between",
            "eventText": "Intermittent Lane Closures, construction",
            "fromLocation": "Wellford",
            "toLocation": "Wellford",
            "roadName": "I-85"
        },
        "delayFromFreeFlow": 0,
        "delayFromTypical": 0,
        "fullDesc": "Intermittent lane closures due to construction on I-85 both ways between I-85 Exit 56 / SC-14 and I-85 Exit 68 / SC-129.",
        "severity": 3,
        "lng": -82.053238,
        "shortDesc": "I-85: intermittent lane closures between Exit 56 and Exit 68",
        "type": 1,
        "endTime": "2016-09-16T23:59:00",
        "id": "123533",
        "startTime": "2014-08-18T00:00:00",
        "distance": 23.69,
        "impacting": false,
        "eventCode": 701,
        "lat": 34.961029,
        "iconURL": "http://api.mqcdn.com/mqtraffic/const_mod.png"
    },
    {
        "parameterizedDescription": {
            "crossRoad2": "I-26  Exits 18A,18B / I-85  Exit 70",
            "crossRoad1": "",
            "position2": "",
            "direction": "Southbound",
            "position1": "at",
            "eventText": "Accident",
            "toLocation": "Spartanburg",
            "roadName": "I-85"
        },
        "delayFromFreeFlow": 0,
        "delayFromTypical": 0,
        "fullDesc": "Accident on I-85 Southbound at Exit 70 I-26.",
        "severity": 3,
        "lng": -82.012154,
        "shortDesc": "I-85 S/B: accident at Exit 70 I-26",
        "type": 4,
        "endTime": "2016-01-18T14:57:19",
        "id": "6381949",
        "startTime": "2016-01-18T13:21:36",
        "distance": 0.01,
        "impacting": false,
        "eventCode": 201,
        "lat": 34.978237,
        "iconURL": "http://api.mqcdn.com/mqtraffic/incid_mod.png"
    },
    {
        "parameterizedDescription": {
            "crossRoad2": "I-85 Bus  Exit 1 / College Dr",
            "crossRoad1": "",
            "position2": "",
            "direction": "Southbound",
            "position1": "at",
            "eventText": "Object in Road, approach With Care",
            "toLocation": "Spartanburg",
            "roadName": "I-85 Bus"
        },
        "delayFromFreeFlow": 0,
        "delayFromTypical": 0,
        "fullDesc": "Object in the road on I-85 Bus Southbound at Exit 1 College Dr. Approach with care.",
        "severity": 3,
        "lng": -82.011215,
        "shortDesc": "I-85 Bus S/B: object in the road at Exit 1 College Dr",
        "type": 4,
        "endTime": "2016-01-18T15:05:30",
        "id": "6383724",
        "startTime": "2016-01-18T14:02:17",
        "distance": 0.01,
        "impacting": false,
        "eventCode": 61,
        "lat": 34.96685,
        "iconURL": "http://api.mqcdn.com/mqtraffic/incid_mod.png"
    }],
    "mqURL": "http://www.mapquest.com/maps?traffic=1&latitude=34.925&longitude=-82.2000001",
    "info": {
        "copyright": {
            "text": "© 2015 MapQuest, Inc.",
            "imageUrl": "http://api.mqcdn.com/res/mqlogo.gif",
            "imageAltText": "© 2015 MapQuest, Inc."
        },
        "statuscode": 0,
        "messages": []
    }
});
 */ 
