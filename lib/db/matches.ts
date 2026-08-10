import { NOTIFICATION_TYPES } from "@/lib/config";
import { getCurrentDonor } from "@/lib/db/donors";
import type { NotificationDraft } from "@/lib/db/notifications";
import { getCurrentProfile } from "@/lib/db/profiles";
import { getCurrentRecipient } from "@/lib/db/recipients";
import { notify, type WhatsAppDispatch } from "@/lib/notify";
import { createAdminClient } from "@/lib/supabase/admin";
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

export type ActionResult = { ok: true } | { ok: false; error: string };

export type IncomingMatch = DonationMatch & {
  food_donations: {
    id: string;
    notes: string | null;
    created_at: string;
    donors: { name: string; address: string; phone: string } | null;
    food_items: Database["public"]["Tables"]["food_items"]["Row"][];
  } | null;
  feedbacks: { rating: number; comment: string | null } | null;
};

type DonationContext = {
  donorLocation: Coordinate;
  donorName: string;
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
    donorName: donor.name,
    donation: { totalServings, isHalal, allergens },
  };
}

async function announceNewMatches(
  matches: Array<{
    id: string;
    recipient_id: string;
    allocated_servings: number;
  }>,
  donorName: string,
): Promise<void> {
  if (matches.length === 0) {
    return;
  }

  const admin = createAdminClient();

  const { data: recipients } = await admin
    .from("recipients")
    .select("id, name, phone, profile_id")
    .in(
      "id",
      matches.map((match) => match.recipient_id),
    );

  if (!recipients) {
    return;
  }

  const byId = new Map(recipients.map((row) => [row.id, row]));
  const drafts: NotificationDraft[] = [];
  const dispatches: WhatsAppDispatch[] = [];

  for (const match of matches) {
    const recipient = byId.get(match.recipient_id);

    if (!recipient) {
      continue;
    }

    drafts.push({
      profileId: recipient.profile_id,
      title: "Ada donasi masuk",
      body: `${donorName} mengirim ${match.allocated_servings} porsi. Buka dashboard untuk melihat rincian bahan dan alergen.`,
      type: NOTIFICATION_TYPES.donationIncoming,
      referenceId: match.id,
    });

    dispatches.push({
      matchId: match.id,
      targetPhone: recipient.phone,
      message: `Halo ${recipient.name}, ada donasi ${match.allocated_servings} porsi dari ${donorName} lewat BagiRasa. Buka aplikasi untuk melihat rincian bahan dan alergen, lalu terima atau tolak donasi ini.`,
    });
  }

  await notify(drafts, dispatches);
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

export async function listRecipientMatches(): Promise<IncomingMatch[]> {
  const recipient = await getCurrentRecipient();

  if (!recipient) {
    return [];
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from("donation_matches")
    .select(
      "*, food_donations(id, notes, created_at, donors(name, address, phone), food_items(*)), feedbacks(rating, comment)",
    )
    .eq("recipient_id", recipient.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

async function notifyDonorOfMatch(
  donationId: string,
  recipientName: string,
  title: string,
  body: string,
  type: string,
  referenceId: string,
): Promise<void> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("food_donations")
    .select("donors(profile_id)")
    .eq("id", donationId)
    .maybeSingle();

  const profileId = data?.donors?.profile_id;

  if (!profileId) {
    return;
  }

  await notify([
    {
      profileId,
      title,
      body: `${recipientName} ${body}`,
      type,
      referenceId,
    },
  ]);
}

async function loadOwnedMatch(matchId: string) {
  const recipient = await getCurrentRecipient();

  if (!recipient) {
    return null;
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from("donation_matches")
    .select("id, status, allocated_servings, recipient_id, donation_id")
    .eq("id", matchId)
    .eq("recipient_id", recipient.id)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return { match: data, recipient };
}

export async function respondToMatch(
  matchId: string,
  accept: boolean,
): Promise<ActionResult> {
  const owned = await loadOwnedMatch(matchId);

  if (!owned) {
    return { ok: false, error: "Donasi tidak ditemukan" };
  }

  if (owned.match.status !== "pending") {
    return { ok: false, error: "Donasi ini sudah pernah direspons" };
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("donation_matches")
    .update({
      status: accept ? "accepted" : "rejected",
      responded_at: new Date().toISOString(),
    })
    .eq("id", matchId);

  if (error) {
    return { ok: false, error: error.message };
  }

  await notifyDonorOfMatch(
    owned.match.donation_id,
    owned.recipient.name,
    accept ? "Donasi diterima" : "Donasi ditolak",
    accept
      ? `menerima ${owned.match.allocated_servings} porsi. Koordinasikan waktu penyerahan.`
      : `menolak alokasi ${owned.match.allocated_servings} porsi.`,
    accept
      ? NOTIFICATION_TYPES.donationAccepted
      : NOTIFICATION_TYPES.donationRejected,
    matchId,
  );

  return { ok: true };
}

export async function confirmHandover(matchId: string): Promise<ActionResult> {
  const owned = await loadOwnedMatch(matchId);

  if (!owned) {
    return { ok: false, error: "Donasi tidak ditemukan" };
  }

  if (owned.match.status !== "accepted") {
    return { ok: false, error: "Terima donasi ini terlebih dahulu" };
  }

  const supabase = await createClient();
  const handedOverAt = new Date().toISOString();

  const { error } = await supabase
    .from("donation_matches")
    .update({ status: "completed", handed_over_at: handedOverAt })
    .eq("id", matchId);

  if (error) {
    return { ok: false, error: error.message };
  }

  const admin = createAdminClient();
  const nextNeed = Math.max(
    0,
    owned.recipient.current_need - owned.match.allocated_servings,
  );

  const { error: recipientError } = await admin
    .from("recipients")
    .update({ current_need: nextNeed, last_received_at: handedOverAt })
    .eq("id", owned.recipient.id);

  if (recipientError) {
    return { ok: false, error: recipientError.message };
  }

  const { data: siblings } = await admin
    .from("donation_matches")
    .select("status")
    .eq("donation_id", owned.match.donation_id);

  const allSettled = (siblings ?? []).every(
    (row) => row.status === "completed" || row.status === "rejected",
  );

  if (allSettled) {
    await admin
      .from("food_donations")
      .update({ status: "completed" })
      .eq("id", owned.match.donation_id);
  }

  await notifyDonorOfMatch(
    owned.match.donation_id,
    owned.recipient.name,
    "Penyerahan selesai",
    `sudah menerima ${owned.match.allocated_servings} porsi.`,
    NOTIFICATION_TYPES.handoverCompleted,
    matchId,
  );

  return { ok: true };
}

export async function commitMatches(
  donationId: string,
  selectedIds?: string[],
): Promise<MatchingResult> {
  const context = await loadDonationContext(donationId);

  if (!context) {
    return { ok: false, error: "Donasi tidak ditemukan atau bukan milikmu" };
  }

  const profile = await getCurrentProfile();

  if (profile?.verification_status !== "verified") {
    return {
      ok: false,
      error:
        "Akunmu belum diverifikasi admin. Donasi baru bisa disalurkan setelah verifikasi selesai.",
    };
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

  const { data: insertedMatches, error: insertError } = await supabase
    .from("donation_matches")
    .insert(
      outcome.allocations.map((allocation) => ({
        donation_id: donationId,
        recipient_id: allocation.recipientId,
        allocated_servings: allocation.allocatedServings,
        distance_km: allocation.distanceKm,
        match_score: allocation.matchScore,
      })),
    )
    .select("id, recipient_id, allocated_servings");

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

  await announceNewMatches(insertedMatches ?? [], context.donorName);

  return { ok: true, data: outcome };
}
