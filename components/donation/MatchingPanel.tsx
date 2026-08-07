"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MatchingOutcome } from "@/lib/matching";

type SelectionMode = "auto" | "manual";

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
  const canSend = outcome.allocations.length > 0 && !isSending && !isLoading;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-medium">Mode penyaluran</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => switchMode("auto")}
            className={cn(
              "rounded-lg border p-4 text-left transition-colors",
              mode === "auto" ? "border-brand bg-brand/5" : "hover:bg-muted",
            )}
          >
            <span className="font-medium">Otomatis (disarankan)</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              BagiRasa memilih penerima paling cocok dan membagi porsi secara
              adil sampai habis.
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchMode("manual")}
            className={cn(
              "rounded-lg border p-4 text-left transition-colors",
              mode === "manual" ? "border-brand bg-brand/5" : "hover:bg-muted",
            )}
          >
            <span className="font-medium">Pilih sendiri</span>
            <span className="mt-1 block text-sm text-muted-foreground">
              Kamu menentukan penerimanya. Daftar tetap tersaring halal dan
              alergen.
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4">
        <span className="text-sm text-muted-foreground">
          {allocated} dari {totalServings} porsi teralokasi
        </span>
        <span
          className={cn(
            "text-sm font-semibold",
            remaining === 0 ? "text-brand" : "text-muted-foreground",
          )}
        >
          {remaining === 0 ? "Tidak ada sisa" : `Sisa ${remaining} porsi`}
        </span>
      </div>

      {mode === "manual" ? (
        <div className="flex flex-col gap-3">
          <p className="text-sm font-medium">
            Penerima yang bisa dipilih
            {remaining === 0 ? " (porsi sudah habis)" : ""}
          </p>
          {outcome.eligible.map((scored) => {
            const isSelected = selectedIds.includes(scored.candidate.id);
            const isLocked = remaining === 0 && !isSelected;

            return (
              <button
                key={scored.candidate.id}
                type="button"
                disabled={isLocked}
                onClick={() => toggleRecipient(scored.candidate.id)}
                className={cn(
                  "flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 text-left transition-colors",
                  isSelected && "border-brand bg-brand/5",
                  isLocked && "cursor-not-allowed opacity-50",
                )}
              >
                <span className="font-medium">{scored.candidate.name}</span>
                <span className="text-sm text-muted-foreground">
                  {scored.distanceKm.toFixed(1)} km · butuh{" "}
                  {scored.candidate.currentNeed} porsi
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rencana penyaluran</CardTitle>
          <CardDescription>
            {isLoading
              ? "Menghitung..."
              : outcome.allocations.length
                ? `${outcome.allocations.length} penerima akan menerima donasi ini.`
                : "Belum ada penerima terpilih."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2">
          {outcome.allocations.map((allocation) => (
            <div
              key={allocation.recipientId}
              className="flex flex-wrap items-center justify-between gap-2 text-sm"
            >
              <span className="font-medium">{allocation.recipientName}</span>
              <span className="text-muted-foreground">
                {allocation.allocatedServings} porsi ·{" "}
                {allocation.distanceKm.toFixed(1)} km
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {outcome.rejected.length > 0 ? (
        <details className="rounded-lg border p-4">
          <summary className="cursor-pointer text-sm font-medium">
            {outcome.rejected.length} penerima tersaring
          </summary>
          <div className="mt-3 flex flex-col gap-2">
            {outcome.rejected.map((item) => (
              <div
                key={item.candidate.id}
                className="flex flex-wrap items-center justify-between gap-2 text-sm"
              >
                <span>{item.candidate.name}</span>
                <span className="text-muted-foreground">{item.reason}</span>
              </div>
            ))}
          </div>
        </details>
      ) : null}

      {remaining > 0 && outcome.allocations.length > 0 ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm">
          {remaining} porsi belum ada penerimanya. Donasi tetap bisa dikirim,
          tetapi sisa porsi berisiko terbuang.
        </p>
      ) : null}

      <Button onClick={onSend} disabled={!canSend}>
        {isSending ? "Mengirim..." : "Kirim donasi"}
      </Button>
    </div>
  );
}
