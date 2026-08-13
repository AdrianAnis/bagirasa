import "server-only";

import { expiresAt, isExpired } from "@/lib/matching";
import { createAdminClient } from "@/lib/supabase/admin";

export type CleanupResult = {
  checked: number;
  cancelled: number;
};

export async function cancelExpiredDonations(): Promise<CleanupResult> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("food_donations")
    .select("id, created_at, food_items(shelf_life_hours)")
    .eq("status", "available");

  const rows = data ?? [];
  const now = new Date();

  const expiredIds = rows
    .filter((row) =>
      isExpired(
        expiresAt(
          row.created_at,
          row.food_items.map((item) => item.shelf_life_hours),
        ),
        now,
      ),
    )
    .map((row) => row.id);

  if (expiredIds.length === 0) {
    return { checked: rows.length, cancelled: 0 };
  }

  await admin
    .from("food_donations")
    .update({ status: "cancelled" })
    .in("id", expiredIds);

  return { checked: rows.length, cancelled: expiredIds.length };
}
