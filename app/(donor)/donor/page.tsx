import Link from "next/link";

import { LogoutButton } from "@/components/shared/LogoutButton";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCurrentDonor } from "@/lib/db/donors";
import { getCurrentProfile } from "@/lib/db/profiles";

export default async function DonorDashboardPage() {
  const [profile, donor] = await Promise.all([
    getCurrentProfile(),
    getCurrentDonor(),
  ]);

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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status verifikasi</CardTitle>
          <CardDescription>
            {profile?.verification_status === "verified"
              ? "Akun terverifikasi. Donasimu bisa disalurkan."
              : "Menunggu verifikasi admin. Kamu tetap bisa melengkapi data sambil menunggu."}
          </CardDescription>
        </CardHeader>
      </Card>
    </main>
  );
}
