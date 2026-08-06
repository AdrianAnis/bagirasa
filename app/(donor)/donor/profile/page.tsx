import Link from "next/link";
import { redirect } from "next/navigation";

import { DonorProfileForm } from "@/components/donor/DonorProfileForm";
import { getCurrentDonor } from "@/lib/db/donors";
import { getCurrentProfile } from "@/lib/db/profiles";

export default async function DonorProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const donor = await getCurrentDonor();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold text-brand">Profil Restoran</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Lengkapi data ini sebelum membuat donasi. Lokasi dipakai untuk
          mencocokkan donasimu dengan penerima terdekat.
        </p>
      </div>

      <DonorProfileForm userId={profile.id} donor={donor} />

      <Link href="/donor" className="text-sm text-brand underline">
        Kembali ke dashboard
      </Link>
    </main>
  );
}
