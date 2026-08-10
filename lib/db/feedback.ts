import { NOTIFICATION_TYPES } from "@/lib/config";
import { getCurrentRecipient } from "@/lib/db/recipients";
import { notify } from "@/lib/notify";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { FeedbackCreateInput } from "@/lib/validations/feedback";
import type { Database } from "@/types/database.types";

export type Feedback = Database["public"]["Tables"]["feedbacks"]["Row"];

export type FeedbackResult = { ok: true } | { ok: false; error: string };

export type DonorFeedback = Feedback & {
  recipients: { name: string } | null;
};

async function recalculateReputation(donorId: string): Promise<void> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("feedbacks")
    .select("rating")
    .eq("donor_id", donorId);

  if (!data || data.length === 0) {
    return;
  }

  const average =
    data.reduce((total, row) => total + row.rating, 0) / data.length;

  await admin
    .from("donors")
    .update({ reputation_score: Number(average.toFixed(2)) })
    .eq("id", donorId);
}

export async function createFeedback(
  input: FeedbackCreateInput,
): Promise<FeedbackResult> {
  const recipient = await getCurrentRecipient();

  if (!recipient) {
    return { ok: false, error: "Lengkapi profil lembaga terlebih dahulu" };
  }

  const supabase = await createClient();

  const { data: match } = await supabase
    .from("donation_matches")
    .select("id, status, recipient_id, food_donations(donor_id)")
    .eq("id", input.matchId)
    .eq("recipient_id", recipient.id)
    .maybeSingle();

  if (!match) {
    return { ok: false, error: "Donasi tidak ditemukan" };
  }

  if (match.status !== "completed") {
    return {
      ok: false,
      error: "Penilaian baru bisa diberikan setelah penyerahan selesai",
    };
  }

  const donorId = match.food_donations?.donor_id;

  if (!donorId) {
    return { ok: false, error: "Data restoran tidak ditemukan" };
  }

  const { error } = await supabase.from("feedbacks").insert({
    match_id: input.matchId,
    recipient_id: recipient.id,
    donor_id: donorId,
    rating: input.rating,
    comment: input.comment?.length ? input.comment : null,
  });

  if (error) {
    return {
      ok: false,
      error:
        error.code === "23505"
          ? "Donasi ini sudah pernah kamu nilai"
          : error.message,
    };
  }

  await recalculateReputation(donorId);

  const admin = createAdminClient();
  const { data: donor } = await admin
    .from("donors")
    .select("profile_id")
    .eq("id", donorId)
    .maybeSingle();

  if (donor?.profile_id) {
    await notify([
      {
        profileId: donor.profile_id,
        title: "Ada penilaian baru",
        body: `${recipient.name} memberi ${input.rating} dari 5 bintang untuk donasimu.`,
        type: NOTIFICATION_TYPES.feedbackReceived,
        referenceId: input.matchId,
      },
    ]);
  }

  return { ok: true };
}

export async function listDonorFeedback(
  donorId: string,
): Promise<DonorFeedback[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("feedbacks")
    .select("*, recipients(name)")
    .eq("donor_id", donorId)
    .order("created_at", { ascending: false })
    .limit(20);

  return data ?? [];
}
