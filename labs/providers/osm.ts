// https://github.com/jonataswalker/ol3-geocoder/blob/master/src/js/providers/osm.js

declare module OpenStreet {

    export interface Address {
        road: string;
        state: string;
        country: string;
    }

    export interface Address {
        neighbourhood: string;
        postcode: string;
        city: string;
        town: string;
    }

    export interface Address {
        peak: string;
        county: string;
        country_code: string;
        sports_centre: string;
    }

    export interface ResponseItem {
        place_id: string;
        licence: string;
        osm_type: string;
        osm_id: string;
        boundingbox: string[];
        lat: string;
        lon: string;
        display_name: string;
        class: string;
        type: string;
        importance: number;
        icon: string;
        address: Address;
    }

    export type Response = ResponseItem[];

}

interface Result<T> {
    lon: number;
    lat: number;
    address: {
        name: string;
        road: string;
        postcode: string;
        city: string;
        state: string;
        country: string;
    },
    original: T
}

export class OpenStreet {

    public dataType = 'json';
    public method = 'GET';

    private settings = {
        url: '//nominatim.openstreetmap.org/search/',
        params: {
            q: '',
            format: 'json',
            addressdetails: 1,
            limit: 10,
            countrycodes: '',
            'accept-language': 'en-US'
        }
    };

    getParameters(options: {
        query: string;
        limit: number;
        countrycodes: string;
        lang: string;
    }) {
        return {
            url: this.settings.url,
            params: {
                q: options.query,
                format: 'json',
                addressdetails: 1,
                limit: options.limit || this.settings.params.limit,
                countrycodes: options.countrycodes || this.settings.params.countrycodes,
                'accept-language': options.lang || this.settings.params['accept-language']
            }
        };
    }

    handleResponse(args: OpenStreet.Response) {
        return args.sort(v => v.importance || 1).map(result => (<Result<typeof result>>{
            original: result,
            lon: parseFloat(result.lon),
            lat: parseFloat(result.lat),
            address: {
                name: result.address.neighbourhood || '',
                road: result.address.road || '',
                postcode: result.address.postcode,
                city: result.address.city || result.address.town,
                state: result.address.state,
                country: result.address.country
            }
        }));
    }
}