import { NextRequest, NextResponse } from "next/server";
import Graph from "../../../lib/graph";

const GOOGLE_MAPS_API_KEY = process.env.MAPS_API_KEY;

/**
 * API Route: /api/find-nearest
 *
 * Recebe a localização do usuário e retorna o McDonald's mais próximo, usando dois algoritmos possíveis:
 * - Google Places + Google Routes API (realista)
 * - Google Places + Dijkstra (didático)
 *
 * O algoritmo de Dijkstra é implementado manualmente usando a classe Graph (em lib/graph).
 * O grafo é montado com o usuário como nó inicial e os McDonald's como nós de destino.
 * As arestas são criadas entre o usuário e cada McDonald's, e o Dijkstra encontra o caminho mais curto.
 */

if (!GOOGLE_MAPS_API_KEY) {
  console.error("MAPS_API_KEY não definido no ambiente", process.env);
  throw new Error("MAPS_API_KEY não definido no ambiente");
}

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    const body = await request.json();
    const { userLat, userLng, algorithm } = body;
    console.log("Body recebido:", body);

    if (!userLat || !userLng) {
      return NextResponse.json(
        { error: "Latitude e longitude são obrigatórias" },
        { status: 400 }
      );
    }

    type PlaceResult = {
      id: string;
      displayName?: { text: string };
      location?: { latitude: number; longitude: number };
      formattedAddress?: string;
      types?: string[];
    };

    // 1. Buscar McDonald's mais próximo usando Google Places Text Search (NEW API)
    async function buscarMcDonaldsTextSearch(radius: number) {
      // Busca McDonald's próximos usando a API do Google Places
      // Retorna até 10 resultados em um raio definido
      const url = "https://places.googleapis.com/v1/places:searchText";
      const body = {
        textQuery: "McDonald's",
        locationBias: {
          circle: {
            center: {
              latitude: userLat,
              longitude: userLng,
            },
            radius: radius,
          },
        },
        languageCode: "pt-BR",
        maxResultCount: 10,
      };
      const headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_MAPS_API_KEY!,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.location,places.formattedAddress,places.types",
      };
      console.log("Buscando McDonald's (Text Search API) com:", {
        url,
        body,
        headers,
      });
      const res = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });
      const data = await res.json();
      console.log("Resposta do Google Places Text Search:", data);
      if (!data.places || data.places.length === 0) return null;
      // Loga todos os nomes e endereços retornados para depuração
      console.log(
        "Resultados retornados pelo Places Text Search API:",
        data.places.map((p: PlaceResult) => ({
          nome: p.displayName?.text,
          endereco: p.formattedAddress,
        }))
      );
      // Retorna todos os resultados
      return data.places as PlaceResult[];
    }

    let results = await buscarMcDonaldsTextSearch(5000);
    if (!results) results = await buscarMcDonaldsTextSearch(10000);
    if (!results) results = await buscarMcDonaldsTextSearch(20000);

    if (!results) {
      console.warn(
        "Nenhum McDonald's encontrado na região. Última resposta:",
        results
      );
      return NextResponse.json(
        { error: "Nenhum McDonald's encontrado na região" },
        { status: 404 }
      );
    }

    // Monta lista de McDonald's encontrados
    const mcdonaldsList = (results as PlaceResult[]).map((mc) => ({
      id: mc.id,
      name: mc.displayName?.text || "McDonald's",
      lat: mc.location?.latitude,
      lng: mc.location?.longitude,
      address: mc.formattedAddress || "",
      type: "mcdonalds",
    }));

    // Pega o mais próximo (primeiro da lista)
    const mc = mcdonaldsList[0];

    // Algoritmo de rota: Google ou Dijkstra
    if (algorithm === "dijkstra") {
      // --- Dijkstra ---
      /**
       * Implementação do algoritmo de Dijkstra:
       * 1. Cria um grafo com o usuário e todos os McDonald's como nós.
       * 2. Adiciona arestas do usuário para cada McDonald's.
       * 3. Executa o método dijkstra da classe Graph, que retorna o caminho mais curto.
       * 4. Monta a resposta com o percurso, distância, tempo estimado e informações do algoritmo.
       */
      const graph = new Graph();
      // Adiciona todos os McDonald's como nós do grafo
      mcdonaldsList
        .filter(
          (mc) => typeof mc.lat === "number" && typeof mc.lng === "number"
        )
        .forEach((mc) => {
          graph.addLocation(mc.id, mc.name, mc.lat!, mc.lng!, "mcdonalds");
        });
      // Adiciona o usuário como nó inicial
      graph.addLocation("user", "Sua Localização", userLat, userLng, "user");
      // Cria arestas do usuário para cada McDonald's
      mcdonaldsList
        .filter(
          (mc) => typeof mc.lat === "number" && typeof mc.lng === "number"
        )
        .forEach((mc) => {
          graph.addEdge("user", mc.id);
        });
      // Executa o algoritmo de Dijkstra para encontrar o caminho mais curto até um McDonald's
      const dijkstraResult = graph.dijkstra("user", "mcdonalds");
      if (!dijkstraResult) {
        return NextResponse.json(
          {
            error:
              "Não foi possível calcular a rota até o McDonald's (Dijkstra).",
          },
          { status: 500 }
        );
      }
      // Monta o percurso e resposta
      const path = dijkstraResult.path.map(
        (loc: import("../../../types").Location) => ({
          lat: loc.lat,
          lng: loc.lng,
        })
      );
      const distanceKm = dijkstraResult.distance;
      const estimatedTime = Math.round((distanceKm / 40) * 60); // Supondo 40km/h
      const steps = dijkstraResult.path.map(
        (loc: import("../../../types").Location, idx: number) => ({
          instruction: idx === 0 ? "Início" : `Vá para ${loc.name}`,
          distance:
            idx === 0
              ? 0
              : graph["calculateDistance"](
                  {
                    ...dijkstraResult.path[idx - 1],
                    lat: dijkstraResult.path[idx - 1].lat ?? 0,
                    lng: dijkstraResult.path[idx - 1].lng ?? 0,
                  },
                  { ...loc, lat: loc.lat ?? 0, lng: loc.lng ?? 0 }
                ),
          index: idx + 1,
        })
      );
      const polyline = undefined;
      const endTime = Date.now();
      const algorithmInfo = {
        algorithm: "Google Places Text Search + Dijkstra",
        nodesExplored: dijkstraResult.path.length,
        pathLength: dijkstraResult.path.length,
        executionTime: (endTime - startTime) / 1000,
      };
      const response = {
        success: true,
        mcdonaldsList, // todos os McDonald's encontrados
        nearest: mc, // o mais próximo
        distance: distanceKm, // km
        path, // array de {lat, lng}
        estimatedTime, // minutos
        polyline, // para uso futuro se quiser
        address: mc.address,
        steps, // percurso detalhado
        algorithmInfo, // info técnica
      };
      return NextResponse.json(response);
    } else {
      // --- Google Routes API (default) ---
      // Usa a API do Google para calcular a rota realista de carro
      // Se falhar, faz fallback para Dijkstra
      const routesUrl = `https://routes.googleapis.com/directions/v2:computeRoutes?key=${GOOGLE_MAPS_API_KEY}`;
      const routesBody = {
        origin: {
          location: {
            latLng: {
              latitude: userLat,
              longitude: userLng,
            },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: mc.lat ?? 0,
              longitude: mc.lng ?? 0,
            },
          },
        },
        travelMode: "DRIVE",
        languageCode: "pt-BR",
      };
      try {
        const routesRes = await fetch(routesUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-FieldMask":
              "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline,routes.legs",
          },
          body: JSON.stringify(routesBody),
        });
        const routesData = await routesRes.json();
        if (!routesData.routes || routesData.routes.length === 0) {
          throw new Error("Routes API não retornou rotas");
        }
        const route = routesData.routes[0];
        const leg = route.legs[0];
        const steps = (leg.steps || []).map(
          (
            step: {
              navigationInstruction?: { instructions?: string };
              distanceMeters: number;
            },
            idx: number
          ) => ({
            instruction: step.navigationInstruction?.instructions || "",
            distance: step.distanceMeters,
            index: idx + 1,
          })
        );
        const polyline = route.polyline.encodedPolyline;
        function decodePolyline(encoded: string) {
          const points = [];
          let index = 0;
          const len = encoded.length;
          let lat = 0;
          let lng = 0;
          while (index < len) {
            let b,
              shift = 0;
            let result = 0;
            do {
              b = encoded.charCodeAt(index++) - 63;
              result |= (b & 0x1f) << shift;
              shift += 5;
            } while (b >= 0x20);
            const dlat = result & 1 ? ~(result >> 1) : result >> 1;
            lat += dlat;
            shift = 0;
            result = 0;
            do {
              b = encoded.charCodeAt(index++) - 63;
              result |= (b & 0x1f) << shift;
              shift += 5;
            } while (b >= 0x20);
            const dlng = result & 1 ? ~(result >> 1) : result >> 1;
            lng += dlng;
            points.push({
              lat: lat / 1e5,
              lng: lng / 1e5,
            });
          }
          return points;
        }
        const path = decodePolyline(polyline);
        const distanceKm = leg.distanceMeters / 1000;
        const estimatedTime = Math.round(leg.duration.seconds / 60);
        const endTime = Date.now();
        const algorithmInfo = {
          algorithm: "Google Places Text Search + Google Routes API",
          nodesExplored: mcdonaldsList.length,
          pathLength: steps.length,
          executionTime: (endTime - startTime) / 1000,
        };
        const response = {
          success: true,
          mcdonaldsList, // todos os McDonald's encontrados
          nearest: mc, // o mais próximo
          distance: distanceKm, // km
          path, // array de {lat, lng}
          estimatedTime, // minutos
          polyline, // para uso futuro se quiser
          address: mc.address,
          steps, // percurso detalhado
          algorithmInfo, // info técnica
        };
        return NextResponse.json(response);
      } catch {
        // Fallback para Dijkstra (mesma lógica do bloco acima)
        const graph = new Graph();
        mcdonaldsList
          .filter(
            (mc) => typeof mc.lat === "number" && typeof mc.lng === "number"
          )
          .forEach((mc) => {
            graph.addLocation(mc.id, mc.name, mc.lat!, mc.lng!, "mcdonalds");
          });
        graph.addLocation("user", "Sua Localização", userLat, userLng, "user");
        mcdonaldsList
          .filter(
            (mc) => typeof mc.lat === "number" && typeof mc.lng === "number"
          )
          .forEach((mc) => {
            graph.addEdge("user", mc.id);
          });
        const dijkstraResult = graph.dijkstra("user", "mcdonalds");
        if (!dijkstraResult) {
          return NextResponse.json(
            {
              error:
                "Não foi possível calcular a rota até o McDonald's (Dijkstra).",
            },
            { status: 500 }
          );
        }
        const path = dijkstraResult.path.map(
          (loc: import("../../../types").Location) => ({
            lat: loc.lat,
            lng: loc.lng,
          })
        );
        const distanceKm = dijkstraResult.distance;
        const estimatedTime = Math.round((distanceKm / 40) * 60); // Supondo 40km/h
        const steps = dijkstraResult.path.map(
          (loc: import("../../../types").Location, idx: number) => ({
            instruction: idx === 0 ? "Início" : `Vá para ${loc.name}`,
            distance:
              idx === 0
                ? 0
                : graph["calculateDistance"](
                    {
                      ...dijkstraResult.path[idx - 1],
                      lat: dijkstraResult.path[idx - 1].lat ?? 0,
                      lng: dijkstraResult.path[idx - 1].lng ?? 0,
                    },
                    { ...loc, lat: loc.lat ?? 0, lng: loc.lng ?? 0 }
                  ),
            index: idx + 1,
          })
        );
        const polyline = undefined;
        const endTime = Date.now();
        const algorithmInfo = {
          algorithm: "Google Places Text Search + Dijkstra",
          nodesExplored: dijkstraResult.path.length,
          pathLength: dijkstraResult.path.length,
          executionTime: (endTime - startTime) / 1000,
        };
        const response = {
          success: true,
          mcdonaldsList, // todos os McDonald's encontrados
          nearest: mc, // o mais próximo
          distance: distanceKm, // km
          path, // array de {lat, lng}
          estimatedTime, // minutos
          polyline, // para uso futuro se quiser
          address: mc.address,
          steps, // percurso detalhado
          algorithmInfo, // info técnica
        };
        return NextResponse.json(response);
      }
    }
  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", detalhe: String(error) },
      { status: 500 }
    );
  }
}
