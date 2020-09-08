import { assert } from "chai";
import { isEq } from "poc/fun/tiny";
export function isSamePoint<T extends number[]>(a: T, b: T, message: string) {
  console.log(a);
  a.forEach((v, i) => assert.isTrue(isEq(v, b[i]), `${i}:${message}`));
}
