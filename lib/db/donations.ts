import { getCurrentDonor } from "@/lib/db/donors";
import { getCurrentProfile } from "@/lib/db/profiles";
import { createClient } from "@/lib/supabase/server";
import type { DonationCreateInput } from "@/lib/validations/donation";
import type { Database } from "@/types/database.types";

export type Donation = Database["public"]["Tables"]["food_donations"]["Row"];
export type FoodItem = Database["public"]["Tables"]["food_items"]["Row"];
export type DonationWithItems = Donation & { food_items: FoodItem[] };

export type DonationResult =
  | { ok: true; data: Donation }
  | { ok: false; error: string };

export async function createDonation(
  input: DonationCreateInput,
): Promise<DonationResult> {
  const donor = await getCurrentDonor();

  if (!donor) {
    return {
      ok: false,
      error: "Lengkapi profil restoran dulu sebelum membuat donasi",
    };
  }

  const profile = await getCurrentProfile();

  if (profile?.verification_status !== "verified") {
    return {
      ok: false,
      error:
        "Akunmu belum diverifikasi admin. Donasi baru bisa dibuat setelah verifikasi selesai.",
    };
  }

  const supabase = await createClient();

  const { data: donation, error: donationError } = await supabase
    .from("food_donations")
    .insert({
      donor_id: donor.id,
      status: "available",
      notes: input.notes ?? null,
    })
    .select()
    .single();

  if (donationError) {
    return { ok: false, error: donationError.message };
  }

  const { error: itemsError } = await supabase.from("food_items").insert(
    input.items.map((item) => ({
      donation_id: donation.id,
      name: item.name,
      food_type: item.foodType,
      shelf_life_hours: item.shelfLifeHours,
      is_halal: item.isHalal,
      ingredients: item.ingredients,
      allergens: item.allergens,
      quantity: item.quantity,
      unit: item.unit,
      servings: item.servings,
    })),
  );

  if (itemsError) {
    await supabase.from("food_donations").delete().eq("id", donation.id);
    return { ok: false, error: itemsError.message };
  }

  return { ok: true, data: donation };
}

export async function getDonationById(
  donationId: string,
): Promise<DonationWithItems | null> {
  const donor = await getCurrentDonor();

  if (!donor) {
    return null;
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from("food_donations")
    .select("*, food_items(*)")
    .eq("id", donationId)
    .eq("donor_id", donor.id)
    .maybeSingle();

  return data;
}

export async function listDonorDonations(): Promise<DonationWithItems[]> {
  const donor = await getCurrentDonor();

  if (!donor) {
    return [];
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from("food_donations")
    .select("*, food_items(*)")
    .eq("donor_id", donor.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}
