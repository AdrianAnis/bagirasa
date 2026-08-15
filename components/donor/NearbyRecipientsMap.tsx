"use client";

import "leaflet/dist/leaflet.css";

import { divIcon } from "leaflet";
import { Circle, MapContainer, Marker, Popup, TileLayer } from "react-leaflet";

import { MAX_RADIUS_KM } from "@/lib/config";
import type { NearbyRecipient } from "@/lib/db/nearby";

const donorIcon = divIcon({
  className: "",
  html: '<div style="width:26px;height:26px;border-radius:9999px;background:#14392c;border:3px solid #ffffff;box-shadow:0 1px 6px rgba(0,0,0,0.4)"></div>',
  iconSize: [26, 26],
  iconAnchor: [13, 13],
});

const activeIcon = divIcon({
  className: "",
  html: '<div style="width:20px;height:20px;border-radius:9999px;background:#0f8a57;border:3px solid #ffffff;box-shadow:0 1px 5px rgba(0,0,0,0.35)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

const idleIcon = divIcon({
  className: "",
  html: '<div style="width:20px;height:20px;border-radius:9999px;background:#b6c2bd;border:3px solid #ffffff;box-shadow:0 1px 5px rgba(0,0,0,0.25)"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

type NearbyRecipientsMapProps = {
  donorName: string;
  donorLat: number;
  donorLng: number;
  recipients: NearbyRecipient[];
};

export default function NearbyRecipientsMap({
  donorName,
  donorLat,
  donorLng,
  recipients,
}: NearbyRecipientsMapProps) {
  return (
    <MapContainer
      center={[donorLat, donorLng]}
      zoom={12}
      scrollWheelZoom
      className="h-96 w-full rounded-lg border border-input"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Circle
        center={[donorLat, donorLng]}
        radius={MAX_RADIUS_KM * 1000}
        pathOptions={{
          color: "#23674e",
          weight: 1,
          opacity: 0.35,
          fillColor: "#23674e",
          fillOpacity: 0.04,
        }}
      />

      <Marker position={[donorLat, donorLng]} icon={donorIcon}>
        <Popup>
          <span className="font-medium">{donorName}</span>
          <br />
          Restoranmu
        </Popup>
      </Marker>

      {recipients.map((recipient) => (
        <Marker
          key={recipient.id}
          position={[recipient.lat, recipient.lng]}
          icon={recipient.currentNeed > 0 ? activeIcon : idleIcon}
        >
          <Popup>
            <span className="font-medium">{recipient.name}</span>
            <br />
            {recipient.distanceKm.toFixed(1)} km dari restoranmu
            <br />
            {recipient.currentNeed > 0
              ? `Butuh ${recipient.currentNeed} porsi hari ini`
              : "Belum membuka kebutuhan"}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
