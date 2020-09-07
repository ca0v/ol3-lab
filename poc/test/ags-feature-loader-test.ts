import { describe, it } from "mocha";
import { assert } from "chai";

import { AgsFeatureLoader } from "poc/AgsFeatureLoader";
import { TileTree } from "poc/TileTree";
import { get as getProjection } from "@ol/proj";
import type { XY } from "poc/types/XY";
import Feature from "@ol/Feature";
import Geometry from "@ol/geom/Geometry";
import { showOnMap } from "./showOnMap";

describe("AgsFeatureLoader tests", () => {
  it("loads features", async () => {
    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Petroleum/KSFields/FeatureServer/0/query";
    const minRecordCount = -1;
    const maxRecordCount = 1000;
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ count: number; center: XY }>({
      extent: projection.getExtent(),
    });

    const rootNode = tree.find(projection.getExtent());

    const loader = new AgsFeatureLoader({
      url,
      minRecordCount,
      maxRecordCount,
      tree,
    });

    const { count: q0mass } = (
      await loader.loader({ X: 29 * 2, Y: 78 * 2, Z: 8 }, projection)
    ).data;
    assert.equal(481, q0mass, "q0");

    const { count: q1mass } = (
      await loader.loader({ X: 29 * 2, Y: 78 * 2 + 1, Z: 8 }, projection)
    ).data;
    assert.equal(433, q1mass, "q1");

    const { count: q2mass } = (
      await loader.loader({ X: 29 * 2 + 1, Y: 78 * 2, Z: 8 }, projection)
    ).data;
    assert.equal(396, q2mass, "q2");

    const { count: q3mass } = (
      await loader.loader({ X: 29 * 2 + 1, Y: 78 * 2 + 1, Z: 8 }, projection)
    ).data;
    assert.equal(260, q3mass, "q3");

    const { count: mass } = (
      await loader.loader({ X: 29, Y: 78, Z: 7 }, projection)
    ).data;
    // some features are counted multiple times, resulting
    // 47 features are in more than one quadrant
    assert.equal(q0mass + q1mass + q2mass + q3mass + 47, mass);

    const { count: totalMass } = (
      await loader.loader({ X: 0, Y: 0, Z: 0 }, projection)
    ).data;
    assert.equal(6918, totalMass);
  });

  it("pushes features into bounding tile", async () => {
    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Petroleum/KSFields/FeatureServer/0/query";
    const minRecordCount = 500;
    const maxRecordCount = 1000;
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ count: number; center: XY }>({
      extent: projection.getExtent(),
    });

    const loader = new AgsFeatureLoader({
      url,
      minRecordCount,
      maxRecordCount,
      tree,
    });

    const tileIdentifier = { X: 29 * 2, Y: 78 * 2, Z: 8 };
    await loader.loader(tileIdentifier, projection);
    const { features } = tree.decorate<{ features: Feature<Geometry>[] }>(
      tileIdentifier
    );
    assert.equal(481, features.length, "features");
    showOnMap({ features });
  });
});
