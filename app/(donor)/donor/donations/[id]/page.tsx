import Link from "next/link";
import { redirect } from "next/navigation";

import { MatchingPanel } from "@/components/donation/MatchingPanel";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { getDonationById } from "@/lib/db/donations";
import { previewMatches } from "@/lib/db/matches";
import { expiresAt, formatRemaining, isExpired } from "@/lib/matching";

export default async function DonationMatchingPage({
  params,
}: PageProps<"/donor/donations/[id]">) {
  const { id } = await params;
  const donation = await getDonationById(id);

  if (!donation) {
    redirect("/donor");
  }

  if (donation.status !== "available") {
    redirect("/donor");
  }

  const deadline = expiresAt(
    donation.created_at,
    donation.food_items.map((item) => item.shelf_life_hours),
  );

  const totalServings = donation.food_items.reduce(
    (total, item) => total + item.servings,
    0,
  );

  if (isExpired(deadline)) {
    return (
      <div className="flex flex-col gap-8">
        <PageHeader
          eyebrow="Penyaluran"
          title="Donasi sudah kedaluwarsa"
          description={`${totalServings} porsi · batas ketahanan terlewat pada ${deadline?.toLocaleString("id-ID", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}`}
        />

        <div className="rounded-xl border border-red-300 bg-red-50 px-5 py-4">
          <p className="font-medium text-red-900">
            Donasi ini tidak bisa disalurkan
          </p>
          <p className="mt-1 text-sm leading-relaxed text-red-900/70">
            Makanan sudah melewati batas ketahanan yang kamu catat, jadi tidak
            lagi aman dikonsumsi. Buat donasi baru untuk sisa makanan hari ini.
          </p>
        </div>

        <Button asChild className="self-start">
          <Link href="/donor/donations/new">Buat donasi baru</Link>
        </Button>
      </div>
    );
  }

  const preview = await previewMatches(donation.id);

  if (!preview.ok) {
    redirect("/donor");
  }

  const isHalal = donation.food_items.every((item) => item.is_halal);
  const remaining = formatRemaining(deadline);

  const allergens = Array.from(
    new Set(donation.food_items.flatMap((item) => item.allergens)),
  );

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <PageHeader
        title={`${totalServings} porsi siap disalurkan`}
        description={`${donation.food_items.length} item · ${
          isHalal ? "halal" : "non-halal"
        }${allergens.length > 0 ? ` · alergen: ${allergens.join(", ")}` : " · tanpa alergen tercatat"}`}
      />

      <div className="flex flex-col gap-6">
        {remaining ? (
          <div className="flex flex-wrap items-baseline justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4">
            <span className="text-sm font-medium text-amber-900">
              Sisa waktu ketahanan makanan
            </span>
            <span className="numeric text-sm font-semibold text-amber-900">
              {remaining}
            </span>
          </div>
        ) : null}

        <MatchingPanel
          donationId={donation.id}
          totalServings={totalServings}
          initialOutcome={preview.data}
        />
      </div>
    </div>
  );
}
