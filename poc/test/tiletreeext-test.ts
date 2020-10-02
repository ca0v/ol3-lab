import { describe, it } from "mocha";
import { assert } from "chai";

import type { Extent } from "@ol/extent";
import { TileTree } from "../TileTree";
import { TileTreeExt } from "../TileTreeExt";
import { isEq } from "poc/fun/tiny";
import { flatten } from "poc/fun/flatten";
import type { XY } from "../types/XY";
import Geometry from "@ol/geom/Geometry";
import Point from "@ol/geom/Point";
import Feature from "@ol/Feature";
import { isSamePoint } from "./fun/isSamePoint";
import Polygon from "@ol/geom/Polygon";
import { createFeatureForTile } from "./fun/createFeatureForTile";

function createTree() {
  const extent = [0, 0, 1, 1] as Extent;
  const tree = new TileTree<{ mass: number }>({
    extent,
  });
  return tree;
}

function createPoint(point: XY) {
  const feature = new Feature<Geometry>();
  feature.setGeometry(new Point(point));
  return feature;
}

function de<T>(a: T, b: T, expectation: string) {
  console.log(a);
  assert.deepEqual(a, b, expectation);
}

function isSameCenterOfMass<
  T extends { center: XY; mass: number; featureMass: number }
>(a: T, b: T, message: string) {
  assert.equal(a.mass, b.mass, `mass: ${message}`);
  assert.equal(a.featureMass, b.featureMass, `featureMass: ${message}`);
  isSamePoint(a.center, b.center, `mass: ${message}`);
}

describe("TileTreeExt Tests", () => {
  it("findByExtent and findZByExtent test", () => {
    const tree = TileTree.create<{ count: number; center: XY }>({
      extent: [0, 0, 16, 16],
      data: [[0, 0, 0, { count: 0, center: [0, 0] }]],
    });
    const ext = new TileTreeExt(tree);

    de(
      ext.findByExtent([0, 0, 1, 1]),
      { X: 0, Y: 0, Z: 3 },
      "bottom-left most tile 1/16 total width"
    );

    de(
      ext.findByExtent([0.25, 0, 1, 1]),
      { X: 0, Y: 0, Z: 3 },
      "not as wide but same tile as before"
    );

    de(
      ext.findByExtent([0.25, 0.25, 0.5, 0.5]),
      { X: 0, Y: 0, Z: 4 },
      "shifted right and up and deeper"
    );

    {
      // features on unlucky boundaries end up far too high in the tile stack...
      // compute a Z value for the feature instead of trusting the tile.
      const extent = [7.9, 7.9, 8.1, 8.1];
      de(
        ext.findByExtent(extent),
        { X: 0, Y: 0, Z: 0 },
        "worst case scenario, cannot find a child"
      );
      // associate this Z value to the feature to hide when out of scope
      // any benefit to associate feature with a bounding tile?
      de(ext.findZByExtent(extent), 6, "can still get accurate Z");
    }

    de(
      ext.findByExtent([10.1, 10.1, 10.11, 10.11]),
      { X: 323, Y: 323, Z: 9 },
      "trusting this is correct."
    );

    assert.throws(() => ext.findByExtent([0, 0, 16.01, 16]), "out of bounds");
  });

  it("findByExtent and setMass test", () => {
    const extent = [0, 0, 1, 1] as Extent;
    const tree = new TileTree<{ count: number; center: XY }>({ extent });
    const helper = new TileTreeExt(tree);

    const q0 = tree.findByExtent([0, 0, 0.25, 0.25]);
    const q1 = tree.findByExtent([0.25, 0, 0.5, 0.25]);
    const q2 = tree.findByExtent([0, 0.25, 0.25, 0.5]);
    const q3 = tree.findByExtent([0.25, 0.25, 0.5, 0.5]);
    const q33 = tree.findByExtent([0.375, 0.375, 0.5, 0.5]);

    helper.setMass(q0, 1);
    helper.setMass(q1, 2);
    helper.setMass(q2, 4);
    helper.setMass(q3, 8);
    helper.setMass(q33, 16);

    const totalCount = tree.visit((a, b) => a + (helper.getMass(b) || 0), 0);
    assert.equal(totalCount, 31);

    assert.throws(() => helper.setMass(q0, 0), "mass cannot be destroyed");
  });

  it("findByExtent and setMass test", () => {
    const extent = [0, 0, 1, 1] as Extent;
    const tree = new TileTree<{ count: number; center: XY }>({ extent });
    const helper = new TileTreeExt(tree);

    const q0 = tree.findByExtent([0, 0, 0.25, 0.25]);
    const q1 = tree.findByExtent([0.25, 0, 0.5, 0.25]);
    const q2 = tree.findByExtent([0, 0.25, 0.25, 0.5]);
    const q3 = tree.findByExtent([0.25, 0.25, 0.5, 0.5]);
    const q33 = tree.findByExtent([0.375, 0.375, 0.5, 0.5]);

    helper.setMass(q0, 1);
    helper.setMass(q1, 2);
    helper.setMass(q2, 4);
    helper.setMass(q3, 8);
    helper.setMass(q33, 16);

    const totalCount = tree.visit((a, b) => a + (helper.getMass(b) || 0), 0);
    assert.equal(totalCount, 31);

    assert.throws(() => helper.setMass(q0, 0), "mass cannot be destroyed");

    // it is all darkmass
    const { center, mass, featureMass } = helper.centerOfMass({
      X: 0,
      Y: 0,
      Z: 0,
    });

    assert.equal(
      mass,
      15,
      "the mass of the root is the sum of the mass of its children"
    );
    assert.equal(
      featureMass,
      0,
      "no visible features therefore no visible mass"
    );
    isSamePoint(center, [0.325, 0.35833333333333334], "center test");
  });

  it("computes density", () => {
    const extent = [0, 0, 10, 10] as Extent;
    const tree = new TileTree<{ count: number; center: XY }>({
      extent,
    });
    const helper = new TileTreeExt(tree);
    // if the density exceeds a threshold the clustered version of the tile is rendered
    // otherwise the features on that tile are rendered.  If the tile has not features
    // then the child tiles are rendered at a higher density
    const rootIdentifier = { X: 0, Y: 0, Z: 0 };
    assert.equal(0, helper.density(rootIdentifier), "root density is 0");
    const children = tree.quads(rootIdentifier);
    children.forEach((c, i) => helper.setMass(c, 1 + i));
    assert.equal(10, helper.centerOfMass(rootIdentifier).mass, "total count");
    assert.equal(10, helper.density(rootIdentifier), "density at Z=0");
    assert.equal(4, helper.density(children[0]), "child 0");
    assert.equal(8, helper.density(children[1]), "child 1");
    assert.equal(12, helper.density(children[2]), "child 2");
    assert.equal(16, helper.density(children[3]), "child 3");
  });

  it("computes center of mass of parent with undeclared mass", () => {
    const extent = [0, 0, 16, 16] as Extent;

    const tree = new TileTree<{ count: number; center: XY }>({
      extent,
    });
    const helper = new TileTreeExt(tree);

    const root = { X: 0, Y: 0, Z: 0 };
    const t000 = tree.findByXYZ(root);
    const [q0, q1, q2, q3] = tree.quads(root);

    // no mass
    let com = helper.centerOfMass(root);
    assert.deepEqual(com.mass, 0, "assumed to be massless");
    assert.deepEqual(
      com.center,
      [8, 8],
      "no mass => no center but center of tile seems reasonable"
    );

    helper.setMass(q0, 4);
    com = helper.centerOfMass(root);
    assert.deepEqual(com.mass, 4, "mass of q0");
    assert.deepEqual(com.center, [4, 4], "center of mass of q0");

    helper.setMass(q1, 2);
    com = helper.centerOfMass(root);
    assert.deepEqual(com.mass, 6, "mass of q0 + q1");
    assert.deepEqual(com.center, [4, 8 - 4 / 3], "center of mass of q0+q1");

    helper.setMass(q2, 1);
    com = helper.centerOfMass(root);
    assert.deepEqual(com.mass, 7, "mass of q0 + q1 + q2");
    assert.isTrue(
      isEq(com.center[0], 8 - 20 / 7),
      "cx center of mass of q0 + q1 + q2"
    );
    assert.isTrue(
      isEq(com.center[1], 8 - 4 / 7),
      "cy center of mass of q0 + q1 + q2"
    );

    helper.setMass(q3, 8);
    com = helper.centerOfMass(root);
    assert.deepEqual(com.mass, 15, "mass of q0 + q1 + q2 + q3");
    assert.deepEqual(
      com.center,
      [8 + 12 / 15, 8 - 36 / 15],
      "center of mass of q0 + q1 + q2 + q3"
    );
  });

  it("calculate center of mass of tile with assigned mass of 10", () => {
    const extent = [0, 0, 10, 10] as Extent;
    const tree = TileTree.create<{}>({
      extent,
      data: [],
    });

    const ext = new TileTreeExt(tree);
    const tileIdentifier = { X: 0, Y: 0, Z: 0 };
    assert.equal(ext.density(tileIdentifier), 0);
    ext.setMass(tileIdentifier, 10);
    assert.equal(ext.density(tileIdentifier), 10);

    isSameCenterOfMass(
      ext.centerOfMass(tileIdentifier),
      {
        mass: 10,
        center: [5, 5],
        featureMass: 0,
        childMass: 0,
      },
      "root tile com"
    );
    ext.setCenter(tileIdentifier, [1, 1]); // will get recomputed
    const com = ext.centerOfMass(tileIdentifier);
    //"manually override center marks as dirty, recomputes, reverts so prior center"
    assert.equal(com.mass, 10, "mass");
    assert.equal(com.featureMass, 0, "featureMass");
    isSamePoint(com.center, [5, 5], "center");
  });

  it("calculate center of mass of tile of mass 100 with features", () => {
    const tree = createTree();

    const ext = new TileTreeExt(tree, { minZoom: 0, maxZoom: 19 });
    const tileIdentifier = { X: 0, Y: 0, Z: 1 };
    {
      ext.setMass(tileIdentifier, 100);
      let { center, mass } = ext.centerOfMass(tileIdentifier);
      assert.equal(mass, 100, "mass of tile");
      isSamePoint(center, [0.25, 0.25], "center of tile");
    }

    // the mass of the parent is 100
    // adding features to child tiles affects mass of those children
    // but can only affect the center of the parent (not the mass)
    const features = [] as Feature<any>[];
    {
      const [x, y] = [3, 3];
      const feature = new Feature<Geometry>(new Point([1 / x, 1 / y]));
      features.push(feature);
      const targetIdentifier = ext.addFeature(feature);
      assert.deepEqual(targetIdentifier, { X: 174762, Y: 174762, Z: 19 });
      ext.setVisible(feature, false);

      const { mass, center } = ext.centerOfMass(tileIdentifier);
      assert.equal(
        mass,
        100,
        "tile mass is unaffected by dark matter in child tiles"
      );
      isSamePoint(center, [1 / 3, 1 / 3], "new center of tile");
    }

    const children = tree.children(tileIdentifier);
    const grandChildren = flatten(children.map((id) => tree.children(id)));

    de(
      children.map((id) => ext.centerOfMass(id).mass),
      [1],
      "child masses"
    );

    de(
      grandChildren.map((id) => ext.centerOfMass(id).mass),
      [1],
      "grandchild masses"
    );

    // visible features on child tile affect center-of-mass
    // because they represent themselves
    features.forEach((f) => ext.setVisible(f, true));
    {
      const { mass, center, featureMass } = ext.centerOfMass(tileIdentifier);
      assert.equal(mass, 99, "mass reduced, it was 100");
      assert.equal(featureMass, -1, "because of one visible feature");
      isSamePoint(center, [1 / 4, 1 / 4], "center shifted");
    }

    // tile features affect center-of-mass
    {
      const feature = new Feature<Point>(new Point([0.1, 0.1]));
      // points are buried deep in the tile tree
      let targetTileIdentifier = ext.addFeature(feature);
      assert.deepEqual(targetTileIdentifier, { X: 52428, Y: 52428, Z: 19 });
      ext.setVisible(feature, false);

      assert.isTrue(
        ext.isStale(targetTileIdentifier),
        "target and all ancestors should be stale"
      );
      assert.isTrue(
        ext.isStale(tileIdentifier),
        "is tileIdentifier an ancestor?"
      );
      const { center, mass, featureMass } = ext.centerOfMass(tileIdentifier);
      assert.equal(mass, 99, "mass unaffected by hidden features");
      assert.equal(featureMass, -1, "feature mass also uneffected");
      isSamePoint(center, [0.1, 0.1], "hidden features affect center");
    }

    // featureless child tile affect center-of-mass
    {
      const newChildId = { X: 0, Y: 0, Z: 7 };
      assert.isNull(tree.findByXYZ(newChildId), "child does not exist");
      ext.setMass(newChildId, 1);
      assert.isNotNull(tree.findByXYZ(newChildId), "child exists");
      const { center, mass, featureMass } = ext.centerOfMass(tileIdentifier);
      assert.equal(mass, 99, "mass unaffected by children without features");
      assert.equal(
        featureMass,
        -1,
        "feature mass unaffected by children without features"
      );
      isSamePoint(
        center,
        [0.051953125, 0.051953125],
        "center shifts when adding a child with mass"
      );
    }
  });

  it("infer the mass from a grandchild tile", () => {
    // define a tree with a single grandchild which has a mass and some features
    const extent = [0, 0, 10, 10] as Extent;
    const tree = new TileTree<{ count: number; center: XY }>({
      extent,
    });
    const helper = new TileTreeExt(tree);
    const tileIdentifier = { X: 0, Y: 0, Z: 0 };
    const child = tree.quads(tileIdentifier)[0];
    const grandChild = tree.quads(child)[0];
    helper.setMass(grandChild, 10);

    assert.equal(
      helper.centerOfMass(child).mass,
      10,
      "the mass of a parent is infered from its children"
    );

    assert.equal(
      helper.centerOfMass(tileIdentifier).mass,
      10,
      "the mass of any ancestor is infered from its children"
    );
  });

  it("modifying feature visibility on a grandchild tile must effect the center-of-mass of a grandparent tile", () => {
    // define a tree with a single grandchild which has a mass and some features
    const extent = [0, 0, 10, 10] as Extent;
    const tree = new TileTree<{ count: number; center: XY }>({
      extent,
    });
    const helper = new TileTreeExt(tree);
    const tileIdentifier = { X: 0, Y: 0, Z: 0 };
    const child = tree.quads(tileIdentifier)[0];
    const grandChild = tree.quads(child)[0];

    helper.setMass(child, 10);
    assert.equal(helper.centerOfMass(tileIdentifier).mass, 10);

    // add a feature to the grand child and make it visible to decrease its effective mass
    const visibleFeature = createFeatureForTile(tree, grandChild, 0.9);
    const hiddenFeature = createFeatureForTile(tree, grandChild, 0.9);

    // adding a feature to the grand-child with no explicit mass happens when features are pushed down
    helper.addFeature(visibleFeature);
    helper.setVisible(visibleFeature, false);
    helper.addFeature(hiddenFeature);
    helper.setVisible(hiddenFeature, false);

    // when those features are not visible they increase that tiles mass

    assert.equal(
      helper.centerOfMass(grandChild).mass,
      2,
      "two hidden features"
    );
    helper.setVisible(visibleFeature, true);
    assert.equal(helper.centerOfMass(grandChild).mass, 1, "one hidden feature");

    // but they reduce the mass of all ancestors when visible
    assert.equal(
      helper.centerOfMass(child).mass,
      9,
      "parent cluster is reduced"
    );

    assert.equal(
      helper.centerOfMass(tileIdentifier).mass,
      9,
      "grand parent cluster is reduced"
    );

    // and increase the mass of ancestors when hidden
    helper.setVisible(visibleFeature, false);

    assert.equal(
      helper.centerOfMass(tileIdentifier).mass,
      10,
      "grand parent cluster is restored to full mass"
    );
  });

  it("progressive center of mass calculations", () => {
    const helper = new TileTreeExt(createTree());
    const rootId = { X: 0, Y: 0, Z: 0 };

    // add a single point
    const p1 = createPoint([0.5 + 1 / 2048, 0.5 + 1 / 2048]);
    const targetId = helper.addFeature(p1);
    assert.deepEqual(targetId, { X: 512, Y: 512, Z: 10 });
    helper.setVisible(p1, false);

    {
      const { center, mass, featureMass, childMass } = helper.centerOfMass(
        targetId
      );
      const com = helper.centerOfMass(targetId);
      assert.deepEqual(
        com,
        { center, mass, featureMass, childMass },
        "centerOfMass is repeatable"
      );

      assert.equal(mass, 1, "tile mass represents one hidden feature");
      assert.equal(featureMass, 0, "tile has 0 visible features");
      isSamePoint(
        center,
        [0.5 + 1 / 2048, 0.5 + 1 / 2048],
        "p1 is hidden but just right of center"
      );
    }

    {
      const { center, mass, featureMass } = helper.centerOfMass(rootId);
      assert.equal(
        mass,
        1,
        "one child tile has mass since one feature is hidden"
      );
      assert.equal(featureMass, 0, "no visible features");
      isSamePoint(
        center,
        [0.5 + 1 / 2048, 0.5 + 1 / 2048],
        "should have same center of mass as the only child tile"
      );
    }

    // a visible feature deducts mass from all container tiles
    helper.setVisible(p1, true);
    {
      const { center, mass, featureMass, childMass } = helper.centerOfMass(
        targetId
      );
      const com = helper.centerOfMass(targetId);
      assert.deepEqual(
        com,
        { center, mass, featureMass, childMass },
        "centerOfMass is repeatable"
      );

      assert.equal(
        mass,
        0,
        "tile has no effective mass, all features are visible"
      );
      assert.equal(featureMass, -1, "tile has 1 visible feature");
      isSamePoint(
        center,
        [1 / 2 + 1 / 2048, 1 / 2 + 1 / 2048],
        "no mass so default to tile center"
      );
    }

    {
      const { center, mass, featureMass } = helper.centerOfMass(rootId);
      assert.equal(
        mass,
        0,
        "no child tile has mass since all features are visible"
      );
      assert.equal(featureMass, -1, "one visible feature in child tile");
      isSamePoint(
        center,
        [1 / 2, 1 / 2],
        "no mass so default to center of tile"
      );
    }
  });
});
