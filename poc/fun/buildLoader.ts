import { Extent, getCenter, getWidth } from "@ol/extent";
import { Projection } from "@ol/proj";
import { TileTree } from "../index";
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

function bbox(extent: Extent) {
  const [xmin, ymin, xmax, ymax] = extent;
  return JSON.stringify({ xmin, ymin, xmax, ymax });
}

export function buildLoader(options: {
  tree: TileTree<{ count: number; feature: Feature<Geometry> }>;
  url: string;
  strategy: any;
}) {
  let source: VectorSource<Geometry>;

  async function loader(
    extent: Extent,
    resolution: number,
    projection: Projection
  ) {
    // no not prevent future calls
    source["loadedExtentsRtree_"].clear();

    const { tree } = options;
    const tileNode = tree.find(extent);
    if (typeof tileNode.data.count === "number") {
      console.log(
        `already loaded: ${extent.map(Math.round)}, count:${
          tileNode.data.count
        }`
      );
      return;
    }
    tileNode.data.count = 0; // mark as loading
    console.log(`loading: ${extent.map(Math.round)}`);

    const proxy = new FeatureServiceProxy({
      service: options.url,
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

    request.geometry = bbox(extent);
    request.returnCountOnly = true;
    try {
      const response = await proxy.fetch<{ count: number }>(request);
      const count = response.count;
      tileNode.data.count = count;
      console.log(
        `found ${count} features in ${extent
          .map((v) => Math.round(v))
          .join(",")}`
      );
      if (count > 0) {
        // drill down until we understand the layout
        if (count > 1000) {
          await Promise.all(
            tree.ensureQuads(tileNode).map((q) => {
              source.loadFeatures(q.extent, resolution / 2, projection);
            })
          );
        }

        if (count < 100) {
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
          debugger;
          const parent = tree.parent(tileNode);
          console.assert(parent.quad.some((v) => v === tileNode));
          console.log(parent.data.feature);
        } else {
          const geom = new Circle(
            getCenter(extent),
            getWidth(extent) / Math.PI
          );
          const feature = new Feature(geom);
          feature.setProperties({ count, resolution });
          source.addFeature(feature);
          tileNode.data.feature = feature;
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
}
