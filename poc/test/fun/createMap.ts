import { getCenter, scaleFromCenter, getWidth } from "@ol/extent";
import View from "@ol/View";
import OlMap from "@ol/Map";
import { FullScreen, defaults as defaultControls } from "@ol/control";

export function createMap(options: {
  targetContainer: HTMLElement;
  extent: number[];
  minZoom: number;
  maxZoom: number;
}) {
  const { targetContainer, extent, minZoom, maxZoom } = options;
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

  const target = document.createElement("div");
  target.className = "map";
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
