import { describe, it } from "mocha";
import { TileView } from "./fun/TileView";
import VectorSource from "@ol/source/Vector";
import { TileTreeExt } from "poc/TileTreeExt";
import { TileTree } from "poc/TileTree";
import { assert } from "chai";
import Feature from "@ol/Feature";
import Point from "@ol/geom/Point";
import { range } from "./fun/range";

describe("TileView Tests - this is a POC class and not indended to be shipped", () => {
  it("TileView - duplicate features are not created", () => {
    const source = new VectorSource();
    const helper = new TileTreeExt(new TileTree({ extent: [0, 0, 1, 1] }), {
      minZoom: 0,
      maxZoom: 5,
    });
    const tileView = new TileView({
      helper,
      source,
      MIN_ZOOM_OFFSET: 0,
      MAX_ZOOM_OFFSET: 0,
    });
    const point = [0.1, 0.1];

    // add some features that are not visible to force some cluster features to be created
    const feature = new Feature(new Point(point));
    feature.set("visible", true);
    source.addFeature(feature);

    // because the feature is visible we should expect some tiles to have mass
    // but they will not because the above feature is not associate with any tile
    const tileIdentifier = helper.addFeature(feature);
    assert.deepEqual(tileIdentifier, { X: 3, Y: 3, Z: 5 });

    // feature is visible at level
    range(6).forEach((z) => {
      tileView.computeTileVisibility(z);
      assert.equal(
        feature.get("visible"),
        z === 5,
        `feature visibility at Z${z}`
      );

      assert.equal(
        helper.centerOfMass(tileIdentifier).mass,
        z === 5 ? 0 : 1,
        `tile mass at Z${z}`
      );
    });

    console.log(helper.tree.save());

    assert.deepEqual(
      source
        .getFeatures()
        .filter((f) => f.get("type") === "cluster")
        .map((f) => f.get("tileIdentifier")),
      [
        { X: 0, Y: 0, Z: 0 },
        { X: 0, Y: 0, Z: 1 },
        { X: 0, Y: 0, Z: 2 },
        { X: 0, Y: 0, Z: 3 },
        { X: 1, Y: 1, Z: 4 },
        { X: 3, Y: 3, Z: 5 },
      ],
      "no cluster layers were duplicated"
    );
  });
});
