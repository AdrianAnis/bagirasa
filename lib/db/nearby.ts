import { MAX_RADIUS_KM } from "@/lib/config";
import { getCurrentDonor } from "@/lib/db/donors";
import { haversineKm } from "@/lib/matching";
import { createClient } from "@/lib/supabase/server";

export type NearbyRecipient = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  capacity: number;
  currentNeed: number;
  allergenRestrictions: string[];
  halalOnly: boolean;
  lastReceivedAt: string | null;
  distanceKm: number;
  isInRadius: boolean;
};

export type NearbyRecipients = {
  donorName: string;
  donorLat: number;
  donorLng: number;
  recipients: NearbyRecipient[];
};

export async function listNearbyRecipients(): Promise<NearbyRecipients | null> {
  const donor = await getCurrentDonor();

  if (!donor) {
    return null;
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("verified_recipients");

  if (error) {
    throw new Error(`Gagal memuat daftar lembaga: ${error.message}`);
  }

  const origin = { lat: Number(donor.lat), lng: Number(donor.lng) };

  const recipients: NearbyRecipient[] = (data ?? [])
    .map((row) => {
      const lat = Number(row.lat);
      const lng = Number(row.lng);
      const distanceKm = haversineKm(origin, { lat, lng });

      return {
        id: row.id,
        name: row.name,
        lat,
        lng,
        capacity: row.capacity,
        currentNeed: row.current_need,
        allergenRestrictions: row.allergen_restrictions,
        halalOnly: row.halal_only,
        lastReceivedAt: row.last_received_at,
        distanceKm,
        isInRadius: distanceKm <= MAX_RADIUS_KM,
      };
    })
    .sort((first, second) => first.distanceKm - second.distanceKm);

  return {
    donorName: donor.name,
    donorLat: origin.lat,
    donorLng: origin.lng,
    recipients,
  };
}
