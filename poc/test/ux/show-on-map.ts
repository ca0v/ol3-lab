import { describe, it } from "mocha";
import { assert } from "chai";

import { AgsFeatureLoader } from "poc/AgsFeatureLoader";
import { TileTree } from "poc/TileTree";
import { get as getProjection } from "@ol/proj";
import { showOnMap } from "../fun/showOnMap";
import { TileTreeExt } from "poc/TileTreeExt";

describe("showOnMap tests", () => {
  it("renders a fully loaded tree with clusters via showOnMap", async () => {
    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Hydrography/Watershed173811/FeatureServer/1/query";
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{}>({
      extent: projection.getExtent(),
    });
    const ext = new TileTreeExt(tree, { minZoom: 6, maxZoom: 18 });

    const loader = new AgsFeatureLoader({
      url,
      maxDepth: 0,
      minRecordCount: 100,
      maxRecordCount: 100,
      tree: ext,
    });

    const tileIdentifier = tree.parent({ X: 29 * 2, Y: 78 * 2, Z: 8 });
    const featureCount = await loader.loader(tileIdentifier, projection);

    assert.equal(5354, featureCount, "features");
    debugger;
    showOnMap({ helper: ext });
  });
});
