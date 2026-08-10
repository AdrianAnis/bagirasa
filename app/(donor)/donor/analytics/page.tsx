import { redirect } from "next/navigation";

import { DonationTrendChart } from "@/components/analytics/DonationTrendChart";
import { FoodTypeChart } from "@/components/analytics/FoodTypeChart";
import { InsightCard } from "@/components/analytics/InsightCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { CO2E_KG_PER_FOOD_KG, KG_PER_SERVING } from "@/lib/config";
import { getDonorAnalytics } from "@/lib/db/analytics";
import { estimateImpact, getLatestInsight } from "@/lib/db/insights";

export default async function DonorAnalyticsPage() {
  const analytics = await getDonorAnalytics();

  if (!analytics) {
    redirect("/donor/profile");
  }

  const insight = await getLatestInsight(analytics.donorId);
  const impact = estimateImpact(analytics.completedServings);

  const stats = [
    { label: "Porsi diselamatkan", value: `${impact.mealsRescued}` },
    { label: "Estimasi makanan", value: `${impact.estKg} kg` },
    { label: "Estimasi CO₂e ditekan", value: `${impact.estCo2Kg} kg` },
    { label: "Lembaga terbantu", value: `${analytics.recipientCount}` },
  ];

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Analitik"
        title="Dampak donasimu"
        description="Ringkasan surplus makanan yang berhasil kamu salurkan, beserta polanya dari waktu ke waktu."
      />

      {analytics.totalDonations === 0 ? (
        <EmptyState
          title="Belum ada data"
          description="Buat dan salurkan donasi pertamamu, lalu grafik serta insight akan muncul di sini."
        />
      ) : (
        <>
          <dl className="grid gap-px overflow-hidden rounded-xl border border-brand-ink/10 bg-brand-ink/10 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-white px-5 py-6">
                <dt className="eyebrow text-brand-ink/40">{stat.label}</dt>
                <dd className="numeric mt-2 text-3xl font-semibold text-brand-ink">
                  {stat.value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="-mt-6 text-sm text-brand-ink/45">
            Estimasi memakai asumsi {KG_PER_SERVING} kg per porsi dan{" "}
            {CO2E_KG_PER_FOOD_KG} kg CO₂e per kg makanan terselamatkan. Angka
            ini perkiraan, bukan hasil pengukuran.
          </p>

          <section className="rounded-xl border border-brand-ink/10 bg-white p-5">
            <div className="border-b border-brand-ink/10 pb-4">
              <h2 className="font-semibold text-brand-ink">
                Porsi tercatat per hari
              </h2>
              <p className="mt-1 text-sm text-brand-ink/55">
                30 hari terakhir. Arahkan kursor ke batang untuk rinciannya.
              </p>
            </div>
            <div className="pt-5">
              <DonationTrendChart data={analytics.trend} />
            </div>
          </section>

          <section className="rounded-xl border border-brand-ink/10 bg-white p-5">
            <div className="border-b border-brand-ink/10 pb-4">
              <h2 className="font-semibold text-brand-ink">
                Porsi menurut jenis makanan
              </h2>
              <p className="mt-1 text-sm text-brand-ink/55">
                Seluruh donasi yang pernah kamu catat.
              </p>
            </div>
            <div className="pt-5">
              <FoodTypeChart data={analytics.byFoodType} />
            </div>
          </section>

          {analytics.peakHours.length > 0 ? (
            <section className="rounded-xl border border-brand-ink/10 bg-white p-5">
              <h2 className="font-semibold text-brand-ink">
                Jam surplus paling sering
              </h2>
              <ul className="mt-4 flex flex-wrap gap-3">
                {analytics.peakHours.map((peak) => (
                  <li
                    key={peak.hour}
                    className="rounded-lg border border-brand-ink/10 bg-canvas px-4 py-3"
                  >
                    <p className="numeric text-lg font-semibold text-brand-ink">
                      {peak.label}
                    </p>
                    <p className="text-sm text-brand-ink/50">
                      {peak.donations} donasi
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <InsightCard insight={insight} />
        </>
      )}
    </div>
  );
}
