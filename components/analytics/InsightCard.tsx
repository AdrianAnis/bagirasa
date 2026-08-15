"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { StoredInsight } from "@/lib/db/insights";

type InsightCardProps = {
  insight: StoredInsight | null;
};

function readImpact(value: StoredInsight["impact"]) {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;

  return {
    mealsRescued: Number(record.mealsRescued ?? 0),
    estKg: Number(record.estKg ?? 0),
    estCo2Kg: Number(record.estCo2Kg ?? 0),
    peakWindow:
      typeof record.peakWindow === "string" ? record.peakWindow : null,
  };
}

function readRecommendations(value: StoredInsight["recommendations"]) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

export function InsightCard({ insight }: InsightCardProps) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  async function generate() {
    setIsGenerating(true);

    const response = await fetch("/api/assistant", { method: "POST" });
    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error ?? "Gagal membuat insight");
      setIsGenerating(false);
      return;
    }

    toast.success("Insight diperbarui");
    router.refresh();
    setIsGenerating(false);
  }

  const impact = insight ? readImpact(insight.impact) : null;
  const recommendations = insight
    ? readRecommendations(insight.recommendations)
    : [];

  return (
    <section className="rounded-xl border border-brand-ink/8 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-brand-ink">
            Ringkasan pola surplusmu
          </h2>
          <p className="mt-1 text-sm text-brand-ink/50">
            Dirangkum otomatis dari data donasimu.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={generate}
          disabled={isGenerating}
        >
          {isGenerating
            ? "Menganalisis..."
            : insight
              ? "Perbarui insight"
              : "Buat insight"}
        </Button>
      </div>

      {insight ? (
        <div className="flex flex-col gap-5 pt-5">
          <p className="leading-relaxed text-brand-ink/70">{insight.summary}</p>

          {impact?.peakWindow ? (
            <p className="rounded-lg bg-canvas px-3 py-2 text-sm text-brand-ink/60">
              Waktu puncak surplus: {impact.peakWindow}
            </p>
          ) : null}

          {impact ? (
            <dl className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-brand-ink/8 px-4 py-3.5">
                <dt className="text-sm text-brand-ink/50">Porsi diselamatkan</dt>
                <dd className="numeric mt-1.5 text-2xl font-semibold text-brand-ink">
                  {impact.mealsRescued}
                </dd>
              </div>
              <div className="rounded-lg border border-brand-ink/8 px-4 py-3.5">
                <dt className="text-sm text-brand-ink/50">Estimasi makanan</dt>
                <dd className="numeric mt-1.5 text-2xl font-semibold text-brand-ink">
                  {impact.estKg} kg
                </dd>
              </div>
              <div className="rounded-lg border border-brand-ink/8 px-4 py-3.5">
                <dt className="text-sm text-brand-ink/50">Estimasi CO₂e</dt>
                <dd className="numeric mt-1.5 text-2xl font-semibold text-brand-ink">
                  {impact.estCo2Kg} kg
                </dd>
              </div>
            </dl>
          ) : null}

          {recommendations.length > 0 ? (
            <div>
              <p className="text-sm font-medium text-brand-ink">
                Saran mengurangi surplus
              </p>
              <ul className="mt-2 flex flex-col gap-2">
                {recommendations.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2.5 text-sm leading-relaxed text-brand-ink/65"
                  >
                    <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="pt-5 text-sm leading-relaxed text-brand-ink/55">
          Belum ada insight. Klik &ldquo;Buat insight&rdquo; untuk meminta
          ringkasan tren, waktu puncak surplus, estimasi dampak, dan saran
          pengurangan limbah makanan dari data donasimu.
        </p>
      )}
    </section>
  );
}
