export type FeatureServiceRequest = {
  f: "json";
  returnGeometry: boolean;
  returnCountOnly: boolean;
  spatialRel:
    | "esriSpatialRelTouches"
    | "esriSpatialRelIntersects"
    | "esriSpatialRelContains"
    | "esriSpatialRelEnvelopeIntersects";
  geometry: string;
  geometryType: "esriGeometryEnvelope" | "esriGeometryPolyline";
  inSR: number;
  outFields: string;
  outSR: number;
};
