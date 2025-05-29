"use client";

import { useState, useEffect, useRef } from "react";
import LocationInput from "../components/LocationInput";
import ResultCard from "../components/ResultCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { FindNearestResponse } from "../types/index";

/**
 * Componente principal da página inicial do Mooveat.
 * Permite ao usuário buscar o McDonald's mais próximo usando diferentes algoritmos de rota.
 *
 * Principais funcionalidades:
 * - Permite ao usuário escolher entre o algoritmo Dijkstra (didático) e Google (realista).
 * - Recebe a localização do usuário e envia para a API /api/find-nearest.
 * - Exibe o resultado da busca, incluindo detalhes do percurso e desempenho do algoritmo.
 *
 * O algoritmo de Dijkstra é selecionado pelo usuário no dropdown e, ao ser escolhido, a busca é feita na API que executa o cálculo do caminho mais curto entre a localização do usuário e os McDonald's encontrados.
 */
export default function Home() {
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<FindNearestResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [algorithm, setAlgorithm] = useState<string>("dijkstra"); // Algoritmo selecionado pelo usuário
  const [lastLocation, setLastLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const isFirstSearch = useRef(true);

  useEffect(() => {
    // Sempre que o algoritmo for alterado após a primeira busca, refaz a busca com o novo algoritmo
    if (!isFirstSearch.current && lastLocation) {
      handleLocationSubmit(lastLocation.lat, lastLocation.lng, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithm]);

  /**
   * Envia a localização do usuário para a API /api/find-nearest.
   * O algoritmo selecionado (Dijkstra ou Google) é enviado no corpo da requisição.
   * O resultado é exibido na tela, incluindo detalhes do percurso e desempenho do algoritmo.
   * @param lat Latitude do usuário
   * @param lng Longitude do usuário
   * @param keepResult Se true, mantém o resultado anterior durante a troca de algoritmo
   */
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
      {/* Interface principal do app. Permite selecionar algoritmo e inserir localização. */}
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <header className="text-center mb-8">
          {/* Título e descrição */}
          <div className="text-6xl mb-4">🍔</div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Mooveat</h1>
          <p className="text-gray-600">
            Encontre o McDonald&apos;s mais próximo usando algoritmos de grafos
          </p>
        </header>
        {/* Seleção do algoritmo antes da busca */}
        {!result && !loading && (
          <div className="mb-6">
            <label
              htmlFor="algorithm-select"
              className="block font-medium text-gray-700 mb-2"
            >
              Selecione o Algoritmo
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
        {/* Input de localização */}
        {!result && !loading && (
          <LocationInput
            onLocationSubmit={handleLocationSubmit}
            loading={loading}
          />
        )}
        {/* Exibe spinner de carregamento */}
        {loading && <LoadingSpinner />}
        {/* Exibe erro, se houver */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-center">
              {/* Ícone de erro */}
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
        {/* Seleção do algoritmo após resultado, para comparar desempenho */}
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
              <option value="dijkstra">Dijkstra </option>
              <option value="google">Google Routes API </option>
            </select>
          </div>
        )}
        {/* Exibe o resultado da busca, incluindo percurso e informações do algoritmo */}
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
