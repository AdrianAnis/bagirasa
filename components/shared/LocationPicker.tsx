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
      <div className="flex h-72 w-full items-center justify-center rounded-lg border text-sm text-brand-ink/55">
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
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-brand-ink/55">
          Klik peta untuk menaruh pin, atau geser pin yang sudah ada.
        </p>
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

      <LocationPickerMap value={value} onPick={pickPosition} />

      {isResolving ? (
        <p className="text-sm text-brand-ink/55">Mencari alamat titik ini...</p>
      ) : value ? (
        <p className="numeric text-sm text-brand-ink/45">
          {value.lat.toFixed(6)}, {value.lng.toFixed(6)}
        </p>
      ) : (
        <p className="text-sm text-brand-ink/55">Belum ada titik dipilih.</p>
      )}

      {locateError ? (
        <p className="text-sm text-red-700">{locateError}</p>
      ) : null}
      {resolveError ? (
        <p className="text-sm text-amber-700">{resolveError}</p>
      ) : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}
