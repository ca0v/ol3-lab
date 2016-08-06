/**
 * This request produces the response below, which is routing to three points
 * 
 * http://www.mapquestapi.com/directions/v2/optimizedRoute?outFormat=json&unit=m&routeType=fastest&avoidTimedConditions=false&doReverseGeocode=true&narrativeType=text&enhancedNarrative=false&maxLinkId=0&locale=en_US&inFormat=kvp&avoids=unpaved&stateBoundaryDisplay=true&countryBoundaryDisplay=true&sideOfStreetDisplay=false&destinationManeuverDisplay=false&fullShape=false&shapeFormat=raw&inShapeFormat=raw&outShapeFormat=raw&generalize=10&drivingStyle=normal&highwayEfficiency=20&manMaps=false&key=cwm3pF5yuEGNp54sh96TF0irs5kCLd5y&from=50%20Datastream%20Plaza,%20Greenville,%20SC&to=550%20S%20Main%20St%20101,%20Greenville,%20SC%2029601&to=207%20N%20Main%20St,%20Greenville,%20SC%2029601&callback=define
 * 
 * The difference is that optimizedRoute will reorder 
 */
export = {
    "route": {
        "hasTollRoad": false,
        "hasBridge": false,
        "computedWaypoints": [],
        "fuelUsed": 0,
        "hasTunnel": false,
        "hasUnpaved": false,
        "hasHighway": false,
        "realTime": 0,
        "boundingBox": {
            "ul": {
                "lng": -82.401672,
                "lat": 34.845546
            },
            "lr": {
                "lng": -82.401672,
                "lat": 34.845546
            }
        },
        "distance": 0,
        "time": 0,
        "locationSequence": [0, 1],
        "hasSeasonalClosure": false,
        "sessionId": "579fc301-01c4-0004-02b7-3f82-00163e0300b8",
        "locations": [{
            "latLng": {
                "lng": -82.401672,
                "lat": 34.845546
            },
            "adminArea4": "Greenville",
            "adminArea5Type": "City",
            "adminArea4Type": "County",
            "adminArea5": "Greenville",
            "street": "567 S Main St",
            "adminArea1": "US",
            "adminArea3": "SC",
            "type": "s",
            "displayLatLng": {
                "lng": -82.401672,
                "lat": 34.845546
            },
            "linkId": 51023925,
            "postalCode": "29601-2504",
            "sideOfStreet": "L",
            "dragPoint": false,
            "adminArea1Type": "Country",
            "geocodeQuality": "ADDRESS",
            "geocodeQualityCode": "L1AAA",
            "adminArea3Type": "State"
        },
            {
                "latLng": {
                    "lng": -82.401674,
                    "lat": 34.845547
                },
                "adminArea4": "Greenville",
                "adminArea5Type": "City",
                "adminArea4Type": "County",
                "adminArea5": "Greenville",
                "street": "554 S Main St",
                "adminArea1": "US",
                "adminArea3": "SC",
                "type": "s",
                "displayLatLng": {
                    "lng": -82.401674,
                    "lat": 34.845547
                },
                "linkId": 51023925,
                "postalCode": "29601-2503",
                "sideOfStreet": "R",
                "dragPoint": false,
                "adminArea1Type": "Country",
                "geocodeQuality": "ADDRESS",
                "geocodeQualityCode": "L1AAA",
                "adminArea3Type": "State"
            }],
        "hasCountryCross": false,
        "legs": [{
            "hasTollRoad": false,
            "index": 0,
            "hasBridge": false,
            "hasTunnel": false,
            "roadGradeStrategy": [
                []
            ],
            "hasHighway": false,
            "hasUnpaved": false,
            "distance": 0,
            "time": 0,
            "origIndex": -1,
            "hasSeasonalClosure": false,
            "origNarrative": "",
            "hasCountryCross": false,
            "formattedTime": "00:00:00",
            "destNarrative": "",
            "destIndex": -1,
            "maneuvers": [{
                "signs": [],
                "index": 0,
                "maneuverNotes": [],
                "direction": 3,
                "narrative": "The origin and destination are essentially the same place.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-start_sm.gif",
                "distance": 0,
                "time": 0,
                "linkIds": [],
                "streets": ["S Main St"],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:00:00",
                "directionName": "Northeast",
                "mapUrl": "http://www.mapquestapi.com/staticmap/v4/getmap?key=cwm3pF5yuEGNp54sh96TF0irs5kCLd5y&type=map&size=225,160&pois=purple-1,34.845546,-82.40167199999999,0,0|&center=34.845546,-82.40167199999999&zoom=15&rand=1537905868&session=579fc301-01c4-0004-02b7-3f82-00163e0300b8",
                "startPoint": {
                    "lng": -82.401672,
                    "lat": 34.845546
                },
                "turnType": 2
            },
                {
                    "signs": [],
                    "index": 1,
                    "maneuverNotes": [],
                    "direction": 0,
                    "narrative": "554 S MAIN ST is on the left.",
                    "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-end_sm.gif",
                    "distance": 0,
                    "time": 0,
                    "linkIds": [],
                    "streets": [],
                    "attributes": 0,
                    "transportMode": "AUTO",
                    "formattedTime": "00:00:00",
                    "directionName": "",
                    "startPoint": {
                        "lng": -82.401672,
                        "lat": 34.845546
                    },
                    "turnType": -1
                }],
            "hasFerry": false
        }],
        "formattedTime": "00:00:00",
        "routeError": {
            "message": "",
            "errorCode": -400
        },
        "options": {
            "mustAvoidLinkIds": [],
            "drivingStyle": 2,
            "countryBoundaryDisplay": true,
            "generalize": -1,
            "narrativeType": "text",
            "locale": "en_US",
            "avoidTimedConditions": false,
            "destinationManeuverDisplay": true,
            "enhancedNarrative": false,
            "filterZoneFactor": -1,
            "timeType": 0,
            "maxWalkingDistance": -1,
            "routeType": "FASTEST",
            "transferPenalty": -1,
            "walkingSpeed": -1,
            "stateBoundaryDisplay": true,
            "maxLinkId": 0,
            "arteryWeights": [],
            "tryAvoidLinkIds": [],
            "unit": "M",
            "routeNumber": 0,
            "doReverseGeocode": true,
            "shapeFormat": "raw",
            "maneuverPenalty": -1,
            "useTraffic": false,
            "returnLinkDirections": false,
            "avoidTripIds": [],
            "manmaps": "true",
            "highwayEfficiency": 22,
            "sideOfStreetDisplay": true,
            "cyclingRoadFactor": 1,
            "urbanAvoidFactor": -1
        },
        "hasFerry": false
    },
    "info": {
        "copyright": {
            "text": "© 2016 MapQuest, Inc.",
            "imageUrl": "http://api.mqcdn.com/res/mqlogo.gif",
            "imageAltText": "© 2016 MapQuest, Inc."
        },
        "statuscode": 0,
        "messages": []
    }
};