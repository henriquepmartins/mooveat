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

export interface StepResult {
  instruction: string;
  distance: number;
  index: number;
}

export interface AlgorithmInfo {
  algorithm: string;
  nodesExplored: number;
  pathLength: number;
  executionTime: number;
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
  steps?: StepResult[];
  algorithmInfo?: AlgorithmInfo;
}

export interface FindNearestRequest {
  userLat: number;
  userLng: number;
}

export interface ApiError {
  error: string;
}
