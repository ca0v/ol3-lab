/**
 * http://router.project-osrm.org/nearest?loc=52.4224,13.333086
 * http://{server}/trip?loc={lat,lon}&loc={lat,lon}<&loc={lat,lon} ...>
 * http://router.project-osrm.org/trip?loc=52.52,13.44&loc=52.5,13.45&jsonp=callback
 */

import * as ajax from "./ajax";
import * as $ from "jquery";
import Encoder = require("./google-polyline");

declare module OsrmServices {

    export interface HintData {
        locations: string[];
        checksum: number;
    }

    export interface RouteSummary {
        total_distance: number;
        total_time: number;
        end_point: string;
        start_point: string;
    }

    export interface Trip {
        hint_data: HintData;
        route_name: string[];
        route_geometry: string;
        via_indices: number[];
        via_points: number[][];
        permutation: number[];
        found_alternative: boolean;
        route_summary: RouteSummary;
    }

    export interface TripResponse {
        status: number;
        status_message: string;
        trips: Trip[];
    }

}


class Osrm {

    constructor(public url = "http://router.project-osrm.org") {

    }

    viaroute(data: {
        loc?: number[][];
        locs?: string;
        z?: number;
        output?: string;
        instructions?: boolean;
        alt?: boolean;
        geometry?: boolean;
        compression?: boolean;
        uturns?: boolean;
        u?: boolean[];
        hint?: string[];
        checksum?: number;
    }) {

        let req = $.extend({}, data);
        req.loc = data.loc.map(l => `${l[0]},${l[1]}`).join("&loc=");

        return ajax.jsonp<OsrmServices.Trip>(this.url + "/viaroute", req, "jsonp");
    }

    nearest(loc: number[]) {
        return ajax.jsonp<{
            status: number;
            mapped_coordinate: number[];
            name: string;
        }>(this.url + "/nearest", {
            loc: loc
        }, "jsonp");
    }

    table() {
    }

    match() {
    }

    trip(loc: number[][]) {
        let url = this.url + "/trip";
        return ajax.jsonp<OsrmServices.TripResponse>(url, {
            loc: loc.map(l => `${l[0]},${l[1]}`).join("&loc="),
        }, "jsonp");
    }

    static test() {
        let service = new Osrm();

        false && service.trip([[34.8, -82.85], [34.8, -82.80]]).then(result => {
            console.log("trip", result);
            let decoder = new Encoder();
            result.trips.map(trip => {                                
                console.log("trip", trip.route_name, "route_geometry", decoder.decode(trip.route_geometry, 6).map(v => [v[1], v[0]]));
            });
        });

        service.viaroute({
            loc: [[34.85, -82.4], [34.85, -82.4]]
        }).then(result => {
            console.log("viaroute", result);
            let decoder = new Encoder();
            console.log("route_geometry", decoder.decode(result.route_geometry, 6).map(v => [v[1], v[0]]));
        });
        
        // "West McBee Avenue"
        false && service.nearest([34.85, -82.4]).then(result => console.log("nearest", result));

    }

}

export = Osrm;

/**
 * Response to http://router.project-osrm.org/trip?loc=34.8,-82.85&loc=34.8,-82.8&jsonp=define:
define({
    "status": 200,
    "status_message": "Found trips",
    "trips": [{
        "hint_data": {
            "locations": ["CZZiAWbmYgFaDBMAFgAAAEgAAAD_AQAAdgMAACjaHQHH6AAACgETAr-WEPsQAAEB", "PwBiAa09YgFUOgYAGAAAAAUAAACoAwAAAgEAACL3HAHH6AAAwgcTAsrID_shAAEB", "CZZiAWbmYgFaDBMAFgAAAEgAAAD_AQAAdgMAACjaHQHH6AAACgETAr-WEPsQAAEB"],
            "checksum": 2261320460
        },
        "route_name": ["Old Seneca Road", "Mt Olivet Road (SC 133)"],
        "route_geometry": "so_kaA`ss||C~KdAxJH~Gw@fPoCvNwElG_BrEaB~T_K~LwGdH_GjHeH`FuGpG{L`U{i@pHmNhVmTvDiD|Y{QjTeQdMwIfFoEtGuBhGoAhIRfFtAhFdDdDtExOtd@~AnEzDfJfC~E`DnB_IfYwTl{@_Knc@qGtUuC~PaDbV}AxWaBlVyAld@kD`fA{A`x@oBfm@uBhb@sBz[}LrdAyThqAiDnSmJfk@}Lto@eKhf@kIzWmGnRkYpo@u\\xl@s]hn@uIpOqOnZse@d_AmA`Cgv@`wAwRnZuN`QqKhLeb@dSaTjJo`@bQ{ShJa`@`QkmA|i@weBnw@gz@r^sQlMeMdLcDvGuJ|VeEbNoBnE\\jOpDxc@jCnV|Ej\\xPt_AtTlbBr^~}BxKnr@zMhv@~Lbn@rLne@dFhTnAjFpClLxIra@bJj_@dEjRhFtUvFx]pCvOhBlVX|]Gvl@_Adm@Rdg@tB~VpE`T|BjMfD~MhGtNvQrW|BbD`Zbm@vWbb@hDnFlNfVnGzKjBrDdIdPxHlOvGtMfPf^tBtEbd@foAtA|DbC`HjAbDva@fkArLxXnP~UvC~CfHvHtO|Kn[rKnDZsCdI}BtF}DfFuKjEkJbAoSpA_Jj@yPvAoJvCst@jg@eJzGyCnFeOtq@oBpMUtOqBxZKnMVvLpAjLhH|NpH|LzPhUtFdJhIjTb@lH@dIcBjR{CnWuDd`@yBdQc@rJVfKnAxL|@xK|ExR`FpOnEnPjBlL~BrP~@rQtBdThChKhC~F~@rBzC~FhInIhShObInFtElIdBvHp@jQcAd^}@`VcChTyB`HmBbGoEvKsEpR{@`Np@xSjAfSK~Le@tQmApXC`R`BdI~HfV~D`GrHbG~HvEjPhEvRbDhIrClDxDdCxInCvLdDjHfFpIzDlFoMhDui@tKuT|C{If@wMV_M}A}L_HiOeHsEwB_M{Go[wNqH_B}Be@sVsCmR}CuNqE{LqFkJwKiSoZeLsT_LkY{Pm\\iMaX}EmQuIkX}H{b@uOiuAgAoVd@yXfDeY~A}Om@mH{BgD_ICoP}@uGiBkGuEoJmKiKeQmKeVqLc_@sCw[iAqMm@sV}CqOkFqSiGiNip@a`AsMuQaGcMsHqZmBoEcFrC{Hd@oNKuYgBcWo@eScDeGmC_A{A_C{DqF_PkKeYoKw]uHiZmD{Qu`@m^a_@mZkI{GwS}NoE_DwJqFeNwH{g@iYmEcCwj@c]_q@gk@yCwDeT_Q}_@g\\wa@o[gLqIyKeIaD_CuDoD}EiFyFsJid@unAgEiPkSgbAi@mCeRsv@kLqq@uHsVmJeMoHmDgMgEeYcPwMmKyNyKgRuRb\\_UhDaDjE_ExIqKhWsa@|QcVxMeVfPeT~LiRpNuOlOqO`MeMtEkF~c@w^jD}CzT}R|BsBp^}ZnLuLnEiFdKaNtCqDfBuDfMia@dWst@|K{[nHwS~`@ciAhEqL|HwNrQ_UdBwB~@kA|WuXrZy]`Z_Y`GwFzBcCzo@ys@fJuHtD}CpQqQjWqYxc@ue@tLqL`GqIhOcRdVu\\~Xya@`KeRrGiPnBoEdEcNtJ}VbDwGdMeLrQmMfz@s^veBow@jmA}i@``@aQzSiJn`@cQ`TkJdb@eSpKiLtNaQvRoZfv@awAlAaCre@e_ApOoZtIqOr]in@t\\yl@jYqo@lGoRjI{WdKif@|Luo@lJgk@hDoSxTiqA|LsdArB{[tBib@nBgm@zAax@jDafAxAmd@`BmV|AyW`DcVtC_QpGuU~Joc@vTm{@~HgYaDoBgC_F{DgJ_BoEyOud@eDuEiFeDgFuAiISiGnAuGtBgFnEeMvIkTdQ}YzQwDhDiVlTqHlNaUzi@qGzLaFtGkHdHeH~F_MvG_U~JsE`BmG~AwNvEgPnC_Hv@yJI_LeA",
        "via_indices": [0, 156, 444],
        "via_points": [
            [34.799882, -82.798913],
            [34.801602, -82.851638],
            [34.799882, -82.798913]
        ],
        "permutation": [1, 0],
        "found_alternative": false,
        "route_summary": {
            "total_distance": 18280,
            "total_time": 1723,
            "end_point": "John Holiday Road",
            "start_point": "John Holiday Road"
        }
    }]
})

And when the geometry is decoded:
[
    [
        [34.799882, -82.798913],
        [34.799674, -82.798948],
        [34.799485, -82.798953],
        [34.799341, -82.798925],
        [34.799065, -82.798853],
        [34.798813, -82.798745],
        [34.798678, -82.798697],
        [34.798572, -82.798648],
        [34.79822, -82.798456],
        [34.797996, -82.798316],
        [34.797849, -82.798188],
        [34.797699, -82.798041],
        [34.797586, -82.797902],
        [34.797449, -82.79768],
        [34.797096, -82.796994],
        [34.796943, -82.796747],
        [34.79657, -82.796404],
        [34.796478, -82.796319],
        [34.796047, -82.796017],
        [34.795705, -82.795726],
        [34.795478, -82.795554],
        [34.795362, -82.79545],
        [34.795223, -82.795391],
        [34.79509, -82.795351],
        [34.794925, -82.795361],
        [34.794809, -82.795404],
        [34.794692, -82.795487],
        [34.794609, -82.795594],
        [34.79434, -82.796197],
        [34.794292, -82.796301],
        [34.794198, -82.796481],
        [34.79413, -82.796593],
        [34.794049, -82.796649],
        [34.794209, -82.797069],
        [34.794557, -82.798036],
        [34.794749, -82.79862],
        [34.794886, -82.798983],
        [34.794961, -82.799271],
        [34.795042, -82.799641],
        [34.795089, -82.800038],
        [34.795138, -82.800413],
        [34.795183, -82.801012],
        [34.795269, -82.802149],
        [34.795315, -82.803062],
        [34.795371, -82.803802],
        [34.79543, -82.804367],
        [34.795488, -82.804829],
        [34.795711, -82.805943],
        [34.79606, -82.80726],
        [34.796145, -82.807588],
        [34.796328, -82.808296],
        [34.796551, -82.809075],
        [34.796746, -82.809704],
        [34.796912, -82.810102],
        [34.797047, -82.810414],
        [34.797469, -82.811191],
        [34.797944, -82.811924],
        [34.798434, -82.812681],
        [34.798605, -82.812946],
        [34.79887, -82.813386],
        [34.799488, -82.814413],
        [34.799527, -82.814478],
        [34.800411, -82.815887],
        [34.800727, -82.816327],
        [34.800978, -82.816616],
        [34.801179, -82.816829],
        [34.801742, -82.817152],
        [34.802079, -82.817334],
        [34.802615, -82.817624],
        [34.802949, -82.817805],
        [34.803478, -82.818094],
        [34.804732, -82.818781],
        [34.806376, -82.819685],
        [34.807324, -82.820191],
        [34.807622, -82.820422],
        [34.807849, -82.820633],
        [34.807931, -82.820773],
        [34.808118, -82.821156],
        [34.808217, -82.821398],
        [34.808273, -82.821502],
        [34.808258, -82.821764],
        [34.808169, -82.822353],
        [34.808099, -82.822729],
        [34.807988, -82.823199],
        [34.807703, -82.824234],
        [34.807356, -82.825825],
        [34.80685, -82.827857],
        [34.806645, -82.828681],
        [34.806407, -82.829566],
        [34.806183, -82.83032],
        [34.805965, -82.830936],
        [34.80585, -82.831277],
        [34.80581, -82.831395],
        [34.805737, -82.83161],
        [34.805564, -82.832164],
        [34.805386, -82.832682],
        [34.805287, -82.832992],
        [34.80517, -82.833355],
        [34.805046, -82.833848],
        [34.804973, -82.834116],
        [34.80492, -82.834491],
        [34.804907, -82.834986],
        [34.804911, -82.835718],
        [34.804943, -82.836457],
        [34.804933, -82.8371],
        [34.804874, -82.837484],
        [34.804769, -82.837821],
        [34.804706, -82.838051],
        [34.804622, -82.838291],
        [34.804489, -82.838542],
        [34.804189, -82.838936],
        [34.804126, -82.839018],
        [34.803693, -82.839756],
        [34.803297, -82.840318],
        [34.803212, -82.840438],
        [34.802965, -82.84081],
        [34.802829, -82.841016],
        [34.802775, -82.841106],
        [34.802612, -82.841381],
        [34.802455, -82.841644],
        [34.802315, -82.841879],
        [34.802039, -82.842379],
        [34.80198, -82.842486],
        [34.801386, -82.84377],
        [34.801343, -82.843865],
        [34.801277, -82.84401],
        [34.801239, -82.844092],
        [34.800683, -82.845312],
        [34.800465, -82.845725],
        [34.800185, -82.846093],
        [34.800109, -82.846173],
        [34.799961, -82.846329],
        [34.799694, -82.846536],
        [34.799238, -82.846738],
        [34.79915, -82.846752],
        [34.799224, -82.846915],
        [34.799287, -82.847038],
        [34.799382, -82.847154],
        [34.799585, -82.847256],
        [34.799767, -82.84729],
        [34.800095, -82.847331],
        [34.800271, -82.847353],
        [34.800556, -82.847397],
        [34.80074, -82.847473],
        [34.801598, -82.848119],
        [34.801777, -82.848261],
        [34.801854, -82.848381],
        [34.802113, -82.849192],
        [34.802169, -82.849425],
        [34.80218, -82.849692],
        [34.802237, -82.850137],
        [34.802243, -82.850369],
        [34.802231, -82.850589],
        [34.80219, -82.850803],
        [34.802041, -82.851058],
        [34.801888, -82.851281],
        [34.801602, -82.851638],
        [34.801479, -82.851817],
        [34.801314, -82.852159],
        [34.801296, -82.85231],
        [34.801295, -82.852473],
        [34.801345, -82.852783],
        [34.801423, -82.853175],
        [34.801514, -82.853706],
        [34.801575, -82.853997],
        [34.801593, -82.854183],
        [34.801581, -82.854379],
        [34.801541, -82.8546],
        [34.80151, -82.854805],
        [34.801399, -82.855122],
        [34.801286, -82.855387],
        [34.801182, -82.855667],
        [34.801128, -82.855882],
        [34.801064, -82.856164],
        [34.801032, -82.856462],
        [34.800973, -82.856801],
        [34.800904, -82.856998],
        [34.800835, -82.857126],
        [34.800803, -82.857184],
        [34.800725, -82.857312],
        [34.80056, -82.85748],
        [34.800235, -82.857741],
        [34.800073, -82.857861],
        [34.799966, -82.858028],
        [34.799915, -82.858184],
        [34.79989, -82.858478],
        [34.799924, -82.858977],
        [34.799955, -82.859346],
        [34.800021, -82.859687],
        [34.800082, -82.859832],
        [34.800137, -82.859962],
        [34.800241, -82.860166],
        [34.800347, -82.860479],
        [34.800377, -82.86072],
        [34.800352, -82.861053],
        [34.800314, -82.861377],
        [34.80032, -82.861601],
        [34.800339, -82.8619],
        [34.800378, -82.862309],
        [34.80038, -82.862614],
        [34.800331, -82.862777],
        [34.800171, -82.863149],
        [34.800075, -82.863278],
        [34.799921, -82.863408],
        [34.799761, -82.863516],
        [34.799483, -82.863617],
        [34.799167, -82.863699],
        [34.799002, -82.863773],
        [34.798915, -82.863866],
        [34.798848, -82.864039],
        [34.798776, -82.864259],
        [34.798693, -82.864409],
        [34.798577, -82.864578],
        [34.798483, -82.864697],
        [34.798715, -82.864782],
        [34.799398, -82.864985],
        [34.799745, -82.865064],
        [34.799919, -82.865084],
        [34.800155, -82.865096],
        [34.800379, -82.865049],
        [34.800602, -82.864905],
        [34.800863, -82.864758],
        [34.800969, -82.864698],
        [34.801193, -82.864556],
        [34.801649, -82.864304],
        [34.801802, -82.864256],
        [34.801865, -82.864237],
        [34.802243, -82.864163],
        [34.802554, -82.864084],
        [34.802805, -82.863979],
        [34.803027, -82.863858],
        [34.803209, -82.863654],
        [34.803534, -82.863214],
        [34.803745, -82.862868],
        [34.803953, -82.862446],
        [34.804239, -82.861975],
        [34.804468, -82.861574],
        [34.804579, -82.861279],
        [34.80475, -82.860873],
        [34.804909, -82.860299],
        [34.805176, -82.858918],
        [34.805212, -82.858542],
        [34.805193, -82.858129],
        [34.805109, -82.85771],
        [34.805061, -82.857439],
        [34.805084, -82.857288],
        [34.805146, -82.857204],
        [34.805306, -82.857202],
        [34.805586, -82.857171],
        [34.805725, -82.857118],
        [34.805859, -82.857011],
        [34.806043, -82.856812],
        [34.80624, -82.856521],
        [34.806439, -82.85615],
        [34.806656, -82.855636],
        [34.80673, -82.855176],
        [34.806767, -82.854943],
        [34.80679, -82.854565],
        [34.806869, -82.8543],
        [34.806987, -82.853971],
        [34.80712, -82.853726],
        [34.807909, -82.852685],
        [34.808143, -82.852386],
        [34.808272, -82.85216],
        [34.808426, -82.851719],
        [34.808481, -82.851615],
        [34.808595, -82.851689],
        [34.808753, -82.851708],
        [34.809001, -82.851702],
        [34.809428, -82.85165],
        [34.809814, -82.851626],
        [34.810137, -82.851544],
        [34.810268, -82.851473],
        [34.8103, -82.851427],
        [34.810364, -82.851333],
        [34.810485, -82.851061],
        [34.810683, -82.850642],
        [34.810883, -82.85015],
        [34.811038, -82.849713],
        [34.811125, -82.849411],
        [34.811664, -82.848908],
        [34.812177, -82.848469],
        [34.812343, -82.848327],
        [34.812675, -82.848072],
        [34.812779, -82.847992],
        [34.812967, -82.847871],
        [34.81321, -82.847715],
        [34.813864, -82.847294],
        [34.813967, -82.847228],
        [34.814667, -82.846746],
        [34.815467, -82.846038],
        [34.815544, -82.845946],
        [34.815883, -82.845658],
        [34.81641, -82.84519],
        [34.816966, -82.844734],
        [34.817178, -82.844565],
        [34.817383, -82.844402],
        [34.817464, -82.844338],
        [34.817555, -82.84425],
        [34.817666, -82.844133],
        [34.817791, -82.843947],
        [34.818388, -82.842672],
        [34.818488, -82.842395],
        [34.818814, -82.841319],
        [34.818835, -82.841248],
        [34.819142, -82.840358],
        [34.819356, -82.839549],
        [34.819511, -82.839171],
        [34.819694, -82.838944],
        [34.819846, -82.838857],
        [34.820074, -82.838757],
        [34.820493, -82.838483],
        [34.820729, -82.838284],
        [34.820982, -82.838079],
        [34.82129, -82.837764],
        [34.820824, -82.837412],
        [34.820739, -82.837331],
        [34.820637, -82.837235],
        [34.820464, -82.837034],
        [34.820075, -82.83648],
        [34.819772, -82.83611],
        [34.819535, -82.835739],
        [34.819259, -82.8354],
        [34.819035, -82.835091],
        [34.818786, -82.834824],
        [34.818523, -82.834559],
        [34.818298, -82.834332],
        [34.818191, -82.834214],
        [34.817599, -82.833706],
        [34.817513, -82.833627],
        [34.817163, -82.833308],
        [34.8171, -82.83325],
        [34.816595, -82.832803],
        [34.816379, -82.832584],
        [34.816275, -82.832467],
        [34.81608, -82.832226],
        [34.816005, -82.832137],
        [34.815953, -82.832046],
        [34.815725, -82.831497],
        [34.815338, -82.830639],
        [34.815131, -82.830177],
        [34.814979, -82.829845],
        [34.814435, -82.828659],
        [34.814334, -82.828442],
        [34.814175, -82.82819],
        [34.813877, -82.827838],
        [34.813826, -82.827778],
        [34.813794, -82.82774],
        [34.813395, -82.827329],
        [34.812953, -82.826836],
        [34.81252, -82.82642],
        [34.812391, -82.826296],
        [34.812329, -82.82623],
        [34.811547, -82.825385],
        [34.811367, -82.82523],
        [34.811276, -82.825151],
        [34.810979, -82.824854],
        [34.810589, -82.824429],
        [34.81, -82.82381],
        [34.809781, -82.823593],
        [34.809652, -82.823424],
        [34.809391, -82.823118],
        [34.80902, -82.822643],
        [34.808604, -82.822086],
        [34.808411, -82.821779],
        [34.808273, -82.821502],
        [34.808217, -82.821398],
        [34.808118, -82.821156],
        [34.807931, -82.820773],
        [34.807849, -82.820633],
        [34.807622, -82.820422],
        [34.807324, -82.820191],
        [34.806376, -82.819685],
        [34.804732, -82.818781],
        [34.803478, -82.818094],
        [34.802949, -82.817805],
        [34.802615, -82.817624],
        [34.802079, -82.817334],
        [34.801742, -82.817152],
        [34.801179, -82.816829],
        [34.800978, -82.816616],
        [34.800727, -82.816327],
        [34.800411, -82.815887],
        [34.799527, -82.814478],
        [34.799488, -82.814413],
        [34.79887, -82.813386],
        [34.798605, -82.812946],
        [34.798434, -82.812681],
        [34.797944, -82.811924],
        [34.797469, -82.811191],
        [34.797047, -82.810414],
        [34.796912, -82.810102],
        [34.796746, -82.809704],
        [34.796551, -82.809075],
        [34.796328, -82.808296],
        [34.796145, -82.807588],
        [34.79606, -82.80726],
        [34.795711, -82.805943],
        [34.795488, -82.804829],
        [34.79543, -82.804367],
        [34.795371, -82.803802],
        [34.795315, -82.803062],
        [34.795269, -82.802149],
        [34.795183, -82.801012],
        [34.795138, -82.800413],
        [34.795089, -82.800038],
        [34.795042, -82.799641],
        [34.794961, -82.799271],
        [34.794886, -82.798983],
        [34.794749, -82.79862],
        [34.794557, -82.798036],
        [34.794209, -82.797069],
        [34.794049, -82.796649],
        [34.79413, -82.796593],
        [34.794198, -82.796481],
        [34.794292, -82.796301],
        [34.79434, -82.796197],
        [34.794609, -82.795594],
        [34.794692, -82.795487],
        [34.794809, -82.795404],
        [34.794925, -82.795361],
        [34.79509, -82.795351],
        [34.795223, -82.795391],
        [34.795362, -82.79545],
        [34.795478, -82.795554],
        [34.795705, -82.795726],
        [34.796047, -82.796017],
        [34.796478, -82.796319],
        [34.79657, -82.796404],
        [34.796943, -82.796747],
        [34.797096, -82.796994],
        [34.797449, -82.79768],
        [34.797586, -82.797902],
        [34.797699, -82.798041],
        [34.797849, -82.798188],
        [34.797996, -82.798316],
        [34.79822, -82.798456],
        [34.798572, -82.798648],
        [34.798678, -82.798697],
        [34.798813, -82.798745],
        [34.799065, -82.798853],
        [34.799341, -82.798925],
        [34.799485, -82.798953],
        [34.799674, -82.798948],
        [34.799882, -82.798913]
    ]
]
 */