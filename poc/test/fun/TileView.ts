import Feature from "@ol/Feature";
import { TileTreeExt } from "poc/TileTreeExt";
import Geometry from "@ol/geom/Geometry";
import VectorSource from "@ol/source/Vector";
import { Z } from "poc/types/XY";
import { XYZ } from "poc/types/XYZ";
import Point from "@ol/geom/Point";

interface TileViewOptions {
  source: VectorSource<Geometry>;
  helper: TileTreeExt;
  MIN_ZOOM_OFFSET: number;
  MAX_ZOOM_OFFSET: number;
  clusterOffset: number;
}

const DEFAULT_OPTIONS: Partial<TileViewOptions> = {
  MIN_ZOOM_OFFSET: -4,
  MAX_ZOOM_OFFSET: 3,
  clusterOffset: 1,
};

/**
 * This class was intended as a POC for rendering pre-fetched data to work out the rendering
 * logic and default configuration values but I have been having so must trouble getting the
 * POC working that I am having to write tests even for these throw-away classes.
 * I feel like it is time to start over?
 */
export class TileView {
  private source: VectorSource<Geometry>;
  private helper: TileTreeExt;
  private tileFeatures = new Map<string, Feature<Geometry>>();

  private options: TileViewOptions;

  constructor(
    options: Partial<TileViewOptions> & {
      source: VectorSource<Geometry>;
      helper: TileTreeExt;
    }
  ) {
    this.options = { ...DEFAULT_OPTIONS, ...options } as TileViewOptions;

    this.source = options.source;
    this.helper = options.helper;

    // create a feature for each cluster tile
    const tilesWithMass = this.helper.tree
      .descendants()
      .filter((id) => !!this.helper.centerOfMass(id).mass);
    tilesWithMass.forEach((id) => this.updateCluster(id));
  }

  // creates cluster features, updates symbology info for the cluster
  public computeTileVisibility(currentZoom: Z) {
    // recompute visibility of all features
    this.source.getFeatures().forEach((f) => {
      const tileIdentifier = f.get("tileIdentifier") as XYZ;
      if (!tileIdentifier) throw "tileIdentifier expected";
      const isVisible = f.get("visible") as boolean;

      const willBecomeVisible = this.isFeatureVisible(f, currentZoom);

      if (isVisible !== willBecomeVisible) {
        f.set("visible", willBecomeVisible);
        this.helper.setStale(tileIdentifier, true);
      }
    });

    // feature visibility effects these tiles and any parent tiles
    const staleTiles = this.helper.tree
      .descendants()
      .filter((id) => this.helper.isStale(id));

    staleTiles.forEach((id) => {
      this.updateCluster(id);
    });
  }

  private updateCluster(tileIdentifier: XYZ) {
    let feature = this.forceClusterFeature(tileIdentifier);

    const { mass, center, childMass } = this.helper.centerOfMass(
      tileIdentifier
    );
    feature.set("mass", Math.max(0, mass));

    let geom = feature.getGeometry() as Point;
    if (geom) {
      const oldCoordinates = geom.getCoordinates();
      if (!center.every((v, i) => v === oldCoordinates[i])) {
        geom.setCoordinates(center);
      }
    } else {
      feature.setGeometry(new Point(center));
    }
  }

  private forceClusterFeature(tileIdentifier: XYZ) {
    let feature = this.getTileFeature(tileIdentifier);
    if (!feature) {
      feature = new Feature<Geometry>();
      feature.setProperties({
        type: "cluster",
        tileIdentifier: tileIdentifier,
        Z: tileIdentifier.Z,
      });
      this.setTileFeature(tileIdentifier, feature);
      this.source.addFeature(feature);
    }
    return feature;
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
    const featureZoom = f.get("Z") as Z;
    const type = f.get("type") as string;
    const mass = f.get("mass") as string;

    const zoffset = Z - featureZoom; // larger means the feature is larger on the screen
    switch (type) {
      case "feature":
        return (
          this.options.MIN_ZOOM_OFFSET <= zoffset &&
          zoffset <= this.options.MAX_ZOOM_OFFSET
        );
      case "cluster":
        // if no mass do not render this cluster
        if (!mass) return false;
        // only render clusters for a given zoom level and no others
        const magic = this.options.MIN_ZOOM_OFFSET + this.options.clusterOffset;
        return magic <= zoffset && zoffset < magic + 1;
    }
    return true;
  }
}
