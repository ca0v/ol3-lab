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
        "computedWaypoints": [],
        "fuelUsed": 0.33,
        "shape": {
            "maneuverIndexes": [0, 3, 6, 9, 16, 20, 31, 37, 40],
            "shapePoints": [34.790672, -82.407676, 34.791465, -82.407936, 34.791774, -82.40866, 34.791774, -82.40866, 34.791465, -82.410713, 34.79071, -82.411811, 34.79071, -82.411811, 34.78852, -82.414115, 34.787902, -82.415168, 34.787902, -82.415168, 34.78857, -82.415596, 34.791408, -82.416847, 34.793861, -82.419006, 34.797557, -82.421356, 34.798877, -82.422737, 34.799873, -82.424446, 34.799873, -82.424446, 34.80167, -82.424133, 34.80392, -82.423469, 34.807411, -82.421798, 34.807411, -82.421798, 34.807895, -82.422035, 34.809406, -82.421936, 34.817108, -82.419311, 34.81863, -82.418472, 34.819698, -82.417564, 34.823398, -82.413398, 34.826889, -82.410057, 34.828369, -82.408966, 34.831047, -82.4057, 34.832126, -82.404014, 34.832126, -82.404014, 34.834873, -82.405517, 34.839363, -82.406455, 34.841873, -82.406387, 34.842742, -82.405845, 34.84452, -82.404212, 34.84452, -82.404212, 34.844757, -82.402526, 34.845546, -82.401672, 34.845546, -82.401672, 34.846393, -82.40097, 34.85271, -82.398056],
            "legIndexes": [0, 40, 43]
        },
        "hasUnpaved": false,
        "hasHighway": true,
        "realTime": 820,
        "boundingBox": {
            "ul": {
                "lng": -82.424446,
                "lat": 34.85271
            },
            "lr": {
                "lng": -82.398056,
                "lat": 34.787902
            }
        },
        "distance": 5.804,
        "time": 793,
        "locationSequence": [0, 1, 2],
        "hasSeasonalClosure": false,
        "sessionId": "56d929c3-00b3-000e-02b7-6f80-00163efc9f42",
        "locations": [{
            "latLng": {
                "lng": -82.407674,
                "lat": 34.790672
            },
            "adminArea4": "Greenville",
            "adminArea5Type": "City",
            "adminArea4Type": "County",
            "adminArea5": "Greenville",
            "street": "50 Datastream Plz",
            "adminArea1": "US",
            "adminArea3": "SC",
            "type": "s",
            "displayLatLng": {
                "lng": -82.407676,
                "lat": 34.790672
            },
            "linkId": 49368065,
            "postalCode": "29605-3451",
            "sideOfStreet": "R",
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
            "street": "550 S Main St, 101",
            "adminArea1": "US",
            "adminArea3": "SC",
            "type": "s",
            "displayLatLng": {
                "lng": -82.401672,
                "lat": 34.845546
            },
            "linkId": 48042149,
            "postalCode": "29601-2503",
            "sideOfStreet": "R",
            "dragPoint": false,
            "adminArea1Type": "Country",
            "geocodeQuality": "POINT",
            "geocodeQualityCode": "P1AAA",
            "adminArea3Type": "State"
        },
        {
            "latLng": {
                "lng": -82.398057,
                "lat": 34.85271
            },
            "adminArea4": "Greenville",
            "adminArea5Type": "City",
            "adminArea4Type": "County",
            "adminArea5": "Greenville",
            "street": "207 N Main St",
            "adminArea1": "US",
            "adminArea3": "SC",
            "type": "s",
            "displayLatLng": {
                "lng": -82.398056,
                "lat": 34.85271
            },
            "linkId": 48131299,
            "postalCode": "29601-2115",
            "sideOfStreet": "L",
            "dragPoint": false,
            "adminArea1Type": "Country",
            "geocodeQuality": "POINT",
            "geocodeQualityCode": "P1AAA",
            "adminArea3Type": "State"
        }],
        "hasCountryCross": false,
        "legs": [{
            "hasTollRoad": false,
            "index": 0,
            "roadGradeStrategy": [
                []
            ],
            "hasHighway": true,
            "hasUnpaved": false,
            "distance": 5.267,
            "time": 633,
            "origIndex": 3,
            "hasSeasonalClosure": false,
            "origNarrative": "Go northwest on White Horse Rd/US-25 N.",
            "hasCountryCross": false,
            "formattedTime": "00:10:33",
            "destNarrative": "Proceed to 550 S MAIN ST, 101.",
            "destIndex": 6,
            "maneuvers": [{
                "signs": [],
                "index": 0,
                "maneuverNotes": [],
                "direction": 2,
                "narrative": "Start out going northwest on Datastream Plz toward Bruce Rd.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-start_sm.gif",
                "distance": 0.104,
                "time": 29,
                "linkIds": [],
                "streets": ["Datastream Plz"],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:00:29",
                "directionName": "Northwest",
                "startPoint": {
                    "lng": -82.407676,
                    "lat": 34.790672
                },
                "turnType": 2
            },
            {
                "signs": [],
                "index": 1,
                "maneuverNotes": [],
                "direction": 6,
                "narrative": "Turn slight left onto Bruce Rd.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_slight_left_sm.gif",
                "distance": 0.201,
                "time": 27,
                "linkIds": [],
                "streets": ["Bruce Rd"],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:00:27",
                "directionName": "Southwest",
                "startPoint": {
                    "lng": -82.40866,
                    "lat": 34.791774
                },
                "turnType": 7
            },
            {
                "signs": [],
                "index": 2,
                "maneuverNotes": [],
                "direction": 6,
                "narrative": "Bruce Rd becomes E Lenhardt Rd.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_straight_sm.gif",
                "distance": 0.274,
                "time": 41,
                "linkIds": [],
                "streets": ["E Lenhardt Rd"],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:00:41",
                "directionName": "Southwest",
                "startPoint": {
                    "lng": -82.411811,
                    "lat": 34.79071
                },
                "turnType": 0
            },
            {
                "signs": [{
                    "text": "25",
                    "extraText": "",
                    "direction": 1,
                    "type": 2,
                    "url": "http://icons.mqcdn.com/icons/rs2.png?n=25&d=NORTH"
                }],
                "index": 3,
                "maneuverNotes": [],
                "direction": 2,
                "narrative": "Turn right onto White Horse Rd/US-25 N.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_right_sm.gif",
                "distance": 0.999,
                "time": 118,
                "linkIds": [],
                "streets": ["White Horse Rd", "US-25 N"],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:01:58",
                "directionName": "Northwest",
                "startPoint": {
                    "lng": -82.415168,
                    "lat": 34.787902
                },
                "turnType": 2
            },
            {
                "signs": [{
                    "text": "20",
                    "extraText": "",
                    "direction": 0,
                    "type": 539,
                    "url": "http://icons.mqcdn.com/icons/rs539.png?n=20"
                }],
                "index": 4,
                "maneuverNotes": [],
                "direction": 1,
                "narrative": "Turn right onto SC-20/Grove Rd.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_right_sm.gif",
                "distance": 0.545,
                "time": 62,
                "linkIds": [],
                "streets": ["SC-20", "Grove Rd"],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:01:02",
                "directionName": "North",
                "startPoint": {
                    "lng": -82.424446,
                    "lat": 34.799873
                },
                "turnType": 2
            },
            {
                "signs": [{
                    "text": "29",
                    "extraText": "",
                    "direction": 1,
                    "type": 2,
                    "url": "http://icons.mqcdn.com/icons/rs2.png?n=29&d=NORTH"
                }],
                "index": 5,
                "maneuverNotes": [],
                "direction": 1,
                "narrative": "Merge onto US-29 N via the ramp on the left toward GROVE RD.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_merge_left_sm.gif",
                "distance": 2.056,
                "time": 185,
                "linkIds": [],
                "streets": ["US-29 N"],
                "attributes": 128,
                "transportMode": "AUTO",
                "formattedTime": "00:03:05",
                "directionName": "North",
                "startPoint": {
                    "lng": -82.421798,
                    "lat": 34.807411
                },
                "turnType": 11
            },
            {
                "signs": [{
                    "text": "25",
                    "extraText": "BUS",
                    "direction": 1,
                    "type": 2,
                    "url": "http://icons.mqcdn.com/icons/rs2.png?n=25&d=NORTH&v=BUS"
                }],
                "index": 6,
                "maneuverNotes": [],
                "direction": 1,
                "narrative": "Turn left onto Augusta St/US-25 Bus N.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/rs_left_sm.gif",
                "distance": 0.917,
                "time": 133,
                "linkIds": [],
                "streets": ["Augusta St", "US-25 Bus N"],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:02:13",
                "directionName": "North",
                "startPoint": {
                    "lng": -82.404014,
                    "lat": 34.832126
                },
                "turnType": 6
            },
            {
                "signs": [],
                "index": 7,
                "maneuverNotes": [],
                "direction": 8,
                "narrative": "Turn right onto S Main St.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-end_sm.gif",
                "distance": 0.171,
                "time": 38,
                "linkIds": [],
                "streets": ["S Main St"],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:00:38",
                "directionName": "East",
                "startPoint": {
                    "lng": -82.404212,
                    "lat": 34.84452
                },
                "turnType": 2
            }],
            "hasFerry": false
        },
        {
            "hasTollRoad": false,
            "index": 1,
            "roadGradeStrategy": [
                []
            ],
            "hasHighway": false,
            "hasUnpaved": false,
            "distance": 0.537,
            "time": 160,
            "origIndex": -1,
            "hasSeasonalClosure": false,
            "origNarrative": "",
            "hasCountryCross": false,
            "formattedTime": "00:02:40",
            "destNarrative": "",
            "destIndex": -1,
            "maneuvers": [{
                "signs": [],
                "index": 8,
                "maneuverNotes": [],
                "direction": 3,
                "narrative": "Start out going northeast on S Main St toward E Broad St.",
                "iconUrl": "http://content.mapquest.com/mqsite/turnsigns/icon-dirs-start_sm.gif",
                "distance": 0.537,
                "time": 160,
                "linkIds": [],
                "streets": ["S Main St"],
                "attributes": 0,
                "transportMode": "AUTO",
                "formattedTime": "00:02:40",
                "directionName": "Northeast",
                "startPoint": {
                    "lng": -82.401672,
                    "lat": 34.845546
                },
                "turnType": 6
            }],
            "hasFerry": false
        }],
        "formattedTime": "00:13:13",
        "routeError": {
            "message": "",
            "errorCode": -400
        },
        "options": {
            "mustAvoidLinkIds": [],
            "drivingStyle": 2,
            "countryBoundaryDisplay": true,
            "generalize": 10,
            "narrativeType": "text",
            "locale": "en_US",
            "avoidTimedConditions": false,
            "destinationManeuverDisplay": false,
            "enhancedNarrative": false,
            "filterZoneFactor": -1,
            "timeType": 0,
            "maxWalkingDistance": -1,
            "routeType": "FASTEST",
            "transferPenalty": -1,
            "walkingSpeed": -1,
            "stateBoundaryDisplay": true,
            "avoids": ["unpaved"],
            "maxLinkId": 0,
            "arteryWeights": [],
            "tryAvoidLinkIds": [],
            "unit": "M",
            "routeNumber": 0,
            "shapeFormat": "raw",
            "maneuverPenalty": -1,
            "useTraffic": false,
            "returnLinkDirections": false,
            "avoidTripIds": [],
            "manmaps": "false",
            "highwayEfficiency": 20,
            "sideOfStreetDisplay": false,
            "cyclingRoadFactor": 1,
            "urbanAvoidFactor": -1
        },
        "hasFerry": false
    },
    "info": {
        "copyright": {
            "text": "© 2015 MapQuest, Inc.",
            "imageUrl": "http://api.mqcdn.com/res/mqlogo.gif",
            "imageAltText": "© 2015 MapQuest, Inc."
        },
        "statuscode": 0,
        "messages": []
    }
};