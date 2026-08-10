import { redirect } from "next/navigation";

import { AccountReviewCard } from "@/components/admin/AccountReviewCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { isCurrentUserAdmin, listAccounts } from "@/lib/db/admin";

export default async function AdminPage() {
  if (!(await isCurrentUserAdmin())) {
    redirect("/login");
  }

  const [pending, verified, rejected] = await Promise.all([
    listAccounts("pending"),
    listAccounts("verified"),
    listAccounts("rejected"),
  ]);

  const stats = [
    { label: "Menunggu verifikasi", value: pending.length },
    { label: "Terverifikasi", value: verified.length },
    { label: "Ditolak", value: rejected.length },
  ];

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Admin"
        title="Verifikasi akun"
        description="Periksa dokumen identitas restoran dan lembaga penerima. Hanya akun terverifikasi yang bisa menyalurkan dan menerima donasi."
      />

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

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-brand-ink">
          Menunggu verifikasi
        </h2>
        {pending.length === 0 ? (
          <EmptyState
            title="Tidak ada antrean"
            description="Akun baru yang mendaftar akan muncul di sini untuk diperiksa."
          />
        ) : (
          pending.map((account) => (
            <AccountReviewCard key={account.profileId} account={account} />
          ))
        )}
      </section>

      {verified.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-brand-ink">
            Sudah terverifikasi
          </h2>
          {verified.map((account) => (
            <AccountReviewCard key={account.profileId} account={account} />
          ))}
        </section>
      ) : null}

      {rejected.length > 0 ? (
        <section className="flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-brand-ink">Ditolak</h2>
          {rejected.map((account) => (
            <AccountReviewCard key={account.profileId} account={account} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
