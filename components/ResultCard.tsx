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

  const { nearest, mcdonaldsList, distance, estimatedTime, path } = result;
  const mc = nearest || result.mcdonalds; // fallback para compatibilidade
  if (!mc) return <div>Nenhum McDonald's encontrado.</div>;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            McDonald's mais próximo encontrado!
          </h2>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
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
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
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

      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <h3 className="font-semibold text-gray-800 mb-2">{mc.name}</h3>
        <p className="text-gray-600 text-sm">{mc.address}</p>
      </div>

      {path && path.length > 1 && (
        <div className="mb-4">
          <h4 className="font-medium text-gray-800 mb-2">Rota sugerida:</h4>
          <div className="bg-blue-50 rounded-lg p-3 mb-4">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-700">{`De sua localização até ${mc.name}`}</span>
            </div>
          </div>
          <RouteMap path={path} mcdonalds={mc} />
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
