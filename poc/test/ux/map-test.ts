import { describe, it } from "mocha";
import { getCenter } from "@ol/extent";
import Map from "@ol/Map";
import View from "@ol/View";
import { AgsClusterLayer } from "poc/AgsClusterLayer";
import { debounce } from "poc/fun/debounce";
import { TileTreeTersifier } from "poc/TileTreeTersifier";
import { treeTileState } from "../data/treetilestate";

describe("UI Labs", () => {
  it("renders cluster layer on a map and continually cycles through the zoom levels", () => {
    const view = new View({
      center: getCenter([-11114555, 4696291, -10958012, 4852834]),
      minZoom: 0,
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
      maxDepth: 4,
      minRecordCount: 1000,
      minZoom: view.getMinZoom(),
      maxZoom: view.getMinZoom(),
    });
    const layers = [vectorLayer];
    const map = new Map({ view, target, layers });
    const caption = document.createElement("label");
    caption.innerText = "Autonomous Petroleum";
    targetContainer.parentElement!.insertBefore(caption, targetContainer);

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
    }, 200000);

    const closer = debounce(() => {
      clearInterval(h);
    }, 30 * 1000);

    view.on("change:resolution", closer);
    view.on("change:center", closer);
    view.on("change:rotation", closer);

    closer();
  });

  it("sets map state into pre-loaded data from data/treetilestate", () => {
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
      minRecordCount: 100,
      maxDepth: 4,
      treeTileState: decoder.unstringify(JSON.stringify(treeTileState)),
      minZoom: view.getMinZoom(),
      maxZoom: view.getMaxZoom(),
    });

    const layers = [vectorLayer];
    const map = new Map({ view, target, layers });
    const caption = document.createElement("label");
    caption.innerText = "Petroleum";
    targetContainer.parentElement!.insertBefore(caption, targetContainer);
  });
});
