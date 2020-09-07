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

export function showOnMap(options: { features: Feature<Geometry>[] }) {
  const { features } = options;
  if (!features.length) throw "cannot get extent";
  const feature1 = features[0];
  const extent = feature1.getGeometry()!.getExtent();
  features.forEach((f) => extend(extent, f.getGeometry()!.getExtent()));

  const projection = getProjection("EPSG:3857");
  const tree = new TileTree<any>({ extent: projection.getExtent() });
  const helper = new TileTreeExt(tree);
  const rootTileIdentifier = helper.findByExtent(extent);

  const view = new View({
    center: getCenter(extent),
    zoom: rootTileIdentifier.Z,
    minZoom: rootTileIdentifier.Z - 3,
    maxZoom: rootTileIdentifier.Z + 6,
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
  source.addFeatures(features);

  const styleCache = {} as any;
  const tileFeatures = new Map<XYZ, Feature<Geometry>>();

  const styleMaker = ({
    type,
    zoffset,
    mass,
  }: {
    type: string;
    zoffset: number;
    mass: number;
  }) => {
    const styleKey = `${type}${zoffset}`;
    // zoffset increases as feature gets larger
    let style = styleCache[styleKey] as Style;
    if (!style) {
      switch (type) {
        case "cluster": {
          style = new Style({
            image: new Circle({
              radius: 5 + 3 * Math.sqrt(mass),
              fill: new Fill({ color: "rgba(0,0,0,0.5)" }),
              stroke: new Stroke({ color: "rgba(255,255,255,0.5)", width: 1 }),
            }),
            text: new Text({ text: (mass ? mass : "") + "" }),
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
    const currentZoom = view.getZoomForResolution(resolution) || 0;
    const zoffset = featureZoom - currentZoom;
    const style = styleMaker({ type: type || "feature", zoffset, mass });
    feature.setProperties({ visible: !!style }, true);
    return style;
  }));

  layer.on("postrender", () => {
    const currentZoom = view.getZoom() || 0;

    // ensure only tiles with hidden features are represented on the map
    tileFeatures.forEach((value, key) =>
      value.setProperties({ visible: false }, true)
    );

    // hide all features outside of current zoom
    features.forEach((f) => {
      const featureZoom = f.getProperties().Z;
      const zoffset = featureZoom - currentZoom;
      const visible = -3 < zoffset && zoffset < 4;
      f.setProperties({ visible }, true);
    });

    // for each non-visible feature, compute the center of mass of the binding tile
    const hiddenFeatures = features.filter(
      (f) => false === f.getProperties().visible
    );

    hiddenFeatures.forEach((f) => {
      const { XYZ } = f.getProperties() as {
        XYZ: XYZ;
      };

      const mass = helper.centerOfMass(XYZ).mass;
      let feature = tileFeatures.get(XYZ);
      if (!feature) {
        feature = new Feature<Geometry>();
        feature.setProperties({ type: "cluster" });
        tileFeatures.set(XYZ, feature);
        source.addFeature(feature);
        const center = tree.asCenter(XYZ);
        feature.setGeometry(new Point(center));
      }
      const visible = !helper.centerOfMass(tree.parent(XYZ)).mass;
      feature.setProperties({ visible, mass, XYZ }, true);
    });
  });

  const map = new OlMap({ view, target, layers: [layer] });
  return map;
}
