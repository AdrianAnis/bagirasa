"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function RoleChooser() {
  const [showRecipientTypes, setShowRecipientTypes] = useState(false);

  return (
    <div className="flex w-full max-w-3xl flex-col">
      <div className="text-center">
        <p className="eyebrow text-brand/70">Daftar</p>
        <h1 className="mt-2 text-title font-semibold text-brand-ink">
          Kamu bergabung sebagai apa?
        </h1>
        <p className="mt-2 text-sm text-brand-ink/55">
          Peran menentukan menu dan data yang bisa kamu akses. Pilihan ini tidak
          bisa diubah sendiri setelah akun dibuat.
        </p>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col rounded-xl border border-brand-ink/10 bg-white p-6">
          <h2 className="font-semibold text-brand-ink">Penyumbang</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-ink/55">
            Restoran, rumah makan, atau warteg yang ingin menyalurkan surplus
            makanan layak konsumsi.
          </p>
          <Button asChild className="mt-6 w-full">
            <Link href="/register?role=donor">Daftar sebagai penyumbang</Link>
          </Button>
        </div>

        <div className="flex flex-col rounded-xl border border-brand-ink/10 bg-white p-6">
          <h2 className="font-semibold text-brand-ink">Penerima</h2>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-brand-ink/55">
            Panti asuhan atau rumah lansia yang menerima donasi makanan.
          </p>

          {showRecipientTypes ? (
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild variant="outline" className="w-full">
                <Link href="/register?role=recipient&type=panti_asuhan">
                  Panti Asuhan
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/register?role=recipient&type=rumah_lansia">
                  Rumah Lansia
                </Link>
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              className="mt-6 w-full"
              onClick={() => setShowRecipientTypes(true)}
            >
              Daftar sebagai penerima
            </Button>
          )}
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-brand-ink/55">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-brand underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
