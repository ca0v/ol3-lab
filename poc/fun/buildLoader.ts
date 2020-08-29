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
import Circle from "@ol/geom/Circle";
import EsriJSON from "@ol/format/EsriJSON";
import Polygon from "@ol/geom/Polygon";
import { XYZ } from "poc/XYZ";
import { DEFAULT_MAX_ZOOM } from "@ol/tilegrid/common";

function bbox(extent: Extent) {
  const [xmin, ymin, xmax, ymax] = extent;
  return JSON.stringify({ xmin, ymin, xmax, ymax });
}

export function buildLoader(options: {
  tree: TileTree<{ count: number; center: [number, number] }>;
  url: string;
  strategy: any;
  maxRecordCount: 1000 | 100;
  maxFetchCount: 100 | 10;
}) {
  const { tree, maxRecordCount, maxFetchCount, url } = options;
  const helper = new TileTreeExt(tree);

  let source: VectorSource<Geometry>;

  async function loader(
    extent: Extent,
    resolution: number,
    projection: Projection
  ) {
    // do not prevent future calls
    source["loadedExtentsRtree_"].clear();

    const tileIdentifier = tree.asXyz(tree.find(extent));
    const tileData = tree.findByXYZ(tileIdentifier).data;
    const proxy = new FeatureServiceProxy({
      service: url,
    });

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

    {
      // are some children already loaded?  If so, load all of them
      if (0 < tree.children(tileIdentifier).length) {
        await fetchChildren(tileIdentifier, resolution / 2, projection);
      }

      // are all the children loaded?
      if (helper.areChildrenLoaded(tileIdentifier)) {
        helper.centerOfMass(tileIdentifier);
        const weight = tileData.count;
        const center = tileData.center.map((v) => v / weight);
        // add feature to source
        const geom = new Point(center);
        const feature = new Feature(geom);
        feature.setProperties({ tileInfo: tileIdentifier });
        source.addFeature(feature);
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
    console.log(`loading: ${extent.map(Math.round)}`);

    request.geometry = bbox(extent);
    request.returnCountOnly = true;
    try {
      const response = await proxy.fetch<{ count: number }>(request);
      const count = response.count;
      tileData.count = count;
      console.log(
        `found ${count} features in ${extent
          .map((v) => Math.round(v))
          .join(",")}`
      );
      if (count > 0) {
        // drill down until we understand the layout
        if (count > maxRecordCount) {
          await fetchChildren(tileIdentifier, resolution, projection);
        }

        if (count < maxFetchCount) {
          // load the actual features
          const features = await loadFeatures(request, proxy, projection);
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
          const center = helper.centerOfMass(tileIdentifier);
          const geom = new Point(center);
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

  return (source = new VectorSource<Geometry>({
    loader,
    strategy: options.strategy,
  }));

  async function loadFeatures(
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
    features.forEach((f, i) =>
      f.setProperties({
        text: `${f.getProperties()[response.objectIdFieldName]}`,
      })
    );
    source.addFeatures(features);
    return features;
  }

  async function fetchChildren(
    tileIdentifier: XYZ,
    resolution: number,
    projection: Projection
  ) {
    await Promise.all(
      tree.ensureQuads(tree.findByXYZ(tileIdentifier)).map((q) => {
        source.loadFeatures(q.extent, resolution / 2, projection);
      })
    );
  }
}
