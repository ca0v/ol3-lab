import { Extent, getCenter, getHeight, getWidth } from "@ol/extent";
import Point from "@ol/geom/Point";
import Feature from "@ol/Feature";

export function createWeightedFeature(
  featureCountPerQuadrant: number[],
  extent: Extent
) {
  const weight = featureCountPerQuadrant.reduce((a, b) => a + b, 0);
  if (!weight) return;

  const dx =
    featureCountPerQuadrant[0] +
    featureCountPerQuadrant[3] -
    featureCountPerQuadrant[1] -
    featureCountPerQuadrant[2];
  const dy =
    featureCountPerQuadrant[0] +
    featureCountPerQuadrant[1] -
    featureCountPerQuadrant[2] -
    featureCountPerQuadrant[3];

  const [cx, cy] = getCenter(extent);
  const width = getWidth(extent) / 2;
  const height = getHeight(extent) / 2;
  const center = new Point([
    cx + width * (dx / weight),
    cy + height * (dy / weight),
  ]);

  const x = cx + (dx / weight) * (width / 2);
  const y = cy + (dy / weight) * (height / 2);

  const feature = new Feature(new Point([x, y]));
  feature.setProperties({ count: weight });
  return feature;
}
