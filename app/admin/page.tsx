import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";

export default function AdminPage() {
  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Admin"
        title="Verifikasi akun"
        description="Memeriksa dokumen identitas restoran dan lembaga penerima sebelum akun bisa bertransaksi."
      />

      <EmptyState
        title="Panel verifikasi belum tersedia"
        description="Daftar akun menunggu verifikasi beserta dokumen identitasnya akan muncul di sini."
      />
    </div>
  );
}
