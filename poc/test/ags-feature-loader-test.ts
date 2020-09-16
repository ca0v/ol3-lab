import { describe, it } from "mocha";
import { assert } from "chai";

import { AgsFeatureLoader } from "poc/AgsFeatureLoader";
import { TileTree } from "poc/TileTree";
import { get as getProjection } from "@ol/proj";
import type { XY } from "poc/types/XY";
import { TileTreeExt } from "poc/TileTreeExt";
import { flatten } from "poc/fun/flatten";

describe("AgsFeatureLoader tests", () => {
  it("loads feature counts for specific tiles up to 3 levels deep", async () => {
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
      maxDepth: 3,
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

    // the loader has access to the underlying tree so that data has already been decorated
    assert.equal(
      ext.getMass({ X: 0, Y: 0, Z: 0 }),
      totalMass,
      "loader is modifying the tree data on level-0 tiles"
    );

    assert.equal(
      ext.getMass({ X: 0, Y: 1, Z: 1 }),
      totalMass,
      "loader is modifying the tree data on level-1 tiles"
    );

    assert.equal(
      ext.getMass({ X: 0, Y: 2, Z: 2 }),
      totalMass,
      "loader is modifying the tree data on level-2 tiles"
    );

    assert.equal(
      ext.getMass({ X: 0, Y: 4, Z: 3 }),
      null,
      "loader is NOT modifying the tree data on level-3 tiles"
    );
  });

  it("drills into a tile until all features are loaded up to 10 levels deep but never more than 128 features at a time", async () => {
    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Petroleum/KSFields/FeatureServer/0/query";
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ count: number; center: XY }>({
      extent: projection.getExtent(),
    });

    const ext = new TileTreeExt(tree, { minZoom: 6, maxZoom: 20 });

    const loader = new AgsFeatureLoader({
      url,
      maxDepth: 10, // never go more than 10 levels deep
      minRecordCount: 128, // when count is this or less get the actual features
      tree: ext,
    });

    const totalMass = await loader.loader({ X: 59, Y: 157, Z: 8 }, projection);
    assert.equal(260, totalMass, "q3");

    // the loader has access to the underlying tree so that data has already been decorated
    assert.equal(
      ext.getMass({ X: 59, Y: 157, Z: 8 }),
      totalMass,
      "loader is modifying the tree data on level-8 tiles"
    );

    const tile9 = { X: 59 * 2, Y: 157 * 2, Z: 9 };

    assert.equal(
      ext.getMass(tile9),
      75,
      "loader is modifying the tree data on level-9 tiles"
    );

    // because the count is less than 128 its children should have no inferred mass
    const masses = ext.tree.children(tile9).map((id) => ext.getMass(id));
    assert.deepEqual(masses, [null, null, null, null]);

    // because the count is less than 128 its children should have no more than 128 features
    const features = ext.tree
      .children(tile9)
      .map((id) => ext.getFeatures(id).length);
    assert.deepEqual(features, [2, 1, 1, 3]);

    // clearly 7 features is far less than 75...69 features are not fully contained within the child tiles
    assert.deepEqual(ext.getFeatures(tile9).length, 6);

    // well, no.  The features are pushed deep down into the smallest tile that will contain them
    assert.equal(
      ext.centerOfMass(tile9).mass,
      75,
      "tile9 moment mass is the same as its count"
    );

    // the moment of the sub-tiles should equal the moment of the parent excluding features owned by that parent (69)
    const moments = ext.tree
      .children(tile9)
      .map((id) => ext.centerOfMass(id).mass);
    assert.deepEqual(moments, [26, 19, 7, 17], "69 features accounted for");

    // so the 1st child of tile9 has a "mass" of 26 but only owns 2 features
    const [tile10] = ext.tree.quads(tile9);
    assert.deepEqual(tile10, {
      X: 236,
      Y: 628,
      Z: 10,
    });

    // here are where those 24 other features reside
    const tilesWithFeatures = ext.tree
      .descendants(tile10)
      .map((id) => ({ ...id, count: ext.getFeatures(id)?.length }))
      .filter((n) => !!n.count);

    assert.deepEqual(tilesWithFeatures, [
      { X: 472, Y: 1256, Z: 11, count: 1 },
      { X: 472, Y: 1257, Z: 11, count: 2 },
      { X: 473, Y: 1256, Z: 11, count: 1 },
      { X: 474, Y: 1256, Z: 11, count: 3 },
      { X: 944, Y: 2513, Z: 12, count: 1 },
      { X: 944, Y: 2515, Z: 12, count: 2 },
      { X: 944, Y: 2516, Z: 12, count: 1 },
      { X: 945, Y: 2515, Z: 12, count: 1 },
      { X: 946, Y: 2512, Z: 12, count: 1 },
      { X: 946, Y: 2516, Z: 12, count: 1 },
      { X: 947, Y: 2512, Z: 12, count: 1 },
      { X: 948, Y: 2512, Z: 12, count: 1 },
      { X: 948, Y: 2513, Z: 12, count: 1 },
      { X: 948, Y: 2514, Z: 12, count: 1 },
      { X: 1888, Y: 5032, Z: 13, count: 1 },
      { X: 1889, Y: 5025, Z: 13, count: 1 },
      { X: 1889, Y: 5032, Z: 13, count: 2 },
      { X: 1890, Y: 5029, Z: 13, count: 1 },
      { X: 1890, Y: 5030, Z: 13, count: 1 },
      { X: 1894, Y: 5025, Z: 13, count: 1 },
      { X: 1895, Y: 5024, Z: 13, count: 1 },
      { X: 1895, Y: 5026, Z: 13, count: 1 },
      { X: 3776, Y: 10050, Z: 14, count: 1 },
      { X: 3776, Y: 10055, Z: 14, count: 1 },
      { X: 3777, Y: 10054, Z: 14, count: 1 },
      { X: 3777, Y: 10062, Z: 14, count: 1 },
      { X: 3781, Y: 10062, Z: 14, count: 2 },
      { X: 3790, Y: 10048, Z: 14, count: 1 },
      { X: 3790, Y: 10049, Z: 14, count: 1 },
    ]);

    // ah...35? Not 24?
    assert.equal(
      tilesWithFeatures.reduce((a, b) => a + b.count, 0),
      35
    );

    // at this point I am debugging why I do not get 24 for the total number of features...
    const fids = flatten(
      tilesWithFeatures.map((id) =>
        ext.getFeatures(id).map((f) => f.getProperties().objectid)
      )
    );

    assert.equal(
      fids.length,
      35,
      "this is an invalid assertion...should be 24"
    );

    assert.deepEqual(fids, [
      1840,
      2122,
      2556,
      4974,
      2018,
      2679,
      1446,
      4671,
      5127,
      3571,
      6233,
      1907,
      229,
      5055,
      2844,
      2984,
      4204,
      2043,
      3058,
      1715,
      3138,
      898,
      6820,
      2545,
      3231,
      4869,
      5895,
      4117,
      2602,
      2601,
      1913,
      3489,
      3574,
      6609,
      6556,
    ]);

    // get all features within tile10 to see if I get the same FIDs
    {
      const tree = new TileTree<{ count: number; center: XY }>({
        extent: projection.getExtent(),
      });

      const innerExt = new TileTreeExt(tree, { minZoom: 6, maxZoom: 20 });

      const loader = new AgsFeatureLoader({
        url,
        maxDepth: 10, // never go more than 10 levels deep
        minRecordCount: 128, // when count is this or less get the actual features
        tree: innerExt,
      });
      await loader.loader(tile10, projection);

      const features = flatten(
        tree
          .descendants(tile10)
          .map((id) => innerExt.getFeatures(id))
          .filter((v) => !!v)
      );

      const fids = features.map((f) => f.getProperties().objectid);
      assert.equal(fids.length, 24, "there are 24 features within tile10");

      // these are those features
      assert.deepEqual(fids, [
        1840,
        2122,
        2556,
        4974,
        4671,
        5127,
        3571,
        1907,
        229,
        2844,
        1715,
        6820,
        2545,
        3231,
        4869,
        5895,
        4117,
        2602,
        2601,
        1913,
        3489,
        3574,
        6609,
        6556,
      ]);

      // buggy fids
      const tooManyFids = flatten(
        tilesWithFeatures.map((id) =>
          ext.getFeatures(id).map((f) => f.getProperties().objectid)
        )
      );

      const extras = tooManyFids.filter((id) => 0 > fids.indexOf(id));
      assert.deepEqual(extras, [
        2018,
        2679,
        1446,
        6233,
        5055,
        2984,
        4204,
        2043,
        3058,
        3138,
        898,
      ]);

      // lets focus on the memerable 2018 feature...
      const tileWith2018 = tilesWithFeatures.filter((id) =>
        ext.getFeatures(id).some((f) => f.getProperties().objectid === 2018)
      )[0];
      console.log(tileWith2018, ext.getFeatures(tileWith2018));

      assert.deepEqual(tileWith2018, { X: 474, Y: 1256, Z: 11, count: 3 });

      // so why does the original ext contain this feature on this tile...does it belong here?
      const feature2018 = ext
        .getFeatures(tileWith2018)
        .filter((f) => f.getProperties().objectid)[0];
      const extent = feature2018.getGeometry()!.getExtent();
      const target = ext.findByExtent(extent);
      assert.deepEqual(target, { X: 474, Y: 1256, Z: 11 });

      // it is in the correct tile according to findByExtent and the correct tile is a child of tile10?
      // NO!!!! this is not tile10, the X value is +1 here so why did this feature load?
      // or more importantly why is it considered a descendant of tile10?
      assert.deepEqual(ext.tree.parent({ X: 474, Y: 1256, Z: 11 }), {
        X: 237,
        Y: 628,
        Z: 10,
      });

      // If so why does this innerExt not contain one?
    }
  });
});
