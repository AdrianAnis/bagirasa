import Link from "next/link";

import { IncomingDonationCard } from "@/components/recipient/IncomingDonationCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { listRecipientMatches } from "@/lib/db/matches";
import { getCurrentRecipient } from "@/lib/db/recipients";
import { RECIPIENT_TYPE_LABEL } from "@/lib/validations/recipient";

export default async function RecipientDashboardPage() {
  const [recipient, matches] = await Promise.all([
    getCurrentRecipient(),
    listRecipientMatches(),
  ]);

  const incoming = matches.filter((match) => match.status === "pending");
  const inProgress = matches.filter((match) => match.status === "accepted");
  const history = matches.filter(
    (match) => match.status === "completed" || match.status === "rejected",
  );

  const receivedServings = matches
    .filter((match) => match.status === "completed")
    .reduce((total, match) => total + match.allocated_servings, 0);

  const stats = [
    { label: "Menunggu jawaban", value: incoming.length },
    { label: "Menunggu penyerahan", value: inProgress.length },
    { label: "Kebutuhan porsi", value: recipient?.current_need ?? 0 },
    { label: "Porsi diterima", value: receivedServings },
  ];

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow={recipient ? RECIPIENT_TYPE_LABEL[recipient.type] : "Penerima"}
        title={recipient?.name ?? "Dashboard penerima"}
        description={recipient?.address ?? "Profil lembaga belum lengkap."}
        actions={
          <Button asChild variant="outline">
            <Link href="/recipient/profile">Ubah profil</Link>
          </Button>
        }
      />

      {recipient && recipient.current_need <= 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-300 bg-amber-50 px-5 py-4">
          <div>
            <p className="font-medium text-amber-900">
              Belum menerima donasi masuk
            </p>
            <p className="mt-1 text-sm text-amber-900/70">
              Kebutuhan porsimu masih 0, jadi lembagamu belum ikut dicocokkan.
              Isi berapa porsi yang kamu butuhkan hari ini.
            </p>
          </div>
          <Button asChild>
            <Link href="/recipient/profile">Atur kebutuhan porsi</Link>
          </Button>
        </div>
      ) : null}

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

      {incoming.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-brand-ink">Donasi masuk</h2>
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

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-brand-ink">
          Histori penerimaan
        </h2>
        {history.length === 0 ? (
          <EmptyState
            title="Belum ada riwayat"
            description="Donasi yang kamu terima atau tolak akan tercatat di sini."
          />
        ) : (
          history.map((match) => (
            <IncomingDonationCard key={match.id} match={match} />
          ))
        )}
      </section>
    </div>
  );
}
