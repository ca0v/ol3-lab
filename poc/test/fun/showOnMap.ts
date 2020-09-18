import Feature from "@ol/Feature";
import { TileTreeExt } from "poc/TileTreeExt";
import Geometry from "@ol/geom/Geometry";
import { getCenter, scaleFromCenter, getWidth } from "@ol/extent";
import View from "@ol/View";
import OlMap from "@ol/Map";
import VectorLayer from "@ol/layer/Vector";
import VectorSource from "@ol/source/Vector";
import { Z } from "poc/types/XY";
import { FullScreen, defaults as defaultControls } from "@ol/control";
import { StyleCache } from "./StyleCache";
import { TileView } from "./TileView";

export const MIN_ZOOM_OFFSET = -3;
export const MAX_ZOOM_OFFSET = 4;
export const CLUSTER_ZOOM_OFFSET = 2;

export function showOnMap(options: { helper: TileTreeExt }) {
  const { helper } = options;

  const styles = new StyleCache();

  const tiles = helper.tree
    .descendants()
    .filter((id) => null !== helper.getMass(id));

  const extent = helper.tree.asExtent(tiles[0]);
  const boundingExtent = extent.slice();
  scaleFromCenter(boundingExtent, getWidth(extent) / 4);

  const view = new View({
    center: getCenter(extent),
    zoom: helper.minZoom,
    minZoom: helper.minZoom,
    maxZoom: helper.maxZoom,
    extent: boundingExtent,
  });

  const targetContainer = document.createElement("div");
  targetContainer.className = "testmapcontainer";
  const target = document.createElement("div");
  target.className = "map";
  document.body.appendChild(targetContainer);
  targetContainer.appendChild(target);

  const layer = new VectorLayer();
  const source = new VectorSource<Geometry>();
  layer.setSource(source);

  // load all features into the tree
  helper.tree.descendants().forEach((id) => {
    const features = helper.getFeatures(id);
    if (!features) return;
    source.addFeatures(features);
  });

  const tileView = new TileView({ source, helper });

  layer.setStyle(<any>((feature: Feature<Geometry>, resolution: number) => {
    const { Z: featureZoom, type, mass } = feature.getProperties() as {
      Z: Z;
      type: string;
      mass: number;
    };
    const currentZoom = Math.round(view.getZoomForResolution(resolution) || 0);
    const zoffset = featureZoom - currentZoom;
    return styles.styleMaker({ type, zoffset, mass });
  }));

  {
    let touched = true;
    view.on("change:resolution", () => {
      touched = true;
    });
    layer.on("postrender", () => {
      if (!touched) return;
      touched = false;
      tileView.computeTileVisibility(view.getZoom() || 0);
    });
  }

  const map = new OlMap({
    view,
    target,
    layers: [layer],
    controls: defaultControls().extend([new FullScreen()]),
  });
  tileView.computeTileVisibility(view.getZoom() || 0);
  return map;
}
