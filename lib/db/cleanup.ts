import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export type CleanupResult = {
  checked: number;
  cancelled: number;
};

export function expiresAt(
  createdAt: string,
  shelfLifeHours: number[],
): Date | null {
  if (shelfLifeHours.length === 0) {
    return null;
  }

  const shortest = Math.min(...shelfLifeHours);
  return new Date(new Date(createdAt).getTime() + shortest * 60 * 60 * 1000);
}

export async function cancelExpiredDonations(): Promise<CleanupResult> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("food_donations")
    .select("id, created_at, food_items(shelf_life_hours)")
    .eq("status", "available");

  const rows = data ?? [];
  const now = Date.now();

  const expiredIds = rows
    .filter((row) => {
      const deadline = expiresAt(
        row.created_at,
        row.food_items.map((item) => item.shelf_life_hours),
      );

      return deadline !== null && deadline.getTime() < now;
    })
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
