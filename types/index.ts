export interface Location {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: LocationType;
}

export type LocationType = "node" | "mcdonalds" | "user" | "intersection";

export interface McDonaldsLocation extends Location {
  address: string;
  type: "mcdonalds";
}

export interface GraphEdge {
  node: string;
  weight: number;
}

export interface PathResult {
  destination: Location;
  distance: number;
  path: Location[];
}

export interface FindNearestResponse {
  success: boolean;
  nearest: McDonaldsLocation;
  mcdonaldsList: McDonaldsLocation[];
  distance: number;
  path: Location[];
  estimatedTime: number;
  polyline?: string;
  address?: string;
  mcdonalds?: McDonaldsLocation;
}

export interface FindNearestRequest {
  userLat: number;
  userLng: number;
}

export interface ApiError {
  error: string;
}
