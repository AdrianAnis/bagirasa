import Link from "next/link";

import { DonationList } from "@/components/donation/DonationList";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { listDonorDonations } from "@/lib/db/donations";

export default async function DonorDonationsPage() {
  const donations = await listDonorDonations();

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        title="Histori donasi"
        description="Semua donasi yang pernah kamu catat, terbaru di paling atas."
      />

      {donations.length === 0 ? (
        <EmptyState
          title="Belum ada donasi"
          description="Catat sisa makanan hari ini, lalu salurkan ke lembaga terdekat yang membutuhkan."
          action={
            <Button asChild>
              <Link href="/donor/donations/new">Buat donasi</Link>
            </Button>
          }
        />
      ) : (
        <DonationList donations={donations} />
      )}
    </div>
  );
}
