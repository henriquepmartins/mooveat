export interface McDonalds {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  hours: string;
  rating: number;
  amenities: string[];
}

export interface UserLocation {
  lat: number;
  lng: number;
}

export interface DirectionStep {
  instruction: string;
  distance: number; // in kilometers
  duration: number; // in minutes
}

export interface GraphNode {
  id: string;
  lat: number;
  lng: number;
  data: McDonalds;
}

export interface GraphEdge {
  from: string;
  to: string;
  weight: number; // distance in kilometers
}
