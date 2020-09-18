import Feature from "@ol/Feature";
import { TileTreeExt } from "poc/TileTreeExt";
import Geometry from "@ol/geom/Geometry";
import VectorSource from "@ol/source/Vector";
import { Z } from "poc/types/XY";
import { XYZ } from "poc/types/XYZ";
import Point from "@ol/geom/Point";
import {
  MIN_ZOOM_OFFSET,
  MAX_ZOOM_OFFSET,
  CLUSTER_ZOOM_OFFSET,
} from "./showOnMap";
import { TileHash } from "./TileHash";

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
  private tileHash = new TileHash();

  constructor(options: {
    source: VectorSource<Geometry>;
    helper: TileTreeExt;
  }) {
    this.source = options.source;
    this.helper = options.helper;
  }

  computeTileVisibility(currentZoom: Z) {
    this.tileHash.clear();
    // recompute visibility of all features
    this.source.getFeatures().forEach((f) => {
      const { tileIdentifier } = f.getProperties() as {
        tileIdentifier: XYZ;
      };

      const wasVisible = isFeatureVisible(f);
      const isVisible = this.isFeatureVisible(f, currentZoom);

      if (wasVisible !== isVisible) {
        setFeatureVisible(f, isVisible);
        this.tileHash.add(tileIdentifier);
      }
    });

    const staleTiles = this.tileHash.items();
    console.log(staleTiles);
    staleTiles.forEach((id) => this.updateCluster(id, currentZoom));
  }

  private updateCluster(tileIdentifier: XYZ, Z: Z) {
    const mass = this.helper.centerOfMass(tileIdentifier).mass;
    let feature = this.getTileFeature(tileIdentifier);
    if (!feature) {
      feature = new Feature<Geometry>();
      feature.setProperties({
        type: "cluster",
        tileIdentifier: tileIdentifier,
        Z: tileIdentifier.Z,
        visible: false,
      });
      this.setTileFeature(tileIdentifier, feature);
      this.source.addFeature(feature);
      const center = this.helper.tree.asCenter(tileIdentifier);
      feature.setGeometry(new Point(center));
    }

    feature.setProperties({ mass }, true);
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
}
