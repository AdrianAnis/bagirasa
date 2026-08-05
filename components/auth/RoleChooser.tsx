"use client";

import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RoleChooser() {
  const [showRecipientTypes, setShowRecipientTypes] = useState(false);

  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold text-brand">Daftar sebagai apa?</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Pilih peran yang sesuai. Peran menentukan menu dan data yang bisa kamu
          akses.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Penyumbang</CardTitle>
            <CardDescription>
              Restoran, rumah makan, atau warteg yang ingin menyalurkan surplus
              makanan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/register?role=donor">Pilih Penyumbang</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Penerima</CardTitle>
            <CardDescription>
              Panti asuhan atau rumah lansia yang menerima donasi makanan.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {showRecipientTypes ? (
              <>
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
              </>
            ) : (
              <Button
                type="button"
                className="w-full"
                onClick={() => setShowRecipientTypes(true)}
              >
                Pilih Penerima
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-brand underline">
          Masuk
        </Link>
      </p>
    </div>
  );
}
