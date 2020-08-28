import { Extent } from "@ol/extent";
import { explode } from "./explode";
export function asExtent(
  rootExtent: Extent,
  point: { X: number; Y: number; Z: number }
) {
  const { X, Y, Z } = point;
  const scale = Math.pow(2, -Z);
  const rootInfo = explode(rootExtent);
  const dx = rootInfo.w * scale;
  const xmin = rootInfo.xmin + dx * X;
  const ymin = rootInfo.ymin + dx * Y;
  return [xmin, ymin, xmin + dx, ymin + dx] as Extent;
}
