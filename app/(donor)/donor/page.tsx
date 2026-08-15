import Link from "next/link";
import { redirect } from "next/navigation";

import { DonationTrendChart } from "@/components/analytics/DonationTrendChart";
import { FoodTypeChart } from "@/components/analytics/FoodTypeChart";
import { InsightCard } from "@/components/analytics/InsightCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { RatingStars } from "@/components/shared/RatingStars";
import { SectionCard } from "@/components/shared/SectionCard";
import { Button } from "@/components/ui/button";
import { CO2E_KG_PER_FOOD_KG, KG_PER_SERVING } from "@/lib/config";
import { getDonorAnalytics } from "@/lib/db/analytics";
import { getCurrentDonor } from "@/lib/db/donors";
import { listDonorFeedback } from "@/lib/db/feedback";
import { estimateImpact, getLatestInsight } from "@/lib/db/insights";

export default async function DonorDashboardPage() {
  const [donor, analytics] = await Promise.all([
    getCurrentDonor(),
    getDonorAnalytics(),
  ]);

  if (!analytics) {
    redirect("/donor/profile");
  }

  const [insight, feedback] = await Promise.all([
    getLatestInsight(analytics.donorId),
    listDonorFeedback(analytics.donorId),
  ]);

  const impact = estimateImpact(analytics.completedServings);
  const reputation = donor ? Number(donor.reputation_score) : 0;

  const stats = [
    { label: "Porsi tersalurkan", value: `${impact.mealsRescued}`, unit: null },
    { label: "Lembaga terbantu", value: `${analytics.recipientCount}`, unit: null },
    { label: "Estimasi CO₂e ditekan", value: `${impact.estCo2Kg}`, unit: "kg" },
    {
      label: "Menunggu disalurkan",
      value: `${analytics.availableDonations}`,
      unit: "donasi",
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={donor?.name ?? "Dashboard donor"}
        description={donor?.address ?? "Profil restoran belum lengkap."}
      />

      {analytics.totalDonations === 0 ? (
        <EmptyState
          title="Belum ada donasi"
          description="Catat sisa makanan hari ini, lalu salurkan ke panti terdekat yang membutuhkan. Grafik dan insight akan muncul setelah donasi pertamamu."
          action={
            <Button asChild>
              <Link href="/donor/donations/new">Buat donasi</Link>
            </Button>
          }
        />
      ) : (
        <>
          <div>
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-xl border border-brand-ink/8 bg-white px-5 py-5"
                >
                  <dt className="text-sm text-brand-ink/50">{stat.label}</dt>
                  <dd className="numeric mt-2 text-3xl font-semibold text-brand-ink">
                    {stat.value}
                    {stat.unit ? (
                      <span className="ml-1.5 text-base font-medium text-brand-ink/35">
                        {stat.unit}
                      </span>
                    ) : null}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-3 text-xs leading-relaxed text-brand-ink/40">
              Estimasi memakai asumsi {KG_PER_SERVING} kg per porsi dan{" "}
              {CO2E_KG_PER_FOOD_KG} kg CO₂e per kg makanan terselamatkan. Angka
              ini perkiraan, bukan hasil pengukuran.
            </p>
          </div>

          <SectionCard
            title="Porsi tercatat per hari"
            description="30 hari terakhir. Arahkan kursor ke batang untuk rinciannya."
          >
            <DonationTrendChart data={analytics.trend} />
          </SectionCard>

          <div className="grid gap-4 lg:grid-cols-5">
            <SectionCard
              title="Porsi menurut jenis makanan"
              description="Seluruh donasi yang pernah kamu catat."
              className="lg:col-span-3"
            >
              <FoodTypeChart data={analytics.byFoodType} />
            </SectionCard>

            <SectionCard
              title="Jam surplus paling sering"
              description="Tiga jam tersibuk saat kamu mencatat donasi."
              className="lg:col-span-2"
            >
              {analytics.peakHours.length === 0 ? (
                <p className="text-sm text-brand-ink/45">
                  Belum cukup data untuk melihat polanya.
                </p>
              ) : (
                <ul className="flex flex-col divide-y divide-brand-ink/8">
                  {analytics.peakHours.map((peak) => (
                    <li
                      key={peak.hour}
                      className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <span className="numeric text-lg font-semibold text-brand-ink">
                        {peak.label}
                      </span>
                      <span className="text-sm text-brand-ink/50">
                        {peak.donations} donasi
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>

          <InsightCard insight={insight} />

          {feedback.length > 0 ? (
            <SectionCard
              title="Reputasi restoran"
              description={`Dari ${feedback.length} penilaian penerima.`}
              action={
                <div className="flex items-center gap-2">
                  <RatingStars value={reputation} size="md" />
                  <span className="numeric text-lg font-semibold text-brand-ink">
                    {reputation.toFixed(1)}
                  </span>
                </div>
              }
            >
              <ul className="flex flex-col divide-y divide-brand-ink/8">
                {feedback.map((item) => (
                  <li
                    key={item.id}
                    className="flex flex-col gap-1.5 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex flex-wrap items-center gap-3">
                      <RatingStars value={item.rating} />
                      <span className="text-sm font-medium text-brand-ink">
                        {item.recipients?.name ?? "Penerima"}
                      </span>
                    </div>
                    {item.comment ? (
                      <p className="text-sm text-brand-ink/60">{item.comment}</p>
                    ) : null}
                  </li>
                ))}
              </ul>
            </SectionCard>
          ) : null}
        </>
      )}
    </div>
  );
}
