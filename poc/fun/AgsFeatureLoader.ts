import { Extent, getCenter, getWidth } from "@ol/extent";
import { Projection } from "@ol/proj";
import { TileTree, TileTreeExt } from "../TileTree";
import VectorSource from "@ol/source/Vector";
import Point from "@ol/geom/Point";
import Feature from "@ol/Feature";
import Geometry from "@ol/geom/Geometry";
import { FeatureServiceProxy } from "../FeatureServiceProxy";
import { removeAuthority } from "./removeAuthority";
import { FeatureServiceRequest } from "../FeatureServiceRequest";
import EsriJSON from "@ol/format/EsriJSON";
import { XYZ } from "poc/XYZ";
import { DEFAULT_MAX_ZOOM } from "@ol/tilegrid/common";

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
    spatialRel: "esriSpatialRelIntersects",
  };
  return request;
}

function bbox(extent: Extent) {
  const [xmin, ymin, xmax, ymax] = extent;
  return JSON.stringify({ xmin, ymin, xmax, ymax });
}

export class AgsFeatureLoader {
  public source: VectorSource<Geometry>;

  public constructor(
    private options: {
      tree: TileTree<{ count: number; center: [number, number] }>;
      url: string;
      strategy: any;
      maxRecordCount: number;
      maxFetchCount: number;
    }
  ) {
    this.source = new VectorSource<Geometry>({
      loader: (extent, resolution, projection) =>
        this.loader(extent, resolution, projection),
      strategy: options.strategy,
    });
  }

  // vector source is preventing loader calls because it assumes all features were fetched...
  // so where can I pull down more data at higher zoom levels?
  private async loader(
    extent: Extent,
    resolution: number,
    projection: Projection
  ) {
    const { tree, maxRecordCount, maxFetchCount, url } = this.options;
    const helper = new TileTreeExt(tree);
    const source = this.source;

    const tileIdentifier = tree.asXyz(tree.find(extent));
    const tileData = tree.findByXYZ(tileIdentifier).data;

    const proxy = new FeatureServiceProxy({
      service: url,
    });

    {
      // are some children already loaded?  If so, load all of them
      if (0 < tree.children(tileIdentifier).length) {
        console.log("fetching children", tileIdentifier);
        await this.fetchChildren(tileIdentifier, resolution / 2, projection);
      }

      // are all the children loaded?
      if (helper.areChildrenLoaded(tileIdentifier)) {
        this.recomputeCenterOfMass(tileIdentifier, helper, tileData, source);
        return;
      }

      {
        if (typeof tileData.count === "number") {
          console.log(
            `already loaded: ${extent.map(Math.round)}, count:${tileData.count}`
          );
          return;
        }
      }
    }

    tileData.count = 0; // mark as loading
    console.log(`loading: `, tileIdentifier);

    const request = asRequest(projection);
    request.geometry = bbox(extent);
    request.returnCountOnly = true;
    try {
      const response = await proxy.fetch<{ count: number }>(request);
      const count = response.count;
      tileData.count = count;
      console.log(`found ${count} features: `, tileIdentifier);
      if (count > 0) {
        // drill down until we understand the layout
        if (count > maxRecordCount) {
          const children = await this.fetchChildren(
            tileIdentifier,
            resolution,
            projection
          );
          console.log("children fetched:", children);

          if (helper.areChildrenLoaded(tileIdentifier)) {
            this.recomputeCenterOfMass(
              tileIdentifier,
              helper,
              tileData,
              source
            );
            return;
          }
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
            feature.setProperties({ tileInfo: featureTile });
          });
        } else {
          const com = helper.centerOfMass(tileIdentifier);
          const geom = new Point(com.center);
          const feature = new Feature(geom);
          feature.setProperties({ tileInfo: tileIdentifier });
          source.addFeature(feature);
        }
      }
    } catch (ex) {
      const geom = new Point(getCenter(extent));
      const feature = new Feature(geom);
      feature.setProperties({ text: ex, count: 0, resolution });
      source.addFeature(feature);
    }
  }

  private recomputeCenterOfMass(
    tileIdentifier: XYZ,
    helper: TileTreeExt,
    tileData: { count: number; center: [number, number] },
    source: VectorSource<Geometry>
  ) {
    console.log("computing center of mass", tileIdentifier);
    const com = helper.centerOfMass(tileIdentifier);
    if (tileData.count > com.mass) {
      console.error("los mass");
    }
    if (!com.mass) {
      console.log("massless");
      return;
    }
    console.log("com:", com);
    // add feature to source
    const geom = new Point(com.center);
    const feature = new Feature(geom);
    feature.setProperties({ tileInfo: tileIdentifier });
    source.addFeature(feature);
  }

  private async loadFeatures(
    request: FeatureServiceRequest,
    proxy: FeatureServiceProxy,
    projection: Projection
  ) {
    const { source } = this;
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
    features.forEach((f, i) =>
      f.setProperties({
        text: `${f.getProperties()[response.objectIdFieldName]}`,
      })
    );
    source.addFeatures(features);
    return features;
  }

  private async fetchChildren(
    tileIdentifier: XYZ,
    resolution: number,
    projection: Projection
  ) {
    const { tree } = this.options;
    console.log("fetchChildren:", tileIdentifier);
    await Promise.all(
      tree.ensureQuads(tree.findByXYZ(tileIdentifier)).map(async (q) => {
        await this.loader(q.extent, resolution / 2, projection);
        console.log("fetchedChild:", q);
        return q;
      })
    );
    console.log("fetchedChildren:", tileIdentifier);
  }
}
