/*
https://www.mapquestapi.com/directions/#optimized
https://www.mapquestapi.com/common/locations.html

Location objects are either

Strings, which are assumed to be single-line addresses (as described above), or
Location objects, which are JSON objects containing the parameters described in the table below.

| Format | Example | 
city (AA5), state (AA3)	Lancaster, PA
city, state, postalCode	Lancaster, PA, 17603
postalCode	17603
street, city, state	1090 N Charlotte St, Lancaster, PA
street, city, state, postalCode	1090 N Charlotte St, Lancaster, PA 17603
street, postalCode	1090 N Charlotte St, 17603
latLng	40.05323,-76.313632

REQUEST URL:

https://www.mapquestapi.com/directions/v2/optimizedroute?key=YOUR_KEY_HERE

REQUEST BODY:
{
   locations:[
      "Boalsburg, PA",
      "York, PA",
      "State College, PA",
      "Lancaster, PA"
   ]
}
*/

import * as ajax from "../labs/common/ajax";
import { MapQuestRoute } from "../../d.ts/mapquest";

const MapQuestKey = "cwm3pF5yuEGNp54sh96TF0irs5kCLd5y";

class Route {

    private sessionId = "";

    /**
     * Returns
     * | locationSequence | a sequence array that can be used to determine the index in the original location object list. |
     * | locations | a collection of locations in the form of an address. The origin and destination locations remain fixed, but the intermediate locations are re-ordered as appropriate. | 
     */
    route(url: string, data: {
        key: string;
        from: string;
        to: string;
        locations: string[];
        session?: string;
        unit?: string;
        avoids?: string;
    }) {
        let req = $.extend({
            outFormat: "json",
            unit: "m",
            routeType: "fastest",
            avoidTimedConditions: false,
            doReverseGeocode: true,
            narrativeType: "text",
            enhancedNarrative: false,
            maxLinkId: 0,
            locale: "en_US",
            // no way to handle multiple avoids without hand-coding url?
            // [toll road, unpaved, ferry, limited access, approximate seasonal closure, country border crossing]
            inFormat: "kvp",
            avoids: "unpaved",
            stateBoundaryDisplay: true,
            countryBoundaryDisplay: true,
            sideOfStreetDisplay: false,
            destinationManeuverDisplay: false,
            fullShape: false,
            shapeFormat: "raw",
            inShapeFormat: "raw",
            outShapeFormat: "raw",
            generalize: 10,
            drivingStyle: "normal",
            highwayEfficiency: 20,
            manMaps: false
        }, data);

        if (this.sessionId) req.session = this.sessionId;

        /** GET + POST work with from/to but how to set locations? */
        return ajax.post<MapQuestRoute.Response>(`${url}?key=${req.key}`, {
           // from: data.from,
           // to: data.to,
            locations: data.locations
        }).then(response => {
            this.sessionId = response.route.sessionId;
            return response;
        });
    }

    static test(options: {
        from: string;
        to: string;
        locations: string[];
    }) {

        let serviceUrl = `http://www.mapquestapi.com/directions/v2/optimizedRoute`;

        let request = {
            key: MapQuestKey,
            from: options.from,
            to: options.to,
            locations: options.locations
        };

        return new Route().route(serviceUrl, request).then(result => {
            console.log("directions", result);
            result.route.legs.forEach(leg => {
                console.log(leg.destNarrative, leg.maneuvers.map(m => m.narrative).join("\n\t"));
            });
            return result;
        });
    }

}

export = Route;
