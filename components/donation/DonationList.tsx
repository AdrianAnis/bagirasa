import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { DonationWithItems } from "@/lib/db/donations";
import { FOOD_TYPE_LABEL, type FoodType } from "@/lib/validations/donation";

const STATUS_LABEL: Record<DonationWithItems["status"], string> = {
  draft: "Draf",
  available: "Menunggu penyaluran",
  matched: "Sudah dicocokkan",
  completed: "Selesai",
  cancelled: "Dibatalkan",
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
  if (donations.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
        Belum ada donasi. Donasi yang kamu buat akan muncul di sini.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {donations.map((donation) => {
        const totalServings = donation.food_items.reduce(
          (total, item) => total + item.servings,
          0,
        );

        return (
          <Card key={donation.id}>
            <CardHeader>
              <CardTitle className="text-base">
                {donation.food_items.length} item — {totalServings} porsi
              </CardTitle>
              <CardDescription>
                {formatDate(donation.created_at)} ·{" "}
                {STATUS_LABEL[donation.status]}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              {donation.food_items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 text-sm"
                >
                  <span className="font-medium">{item.name}</span>
                  <span className="text-muted-foreground">
                    {FOOD_TYPE_LABEL[item.food_type as FoodType]} · jumlah{" "}
                    {item.quantity} {item.unit} · estimasi {item.servings} porsi
                    {item.is_halal ? " · halal" : " · non-halal"}
                    {item.allergens.length > 0
                      ? ` · alergen: ${item.allergens.join(", ")}`
                      : ""}
                  </span>
                </div>
              ))}

              {donation.status === "available" ? (
                <Button asChild size="sm" className="mt-2 self-start">
                  <Link href={`/donor/donations/${donation.id}`}>
                    Salurkan donasi
                  </Link>
                </Button>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
