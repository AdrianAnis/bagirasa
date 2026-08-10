"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { StatusBadge, type StatusTone } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import type { PendingAccount } from "@/lib/db/admin";

const ROLE_LABEL: Record<PendingAccount["role"], string> = {
  donor: "Penyumbang",
  recipient: "Penerima",
  admin: "Admin",
};

const STATUS: Record<
  PendingAccount["status"],
  { label: string; tone: StatusTone }
> = {
  pending: { label: "Menunggu verifikasi", tone: "waiting" },
  verified: { label: "Terverifikasi", tone: "done" },
  rejected: { label: "Ditolak", tone: "danger" },
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

type AccountReviewCardProps = {
  account: PendingAccount;
};

export function AccountReviewCard({ account }: AccountReviewCardProps) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const status = STATUS[account.status];

  async function decide(next: "verified" | "rejected") {
    setPending(next);

    const response = await fetch("/api/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: account.profileId, status: next }),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error ?? "Aksi gagal");
      setPending(null);
      return;
    }

    toast.success(
      next === "verified" ? "Akun diverifikasi" : "Verifikasi ditolak",
    );
    router.refresh();
    setPending(null);
  }

  return (
    <article className="overflow-hidden rounded-xl border border-brand-ink/10 bg-white">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-brand-ink/10 px-5 py-4">
        <div>
          <p className="eyebrow text-brand-ink/40">
            {ROLE_LABEL[account.role]} · daftar {formatDate(account.createdAt)}
          </p>
          <h3 className="mt-1 font-semibold text-brand-ink">
            {account.organisationName ?? "Profil belum dilengkapi"}
          </h3>
          <p className="text-sm text-brand-ink/50">{account.email}</p>
        </div>
        <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
      </header>

      <div className="flex flex-col gap-2 px-5 py-4 text-sm">
        {account.address ? (
          <p className="text-brand-ink/60">{account.address}</p>
        ) : null}
        {account.phone ? (
          <p className="numeric text-brand-ink/50">{account.phone}</p>
        ) : null}
        {account.detail ? (
          <p className="text-brand-ink/50">{account.detail}</p>
        ) : null}

        {account.documentUrl ? (
          <a
            href={account.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 self-start font-medium text-brand underline"
          >
            Buka dokumen identitas
          </a>
        ) : (
          <p className="mt-1 text-brand-ink/45">
            Belum ada dokumen identitas diunggah.
          </p>
        )}
      </div>

      {account.status === "pending" ? (
        <footer className="flex flex-wrap gap-3 border-t border-brand-ink/10 bg-canvas px-5 py-4">
          <Button
            onClick={() => decide("verified")}
            disabled={pending !== null || !account.organisationName}
          >
            {pending === "verified" ? "Memproses..." : "Setujui"}
          </Button>
          <Button
            variant="outline"
            onClick={() => decide("rejected")}
            disabled={pending !== null}
          >
            {pending === "rejected" ? "Memproses..." : "Tolak"}
          </Button>
          {!account.organisationName ? (
            <p className="self-center text-sm text-brand-ink/45">
              Menunggu pengguna melengkapi profil dan dokumen.
            </p>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}
