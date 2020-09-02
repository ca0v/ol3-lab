import { Extent } from "@ol/extent";
import { explode } from "./explode";
import { XYZ } from "./XYZ";
import { isEq } from "./fun/tiny";

export function asXYZ(rootExtent: Extent, extent: Extent): XYZ {
  const rootInfo = explode(rootExtent);
  const nodeInfo = explode(extent);

  const z = Math.log2(rootInfo.w / nodeInfo.w);
  const Z = Math.round(z);
  const x = (Math.pow(2, Z) * (nodeInfo.xmin - rootInfo.xmin)) / rootInfo.w;
  const y = (Math.pow(2, Z) * (nodeInfo.ymin - rootInfo.ymin)) / rootInfo.h;
  const X = Math.round(x);
  const Y = Math.round(y);

  // allow for reasonable amount of error
  const TINY = Math.pow(2, -10);

  if (!isEq(Z - z, 0, TINY)) {
    debugger;
    throw "invalid extent: zoom";
  }

  if (!isEq(X - x, 0, TINY)) {
    throw "invalid extent: xmin";
  }

  if (!isEq(Y - y, 0, TINY)) {
    throw "invalid extent: ymin";
  }

  return { X, Y, Z };
}
