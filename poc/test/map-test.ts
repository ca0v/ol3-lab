import { describe, it } from "mocha";
import { getCenter } from "@ol/extent";
import Map from "@ol/Map";
import View from "@ol/View";
import { AgsClusterLayer } from "../AgsClusterLayer";
import { debounce } from "poc/fun/debounce";
import { TileTreeTersifier } from "../TileTreeTersifier";
import { treeTileState } from "./data/treetilestate";

describe("UI Labs", () => {
  it("renders on a map", () => {
    const view = new View({
      center: getCenter([-11114555, 4696291, -10958012, 4852834]),
      minZoom: 3,
      maxZoom: 9,
      zoom: 6,
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
      minRecordCount: 100,
    });
    const layers = [vectorLayer];
    const map = new Map({ view, target, layers });

    let automatedScaleDirection = 1;
    const h = setInterval(() => {
      const z = view.getZoom() || 0;
      view.setZoom(z + automatedScaleDirection);
      if (z === view.getMaxZoom()) {
        automatedScaleDirection = -1;
      }
      if (z === view.getMinZoom()) {
        automatedScaleDirection = 1;
      }
    }, 2000);

    const closer = debounce(() => {
      clearInterval(h);
      targetContainer.remove();
      map.dispose();
    }, 30 * 1000);

    view.on("change:resolution", closer);
    view.on("change:center", () => {
      closer();
      clearInterval(h);
    });
    view.on("change:rotation", closer);

    closer();
  });

  it("sets map state into local storage", () => {
    const view = new View({
      center: getCenter([-11114555, 4696291, -10958012, 4852834]),
      minZoom: 3,
      maxZoom: 9,
      zoom: 6,
    });

    const targetContainer = document.createElement("div");
    targetContainer.className = "testmapcontainer";
    const target = document.createElement("div");
    target.className = "map";
    document.body.appendChild(targetContainer);
    targetContainer.appendChild(target);

    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Petroleum/KSFields/FeatureServer/0/query";

    const decoder = new TileTreeTersifier();

    const vectorLayer = new AgsClusterLayer({
      url,
      tileSize: 256,
      maxRecordCount: 1024,
      minRecordCount: 100,
      treeTileState: decoder.unstringify(JSON.stringify(treeTileState)),
    });

    const layers = [vectorLayer];
    const map = new Map({ view, target, layers });
  });
});
