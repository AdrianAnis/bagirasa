type VerificationNoticeProps = {
  status: string;
  role: "donor" | "recipient";
};

export function VerificationNotice({ status, role }: VerificationNoticeProps) {
  if (status === "verified") {
    return null;
  }

  const isRejected = status === "rejected";

  const action =
    role === "donor" ? "menyalurkan donasi" : "menerima donasi masuk";

  return (
    <div
      className={
        isRejected
          ? "rounded-xl border border-red-300 bg-red-50 px-5 py-4"
          : "rounded-xl border border-amber-300 bg-amber-50 px-5 py-4"
      }
    >
      <p
        className={
          isRejected
            ? "font-medium text-red-900"
            : "font-medium text-amber-900"
        }
      >
        {isRejected ? "Verifikasi ditolak" : "Menunggu verifikasi admin"}
      </p>
      <p
        className={
          isRejected
            ? "mt-1 text-sm text-red-900/70"
            : "mt-1 text-sm text-amber-900/70"
        }
      >
        {isRejected
          ? `Dokumen yang kamu unggah belum bisa diverifikasi. Perbarui dokumen di halaman profil, lalu hubungi admin agar diperiksa ulang.`
          : `Lengkapi profil dan dokumen identitas agar admin bisa memeriksanya. Kamu baru bisa ${action} setelah akun terverifikasi.`}
      </p>
    </div>
  );
}
