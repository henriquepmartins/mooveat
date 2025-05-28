"use client";

import { FindNearestResponse } from "../types";
import dynamic from "next/dynamic";

interface ResultCardProps {
  result: FindNearestResponse | null;
  onNewSearch: () => void;
}

const RouteMap = dynamic(() => import("./RouteMap"), { ssr: false });

export default function ResultCard({ result, onNewSearch }: ResultCardProps) {
  if (!result) return null;

  const {
    nearest,
    mcdonaldsList,
    distance,
    estimatedTime,
    path,
    steps,
    algorithmInfo,
  } = result;
  const mc = nearest || result.mcdonalds; // fallback para compatibilidade
  if (!mc) return <div>Nenhum McDonald's encontrado.</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      {/* Card técnico do algoritmo */}
      {algorithmInfo && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
          <div className="flex items-center mb-2">
            <span className="text-blue-600 text-lg mr-2">☆</span>
            <span className="font-semibold text-blue-900 text-base">
              Desempenho do Algoritmo
            </span>
          </div>
          <div className="text-sm text-blue-900 grid grid-cols-2 gap-2">
            <div>
              <span className="font-medium">Algoritmo:</span>
              <span className="ml-2 bg-blue-100 px-2 py-0.5 rounded text-xs border border-blue-200">
                {algorithmInfo.algorithm}
              </span>
            </div>
            <div>
              <span className="font-medium">Nós explorados:</span>{" "}
              {algorithmInfo.nodesExplored}
            </div>
            <div>
              <span className="font-medium">Tamanho do caminho:</span>{" "}
              {algorithmInfo.pathLength} segmentos
            </div>
            <div>
              <span className="font-medium">Tempo de execução:</span>{" "}
              {algorithmInfo.executionTime.toFixed(2)}s
            </div>
          </div>
          <div className="text-xs text-blue-800 mt-3">
            {algorithmInfo.algorithm.includes("Dijkstra") ? (
              <>
                <b>Dijkstra:</b> Algoritmo clássico de grafos que encontra o
                caminho mais curto entre dois pontos, explorando nós vizinhos e
                acumulando o menor custo até o destino. Ideal para mapas
                personalizados, áreas fechadas ou quando a rota do Google não
                está disponível.
              </>
            ) : (
              <>
                <b>Google Routes API:</b> Utiliza algoritmos proprietários do
                Google para calcular rotas otimizadas em tempo real,
                considerando trânsito, vias e restrições urbanas.
              </>
            )}
          </div>
        </div>
      )}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            <span className="mr-2">🍟</span>McDonald's mais próximo encontrado!
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <span className="text-lg">🏠</span>
              <span>{distance.toFixed(2)} km</span>
            </span>
            <span className="flex items-center space-x-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>~{estimatedTime} min</span>
            </span>
          </div>
        </div>
        <div className="text-4xl">🍟</div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4 mb-4 flex items-center">
        <span className="text-2xl mr-2">🍟</span>
        <div>
          <h3 className="font-semibold text-gray-800 mb-2 flex items-center">
            {mc.name}
            <span className="ml-2 text-lg">📍</span>
          </h3>
          <p className="text-gray-600 text-sm">{mc.address}</p>
        </div>
      </div>

      {path && path.length > 1 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">Rota sugerida:</h4>
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-700">
                <span className="text-lg">🏠</span> Sua localização
                <span className="mx-2">→</span>
                <span className="text-lg">🍟</span> {mc.name}
              </span>
            </div>
          </div>
          <RouteMap path={path} mcdonalds={mc} />
        </div>
      )}

      {/* Percurso detalhado */}
      {steps && steps.length > 0 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">
            Percurso detalhado:
          </h4>
          <ol className="list-decimal ml-6 text-gray-700 text-sm">
            {steps.map((step) => (
              <li key={step.index} className="mb-1 flex items-center">
                <span className="mr-2 text-red-500 font-bold">
                  {step.index}
                </span>
                <span>
                  {step.instruction}{" "}
                  <span className="text-xs text-gray-500">
                    ({(step.distance / 1000).toFixed(2)} km)
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          onClick={onNewSearch}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Nova Busca
        </button>
        <button
          onClick={() => {
            const url = `https://www.google.com/maps/dir/?api=1&destination=${mc.lat},${mc.lng}`;
            window.open(url, "_blank");
          }}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
        >
          Abrir no Maps
        </button>
      </div>
    </div>
  );
}
