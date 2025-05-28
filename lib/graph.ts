// Graph implementation using adjacency list
export class Node {
  id: string;
  lat: number;
  lng: number;
  data: any;

  constructor(id: string, lat: number, lng: number, data?: any) {
    this.id = id;
    this.lat = lat;
    this.lng = lng;
    this.data = data;
  }
}

export class Edge {
  from: string;
  to: string;
  weight: number;

  constructor(from: string, to: string, weight: number) {
    this.from = from;
    this.to = to;
    this.weight = weight;
  }
}

export class Graph {
  private nodes: Map<string, Node>;
  private adjacencyList: Map<string, Edge[]>;

  constructor() {
    this.nodes = new Map();
    this.adjacencyList = new Map();
  }

  addNode(node: Node): void {
    this.nodes.set(node.id, node);
    if (!this.adjacencyList.has(node.id)) {
      this.adjacencyList.set(node.id, []);
    }
  }

  addEdge(edge: Edge): void {
    if (!this.adjacencyList.has(edge.from)) {
      this.adjacencyList.set(edge.from, []);
    }
    if (!this.adjacencyList.has(edge.to)) {
      this.adjacencyList.set(edge.to, []);
    }

    this.adjacencyList.get(edge.from)!.push(edge);
    // For undirected graph, add reverse edge
    this.adjacencyList
      .get(edge.to)!
      .push(new Edge(edge.to, edge.from, edge.weight));
  }

  getNode(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  getNeighbors(nodeId: string): Edge[] {
    return this.adjacencyList.get(nodeId) || [];
  }

  getAllNodes(): Node[] {
    return Array.from(this.nodes.values());
  }

  // Dijkstra's algorithm implementation
  dijkstra(
    startId: string,
    endId: string
  ): { distance: number; path: string[] } {
    const distances = new Map<string, number>();
    const previous = new Map<string, string | null>();
    const unvisited = new Set<string>();

    // Initialize distances
    for (const nodeId of this.nodes.keys()) {
      distances.set(nodeId, nodeId === startId ? 0 : Number.POSITIVE_INFINITY);
      previous.set(nodeId, null);
      unvisited.add(nodeId);
    }

    while (unvisited.size > 0) {
      // Find unvisited node with minimum distance
      let currentNode: string | null = null;
      let minDistance = Number.POSITIVE_INFINITY;

      for (const nodeId of unvisited) {
        const distance = distances.get(nodeId)!;
        if (distance < minDistance) {
          minDistance = distance;
          currentNode = nodeId;
        }
      }

      if (currentNode === null || minDistance === Number.POSITIVE_INFINITY) {
        break;
      }

      unvisited.delete(currentNode);

      if (currentNode === endId) {
        break;
      }

      // Update distances to neighbors
      const neighbors = this.getNeighbors(currentNode);
      for (const edge of neighbors) {
        if (unvisited.has(edge.to)) {
          const newDistance = distances.get(currentNode)! + edge.weight;
          if (newDistance < distances.get(edge.to)!) {
            distances.set(edge.to, newDistance);
            previous.set(edge.to, currentNode);
          }
        }
      }
    }

    // Reconstruct path
    const path: string[] = [];
    let current: string | null = endId;
    while (current !== null) {
      path.unshift(current);
      current = previous.get(current)!;
    }

    return {
      distance: distances.get(endId) || Number.POSITIVE_INFINITY,
      path: path,
    };
  }

  // Breadth-First Search
  bfs(startId: string, targetId: string): string[] {
    const visited = new Set<string>();
    const queue: { nodeId: string; path: string[] }[] = [
      { nodeId: startId, path: [startId] },
    ];

    while (queue.length > 0) {
      const { nodeId, path } = queue.shift()!;

      if (nodeId === targetId) {
        return path;
      }

      if (visited.has(nodeId)) {
        continue;
      }

      visited.add(nodeId);

      const neighbors = this.getNeighbors(nodeId);
      for (const edge of neighbors) {
        if (!visited.has(edge.to)) {
          queue.push({
            nodeId: edge.to,
            path: [...path, edge.to],
          });
        }
      }
    }

    return [];
  }

  // Find nearest node to given coordinates
  findNearestNode(lat: number, lng: number): Node | null {
    let nearestNode: Node | null = null;
    let minDistance = Number.POSITIVE_INFINITY;

    for (const node of this.nodes.values()) {
      const distance = this.calculateDistance(lat, lng, node.lat, node.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestNode = node;
      }
    }

    return nearestNode;
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
