import Link from "next/link";

import { IncomingDonationCard } from "@/components/recipient/IncomingDonationCard";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listRecipientMatches } from "@/lib/db/matches";
import { getCurrentProfile } from "@/lib/db/profiles";
import { getCurrentRecipient } from "@/lib/db/recipients";
import { RECIPIENT_TYPE_LABEL } from "@/lib/validations/recipient";

export default async function RecipientDashboardPage() {
  const [profile, recipient, matches] = await Promise.all([
    getCurrentProfile(),
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

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand">
            Dashboard Penerima
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{profile?.email}</p>
        </div>
        <LogoutButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil lembaga</CardTitle>
          <CardDescription>
            {recipient
              ? `${recipient.name} · ${RECIPIENT_TYPE_LABEL[recipient.type]} · butuh ${recipient.current_need} porsi`
              : "Belum dilengkapi. Donasi baru bisa masuk setelah profil terisi."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant={recipient ? "outline" : "default"}>
            <Link href="/recipient/profile">
              {recipient ? "Ubah profil" : "Lengkapi profil"}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
          <CardDescription>
            {incoming.length} donasi menunggu jawaban · {inProgress.length}{" "}
            menunggu penyerahan · {receivedServings} porsi sudah diterima
          </CardDescription>
        </CardHeader>
      </Card>

      {incoming.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Donasi masuk</h2>
          {incoming.map((match) => (
            <IncomingDonationCard key={match.id} match={match} />
          ))}
        </div>
      ) : null}

      {inProgress.length > 0 ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Menunggu penyerahan</h2>
          {inProgress.map((match) => (
            <IncomingDonationCard key={match.id} match={match} />
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Histori penerimaan</h2>
        {history.length === 0 ? (
          <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            {recipient
              ? "Belum ada riwayat. Donasi yang kamu terima akan muncul di sini."
              : "Lengkapi profil lembaga dulu agar bisa menerima donasi."}
          </p>
        ) : (
          history.map((match) => (
            <IncomingDonationCard key={match.id} match={match} />
          ))
        )}
      </div>
    </main>
  );
}
