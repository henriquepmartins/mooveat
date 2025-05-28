import type { Graph } from "./graph";
import type { McDonalds, UserLocation, DirectionStep } from "@/types";

export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function findNearestMcDonalds(
  userLocation: UserLocation,
  locations: McDonalds[],
  graph: Graph
): McDonalds | null {
  if (locations.length === 0) return null;

  // Simple nearest neighbor approach
  let nearest: McDonalds | null = null;
  let minDistance = Number.POSITIVE_INFINITY;

  for (const location of locations) {
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lng,
      location.lat,
      location.lng
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearest = location;
    }
  }

  return nearest;
}

export async function getDirections(
  from: UserLocation,
  to: McDonalds
): Promise<DirectionStep[]> {
  // Mock directions - in a real app, you'd use a routing service
  const distance = calculateDistance(from.lat, from.lng, to.lat, to.lng);
  const estimatedTime = Math.round(distance * 3); // Rough estimate: 3 minutes per km

  return [
    {
      instruction: "Head northeast on your current street",
      distance: 0.2,
      duration: 1,
    },
    {
      instruction: `Continue straight for ${(distance * 0.7).toFixed(1)} km`,
      distance: distance * 0.7,
      duration: Math.round(distance * 0.7 * 2),
    },
    {
      instruction: `Turn right toward ${to.name}`,
      distance: distance * 0.2,
      duration: Math.round(distance * 0.2 * 2),
    },
    {
      instruction: `Arrive at ${to.name} on your right`,
      distance: distance * 0.1,
      duration: 1,
    },
  ];
}
