import { describe, it } from "mocha";
import { assert } from "chai";

import { AgsFeatureLoader } from "poc/AgsFeatureLoader";
import { TileTree } from "poc/TileTree";
import { get as getProjection } from "@ol/proj";
import { showOnMap } from "../fun/showOnMap";
import { TileTreeExt } from "poc/TileTreeExt";
import Feature from "@ol/Feature";
import Polygon from "@ol/geom/Polygon";
import type { XY } from "poc/types/XY";
import { scaleFromCenter } from "@ol/extent";

function createFeatureForTile(
  tree: TileTree<any>,
  tileIdentifier: { X: number; Y: number; Z: number },
  scale?: number
) {
  const feature = new Feature({ visible: true });
  const extent = tree.asExtent(tileIdentifier);
  if (scale) {
    scaleFromCenter(extent, scale);
  }
  const [xmin, ymin, xmax, ymax] = extent;

  feature.setGeometry(
    new Polygon([
      [
        [xmin, ymin],
        [xmin, ymax],
        [xmax, ymax],
        [xmax, ymin],
        [xmin, ymin],
      ],
    ])
  );
  return feature;
}

describe("showOnMap tests", () => {
  it("renders a three level tree with features to prove the cluster counts are correct", () => {
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ mass: number }>({
      extent: projection.getExtent(),
    });

    const helper = new TileTreeExt(tree, { minZoom: 0, maxZoom: 8 });
    helper.addFeature(createFeatureForTile(tree, { X: 3, Y: 3, Z: 5 }));
    helper.addFeature(createFeatureForTile(tree, { X: 4, Y: 4, Z: 5 }));
    helper.addFeature(createFeatureForTile(tree, { X: 5, Y: 5, Z: 5 }));
    helper.addFeature(createFeatureForTile(tree, { X: 12, Y: 12, Z: 6 }));
    helper.addFeature(createFeatureForTile(tree, { X: 25, Y: 25, Z: 7 }));
    helper.addFeature(createFeatureForTile(tree, { X: 25, Y: 26, Z: 7 }));
    helper.addFeature(createFeatureForTile(tree, { X: 25, Y: 27, Z: 7 }));
    showOnMap({ helper });
  });

  it("renders a three level tree with features on boundaries to expose defect", () => {
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ mass: number }>({
      extent: projection.getExtent(),
    });

    const helper = new TileTreeExt(tree, { minZoom: 0, maxZoom: 8 });
    helper.addFeature(createFeatureForTile(tree, { X: 3, Y: 3, Z: 5 }));
    helper.addFeature(createFeatureForTile(tree, { X: 4, Y: 4, Z: 5 }));
    helper.addFeature(createFeatureForTile(tree, { X: 5, Y: 5, Z: 5 }));
    helper.addFeature(createFeatureForTile(tree, { X: 12, Y: 12, Z: 6 }));
    helper.addFeature(createFeatureForTile(tree, { X: 25, Y: 25, Z: 7 }));
    helper.addFeature(createFeatureForTile(tree, { X: 25, Y: 26, Z: 7 }));

    // this feature is visible too soon, should appear with level 5 tiles
    const problematicFeature = createFeatureForTile(
      tree,
      { X: 25, Y: 27, Z: 7 },
      4
    );

    const problematicTile = helper.addFeature(problematicFeature);
    assert.deepEqual(
      problematicTile,
      { X: 1, Y: 1, Z: 3 },
      "tile is 4x width but covers two Z=4 tiles so bubbled into parent"
    );
    assert.equal(
      problematicFeature.getProperties().Z,
      5,
      "4x level 7 is level 5"
    );

    console.log(tree.save());
    showOnMap({ helper });
  });

  it("renders a fully loaded tree with clusters via showOnMap (petroleum)", async () => {
    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Petroleum/KSFields/FeatureServer/0/query";
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ mass: number }>({
      extent: projection.getExtent(),
    });
    const ext = new TileTreeExt(tree, { minZoom: 6, maxZoom: 18 });

    const loader = new AgsFeatureLoader({
      url,
      maxDepth: 8,
      minRecordCount: 8,
      tree: ext,
    });

    const tileIdentifier = tree.parent({ X: 29 * 2, Y: 78 * 2, Z: 8 });
    const featureCount = await loader.loader(tileIdentifier, projection);

    assert.equal(1617, featureCount, "features");
    showOnMap({ helper: ext });
  }).timeout(10 * 1000);

  it("renders a fully loaded tree with clusters via showOnMap (watershed)", async () => {
    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Hydrography/Watershed173811/FeatureServer/1/query";
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ mass: number }>({
      extent: projection.getExtent(),
    });
    const ext = new TileTreeExt(tree, { minZoom: 6, maxZoom: 18 });

    const loader = new AgsFeatureLoader({
      url,
      maxDepth: 4,
      minRecordCount: 100,
      tree: ext,
    });

    const tileIdentifier = tree.parent({ X: 29 * 2, Y: 78 * 2, Z: 8 });
    const featureCount = await loader.loader(tileIdentifier, projection);

    assert.equal(5354, featureCount, "features");
    showOnMap({ helper: ext });
  });

  it("renders a fully loaded tree with clusters via showOnMap (earthquakes)", async () => {
    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Earthquakes/EarthquakesFromLastSevenDays/FeatureServer/0/query";
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ mass: number }>({
      extent: projection.getExtent(),
    });
    const ext = new TileTreeExt(tree, { minZoom: 6, maxZoom: 18 });

    const loader = new AgsFeatureLoader({
      url,
      maxDepth: 4,
      minRecordCount: 100,
      tree: ext,
    });

    const tileIdentifier = { X: 0, Y: 0, Z: 0 };
    const featureCount = await loader.loader(tileIdentifier, projection);

    assert.equal(72, featureCount, "features");
    showOnMap({ helper: ext });
  });
});
