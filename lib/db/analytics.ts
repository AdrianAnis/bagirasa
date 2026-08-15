import { getCurrentDonor } from "@/lib/db/donors";
import { createClient } from "@/lib/supabase/server";
import { FOOD_TYPE_LABEL, type FoodType } from "@/lib/validations/donation";

export type TrendPoint = {
  date: string;
  label: string;
  servings: number;
  donations: number;
};

export type FoodTypeSlice = {
  type: FoodType;
  label: string;
  servings: number;
};

export type PeakHour = {
  hour: number;
  label: string;
  donations: number;
};

export type DonorAnalytics = {
  donorId: string;
  totalDonations: number;
  availableDonations: number;
  totalServings: number;
  distributedServings: number;
  completedServings: number;
  recipientCount: number;
  averageRating: number;
  ratingCount: number;
  trend: TrendPoint[];
  byFoodType: FoodTypeSlice[];
  peakHours: PeakHour[];
  periodStart: string;
  periodEnd: string;
};

const TREND_DAYS = 30;

function toDateKey(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function formatDayLabel(key: string): string {
  return new Date(`${key}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

export async function getDonorAnalytics(): Promise<DonorAnalytics | null> {
  const donor = await getCurrentDonor();

  if (!donor) {
    return null;
  }

  const supabase = await createClient();
  const periodEnd = new Date();
  const periodStart = new Date(
    periodEnd.getTime() - (TREND_DAYS - 1) * 24 * 60 * 60 * 1000,
  );

  const { data: donations } = await supabase
    .from("food_donations")
    .select(
      "id, status, created_at, food_items(servings, food_type), donation_matches(recipient_id, status, allocated_servings)",
    )
    .eq("donor_id", donor.id);

  const { data: ratings } = await supabase
    .from("feedbacks")
    .select("rating")
    .eq("donor_id", donor.id);

  const rows = donations ?? [];

  const servingsByDay = new Map<string, { servings: number; donations: number }>();
  const servingsByType = new Map<FoodType, number>();
  const donationsByHour = new Map<number, number>();
  const recipients = new Set<string>();

  let totalServings = 0;
  let distributedServings = 0;
  let completedServings = 0;
  let availableDonations = 0;

  for (let offset = 0; offset < TREND_DAYS; offset++) {
    const day = new Date(periodStart.getTime() + offset * 24 * 60 * 60 * 1000);
    servingsByDay.set(toDateKey(day), { servings: 0, donations: 0 });
  }

  for (const donation of rows) {
    const servings = donation.food_items.reduce(
      (total, item) => total + item.servings,
      0,
    );

    totalServings += servings;

    if (donation.status === "matched" || donation.status === "completed") {
      distributedServings += servings;
    }

    if (donation.status === "available") {
      availableDonations += 1;
    }

    for (const match of donation.donation_matches) {
      recipients.add(match.recipient_id);

      if (match.status === "completed") {
        completedServings += match.allocated_servings;
      }
    }

    for (const item of donation.food_items) {
      const type = item.food_type as FoodType;
      servingsByType.set(type, (servingsByType.get(type) ?? 0) + item.servings);
    }

    const createdAt = new Date(donation.created_at);
    const dayKey = toDateKey(createdAt);
    const bucket = servingsByDay.get(dayKey);

    if (bucket) {
      bucket.servings += servings;
      bucket.donations += 1;
    }

    const hour = createdAt.getHours();
    donationsByHour.set(hour, (donationsByHour.get(hour) ?? 0) + 1);
  }

  const trend: TrendPoint[] = Array.from(servingsByDay.entries()).map(
    ([date, value]) => ({
      date,
      label: formatDayLabel(date),
      servings: value.servings,
      donations: value.donations,
    }),
  );

  const byFoodType: FoodTypeSlice[] = Array.from(servingsByType.entries())
    .map(([type, servings]) => ({
      type,
      label: FOOD_TYPE_LABEL[type],
      servings,
    }))
    .sort((a, b) => b.servings - a.servings);

  const peakHours: PeakHour[] = Array.from(donationsByHour.entries())
    .map(([hour, donations]) => ({
      hour,
      label: `${String(hour).padStart(2, "0")}.00`,
      donations,
    }))
    .sort((a, b) => b.donations - a.donations)
    .slice(0, 3);

  const ratingRows = ratings ?? [];
  const ratingCount = ratingRows.length;
  const averageRating =
    ratingCount > 0
      ? ratingRows.reduce((total, row) => total + row.rating, 0) / ratingCount
      : 0;

  return {
    donorId: donor.id,
    totalDonations: rows.length,
    availableDonations,
    totalServings,
    distributedServings,
    completedServings,
    recipientCount: recipients.size,
    averageRating,
    ratingCount,
    trend,
    byFoodType,
    peakHours,
    periodStart: toDateKey(periodStart),
    periodEnd: toDateKey(periodEnd),
  };
}
