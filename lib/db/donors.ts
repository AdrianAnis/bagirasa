import { createClient } from "@/lib/supabase/server";
import type { DonorProfilePayload } from "@/lib/validations/donor";
import type { Database } from "@/types/database.types";

export type Donor = Database["public"]["Tables"]["donors"]["Row"];

export type DonorResult =
  | { ok: true; data: Donor }
  | { ok: false; error: string };

export async function getCurrentDonor(): Promise<Donor | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("donors")
    .select("*")
    .eq("profile_id", user.id)
    .maybeSingle();

  return data;
}

export async function saveDonorProfile(
  payload: DonorProfilePayload,
): Promise<DonorResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Sesi tidak ditemukan, silakan masuk lagi" };
  }

  const existing = await getCurrentDonor();

  if (existing) {
    const { data, error } = await supabase
      .from("donors")
      .update({
        name: payload.name,
        address: payload.address,
        lat: payload.lat,
        lng: payload.lng,
        phone: payload.phone,
        ktp_url: payload.ktpUrl,
      })
      .eq("id", existing.id)
      .select()
      .single();

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, data };
  }

  const { data, error } = await supabase
    .from("donors")
    .insert({
      profile_id: user.id,
      name: payload.name,
      address: payload.address,
      lat: payload.lat,
      lng: payload.lng,
      phone: payload.phone,
      ktp_url: payload.ktpUrl,
    })
    .select()
    .single();

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, data };
}
