// GeoJSON Geometry Types
export type IGeometricPosition = [number, number]; // [longitude, latitude]


export interface IPolygon {
  type: "Polygon";
  coordinates: IGeometricPosition[][];
}

export interface IMultiPolygon {
  type: "MultiPolygon";
  coordinates: IGeometricPosition[][][];
}

export type INationGeometry = IPolygon | IMultiPolygon;

// Properties for each nation (customize as needed)
export interface INationProperties {
  name: string;
  [key: string]: any; // Other properties (e.g., ISO codes, population, etc.)
}

// Feature
export interface INationFeature {
  type: "Feature";
  geometry: INationGeometry;
  properties: INationProperties;
  id?: string | number;
}

// FeatureCollection
export interface INationGeography {
  type: "FeatureCollection";
  features: INationFeature[];
}


