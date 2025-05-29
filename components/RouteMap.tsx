"use client";

import "leaflet/dist/leaflet.css";

import L from "leaflet";

const MapProto = L.Map.prototype as any;
if (!MapProto._patched) {
  const originalInit = MapProto._initContainer;
  MapProto._initContainer = function (containerOrId: string | HTMLElement) {
    const container = L.DomUtil.get(containerOrId);
    if (container && (container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }
    return originalInit.call(this, containerOrId);
  };
  MapProto._patched = true;
}

import React, { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";

interface RouteMapProps {
  path: { lat: number; lng: number }[];
  mcdonalds: { name: string; lat: number; lng: number };
}

const homeIcon = new L.DivIcon({
  html: '<span style="font-size: 2rem;">🏠</span>',
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});
const mcIcon = new L.DivIcon({
  html: '<span style="font-size: 2rem;">🍟</span>',
  className: "",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

function RecenterMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
}

export default function RouteMap({ path, mcdonalds }: RouteMapProps) {
  if (!path || path.length < 2) return null;

  const center = useMemo<[number, number]>(
    () => [
      (path[0].lat + path[path.length - 1].lat) / 2,
      (path[0].lng + path[path.length - 1].lng) / 2,
    ],
    [path]
  );

  return (
    <div className="w-full h-72 rounded-lg overflow-hidden mb-2">
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
      >
        <RecenterMap center={center} />

        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={[path[0].lat, path[0].lng]} icon={homeIcon}>
          <Popup>Sua localização</Popup>
        </Marker>
        <Marker
          position={[path[path.length - 1].lat, path[path.length - 1].lng]}
          icon={mcIcon}
        >
          <Popup>{mcdonalds.name}</Popup>
        </Marker>

        <Polyline
          positions={path.map((p) => [p.lat, p.lng])}
          pathOptions={{ color: "red" }}
        />
      </MapContainer>
    </div>
  );
}
