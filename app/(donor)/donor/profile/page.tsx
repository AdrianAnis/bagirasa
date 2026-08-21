import { redirect } from "next/navigation";

import { DonorProfileForm } from "@/components/donor/DonorProfileForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { getCurrentDonor } from "@/lib/db/donors";
import { getCurrentProfile } from "@/lib/db/profiles";

export default async function DonorProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const donor = await getCurrentDonor();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <PageHeader
        title="Profil restoran"
        description="Lokasi menentukan lembaga mana yang dicocokkan dengan donasimu. Dokumen KTP dipakai admin untuk verifikasi dan disimpan di penyimpanan privat."
      />

      <DonorProfileForm userId={profile.id} donor={donor} />
    </div>
  );
}
