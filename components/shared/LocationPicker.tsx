"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { LatLng } from "@/components/shared/LocationPickerMap";

const SEMARANG_CENTER: LatLng = { lat: -6.9932, lng: 110.4203 };

const LocationPickerMap = dynamic(
  () => import("@/components/shared/LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-72 w-full items-center justify-center rounded-lg border text-sm text-muted-foreground">
        Memuat peta...
      </div>
    ),
  },
);

type LocationPickerProps = {
  value: LatLng | null;
  onChange: (position: LatLng) => void;
  error?: string;
};

export function LocationPicker({ value, onChange, error }: LocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocateError("Browser ini tidak mendukung deteksi lokasi");
      return;
    }

    setIsLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setIsLocating(false);
      },
      () => {
        setLocateError("Gagal mendeteksi lokasi. Pilih titik di peta.");
        setIsLocating(false);
      },
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Klik peta untuk menaruh pin, atau geser pin yang sudah ada.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onChange(SEMARANG_CENTER)}
          >
            Pusat Semarang
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={useMyLocation}
            disabled={isLocating}
          >
            {isLocating ? "Mencari..." : "Gunakan lokasi saya"}
          </Button>
        </div>
      </div>

      <LocationPickerMap value={value} onPick={onChange} />

      {value ? (
        <p className="text-sm text-muted-foreground">
          Titik terpilih: {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Belum ada titik dipilih.</p>
      )}

      {locateError ? (
        <p className="text-sm text-destructive">{locateError}</p>
      ) : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
