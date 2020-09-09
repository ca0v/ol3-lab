import { TileTree } from "poc/TileTree";
import { get as getProjection } from "@ol/proj";
import Feature from "@ol/Feature";
import { TileTreeExt } from "poc/TileTreeExt";
import Geometry from "@ol/geom/Geometry";
import { getCenter, extend } from "@ol/extent";
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

export function showOnMap(options: { helper: TileTreeExt }) {
  const { helper } = options;
  const tiles = helper.tree
    .descendants()
    .filter((id) => null !== helper.getMass(id));

  const view = new View({
    center: getCenter(helper.tree.asExtent(tiles[0])),
    zoom: helper.minZoom + 1,
    minZoom: helper.minZoom,
    maxZoom: helper.maxZoom,
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

  const totalFeaturesAdded = helper.tree.visit((a, b) => {
    const features = helper.getFeatures(b);
    if (!features) return a;
    source.addFeatures(features);
    console.log(features.map((f) => f.getProperties().Z).join("."));
    return features.length + a;
  }, 0);

  console.log({ totalFeaturesAdded });

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
    const { Z: featureZoom, type, visible, mass } = feature.getProperties() as {
      Z: Z;
      type: string;
      mass: number;
      visible: boolean;
    };
    if (false === visible) return null;
    const currentZoom = Math.round(view.getZoomForResolution(resolution) || 0);
    const zoffset = featureZoom - currentZoom;
    const style = styleMaker({ type, zoffset, mass });
    return style;
  }));

  let touched = true;
  view.on("change:resolution", () => {
    touched = true;
  });
  layer.on("postrender", () => postRender());

  const map = new OlMap({
    view,
    target,
    layers: [layer],
    controls: defaultControls().extend([new FullScreen()]),
  });
  return map;

  function postRender(): any {
    if (!touched) return;
    touched = false;
    const currentZoom = view.getZoom() || 0;

    // ensure only tiles with hidden features are represented on the map
    tileFeatures.forEach((value) =>
      value.setProperties({ visible: false }, true)
    );

    const features = source
      .getFeatures()
      .filter((f) => "feature" === f.getProperties().type);

    // hide all features outside of current zoom
    features.forEach((f) => {
      const featureZoom = f.getProperties().Z;
      const zoffset = featureZoom - currentZoom;
      const visible = MIN_ZOOM_OFFSET <= zoffset && zoffset <= MAX_ZOOM_OFFSET;
      helper.setVisible(f, visible);
    });

    // for each non-visible feature, compute the center of mass of the binding tile
    const hiddenFeatures = features.filter(
      (f) => false === f.getProperties().visible
    );

    hiddenFeatures.forEach((f) => {
      const { tileIdentifier } = f.getProperties() as {
        tileIdentifier: XYZ;
      };

      let targetIdentifier = tileIdentifier;
      if (targetIdentifier.Z < currentZoom + MAX_ZOOM_OFFSET - 2) return;
      while (targetIdentifier.Z > currentZoom + MAX_ZOOM_OFFSET - 2) {
        targetIdentifier = helper.tree.parent(targetIdentifier);
      }

      const mass = helper.centerOfMass(targetIdentifier).mass;
      let feature = getTileFeature(tileFeatures, targetIdentifier);
      if (!feature) {
        feature = new Feature<Geometry>();
        feature.setProperties({
          type: "cluster",
          tileIdentifier: targetIdentifier,
          Z: targetIdentifier.Z,
        });
        setTileFeature(tileFeatures, targetIdentifier, feature);
        source.addFeature(feature);
        const center = helper.tree.asCenter(targetIdentifier);
        feature.setGeometry(new Point(center));
      }

      const visible = !!mass;
      feature.setProperties({ visible, mass }, true);
    });
  }
}
