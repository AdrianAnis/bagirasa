"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { FeedbackForm } from "@/components/recipient/FeedbackForm";
import { RatingStars } from "@/components/shared/RatingStars";
import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import type { IncomingMatch } from "@/lib/db/matches";
import { FOOD_TYPE_LABEL, type FoodType } from "@/lib/validations/donation";

const STATUS: Record<IncomingMatch["status"], { label: string; tone: StatusTone }> =
  {
    pending: { label: "Menunggu jawabanmu", tone: "waiting" },
    accepted: { label: "Menunggu penyerahan", tone: "active" },
    rejected: { label: "Ditolak", tone: "neutral" },
    confirmed: { label: "Dikonfirmasi", tone: "active" },
    completed: { label: "Selesai", tone: "done" },
  };

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type IncomingDonationCardProps = {
  match: IncomingMatch;
};

export function IncomingDonationCard({ match }: IncomingDonationCardProps) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | null>(null);

  const donation = match.food_donations;
  const items = donation?.food_items ?? [];

  const allergens = Array.from(
    new Set(items.flatMap((item) => item.allergens)),
  );
  const isHalal = items.every((item) => item.is_halal);
  const status = STATUS[match.status];
  const feedback = match.feedbacks;
  const donorName = donation?.donors?.name ?? "Restoran";
  const canRate = match.status === "completed" && !feedback;

  async function runAction(action: "accept" | "reject" | "handover") {
    setPendingAction(action);

    const response = await fetch("/api/matches", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matchId: match.id, action }),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error ?? "Aksi gagal");
      setPendingAction(null);
      return;
    }

    const message =
      action === "accept"
        ? "Donasi diterima"
        : action === "reject"
          ? "Donasi ditolak"
          : "Penyerahan selesai";

    toast.success(message);
    router.refresh();
    setPendingAction(null);
  }

  return (
    <article className="overflow-hidden rounded-xl border border-brand-ink/8 bg-white">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-brand-ink/8 px-5 py-4">
        <div>
          <h3 className="font-semibold text-brand-ink">{donorName}</h3>
          <p className="mt-1 text-sm text-brand-ink/50">
            <span className="numeric">{match.allocated_servings}</span> porsi ·{" "}
            <span className="numeric">
              {Number(match.distance_km).toFixed(1)}
            </span>{" "}
            km · {donation ? formatDate(donation.created_at) : ""}
          </p>
        </div>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </header>

      <div className="flex flex-col gap-4 px-5 py-4">
        <div className="flex flex-wrap gap-2">
          <span
            className={
              isHalal
                ? "inline-flex items-center rounded-md bg-brand-tint px-2.5 py-1 text-sm font-medium text-brand-deep"
                : "inline-flex items-center rounded-md bg-amber-100 px-2.5 py-1 text-sm font-medium text-amber-900"
            }
          >
            {isHalal ? "Halal" : "Tidak halal"}
          </span>

          {allergens.length > 0 ? (
            <span className="inline-flex items-center rounded-md bg-red-100 px-2.5 py-1 text-sm font-medium text-red-900">
              Mengandung {allergens.join(", ")}
            </span>
          ) : (
            <span className="inline-flex items-center rounded-md bg-brand-ink/6 px-2.5 py-1 text-sm text-brand-ink/60">
              Tanpa alergen tercatat
            </span>
          )}
        </div>

        <ul className="flex flex-col divide-y divide-brand-ink/8">
          {items.map((item) => (
            <li key={item.id} className="flex flex-col gap-1 py-3 first:pt-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="font-medium text-brand-ink">{item.name}</span>
                <span className="numeric text-sm text-brand-ink/45">
                  {item.quantity} {item.unit} · {item.servings} porsi
                </span>
              </div>
              <p className="text-sm text-brand-ink/55">
                {FOOD_TYPE_LABEL[item.food_type as FoodType]} · tahan{" "}
                {item.shelf_life_hours} jam
                {item.allergens.length > 0
                  ? ` · alergen: ${item.allergens.join(", ")}`
                  : ""}
              </p>
              <p className="text-sm text-brand-ink/45">
                Bahan: {item.ingredients}
              </p>
            </li>
          ))}
        </ul>

        {donation?.notes ? (
          <p className="rounded-lg bg-canvas px-3 py-2 text-sm text-brand-ink/60">
            Catatan restoran: {donation.notes}
          </p>
        ) : null}

        {donation?.donors ? (
          <p className="text-sm text-brand-ink/45">
            {donation.donors.address} · {donation.donors.phone}
          </p>
        ) : null}
      </div>

      {feedback ? (
        <footer className="flex flex-wrap items-center gap-3 border-t border-brand-ink/8 bg-canvas px-5 py-4">
          <RatingStars value={feedback.rating} />
          <span className="text-sm text-brand-ink/55">
            {feedback.comment ? feedback.comment : "Sudah kamu nilai"}
          </span>
        </footer>
      ) : null}

      {canRate ? (
        <footer className="border-t border-brand-ink/8 bg-canvas px-5 py-4">
          <FeedbackForm matchId={match.id} donorName={donorName} />
        </footer>
      ) : null}

      {match.status === "pending" || match.status === "accepted" ? (
        <footer className="flex flex-wrap gap-3 border-t border-brand-ink/8 bg-canvas px-5 py-4">
          {match.status === "pending" ? (
            <>
              <Button
                onClick={() => runAction("accept")}
                disabled={pendingAction !== null}
              >
                {pendingAction === "accept" ? "Memproses..." : "Terima donasi"}
              </Button>
              <Button
                variant="outline"
                onClick={() => runAction("reject")}
                disabled={pendingAction !== null}
              >
                {pendingAction === "reject" ? "Memproses..." : "Tolak"}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => runAction("handover")}
              disabled={pendingAction !== null}
            >
              {pendingAction === "handover"
                ? "Memproses..."
                : "Konfirmasi makanan sudah diterima"}
            </Button>
          )}
        </footer>
      ) : null}
    </article>
  );
}
