import Feature from "@ol/Feature";
import { TileTreeExt } from "poc/TileTreeExt";
import Geometry from "@ol/geom/Geometry";
import VectorLayer from "@ol/layer/Vector";
import VectorSource from "@ol/source/Vector";
import type { Z } from "poc/types/XY";
import { StyleCache } from "./StyleCache";
import { TileView } from "./TileView";
import { createMap } from "./createMap";

function isFeatureVisible(f: Feature<Geometry>) {
  return true === f.get("visible");
}

interface ShowOnMapOptions {
  caption: string;
  helper: TileTreeExt;
  zoffset: [number, number]; // how small should the features get before hiding them?  how large should they get before hiding them?
}

const DEFAULT_OPTIONS: Partial<ShowOnMapOptions> = {
  caption: "Untitled",
  zoffset: [-3, 4],
};

export function showOnMap(
  inOptions: Partial<ShowOnMapOptions> & { helper: TileTreeExt }
) {
  let options = { ...DEFAULT_OPTIONS, ...inOptions } as ShowOnMapOptions;
  const { helper } = options;
  const { tree } = helper;

  const styles = new StyleCache();

  const tiles = tree.descendants().filter((id) => null !== helper.getMass(id));

  const extent = tree.asExtent(tiles[0]);

  const figure = document.createElement("figure");
  const caption = document.createElement("figcaption");
  caption.innerText = options.caption;
  figure.appendChild(caption);
  const targetContainer = document.createElement("div");
  targetContainer.className = "testmapcontainer";
  figure.appendChild(targetContainer);
  document.body.appendChild(figure);

  const map = createMap({
    targetContainer,
    extent,
    minZoom: helper.minZoom,
    maxZoom: helper.maxZoom,
  });

  map.on("change:caption", () => {
    caption.innerText = map.get("caption");
  });

  const view = map.getView();

  const layer = new VectorLayer();
  const source = new VectorSource<Geometry>();
  layer.setSource(source);

  // so unit tests can explore the tile features
  map.set("tile-source", source);

  // load all features on the tree into the source
  tree.descendants().forEach((id) => {
    const features = helper.getFeatures(id);
    if (!features) return;
    source.addFeatures(features);
  });

  const tileView = new TileView({
    source,
    helper,
    MIN_ZOOM_OFFSET: options.zoffset[0],
    MAX_ZOOM_OFFSET: options.zoffset[1],
  });

  layer.setStyle(<any>((feature: Feature<Geometry>, resolution: number) => {
    if (!isFeatureVisible(feature)) return null;
    const featureZoom = feature.get("Z") as Z;
    const type = feature.get("type") as string;
    const mass = feature.get("mass") as number;
    const text = feature.get("text") as string;
    const currentZoom = Math.round(view.getZoomForResolution(resolution) || 0);
    const zoffset = featureZoom - currentZoom;
    const style = styles.styleMaker({ type, zoffset, mass, text });
    return style;
  }));

  map.addLayer(layer);

  // update tile visibility now and each time the resolution changes
  tileView.computeTileVisibility(view.getZoom() || 0);
  layer.on("postrender", () => {
    tileView.computeTileVisibility(view.getZoom() || 0);
  });

  return map;
}
