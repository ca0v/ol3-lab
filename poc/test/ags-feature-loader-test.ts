import { describe, it } from "mocha";
import { assert } from "chai";

import { AgsFeatureLoader } from "poc/AgsFeatureLoader";
import { TileTree } from "poc/TileTree";
import { get as getProjection } from "@ol/proj";
import type { XY } from "poc/types/XY";
import { showOnMap } from "./fun/showOnMap";
import { TileTreeExt } from "poc/TileTreeExt";

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

    const ext = new TileTreeExt(tree, { minZoom: 6, maxZoom: 20 });

    const loader = new AgsFeatureLoader({
      url,
      minRecordCount,
      maxRecordCount,
      tree: ext,
    });

    const q0mass = await loader.loader(
      { X: 29 * 2, Y: 78 * 2, Z: 8 },
      projection
    );
    assert.equal(481, q0mass, "q0");

    const q1mass = await loader.loader(
      { X: 29 * 2, Y: 78 * 2 + 1, Z: 8 },
      projection
    );
    assert.equal(433, q1mass, "q1");

    const q2mass = await loader.loader(
      { X: 29 * 2 + 1, Y: 78 * 2, Z: 8 },
      projection
    );
    assert.equal(396, q2mass, "q2");

    const q3mass = await loader.loader(
      { X: 29 * 2 + 1, Y: 78 * 2 + 1, Z: 8 },
      projection
    );
    assert.equal(260, q3mass, "q3");

    const mass = await loader.loader({ X: 29, Y: 78, Z: 7 }, projection);
    // 47 features are in more than one quadrant
    assert.equal(q0mass + q1mass + q2mass + q3mass + 47, mass);

    const totalMass = await loader.loader({ X: 0, Y: 0, Z: 0 }, projection);
    assert.equal(6918, totalMass);
  });

  it("renders a fully loaded tree with clusters via showOnMap", async () => {
    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Petroleum/KSFields/FeatureServer/0/query";
    const minRecordCount = 100;
    const maxRecordCount = 100;
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ count: number; center: XY }>({
      extent: projection.getExtent(),
    });
    const ext = new TileTreeExt(tree, { minZoom: 6, maxZoom: 20 });

    const loader = new AgsFeatureLoader({
      url,
      minRecordCount,
      maxRecordCount,
      tree: ext,
    });

    const tileIdentifier = tree.parent({ X: 29 * 2, Y: 78 * 2, Z: 8 });
    const featureCount = await loader.loader(tileIdentifier, projection);
    assert.equal(1617, featureCount, "features");
    showOnMap({ tree });
  }).timeout(60 * 1000);
});
