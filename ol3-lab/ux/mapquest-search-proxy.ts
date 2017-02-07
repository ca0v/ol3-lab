/**
 * http://www.mapquestapi.com/search/common-parameters.html
 * 
 * http://www.mapquestapi.com/search/v2/search?key=cwm3pF5yuEGNp54sh96TF0irs5kCLd5y&shapePoints=34.85,-82.4 
 */

import * as ajax from "../labs/common/ajax";
import * as $ from "jquery";
import G = require("../labs/common/google-polyline");

const g = new G();

const MapQuestKey = "cwm3pF5yuEGNp54sh96TF0irs5kCLd5y";

declare module MapQuestSearch {

    export interface LatLng {
        lng: number;
        lat: number;
    }

    export interface MqapGeography {
        latLng: LatLng;
    }

    export interface Fields {
        phone: string;
        side_of_street: string;
        group_sic_code: string;
        state: string;
        lng: number;
        group_sic_code_name: string;
        city: string;
        country: string;
        group_sic_code_name_ext: string;
        id: string;
        mqap_geography: MqapGeography;
        address: string;
        postal_code: string;
        name: string;
        mqap_id: string;
        group_sic_code_ext: string;
        disp_lat: number;
        lat: number;
        disp_lng: number;
    }

    export interface SearchResult {
        resultNumber: number;
        distance: number;
        sourceName: string;
        name: string;
        shapePoints: number[];
        distanceUnit: string;
        key: string;
        fields: Fields;
    }

    export interface Origin {
        latLng: LatLng;
        postalCode: string;
        adminArea5Type: string;
        adminArea4: string;
        adminArea5: string;
        adminArea4Type: string;
        street: string;
        adminArea1Type: string;
        adminArea1: string;
        adminArea3: string;
        adminArea3Type: string;
    }

    export interface HostedData {
        tableName: string;
        extraCriteria: string;
        columnNames: any[];
    }

    export interface Copyright {
        text: string;
        imageUrl: string;
        imageAltText: string;
    }

    export interface Info {
        statusCode: number;
        copyright: Copyright;
        messages: any[];
    }

    export interface Options {
        kmlStyleUrl: string;
        shapeFormat: string;
        ambiguities: boolean;
        pageSize: number;
        radius: number;
        currentPage: number;
        units: string;
        maxMatches: number;
    }

    export interface SearchResponse {
        searchResults: SearchResult[];
        origin: Origin;
        resultsCount: number;
        hostedData: HostedData[];
        totalPages: number;
        info: Info;
        options: Options;
    }

}

class Search {

    constructor(public url = "http://www.mapquestapi.com/search/v2") {
    }

    search(data: any, type = "search", key = MapQuestKey) {

        let req = $.extend({
            key: key,
            inFormat: "json",
            outFormat: "json",
            ambiguities: "ignore",
            units: "m",
            maxMatches: 100,
            shapeFormat: "cmp6"
        }, data);

        let url = this.url + "/" + type;

        return ajax.jsonp<MapQuestSearch.SearchResponse>(url, req).then(response => {
            g.decode; // TODO
            return response;
        });

    }

    radius(data: {
        origin: number[];
        maxMatches?: number;
    }) {
        return this.search(data, "radius");
    }

    rectangle(data: {
        boundingBox: number[];
        maxMatches?: number;
    }) {
        return this.search(data, "rectangle");
    }

    polygon(data: {
        polygon: number[];
        maxMatches?: number;
        shapeFormat?: string;
    }) {
        return this.search(data, "polygon");
    }

    corridor(data: {
        line: number[];
        width?: number;
        bufferWidth?: number;
        maxMatches?: number;
        shapeFormat?: "raw" | "cmp6";
    }) {
        /**
raw: 39.96488,-76.729949,41.099998,-76.305603,39.899011,-76.164335,39.099998,-78.305603
simple: LINESTRING(-76.305603 40.099998,-76.305603 41.099998,-77.305603 41.099998,-78.305603 39.099998)
compressed: os|rFdiisMou|Ee{qAdqiF}qZx`{C|eaL
         */
        //g.encode(data.line); // http://www.mapquestapi.com/search/geometry.html
        return this.search($.extend({
            width: 5,
            bufferWidth: 0.25
        }, data), "corridor");
    }

    static test() {
        let search = new Search();
        search.radius({ origin: [34.85, -82.4] }).then(result => console.log("radius", result));
        search.rectangle({ boundingBox: [34.85, -82.4, 34.9, -82.35] }).then(result => console.log("rectangle", result));
        search.polygon({ polygon: [34.85, -82.4, 34.85, -82.35, 34.9, -82.35, 34.85, -82.4] }).then(result => console.log("polygon", result));
        search.corridor({ line: [34.85, -82.4, 34.9, -82.4], shapeFormat: "raw" }).then(result => console.log("corridor", result));
    }
}

export = Search;

/**
    "searchResults": [{
        "resultNumber": 1,
        "distance": 0.0092,
        "sourceName": "mqap.ntpois",
        "name": "Bubbly",
        "shapePoints": [34.850086, -82.400124],
        "distanceUnit": "m",
        "key": "c6dace5a-1531-459d-9b60-75fa72ad115c",
        "fields": {
            "phone": "8645090101",
            "side_of_street": "R",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.400124,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "290552348",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.400124,
                    "lat": 34.850086
                }
            },
            "address": "20 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Bubbly",
            "mqap_id": "c6dace5a-1531-459d-9b60-75fa72ad115c",
            "group_sic_code_ext": "",
            "disp_lat": 34.850086,
            "lat": 34.850086,
            "disp_lng": -82.400124
        }
    },
    {
        "resultNumber": 2,
        "distance": 0.0104,
        "sourceName": "mqap.ntpois",
        "name": "Cazbah The",
        "shapePoints": [34.850147, -82.399956],
        "distanceUnit": "m",
        "key": "a9773b10-4f23-4b7e-bad8-78bacc21f2ec",
        "fields": {
            "phone": "8642419909",
            "side_of_street": "R",
            "group_sic_code": "581212",
            "state": "SC",
            "lng": -82.399956,
            "group_sic_code_name": "Caterers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Caterers",
            "id": "3579171",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399956,
                    "lat": 34.850147
                }
            },
            "address": "16 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Cazbah The",
            "mqap_id": "a9773b10-4f23-4b7e-bad8-78bacc21f2ec",
            "group_sic_code_ext": "581212",
            "disp_lat": 34.850147,
            "lat": 34.850147,
            "disp_lng": -82.399956
        }
    },
    {
        "resultNumber": 3,
        "distance": 0.0172,
        "sourceName": "mqap.ntpois",
        "name": "Schafer Advertising & Marketing",
        "shapePoints": [34.850231, -82.400116],
        "distanceUnit": "m",
        "key": "c56c3936-148d-4670-aa53-d7b556a077b8",
        "fields": {
            "phone": "8642322544",
            "side_of_street": "L",
            "group_sic_code": "731101",
            "state": "SC",
            "lng": -82.400116,
            "group_sic_code_name": "Advertising Agencies",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Advertising Agencies",
            "id": "3580179",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.400116,
                    "lat": 34.850231
                }
            },
            "address": "25 S Laurens St",
            "postal_code": "29601",
            "name": "Schafer Advertising & Marketing",
            "mqap_id": "c56c3936-148d-4670-aa53-d7b556a077b8",
            "group_sic_code_ext": "731101",
            "disp_lat": 34.850231,
            "lat": 34.850231,
            "disp_lng": -82.400116
        }
    },
    {
        "resultNumber": 4,
        "distance": 0.0205,
        "sourceName": "mqap.ntpois",
        "name": "Lincoln Energy Solutions",
        "shapePoints": [34.850246, -82.399796],
        "distanceUnit": "m",
        "key": "fe35de5c-9f30-40a0-b3be-435d9ff88118",
        "fields": {
            "phone": "8642423003",
            "side_of_street": "R",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399796,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "262760244",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399796,
                    "lat": 34.850246
                }
            },
            "address": "22 S Main St",
            "postal_code": "29601",
            "name": "Lincoln Energy Solutions",
            "mqap_id": "fe35de5c-9f30-40a0-b3be-435d9ff88118",
            "group_sic_code_ext": "",
            "disp_lat": 34.850246,
            "lat": 34.850246,
            "disp_lng": -82.399796
        }
    },
    {
        "resultNumber": 5,
        "distance": 0.0205,
        "sourceName": "mqap.ntpois",
        "name": "Harrison Group",
        "shapePoints": [34.850246, -82.399796],
        "distanceUnit": "m",
        "key": "d60506ab-f5f4-4601-bc56-ef70639fa83e",
        "fields": {
            "phone": "8642336510",
            "side_of_street": "R",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399796,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "3579693",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399796,
                    "lat": 34.850246
                }
            },
            "address": "22 S Main St",
            "postal_code": "29601",
            "name": "Harrison Group",
            "mqap_id": "d60506ab-f5f4-4601-bc56-ef70639fa83e",
            "group_sic_code_ext": "",
            "disp_lat": 34.850246,
            "lat": 34.850246,
            "disp_lng": -82.399796
        }
    },
    {
        "resultNumber": 6,
        "distance": 0.0205,
        "sourceName": "mqap.ntpois",
        "name": "Cliff Realty-Greenville",
        "shapePoints": [34.850246, -82.399796],
        "distanceUnit": "m",
        "key": "6208d713-ac42-4cc7-a328-0e0cc487b452",
        "fields": {
            "phone": "8643650701",
            "side_of_street": "R",
            "group_sic_code": "653108",
            "state": "SC",
            "lng": -82.399796,
            "group_sic_code_name": "Real Estate Management",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Real Estate Management::Real Estate Agents",
            "id": "284906318",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399796,
                    "lat": 34.850246
                }
            },
            "address": "22 S Main St",
            "postal_code": "29601",
            "name": "Cliff Realty-Greenville",
            "mqap_id": "6208d713-ac42-4cc7-a328-0e0cc487b452",
            "group_sic_code_ext": "653108::653118",
            "disp_lat": 34.850246,
            "lat": 34.850246,
            "disp_lng": -82.399796
        }
    },
    {
        "resultNumber": 7,
        "distance": 0.0206,
        "sourceName": "mqap.ntpois",
        "name": "Mary Praytor Gallery",
        "shapePoints": [34.850117, -82.399666],
        "distanceUnit": "m",
        "key": "e8c06490-156e-4767-8909-3b7a0e8cc11d",
        "fields": {
            "phone": "8642351800",
            "side_of_street": "R",
            "group_sic_code": "599969",
            "state": "SC",
            "lng": -82.399666,
            "group_sic_code_name": "Art Galleries & Dealers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Art Galleries & Dealers",
            "id": "3579543",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399666,
                    "lat": 34.850117
                }
            },
            "address": "26 S Main St",
            "postal_code": "29601",
            "name": "Mary Praytor Gallery",
            "mqap_id": "e8c06490-156e-4767-8909-3b7a0e8cc11d",
            "group_sic_code_ext": "599969",
            "disp_lat": 34.850117,
            "lat": 34.850117,
            "disp_lng": -82.399666
        }
    },
    {
        "resultNumber": 8,
        "distance": 0.021,
        "sourceName": "mqap.ntpois",
        "name": "Rache Construction Company",
        "shapePoints": [34.849836, -82.399688],
        "distanceUnit": "m",
        "key": "abc287f0-90b4-417a-93a9-4556462e87be",
        "fields": {
            "phone": "8642333462",
            "side_of_street": "R",
            "group_sic_code": "655202",
            "state": "SC",
            "lng": -82.399688,
            "group_sic_code_name": "Real Estate Developers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Real Estate Developers::Home Builders",
            "id": "3579801",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399688,
                    "lat": 34.849836
                }
            },
            "address": "18 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Rache Construction Company",
            "mqap_id": "abc287f0-90b4-417a-93a9-4556462e87be",
            "group_sic_code_ext": "655202::152112",
            "disp_lat": 34.849836,
            "lat": 34.849836,
            "disp_lng": -82.399688
        }
    },
    {
        "resultNumber": 9,
        "distance": 0.0227,
        "sourceName": "mqap.ntpois",
        "name": "Soco Finance Company",
        "shapePoints": [34.849827, -82.39966],
        "distanceUnit": "m",
        "key": "2691adf0-44d1-4057-bcee-148a6292c161",
        "fields": {
            "phone": "8642420240",
            "side_of_street": "R",
            "group_sic_code": "614101",
            "state": "SC",
            "lng": -82.39966,
            "group_sic_code_name": "Loans",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Loans",
            "id": "277899560",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.39966,
                    "lat": 34.849827
                }
            },
            "address": "14 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Soco Finance Company",
            "mqap_id": "2691adf0-44d1-4057-bcee-148a6292c161",
            "group_sic_code_ext": "614101",
            "disp_lat": 34.849827,
            "lat": 34.849827,
            "disp_lng": -82.39966
        }
    },
    {
        "resultNumber": 10,
        "distance": 0.0252,
        "sourceName": "mqap.ntpois",
        "name": "Carolina Engineering Solutions",
        "shapePoints": [34.849813, -82.399619],
        "distanceUnit": "m",
        "key": "a614c324-2a62-4391-bebd-5d50d188ceb3",
        "fields": {
            "phone": "8643709355",
            "side_of_street": "R",
            "group_sic_code": "871115",
            "state": "SC",
            "lng": -82.399619,
            "group_sic_code_name": "Engineers-Electrical",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Engineers-Electrical::Engineering",
            "id": "277835715",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399619,
                    "lat": 34.849813
                }
            },
            "address": "8 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Carolina Engineering Solutions",
            "mqap_id": "a614c324-2a62-4391-bebd-5d50d188ceb3",
            "group_sic_code_ext": "871115::871147",
            "disp_lat": 34.849813,
            "lat": 34.849813,
            "disp_lng": -82.399619
        }
    },
    {
        "resultNumber": 11,
        "distance": 0.0252,
        "sourceName": "mqap.ntpois",
        "name": "Toshiba Industrial Division",
        "shapePoints": [34.849813, -82.399619],
        "distanceUnit": "m",
        "key": "a7d0f63e-0993-4cb2-88d5-5fff092a745d",
        "fields": {
            "phone": "8642352705",
            "side_of_street": "R",
            "group_sic_code": "573117",
            "state": "SC",
            "lng": -82.399619,
            "group_sic_code_name": "Electronic Equipment & Supplies-Retail",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Electronic Equipment & Supplies-Retail::Electric Supplies-Manufacturers",
            "id": "277418147",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399619,
                    "lat": 34.849813
                }
            },
            "address": "8 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Toshiba Industrial Division",
            "mqap_id": "a7d0f63e-0993-4cb2-88d5-5fff092a745d",
            "group_sic_code_ext": "573117::362101",
            "disp_lat": 34.849813,
            "lat": 34.849813,
            "disp_lng": -82.399619
        }
    },
    {
        "resultNumber": 12,
        "distance": 0.0359,
        "sourceName": "mqap.ntpois",
        "name": "TD Ameritrade",
        "shapePoints": [34.849483, -82.399918],
        "distanceUnit": "m",
        "key": "0e69284f-568a-46ed-bd42-46d5b25974e6",
        "fields": {
            "phone": "8642713400",
            "side_of_street": "R",
            "group_sic_code": "737911",
            "state": "SC",
            "lng": -82.399918,
            "group_sic_code_name": "Computers-Support Services",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Computers-Support Services::Computer Systems Consultants",
            "id": "275283600",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399918,
                    "lat": 34.849483
                }
            },
            "address": "102 S Main St",
            "postal_code": "29601",
            "name": "TD Ameritrade",
            "mqap_id": "0e69284f-568a-46ed-bd42-46d5b25974e6",
            "group_sic_code_ext": "737911::737103",
            "disp_lat": 34.849483,
            "lat": 34.849483,
            "disp_lng": -82.399918
        }
    },
    {
        "resultNumber": 13,
        "distance": 0.0359,
        "sourceName": "mqap.ntpois",
        "name": "Carolina First Bank",
        "shapePoints": [34.849483, -82.399918],
        "distanceUnit": "m",
        "key": "a9a244a2-d508-4d92-8cbe-d536df7d5bd3",
        "fields": {
            "phone": "8642557907",
            "side_of_street": "R",
            "group_sic_code": "602101",
            "state": "SC",
            "lng": -82.399918,
            "group_sic_code_name": "Banks",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Banks::Carolina First Bank",
            "id": "3578607",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399918,
                    "lat": 34.849483
                }
            },
            "address": "102 S Main St",
            "postal_code": "29601",
            "name": "Carolina First Bank",
            "mqap_id": "a9a244a2-d508-4d92-8cbe-d536df7d5bd3",
            "group_sic_code_ext": "602101::602101F41",
            "disp_lat": 34.849483,
            "lat": 34.849483,
            "disp_lng": -82.399918
        }
    },
    {
        "resultNumber": 14,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Nmr and S LLP",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "849412b4-2a11-429c-895d-330b7c1b923e",
        "fields": {
            "phone": "8644517403",
            "side_of_street": "L",
            "group_sic_code": "738113",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "Criminologists",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Criminologists::(all) Lawyers",
            "id": "275628304",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Nmr and S LLP",
            "mqap_id": "849412b4-2a11-429c-895d-330b7c1b923e",
            "group_sic_code_ext": "738113::811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 15,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "James K Price Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "23fb2714-5014-4154-88f3-033c006b9ba9",
        "fields": {
            "phone": "8642714940",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "273869181",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "James K Price Atty",
            "mqap_id": "23fb2714-5014-4154-88f3-033c006b9ba9",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 16,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Lee Kelly N /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "d9667c5c-833b-44a4-bbc6-a9bf1cd6c189",
        "fields": {
            "phone": "8642502367",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "277863972",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Lee Kelly N /Atty",
            "mqap_id": "d9667c5c-833b-44a4-bbc6-a9bf1cd6c189",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 17,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Bateman Eva R /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "c16a9b45-9b13-454b-b6a0-0a77309f58e6",
        "fields": {
            "phone": "8642502311",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "264828885",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Bateman Eva R /Atty",
            "mqap_id": "c16a9b45-9b13-454b-b6a0-0a77309f58e6",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 18,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Elite Fitness",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "9dc0526f-b195-463c-880a-0e69ddd2fff7",
        "fields": {
            "phone": "8776299286",
            "side_of_street": "L",
            "group_sic_code": "799708",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "Baseball Clubs",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Baseball Clubs",
            "id": "273858823",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Elite Fitness",
            "mqap_id": "9dc0526f-b195-463c-880a-0e69ddd2fff7",
            "group_sic_code_ext": "799708",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 19,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Russell Hamilton E /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "e1a3e9ba-5aae-4a41-9d26-4913b3c495dc",
        "fields": {
            "phone": "8642502313",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "42536115",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Russell Hamilton E /Atty",
            "mqap_id": "e1a3e9ba-5aae-4a41-9d26-4913b3c495dc",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 20,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Gutierrez Katherine C /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "14fde11e-415c-46c6-a03c-998f82a19227",
        "fields": {
            "phone": "8642502210",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "291129987",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Gutierrez Katherine C /Atty",
            "mqap_id": "14fde11e-415c-46c6-a03c-998f82a19227",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 21,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Sherard Reid T /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "fff916f0-6953-4879-b105-102479e9977a",
        "fields": {
            "phone": "8642502219",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "21987095",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Sherard Reid T /Atty",
            "mqap_id": "fff916f0-6953-4879-b105-102479e9977a",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 22,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "U S Gov Congressman Trey Gowdy",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "b5308944-ff31-4449-852d-5f8d9d31121b",
        "fields": {
            "phone": "8642410175",
            "side_of_street": "L",
            "group_sic_code": "911101",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "Federal Government-Executive Offices",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Federal Government-Executive Offices",
            "id": "275981890",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "U S Gov Congressman Trey Gowdy",
            "mqap_id": "b5308944-ff31-4449-852d-5f8d9d31121b",
            "group_sic_code_ext": "911101",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 23,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Johnson Michael F /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "778467db-538e-418b-bc79-ef5662ac631a",
        "fields": {
            "phone": "8642502365",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "285998453",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Johnson Michael F /Atty",
            "mqap_id": "778467db-538e-418b-bc79-ef5662ac631a",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 24,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Mahnke Kymric Y /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "d6cfa418-3ace-4127-8ce1-59973594906e",
        "fields": {
            "phone": "8642502227",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "277666572",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Mahnke Kymric Y /Atty",
            "mqap_id": "d6cfa418-3ace-4127-8ce1-59973594906e",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 25,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Anderson Sarah R /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "5e5b634e-4faf-4ced-b095-41cd80d94cc6",
        "fields": {
            "phone": "8642502203",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "21987081",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Anderson Sarah R /Atty",
            "mqap_id": "5e5b634e-4faf-4ced-b095-41cd80d94cc6",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 26,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Easc Group",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "f1d53aac-ad6d-4420-9829-aaafc8a0e5fb",
        "fields": {
            "phone": "8642524502",
            "side_of_street": "L",
            "group_sic_code": "871111",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "Engineers-Consulting",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Engineers-Consulting::Business Management Consultants",
            "id": "278301836",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Easc Group",
            "mqap_id": "f1d53aac-ad6d-4420-9829-aaafc8a0e5fb",
            "group_sic_code_ext": "871111::874201",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 27,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Jones Neil C /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "18a71d76-9dfe-4913-8f7a-fbaf22ac7418",
        "fields": {
            "phone": "8642502260",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "274916650",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Jones Neil C /Atty",
            "mqap_id": "18a71d76-9dfe-4913-8f7a-fbaf22ac7418",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 28,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Burns Michael W Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "ed21cfe9-5f4d-4902-b368-0ca764ae2756",
        "fields": {
            "phone": "8642714940",
            "side_of_street": "L",
            "group_sic_code": "801104",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Clinics",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Clinics::(all) Lawyers",
            "id": "276025148",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Burns Michael W Atty",
            "mqap_id": "ed21cfe9-5f4d-4902-b368-0ca764ae2756",
            "group_sic_code_ext": "801104::811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 29,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Verdin Charles S /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "54c0c8d8-4b79-4205-85c8-ebaf0ab25fcd",
        "fields": {
            "phone": "8642502230",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "277670019",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Verdin Charles S /Atty",
            "mqap_id": "54c0c8d8-4b79-4205-85c8-ebaf0ab25fcd",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 30,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Stilwell Rivers S /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "a3b4a98c-dd76-44c3-b54b-bf628cdfa8a4",
        "fields": {
            "phone": "8642502217",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "277663675",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Stilwell Rivers S /Atty",
            "mqap_id": "a3b4a98c-dd76-44c3-b54b-bf628cdfa8a4",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 31,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Lott Harold R /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "766fb4b0-d3bf-4034-b6c0-9c5207274ddf",
        "fields": {
            "phone": "8642502323",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "43841112",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Lott Harold R /Atty",
            "mqap_id": "766fb4b0-d3bf-4034-b6c0-9c5207274ddf",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 32,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Mcalhaney Brian D /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "04315736-a8f4-4dfc-9fd9-c7bfb293571a",
        "fields": {
            "phone": "8642502248",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "275431599",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Mcalhaney Brian D /Atty",
            "mqap_id": "04315736-a8f4-4dfc-9fd9-c7bfb293571a",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 33,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Geosyntec Consultant",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "440761e6-d416-477c-8c7c-10f21504344b",
        "fields": {
            "phone": "8644384920",
            "side_of_street": "L",
            "group_sic_code": "871111",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "Engineers-Consulting",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Engineers-Consulting::Business Management Consultants",
            "id": "284388276",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Geosyntec Consultant",
            "mqap_id": "440761e6-d416-477c-8c7c-10f21504344b",
            "group_sic_code_ext": "871111::874201",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 34,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Barnhill Benjamin A /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "a28ba006-724e-4347-ab94-69cbf0aae261",
        "fields": {
            "phone": "8642502246",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "274440853",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Barnhill Benjamin A /Atty",
            "mqap_id": "a28ba006-724e-4347-ab94-69cbf0aae261",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 35,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Rustin Dowse B /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "5133a595-0fd8-46ef-b634-99afbd61d712",
        "fields": {
            "phone": "8642502320",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "27055601",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Rustin Dowse B /Atty",
            "mqap_id": "5133a595-0fd8-46ef-b634-99afbd61d712",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 36,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Campell John M /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "8de57cf3-8d72-413a-8efd-1f8b2baf4bff",
        "fields": {
            "phone": "8642502234",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "276065190",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Campell John M /Atty",
            "mqap_id": "8de57cf3-8d72-413a-8efd-1f8b2baf4bff",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 37,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Burwell Henry M /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "7a4262d1-50e2-4752-8fb3-a06fcf3db8bf",
        "fields": {
            "phone": "8642502212",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "288760115",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Burwell Henry M /Atty",
            "mqap_id": "7a4262d1-50e2-4752-8fb3-a06fcf3db8bf",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 38,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "William H Foster Attorney",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "5f3ae561-0168-48af-b364-581fbd449dc7",
        "fields": {
            "phone": "8642502222",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "276378478",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "William H Foster Attorney",
            "mqap_id": "5f3ae561-0168-48af-b364-581fbd449dc7",
            "group_sic_code_ext": "",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 39,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Two Chefs",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "9283c92f-52e7-499b-a934-297897c6fee0",
        "fields": {
            "phone": "8643709336",
            "side_of_street": "L",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "288878704",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Two Chefs",
            "mqap_id": "9283c92f-52e7-499b-a934-297897c6fee0",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 40,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Carolina First Bank",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "a6765bb1-6120-47e7-a552-d896c60c3226",
        "fields": {
            "phone": "8642396431",
            "side_of_street": "L",
            "group_sic_code": "602101",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "Banks",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Banks::Carolina First Bank",
            "id": "3580157",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Carolina First Bank",
            "mqap_id": "a6765bb1-6120-47e7-a552-d896c60c3226",
            "group_sic_code_ext": "602101::602101F41",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 41,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "John M Jennings Attorney",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "267c025b-207e-4615-a5b1-012de30dac51",
        "fields": {
            "phone": "8642502207",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "276241984",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "John M Jennings Attorney",
            "mqap_id": "267c025b-207e-4615-a5b1-012de30dac51",
            "group_sic_code_ext": "",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 42,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Sean Faulkner Attorney",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "fe3cc583-a58f-4761-a967-c6e5ef311efa",
        "fields": {
            "phone": "8642502346",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "286060129",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Sean Faulkner Attorney",
            "mqap_id": "fe3cc583-a58f-4761-a967-c6e5ef311efa",
            "group_sic_code_ext": "",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 43,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Gravessieffert",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "d1d0a994-1f40-4394-81b5-79fb8a60f5e5",
        "fields": {
            "phone": "8645272720",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "3582777",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Gravessieffert",
            "mqap_id": "d1d0a994-1f40-4394-81b5-79fb8a60f5e5",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 44,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Jennings L Graves Attorney",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "88712649-197a-4d73-bd28-994d5f8fc8c7",
        "fields": {
            "phone": "8642502220",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "275267469",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Jennings L Graves Attorney",
            "mqap_id": "88712649-197a-4d73-bd28-994d5f8fc8c7",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 45,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Hamilton Anna E /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "34035208-404c-4b75-8fe6-ccbff334ca9d",
        "fields": {
            "phone": "8642502364",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "264828886",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Hamilton Anna E /Atty",
            "mqap_id": "34035208-404c-4b75-8fe6-ccbff334ca9d",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 46,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Hughes Agency LLC",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "dc18607d-337e-48b3-acce-e46ba539ba0f",
        "fields": {
            "phone": "8642710718",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "277901739",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Hughes Agency LLC",
            "mqap_id": "dc18607d-337e-48b3-acce-e46ba539ba0f",
            "group_sic_code_ext": "",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 47,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Schanen Giles M /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "8bc02081-ecf7-434b-aa71-06b47e350df1",
        "fields": {
            "phone": "8642502296",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "276058865",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Schanen Giles M /Atty",
            "mqap_id": "8bc02081-ecf7-434b-aa71-06b47e350df1",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 48,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Winston I Marosek Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "4e680415-d8b8-4f13-8088-a87e3d66b78c",
        "fields": {
            "phone": "8642502295",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "286176018",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Winston I Marosek Atty",
            "mqap_id": "4e680415-d8b8-4f13-8088-a87e3d66b78c",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 49,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Summer Ashley B /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "b1d7f899-4c3a-4f9b-bb43-219c2b20633e",
        "fields": {
            "phone": "8642502214",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "275435698",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Summer Ashley B /Atty",
            "mqap_id": "b1d7f899-4c3a-4f9b-bb43-219c2b20633e",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 50,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Marion P Sieffert",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "8327cb75-c92b-4470-b215-128687732e3a",
        "fields": {
            "phone": "8645272720",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "289100812",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Marion P Sieffert",
            "mqap_id": "8327cb75-c92b-4470-b215-128687732e3a",
            "group_sic_code_ext": "",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 51,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Lane W Davis Attorney",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "b5cd69f4-f1fc-4f40-a7cf-4ea5be3a7065",
        "fields": {
            "phone": "8642502245",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "25914460",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Lane W Davis Attorney",
            "mqap_id": "b5cd69f4-f1fc-4f40-a7cf-4ea5be3a7065",
            "group_sic_code_ext": "",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 52,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Wilkins David H /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "e8726903-d253-474a-aca8-4f149b920096",
        "fields": {
            "phone": "8642502231",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "276270586",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Wilkins David H /Atty",
            "mqap_id": "e8726903-d253-474a-aca8-4f149b920096",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 53,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "McCall Crystal C /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "3da78a7b-64e7-4ad8-a966-0407ccade006",
        "fields": {
            "phone": "8642502343",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "21987080",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "McCall Crystal C /Atty",
            "mqap_id": "3da78a7b-64e7-4ad8-a966-0407ccade006",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 54,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Seann P Lahey Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "72bfec8b-06d5-447b-a67d-7c556b8ef58d",
        "fields": {
            "phone": "8642714940",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "288669663",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Seann P Lahey Atty",
            "mqap_id": "72bfec8b-06d5-447b-a67d-7c556b8ef58d",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 55,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "McNair Law Firm PA",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "0adc7f41-d3ff-444d-b97c-7e245aa468e1",
        "fields": {
            "phone": "8642714940",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers::(all) Clinics",
            "id": "288233779",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "McNair Law Firm PA",
            "mqap_id": "0adc7f41-d3ff-444d-b97c-7e245aa468e1",
            "group_sic_code_ext": "811103::801104",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 56,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Brown Wiliam S /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "7b768b2f-eada-43fa-83f5-0e6dfe218424",
        "fields": {
            "phone": "8642502297",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "25914455",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Brown Wiliam S /Atty",
            "mqap_id": "7b768b2f-eada-43fa-83f5-0e6dfe218424",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 57,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Neil E Grayson Attorney",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "decd474e-7eb3-4988-b620-196658f74aa9",
        "fields": {
            "phone": "8642502235",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "286185344",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Neil E Grayson Attorney",
            "mqap_id": "decd474e-7eb3-4988-b620-196658f74aa9",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 58,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Dunlap Charles E /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "29a620db-42d7-4dd6-8101-2bbf25798012",
        "fields": {
            "phone": "8642502238",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "3578717",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Dunlap Charles E /Atty",
            "mqap_id": "29a620db-42d7-4dd6-8101-2bbf25798012",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 59,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Two Chefs Deli & Market",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "ccca196d-e907-4122-9230-a561034be797",
        "fields": {
            "phone": "8643709336",
            "side_of_street": "L",
            "group_sic_code": "581208::58120868",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Restaurants::Deli",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants::Deli",
            "id": "278775802",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Two Chefs Deli & Market",
            "mqap_id": "ccca196d-e907-4122-9230-a561034be797",
            "group_sic_code_ext": "581208::58120868",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 60,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "South Financial Asset Management Inc",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "456d5e6f-7f25-415f-8342-b6872de67107",
        "fields": {
            "phone": "8642392140",
            "side_of_street": "L",
            "group_sic_code": "628205",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "Financial Planners",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Financial Planners",
            "id": "278050633",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "South Financial Asset Management Inc",
            "mqap_id": "456d5e6f-7f25-415f-8342-b6872de67107",
            "group_sic_code_ext": "628205",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 61,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Hunter S Freeman Attorney",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "9fff12ae-ce3e-4bca-af57-45817b78570b",
        "fields": {
            "phone": "8642714940",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "288620451",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Hunter S Freeman Attorney",
            "mqap_id": "9fff12ae-ce3e-4bca-af57-45817b78570b",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 62,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Nelson Elizabeth M /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "e4814741-3bba-4b7e-8a8b-540548f228da",
        "fields": {
            "phone": "8642502257",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "286131273",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Nelson Elizabeth M /Atty",
            "mqap_id": "e4814741-3bba-4b7e-8a8b-540548f228da",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 63,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Quattlebaum A Marvin /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "53356878-be79-4759-9824-139bade555bb",
        "fields": {
            "phone": "8642502209",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "275195659",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Quattlebaum A Marvin /Atty",
            "mqap_id": "53356878-be79-4759-9824-139bade555bb",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 64,
        "distance": 0.0379,
        "sourceName": "mqap.ntpois",
        "name": "Madden Timothy E /Atty",
        "shapePoints": [34.849504, -82.399711],
        "distanceUnit": "m",
        "key": "c6c0cc79-a4c3-4487-a586-722f04a394b0",
        "fields": {
            "phone": "8642502300",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399711,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "42536118",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399711,
                    "lat": 34.849504
                }
            },
            "address": "104 S Main St",
            "postal_code": "29601",
            "name": "Madden Timothy E /Atty",
            "mqap_id": "c6c0cc79-a4c3-4487-a586-722f04a394b0",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.849504,
            "lat": 34.849504,
            "disp_lng": -82.399711
        }
    },
    {
        "resultNumber": 65,
        "distance": 0.0394,
        "sourceName": "mqap.ntpois",
        "name": "Ubs",
        "shapePoints": [34.84987, -82.400675],
        "distanceUnit": "m",
        "key": "9ec5fc87-cccf-4818-b982-c85f00dd7b43",
        "fields": {
            "phone": "8642328499",
            "side_of_street": "L",
            "group_sic_code": "621105",
            "state": "SC",
            "lng": -82.400675,
            "group_sic_code_name": "Investment Securities",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Investment Securities::Financial Planners::Financial Advisory Services::Ubs Financial Svc",
            "id": "3580098",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.400675,
                    "lat": 34.84987
                }
            },
            "address": "17 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Ubs",
            "mqap_id": "9ec5fc87-cccf-4818-b982-c85f00dd7b43",
            "group_sic_code_ext": "621105::628205::628203::628203F85",
            "disp_lat": 34.84987,
            "lat": 34.84987,
            "disp_lng": -82.400675
        }
    },
    {
        "resultNumber": 66,
        "distance": 0.0412,
        "sourceName": "mqap.ntpois",
        "name": "Gibbons-Peck",
        "shapePoints": [34.850597, -82.399979],
        "distanceUnit": "m",
        "key": "65cffd05-d1b1-4aba-8a78-5a8c0aa44b1e",
        "fields": {
            "phone": "8642320927",
            "side_of_street": "R",
            "group_sic_code": "731101",
            "state": "SC",
            "lng": -82.399979,
            "group_sic_code_name": "Advertising Agencies",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Advertising Agencies",
            "id": "279283150",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399979,
                    "lat": 34.850597
                }
            },
            "address": "7 S Laurens St",
            "postal_code": "29601",
            "name": "Gibbons-Peck",
            "mqap_id": "65cffd05-d1b1-4aba-8a78-5a8c0aa44b1e",
            "group_sic_code_ext": "731101",
            "disp_lat": 34.850597,
            "lat": 34.850597,
            "disp_lng": -82.399979
        }
    },
    {
        "resultNumber": 67,
        "distance": 0.0439,
        "sourceName": "mqap.ntpois",
        "name": "Pink Azalea",
        "shapePoints": [34.850422, -82.399422],
        "distanceUnit": "m",
        "key": "f7220127-972d-4f1f-bd2d-712d3eab27a3",
        "fields": {
            "phone": "8642334554",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399422,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "286157002",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399422,
                    "lat": 34.850422
                }
            },
            "address": "14 S Main St",
            "postal_code": "29601",
            "name": "Pink Azalea",
            "mqap_id": "f7220127-972d-4f1f-bd2d-712d3eab27a3",
            "group_sic_code_ext": "",
            "disp_lat": 34.850422,
            "lat": 34.850422,
            "disp_lng": -82.399422
        }
    },
    {
        "resultNumber": 68,
        "distance": 0.0439,
        "sourceName": "mqap.ntpois",
        "name": "Creative Health & Herbal Nutrition",
        "shapePoints": [34.850422, -82.399422],
        "distanceUnit": "m",
        "key": "26f4c886-cd0a-4302-8d58-29a2d7abd821",
        "fields": {
            "phone": "8642334811",
            "side_of_street": "L",
            "group_sic_code": "804917",
            "state": "SC",
            "lng": -82.399422,
            "group_sic_code_name": "Dietitians",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Dietitians::Health Food",
            "id": "278136474",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399422,
                    "lat": 34.850422
                }
            },
            "address": "14 S Main St",
            "postal_code": "29601",
            "name": "Creative Health & Herbal Nutrition",
            "mqap_id": "26f4c886-cd0a-4302-8d58-29a2d7abd821",
            "group_sic_code_ext": "804917::549901",
            "disp_lat": 34.850422,
            "lat": 34.850422,
            "disp_lng": -82.399422
        }
    },
    {
        "resultNumber": 69,
        "distance": 0.0439,
        "sourceName": "mqap.ntpois",
        "name": "Reform Bode",
        "shapePoints": [34.850422, -82.399422],
        "distanceUnit": "m",
        "key": "00057891-c5c5-4a53-b556-c458c1e50557",
        "fields": {
            "phone": "8642364468",
            "side_of_street": "L",
            "group_sic_code": "799106",
            "state": "SC",
            "lng": -82.399422,
            "group_sic_code_name": "Personal Trainers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Personal Trainers::Health Clubs & Gyms",
            "id": "277699883",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399422,
                    "lat": 34.850422
                }
            },
            "address": "14 S Main St",
            "postal_code": "29601",
            "name": "Reform Bode",
            "mqap_id": "00057891-c5c5-4a53-b556-c458c1e50557",
            "group_sic_code_ext": "799106::799101",
            "disp_lat": 34.850422,
            "lat": 34.850422,
            "disp_lng": -82.399422
        }
    },
    {
        "resultNumber": 70,
        "distance": 0.0439,
        "sourceName": "mqap.ntpois",
        "name": "14 South Main St",
        "shapePoints": [34.850422, -82.399422],
        "distanceUnit": "m",
        "key": "3244b972-0449-42ab-a7d1-41945bcd37bc",
        "fields": {
            "phone": "8642417807",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399422,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "274319444",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399422,
                    "lat": 34.850422
                }
            },
            "address": "14 S Main St",
            "postal_code": "29601",
            "name": "14 South Main St",
            "mqap_id": "3244b972-0449-42ab-a7d1-41945bcd37bc",
            "group_sic_code_ext": "",
            "disp_lat": 34.850422,
            "lat": 34.850422,
            "disp_lng": -82.399422
        }
    },
    {
        "resultNumber": 71,
        "distance": 0.0452,
        "sourceName": "mqap.ntpois",
        "name": "K V L Audio Visual Services",
        "shapePoints": [34.849372, -82.399771],
        "distanceUnit": "m",
        "key": "c9a2b37e-cf78-4dc9-bfe5-0f0347312632",
        "fields": {
            "phone": "8642507908",
            "side_of_street": "R",
            "group_sic_code": "504301",
            "state": "SC",
            "lng": -82.399771,
            "group_sic_code_name": "Audio-Visual Equipment & Supls (whol)",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Audio-Visual Equipment & Supls (whol)::Audio-Visual Equipment-Repairing",
            "id": "21987248",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399771,
                    "lat": 34.849372
                }
            },
            "address": "120 S Main St",
            "postal_code": "29601",
            "name": "K V L Audio Visual Services",
            "mqap_id": "c9a2b37e-cf78-4dc9-bfe5-0f0347312632",
            "group_sic_code_ext": "504301::762204",
            "disp_lat": 34.849372,
            "lat": 34.849372,
            "disp_lng": -82.399771
        }
    },
    {
        "resultNumber": 72,
        "distance": 0.0452,
        "sourceName": "mqap.ntpois",
        "name": "The Westin Poinsett, Greenville",
        "shapePoints": [34.849372, -82.399771],
        "distanceUnit": "m",
        "key": "973fee42-c1a0-4748-b97d-e14ba9b11b1b",
        "fields": {
            "phone": "8644219719",
            "side_of_street": "R",
            "group_sic_code": "701101",
            "state": "SC",
            "lng": -82.399771,
            "group_sic_code_name": "Hotels & Motels",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Hotels & Motels",
            "id": "282779844",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399771,
                    "lat": 34.849372
                }
            },
            "address": "120 S Main St",
            "postal_code": "29601",
            "name": "The Westin Poinsett, Greenville",
            "mqap_id": "973fee42-c1a0-4748-b97d-e14ba9b11b1b",
            "group_sic_code_ext": "701101",
            "disp_lat": 34.849372,
            "lat": 34.849372,
            "disp_lng": -82.399771
        }
    },
    {
        "resultNumber": 73,
        "distance": 0.0458,
        "sourceName": "mqap.ntpois",
        "name": "Outmans On Main Cigar Lounge",
        "shapePoints": [34.850355, -82.399319],
        "distanceUnit": "m",
        "key": "0d94986a-372f-4a5c-a650-1abf14f0b90f",
        "fields": {
            "phone": "8642329430",
            "side_of_street": "L",
            "group_sic_code": "599302",
            "state": "SC",
            "lng": -82.399319,
            "group_sic_code_name": "Smoke Shops & Supplies",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Smoke Shops & Supplies::Cigars & Tobacco",
            "id": "274863075",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399319,
                    "lat": 34.850355
                }
            },
            "address": "36 S Main St",
            "postal_code": "29601",
            "name": "Outmans On Main Cigar Lounge",
            "mqap_id": "0d94986a-372f-4a5c-a650-1abf14f0b90f",
            "group_sic_code_ext": "599302::599301",
            "disp_lat": 34.850355,
            "lat": 34.850355,
            "disp_lng": -82.399319
        }
    },
    {
        "resultNumber": 74,
        "distance": 0.0458,
        "sourceName": "mqap.ntpois",
        "name": "Sunbelt",
        "shapePoints": [34.850355, -82.399319],
        "distanceUnit": "m",
        "key": "f156522f-1533-409d-8037-f73427da039e",
        "fields": {
            "phone": "8644788252",
            "side_of_street": "L",
            "group_sic_code": "679401",
            "state": "SC",
            "lng": -82.399319,
            "group_sic_code_name": "Franchising",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Franchising::Notes & Contracts Buyers",
            "id": "284226234",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399319,
                    "lat": 34.850355
                }
            },
            "address": "36 S Main St",
            "postal_code": "29601",
            "name": "Sunbelt",
            "mqap_id": "f156522f-1533-409d-8037-f73427da039e",
            "group_sic_code_ext": "679401::616206",
            "disp_lat": 34.850355,
            "lat": 34.850355,
            "disp_lng": -82.399319
        }
    },
    {
        "resultNumber": 75,
        "distance": 0.0458,
        "sourceName": "mqap.ntpois",
        "name": "12 Gates Holdings Company LLC",
        "shapePoints": [34.850355, -82.399319],
        "distanceUnit": "m",
        "key": "f887189d-dbc0-446e-8666-03da381c78e2",
        "fields": {
            "phone": "8642320607",
            "side_of_street": "L",
            "group_sic_code": "679401",
            "state": "SC",
            "lng": -82.399319,
            "group_sic_code_name": "Franchising",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Franchising::Notes & Contracts Buyers",
            "id": "284907910",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399319,
                    "lat": 34.850355
                }
            },
            "address": "36 S Main St",
            "postal_code": "29601",
            "name": "12 Gates Holdings Company LLC",
            "mqap_id": "f887189d-dbc0-446e-8666-03da381c78e2",
            "group_sic_code_ext": "679401::616206",
            "disp_lat": 34.850355,
            "lat": 34.850355,
            "disp_lng": -82.399319
        }
    },
    {
        "resultNumber": 76,
        "distance": 0.0468,
        "sourceName": "mqap.ntpois",
        "name": "Takosushi III Inc",
        "shapePoints": [34.850372, -82.399311],
        "distanceUnit": "m",
        "key": "8f2c10b2-6307-4b08-a896-8ad14e75cb5c",
        "fields": {
            "phone": "8642715055",
            "side_of_street": "L",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.399311,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "261842375",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399311,
                    "lat": 34.850372
                }
            },
            "address": "34 S Main St",
            "postal_code": "29601",
            "name": "Takosushi III Inc",
            "mqap_id": "8f2c10b2-6307-4b08-a896-8ad14e75cb5c",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.850372,
            "lat": 34.850372,
            "disp_lng": -82.399311
        }
    },
    {
        "resultNumber": 77,
        "distance": 0.0479,
        "sourceName": "mqap.ntpois",
        "name": "Pohl PA",
        "shapePoints": [34.85039, -82.399303],
        "distanceUnit": "m",
        "key": "e9d896e6-bd16-4e7d-9482-2d0629a397bd",
        "fields": {
            "phone": "8642336294",
            "side_of_street": "L",
            "group_sic_code": "811103",
            "state": "SC",
            "lng": -82.399303,
            "group_sic_code_name": "(all) Lawyers",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Lawyers",
            "id": "284389776",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399303,
                    "lat": 34.85039
                }
            },
            "address": "32 S Main St",
            "postal_code": "29601",
            "name": "Pohl PA",
            "mqap_id": "e9d896e6-bd16-4e7d-9482-2d0629a397bd",
            "group_sic_code_ext": "811103",
            "disp_lat": 34.85039,
            "lat": 34.85039,
            "disp_lng": -82.399303
        }
    },
    {
        "resultNumber": 78,
        "distance": 0.0479,
        "sourceName": "mqap.ntpois",
        "name": "Advancedprofessional Services Inc",
        "shapePoints": [34.85039, -82.399303],
        "distanceUnit": "m",
        "key": "788c0ede-fa91-478a-90a5-92765764619f",
        "fields": {
            "phone": "8642422321",
            "side_of_street": "L",
            "group_sic_code": "736103",
            "state": "SC",
            "lng": -82.399303,
            "group_sic_code_name": "Employment Agencies",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Employment Agencies",
            "id": "275268453",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399303,
                    "lat": 34.85039
                }
            },
            "address": "32 S Main St",
            "postal_code": "29601",
            "name": "Advancedprofessional Services Inc",
            "mqap_id": "788c0ede-fa91-478a-90a5-92765764619f",
            "group_sic_code_ext": "736103",
            "disp_lat": 34.85039,
            "lat": 34.85039,
            "disp_lng": -82.399303
        }
    },
    {
        "resultNumber": 79,
        "distance": 0.0479,
        "sourceName": "mqap.ntpois",
        "name": "Evolve Resources",
        "shapePoints": [34.85039, -82.399303],
        "distanceUnit": "m",
        "key": "835c1b51-022e-4325-8d43-400fa39dec3e",
        "fields": {
            "phone": "8645619447",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399303,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "288919936",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399303,
                    "lat": 34.85039
                }
            },
            "address": "32 S Main St",
            "postal_code": "29601",
            "name": "Evolve Resources",
            "mqap_id": "835c1b51-022e-4325-8d43-400fa39dec3e",
            "group_sic_code_ext": "",
            "disp_lat": 34.85039,
            "lat": 34.85039,
            "disp_lng": -82.399303
        }
    },
    {
        "resultNumber": 80,
        "distance": 0.0479,
        "sourceName": "mqap.ntpois",
        "name": "Firstplace Employer Services",
        "shapePoints": [34.85039, -82.399303],
        "distanceUnit": "m",
        "key": "8526fa0a-0245-49e7-9df4-7309ab0d7eec",
        "fields": {
            "phone": "8642335162",
            "side_of_street": "L",
            "group_sic_code": "736103",
            "state": "SC",
            "lng": -82.399303,
            "group_sic_code_name": "Employment Agencies",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Employment Agencies",
            "id": "277140800",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399303,
                    "lat": 34.85039
                }
            },
            "address": "32 S Main St",
            "postal_code": "29601",
            "name": "Firstplace Employer Services",
            "mqap_id": "8526fa0a-0245-49e7-9df4-7309ab0d7eec",
            "group_sic_code_ext": "736103",
            "disp_lat": 34.85039,
            "lat": 34.85039,
            "disp_lng": -82.399303
        }
    },
    {
        "resultNumber": 81,
        "distance": 0.0489,
        "sourceName": "mqap.ntpois",
        "name": "Poppington's Popcorn",
        "shapePoints": [34.850408, -82.399295],
        "distanceUnit": "m",
        "key": "e1e939ba-cca6-4660-ab2d-ab972642b083",
        "fields": {
            "phone": "8643491331",
            "side_of_street": "L",
            "group_sic_code": "514505",
            "state": "SC",
            "lng": -82.399295,
            "group_sic_code_name": "Popcorn & Popcorn Supplies-Wholesale",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Popcorn & Popcorn Supplies-Wholesale::Gourmet Shops",
            "id": "281905605",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399295,
                    "lat": 34.850408
                }
            },
            "address": "30 S Main St",
            "postal_code": "29601",
            "name": "Poppington's Popcorn",
            "mqap_id": "e1e939ba-cca6-4660-ab2d-ab972642b083",
            "group_sic_code_ext": "514505::549920",
            "disp_lat": 34.850408,
            "lat": 34.850408,
            "disp_lng": -82.399295
        }
    },
    {
        "resultNumber": 82,
        "distance": 0.05,
        "sourceName": "mqap.ntpois",
        "name": "Jamaica Mi Irie",
        "shapePoints": [34.850425, -82.399286],
        "distanceUnit": "m",
        "key": "a2e55843-5040-4ec9-9282-e5319d94cdf9",
        "fields": {
            "phone": "8642718384",
            "side_of_street": "L",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.399286,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "284095529",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399286,
                    "lat": 34.850425
                }
            },
            "address": "28 S Main St",
            "postal_code": "29601",
            "name": "Jamaica Mi Irie",
            "mqap_id": "a2e55843-5040-4ec9-9282-e5319d94cdf9",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.850425,
            "lat": 34.850425,
            "disp_lng": -82.399286
        }
    },
    {
        "resultNumber": 83,
        "distance": 0.05,
        "sourceName": "mqap.ntpois",
        "name": "Prime Dental PC",
        "shapePoints": [34.850425, -82.399286],
        "distanceUnit": "m",
        "key": "1e00a00f-80f6-4c88-a15e-4e11beefc81e",
        "fields": {
            "phone": "8648348001",
            "side_of_street": "L",
            "group_sic_code": "802101",
            "state": "SC",
            "lng": -82.399286,
            "group_sic_code_name": "(all) Dentists",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Dentists",
            "id": "277378873",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399286,
                    "lat": 34.850425
                }
            },
            "address": "28 S Main St",
            "postal_code": "29601",
            "name": "Prime Dental PC",
            "mqap_id": "1e00a00f-80f6-4c88-a15e-4e11beefc81e",
            "group_sic_code_ext": "802101",
            "disp_lat": 34.850425,
            "lat": 34.850425,
            "disp_lng": -82.399286
        }
    },
    {
        "resultNumber": 84,
        "distance": 0.05,
        "sourceName": "mqap.ntpois",
        "name": "Jamaica Twist Restaurant",
        "shapePoints": [34.850425, -82.399286],
        "distanceUnit": "m",
        "key": "b9655960-361c-4e76-894d-34dad56997c3",
        "fields": {
            "phone": "8642980013",
            "side_of_street": "L",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.399286,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "3578164",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399286,
                    "lat": 34.850425
                }
            },
            "address": "28 S Main St",
            "postal_code": "29601",
            "name": "Jamaica Twist Restaurant",
            "mqap_id": "b9655960-361c-4e76-894d-34dad56997c3",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.850425,
            "lat": 34.850425,
            "disp_lng": -82.399286
        }
    },
    {
        "resultNumber": 85,
        "distance": 0.0501,
        "sourceName": "mqap.ntpois",
        "name": "Senor Wraps",
        "shapePoints": [34.850559, -82.399437],
        "distanceUnit": "m",
        "key": "d8ef84b1-26e1-46e5-a031-664a54a7fc2c",
        "fields": {
            "phone": "8642393971",
            "side_of_street": "R",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.399437,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "3579312",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399437,
                    "lat": 34.850559
                }
            },
            "address": "10 S Main St",
            "postal_code": "29601",
            "name": "Senor Wraps",
            "mqap_id": "d8ef84b1-26e1-46e5-a031-664a54a7fc2c",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.850559,
            "lat": 34.850559,
            "disp_lng": -82.399437
        }
    },
    {
        "resultNumber": 86,
        "distance": 0.0501,
        "sourceName": "mqap.ntpois",
        "name": "U S Government U S Senate",
        "shapePoints": [34.84929, -82.399809],
        "distanceUnit": "m",
        "key": "50898074-fcb0-492e-9234-a7054be5def5",
        "fields": {
            "phone": "8642501417",
            "side_of_street": "L",
            "group_sic_code": "912101",
            "state": "SC",
            "lng": -82.399809,
            "group_sic_code_name": "Government Offices-Us",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Government Offices-Us",
            "id": "277972418",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399809,
                    "lat": 34.84929
                }
            },
            "address": "130 S Main St",
            "postal_code": "29601",
            "name": "U S Government U S Senate",
            "mqap_id": "50898074-fcb0-492e-9234-a7054be5def5",
            "group_sic_code_ext": "912101",
            "disp_lat": 34.84929,
            "lat": 34.84929,
            "disp_lng": -82.399809
        }
    },
    {
        "resultNumber": 87,
        "distance": 0.0501,
        "sourceName": "mqap.ntpois",
        "name": "River Falls Spa",
        "shapePoints": [34.84929, -82.399809],
        "distanceUnit": "m",
        "key": "7eef6420-2c3c-4e8d-9e8d-599c0f57acfa",
        "fields": {
            "phone": "8642402136",
            "side_of_street": "L",
            "group_sic_code": "509112",
            "state": "SC",
            "lng": -82.399809,
            "group_sic_code_name": "Swimming Pool-Distributors (whol)",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Swimming Pool-Distributors (whol)",
            "id": "21987304",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399809,
                    "lat": 34.84929
                }
            },
            "address": "130 S Main St",
            "postal_code": "29601",
            "name": "River Falls Spa",
            "mqap_id": "7eef6420-2c3c-4e8d-9e8d-599c0f57acfa",
            "group_sic_code_ext": "509112",
            "disp_lat": 34.84929,
            "lat": 34.84929,
            "disp_lng": -82.399809
        }
    },
    {
        "resultNumber": 88,
        "distance": 0.052,
        "sourceName": "mqap.ntpois",
        "name": "Greyhound Bus Lines",
        "shapePoints": [34.850229, -82.400872],
        "distanceUnit": "m",
        "key": "e7c0649b-2a05-40dc-a064-5747d2c9b0a4",
        "fields": {
            "phone": "8642350371",
            "side_of_street": "R",
            "group_sic_code": "413101",
            "state": "SC",
            "lng": -82.400872,
            "group_sic_code_name": "Bus Lines",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Bus Lines::Greyhound Bus Lines",
            "id": "265831538",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.400872,
                    "lat": 34.850229
                }
            },
            "address": "100 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Greyhound Bus Lines",
            "mqap_id": "e7c0649b-2a05-40dc-a064-5747d2c9b0a4",
            "group_sic_code_ext": "413101::413101F01",
            "disp_lat": 34.850229,
            "lat": 34.850229,
            "disp_lng": -82.400872
        }
    },
    {
        "resultNumber": 89,
        "distance": 0.0521,
        "sourceName": "mqap.ntpois",
        "name": "Greyhound Packagexpress",
        "shapePoints": [34.850609, -82.400543],
        "distanceUnit": "m",
        "key": "d37d5897-1eea-4199-b860-b630f8cd8c37",
        "fields": {
            "phone": "8642354741",
            "side_of_street": "R",
            "group_sic_code": "413101",
            "state": "SC",
            "lng": -82.400543,
            "group_sic_code_name": "Bus Lines",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Bus Lines::Delivery Service",
            "id": "289594148",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.400543,
                    "lat": 34.850609
                }
            },
            "address": "100 W Mcbee Ave",
            "postal_code": "29601",
            "name": "Greyhound Packagexpress",
            "mqap_id": "d37d5897-1eea-4199-b860-b630f8cd8c37",
            "group_sic_code_ext": "413101::421205",
            "disp_lat": 34.850609,
            "lat": 34.850609,
            "disp_lng": -82.400543
        }
    },
    {
        "resultNumber": 90,
        "distance": 0.0547,
        "sourceName": "mqap.ntpois",
        "name": "Trappe Door The",
        "shapePoints": [34.850784, -82.399857],
        "distanceUnit": "m",
        "key": "c1926eaf-3ffc-4b80-8b5d-262409a8c8f4",
        "fields": {
            "phone": "8644517490",
            "side_of_street": "L",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.399857,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "276668335",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399857,
                    "lat": 34.850784
                }
            },
            "address": "25 W Washington St",
            "postal_code": "29601",
            "name": "Trappe Door The",
            "mqap_id": "c1926eaf-3ffc-4b80-8b5d-262409a8c8f4",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.850784,
            "lat": 34.850784,
            "disp_lng": -82.399857
        }
    },
    {
        "resultNumber": 91,
        "distance": 0.0547,
        "sourceName": "mqap.ntpois",
        "name": "Barleys Taproom",
        "shapePoints": [34.850784, -82.399857],
        "distanceUnit": "m",
        "key": "9c952531-fe12-41a2-9681-4d4fc03e8f5c",
        "fields": {
            "phone": "8642323706",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399857,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "3580142",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399857,
                    "lat": 34.850784
                }
            },
            "address": "25 W Washington St",
            "postal_code": "29601",
            "name": "Barleys Taproom",
            "mqap_id": "9c952531-fe12-41a2-9681-4d4fc03e8f5c",
            "group_sic_code_ext": "",
            "disp_lat": 34.850784,
            "lat": 34.850784,
            "disp_lng": -82.399857
        }
    },
    {
        "resultNumber": 92,
        "distance": 0.0556,
        "sourceName": "mqap.ntpois",
        "name": "Park Place On Main",
        "shapePoints": [34.850514, -82.399245],
        "distanceUnit": "m",
        "key": "1ea98f44-07cb-4b11-8055-1751238ad545",
        "fields": {
            "phone": "8643707085",
            "side_of_street": "L",
            "group_sic_code": "",
            "state": "SC",
            "lng": -82.399245,
            "group_sic_code_name": "",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "",
            "id": "277479127",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399245,
                    "lat": 34.850514
                }
            },
            "address": "18 S Main St",
            "postal_code": "29601",
            "name": "Park Place On Main",
            "mqap_id": "1ea98f44-07cb-4b11-8055-1751238ad545",
            "group_sic_code_ext": "",
            "disp_lat": 34.850514,
            "lat": 34.850514,
            "disp_lng": -82.399245
        }
    },
    {
        "resultNumber": 93,
        "distance": 0.0556,
        "sourceName": "mqap.ntpois",
        "name": "Red Fin",
        "shapePoints": [34.850514, -82.399245],
        "distanceUnit": "m",
        "key": "37cb9628-1d0b-47c5-afc5-205ba1ca1163",
        "fields": {
            "phone": "8642368408",
            "side_of_street": "L",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.399245,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "284796302",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399245,
                    "lat": 34.850514
                }
            },
            "address": "18 S Main St",
            "postal_code": "29601",
            "name": "Red Fin",
            "mqap_id": "37cb9628-1d0b-47c5-afc5-205ba1ca1163",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.850514,
            "lat": 34.850514,
            "disp_lng": -82.399245
        }
    },
    {
        "resultNumber": 94,
        "distance": 0.0585,
        "sourceName": "mqap.ntpois",
        "name": "Greenville Beer Exchange The",
        "shapePoints": [34.850841, -82.399861],
        "distanceUnit": "m",
        "key": "b99d6fa0-0fee-45dd-b564-5a9313a1fbf3",
        "fields": {
            "phone": "8642323533",
            "side_of_street": "R",
            "group_sic_code": "592102",
            "state": "SC",
            "lng": -82.399861,
            "group_sic_code_name": "Liquor Stores",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Liquor Stores::Beer & Ale-Retail",
            "id": "270135898",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399861,
                    "lat": 34.850841
                }
            },
            "address": "7 S Laurens St",
            "postal_code": "29601",
            "name": "Greenville Beer Exchange The",
            "mqap_id": "b99d6fa0-0fee-45dd-b564-5a9313a1fbf3",
            "group_sic_code_ext": "592102::592104",
            "disp_lat": 34.850841,
            "lat": 34.850841,
            "disp_lng": -82.399861
        }
    },
    {
        "resultNumber": 95,
        "distance": 0.0585,
        "sourceName": "mqap.ntpois",
        "name": "Zirkelbach Construction LLC",
        "shapePoints": [34.850841, -82.399861],
        "distanceUnit": "m",
        "key": "882af8df-ad83-4a69-862d-676ba3fde2d9",
        "fields": {
            "phone": "8645524004",
            "side_of_street": "R",
            "group_sic_code": "874114",
            "state": "SC",
            "lng": -82.399861,
            "group_sic_code_name": "Construction Consultants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Construction Consultants::Real Estate Developers",
            "id": "284495809",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399861,
                    "lat": 34.850841
                }
            },
            "address": "7 S Laurens St",
            "postal_code": "29601",
            "name": "Zirkelbach Construction LLC",
            "mqap_id": "882af8df-ad83-4a69-862d-676ba3fde2d9",
            "group_sic_code_ext": "874114::655202",
            "disp_lat": 34.850841,
            "lat": 34.850841,
            "disp_lng": -82.399861
        }
    },
    {
        "resultNumber": 96,
        "distance": 0.0591,
        "sourceName": "mqap.ntpois",
        "name": "Kozani Restaurant & Bar",
        "shapePoints": [34.850567, -82.39922],
        "distanceUnit": "m",
        "key": "310bdeec-6515-4f7b-8501-1f820b1f8786",
        "fields": {
            "phone": "8642633561",
            "side_of_street": "L",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.39922,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "264799055",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.39922,
                    "lat": 34.850567
                }
            },
            "address": "12 S Main St",
            "postal_code": "29601",
            "name": "Kozani Restaurant & Bar",
            "mqap_id": "310bdeec-6515-4f7b-8501-1f820b1f8786",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.850567,
            "lat": 34.850567,
            "disp_lng": -82.39922
        }
    },
    {
        "resultNumber": 97,
        "distance": 0.0595,
        "sourceName": "mqap.ntpois",
        "name": "CVS Pharmacy",
        "shapePoints": [34.850265, -82.399003],
        "distanceUnit": "m",
        "key": "0febd46c-fa1a-4a11-802c-28e35b486f36",
        "fields": {
            "phone": "8643704848",
            "side_of_street": "R",
            "group_sic_code": "591205",
            "state": "SC",
            "lng": -82.399003,
            "group_sic_code_name": "Pharmacies",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Pharmacies::Cvs Pharmacy",
            "id": "274293646",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399003,
                    "lat": 34.850265
                }
            },
            "address": "35 S Main St",
            "postal_code": "29601",
            "name": "CVS Pharmacy",
            "mqap_id": "0febd46c-fa1a-4a11-802c-28e35b486f36",
            "group_sic_code_ext": "591205::591205F75",
            "disp_lat": 34.850265,
            "lat": 34.850265,
            "disp_lng": -82.399003
        }
    },
    {
        "resultNumber": 98,
        "distance": 0.0595,
        "sourceName": "mqap.ntpois",
        "name": "ATM",
        "shapePoints": [34.850265, -82.399003],
        "distanceUnit": "m",
        "key": "2d9e18fd-b3a4-4d72-9461-a22a59cb34c1",
        "fields": {
            "phone": "",
            "side_of_street": "R",
            "group_sic_code": "602103",
            "state": "SC",
            "lng": -82.399003,
            "group_sic_code_name": "Automated Teller Machines",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Automated Teller Machines",
            "id": "288645207",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399003,
                    "lat": 34.850265
                }
            },
            "address": "35 S Main St",
            "postal_code": "29601",
            "name": "ATM",
            "mqap_id": "2d9e18fd-b3a4-4d72-9461-a22a59cb34c1",
            "group_sic_code_ext": "602103",
            "disp_lat": 34.850265,
            "lat": 34.850265,
            "disp_lng": -82.399003
        }
    },
    {
        "resultNumber": 99,
        "distance": 0.0595,
        "sourceName": "mqap.ntpois",
        "name": "Seven South Main Holdings LLC",
        "shapePoints": [34.850265, -82.399003],
        "distanceUnit": "m",
        "key": "05c2e0ed-2892-48df-ba21-ec257a3ea592",
        "fields": {
            "phone": "8642350650",
            "side_of_street": "R",
            "group_sic_code": "641133",
            "state": "SC",
            "lng": -82.399003,
            "group_sic_code_name": "Insurance-Holding Companies",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "Insurance-Holding Companies::Holding Companies (bank)::Holding Companies (non-Bank)::Restaurant Holding Companies::Utilities-Holding Companies",
            "id": "273344863",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.399003,
                    "lat": 34.850265
                }
            },
            "address": "35 S Main St",
            "postal_code": "29601",
            "name": "Seven South Main Holdings LLC",
            "mqap_id": "05c2e0ed-2892-48df-ba21-ec257a3ea592",
            "group_sic_code_ext": "641133::671201::671901::671902::671904",
            "disp_lat": 34.850265,
            "lat": 34.850265,
            "disp_lng": -82.399003
        }
    },
    {
        "resultNumber": 100,
        "distance": 0.0609,
        "sourceName": "mqap.ntpois",
        "name": "Nose Dive",
        "shapePoints": [34.849117, -82.400047],
        "distanceUnit": "m",
        "key": "e97b70b5-92e2-41a8-8ccd-eb49a24a0acc",
        "fields": {
            "phone": "8643737300",
            "side_of_street": "R",
            "group_sic_code": "581208",
            "state": "SC",
            "lng": -82.400047,
            "group_sic_code_name": "(all) Restaurants",
            "city": "Greenville",
            "country": "US",
            "group_sic_code_name_ext": "(all) Restaurants",
            "id": "273164218",
            "mqap_geography": {
                "latLng": {
                    "lng": -82.400047,
                    "lat": 34.849117
                }
            },
            "address": "116 S Main St",
            "postal_code": "29601",
            "name": "Nose Dive",
            "mqap_id": "e97b70b5-92e2-41a8-8ccd-eb49a24a0acc",
            "group_sic_code_ext": "581208",
            "disp_lat": 34.849117,
            "lat": 34.849117,
            "disp_lng": -82.400047
        }
    }],
    "origin": {
        "latLng": {
            "lng": -82.4,
            "lat": 34.85
        },
        "postalCode": "",
        "adminArea5Type": "City",
        "adminArea4": "",
        "adminArea5": "",
        "adminArea4Type": "County",
        "street": "",
        "adminArea1Type": "Country",
        "adminArea1": "",
        "adminArea3": "",
        "adminArea3Type": "State"
    },
    "resultsCount": 100,
    "hostedData": [{
        "tableName": "mqap.ntpois",
        "extraCriteria": "",
        "columnNames": []
    }],
    "totalPages": 1,
    "info": {
        "statusCode": 0,
        "copyright": {
            "text": "© 2015 MapQuest, Inc.",
            "imageUrl": "http://api.mqcdn.com/res/mqlogo.gif",
            "imageAltText": "© 2015 MapQuest, Inc."
        },
        "messages": []
    },
    "options": {
        "kmlStyleUrl": "http://www.search.mapquestapi.com/kml-default.kml",
        "shapeFormat": "raw",
        "ambiguities": true,
        "pageSize": 100,
        "radius": 20,
        "currentPage": 1,
        "units": "m",
        "maxMatches": 100
    }
 */