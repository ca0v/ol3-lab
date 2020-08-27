import { Extent, getCenter } from "@ol/extent";
import { Projection } from "@ol/proj";
import { TileTree } from "../index";
import VectorSource from "@ol/source/Vector";
import Point from "@ol/geom/Point";
import Feature from "@ol/Feature";
import Geometry from "@ol/geom/Geometry";
import { FeatureServiceProxy } from "../FeatureServiceProxy";
import { removeAuthority } from "./removeAuthority";
import { FeatureServiceRequest } from "../FeatureServiceRequest";

function bbox(extent: Extent) {
  const [xmin, ymin, xmax, ymax] = extent;
  return JSON.stringify({ xmin, ymin, xmax, ymax });
}

export function buildLoader(options: {
  tree: TileTree<{ count: number }>;
  url: string;
  strategy: any;
}) {
  let source: VectorSource<Geometry>;

  async function loader(
    extent: Extent,
    resolution: number,
    projection: Projection
  ) {
    const { tree } = options;
    const tileNode = tree.find(extent);
    if (typeof tileNode.data.count === "number") return;
    tileNode.data.count = 0; // mark as loading

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
        const geom = new Point(getCenter(extent));
        const feature = new Feature(geom);
        feature.setProperties({ count, resolution });
        source.addFeature(feature);

        // drill down until we understand the layout
        if (count > 1000) {
          setTimeout(() => {
            Promise.all(
              tree.ensureQuads(tileNode).map((q) => {
                loader(q.extent, resolution / 2, projection);
              })
            );
            source.removeFeature(feature);
          }, 200);
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
