import { describe, it } from "mocha";
import { getCenter } from "@ol/extent";
import Map from "@ol/Map";
import View from "@ol/View";
import { AgsClusterLayer } from "../AgsClusterLayer";
import { createXYZ } from "@ol/tilegrid";

describe("UI Labs", () => {
  it("renders on a map", () => {
    const view = new View({
      center: getCenter([-11114555, 4696291, -10958012, 4852834]),
      minZoom: 2,
      maxZoom: 15,
      zoom: 7,
    });
    const targetContainer = document.createElement("div");
    targetContainer.className = "testmapcontainer";
    const target = document.createElement("div");
    target.className = "map";
    document.body.appendChild(targetContainer);
    targetContainer.appendChild(target);

    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Petroleum/KSFields/FeatureServer/0/query";

    const tileGrid = createXYZ({ tileSize: 256 });

    const vectorLayer = new AgsClusterLayer({
      url,
      tileGrid,
      maxRecordCount: 1024,
      maxFetchCount: -1,
    });
    const layers = [vectorLayer];
    const map = new Map({ view, target, layers });

    setTimeout(() => {
      targetContainer.remove();
      map.dispose();
    }, 60 * 1000);
  });
});
