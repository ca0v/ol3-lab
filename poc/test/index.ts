import { describe, it } from "mocha";
import { assert } from "chai";

import { Extent, getCenter } from "@ol/extent";
import { get as getProjection } from "@ol/proj";
import { TileTree, TileNode } from "../index";
import { createXYZ } from "@ol/tilegrid";
import { tile as tileStrategy } from "@ol/loadingstrategy";
import VectorSource from "@ol/source/Vector";
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

function debounce<T extends Function>(cb: T, wait = 20) {
  let h = 0;
  let callable = (...args: any) => {
    clearTimeout(h);
    h = setTimeout(() => cb(...args), wait);
  };
  return <T>(<any>callable);
}

const TINY = 0.0000001;

function isEq(v1: number, v2: number) {
  return TINY > Math.abs(v1 - v2);
}

function visit<T, Q>(
  root: TileNode<T>,
  cb: (a: Q, b: TileNode<T>) => Q,
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
    const tree = new TileTree<{ count: number }>({ extent });
    const root = tree.find(extent);
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
    const totalCount = visit(root, (a, b) => a + (b?.data.count || 0), 0);
    assert.equal(totalCount, 31);
  });

  it("uses 3857 to find a tile for a given depth and coordinate", () => {
    const extent = getProjection("EPSG:3857").getExtent();
    const tree = new TileTree<TileNode<{ count: number }>>({ extent });
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
      visit(
        tree.find(extent),
        (a, b) => Math.max(a, b.data.tileCoord ? b.data.tileCoord[1] : a),
        0
      );

    for (let i = 0; i <= 8; i++) {
      addTiles(i);
      assert.equal(Math.pow(2, i) - 1, maxX(), `addTiles(${i})`);
    }
  });

  it("integrates with a tiling strategy", () => {
    const extent = getProjection("EPSG:3857").getExtent() as Extent;
    const tree = new TileTree<{ count: number }>({ extent });
    const tileGrid = createXYZ({ extent });
    const strategy = tileStrategy(tileGrid);
    const resolutions = tileGrid.getResolutions();
    let quad0 = extent;

    resolutions.slice(0, 28).forEach((resolution, i) => {
      const extents = strategy(quad0, resolution) as Extent[];
      quad0 = extents[0];
      tree.find(quad0);
    });

    // my precision issues become problematic at this very small resolution
    // which is fine with me but code may be more stable if I figure this out.
    // perhaps I need X,Y,Z values instead of actual extents to eliminate fuzzy compares
    assert.equal(0.0005831682455839253, resolutions[28]);
    resolutions.slice(28).forEach((resolution, i) => {
      const extents = strategy(quad0, resolution) as Extent[];
      quad0 = extents[0];
      // TODO: would prefer this to work
      assert.throws(() => tree.find(quad0), "wrong power");
    });
  });

  it("integrates with a feature source", () => {
    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Petroleum/KSFields/FeatureServer/0/query";
    const projection = getProjection("EPSG:3857");
    const tileGrid = createXYZ({ tileSize: 512 });
    const strategy = tileStrategy(tileGrid);

    const tree = new TileTree<{ count: number }>({
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
      zoom: 6,
    });
    const target = document.createElement("div");
    target.style.backgroundColor = "black";
    target.className = "map";
    document.body.appendChild(target);

    const url =
      "http://localhost:3002/mock/sampleserver3/arcgis/rest/services/Petroleum/KSFields/FeatureServer/0/query";
    const tileGrid = createXYZ({ tileSize: 512 });
    const strategy = tileStrategy(tileGrid);

    const tree = new TileTree<{ count: number }>({
      extent: tileGrid.getExtent(),
    });

    const vectorSource = buildLoader({ tree, url, strategy });
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature: Feature<Geometry>) => {
        const { text, count } = feature.getProperties();
        const style = new Style({
          image: new Circle({
            radius: 10 + Math.sqrt(count) / 2,
            fill: new Fill({ color: "rgba(200,0,0,0.2)" }),
            stroke: new Stroke({ color: "white", width: 1 }),
          }),
          text: new Text({
            text: text || count + "",
            stroke: new Stroke({ color: "black", width: 1 }),
            fill: new Fill({ color: "white" }),
          }),
        });
        return style;
      },
    });

    const layers = [vectorLayer];
    const map = new Map({ view, target, layers });

    setTimeout(() => {
      target.remove();
      map.dispose();
    }, 60 * 1000);
  }).timeout(10000);
});
