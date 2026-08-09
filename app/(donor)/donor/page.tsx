import Link from "next/link";

import { DonationList } from "@/components/donation/DonationList";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { listDonorDonations } from "@/lib/db/donations";
import { getCurrentDonor } from "@/lib/db/donors";

export default async function DonorDashboardPage() {
  const [donor, donations] = await Promise.all([
    getCurrentDonor(),
    listDonorDonations(),
  ]);

  const countServings = (donation: (typeof donations)[number]) =>
    donation.food_items.reduce((sum, item) => sum + item.servings, 0);

  const distributedServings = donations
    .filter(
      (donation) =>
        donation.status === "matched" || donation.status === "completed",
    )
    .reduce((total, donation) => total + countServings(donation), 0);

  const pendingDonations = donations.filter(
    (donation) => donation.status === "available",
  ).length;

  const stats = [
    { label: "Donasi dibuat", value: donations.length },
    { label: "Porsi tersalurkan", value: distributedServings },
    { label: "Menunggu disalurkan", value: pendingDonations },
  ];

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Penyumbang"
        title={donor?.name ?? "Dashboard donor"}
        description={
          donor
            ? donor.address
            : "Lengkapi profil restoran dulu. Donasi baru bisa dibuat setelah lokasi dan dokumen terisi."
        }
        actions={
          donor ? (
            <Button asChild>
              <Link href="/donor/donations/new">Buat donasi</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/donor/profile">Lengkapi profil</Link>
            </Button>
          )
        }
      />

      {donor ? (
        <dl className="grid gap-px overflow-hidden rounded-xl border border-brand-ink/10 bg-brand-ink/10 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white px-5 py-6">
              <dt className="eyebrow text-brand-ink/40">{stat.label}</dt>
              <dd className="numeric mt-2 text-3xl font-semibold text-brand-ink">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-brand-ink">Histori donasi</h2>
        {donations.length === 0 ? (
          <EmptyState
            title="Belum ada donasi"
            description={
              donor
                ? "Catat sisa makanan hari ini, lalu salurkan ke panti terdekat yang membutuhkan."
                : "Lengkapi profil restoran dulu sebelum membuat donasi pertama."
            }
            action={
              <Button asChild>
                <Link href={donor ? "/donor/donations/new" : "/donor/profile"}>
                  {donor ? "Buat donasi" : "Lengkapi profil"}
                </Link>
              </Button>
            }
          />
        ) : (
          <DonationList donations={donations} />
        )}
      </section>
    </div>
  );
}
