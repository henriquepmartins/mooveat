"use client";

import { useState } from "react";

interface LocationInputProps {
  onLocationSubmit: (lat: number, lng: number) => void;
  loading: boolean;
}

export default function LocationInput({
  onLocationSubmit,
  loading,
}: LocationInputProps) {
  const [address, setAddress] = useState<string>("");
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(false);

  const handleGetCurrentLocation = (): void => {
    if (navigator.geolocation) {
      setUseCurrentLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          onLocationSubmit(position.coords.latitude, position.coords.longitude);
          setUseCurrentLocation(false);
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          alert(
            "Não foi possível obter sua localização. Tente inserir o endereço manualmente."
          );
          setUseCurrentLocation(false);
        }
      );
    } else {
      alert("Geolocalização não é suportada neste navegador.");
    }
  };

  const handleAddressSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!address.trim()) return;

    // Simulação de geocodificação (em produção, usaria Google Maps API)
    const mockCoordinates: Record<string, { lat: number; lng: number }> = {
      centro: { lat: -2.5297, lng: -44.3028 },
      cohama: { lat: -2.5307, lng: -44.2982 },
      calhau: { lat: -2.4976, lng: -44.2194 },
      turu: { lat: -2.5441, lng: -44.2364 },
    };

    const addressLower = address.toLowerCase();
    let coords: { lat: number; lng: number } | null = null;

    for (const [key, value] of Object.entries(mockCoordinates)) {
      if (addressLower.includes(key)) {
        coords = value;
        break;
      }
    }

    if (!coords) {
      // Coordenadas padrão de São Luís
      coords = { lat: -2.5387, lng: -44.2825 };
    }

    onLocationSubmit(coords.lat, coords.lng);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Como você quer encontrar o McDonald&apos;s?
      </h2>

      <div className="space-y-4">
        <button
          onClick={handleGetCurrentLocation}
          disabled={loading || useCurrentLocation}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
        >
          <svg
            className="w-5 h-5"
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
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span>
            {useCurrentLocation
              ? "Obtendo localização..."
              : "Usar minha localização atual"}
          </span>
        </button>

        <div className="text-center text-gray-500 font-medium">OU</div>

        <form onSubmit={handleAddressSubmit} className="space-y-3">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Digite seu endereço (ex: Centro, Cohama, Calhau, Turu)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !address.trim()}
            className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
          >
            {loading ? "Buscando..." : "Buscar McDonald's"}
          </button>
        </form>
      </div>
    </div>
  );
}
