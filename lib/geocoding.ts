const NOMINATIM_REVERSE_URL =
  "https://nominatim.openstreetmap.org/reverse";

export type GeocodeResult =
  | { ok: true; address: string }
  | { ok: false; error: string };

export async function reverseGeocode(
  lat: number,
  lng: number,
): Promise<GeocodeResult> {
  const params = new URLSearchParams({
    format: "jsonv2",
    lat: String(lat),
    lon: String(lng),
    zoom: "18",
    "accept-language": "id",
  });

  try {
    const response = await fetch(`${NOMINATIM_REVERSE_URL}?${params}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return { ok: false, error: "Layanan pencarian alamat sedang sibuk" };
    }

    const result = await response.json();
    const address = result?.display_name;

    if (typeof address !== "string" || address.length === 0) {
      return { ok: false, error: "Alamat tidak ditemukan untuk titik ini" };
    }

    return { ok: true, address };
  } catch {
    return { ok: false, error: "Gagal menghubungi layanan pencarian alamat" };
  }
}
