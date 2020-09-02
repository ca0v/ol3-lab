import { Extent, getCenter, getWidth } from "@ol/extent";
import { Projection } from "@ol/proj";
import { TileTree, TileTreeExt } from "./TileTree";
import Geometry from "@ol/geom/Geometry";
import { FeatureServiceProxy } from "./FeatureServiceProxy";
import { removeAuthority } from "./fun/removeAuthority";
import { FeatureServiceRequest } from "./FeatureServiceRequest";
import EsriJSON from "@ol/format/EsriJSON";
import { XYZ } from "poc/XYZ";
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
    const helper = new TileTreeExt(tree);

    const tileNode = tree.findByXYZ(tileIdentifier, { force: true });
    const tileData = tileNode.data;

    const proxy = new FeatureServiceProxy({
      service: url,
    });

    if (typeof tileData.count === "number" && !!tileData.center) {
      console.log(
        `already loaded: ${tileNode.extent.map(Math.round)}, count:${
          tileData.count
        }`
      );
      return tileNode;
    }
    tileData.count = 0;
    tileData.center = getCenter(tileNode.extent) as [number, number];

    console.log(`loading: `, tileIdentifier);

    const request = asRequest(projection);
    request.geometry = bbox(tileNode.extent);
    request.returnCountOnly = true;
    try {
      const response = await proxy.fetch<{ count: number }>(request);
      const count = response.count;
      tileData.count = count;
      console.log(`found ${count} features: `, tileIdentifier);
      if (count === 0) return tileNode;

      // drill down until we understand the layout, recompute the center of mass
      if (count > maxRecordCount) {
        const children = await this.fetchChildren(tileIdentifier, projection);
        console.log("children fetched:", children);

        const com = this.recomputeCenterOfMass(
          tileIdentifier,
          helper,
          tileData
        );
        tileData.center = com.center;
        // can gain mass due to duplicate features in siblings
        // because of the query strategy to receive anything (esriSpatialRelIntersects)
        // that intersects the extent but would prefer a query that returns
        // count based on centroid to ensure uniqueness
        console.assert(tileData.count <= com.mass);
        return tileNode;
      }

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
      } else {
        const com = helper.centerOfMass(tileIdentifier);
        tileData.center = com.center;
        tileData.count = com.mass;
      }
    } catch (ex) {
      console.error("network error", ex, tileIdentifier);
      tileData.count = -1;
    }
    return tileNode;
  }

  private recomputeCenterOfMass(
    tileIdentifier: XYZ,
    helper: TileTreeExt,
    tileData: { count: number; center: [number, number] }
  ) {
    console.log("computing center of mass", tileIdentifier);
    const com = helper.centerOfMass(tileIdentifier);
    if (tileData.count > com.mass) {
      console.error("loss of mass:", tileIdentifier, tileData.count, com.mass);
      debugger;
    }
    return com;
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
    console.log(response);
    const features = esrijsonFormat.readFeatures(response, {
      featureProjection: projection,
    });
    return features;
  }

  private async fetchChildren(tileIdentifier: XYZ, projection: Projection) {
    const { tree } = this.options;
    console.log("fetching all children:", tileIdentifier);
    return await Promise.all(
      tree.ensureQuads(tree.findByXYZ(tileIdentifier)).map(async (q) => {
        const childNodeIdentifier = tree.asXyz(q);
        await this.loader(childNodeIdentifier, projection);
        console.log(
          "fetched child:",
          childNodeIdentifier,
          "with mass:",
          q.data.count,
          "for parent:",
          tileIdentifier
        );
        return childNodeIdentifier;
      })
    );
  }
}
