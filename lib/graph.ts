import { Location, GraphEdge, PathResult, LocationType } from "../types";

class Graph {
  private adjacencyList: Map<string, GraphEdge[]>;
  private locations: Map<string, Location>;

  constructor() {
    this.adjacencyList = new Map();
    this.locations = new Map();
  }

  addLocation(
    id: string,
    name: string,
    lat: number,
    lng: number,
    type: LocationType = "node"
  ): void {
    this.locations.set(id, { id, name, lat, lng, type });
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, []);
    }
  }

  addEdge(location1: string, location2: string, weight?: number): void {
    const calculatedWeight =
      weight ||
      this.calculateDistance(
        this.locations.get(location1)!,
        this.locations.get(location2)!
      );

    this.adjacencyList
      .get(location1)
      ?.push({ node: location2, weight: calculatedWeight });
    this.adjacencyList
      .get(location2)
      ?.push({ node: location1, weight: calculatedWeight });
  }

  private calculateDistance(loc1: Location, loc2: Location): number {
    const R = 6371; // Raio da Terra em km
    const dLat = this.deg2rad(loc2.lat - loc1.lat);
    const dLon = this.deg2rad(loc2.lng - loc1.lng);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(loc1.lat)) *
        Math.cos(this.deg2rad(loc2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  dijkstra(
    startId: string,
    targetType: LocationType = "mcdonalds"
  ): PathResult | null {
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set<string>();

    // Inicializar distâncias
    for (const locationId of this.locations.keys()) {
      distances.set(locationId, Infinity);
      previous.set(locationId, null);
      unvisited.add(locationId);
    }
    distances.set(startId, 0);

    while (unvisited.size > 0) {
      // Encontrar o nó não visitado com menor distância
      let currentNode: string | null = null;
      let minDistance = Infinity;

      for (const nodeId of unvisited) {
        const distance = distances.get(nodeId)!;
        if (distance < minDistance) {
          minDistance = distance;
          currentNode = nodeId;
        }
      }

      if (currentNode === null) break;

      unvisited.delete(currentNode);

      // Se encontramos um McDonald's, retornar o resultado
      const currentLocation = this.locations.get(currentNode)!;
      if (currentLocation.type === targetType) {
        return {
          destination: currentLocation,
          distance: distances.get(currentNode)!,
          path: this.reconstructPath(previous, startId, currentNode),
        };
      }

      // Atualizar distâncias dos vizinhos
      const neighbors = this.adjacencyList.get(currentNode) || [];
      for (const neighbor of neighbors) {
        if (unvisited.has(neighbor.node)) {
          const newDistance = distances.get(currentNode)! + neighbor.weight;
          if (newDistance < distances.get(neighbor.node)!) {
            distances.set(neighbor.node, newDistance);
            previous.set(neighbor.node, currentNode);
          }
        }
      }
    }

    return null; // Nenhum McDonald's encontrado
  }

  private reconstructPath(
    previous: Map<string, string | null>,
    start: string,
    end: string
  ): Location[] {
    const path: Location[] = [];
    let current: string | null = end;

    while (current !== null) {
      path.unshift(this.locations.get(current)!);
      current = previous.get(current) || null;
    }

    return path;
  }

  findNearestMcDonalds(userLat: number, userLng: number): PathResult | null {
    // Adicionar localização do usuário
    const userId = "user-location";
    this.addLocation(userId, "Sua Localização", userLat, userLng, "user");

    // Conectar usuário aos pontos próximos (simulação)
    for (const [locationId, location] of this.locations) {
      if (locationId !== userId) {
        const distance = this.calculateDistance(
          {
            id: userId,
            name: "User",
            lat: userLat,
            lng: userLng,
            type: "user",
          },
          location
        );
        if (distance <= 5) {
          // Conectar apenas locais dentro de 5km
          this.addEdge(userId, locationId);
        }
      }
    }

    return this.dijkstra(userId, "mcdonalds");
  }
}

export default Graph;
