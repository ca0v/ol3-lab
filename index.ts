import { describe, it } from "mocha";
import { assert } from "chai";

import type { Extent } from "@ol/extent";
import { get as getProjection } from "@ol/proj";
import { TileTree, TileNode } from "./poc/index";
import { createXYZ } from "@ol/tilegrid";
import { tile as tileStrategy } from "@ol/loadingstrategy.js";

function explode(extent: Extent) {
  const [xmin, ymin, xmax, ymax] = extent;
  const [w, h] = [xmax - xmin, ymax - ymin];
  const [xmid, ymid] = [xmin + w / 2, ymin + h / 2];
  return { xmin, ymin, xmax, ymax, w, h, xmid, ymid };
}
const TINY = 0.0000001;

function isEq(v1: number, v2: number) {
  return TINY > Math.abs(v1 - v2);
}

function visit<T extends TileNode, Q>(
  root: T,
  cb: (a: Q, b: T) => Q,
  init: Q
): Q {
  let result = cb(init, root);
  root.quad
    .filter((q) => !!q)
    .forEach((q) => {
      result = visit(q, cb, result);
    });
  return result;
}

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
    assert.throws(() => tree.find([1, 1, 2, 2]), "xmax too large: 2 > 1");
    assert.throws(() => tree.find([0.1, 0.1, 0.9, 1.00001]), "ymax too large");
  });

  it("inserts an extent that misaligns to the established scale", () => {
    const extent = [0, 0, 1, 1] as Extent;
    const tree = new TileTree({ extent });
    assert.throws(() => tree.find([0, 0, 0.4, 0.4]), "wrong power");
    assert.throws(() => tree.find([0, 0, 0.5, 0.4]), "not square");
    assert.throws(() => {
      tree.find([0.1, 0, 0.6, 0.5]);
    }, "xmax too large");
  });

  it("inserts a valid extent into the 4 quadrants", () => {
    const extent = [0, 0, 1, 1] as Extent;
    const tree = new TileTree({ extent });
    const result1 = tree.find([0, 0, 0.5, 0.5]);
    assert.isTrue(result1.quad.every((q) => q === null));
    const q0 = tree.find([0, 0, 0.25, 0.25]);
    const q1 = tree.find([0.25, 0, 0.5, 0.25]);
    const q2 = tree.find([0, 0.25, 0.25, 0.5]);
    const q3 = tree.find([0.25, 0.25, 0.5, 0.5]);
    assert.equal(q0, result1.quad[0], "quad0");
    assert.equal(q1, result1.quad[1], "quad1");
    assert.equal(q2, result1.quad[2], "quad2");
    assert.equal(q3, result1.quad[3], "quad3");
  });

  it("attaches data to the nodes", () => {
    const extent = [0, 0, 1, 1] as Extent;
    const tree = new TileTree<TileNode & { count: number }>({ extent });
    const root = tree.find(extent);
    const q0 = tree.find([0, 0, 0.25, 0.25]);
    const q1 = tree.find([0.25, 0, 0.5, 0.25]);
    const q2 = tree.find([0, 0.25, 0.25, 0.5]);
    const q3 = tree.find([0.25, 0.25, 0.5, 0.5]);
    const q33 = tree.find([0.375, 0.375, 0.5, 0.5]);
    q0.count = 1;
    q1.count = 2;
    q2.count = 4;
    q3.count = 8;
    q33.count = 16;
    const totalCount = visit(root, (a, b) => a + (b?.count || 0), 0);
    assert.equal(totalCount, 31);
  });

  it("uses 3857 to find a tile for a given depth and coordinate", () => {
    const extent = getProjection("EPSG:3857").getExtent();
    const tree = new TileTree<TileNode & { count: number }>({ extent });
    const q0 = tree.findByPoint({ zoom: 3, point: [-1, -1] });
    const q1 = tree.findByPoint({ zoom: 3, point: [1, -1] });
    const q2 = tree.findByPoint({ zoom: 3, point: [-1, 1] });
    const q3 = tree.findByPoint({ zoom: 3, point: [1, 1] });
    const size = -5009377.085697311;

    // x
    assert.equal(q0.extent[0], size, "q0.x");
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
    const tree = new TileTree<TileNode & { tileCoord?: number[] }>({
      extent,
    });

    const tileGrid = createXYZ({ extent });

    const addTiles = (level: number) =>
      tileGrid.forEachTileCoord(extent, level, (tileCoord) => {
        const [z, x, y] = tileCoord;
        const extent = tileGrid.getTileCoordExtent(tileCoord) as Extent;
        tree.find(extent).tileCoord = tileCoord;
      });

    const maxX = () =>
      visit(
        tree.find(extent),
        (a, b) => Math.max(a, b.tileCoord ? b.tileCoord[1] : a),
        0
      );

    for (let i = 0; i <= 8; i++) {
      addTiles(i);
      assert.equal(Math.pow(2, i) - 1, maxX(), `addTiles(${i})`);
    }
  });

  it("integrates with a tiling strategy", () => {
    const extent = getProjection("EPSG:3857").getExtent() as Extent;
    const tree = new TileTree<TileNode & { count: number }>({ extent });
    const tileGrid = createXYZ({ extent });
    const strategy = tileStrategy(tileGrid);
    const resolutions = tileGrid.getResolutions();
    let quad0 = extent;

    resolutions.slice(0, 28).forEach((resolution, i) => {
      const extents = strategy(quad0, resolution) as Extent[];
      quad0 = extents[0];
      console.log(i, resolution, quad0);
      tree.find(quad0);
    });

    // my precision issues become problematic at this very small resolution
    // which is fine with me but code may be more stable if I figure this out.
    // perhaps I need X,Y,Z values instead of actual extents to eliminate fuzzy compares
    assert.equal(0.0005831682455839253, resolutions[28]);
    resolutions.slice(28).forEach((resolution, i) => {
      const extents = strategy(quad0, resolution) as Extent[];
      quad0 = extents[0];
      console.log(i, resolution, quad0);
      // TODO: would prefer this to work
      assert.throws(() => tree.find(quad0), "wrong power");
    });
    console.log(explode(quad0));
  });
});
