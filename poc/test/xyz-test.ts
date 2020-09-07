import { describe, it } from "mocha";
import { assert } from "chai";
import { Extent } from "@ol/extent";
import { get as getProjection } from "@ol/proj";
import { asExtent } from "poc/fun/asExtent";
import { asXYZ } from "poc/fun/asXYZ";

describe("XYZ testing", () => {
  it("asExtent test", () => {
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
    assert.deepEqual(x, [0.046875, 15.9375, 0.0625, 15.953125]);
  });

  it("asXYZ test", () => {
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
      for (let z = 0; z < 10; z++) {
        for (let x = 0; x < 10; x++) {
          for (let y = 0; y < 10; y++) {
            const v1 = asExtent(extent, { X: x, Y: y, Z: z });
            const v2 = asXYZ(extent, v1);
            assert.equal(v2.X, x, "x");
            assert.equal(v2.Y, y, "y");
            assert.equal(v2.Z, z, "z");
          }
        }
      }
    });
  });
});
