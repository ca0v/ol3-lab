import { containsExtent, Extent } from "@ol/extent";
import { Projection } from "@ol/proj";
import { TileTreeExt } from "./TileTreeExt";
import { FeatureServiceProxy } from "./FeatureServiceProxy";
import { removeAuthority } from "./fun/removeAuthority";
import { FeatureServiceRequest } from "./FeatureServiceRequest";
import EsriJSON from "@ol/format/EsriJSON";
import type { XYZ } from "poc/types/XYZ";
import { slowloop } from "./fun/slowloop";
import { explode } from "./fun/explode";

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
        return response.count;
      } catch (ex) {
        console.error(ex);
        return 0;
      }
    })();

    this.helper.setMass(tileIdentifier, count);

    if (0 == count) return count;

    // count is low enough to load features
    if (count <= featureLoadThreshold) {
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
        this.helper.setLoaded(tileIdentifier, true);
      } catch (ex) {
        console.error(ex);
      }
    }

    // count is too high, load sub-tiles
    else if (depth > 0 && count > featureLoadThreshold) {
      const c = tree.tree.quads(tileIdentifier);
      // depth 1st is not prefered...how to change to breath 1st?
      await this.loadTile(c[0], projection, depth - 1);
      await this.loadTile(c[1], projection, depth - 1);
      await this.loadTile(c[2], projection, depth - 1);
      await this.loadTile(c[3], projection, depth - 1);
    }

    return count;
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

  private async loadCrosshairs(
    tileIdentifier: XYZ,
    proxy: FeatureServiceProxy,
    projection: Projection
  ) {
    // load any features that intersect the crosshairs of this tile
    // because these would be the features that are not contained within
    // must also exclude features that are not entirely within this tile
    // esriSpatialRelTouches the cross-hairs of a tile excluding features
    // not fully within the tile

    const esrijsonFormat = new EsriJSON();

    const { tree } = this.options;

    const request = asRequest(projection);
    request.spatialRel = "esriSpatialRelIntersects";
    request.geometryType = "esriGeometryPolyline";
    request.geometry = JSON.stringify({
      paths: [crosshair(tree.tree.asExtent(tileIdentifier))],
    });

    try {
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
      return features;
    } catch (ex) {
      console.error(ex);
      return [];
    }
  }
}
