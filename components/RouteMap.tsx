import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface RouteMapProps {
  path: { lat: number; lng: number }[];
  mcdonalds: { name: string; lat: number; lng: number };
}

export default function RouteMap({ path, mcdonalds }: RouteMapProps) {
  if (!path || path.length < 2) return null;
  return (
    <div className="w-full h-72 rounded-lg overflow-hidden mb-2">
      <MapContainer
        center={[
          (path[0].lat + path[path.length - 1].lat) / 2,
          (path[0].lng + path[path.length - 1].lng) / 2,
        ]}
        zoom={13}
        style={{ width: "100%", height: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[path[0].lat, path[0].lng]}>
          <Popup>Sua localização</Popup>
        </Marker>
        <Marker
          position={[path[path.length - 1].lat, path[path.length - 1].lng]}
        >
          <Popup>{mcdonalds.name}</Popup>
        </Marker>
        <Polyline
          positions={path.map((loc) => [loc.lat, loc.lng])}
          color="red"
        />
      </MapContainer>
    </div>
  );
}
