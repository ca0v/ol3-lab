import { Extent } from "@ol/extent";
import { Projection } from "@ol/proj";
import { TileTreeExt } from "./TileTreeExt";
import { FeatureServiceProxy } from "./FeatureServiceProxy";
import { removeAuthority } from "./fun/removeAuthority";
import { FeatureServiceRequest } from "./FeatureServiceRequest";
import EsriJSON from "@ol/format/EsriJSON";
import type { XYZ } from "poc/types/XYZ";
import type { Z } from "./types/XY";
import { slowloop } from "./fun/slowloop";

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

interface AgsFeatureLoaderOptions {
  maxDepth: number;
  minRecordCount: number;
  networkThrottle: number;
}

const DEFAULT_OPTIONS: AgsFeatureLoaderOptions = {
  maxDepth: 0, // zoom levels
  minRecordCount: 256, // features
  networkThrottle: 100, // ms
};

export class AgsFeatureLoader {
  private helper: TileTreeExt;
  public constructor(
    private options: {
      tree: TileTreeExt;
      url: string;
    } & Partial<AgsFeatureLoaderOptions>
  ) {
    this.helper = options.tree;
  }

  public async loader(tileIdentifier: XYZ, projection: Projection) {
    return this.loadTile(
      tileIdentifier,
      projection,
      this.options.maxDepth || 0
    );
  }

  private async loadTile(
    tileIdentifier: XYZ,
    projection: Projection,
    depth: number
  ) {
    if (depth < 0) throw "cannot load tile with negative depth";
    const { tree, url } = this.options;

    const featureLoadThreshold =
      this.options.minRecordCount || DEFAULT_OPTIONS.minRecordCount;

    const throttle =
      this.options.networkThrottle || DEFAULT_OPTIONS.networkThrottle;

    const proxy = new FeatureServiceProxy({
      service: url,
    });

    const count = await (async () => {
      const request = asRequest(projection);
      request.geometry = bbox(tree.tree.asExtent(tileIdentifier));
      request.returnCountOnly = true;
      try {
        const response = await proxy.fetch<{ count: number }>(request);
        return response.count;
      } catch (ex) {
        console.error(ex);
        return 0;
      }
    })();

    this.helper.setMass(tileIdentifier, count);

    if (0 >= depth || 0 == count) return count;

    // count is low enough to load features
    if (count <= featureLoadThreshold) {
      // load the actual features into the bounding tiles
      const request = asRequest(projection);
      request.geometry = bbox(tree.tree.asExtent(tileIdentifier));

      try {
        const features = await this.loadFeatures(request, proxy, projection);

        // it is often the case that the count does not match the actual feature count
        // will test with a stable service
        console.assert(
          features.length === count,
          `feature count may not match count response when the data is changes: ${count} != ${features.length}`
        );
        features.forEach((f) => this.helper.addFeature(f));
      } catch (ex) {
        console.error(ex);
      }
    }

    // count is too high, load sub-tiles
    else if (count > featureLoadThreshold) {
      await Promise.all(
        await slowloop(
          tree.tree
            .quads(tileIdentifier)
            .map((id) => () => this.loadTile(id, projection, depth - 1)),
          throttle
        )
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
