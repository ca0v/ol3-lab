export const TINY = Math.pow(2, -24);

export function isInt(value: number) {
  return TINY > Math.abs(value - Math.round(value));
}

export function isEq(v1: number, v2: number, tiny = TINY) {
  return tiny > Math.abs(v1 - v2);
}

export function isLt(v1: number, v2: number) {
  return TINY < v2 - v1;
}

export function isGt(v1: number, v2: number) {
  return TINY < v1 - v2;
}
