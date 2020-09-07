import { describe, it } from "mocha";
import { assert } from "chai";

import { Extent } from "@ol/extent";
import { TileTree } from "../TileTree";
import { TileTreeExt } from "../TileTreeExt";
import { isEq } from "poc/fun/tiny";
import { flatten } from "poc/fun/flatten";
import type { XY } from "../types/XY";
import Geometry from "@ol/geom/Geometry";
import Point from "@ol/geom/Point";
import Feature from "@ol/Feature";

function de<T>(a: T, b: T, expectation: string) {
  console.log(a);
  assert.deepEqual(a, b, expectation);
}

function isSamePoint<T extends number[]>(a: T, b: T, message: string) {
  console.log(a);
  a.forEach((v, i) => assert.isTrue(isEq(v, b[i]), `${i}:${message}`));
}

describe("TileTree Extension Tests", () => {
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

  it("computes center of mass", () => {
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
    assert.deepEqual(com.mass, 0, "mass of root tile");
    assert.deepEqual(
      com.center,
      [8, 8],
      "no mass, no center but center of tile seems reasonable"
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

  it("TileTreeExt centerOfMass", () => {
    const extent = [0, 0, 10, 10] as Extent;
    const tree = TileTree.create<{ count: number; center: XY }>({
      extent,
      data: [[0, 0, 0, { count: 0, center: [0, 0] }]],
    });

    const ext = new TileTreeExt(tree);
    const tileIdentfier = { X: 0, Y: 0, Z: 0 };
    assert.equal(ext.density(tileIdentfier), 0);
    ext.setMass(tileIdentfier, 10);
    assert.equal(ext.density(tileIdentfier), 10);

    assert.deepEqual(ext.centerOfMass(tileIdentfier), {
      mass: 10,
      center: [5, 5],
      featureMass: 0,
    });
    ext.setCenter(tileIdentfier, [1, 1]); // will get recomputed
    const com = ext.centerOfMass(tileIdentfier);
    //"manually override center marks as dirty, recomputes, reverts so prior center"
    assert.equal(com.mass, 10, "mass");
    assert.equal(com.featureMass, 0, "featureMass");
    isSamePoint(com.center, [5, 5], "center");
  });

  it("TileTreeExt centerOfMass with features", () => {
    const extent = [0, 0, 1, 1] as Extent;
    const tree = new TileTree<{}>({
      extent,
    });

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
      ext.addFeature(feature);
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
      assert.equal(mass, 99, "mass reduced");
      assert.equal(featureMass, -1, "because of one visible feature");
      isSamePoint(center, [0.375, 0.375], "center shifted");
    }

    // tile features affect center-of-mass
    {
      const feature = new Feature<Point>(new Point([0.9, 0]));
      ext.addFeature(feature, tileIdentifier);
      ext.setVisible(feature, false);
      const { center, mass, featureMass } = ext.centerOfMass(tileIdentifier);
      assert.equal(mass, 99, "mass unaffected by hidden features");
      assert.equal(featureMass, -1, "feature mass also uneffected");
      isSamePoint(center, [0.6375, 0.1875], "hidden features affect center");
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
        [0.4263020833333333, 0.12630208333333334],
        "center shifts when adding a child with mass"
      );
    }
  });

  it("finds bounding tile", () => {
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

  it("attaches data to the nodes", () => {
    const extent = [0, 0, 1, 1] as Extent;
    const tree = new TileTree<{ count: number; center: XY }>({ extent });
    const helper = new TileTreeExt(tree);

    const q0 = tree.find([0, 0, 0.25, 0.25]);
    const q1 = tree.find([0.25, 0, 0.5, 0.25]);
    const q2 = tree.find([0, 0.25, 0.25, 0.5]);
    const q3 = tree.find([0.25, 0.25, 0.5, 0.5]);
    const q33 = tree.find([0.375, 0.375, 0.5, 0.5]);

    helper.setMass(q0, 1);
    helper.setMass(q1, 2);
    helper.setMass(q2, 4);
    helper.setMass(q3, 8);
    helper.setMass(q33, 16);

    const totalCount = tree.visit((a, b) => a + (helper.getMass(b) || 0), 0);
    assert.equal(totalCount, 31);
  });
});
