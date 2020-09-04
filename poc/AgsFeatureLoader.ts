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

export class AgsFeatureLoader<
  T extends { count: number; center: [number, number] }
> {
  public constructor(
    private options: {
      tree: TileTree<T>;
      url: string;
      maxRecordCount: number;
      maxFetchCount: number;
    }
  ) {}

  // vector source is preventing loader calls because it assumes all features were fetched...
  // so where can I pull down more data at higher zoom levels?
  public async loader(
    tileIdentifier: XYZ,
    projection: Projection
  ): Promise<TileNode<T>> {
    const { tree, maxRecordCount, maxFetchCount, url } = this.options;

    const tileNode = tree.findByXYZ(tileIdentifier, { force: true });
    const tileData = tileNode.data;

    const proxy = new FeatureServiceProxy({
      service: url,
    });

    if (typeof tileData.count === "number") {
      return tileNode;
    }
    tileData.count = 0;
    tileData.center = getCenter(tileNode.extent) as [number, number];

    const request = asRequest(projection);
    request.geometry = bbox(tileNode.extent);
    request.returnCountOnly = true;
    try {
      const response = await proxy.fetch<{ count: number }>(request);
      const count = response.count;
      tileData.count = count;
      if (count < maxFetchCount) {
        // load the actual features
        const features = await this.loadFeatures(request, proxy, projection);
        // no tile is guaranteed to fully contain a feature but we can
        // identify a tile at a given zoom level that contains the centroid
        // put the features there.
        features.forEach((feature) => {
          const geom = feature.getGeometry() as Geometry;
          const center = getCenter(geom.getExtent());
          const featureTile = tree.findByPoint({
            point: center,
            zoom: DEFAULT_MAX_ZOOM,
          });
          // TODO: need to eliminate dups via fid field name
          // maybe tileNode.data.features[fid]=feature
          feature.setProperties({ tileInfo: featureTile });
        });
      }
    } catch (ex) {
      console.error("network error", ex, tileIdentifier);
      tileData.count = 1;
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

  private async fetchChildren(tileIdentifier: XYZ, projection: Projection) {
    const { tree } = this.options;
    return await Promise.all(
      tree.ensureQuads(tree.findByXYZ(tileIdentifier)).map(async (q) => {
        const childNodeIdentifier = tree.asXyz(q);
        await this.loader(childNodeIdentifier, projection);
        return childNodeIdentifier;
      })
    );
  }
}
