import { redirect } from "next/navigation";

import { MatchingPanel } from "@/components/donation/MatchingPanel";
import { PageHeader } from "@/components/shared/PageHeader";
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
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Penyaluran"
        title={`${totalServings} porsi siap disalurkan`}
        description={`${donation.food_items.length} item · ${
          isHalal ? "halal" : "non-halal"
        }${allergens.length > 0 ? ` · alergen: ${allergens.join(", ")}` : " · tanpa alergen tercatat"}`}
      />

      <div className="max-w-2xl">
        <MatchingPanel
          donationId={donation.id}
          totalServings={totalServings}
          initialOutcome={preview.data}
        />
      </div>
    </div>
  );
}
