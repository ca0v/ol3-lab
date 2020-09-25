import { TileTree } from "poc/TileTree";
import Feature from "@ol/Feature";
import Polygon from "@ol/geom/Polygon";
import { scaleFromCenter } from "@ol/extent";

let FID = 1;

export function createFeatureForTile(
  tree: TileTree<any>,
  tileIdentifier: { X: number; Y: number; Z: number },
  scale?: number
) {
  const feature = new Feature({ visible: true, fid: ++FID });
  const extent = tree.asExtent(tileIdentifier);
  if (scale) {
    scaleFromCenter(extent, scale);
  }
  const [xmin, ymin, xmax, ymax] = extent;

  feature.setGeometry(
    new Polygon([
      [
        [xmin, ymin],
        [xmin, ymax],
        [xmax, ymax],
        [xmax, ymin],
        [xmin, ymin],
      ],
    ])
  );
  return feature;
}
