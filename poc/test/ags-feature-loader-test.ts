import { describe, it } from "mocha";
import { assert } from "chai";

import { AgsFeatureLoader } from "poc/AgsFeatureLoader";
import { TileTree } from "poc/TileTree";
import { get as getProjection, Projection } from "@ol/proj";
import type { XY } from "poc/types/XY";
import { TileTreeExt } from "poc/TileTreeExt";
import { flatten } from "poc/fun/flatten";
import type { XYZ } from "poc/types/XYZ";

describe("AgsFeatureLoader tests", () => {
  it("loads feature counts for specific tiles up to 0 levels deep", async () => {
    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Petroleum/KSFields/FeatureServer/0/query";
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ count: number; center: XY; mass: number }>({
      extent: projection.getExtent(),
    });

    const ext = new TileTreeExt(tree, { minZoom: 6, maxZoom: 20 });
    const loader = new AgsFeatureLoader({
      url,
      minRecordCount: 10,
      tree: ext,
      networkThrottle: 500,
    });

    let tileIdentifier = { X: 29, Y: 78, Z: 7 };
    const children = tree.quads(tileIdentifier);

    const q0mass = await loader.loader(children[0], projection);
    assert.equal(515, q0mass, "q0");

    const q1mass = await loader.loader(children[1], projection);
    assert.equal(472, q1mass, "q1");

    const q2mass = await loader.loader(children[2], projection);
    assert.equal(292, q2mass, "q2");

    const q3mass = await loader.loader(children[3], projection);
    assert.equal(423, q3mass, "q3");

    const mass = await loader.loader(tileIdentifier, projection);

    // 50 features are on the cross-hairs of the parent tile
    assert.equal(q0mass! + q1mass! + q2mass! + q3mass! - 50, mass);
  });

  it("loads starting from {0,0,0} 11 levels deep", async () => {
    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Petroleum/KSFields/FeatureServer/0/query";
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ count: number; mass: number; center: XY }>({
      extent: projection.getExtent(),
    });

    const ext = new TileTreeExt(tree, { minZoom: 6, maxZoom: 20 });
    // 11 deep at 16 requests per second implies 250
    const loader = new AgsFeatureLoader({
      url,
      maxDepth: 11,
      minRecordCount: 1000,
      tree: ext,
    });

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

    console.log(ext.tree.descendants().filter((id) => !!ext.getMass(id)));

    assert.equal(
      ext.getMass({ X: 1, Y: 4, Z: 3 }),
      totalMass,
      "loader is modifying the tree data on level-3 tiles"
    );

    assert.equal(
      ext.getMass({ X: 3, Y: 9, Z: 4 }),
      totalMass,
      "loader is modifying the tree data on level-4 tiles"
    );

    assert.equal(
      ext.getMass({ X: 7, Y: 19, Z: 5 }),
      6658,
      "loader is modifying the tree data on level-5 tiles"
    );

    // 20 extra features loaded (0.3%)
    assert.equal(
      ext.getMass({ X: 14, Y: 39, Z: 6 }),
      6364,
      "loader is modifying the tree data on level-6 tiles"
    );

    // 62 extra (2%)
    assert.equal(
      ext.getMass({ X: 28, Y: 78, Z: 7 }),
      3114,
      "loader is modifying the tree data on level-7 tiles"
    );

    // 5% more features loaded
    assert.equal(
      ext.getMass({ X: 57, Y: 158, Z: 8 }),
      982,
      "loader is modifying the tree data on level-8 tiles"
    );

    // 15% more features loaded
    assert.equal(
      ext.getMass({ X: 114, Y: 314, Z: 9 }),
      185,
      "loader is modifying the tree data on level-9 tiles"
    );

    assert.equal(
      ext.centerOfMass({ X: 114, Y: 314, Z: 9 }).mass,
      185,
      "level-9 tiles contain mass: 114,314"
    );

    assert.equal(
      ext.centerOfMass({ X: 115, Y: 316, Z: 9 }).mass,
      163, // reporting 163...why?
      "level-9 tiles contain mass: 115,316"
    );

    let tileIdentifier = ext.tree.parent({ X: 115, Y: 316, Z: 9 });
    let com = ext.centerOfMass(tileIdentifier);
    assert.deepEqual(com.mass, 982, "parent mass");

    assert.equal(
      ext.getFeatures(tileIdentifier).length,
      23,
      "some of that mass is made up of features"
    );

    assert.deepEqual(
      ext.tree.children(tileIdentifier).map((id) => ext.centerOfMass(id).mass),
      [544, 206, 2, 163], // 915
      "the children must have 938-23 units of mass"
    );

    // but that last child should have 164 mass...
    assert.equal(
      ext.getFeatures({ X: 115, Y: 316, Z: 9 }).length,
      7,
      "level-9 tiles contain features: 115,316"
    );

    await loader.loader({ X: 115, Y: 316, Z: 9 }, projection);
  }).timeout(60 * 1000);

  it("drills into a tile until all features are loaded up to 10 levels deep but never more than 128 features at a time", async () => {
    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Petroleum/KSFields/FeatureServer/0/query";
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ count: number; mass: number; center: XY }>({
      extent: projection.getExtent(),
    });

    const ext = new TileTreeExt(tree, { minZoom: 6, maxZoom: 20 });

    const loader = new AgsFeatureLoader({
      url,
      maxDepth: 10, // never go more than 10 levels deep
      minRecordCount: 128, // when count is this or less get the actual features
      tree: ext,
    });

    let tileIdentifier = { X: 59, Y: 157, Z: 8 };
    const totalMass = await loader.loader(tileIdentifier, projection);
    assert.equal(292, totalMass, "q3");

    // the loader has access to the underlying tree so that data has already been decorated
    assert.equal(
      ext.getMass(tileIdentifier),
      totalMass,
      "loader is modifying the tree data on level-8 tiles"
    );

    const tile9 = tree.quads(tileIdentifier)[0];

    // 75 features are inside this tile so 28 are on the edges
    // there is a lot of over-counting as for small minRecordCount values
    assert.equal(
      ext.getMass(tile9),
      103,
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
      103,
      "tile9 moment mass is the same as its count"
    );

    // the moment of the sub-tiles should equal the moment of the parent excluding features owned by that parent (69)
    const moments = ext.tree
      .children(tile9)
      .map((id) => ext.centerOfMass(id).mass);
    assert.deepEqual(moments, [26, 19, 7, 17], "69 features accounted for");

    // so the 1st child of tile9 has a "mass" of 26 but only owns 2 features
    const [tile10] = ext.tree.quads(tile9);
    assert.deepEqual(
      tile10,
      {
        X: 236,
        Y: 628,
        Z: 10,
      },
      "tile10"
    );

    // here are where those 24 other features reside
    const tilesWithFeatures = ext.tree
      .descendants(tile10)
      .map((id) => ({ ...id, count: ext.getFeatures(id)?.length }))
      .filter((n) => !!n.count);

    assert.deepEqual(
      tilesWithFeatures,
      [
        { X: 472, Y: 1256, Z: 11, count: 1 },
        { X: 472, Y: 1257, Z: 11, count: 2 },
        { X: 473, Y: 1256, Z: 11, count: 1 },
        { X: 944, Y: 2513, Z: 12, count: 1 },
        { X: 944, Y: 2515, Z: 12, count: 2 },
        { X: 945, Y: 2515, Z: 12, count: 1 },
        { X: 946, Y: 2512, Z: 12, count: 1 },
        { X: 947, Y: 2512, Z: 12, count: 1 },
        { X: 1889, Y: 5025, Z: 13, count: 1 },
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
      ],
      "tilesWithFeatures"
    );

    assert.equal(
      tilesWithFeatures.reduce((a, b) => a + b.count, 0),
      24,
      "tile contains 26 features but all but 2 are in sub-tile"
    );

    // at this point I am debugging why I do not get 24 for the total number of features...
    const fids = flatten(
      tilesWithFeatures.map((id) =>
        ext.getFeatures(id).map((f) => f.getProperties().objectid)
      )
    );

    assert.equal(
      fids.length,
      24,
      "These are the feature ids associated with the sub-tiles"
    );
    console.log(fids);

    assert.deepEqual(
      fids.sort((a, b) => a - b),
      [
        229,
        1715,
        1840,
        1907,
        1913,
        2122,
        2545,
        2556,
        2601,
        2602,
        2844,
        3231,
        3489,
        3571,
        3574,
        4117,
        4671,
        4869,
        4974,
        5127,
        5895,
        6556,
        6609,
        6820,
      ],
      "fids"
    );
  }).timeout(60 * 1000);

  it("hits internal GIS system PART 1", async () => {
    const url =
      "http://localhost:3002/mock/gis1/arcgis/rest/services/IPS112/QA112UK/FeatureServer/1/query";
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ count: number; mass: number; center: XY }>({
      extent: projection.getExtent(),
    });

    const ext = new TileTreeExt(tree, { minZoom: 6, maxZoom: 20 });

    const loader = new AgsFeatureLoader({
      url,
      maxDepth: 5,
      minRecordCount: 128,
      networkThrottle: 100,
      tree: ext,
    });

    const totalMass = await loader.loader({ X: 0, Y: 0, Z: 0 }, projection);
    assert.equal(totalMass, 9076, "sanity check");
    console.log(totalMass, ext.tree.save());

    assert.deepEqual(
      ext.centerOfMass({ X: 0, Y: 1, Z: 1 }).mass,
      9076,
      "level 1"
    );

    assert.deepEqual(
      ext.centerOfMass({ X: 1, Y: 2, Z: 2 }).mass,
      9076,
      "level 2"
    );

    assert.deepEqual(
      ext.centerOfMass({ X: 3, Y: 5, Z: 3 }).mass,
      9076,
      "level 3"
    );

    assert.deepEqual(
      ext.centerOfMass({ X: 7, Y: 10, Z: 4 }).mass,
      9076,
      "level 4"
    );

    assert.deepEqual(
      ext.centerOfMass({ X: 15, Y: 21, Z: 5 }).mass,
      9076,
      "level 5"
    );
  }).timeout(10 * 1000);

  it("hits internal GIS system PART 2", async () => {
    const url =
      "http://localhost:3002/mock/gis1/arcgis/rest/services/IPS112/QA112UK/FeatureServer/1/query";
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ count: number; mass: number; center: XY }>({
      extent: projection.getExtent(),
    });

    const ext = new TileTreeExt(tree, { minZoom: 6, maxZoom: 20 });

    const loader = new AgsFeatureLoader({
      tree: ext,
      url,
      maxDepth: 5,
      minRecordCount: 128,
      networkThrottle: 10,
    });

    let tileIdentifier = { X: 15, Y: 21, Z: 5 };
    const totalMass = await loader.loader(tileIdentifier, projection);
    assert.equal(totalMass, 9076, "sanity check");
    console.log(
      totalMass,
      ext.tree.save().data.filter((d: any) => 0 < d[3].mass)
    );

    tileIdentifier = tree.quads(tileIdentifier)[3];
    assert.deepEqual(ext.getMass(tileIdentifier), 817, "level 6");

    tileIdentifier = tree.quads(tileIdentifier)[2];
    assert.deepEqual(ext.getMass(tileIdentifier), 817, "level 7");

    tileIdentifier = tree.quads(tileIdentifier)[1];
    assert.deepEqual(ext.getMass(tileIdentifier), 727, "level 8");

    tileIdentifier = tree.quads(tileIdentifier)[1];
    assert.deepEqual(ext.getMass(tileIdentifier), 51, "level 9");

    // something went wrong...this is depth=5 and should be loaded (10-5)
    assert.deepEqual(
      tree.quads(tileIdentifier).map((v) => ext.getMass(v)),
      [null, null, null, null],
      "level 10"
    );
  }).timeout(10 * 1000);

  it("hits internal GIS system PART 3", async () => {
    const url =
      "http://localhost:3002/mock/gis1/arcgis/rest/services/IPS112/QA112UK/FeatureServer/1/query";
    const projection = getProjection("EPSG:3857");
    const tree = new TileTree<{ count: number; mass: number; center: XY }>({
      extent: projection.getExtent(),
    });

    const ext = new TileTreeExt(tree, { minZoom: 6, maxZoom: 20 });

    const loader = new AgsFeatureLoader({
      tree: ext,
      url,
      maxDepth: 0,
      minRecordCount: 20,
      networkThrottle: 10,
    });

    let tileIdentifier = { X: 252, Y: 343, Z: 9 };
    const totalMass = await loader.loader(tileIdentifier, projection);
    assert.equal(totalMass, 51, "sanity check");
    assert.deepEqual(ext.getMass(tileIdentifier), 51, "level 9");

    let children = tree.quads(tileIdentifier);
    await Promise.all(children.map((c) => loader.loader(c, projection)));

    assert.deepEqual(
      children.map((id) => ext.getMass(id)),
      [null, 7, 44, null]
    );

    const child40 = children[2];
    children = tree.quads(child40);
    await Promise.all(children.map((c) => loader.loader(c, projection)));

    assert.deepEqual(
      children.map((id) => ext.getMass(id)),
      [null, 4, 35, 5]
    );

    const child40_31 = children[2];
    assert.deepEqual(child40_31, { X: 1011, Y: 1375, Z: 11 }, "child31");

    children = tree.quads(child40_31);
    await Promise.all(children.map((c) => loader.loader(c, projection)));

    assert.deepEqual(
      children.map((id) => ext.getMass(id)),
      [2, 25, 11, null],
      "features exist within at least two child tiles"
    );

    const child31_1 = children[0];
    assert.deepEqual(
      child31_1,
      { X: 2022, Y: 2750, Z: 12 },
      "1 feature loaded a Z12"
    );

    const features = tree
      .descendants(child31_1)
      .map((id) => ext.getFeatures(id))
      .filter((v) => !!v && !!v.length);

    assert.equal(features.length, 1, "1 descendend of child31_1 loaded");
    assert.equal(features[0].length, 1, "one feature loaded into one quad");
    assert.deepEqual(
      features[0][0].getProperties().tileIdentifier,
      {
        X: 64719,
        Y: 88013,
        Z: 17,
      },
      "one feature loaded into one quad of Z12 but 5 levels deeper into Z17"
    );

    // all children of child40_31 have no mass or have loaded their features
    const data = tree
      .children(child40_31)
      .map((id) => ({ id, mass: ext.getMass(id), loaded: ext.isLoaded(id) }));

    console.log(data);
    assert.deepEqual(data, [
      { id: { X: 2022, Y: 2750, Z: 12 }, mass: 2, loaded: true },
      { id: { X: 2022, Y: 2751, Z: 12 }, mass: 25, loaded: false },
      { id: { X: 2023, Y: 2751, Z: 12 }, mass: 11, loaded: true },
      { id: { X: 2023, Y: 2750, Z: 12 }, mass: null, loaded: false },
    ]);

    // but child40_31 is not loaded
    assert.isTrue(!ext.isLoaded(child40_31), "child40_31 not loaded");

    const fids = tree.descendants(child40_31).map((c) => {
      const mass = ext.getMass(c);
      const features = ext
        .getFeatures(c)
        .map((f) => f.getProperties().OBJECTID)
        .sort((a, b) => a - b);
      return { c, mass, features };
    });

    console.log(JSON.stringify(fids));
    assert.equal(
      fids.length,
      19,
      "the descendants of child40_31 *should* contain 2+25+11 features but only seeing 8 below..."
    );

    assert.deepEqual(
      fids,
      [
        { c: { X: 2022, Y: 2750, Z: 12 }, mass: 2, features: [] },
        { c: { X: 2022, Y: 2751, Z: 12 }, mass: 25, features: [] },
        { c: { X: 2023, Y: 2750, Z: 12 }, mass: null, features: [] },
        { c: { X: 2023, Y: 2751, Z: 12 }, mass: 11, features: [] },
        { c: { X: 4044, Y: 5500, Z: 13 }, mass: null, features: [] },
        {
          c: { X: 4047, Y: 5503, Z: 13 },
          mass: null,
          features: [4498, 4503],
        },
        { c: { X: 8089, Y: 11001, Z: 14 }, mass: null, features: [] },
        { c: { X: 8094, Y: 11006, Z: 14 }, mass: null, features: [] },
        { c: { X: 8094, Y: 11007, Z: 14 }, mass: null, features: [] },
        {
          c: { X: 8095, Y: 11007, Z: 14 },
          mass: null,
          features: [4499, 4500],
        },
        { c: { X: 16179, Y: 22003, Z: 15 }, mass: null, features: [] },
        { c: { X: 16188, Y: 22012, Z: 15 }, mass: null, features: [] },
        { c: { X: 16189, Y: 22014, Z: 15 }, mass: null, features: [4513] },
        { c: { X: 16189, Y: 22015, Z: 15 }, mass: null, features: [] },
        { c: { X: 32359, Y: 44006, Z: 16 }, mass: null, features: [] },
        { c: { X: 32376, Y: 44024, Z: 16 }, mass: null, features: [2186] },
        { c: { X: 32379, Y: 44030, Z: 16 }, mass: null, features: [] },
        { c: { X: 64719, Y: 88013, Z: 17 }, mass: null, features: [6964] },
        { c: { X: 64758, Y: 88061, Z: 17 }, mass: null, features: [4501] },
      ],
      "should be 2+11 here unless 5 features spilled outside the boundary and into lower Z tiles"
    );
  });
});
