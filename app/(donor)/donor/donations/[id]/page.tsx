import Link from "next/link";
import { redirect } from "next/navigation";

import { MatchingPanel } from "@/components/donation/MatchingPanel";
import { getDonationById } from "@/lib/db/donations";
import { previewMatches } from "@/lib/db/matches";

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

  const preview = await previewMatches(donation.id);

  if (!preview.ok) {
    redirect("/donor");
  }

  const totalServings = donation.food_items.reduce(
    (total, item) => total + item.servings,
    0,
  );

  const isHalal = donation.food_items.every((item) => item.is_halal);

  const allergens = Array.from(
    new Set(donation.food_items.flatMap((item) => item.allergens)),
  );

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold text-brand">Salurkan Donasi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {donation.food_items.length} item · {totalServings} porsi ·{" "}
          {isHalal ? "halal" : "non-halal"}
          {allergens.length > 0 ? ` · alergen: ${allergens.join(", ")}` : ""}
        </p>
      </div>

      <MatchingPanel
        donationId={donation.id}
        totalServings={totalServings}
        initialOutcome={preview.data}
      />

      <Link href="/donor" className="text-sm text-brand underline">
        Kembali ke dashboard
      </Link>
    </main>
  );
}
