import { Extent } from "@ol/extent";
import { Projection } from "@ol/proj";
import { TileTree } from "./TileTree";
import { TileTreeExt } from "./TileTreeExt";
import { FeatureServiceProxy } from "./FeatureServiceProxy";
import { removeAuthority } from "./fun/removeAuthority";
import { FeatureServiceRequest } from "./FeatureServiceRequest";
import EsriJSON from "@ol/format/EsriJSON";
import type { XYZ } from "poc/types/XYZ";
import type { XY } from "./types/XY";

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
    spatialRel: "esriSpatialRelContains", // will find duplicates
  };
  return request;
}

function bbox(extent: Extent) {
  const [xmin, ymin, xmax, ymax] = extent;
  return JSON.stringify({ xmin, ymin, xmax, ymax });
}

export class AgsFeatureLoader<T extends {}> {
  private helper: TileTreeExt;
  public constructor(
    private options: {
      tree: TileTreeExt;
      url: string;
      maxRecordCount: number;
      minRecordCount: number;
    }
  ) {
    this.helper = options.tree;
  }

  public async loader(tileIdentifier: XYZ, projection: Projection) {
    const { tree, maxRecordCount, minRecordCount, url } = this.options;

    const proxy = new FeatureServiceProxy({
      service: url,
    });

    const request = asRequest(projection);
    request.geometry = bbox(tree.tree.asExtent(tileIdentifier));
    request.returnCountOnly = true;
    const response = await proxy.fetch<{ count: number }>(request);
    const count = response.count;
    this.helper.setMass(tileIdentifier, count);
    if (maxRecordCount < count) {
      await Promise.all(
        tree.tree.quads(tileIdentifier).map((id) => this.loader(id, projection))
      );
    }
    if (0 < count && count < minRecordCount) {
      // load the actual features into the bounding tiles
      const features = await this.loadFeatures(request, proxy, projection);
      features.forEach((f) => this.helper.addFeature(f));
    }
    return count;
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
