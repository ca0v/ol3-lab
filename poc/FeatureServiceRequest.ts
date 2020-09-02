export type FeatureServiceRequest = {
  f: "json";
  returnGeometry: boolean;
  returnCountOnly: boolean;
  spatialRel:
    | "esriSpatialRelIntersects"
    | "esriSpatialRelContains"
    | "esriSpatialRelEnvelopeIntersects";
  geometry: string;
  geometryType: "esriGeometryEnvelope";
  inSR: number;
  outFields: string;
  outSR: number;
};
