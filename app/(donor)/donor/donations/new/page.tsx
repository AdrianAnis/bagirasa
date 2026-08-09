import { redirect } from "next/navigation";

import { DonationForm } from "@/components/donation/DonationForm";
import { PageHeader } from "@/components/shared/PageHeader";
import { getCurrentDonor } from "@/lib/db/donors";

export default async function NewDonationPage() {
  const donor = await getCurrentDonor();

  if (!donor) {
    redirect("/donor/profile");
  }

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Donasi baru"
        title="Catat sisa makanan"
        description="Satu donasi boleh berisi beberapa item. Isi bahan dan alergen dengan jujur — data inilah yang menjaga penerima tetap aman."
      />

      <div className="max-w-2xl">
        <DonationForm />
      </div>
    </div>
  );
}
