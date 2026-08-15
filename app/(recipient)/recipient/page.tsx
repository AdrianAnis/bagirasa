import Link from "next/link";

import { IncomingDonationCard } from "@/components/recipient/IncomingDonationCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { listRecipientMatches } from "@/lib/db/matches";
import { getCurrentRecipient } from "@/lib/db/recipients";

export default async function RecipientDashboardPage() {
  const [recipient, matches] = await Promise.all([
    getCurrentRecipient(),
    listRecipientMatches(),
  ]);

  const incoming = matches.filter((match) => match.status === "pending");
  const inProgress = matches.filter((match) => match.status === "accepted");
  const completed = matches.filter((match) => match.status === "completed");

  const receivedServings = completed.reduce(
    (total, match) => total + match.allocated_servings,
    0,
  );

  const donorNames = new Set(
    completed
      .map((match) => match.food_donations?.donors?.name)
      .filter((name): name is string => Boolean(name)),
  );

  const stats = [
    { label: "Porsi diterima", value: `${receivedServings}`, unit: null },
    { label: "Donasi diterima", value: `${completed.length}`, unit: null },
    { label: "Restoran penyumbang", value: `${donorNames.size}`, unit: null },
    {
      label: "Kebutuhan porsi",
      value: `${recipient?.current_need ?? 0}`,
      unit: "hari ini",
    },
  ];

  const hasActivity = incoming.length > 0 || inProgress.length > 0;

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title={recipient?.name ?? "Dashboard penerima"}
        description={recipient?.address ?? "Profil lembaga belum lengkap."}
      />

      {recipient && recipient.current_need <= 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
          <div>
            <p className="font-medium text-amber-900">
              Lembagamu belum ikut dicocokkan
            </p>
            <p className="mt-1 text-sm text-amber-900/70">
              Kebutuhan porsimu masih 0, jadi tidak ada donasi yang akan masuk.
              Isi berapa porsi yang kamu butuhkan hari ini.
            </p>
          </div>
          <Button asChild>
            <Link href="/recipient/profile">Atur kebutuhan porsi</Link>
          </Button>
        </div>
      ) : null}

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

      {incoming.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-brand-ink">
            Menunggu jawabanmu
          </h2>
          {incoming.map((match) => (
            <IncomingDonationCard key={match.id} match={match} />
          ))}
        </section>
      ) : null}

      {inProgress.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-brand-ink">
            Menunggu penyerahan
          </h2>
          {inProgress.map((match) => (
            <IncomingDonationCard key={match.id} match={match} />
          ))}
        </section>
      ) : null}

      {hasActivity ? null : (
        <EmptyState
          title="Tidak ada donasi yang menunggu"
          description="Begitu ada restoran terdekat yang mencatat surplus dan cocok dengan lembagamu, donasinya akan muncul di sini."
          action={
            <Button asChild variant="outline">
              <Link href="/recipient/donations">Lihat histori penerimaan</Link>
            </Button>
          }
        />
      )}
    </div>
  );
}
