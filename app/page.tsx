"use client";

import { useState, useEffect, useRef } from "react";
import LocationInput from "../components/LocationInput";
import ResultCard from "../components/ResultCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { FindNearestResponse } from "../types/index";

export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<FindNearestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [algorithm, setAlgorithm] = useState<string>("dijkstra");
  const [lastLocation, setLastLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const isFirstSearch = useRef(true);

  useEffect(() => {
    if (!isFirstSearch.current && lastLocation) {
      handleLocationSubmit(lastLocation.lat, lastLocation.lng, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithm]);

  const handleLocationSubmit = async (
    lat: number,
    lng: number,
    keepResult?: boolean
  ): Promise<void> => {
    setLoading(true);
    setError(null);
    if (!keepResult) setResult(null);
    setLastLocation({ lat, lng });
    isFirstSearch.current = false;
    try {
      const response = await fetch("/api/find-nearest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userLat: lat,
          userLng: lng,
          algorithm,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao buscar McDonald's");
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleNewSearch = (): void => {
    setResult(null);
    setError(null);
    setLastLocation(null);
    isFirstSearch.current = true;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="text-center mb-8">
          <div className="text-6xl mb-4">🍔</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mooveat</h1>
          <p className="text-gray-600">
            Encontre o McDonald&apos;s mais próximo usando algoritmos de grafos
          </p>
        </header>

        {!result && !loading && (
          <div className="mb-6">
            <label
              htmlFor="algorithm-select"
              className="block font-medium text-gray-700 mb-2"
            >
              Desempenho do Algoritmo
            </label>
            <select
              id="algorithm-select"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              disabled={loading}
            >
              <option value="dijkstra">Dijkstra </option>
              <option value="google">Google Places Search </option>
            </select>
          </div>
        )}

        {!result && !loading && (
          <LocationInput
            onLocationSubmit={handleLocationSubmit}
            loading={loading}
          />
        )}

        {loading && <LoadingSpinner />}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              <svg
                className="w-5 h-5 text-red-600 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span className="text-red-800">{error}</span>
            </div>
          </div>
        )}

        {result && (
          <div className="mb-6">
            <label
              htmlFor="algorithm-select-after"
              className="block font-medium text-gray-700 mb-2"
            >
              Desempenho do Algoritmo
            </label>
            <select
              id="algorithm-select-after"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              disabled={loading}
            >
              <option value="dijkstra">Dijkstra (mais didático)</option>
              <option value="google">Google (mais realista)</option>
            </select>
          </div>
        )}

        <ResultCard result={result} onNewSearch={handleNewSearch} />

        <footer className="text-center text-gray-500 text-sm mt-8">
          <p>
            Algoritmo baseado em Dijkstra para encontrar o caminho mais curto.
          </p>
        </footer>
      </div>
    </div>
  );
}
