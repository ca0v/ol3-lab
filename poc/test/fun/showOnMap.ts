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
  return true === f.getProperties().visible;
}

export function showOnMap(options: { helper: TileTreeExt }) {
  const { helper } = options;
  const { tree } = helper;

  const styles = new StyleCache();

  const tiles = tree.descendants().filter((id) => null !== helper.getMass(id));

  const extent = tree.asExtent(tiles[0]);

  const map = createMap(extent, helper.minZoom, helper.maxZoom);
  const view = map.getView();

  const layer = new VectorLayer();
  const source = new VectorSource<Geometry>();
  layer.setSource(source);

  // load all features on the tree into the source
  tree.descendants().forEach((id) => {
    const features = helper.getFeatures(id);
    if (!features) return;
    source.addFeatures(features);
  });

  const tileView = new TileView({ source, helper });

  layer.setStyle(<any>((feature: Feature<Geometry>, resolution: number) => {
    if (!isFeatureVisible(feature)) return null;
    const { Z: featureZoom, type, mass, text } = feature.getProperties() as {
      Z: Z;
      type: string;
      mass: number;
      text: string;
    };
    const currentZoom = Math.round(view.getZoomForResolution(resolution) || 0);
    const zoffset = featureZoom - currentZoom;
    const style = styles.styleMaker({ type, zoffset, mass, text });
    return style;
  }));

  map.addLayer(layer);

  // update tile visibility now and each time the resolution changes
  tileView.computeTileVisibility(view.getZoom() || 0);
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

  view.on("hack:refresh-all-labels", () => {
    // tiles are not reflecting the backing data...trying to understand why..computeTileVisibility was only updating root tile
    tree.descendants().forEach((id) => helper.setStale(id, true));
    tileView.computeTileVisibility(view.getZoom() || 0);
  });

  return map;
}
