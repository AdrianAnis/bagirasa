import Link from "next/link";

import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import type { DonationWithItems } from "@/lib/db/donations";
import { expiresAt, formatRemaining, isExpired } from "@/lib/matching";
import { FOOD_TYPE_LABEL, type FoodType } from "@/lib/validations/donation";

const STATUS: Record<
  DonationWithItems["status"],
  { label: string; tone: StatusTone }
> = {
  draft: { label: "Draf", tone: "neutral" },
  available: { label: "Belum disalurkan", tone: "waiting" },
  matched: { label: "Sudah dicocokkan", tone: "active" },
  completed: { label: "Selesai", tone: "done" },
  cancelled: { label: "Dibatalkan", tone: "neutral" },
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type DonationListProps = {
  donations: DonationWithItems[];
};

export function DonationList({ donations }: DonationListProps) {
  return (
    <div className="flex flex-col gap-4">
      {donations.map((donation) => {
        const totalServings = donation.food_items.reduce(
          (total, item) => total + item.servings,
          0,
        );
        const allergens = Array.from(
          new Set(donation.food_items.flatMap((item) => item.allergens)),
        );
        const deadline = expiresAt(
          donation.created_at,
          donation.food_items.map((item) => item.shelf_life_hours),
        );
        const isPending = donation.status === "available";
        const expired = isPending && isExpired(deadline);
        const remaining = isPending ? formatRemaining(deadline) : null;
        const status = expired
          ? { label: "Kedaluwarsa", tone: "danger" as const }
          : STATUS[donation.status];

        const notes = [
          allergens.length > 0 ? `Alergen: ${allergens.join(", ")}` : null,
          remaining ? `sisa ketahanan ${remaining}` : null,
          expired ? "Batas ketahanan makanan sudah terlewat" : null,
        ].filter(Boolean);

        return (
          <article
            key={donation.id}
            className="overflow-hidden rounded-xl border border-brand-ink/10 bg-white"
          >
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-brand-ink/10 px-5 py-4">
              <div>
                <p className="eyebrow text-brand-ink/40">
                  {formatDate(donation.created_at)}
                </p>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="numeric text-2xl font-semibold text-brand-ink">
                    {totalServings}
                  </span>
                  <span className="text-sm text-brand-ink/55">
                    porsi · {donation.food_items.length} item
                  </span>
                </p>
              </div>
              <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
            </header>

            <ul className="flex flex-col divide-y divide-brand-ink/8 px-5">
              {donation.food_items.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-baseline justify-between gap-2 py-3"
                >
                  <span className="font-medium text-brand-ink">
                    {item.name}
                  </span>
                  <span className="text-sm text-brand-ink/50">
                    {FOOD_TYPE_LABEL[item.food_type as FoodType]} ·{" "}
                    <span className="numeric">
                      {item.quantity} {item.unit}
                    </span>{" "}
                    ·{" "}
                    <span className="numeric">{item.servings} porsi</span>
                    {item.is_halal ? "" : " · non-halal"}
                  </span>
                </li>
              ))}
            </ul>

            {notes.length > 0 || isPending ? (
              <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-brand-ink/10 bg-canvas px-5 py-4">
                <span className="text-sm text-brand-ink/55">
                  {notes.join(" · ")}
                </span>
                {isPending && !expired ? (
                  <Button asChild size="sm">
                    <Link href={`/donor/donations/${donation.id}`}>
                      Salurkan donasi
                    </Link>
                  </Button>
                ) : null}
              </footer>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
