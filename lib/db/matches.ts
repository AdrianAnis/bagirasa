import { getCurrentDonor } from "@/lib/db/donors";
import {
  allocateAuto,
  allocateManual,
  type Coordinate,
  type DonationProfile,
  type MatchCandidate,
  type MatchingOutcome,
} from "@/lib/matching";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type DonationMatch =
  Database["public"]["Tables"]["donation_matches"]["Row"];

export type MatchingResult =
  | { ok: true; data: MatchingOutcome }
  | { ok: false; error: string };

type DonationContext = {
  donorLocation: Coordinate;
  donation: DonationProfile;
};

async function loadDonationContext(
  donationId: string,
): Promise<DonationContext | null> {
  const donor = await getCurrentDonor();

  if (!donor) {
    return null;
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from("food_donations")
    .select("id, donor_id, food_items(servings, is_halal, allergens)")
    .eq("id", donationId)
    .eq("donor_id", donor.id)
    .single();

  if (!data || data.food_items.length === 0) {
    return null;
  }

  const totalServings = data.food_items.reduce(
    (total, item) => total + item.servings,
    0,
  );

  const isHalal = data.food_items.every((item) => item.is_halal);

  const allergens = Array.from(
    new Set(data.food_items.flatMap((item) => item.allergens)),
  );

  return {
    donorLocation: { lat: Number(donor.lat), lng: Number(donor.lng) },
    donation: { totalServings, isHalal, allergens },
  };
}

async function loadCandidates(): Promise<MatchCandidate[]> {
  const supabase = await createClient();

  const { data } = await supabase.rpc("verified_recipients");

  if (!data) {
    return [];
  }

  return data.map((row) => ({
    id: row.id,
    name: row.name,
    lat: Number(row.lat),
    lng: Number(row.lng),
    capacity: row.capacity,
    currentNeed: row.current_need,
    allergenRestrictions: row.allergen_restrictions,
    halalOnly: row.halal_only,
    lastReceivedAt: row.last_received_at,
  }));
}

export async function previewMatches(
  donationId: string,
  selectedIds?: string[],
): Promise<MatchingResult> {
  const context = await loadDonationContext(donationId);

  if (!context) {
    return { ok: false, error: "Donasi tidak ditemukan atau bukan milikmu" };
  }

  const candidates = await loadCandidates();

  const outcome = selectedIds
    ? allocateManual(
        context.donorLocation,
        context.donation,
        candidates,
        selectedIds,
      )
    : allocateAuto(context.donorLocation, context.donation, candidates);

  return { ok: true, data: outcome };
}

export async function commitMatches(
  donationId: string,
  selectedIds?: string[],
): Promise<MatchingResult> {
  const context = await loadDonationContext(donationId);

  if (!context) {
    return { ok: false, error: "Donasi tidak ditemukan atau bukan milikmu" };
  }

  const supabase = await createClient();

  const { count } = await supabase
    .from("donation_matches")
    .select("id", { count: "exact", head: true })
    .eq("donation_id", donationId);

  if (count && count > 0) {
    return { ok: false, error: "Donasi ini sudah pernah disalurkan" };
  }

  const candidates = await loadCandidates();

  const outcome = selectedIds
    ? allocateManual(
        context.donorLocation,
        context.donation,
        candidates,
        selectedIds,
      )
    : allocateAuto(context.donorLocation, context.donation, candidates);

  if (outcome.allocations.length === 0) {
    return {
      ok: false,
      error:
        "Tidak ada penerima yang cocok. Periksa kembali status halal, alergen, dan jarak.",
    };
  }

  if (outcome.allocatedServings > context.donation.totalServings) {
    return {
      ok: false,
      error: "Alokasi melebihi total porsi donasi, penyaluran dibatalkan",
    };
  }

  const { error: insertError } = await supabase.from("donation_matches").insert(
    outcome.allocations.map((allocation) => ({
      donation_id: donationId,
      recipient_id: allocation.recipientId,
      allocated_servings: allocation.allocatedServings,
      distance_km: allocation.distanceKm,
      match_score: allocation.matchScore,
    })),
  );

  if (insertError) {
    return { ok: false, error: insertError.message };
  }

  const { error: statusError } = await supabase
    .from("food_donations")
    .update({
      status: "matched",
      selection_mode: selectedIds ? "manual" : "auto",
    })
    .eq("id", donationId);

  if (statusError) {
    return { ok: false, error: statusError.message };
  }

  return { ok: true, data: outcome };
}
