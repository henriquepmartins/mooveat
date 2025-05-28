import { NextRequest, NextResponse } from "next/server";

const GOOGLE_MAPS_API_KEY = process.env.MAPS_API_KEY;

if (!GOOGLE_MAPS_API_KEY) {
  console.error("MAPS_API_KEY não definido no ambiente", process.env);
  throw new Error("MAPS_API_KEY não definido no ambiente");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userLat, userLng } = body;
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

    // 2. Buscar rota real usando Google Routes API v2 para o mais próximo
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
            latitude: mc.lat,
            longitude: mc.lng,
          },
        },
      },
      travelMode: "DRIVE",
      languageCode: "pt-BR",
    };
    console.log("Buscando rota com Routes API v2:", routesUrl, routesBody);
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
    console.log("Resposta do Google Routes API v2:", routesData);

    if (!routesData.routes || routesData.routes.length === 0) {
      console.warn("Routes API não retornou rotas:", routesData);
      return NextResponse.json(
        { error: "Não foi possível calcular a rota até o McDonald's." },
        { status: 500 }
      );
    }

    const route = routesData.routes[0];
    const leg = route.legs[0];
    // Polyline pode estar em route.polyline.encodedPolyline
    const polyline = route.polyline.encodedPolyline;
    // Decodifica polyline para array de coordenadas
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

    const response = {
      success: true,
      mcdonaldsList, // todos os McDonald's encontrados
      nearest: mc, // o mais próximo
      distance: leg.distanceMeters / 1000, // km
      path, // array de {lat, lng}
      estimatedTime: Math.round(leg.duration.seconds / 60), // minutos
      polyline, // para uso futuro se quiser
      address: mc.address,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro na API:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", detalhe: String(error) },
      { status: 500 }
    );
  }
}
