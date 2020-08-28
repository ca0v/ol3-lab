import { describe, it } from "mocha";
import { assert } from "chai";

import { Extent, getCenter, getWidth } from "@ol/extent";
import { get as getProjection } from "@ol/proj";
import { TileTree } from "../TileTree";
import { TileNode } from "../TileNode";
import { createXYZ } from "@ol/tilegrid";
import { tile as tileStrategy } from "@ol/loadingstrategy";
import Point from "@ol/geom/Point";
import Feature from "@ol/Feature";
import Geometry from "@ol/geom/Geometry";
import VectorEventType from "@ol/source/VectorEventType";
import { createWeightedFeature } from "../fun/createWeightedFeature";
import Map from "@ol/Map";
import View from "@ol/View";
import VectorLayer from "@ol/layer/Vector";
import { buildLoader } from "../fun/buildLoader";
import { Style, Fill, Stroke, Text } from "@ol/style";
import Circle from "@ol/style/Circle";
import Polygon from "@ol/geom/Polygon";
import { asExtent } from "poc/asExtent";
import { asXYZ } from "poc/asXYZ";
import { explode } from "poc/explode";

const TINY = Math.pow(2, -24);

function isEq(v1: number, v2: number) {
  const diff = Math.abs(v1 - v2);
  const result = TINY > diff;
  if (!result) debugger;
  return result;
}

describe("playground", () => {
  it("playground", () => {
    const extent = getProjection("EPSG:3857").getExtent() as Extent;
    const extentInfo = explode(extent);

    const resolution = 9.554628535647032;
    const tile_14_0_16383 = [
      -20037508.342789244,
      20035062.357884116,
      -20035062.357884116,
      20037508.342789244,
    ];

    const xyz = asXYZ(extent, tile_14_0_16383);
    assert.deepEqual(xyz, { X: 0, Y: 16383, Z: 14 });

    const tileInfo = explode(tile_14_0_16383);
    assert.isTrue(
      isEq(tileInfo.w, extentInfo.w * Math.pow(2, -14)),
      "tile from level 14 has computable width"
    );

    assert.isTrue(
      isEq(tileInfo.ymin, extentInfo.ymax - tileInfo.w),
      "tile from level 14 has computable y value"
    );
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

    const tree = new TileTree<{ count: number; feature: Feature<Polygon> }>({
      extent: tileGrid.getExtent(),
    });

    const source = buildLoader({ tree, strategy, url });

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
        createWeightedFeature;
      }
    );
  });

  it("renders on a map", () => {
    const view = new View({
      center: getCenter([-11114555, 4696291, -10958012, 4852834]),
      zoom: 10,
    });
    const targetContainer = document.createElement("div");
    targetContainer.className = "testmapcontainer";
    const target = document.createElement("div");
    target.className = "map";
    document.body.appendChild(targetContainer);
    targetContainer.appendChild(target);

    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Petroleum/KSFields/FeatureServer/0/query";
    const tileGrid = createXYZ({ tileSize: 256 });
    const strategy = tileStrategy(tileGrid);

    const tree = new TileTree<{ count: number; feature: Feature<Geometry> }>({
      extent: tileGrid.getExtent(),
    });

    const vectorSource = buildLoader({ tree, url, strategy });
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: <any>((feature: Feature<Geometry>) => {
        const { text, count } = feature.getProperties();
        const style = new Style({
          image: new Circle({
            radius: 10 + Math.sqrt(count) / 2,
            fill: new Fill({ color: "rgba(200,0,0,0.2)" }),
            stroke: new Stroke({ color: "white", width: 1 }),
          }),
          text: new Text({
            text: (text || count) + "",
            stroke: new Stroke({ color: "black", width: 1 }),
            fill: new Fill({ color: "white" }),
          }),
        });
        const vector = new Style({
          fill: new Fill({ color: "rgba(200,200,0,0.2)" }),
        });
        return [style, vector];
      }),
    });

    const layers = [vectorLayer];
    const map = new Map({ view, target, layers });

    setTimeout(() => {
      targetContainer.remove();
      map.dispose();
    }, 60 * 1000);
  });
});

describe("Playground", () => {
  it("prior failures", () => {
    const extent = getProjection("EPSG:3857").getExtent();

    {
      const xyz = { X: 1, Y: 0, Z: 3 };
      let x = asExtent(extent, xyz);
      assert.deepEqual(x, [
        -15028131.257091932,
        -20037508.342789244,
        -10018754.17139462,
        -15028131.257091932,
      ]);

      assert.deepEqual(asXYZ(extent, x), xyz);
    }

    {
      const xyz = { X: 0, Y: 0, Z: 4 };
      const x = asExtent(extent, xyz);
      assert.deepEqual(x, [
        -20037508.342789244,
        -20037508.342789244,
        -17532819.79994059,
        -17532819.79994059,
      ]);

      assert.deepEqual(asXYZ(extent, x), xyz);
    }

    {
      const xyz = { X: 0, Y: 1, Z: 4 };
      const x = asExtent(extent, xyz);
      console.log(x);
      assert.deepEqual(x, [
        -20037508.342789244,
        -17532819.79994059,
        -17532819.79994059,
        -15028131.257091934,
      ]);

      assert.deepEqual(asXYZ(extent, x), xyz);
    }

    {
      const x0 = [
        -20037508.342789244,
        20037508.044207104,
        -20037508.044207104,
        20037508.342789244,
      ];

      const xyz = asXYZ(extent, x0);
      const x = asExtent(extent, xyz);
      assert.deepEqual(asXYZ(extent, x), xyz, "rounding errors");
      x.forEach((v, i) => assert.isTrue(isEq(v, x0[i]), `${i}:${v - x0[i]}`));
    }

    {
      const x0 = [
        -20037508.342789244,
        20037470.1242751,
        -20037470.1242751,
        20037508.342789244,
      ];

      const xyz = asXYZ(extent, x0);
      assert.deepEqual(xyz, { X: 0, Y: 1048575, Z: 20 });
      const x = asExtent(extent, xyz);
      assert.deepEqual(asXYZ(extent, x), xyz, "rounding errors");
      x.forEach((v, i) => assert.isTrue(isEq(v, x0[i]), `${i}:${v - x0[i]}`));
    }
  });
});
