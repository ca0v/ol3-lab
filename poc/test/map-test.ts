import { describe, it } from "mocha";
import { getCenter } from "@ol/extent";
import Map from "@ol/Map";
import View from "@ol/View";
import { AgsClusterLayer } from "../AgsClusterLayer";
import { debounce } from "poc/fun/debounce";

// TODO:run through a tersifier
const treestate = `[[2,9,4,{"count":10490,"center":[-11897270.578531114,3162020.054618182]}],[2,10,4,{"count":-3,"center":[-11897270.578531114,5635549.221409475]}],[3,9,4,{"count":6918,"center":[-11271098.44281895,3757032.814272982]}],[3,10,4,{"count":-8,"center":[-11329802.080541965,5498574.06672244]}],[4,9,4,{"count":0,"center":[-8766409.899970293,3757032.814272982]}],[4,10,4,{"count":0,"center":[-8766409.899970293,6261721.35712164]}],[6,18,5,{"count":10226,"center":[-11180350.63281255,4070118.8821290666]}],[6,19,5,{"count":267,"center":[-11897270.578531114,4383204.949985148]}],[6,20,5,{"count":-3,"center":[-11218917.431509601,5270282.142244047]}],[7,18,5,{"count":6595,"center":[-10958012.374962866,4070118.8821290666]}],[7,19,5,{"count":6658,"center":[-10644926.307106785,4383204.949985148]}],[7,20,5,{"count":-2,"center":[-11036283.891926887,5244191.6365893725]}],[8,18,5,{"count":0,"center":[-9392582.035682458,3130860.678560818]}],[8,19,5,{"count":0,"center":[-9392582.035682458,4383204.949985148]}],[8,20,5,{"count":0,"center":[-9392582.035682458,5635549.221409475]}],[13,38,6,{"count":3631,"center":[-11138763.31678146,4532957.698084582]}],[13,39,6,{"count":267,"center":[-11584184.510675032,4696291.017841228]}],[13,40,6,{"count":-1,"center":[-11114555.408890907,5165920.119625352]}],[14,38,6,{"count":6595,"center":[-10989593.952922117,4518040.841452657]}],[14,39,6,{"count":6364,"center":[-10958012.374962866,4696291.017841228]}],[14,40,6,{"count":-1,"center":[-11114555.408890907,5165920.119625352]}],[15,38,6,{"count":0,"center":[-10331840.239250705,4070118.8821290666]}],[15,39,6,{"count":306,"center":[-10331840.239250705,4696291.017841228]}],[15,40,6,{"count":0,"center":[-10331840.239250705,5322463.153553394]}],[27,77,7,{"count":315,"center":[-11192826.925854929,4461476.466949167]}],[27,78,7,{"count":202,"center":[-11427641.476746991,4539747.983913187]}],[27,79,7,{"count":66,"center":[-11427641.476746991,4852834.051769268]}],[27,80,7,{"count":0,"center":[-11427641.476746991,5165920.119625352]}],[28,77,7,{"count":1406,"center":[-11014016.035038121,4461476.466949167]}],[28,78,7,{"count":3114,"center":[-11114555.408890907,4539747.983913187]}],[28,79,7,{"count":1608,"center":[-11114555.408890907,4852834.051769268]}],[28,80,7,{"count":-1,"center":[-11114555.408890907,5165920.119625352]}],[29,77,7,{"count":938,"center":[-10809146.291525967,4461476.466949167]}],[29,78,7,{"count":1652,"center":[-10801469.341034826,4539747.983913187]}],[29,79,7,{"count":51,"center":[-10801469.341034826,4852834.051769268]}],[29,80,7,{"count":0,"center":[-10801469.341034826,5165920.119625352]}],[30,77,7,{"count":0,"center":[-10488383.273178745,4226661.916057106]}],[30,78,7,{"count":213,"center":[-10488383.273178745,4539747.983913187]}],[30,79,7,{"count":101,"center":[-10488383.273178745,4852834.051769268]}],[30,80,7,{"count":0,"center":[-10488383.273178745,5165920.119625352]}],[56,156,8,{"count":315,"center":[-11192826.925854929,4461476.466949167]}],[56,157,8,{"count":812,"center":[-11192826.925854929,4618019.500877207]}],[56,158,8,{"count":590,"center":[-11192826.925854929,4774562.534805248]}],[56,159,8,{"count":49,"center":[-11192826.925854929,4931105.568733292]}],[57,156,8,{"count":576,"center":[-11036283.891926888,4461476.466949167]}],[57,157,8,{"count":1447,"center":[-11036283.891926888,4618019.500877207]}],[57,158,8,{"count":982,"center":[-11036283.891926888,4774562.534805248]}],[57,159,8,{"count":8,"center":[-11036283.891926888,4931105.568733292]}],[58,156,8,{"count":515,"center":[-10879740.857998848,4461476.466949167]}],[58,157,8,{"count":472,"center":[-10879740.857998848,4618019.500877207]}],[59,156,8,{"count":423,"center":[-10723197.824070806,4461476.466949167]}],[59,157,8,{"count":292,"center":[-10723197.824070806,4618019.500877207]}],[114,314,9,{"count":185,"center":[-11075419.650408898,4578883.742395197]}],[114,315,9,{"count":384,"center":[-11075419.650408898,4657155.259359219]}],[115,314,9,{"count":468,"center":[-10997148.13344488,4578883.742395197]}],[115,315,9,{"count":442,"center":[-10997148.13344488,4657155.259359219]}]]`;

describe("UI Labs", () => {
  it("renders on a map", () => {
    const view = new View({
      center: getCenter([-11114555, 4696291, -10958012, 4852834]),
      minZoom: 1,
      maxZoom: 10,
      zoom: 4,
    });
    const targetContainer = document.createElement("div");
    targetContainer.className = "testmapcontainer";
    const target = document.createElement("div");
    target.className = "map";
    document.body.appendChild(targetContainer);
    targetContainer.appendChild(target);

    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Petroleum/KSFields/FeatureServer/0/query";

    const vectorLayer = new AgsClusterLayer({
      url,
      tileSize: 256,
      maxRecordCount: 1024,
      maxFetchCount: -1,
      // not sure how to manage this...
      // probably need to provider tersifier for read/write and layer identifier
      treeTileState: [], //JSON.parse(treestate),
    });
    const layers = [vectorLayer];
    const map = new Map({ view, target, layers });

    const closer = debounce(() => {
      targetContainer.remove();
      map.dispose();
    }, 10 * 1000);

    view.on("change:resolution", closer);
    view.on("change:center", closer);
    view.on("change:rotation", closer);

    closer();
  });
});
