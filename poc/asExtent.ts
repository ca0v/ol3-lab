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
  const dy = rootInfo.h * scale;
  const xmin = rootInfo.xmin + dx * X;
  const ymin = rootInfo.ymin + dy * Y;
  return [xmin, ymin, xmin + dx, ymin + dy] as Extent;
}
