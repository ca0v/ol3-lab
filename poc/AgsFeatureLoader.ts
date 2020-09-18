import { Extent } from "@ol/extent";
import { Projection } from "@ol/proj";
import { TileTreeExt } from "./TileTreeExt";
import { FeatureServiceProxy } from "./FeatureServiceProxy";
import { removeAuthority } from "./fun/removeAuthority";
import { FeatureServiceRequest } from "./FeatureServiceRequest";
import EsriJSON from "@ol/format/EsriJSON";
import type { XYZ } from "poc/types/XYZ";
import type { Z } from "./types/XY";

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

export class AgsFeatureLoader {
  private helper: TileTreeExt;
  private maxRecordCount: number;
  public constructor(
    private options: {
      tree: TileTreeExt;
      url: string;
      maxDepth: Z;
      minRecordCount: number;
    }
  ) {
    this.helper = options.tree;
    this.maxRecordCount = this.options.minRecordCount;
  }

  public async loader(tileIdentifier: XYZ, projection: Projection) {
    return this.loadTile(tileIdentifier, projection, this.options.maxDepth);
  }

  private async loadTile(
    tileIdentifier: XYZ,
    projection: Projection,
    depth: number
  ) {
    if (depth < 0) throw "cannot load tile with negative depth";
    const { tree, minRecordCount, url } = this.options;

    const maxRecordCount = this.maxRecordCount || this.options.minRecordCount;

    const proxy = new FeatureServiceProxy({
      service: url,
    });

    const request = asRequest(projection);
    request.geometry = bbox(tree.tree.asExtent(tileIdentifier));
    request.returnCountOnly = true;
    const response = await proxy.fetch<{ count: number }>(request);
    const count = response.count;
    this.helper.setMass(tileIdentifier, count);

    if (0 >= depth || 0 == count) return count;

    // count is low enough to load features
    if (count < minRecordCount) {
      // load the actual features into the bounding tiles
      const features = await this.loadFeatures(request, proxy, projection);
      features.forEach((f) => this.helper.addFeature(f));
    }

    // count is too high, load sub-tiles
    else if (count > maxRecordCount) {
      await Promise.all(
        tree.tree
          .quads(tileIdentifier)
          .map((id) => this.loadTile(id, projection, depth - 1))
      );
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
