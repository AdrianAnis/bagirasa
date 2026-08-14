import Link from "next/link";
import { redirect } from "next/navigation";

import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { PROFILE_ROUTE, ROLE_HOME } from "@/lib/config";
import { getCurrentDonor } from "@/lib/db/donors";
import { getCurrentProfile } from "@/lib/db/profiles";
import { getCurrentRecipient } from "@/lib/db/recipients";

const STATUS_COPY = {
  pending: {
    eyebrow: "Menunggu",
    title: "Dokumenmu sedang diperiksa",
    description:
      "Admin BagiRasa memeriksa dokumen identitas setiap akun sebelum mengaktifkannya. Proses ini menjaga agar hanya lembaga yang benar-benar ada yang bisa menyalurkan dan menerima makanan.",
    tone: "border-amber-300 bg-amber-50",
    heading: "text-amber-900",
    body: "text-amber-900/70",
    message:
      "Kamu akan mendapat notifikasi begitu pemeriksaan selesai. Tidak perlu mengirim ulang dokumen.",
  },
  rejected: {
    eyebrow: "Ditolak",
    title: "Verifikasi belum bisa disetujui",
    description:
      "Dokumen yang kamu unggah belum bisa kami verifikasi. Perbarui dokumen dan pastikan datanya terbaca jelas, lalu admin akan memeriksanya kembali.",
    tone: "border-red-300 bg-red-50",
    heading: "text-red-900",
    body: "text-red-900/70",
    message:
      "Perbaiki dokumen lewat halaman profil. Setelah diperbarui, akunmu masuk antrean pemeriksaan lagi.",
  },
} as const;

export default async function VerificationPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  if (profile.verification_status === "verified") {
    redirect(ROLE_HOME[profile.role]);
  }

  const isDonor = profile.role === "donor";
  const organisation = isDonor
    ? await getCurrentDonor()
    : await getCurrentRecipient();

  const copy =
    profile.verification_status === "rejected"
      ? STATUS_COPY.rejected
      : STATUS_COPY.pending;

  const profileRoute = isDonor ? PROFILE_ROUTE.donor : PROFILE_ROUTE.recipient;

  const details = [
    { label: "Nama", value: organisation?.name ?? "Belum diisi" },
    { label: "Alamat", value: organisation?.address ?? "Belum diisi" },
    { label: "Telepon", value: organisation?.phone ?? "Belum diisi" },
    { label: "Email akun", value: profile.email },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        eyebrow={copy.eyebrow}
        title={copy.title}
        description={copy.description}
      />

      <div className={`rounded-xl border px-5 py-4 ${copy.tone}`}>
        <p className={`font-medium ${copy.heading}`}>{copy.message}</p>
      </div>

      <section className="rounded-xl border border-brand-ink/10 bg-white">
        <div className="border-b border-brand-ink/10 px-5 py-4">
          <h2 className="font-semibold text-brand-ink">Data yang dikirim</h2>
        </div>
        <dl className="flex flex-col divide-y divide-brand-ink/8 px-5">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="flex flex-wrap items-baseline justify-between gap-2 py-3"
            >
              <dt className="text-sm text-brand-ink/50">{detail.label}</dt>
              <dd className="text-sm font-medium text-brand-ink">
                {detail.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <Button asChild className="self-start" size="lg">
        <Link href={profileRoute}>
          {profile.verification_status === "rejected"
            ? "Perbarui dokumen"
            : "Perbaiki data"}
        </Link>
      </Button>
    </div>
  );
}
