import { XY } from "poc/types/XY";

// mx, my, mass
export type Moment = [number, number, number];

export class MomentCalculator {
  sum(...moment: Moment[]) {
    const result = [0, 0, 0] as Moment;
    moment.forEach((m) => m.forEach((v, i) => (result[i] += v)));
    return result;
  }

  mass(...moment: Moment[]) {
    return moment.reduce((a, b) => a + b[2], 0);
  }

  center(...moment: Moment[]) {
    const [mx, my, m] = this.sum(...moment);
    return [mx / m, my / m] as XY;
  }
}
