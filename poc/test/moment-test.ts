import { describe, it } from "mocha";
import { assert } from "chai";
import { isSamePoint } from "./fun/isSamePoint";
import { MomentCalculator, Moment } from "../MomentCalculator";

describe("moment tests", () => {
  it("moment of two points test", () => {
    const calc = new MomentCalculator();
    const m1 = [10, 10, 10] as Moment;
    const m2 = [20, 20, 10] as Moment;
    const m = calc.sum(m1, m2);

    assert.equal(m[0], 30);
    assert.equal(m[1], 30);
    assert.equal(m[2], 20);

    isSamePoint(calc.center(m1, m2), [1.5, 1.5], "center");
    assert.equal(calc.mass(m1, m2), 20);
  });
});
