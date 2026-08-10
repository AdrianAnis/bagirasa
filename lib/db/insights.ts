import "server-only";

import { CO2E_KG_PER_FOOD_KG, KG_PER_SERVING } from "@/lib/config";
import { getDonorAnalytics, type DonorAnalytics } from "@/lib/db/analytics";
import { generateWasteInsight, type WasteInsight } from "@/lib/gemini";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type StoredInsight =
  Database["public"]["Tables"]["waste_insights"]["Row"];

export type InsightResult =
  | { ok: true; insight: WasteInsight }
  | { ok: false; error: string };

export function estimateImpact(servings: number) {
  const estKg = servings * KG_PER_SERVING;

  return {
    mealsRescued: servings,
    estKg: Number(estKg.toFixed(1)),
    estCo2Kg: Number((estKg * CO2E_KG_PER_FOOD_KG).toFixed(1)),
  };
}

function toPayload(analytics: DonorAnalytics) {
  return {
    periode: { mulai: analytics.periodStart, selesai: analytics.periodEnd },
    totalDonasi: analytics.totalDonations,
    totalPorsi: analytics.totalServings,
    porsiTersalurkan: analytics.distributedServings,
    porsiDiterima: analytics.completedServings,
    jumlahPenerima: analytics.recipientCount,
    rataRataPenilaian: Number(analytics.averageRating.toFixed(2)),
    jenisMakanan: analytics.byFoodType.map((slice) => ({
      jenis: slice.label,
      porsi: slice.servings,
    })),
    jamPuncak: analytics.peakHours.map((peak) => ({
      jam: peak.label,
      donasi: peak.donations,
    })),
    trenHarian: analytics.trend
      .filter((point) => point.servings > 0)
      .map((point) => ({ tanggal: point.date, porsi: point.servings })),
    estimasiDampak: estimateImpact(analytics.completedServings),
  };
}

export async function getLatestInsight(
  donorId: string,
): Promise<StoredInsight | null> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("waste_insights")
    .select("*")
    .eq("donor_id", donorId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return data;
}

export async function refreshInsight(): Promise<InsightResult> {
  const analytics = await getDonorAnalytics();

  if (!analytics) {
    return { ok: false, error: "Lengkapi profil restoran terlebih dahulu" };
  }

  if (analytics.totalDonations === 0) {
    return {
      ok: false,
      error: "Belum ada donasi yang bisa dianalisis",
    };
  }

  const outcome = await generateWasteInsight(toPayload(analytics));

  if (outcome.status === "skipped") {
    return {
      ok: false,
      error: `Insight AI belum aktif: ${outcome.reason}`,
    };
  }

  if (outcome.status === "failed") {
    return { ok: false, error: `Gagal membuat insight: ${outcome.reason}` };
  }

  const admin = createAdminClient();

  const { error } = await admin.from("waste_insights").insert({
    donor_id: analytics.donorId,
    period_start: analytics.periodStart,
    period_end: analytics.periodEnd,
    summary: outcome.insight.summary,
    impact: {
      ...outcome.insight.impact,
      peakWindow: outcome.insight.peakWindow,
    },
    recommendations: outcome.insight.recommendations,
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, insight: outcome.insight };
}
