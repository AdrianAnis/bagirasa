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
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8">
      <PageHeader
        title="Catat sisa makanan"
        description="Satu donasi boleh berisi beberapa item. Isi bahan dan alergen dengan jujur — data inilah yang menjaga penerima tetap aman."
      />

      <DonationForm />
    </div>
  );
}
