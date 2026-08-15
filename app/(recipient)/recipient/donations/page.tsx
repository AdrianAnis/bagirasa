import { IncomingDonationCard } from "@/components/recipient/IncomingDonationCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { listRecipientMatches } from "@/lib/db/matches";

export default async function RecipientDonationsPage() {
  const matches = await listRecipientMatches();

  const history = matches.filter(
    (match) => match.status === "completed" || match.status === "rejected",
  );

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Histori penerimaan"
        description="Donasi yang sudah kamu terima atau tolak, terbaru di paling atas."
      />

      {history.length === 0 ? (
        <EmptyState
          title="Belum ada riwayat"
          description="Donasi yang kamu terima atau tolak akan tercatat di sini."
        />
      ) : (
        <div className="flex flex-col gap-4">
          {history.map((match) => (
            <IncomingDonationCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
