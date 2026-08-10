"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { MatchingOutcome } from "@/lib/matching";
import { cn } from "@/lib/utils";

type SelectionMode = "auto" | "manual";

const MODES: Array<{
  id: SelectionMode;
  title: string;
  body: string;
}> = [
  {
    id: "auto",
    title: "Otomatis",
    body: "BagiRasa memilih penerima paling cocok dan membagi porsi sampai habis.",
  },
  {
    id: "manual",
    title: "Pilih sendiri",
    body: "Kamu menentukan penerimanya. Daftar tetap tersaring halal dan alergen.",
  },
];

type MatchingPanelProps = {
  donationId: string;
  totalServings: number;
  initialOutcome: MatchingOutcome;
};

export function MatchingPanel({
  donationId,
  totalServings,
  initialOutcome,
}: MatchingPanelProps) {
  const router = useRouter();
  const [mode, setMode] = useState<SelectionMode>("auto");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [outcome, setOutcome] = useState<MatchingOutcome>(initialOutcome);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);

  async function loadPreview(nextMode: SelectionMode, ids: string[]) {
    setIsLoading(true);

    const response = await fetch("/api/matching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        donationId,
        mode: nextMode === "manual" && ids.length === 0 ? "auto" : nextMode,
        recipientIds: nextMode === "manual" ? ids : undefined,
      }),
    });

    const result = await response.json();
    setIsLoading(false);

    if (!response.ok) {
      toast.error(result.error ?? "Gagal menghitung rekomendasi");
      return;
    }

    setOutcome(result.data as MatchingOutcome);
  }

  function switchMode(nextMode: SelectionMode) {
    setMode(nextMode);
    setSelectedIds([]);
    loadPreview(nextMode, []);
  }

  function toggleRecipient(recipientId: string) {
    const next = selectedIds.includes(recipientId)
      ? selectedIds.filter((id) => id !== recipientId)
      : [...selectedIds, recipientId];

    setSelectedIds(next);
    loadPreview("manual", next);
  }

  async function onSend() {
    setIsSending(true);

    const response = await fetch("/api/matching", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        donationId,
        mode,
        recipientIds: mode === "manual" ? selectedIds : undefined,
        commit: true,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error ?? "Gagal menyalurkan donasi");
      setIsSending(false);
      return;
    }

    toast.success("Donasi berhasil disalurkan");
    router.replace("/donor");
    router.refresh();
  }

  const allocated = outcome.allocatedServings;
  const remaining = outcome.remainingServings;
  const allocatedPercent = totalServings > 0 ? allocated / totalServings : 0;
  const canSend = outcome.allocations.length > 0 && !isSending && !isLoading;

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col gap-3">
        <p className="eyebrow text-brand-ink/40">Mode penyaluran</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={mode === item.id}
              onClick={() => switchMode(item.id)}
              className={cn(
                "rounded-xl border p-4 text-left transition-colors",
                mode === item.id
                  ? "border-brand bg-brand-tint/50"
                  : "border-brand-ink/12 bg-white hover:border-brand-ink/25",
              )}
            >
              <span className="font-semibold text-brand-ink">{item.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-brand-ink/55">
                {item.body}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-brand-ink/10 bg-white p-5">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="flex items-baseline gap-2">
            <span className="numeric text-3xl font-semibold text-brand-ink">
              {allocated}
            </span>
            <span className="numeric text-sm text-brand-ink/45">
              / {totalServings} porsi
            </span>
          </p>
          <span
            className={cn(
              "text-sm font-medium",
              remaining === 0 ? "text-brand" : "text-brand-ink/50",
            )}
          >
            {remaining === 0 ? "Tidak ada sisa" : `Sisa ${remaining} porsi`}
          </span>
        </div>

        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-brand-ink/8">
          <div
            style={{ width: `${allocatedPercent * 100}%` }}
            className="h-full rounded-full bg-brand transition-[width] duration-300"
          />
        </div>

        {outcome.allocations.length > 0 ? (
          <ul className="mt-4 flex flex-col divide-y divide-brand-ink/8">
            {outcome.allocations.map((allocation) => (
              <li
                key={allocation.recipientId}
                className="flex flex-wrap items-baseline justify-between gap-2 py-3"
              >
                <span className="text-sm font-medium text-brand-ink">
                  {allocation.recipientName}
                </span>
                <span className="flex items-baseline gap-3">
                  <span className="numeric text-xs text-brand-ink/40">
                    {allocation.distanceKm.toFixed(1)} km
                  </span>
                  <span className="numeric text-sm font-semibold text-brand-deep">
                    {allocation.allocatedServings} porsi
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-brand-ink/50">
            {isLoading ? "Menghitung..." : "Belum ada penerima terpilih."}
          </p>
        )}
      </section>

      {mode === "manual" ? (
        <section className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <p className="eyebrow text-brand-ink/40">Penerima yang cocok</p>
            {remaining === 0 ? (
              <span className="text-sm text-brand">
                Porsi habis — pilihan lain terkunci
              </span>
            ) : null}
          </div>

          {outcome.eligible.map((scored) => {
            const isSelected = selectedIds.includes(scored.candidate.id);
            const isLocked = remaining === 0 && !isSelected;

            return (
              <button
                key={scored.candidate.id}
                type="button"
                aria-pressed={isSelected}
                disabled={isLocked}
                onClick={() => toggleRecipient(scored.candidate.id)}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-2 rounded-xl border p-4 text-left transition-colors",
                  isSelected
                    ? "border-brand bg-brand-tint/50"
                    : "border-brand-ink/12 bg-white hover:border-brand-ink/25",
                  isLocked && "cursor-not-allowed opacity-45 hover:border-brand-ink/12",
                )}
              >
                <span className="font-medium text-brand-ink">
                  {scored.candidate.name}
                </span>
                <span className="numeric text-sm text-brand-ink/50">
                  {scored.distanceKm.toFixed(1)} km · butuh{" "}
                  {scored.candidate.currentNeed} porsi
                </span>
              </button>
            );
          })}
        </section>
      ) : null}

      {outcome.rejected.length > 0 ? (
        <details className="rounded-xl border border-brand-ink/10 bg-white px-5 py-4">
          <summary className="cursor-pointer text-sm font-medium text-brand-ink">
            {outcome.rejected.length} penerima tersaring
          </summary>
          <ul className="mt-3 flex flex-col divide-y divide-brand-ink/8">
            {outcome.rejected.map((item) => (
              <li
                key={item.candidate.id}
                className="flex flex-wrap items-baseline justify-between gap-2 py-2.5"
              >
                <span className="text-sm text-brand-ink/70">
                  {item.candidate.name}
                </span>
                <span className="text-sm text-brand-ink/45">{item.reason}</span>
              </li>
            ))}
          </ul>
        </details>
      ) : null}

      {remaining > 0 && outcome.allocations.length > 0 ? (
        <p className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {remaining} porsi belum ada penerimanya. Donasi tetap bisa dikirim,
          tetapi sisa porsi berisiko terbuang.
        </p>
      ) : null}

      <Button onClick={onSend} disabled={!canSend} size="lg">
        {isSending ? "Mengirim..." : "Kirim donasi"}
      </Button>
    </div>
  );
}
