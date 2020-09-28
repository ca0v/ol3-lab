import { getCenter, scaleFromCenter, getWidth } from "@ol/extent";
import View from "@ol/View";
import OlMap from "@ol/Map";
import { FullScreen, defaults as defaultControls } from "@ol/control";

export function createMap(extent: number[], minZoom: number, maxZoom: number) {
  // buffer around the first cluster tile
  const boundingExtent = extent.slice();
  scaleFromCenter(boundingExtent, getWidth(extent) / 4);

  const view = new View({
    center: getCenter(extent),
    zoom: minZoom,
    minZoom: minZoom,
    maxZoom: maxZoom,
    extent: boundingExtent,
  });

  const targetContainer = document.createElement("div");
  targetContainer.className = "testmapcontainer";
  const target = document.createElement("div");
  target.className = "map";
  document.body.appendChild(targetContainer);
  targetContainer.appendChild(target);

  // zoomDuration needs to be reduced
  const map = new OlMap({
    view,
    target,
    layers: [],
    controls: defaultControls().extend([new FullScreen()]),
  });

  return map;
}
