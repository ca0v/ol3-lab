import { Extent, getCenter } from "@ol/extent";
import { Projection } from "@ol/proj";
import { TileTree } from "./TileTree";
import Geometry from "@ol/geom/Geometry";
import { FeatureServiceProxy } from "./FeatureServiceProxy";
import { removeAuthority } from "./fun/removeAuthority";
import { FeatureServiceRequest } from "./FeatureServiceRequest";
import EsriJSON from "@ol/format/EsriJSON";
import type { XYZ } from "poc/XYZ";
import { DEFAULT_MAX_ZOOM } from "@ol/tilegrid/common";
import { TileNode } from "./TileNode";
import { XY } from "./XY";

function asRequest(projection: Projection) {
  const request: FeatureServiceRequest = {
    f: "json",
    geometry: "",
    geometryType: "esriGeometryEnvelope",
    inSR: removeAuthority(projection.getCode()),
    outFields: "*",
    outSR: removeAuthority(projection.getCode()),
    returnGeometry: true,
    returnCountOnly: false,
    spatialRel: "esriSpatialRelEnvelopeIntersects", // will find duplicates
  };
  return request;
}

function bbox(extent: Extent) {
  const [xmin, ymin, xmax, ymax] = extent;
  return JSON.stringify({ xmin, ymin, xmax, ymax });
}

export class AgsFeatureLoader<T extends { count: number; center: XY }> {
  public constructor(
    private options: {
      tree: TileTree<T>;
      url: string;
      maxRecordCount: number;
      minRecordCount: number;
    }
  ) {}

  // vector source is preventing loader calls because it assumes all features were fetched...
  // so where can I pull down more data at higher zoom levels?
  public async loader(
    tileIdentifier: XYZ,
    projection: Projection
  ): Promise<TileNode<T>> {
    const { tree, maxRecordCount, minRecordCount, url } = this.options;

    const tileNode = tree.findByXYZ(tileIdentifier, { force: true });
    const tileData = tileNode.data;

    const proxy = new FeatureServiceProxy({
      service: url,
    });

    if (typeof tileData.count === "number") {
      return tileNode;
    }
    tileData.center = getCenter(tileNode.extent) as XY;

    const request = asRequest(projection);
    request.geometry = bbox(tileNode.extent);
    request.returnCountOnly = true;
    try {
      const response = await proxy.fetch<{ count: number }>(request);
      const count = response.count;
      tileData.count = count;
      if (0 < count && count < minRecordCount) {
        // load the actual features
        const features = await this.loadFeatures(request, proxy, projection);
        // features are not in the source, just on this tile
        tree.decorate(tileIdentifier, {
          features,
        });
      }
    } catch (ex) {
      console.error("network error", ex, tileIdentifier);
      tree.decorate(tileIdentifier, { text: ex, type: "err" });
    }
    return tileNode;
  }

  private async loadFeatures(
    request: FeatureServiceRequest,
    proxy: FeatureServiceProxy,
    projection: Projection
  ) {
    const esrijsonFormat = new EsriJSON();
    request.returnCountOnly = false;
    const response = await proxy.fetch<{
      objectIdFieldName: string;
      features: { attributes: any; geometry: any }[];
    }>(request);
    const features = esrijsonFormat.readFeatures(response, {
      featureProjection: projection,
    });
    return features;
  }
}
