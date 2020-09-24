import Feature from "@ol/Feature";
import { TileTreeExt } from "poc/TileTreeExt";
import Geometry from "@ol/geom/Geometry";
import VectorSource from "@ol/source/Vector";
import { Z } from "poc/types/XY";
import { XYZ } from "poc/types/XYZ";
import Point from "@ol/geom/Point";
import { TINY } from "poc/fun/tiny";

const MIN_ZOOM_OFFSET = -4;
const MAX_ZOOM_OFFSET = 3;
const MIN_CLUSTER_ZOOM_OFFSET = 1 + TINY;
const MAX_CLUSTER_ZOOM_OFFSET = 2;

function isFeatureVisible(f: Feature<Geometry>) {
  return true === f.getProperties().visible;
}

function setFeatureVisible(f: Feature<Geometry>, visible: boolean) {
  f.setProperties({ visible });
}

export class TileView {
  private source: VectorSource<Geometry>;
  private helper: TileTreeExt;
  private tileFeatures = new Map<string, Feature<Geometry>>();

  constructor(options: {
    source: VectorSource<Geometry>;
    helper: TileTreeExt;
  }) {
    this.source = options.source;
    this.helper = options.helper;
    // create a feature for each cluster tile
    const tilesWithMass = this.helper.tree
      .descendants()
      .filter((id) => !!this.helper.centerOfMass(id).mass);
    tilesWithMass.forEach((id) => this.updateCluster(id));
  }

  computeTileVisibility(currentZoom: Z) {
    // recompute visibility of all features
    this.source.getFeatures().forEach((f) => {
      const { tileIdentifier } = f.getProperties() as {
        tileIdentifier: XYZ;
      };

      const wasVisible = isFeatureVisible(f);
      const isVisible = this.isFeatureVisible(f, currentZoom);

      if (wasVisible !== isVisible) {
        setFeatureVisible(f, isVisible);
        this.helper.setStale(tileIdentifier, true);
      }
    });

    // feature visibility effects these tiles and any parent tiles
    const staleTiles = this.helper.tree
      .descendants()
      .filter((id) => this.helper.isStale(id));

    staleTiles.forEach((id) => {
      if (!this.helper.isStale(id)) return;
      this.updateCluster(id);
    });
  }

  private updateCluster(tileIdentifier: XYZ) {
    let feature = this.getTileFeature(tileIdentifier);
    if (!feature) {
      feature = new Feature<Geometry>();
      feature.setProperties({
        type: "cluster",
        tileIdentifier: tileIdentifier,
        Z: tileIdentifier.Z,
        visible: true,
      });
      this.setTileFeature(tileIdentifier, feature);
      this.source.addFeature(feature);
    }

    const { mass, center, featureMass } = this.helper.centerOfMass(
      tileIdentifier
    );
    feature.setProperties({ mass: mass, text: `${featureMass},${mass}` }, true);
    feature.setGeometry(new Point(center));
  }

  private setTileFeature({ X, Y, Z }: XYZ, feature: Feature<Geometry>) {
    const key = `${X}.${Y}.${Z}`;
    this.tileFeatures.set(key, feature);
  }

  private getTileFeature({ X, Y, Z }: XYZ) {
    const key = `${X}.${Y}.${Z}`;
    return this.tileFeatures.get(key);
  }

  // hide all features outside of current zoom
  private isFeatureVisible(f: Feature<Geometry>, Z: Z) {
    const featureZoom = f.getProperties().Z as Z;
    const { type, mass } = f.getProperties() as {
      type: string;
      mass: number;
    };
    const zoffset = Z - featureZoom; // larger means the feature is larger on the screen
    switch (type) {
      case "feature":
        return MIN_ZOOM_OFFSET <= zoffset && zoffset <= MAX_ZOOM_OFFSET;
      case "cluster":
        return true;
        if (!mass) return false;
        return (
          MIN_CLUSTER_ZOOM_OFFSET <= zoffset &&
          zoffset <= MAX_CLUSTER_ZOOM_OFFSET
        );
    }
    return true;
  }
}
