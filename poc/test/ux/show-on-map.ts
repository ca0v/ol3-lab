import { describe, it } from "mocha";
import { assert } from "chai";

import { AgsFeatureLoader } from "poc/AgsFeatureLoader";
import { TileTree } from "poc/TileTree";
import { get as getProjection } from "@ol/proj";
import { showOnMap } from "../fun/showOnMap";
import { TileTreeExt } from "poc/TileTreeExt";
import { getCenter } from "@ol/extent";
import { slowloop } from "poc/fun/slowloop";
import { createFeatureForTile } from "../fun/createFeatureForTile";

describe("showOnMap tests", () => {
  it("renders 7 feature tree to prove the cluster counts are correct", async () => {
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ mass: number }>({
      extent: projection.getExtent(),
    });

    const helper = new TileTreeExt(tree, { minZoom: 0, maxZoom: 8 });
    const fid = "fid";
    helper.addFeature(
      createFeatureForTile(tree, { X: 3, Y: 3, Z: 5 }, 0.9),
      fid
    );
    helper.addFeature(
      createFeatureForTile(tree, { X: 4, Y: 4, Z: 5 }, 0.9),
      fid
    );
    helper.addFeature(
      createFeatureForTile(tree, { X: 5, Y: 5, Z: 5 }, 0.9),
      fid
    );
    helper.addFeature(
      createFeatureForTile(tree, { X: 12, Y: 12, Z: 6 }, 0.9),
      fid
    );
    helper.addFeature(
      createFeatureForTile(tree, { X: 25, Y: 25, Z: 7 }, 0.9),
      fid
    );
    helper.addFeature(
      createFeatureForTile(tree, { X: 25, Y: 26, Z: 7 }, 0.9),
      fid
    );
    {
      const tid7 = { X: 25, Y: 27, Z: 7 };
      let feature = createFeatureForTile(tree, tid7, 0.9);
      helper.addFeature(feature, fid);
      assert.equal(helper.getFeatures(tid7).length, 1, "level 7 has a feature");
    }
    const view = showOnMap({ helper }).getView();

    view.setCenter(getCenter(tree.asExtent({ X: 3, Y: 3, Z: 5 })));

    view.setZoom(0);
    await slowloop([], 500);
    let com = helper.centerOfMass({ X: 0, Y: 0, Z: 0 });
    assert.equal(com.mass, 7);
    assert.equal(com.featureMass, 0);

    view.setZoom(1);
    await slowloop([], 500);
    com = helper.centerOfMass({ X: 0, Y: 0, Z: 0 });
    assert.equal(com.mass, 4);
    assert.equal(com.featureMass, -3, "three features are visible");

    view.setZoom(2);
    await slowloop([], 500);
    com = helper.centerOfMass({ X: 0, Y: 0, Z: 0 });
    assert.equal(com.mass, 3);
    assert.equal(com.featureMass, -4, "four features are visible");
    com = helper.centerOfMass({ X: 3, Y: 3, Z: 5 });
    assert.equal(com.mass, 0);
    assert.equal(com.featureMass, -1, "all features are visible");

    view.setZoom(3);
    await slowloop([], 500);
    com = helper.centerOfMass({ X: 0, Y: 0, Z: 0 });
    assert.equal(com.mass, 0);
    assert.equal(com.featureMass, -7, "all features are visible");

    view.setZoom(2);
    await slowloop([], 500);
    com = helper.centerOfMass({ X: 0, Y: 0, Z: 0 });
    assert.equal(com.mass, 3, "3 level 7 features are hidden");
    assert.equal(com.featureMass, -4, "4 level 5 and 6 features are visible");

    {
      /**
       * This explains why I am seeing two cluster markers so close together reporting 2 and 1
       * instead of a parent cluster reporting 3
       */
      let node = { X: 25, Y: 27, Z: 7 };
      com = helper.centerOfMass(node);
      assert.equal(com.mass, 1, "level 7 tile has one hidden feature");
      assert.equal(com.featureMass, 0, "level 7 tile has no visible features");

      node = tree.parent(node);
      com = helper.centerOfMass(node);
      assert.equal(
        com.mass,
        2,
        "parent tile contains 2 hidden features (not 3)"
      );
      assert.equal(com.featureMass, 0, "feature is hidden");

      node = { X: 25, Y: 25, Z: 7 };
      com = helper.centerOfMass(node);
      assert.equal(com.mass, 1, "level 7 tile has one hidden feature");
      assert.equal(com.featureMass, 0, "level 7 tile has no visible features");

      node = tree.parent(node);
      com = helper.centerOfMass(node);
      assert.equal(
        com.mass,
        1,
        "parent tile contains 1 hidden features (not 3)"
      );
      assert.equal(com.featureMass, -1, "level 6@12,12 is still visible");

      // this is Z=5 tile that contains the 2 and 1 and is the visually prefered
      // cluster to render...how to I ensure it is visible and its children are not?
      node = tree.parent(node);
      com = helper.centerOfMass(node);
      assert.equal(com.mass, 3, "parent tile contains 3 hidden features");
      assert.equal(com.featureMass, -1, "level 6@12,12 is still visible");

      view.set("hack", node.Z);
      view.dispatchEvent("hack:run-some-test");
    }
  });

  it("renders 7 feature tree with features on boundaries to expose defect", () => {
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ mass: number }>({
      extent: projection.getExtent(),
    });

    const helper = new TileTreeExt(tree, { minZoom: 0, maxZoom: 8 });
    const fid = "id";
    helper.addFeature(createFeatureForTile(tree, { X: 3, Y: 3, Z: 5 }), fid);
    helper.addFeature(createFeatureForTile(tree, { X: 4, Y: 4, Z: 5 }), fid);
    helper.addFeature(createFeatureForTile(tree, { X: 5, Y: 5, Z: 5 }), fid);
    helper.addFeature(createFeatureForTile(tree, { X: 12, Y: 12, Z: 6 }), fid);
    helper.addFeature(createFeatureForTile(tree, { X: 25, Y: 25, Z: 7 }), fid);
    helper.addFeature(createFeatureForTile(tree, { X: 25, Y: 26, Z: 7 }), fid);

    // this feature is visible too soon, should appear with level 5 tiles
    const problematicFeature = createFeatureForTile(
      tree,
      { X: 25, Y: 27, Z: 7 },
      4
    );

    const problematicTile = helper.addFeature(problematicFeature, fid);
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
      minRecordCount: 100,
      tree: ext,
    });

    const tileIdentifier = tree.parent({ X: 29 * 2, Y: 78 * 2, Z: 8 });
    const featureCount = await loader.loader(tileIdentifier, projection);

    assert.equal(1652, featureCount, "features");
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

  it("renders a fully loaded tree with clusters via showOnMap (parcels)", async () => {
    const url =
      "http://localhost:3002/mock/gis1/arcgis/rest/services/IPS112/SQL2v112/FeatureServer/22/query";
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ mass: number }>({
      extent: projection.getExtent(),
    });
    const ext = new TileTreeExt(tree, { minZoom: 0, maxZoom: 21 });

    const loader = new AgsFeatureLoader({
      url,
      maxDepth: 99,
      minRecordCount: 1000,
      tree: ext,
    });

    const tileIdentifier = { X: 0, Y: 0, Z: 0 };
    const featureCount = await loader.loader(tileIdentifier, projection);

    assert.equal(11655, featureCount, "features");
    showOnMap({ helper: ext, zoffset: [-4, 10] });
  }).timeout(60 * 1000);
});
