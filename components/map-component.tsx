"use client";

import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import type { McDonalds, UserLocation, DirectionStep } from "@/types";

interface MapComponentProps {
  userLocation: UserLocation | null;
  nearestMcDonalds: McDonalds | null;
  allLocations: McDonalds[];
  directions: DirectionStep[];
  routeCoordinates: { lat: number; lng: number }[];
}

const saoLuisCenter = {
  lat: -2.529722, // Centro aproximado de São Luís, MA
  lng: -44.302778,
};

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const mcIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/732/732217.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

export default function MapComponent({
  userLocation,
  nearestMcDonalds,
  allLocations,
  directions,
  routeCoordinates,
}: MapComponentProps) {
  // Polyline points (rota)
  const routePoints: [number, number][] = routeCoordinates.map((coord) => [
    coord.lat,
    coord.lng,
  ]);

  // Centraliza no usuário, senão no centro de São Luís
  const center = userLocation || saoLuisCenter;

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={14}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* Marcador do usuário */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userIcon}
          >
            <Popup>Você está aqui</Popup>
          </Marker>
        )}
        {/* Marcadores dos McDonald's */}
        {allLocations.map((location) => (
          <Marker
            key={location.id}
            position={[location.lat, location.lng]}
            icon={mcIcon}
          >
            <Popup>{location.name}</Popup>
          </Marker>
        ))}
        {/* Rota */}
        {routePoints.length > 1 && (
          <Polyline positions={routePoints} color="red" />
        )}
      </MapContainer>
    </div>
  );
}
