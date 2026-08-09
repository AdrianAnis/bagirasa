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
import type { IncomingMatch } from "@/lib/db/matches";
import { cn } from "@/lib/utils";
import { FOOD_TYPE_LABEL, type FoodType } from "@/lib/validations/donation";

const STATUS_LABEL: Record<IncomingMatch["status"], string> = {
  pending: "Menunggu jawabanmu",
  accepted: "Diterima, menunggu penyerahan",
  rejected: "Ditolak",
  confirmed: "Dikonfirmasi",
  completed: "Selesai",
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
    <Card>
      <CardHeader>
        <CardTitle className="text-base">
          {donation?.donors?.name ?? "Restoran"} — {match.allocated_servings}{" "}
          porsi
        </CardTitle>
        <CardDescription>
          {donation ? formatDate(donation.created_at) : ""} ·{" "}
          {Number(match.distance_km).toFixed(1)} km · {STATUS_LABEL[match.status]}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-4">
        <div
          className={cn(
            "rounded-lg border p-3 text-sm",
            allergens.length > 0
              ? "border-destructive/40 bg-destructive/5"
              : "border-brand/40 bg-brand/5",
          )}
        >
          <p className="font-medium">
            {isHalal ? "Halal" : "TIDAK HALAL"} ·{" "}
            {allergens.length > 0
              ? `Mengandung alergen: ${allergens.join(", ")}`
              : "Tidak ada alergen tercatat"}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-1 text-sm">
              <span className="font-medium">
                {item.name} — {FOOD_TYPE_LABEL[item.food_type as FoodType]}
              </span>
              <span className="text-muted-foreground">
                Bahan: {item.ingredients}
              </span>
              <span className="text-muted-foreground">
                Tahan {item.shelf_life_hours} jam · jumlah {item.quantity}{" "}
                {item.unit} · estimasi {item.servings} porsi ·{" "}
                {item.is_halal ? "halal" : "non-halal"}
                {item.allergens.length > 0
                  ? ` · alergen: ${item.allergens.join(", ")}`
                  : ""}
              </span>
            </div>
          ))}
        </div>

        {donation?.notes ? (
          <p className="text-sm text-muted-foreground">
            Catatan restoran: {donation.notes}
          </p>
        ) : null}

        {donation?.donors ? (
          <p className="text-sm text-muted-foreground">
            {donation.donors.address} · {donation.donors.phone}
          </p>
        ) : null}

        {match.status === "pending" ? (
          <div className="flex flex-wrap gap-3">
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
          </div>
        ) : null}

        {match.status === "accepted" ? (
          <Button
            onClick={() => runAction("handover")}
            disabled={pendingAction !== null}
            className="self-start"
          >
            {pendingAction === "handover"
              ? "Memproses..."
              : "Konfirmasi makanan sudah diterima"}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
