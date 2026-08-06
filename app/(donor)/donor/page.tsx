import Link from "next/link";

import { DonationList } from "@/components/donation/DonationList";
import { LogoutButton } from "@/components/shared/LogoutButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listDonorDonations } from "@/lib/db/donations";
import { getCurrentDonor } from "@/lib/db/donors";
import { getCurrentProfile } from "@/lib/db/profiles";

export default async function DonorDashboardPage() {
  const [profile, donor, donations] = await Promise.all([
    getCurrentProfile(),
    getCurrentDonor(),
    listDonorDonations(),
  ]);

  const totalServings = donations.reduce(
    (total, donation) =>
      total + donation.food_items.reduce((sum, item) => sum + item.servings, 0),
    0,
  );

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand">Dashboard Donor</h1>
          <p className="mt-1 text-sm text-muted-foreground">{profile?.email}</p>
        </div>
        <LogoutButton />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil restoran</CardTitle>
          <CardDescription>
            {donor
              ? `${donor.name} — ${donor.address}`
              : "Belum dilengkapi. Donasi baru bisa dibuat setelah profil restoran terisi."}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button asChild variant={donor ? "outline" : "default"}>
            <Link href="/donor/profile">
              {donor ? "Ubah profil" : "Lengkapi profil"}
            </Link>
          </Button>
          {donor ? (
            <Button asChild>
              <Link href="/donor/donations/new">Buat donasi</Link>
            </Button>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ringkasan</CardTitle>
          <CardDescription>
            {donations.length} donasi · {totalServings} porsi tersalurkan ·
            status verifikasi {profile?.verification_status}
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Histori donasi</h2>
        <DonationList donations={donations} />
      </div>
    </main>
  );
}
