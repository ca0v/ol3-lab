import { TileTree } from "poc/TileTree";
import { get as getProjection } from "@ol/proj";
import Feature from "@ol/Feature";
import { TileTreeExt } from "poc/TileTreeExt";
import Geometry from "@ol/geom/Geometry";
import { getCenter, extend, scaleFromCenter, getWidth } from "@ol/extent";
import View from "@ol/View";
import OlMap from "@ol/Map";
import VectorLayer from "@ol/layer/Vector";
import VectorSource from "@ol/source/Vector";
import { Style, Fill, Stroke } from "@ol/style";
import { XY, Z } from "poc/types/XY";
import { XYZ } from "poc/types/XYZ";
import Point from "@ol/geom/Point";
import Circle from "@ol/style/Circle";
import Text from "@ol/style/Text";
import { FullScreen, defaults as defaultControls } from "@ol/control";
const MIN_ZOOM_OFFSET = -3;
const MAX_ZOOM_OFFSET = 4;
const CLUSTER_ZOOM_OFFSET = 2;

function setTileFeature(
  tileFeatures: Map<string, Feature<Geometry>>,
  { X, Y, Z }: XYZ,
  feature: Feature<Geometry>
) {
  const key = `${X}.${Y}.${Z}`;
  tileFeatures.set(key, feature);
}

function getTileFeature(
  tileFeatures: Map<string, Feature<Geometry>>,
  { X, Y, Z }: XYZ
) {
  const key = `${X}.${Y}.${Z}`;
  return tileFeatures.get(key);
}

// hide all features outside of current zoom
function isFeatureVisible(f: Feature<Geometry>, Z: Z) {
  const featureZoom = f.getProperties().Z as Z;
  const type = f.getProperties().type as string;
  const zoffset = featureZoom - Z;
  switch (type) {
    case "feature":
      return MIN_ZOOM_OFFSET <= zoffset && zoffset <= MAX_ZOOM_OFFSET;
    case "cluster":
      return CLUSTER_ZOOM_OFFSET <= zoffset && zoffset <= CLUSTER_ZOOM_OFFSET;
  }
  return true;
}

export function showOnMap(options: { helper: TileTreeExt }) {
  const { helper } = options;
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

  helper.tree.visit((a, b) => {
    const features = helper.getFeatures(b);
    if (!features) return a;
    source.addFeatures(features);
    console.log(features.map((f) => f.getProperties().Z).join("."));
    return features.length + a;
  }, 0);

  const styleCache = {} as any;
  const tileFeatures = new Map<string, Feature<Geometry>>();

  const styleMaker = ({
    type,
    zoffset,
    mass,
  }: {
    type: string;
    zoffset: number;
    mass: number;
  }) => {
    const massLevel = Math.floor(Math.pow(2, Math.floor(Math.log2(mass))));
    const styleKey = `${type}.${zoffset}.${massLevel}`;
    // zoffset increases as feature gets larger
    let style = styleCache[styleKey] as Style;
    if (!style) {
      switch (type) {
        case "cluster": {
          style = new Style({
            image: new Circle({
              radius: 0.5 * (64 * Math.pow(2, -zoffset)),
              fill: new Fill({
                color: `rgba(255,255,255,${0.05})`,
              }),
              stroke: new Stroke({
                color: `rgba(0,0,0,${0.05})`,
                width: 0.5 * (64 * Math.pow(2, -zoffset)),
              }),
            }),
            text: new Text({
              text: (mass ? mass : "") + "",
              scale: 0.5,
              fill: new Fill({ color: `rgba(255,255,255,${0.8})` }),
              stroke: new Stroke({
                color: `rgba(0,0,0,${0.8})`,
                width: 1,
              }),
            }),
          });
          break;
        }
        default: {
          const opacity = 0.8 * Math.pow(Math.SQRT2, -Math.abs(zoffset));
          style = new Style({
            fill: new Fill({ color: `rgba(0,0,255,${opacity})` }),
            stroke: new Stroke({
              color: `rgba(255,255,255,${opacity})`,
              width: 1,
            }),
          });
          break;
        }
      }
      styleCache[styleKey] = style;
    }
    switch (type) {
      case "cluster": {
        if (style.getText()) {
          style.getText().setText(mass + "");
        }
        break;
      }
    }
    return style;
  };

  layer.setStyle(<any>((feature: Feature<Geometry>, resolution: number) => {
    const { Z: featureZoom, type, mass } = feature.getProperties() as {
      Z: Z;
      type: string;
      mass: number;
    };
    const currentZoom = Math.round(view.getZoomForResolution(resolution) || 0);
    if (!isFeatureVisible(feature, currentZoom)) return null;
    const zoffset = featureZoom - currentZoom;
    const style = styleMaker({ type, zoffset, mass });
    return style;
  }));

  {
    let touched = true;
    view.on("change:resolution", () => {
      touched = true;
    });
    layer.on("postrender", () => {
      if (!touched) return;
      touched = false;
      postRender();
    });
  }

  const map = new OlMap({
    view,
    target,
    layers: [layer],
    controls: defaultControls().extend([new FullScreen()]),
  });
  postRender();
  return map;

  function postRender(): any {
    const currentZoom = view.getZoom() || 0;

    // hide features
    source.getFeatures().forEach((f) => {
      const { tileIdentifier } = f.getProperties() as {
        tileIdentifier: XYZ;
      };

      f.setProperties({ visible: isFeatureVisible(f, currentZoom) });
      updateCluster(tileIdentifier, currentZoom);
    });
  }

  function updateCluster(tileIdentifier: XYZ, Z: Z) {
    const mass = helper.centerOfMass(tileIdentifier).mass;
    let feature = getTileFeature(tileFeatures, tileIdentifier);
    if (!feature) {
      feature = new Feature<Geometry>();
      feature.setProperties({
        type: "cluster",
        tileIdentifier: tileIdentifier,
        Z: tileIdentifier.Z,
        visible: false,
      });
      setTileFeature(tileFeatures, tileIdentifier, feature);
      source.addFeature(feature);
      const center = helper.tree.asCenter(tileIdentifier);
      feature.setGeometry(new Point(center));
    }

    feature.setProperties({ mass }, true);
  }
}
