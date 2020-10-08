import { Extent } from "@ol/extent";
import { Projection } from "@ol/proj";
import { TileTreeExt } from "./TileTreeExt";
import { FeatureServiceProxy } from "./FeatureServiceProxy";
import { removeAuthority } from "./fun/removeAuthority";
import { FeatureServiceRequest } from "./FeatureServiceRequest";
import EsriJSON from "@ol/format/EsriJSON";
import type { XYZ } from "poc/types/XYZ";
import { explode } from "./fun/explode";
import { ticks } from "./test/fun/ticks";

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

function crosshair(extent: Extent) {
  const { xmin, xmid, xmax, ymin, ymid, ymax, h, w } = explode(extent);
  const coordinates = [
    [xmid, ymin],
    [xmid, ymax],
    [xmid, ymid],
    [xmin, ymid],
    [xmax, ymid],
  ];
  return coordinates;
}

interface AgsFeatureLoaderOptions {
  maxDepth: number;
  minRecordCount: number;
  networkThrottle: number;
  tree: TileTreeExt;
  url: string;
}

const DEFAULT_OPTIONS: Partial<AgsFeatureLoaderOptions> = {
  maxDepth: 0, // zoom levels
  minRecordCount: 256, // features
  networkThrottle: 100, // ms
};

export class AgsFeatureLoader {
  private options: AgsFeatureLoaderOptions;
  private helper: TileTreeExt;

  public constructor(
    options: {
      tree: TileTreeExt;
      url: string;
    } & Partial<AgsFeatureLoaderOptions>
  ) {
    this.helper = options.tree;
    this.options = {
      ...DEFAULT_OPTIONS,
      ...options,
    } as AgsFeatureLoaderOptions;
  }

  public async loader(tileIdentifier: XYZ, projection: Projection) {
    await this.loadTile(tileIdentifier, projection, this.options.maxDepth || 0);
    return this.options.tree.getMass(tileIdentifier);
  }

  private async loadTile(
    tileIdentifier: XYZ,
    projection: Projection,
    maxDepth: number
  ): Promise<void> {
    if (maxDepth < 0) throw "cannot load tile with negative depth";
    const { tree, url, minRecordCount } = this.options;

    if (tree.isLoaded(tileIdentifier)) return;

    if (tree.tree.decorate<{ loading: string }>(tileIdentifier).loading) return;

    tree.tree.decorate(tileIdentifier, { loading: true });

    const proxy = new FeatureServiceProxy({
      service: url,
    });

    await ticks(this.options.networkThrottle);

    const count = await (async () => {
      const request = asRequest(projection);
      request.geometry = bbox(tree.tree.asExtent(tileIdentifier));
      request.returnCountOnly = true;
      try {
        const response = await proxy.fetch<
          { count: number } & {
            error: { code: number; message: string; details: Array<string> };
          }
        >(request);
        if (response.error) {
          throw `${response.error.message}: ${response.error.details?.join(
            " "
          )}`;
        }
        tree.tree.decorate(tileIdentifier, { loading: "complete" });
        return response.count;
      } catch (ex) {
        console.error(ex);
        tree.tree.decorate(tileIdentifier, { loading: "error" });
        return 0;
      }
    })();

    this.helper.setMass(tileIdentifier, count);

    // count is low enough to load features
    if (0 < count && count <= minRecordCount) {
      if (this.helper.isLoaded(tileIdentifier)) {
        throw `tile already loaded: ${tileIdentifier}`;
      }

      // load the actual features into the bounding tiles
      const request = asRequest(projection);
      request.geometry = bbox(tree.tree.asExtent(tileIdentifier));

      try {
        const { id, features } = await this.loadFeatures(
          request,
          proxy,
          projection
        );

        // it is often the case that the count does not match the actual feature count
        // will test with a stable service
        if (features.length !== count) {
          console.log(
            `feature count may not match count response when the data is changes: ${count} != ${features.length}`
          );
        }

        features.forEach((f) => this.helper.addFeature(f, id));
        // this flag means the features have been loaded, not just the count
        this.helper.setLoaded(tileIdentifier, true);
      } catch (ex) {
        console.error(ex);
      }
    }

    // count is too high, load sub-tiles
    else if (0 < maxDepth && minRecordCount < count) {
      debugger;
      const c = tree.tree.quads(tileIdentifier);
      // depth 1st is not prefered...how to change to breath 1st?
      // how to await in a loop?
      await this.loadTile(c[0], projection, maxDepth - 1);
      await this.loadTile(c[1], projection, maxDepth - 1);
      await this.loadTile(c[2], projection, maxDepth - 1);
      await this.loadTile(c[3], projection, maxDepth - 1);
    }
  }

  private async loadFeatures(
    request: FeatureServiceRequest,
    proxy: FeatureServiceProxy,
    projection: Projection
  ) {
    const esrijsonFormat = new EsriJSON();
    const response = await proxy.fetch<
      {
        objectIdFieldName: string;
        features: { attributes: any; geometry: any }[];
      } & { error: { code: number; message: string; details: Array<string> } }
    >(request);

    if (response.error) {
      throw `${response.error.message}: ${response.error.details?.join(" ")}`;
    }

    const features = esrijsonFormat.readFeatures(response, {
      featureProjection: projection,
    });
    return { id: response.objectIdFieldName, features };
  }
}
