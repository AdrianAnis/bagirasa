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
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Profil restoran"
        description="Lokasi menentukan panti mana yang dicocokkan dengan donasimu. Dokumen KTP dipakai admin untuk verifikasi dan disimpan di penyimpanan privat."
      />

      <div className="max-w-2xl">
        <DonorProfileForm userId={profile.id} donor={donor} />
      </div>
    </div>
  );
}
