"use client";

import "leaflet/dist/leaflet.css";

import { divIcon } from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";

export type LatLng = {
  lat: number;
  lng: number;
};

export const SEMARANG_CENTER: LatLng = { lat: -6.9932, lng: 110.4203 };

const pinIcon = divIcon({
  className: "",
  html: '<div style="width:22px;height:22px;border-radius:9999px;background:#23674e;border:3px solid #ffffff;box-shadow:0 1px 6px rgba(0,0,0,0.4)"></div>',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

type ClickHandlerProps = {
  onPick: (position: LatLng) => void;
};

function ClickHandler({ onPick }: ClickHandlerProps) {
  useMapEvents({
    click(event) {
      onPick({ lat: event.latlng.lat, lng: event.latlng.lng });
    },
  });

  return null;
}

type LocationPickerMapProps = {
  value: LatLng | null;
  onPick: (position: LatLng) => void;
};

export default function LocationPickerMap({
  value,
  onPick,
}: LocationPickerMapProps) {
  const center = value ?? SEMARANG_CENTER;

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={value ? 16 : 12}
      scrollWheelZoom
      className="h-72 w-full rounded-lg border"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickHandler onPick={onPick} />
      {value ? (
        <Marker
          position={[value.lat, value.lng]}
          icon={pinIcon}
          draggable
          eventHandlers={{
            dragend(event) {
              const position = event.target.getLatLng();
              onPick({ lat: position.lat, lng: position.lng });
            },
          }}
        />
      ) : null}
    </MapContainer>
  );
}
