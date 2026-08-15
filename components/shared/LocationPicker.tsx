"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

import type { LatLng } from "@/components/shared/LocationPickerMap";
import { Button } from "@/components/ui/button";
import { reverseGeocode } from "@/lib/geocoding";

const LocationPickerMap = dynamic(
  () => import("@/components/shared/LocationPickerMap"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-64 w-full items-center justify-center rounded-lg border border-input text-sm text-brand-ink/45">
        Memuat peta...
      </div>
    ),
  },
);

type LocationPickerProps = {
  value: LatLng | null;
  onChange: (position: LatLng) => void;
  onAddressResolved?: (address: string) => void;
  error?: string;
};

export function LocationPicker({
  value,
  onChange,
  onAddressResolved,
  error,
}: LocationPickerProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [isResolving, setIsResolving] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);

  async function pickPosition(position: LatLng) {
    onChange(position);

    if (!onAddressResolved) {
      return;
    }

    setIsResolving(true);
    setResolveError(null);

    const result = await reverseGeocode(position.lat, position.lng);
    setIsResolving(false);

    if (!result.ok) {
      setResolveError(`${result.error}. Tulis alamatnya manual di bawah.`);
      return;
    }

    onAddressResolved(result.address);
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocateError("Browser ini tidak mendukung deteksi lokasi");
      return;
    }

    setIsLocating(true);
    setLocateError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        pickPosition({
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
    <div className="flex flex-col gap-2.5">
      <LocationPickerMap value={value} onPick={pickPosition} />

      <div className="flex flex-wrap items-center justify-between gap-2">
        {isResolving ? (
          <p className="text-xs text-brand-ink/45">Mencari alamat titik ini...</p>
        ) : value ? (
          <p className="numeric text-xs text-brand-ink/45">
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </p>
        ) : (
          <p className="text-xs text-brand-ink/45">Belum ada titik dipilih.</p>
        )}

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

      {locateError ? (
        <p className="text-xs font-medium text-red-600">{locateError}</p>
      ) : null}
      {resolveError ? (
        <p className="text-xs font-medium text-amber-700">{resolveError}</p>
      ) : null}
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : null}
    </div>
  );
}
