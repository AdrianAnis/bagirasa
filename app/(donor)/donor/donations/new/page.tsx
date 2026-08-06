import Link from "next/link";
import { redirect } from "next/navigation";

import { DonationForm } from "@/components/donation/DonationForm";
import { getCurrentDonor } from "@/lib/db/donors";

export default async function NewDonationPage() {
  const donor = await getCurrentDonor();

  if (!donor) {
    redirect("/donor/profile");
  }

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold text-brand">Input Donasi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Satu donasi boleh berisi beberapa item makanan. Isi bahan dan alergen
          dengan jujur — data ini yang menjaga penerima tetap aman.
        </p>
      </div>

      <DonationForm />

      <Link href="/donor" className="text-sm text-brand underline">
        Kembali ke dashboard
      </Link>
    </main>
  );
}
