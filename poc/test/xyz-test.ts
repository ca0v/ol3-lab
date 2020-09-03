import { describe, it } from "mocha";
import { assert } from "chai";

import { Extent } from "@ol/extent";
import { get as getProjection } from "@ol/proj";
import { TileTree, TileTreeExt } from "../TileTree";
import { TileNode } from "../TileNode";
import { createXYZ } from "@ol/tilegrid";
import { tile as tileStrategy } from "@ol/loadingstrategy";
import Point from "@ol/geom/Point";
import Feature from "@ol/Feature";
import VectorEventType from "@ol/source/VectorEventType";
import { AgsClusterSource } from "../AgsClusterSource";
import { asExtent } from "poc/asExtent";
import { asXYZ } from "poc/asXYZ";
import { explode } from "poc/explode";
import { isEq } from "poc/fun/tiny";

describe("Playground", () => {
  it("Past Failures", () => {
    const extent = [-180, -90, 180, 90];
    const tree = new TileTree({ extent });
    const xyz = { X: 0, Y: 1, Z: 1 };
    const node = tree.findByXYZ(xyz, { force: true });
    assert.deepEqual(tree.asXyz(node), xyz);
  });
});

describe("XYZ testing", () => {
  it("XYZ to extent", () => {
    const extent = [0, 0, 16, 16] as Extent;

    let x = asExtent(extent, { X: 0, Y: 0, Z: 0 });
    assert.deepEqual(x, [0, 0, 16, 16]);

    x = asExtent(extent, { X: 0, Y: 0, Z: 1 });
    assert.deepEqual(x, [0, 0, 8, 8]);

    x = asExtent(extent, { X: 1, Y: 0, Z: 1 });
    assert.deepEqual(x, [8, 0, 16, 8]);

    x = asExtent(extent, { X: 1, Y: 0, Z: 2 });
    assert.deepEqual(x, [4, 0, 8, 4]);

    x = asExtent(extent, { X: 1, Y: 0, Z: 3 });
    assert.deepEqual(x, [2, 0, 4, 2]);

    x = asExtent(extent, { X: 3, Y: 1020, Z: 10 });
    console.log(x);
    assert.deepEqual(x, [0.046875, 15.9375, 0.0625, 15.953125]);
  });

  it("extent to XYZ", () => {
    const extent = [0, 0, 16, 16] as Extent;

    let x = asXYZ(extent, [0, 0, 16, 16]);
    assert.deepEqual(x, { X: 0, Y: 0, Z: 0 });

    x = asXYZ(extent, [0, 4, 4, 8]);
    assert.deepEqual(x, { X: 0, Y: 1, Z: 2 });

    x = asXYZ(extent, [0.046875, 15.9375, 0.0625, 15.953125]);
    assert.deepEqual(x, { X: 3, Y: 1020, Z: 10 });
  });

  it("exhaustive XYZ", () => {
    const extents = [
      [0, 0, 1024, 1024],
      getProjection("EPSG:3857").getExtent(),
      getProjection("EPSG:4326").getExtent(),
    ];
    extents.forEach((extent) => {
      console.log(extent);
      for (let z = 0; z < 10; z++) {
        for (let x = 0; x < 10; x++) {
          for (let y = 0; y < 10; y++) {
            const v1 = asExtent(extent, { X: x, Y: y, Z: z });
            const v2 = asXYZ(extent, v1);
            console.log(v1, v2, x, y, z);
            assert.equal(v2.X, x, "x");
            assert.equal(v2.Y, y, "y");
            assert.equal(v2.Z, z, "z");
          }
        }
      }
    });
  });
});

describe("TileTree Tests", () => {
  it("creates a tile tree", () => {
    const extent = [0, 0, 10, 10] as Extent;
    const tree = new TileTree({ extent });
    const root = tree.find(extent);
    assert.isTrue(isEq(extent[0], root.extent[0]));
  });

  it("inserts an extent outside of the bounds of the current tree", () => {
    const extent = [0, 0, 1, 1] as Extent;
    const tree = new TileTree({ extent });
    assert.throws(() => {
      tree.find([1, 1, 2, 2]);
    }, "invalid X");
    assert.throws(() => {
      tree.find([0.1, 0.1, 0.9, 1.00001]);
    }, "invalid extent");
  });

  it("inserts an extent that misaligns to the established scale", () => {
    const extent = [0, 0, 1, 1] as Extent;
    const tree = new TileTree({ extent });
    assert.throws(() => {
      tree.find([0, 0, 0.4, 0.4]);
    }, "invalid extent");

    assert.throws(() => {
      tree.find([0, 0, 0.5, 0.4]);
    }, "invalid extent");

    assert.throws(() => {
      tree.find([0.1, 0, 0.6, 0.5]);
    }, "invalid extent");
  });

  it("attaches data to the nodes", () => {
    const extent = [0, 0, 1, 1] as Extent;
    const tree = new TileTree<{ count: number }>({ extent });

    const q0 = tree.find([0, 0, 0.25, 0.25]);
    const q1 = tree.find([0.25, 0, 0.5, 0.25]);
    const q2 = tree.find([0, 0.25, 0.25, 0.5]);
    const q3 = tree.find([0.25, 0.25, 0.5, 0.5]);
    const q33 = tree.find([0.375, 0.375, 0.5, 0.5]);

    q0.data.count = 1;
    q1.data.count = 2;
    q2.data.count = 4;
    q3.data.count = 8;
    q33.data.count = 16;

    const totalCount = tree.visit((a, b) => a + (b?.data.count || 0), 0);
    assert.equal(totalCount, 31);
  });

  it("uses 3857 to find a tile for a given depth and coordinate", () => {
    const extent = getProjection("EPSG:3857").getExtent();
    const tree = new TileTree<TileNode<{ count: number }>>({ extent });

    const q0 = tree.findByPoint({ zoom: 3, point: [-1, -1] });
    const q1 = tree.findByPoint({ zoom: 3, point: [1, -1] });
    const q2 = tree.findByPoint({ zoom: 3, point: [-1, 1] });
    const q3 = tree.findByPoint({ zoom: 3, point: [1, 1] });
    const size = -5009377.085697312;

    // x
    assert.isTrue(isEq(q0.extent[0], size), "q0.x");
    assert.equal(q1.extent[0], 0, "q1.x");
    assert.equal(q2.extent[0], size, "q2.x");
    assert.equal(q3.extent[0], 0, "q3.x");

    // y
    assert.equal(q0.extent[1], size, "q0.y");
    assert.equal(q1.extent[1], size, "q1.y");
    assert.equal(q2.extent[1], 0, "q2.y");
    assert.equal(q3.extent[1], 0, "q3.y");
  });

  it("can cache tiles from a TileGrid", () => {
    const extent = getProjection("EPSG:3857").getExtent() as Extent;
    const tree = new TileTree<{ tileCoord?: number[] }>({
      extent,
    });

    const tileGrid = createXYZ({ extent });

    const addTiles = (level: number) =>
      tileGrid.forEachTileCoord(extent, level, (tileCoord) => {
        const [z, x, y] = tileCoord;
        const extent = tileGrid.getTileCoordExtent(tileCoord) as Extent;
        tree.find(extent).data.tileCoord = tileCoord;
      });

    const maxX = () =>
      tree.visit(
        (a, b) => Math.max(a, b.data.tileCoord ? b.data.tileCoord[1] : a),
        0
      );

    for (let i = 0; i <= 8; i++) {
      console.log(`adding ${i}`);
      addTiles(i);
      assert.equal(Math.pow(2, i) - 1, maxX(), `addTiles(${i})`);
    }
  });

  it("integrates with a tiling strategy", () => {
    const extent = getProjection("EPSG:3857").getExtent() as Extent;
    const extentInfo = explode(extent);

    const tree = new TileTree<{ count: number }>({ extent });
    const tileGrid = createXYZ({ extent });
    const strategy = tileStrategy(tileGrid);
    const resolutions = tileGrid.getResolutions();

    // check resolutions
    const r0 = extentInfo.w / 256;
    assert.equal(resolutions[0], r0, "meters per pixel");
    resolutions.forEach((r, i) => {
      assert.equal(r, r0 * Math.pow(2, -i), `resolution[${i}]`);
    });

    {
      let quad0 = extent;
      resolutions.forEach((resolution, i) => {
        const extents = strategy(quad0, resolution) as Extent[];
        extents.forEach((q) => tree.find(q));
        quad0 = extents[0];
      });
    }
  });

  it("integrates with a feature source", () => {
    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Petroleum/KSFields/FeatureServer/0/query";
    const projection = getProjection("EPSG:3857");
    const tileGrid = createXYZ({ tileSize: 512 });
    const strategy = tileStrategy(tileGrid);

    const tree = new TileTree<{ count: number; center: [number, number] }>({
      extent: tileGrid.getExtent(),
    });

    const source = new AgsClusterSource({
      tree,
      url,
      strategy,
      maxRecordCount: 1000,
      maxFetchCount: 100,
    });

    source.loadFeatures(
      tileGrid.getExtent(),
      tileGrid.getResolution(0),
      projection
    );

    source.on(
      VectorEventType.ADDFEATURE,
      (args: { feature: Feature<Point> }) => {
        const { count, resolution } = args.feature.getProperties();
        console.log(count, resolution);
      }
    );
  });
});

describe("Cluster Rendering Rules", () => {
  it("tests ensureQuads", () => {
    const extent = [0, 0, 10, 10] as Extent;
    const tree = new TileTree<{ count: number; center: [number, number] }>({
      extent,
    });
    const root = tree.find(extent);
    let quad = tree
      .ensureQuads(tree.findByXYZ({ X: 1, Y: 1, Z: 1 }, { force: true }))
      .map((q) => tree.asXyz(q));
    assert.deepEqual({ X: 2, Y: 2, Z: 2 }, quad[0], "1st quadrant");
    assert.deepEqual({ X: 2, Y: 3, Z: 2 }, quad[1], "2nd quadrant");
    assert.deepEqual({ X: 3, Y: 3, Z: 2 }, quad[2], "3rd quadrant");
    assert.deepEqual({ X: 3, Y: 2, Z: 2 }, quad[3], "4th quadrant");
  });

  it("computes density", () => {
    const extent = [0, 0, 10, 10] as Extent;
    const tree = new TileTree<{ count: number; center: [number, number] }>({
      extent,
    });
    const helper = new TileTreeExt(tree);
    // if the density exceeds a threshold the clustered version of the tile is rendered
    // otherwise the features on that tile are rendered.  If the tile has not features
    // then the child tiles are rendered at a higher density
    assert.equal(40, helper.density({ Z: 1, count: 10 }));
    const root = { X: 0, Y: 0, Z: 0 };
    const t000 = tree.findByXYZ(root);
    const children = tree.ensureQuads(t000);
    children.forEach((c, i) => (c.data.count = 1 + i));
    helper.updateCount(t000);
    assert.equal(10, t000.data.count, "total count");
    assert.equal(10, helper.nodeDensity(root), "density at Z=0");
    assert.equal(4, helper.nodeDensity(tree.asXyz(children[0])), "child 0");
    assert.equal(8, helper.nodeDensity(tree.asXyz(children[1])), "child 1");
    assert.equal(12, helper.nodeDensity(tree.asXyz(children[2])), "child 2");
    assert.equal(16, helper.nodeDensity(tree.asXyz(children[3])), "child 3");

    assert.equal(helper.tilesByDensity(root, 100).length, 4, "density <= 100");
    assert.equal(helper.tilesByDensity(root, 16).length, 4, "density <= 16");
    assert.equal(helper.tilesByDensity(root, 15).length, 1, "density <= 15");
    assert.equal(helper.tilesByDensity(root, 10).length, 1, "density <= 10");
    assert.equal(helper.tilesByDensity(root, 9).length, 0, "density <= 9");
  });

  it("computes center of mass", () => {
    const extent = [0, 0, 16, 16] as Extent;
    const tree = new TileTree<{ count: number; center: [number, number] }>({
      extent,
    });
    const helper = new TileTreeExt(tree);

    const root = { X: 0, Y: 0, Z: 0 };
    const t000 = tree.findByXYZ(root);
    const [q0, q1, q2, q3] = tree.ensureQuads(t000);

    // no mass
    let com = helper.centerOfMass(root);
    assert.deepEqual(com.mass, 0, "mass of root tile");
    assert.deepEqual(com.center, [8, 8], "center of mass of root tile");

    q0.data.count = 4;
    com = helper.centerOfMass(root);
    assert.deepEqual(com.mass, 4, "mass of q0");
    assert.deepEqual(com.center, [4, 4], "center of mass of root tile");

    q1.data.count = 2;
    com = helper.centerOfMass(root);
    assert.deepEqual(com.mass, 6, "mass of q0 + q1");
    assert.deepEqual(com.center, [4, 8 - 4 / 3], "center of mass of root tile");

    q2.data.count = 1;
    com = helper.centerOfMass(root);
    assert.deepEqual(com.mass, 7, "mass of q0 + q1 + q2");
    assert.deepEqual(
      com.center,
      [8 - 20 / 7, 8 - 4 / 7],
      "center of mass of root tile"
    );

    q3.data.count = 8;
    com = helper.centerOfMass(root);
    assert.deepEqual(com.mass, 15, "mass of q0 + q1 + q2 + q3");
    assert.deepEqual(
      com.center,
      [8 + 12 / 15, 8 - 36 / 15],
      "center of mass of root tile"
    );
  });
});

describe("Descendants", () => {
  it("stringify a tree", () => {
    const extent = [0, 0, 10, 10] as Extent;
    const tree = new TileTree<{ count: number; center: [number, number] }>({
      extent,
    });
    assert.equal("[]", tree.stringify(), "empty");

    let X = 0;
    let Y = 0;
    let Z = 0;
    tree.findByXYZ({ X, Y, Z }, { force: true });
    assert.equal("[]", tree.stringify(), "root node only");

    X = 3;
    Y = 20;
    Z = 5;
    tree.findByXYZ({ X, Y, Z }, { force: true }).data.center = [1, 2];
    assert.equal('[[3,20,5,{"center":[1,2]}]]', tree.stringify(), "deep child");

    for (X = 10; X < 20; X += 3) {
      const data = tree.findByXYZ({ X, Y, Z }, { force: true }).data;
      data.count = X;
    }
    assert.equal(
      '[[3,20,5,{"center":[1,2]}],[10,20,5,{"count":10}],[13,20,5,{"count":13}],[16,20,5,{"count":16}],[19,20,5,{"count":19}]]',
      tree.stringify(),
      "deep child"
    );
  });

  it("destringify into a tree", () => {
    const extent = [0, 0, 10, 10] as Extent;
    const stringified =
      '[[6,19,5,{"count":267,"center":[-11897270.578531114,4383204.949985148]}],[6,20,5,{"count":-1,"center":[-11114555.408890907,5165920.119625352]}],[7,19,5,{"count":6658,"center":[-10644926.307106785,4383204.949985148]}],[7,20,5,{"count":-1,"center":[-11114555.408890907,5165920.119625352]}],[14,38,6,{"count":6595,"center":[-10989593.952922117,4518040.841452657]}],[14,39,6,{"count":6364,"center":[-10958012.374962866,4696291.017841228]}],[15,38,6,{"count":0,"center":[-10331840.239250705,4070118.8821290666]}],[15,39,6,{"count":306,"center":[-10331840.239250705,4696291.017841228]}],[27,78,7,{"count":202,"center":[-11427641.476746991,4539747.983913187]}],[27,79,7,{"count":66,"center":[-11427641.476746991,4852834.051769268]}],[27,80,7,{"count":0,"center":[-11427641.476746991,5165920.119625352]}],[28,78,7,{"count":3114,"center":[-11114555.408890907,4539747.983913187]}],[28,79,7,{"count":1608,"center":[-11114555.408890907,4852834.051769268]}],[28,80,7,{"count":-1,"center":[-11114555.408890907,5165920.119625352]}],[29,78,7,{"count":1652,"center":[-10801469.341034826,4539747.983913187]}],[29,79,7,{"count":51,"center":[-10801469.341034826,4852834.051769268]}],[29,80,7,{"count":0,"center":[-10801469.341034826,5165920.119625352]}],[56,156,8,{"count":315,"center":[-11192826.925854929,4461476.466949167]}],[56,157,8,{"count":812,"center":[-11192826.925854929,4618019.500877207]}],[56,158,8,{"count":590,"center":[-11192826.925854929,4774562.534805248]}],[56,159,8,{"count":49,"center":[-11192826.925854929,4931105.568733292]}],[57,156,8,{"count":576,"center":[-11036283.891926888,4461476.466949167]}],[57,157,8,{"count":1447,"center":[-11036283.891926888,4618019.500877207]}],[57,158,8,{"count":982,"center":[-11036283.891926888,4774562.534805248]}],[57,159,8,{"count":8,"center":[-11036283.891926888,4931105.568733292]}],[58,156,8,{"count":515,"center":[-10879740.857998848,4461476.466949167]}],[58,157,8,{"count":472,"center":[-10879740.857998848,4618019.500877207]}],[59,156,8,{"count":423,"center":[-10723197.824070806,4461476.466949167]}],[59,157,8,{"count":292,"center":[-10723197.824070806,4618019.500877207]}],[114,314,9,{"count":185,"center":[-11075419.650408898,4578883.742395197]}],[114,315,9,{"count":384,"center":[-11075419.650408898,4657155.259359219]}],[115,314,9,{"count":468,"center":[-10997148.13344488,4578883.742395197]}],[115,315,9,{"count":442,"center":[-10997148.13344488,4657155.259359219]}]]';
    const tree = new TileTree({ extent });
    tree.destringify(stringified);
    assert.equal(tree.stringify(), stringified);
  });
});
