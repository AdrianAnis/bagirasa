import { createClient } from "@/lib/supabase/server";
import type { RecipientProfilePayload } from "@/lib/validations/recipient";
import type { Database } from "@/types/database.types";

export type Recipient = Database["public"]["Tables"]["recipients"]["Row"];

export type RecipientResult =
  | { ok: true; data: Recipient }
  | { ok: false; error: string };

export async function getCurrentRecipient(): Promise<Recipient | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("recipients")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  return data;
}

export async function saveRecipientProfile(
  payload: RecipientProfilePayload,
): Promise<RecipientResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sesi tidak ditemukan, silakan masuk lagi" };
  }

  const existing = await getCurrentRecipient();

  const fields = {
    type: payload.type,
    name: payload.name,
    address: payload.address,
    lat: payload.lat,
    lng: payload.lng,
    phone: payload.phone,
    capacity: payload.capacity,
    current_need: payload.currentNeed,
    allergen_restrictions: payload.allergenRestrictions,
    halal_only: payload.halalOnly,
    legal_doc_url: payload.legalDocUrl,
  };

  if (existing) {
    const { data, error } = await supabase
      .from("recipients")
      .update(fields)
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data };
  }

  const { data, error } = await supabase
    .from("recipients")
    .insert({ profile_id: user.id, ...fields })
    .select()
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data };
}
