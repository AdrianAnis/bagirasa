"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { VERIFICATION_ROUTE } from "@/lib/config";

type PendingVerificationDialogProps = {
  open: boolean;
  organisationName: string;
};

export function PendingVerificationDialog({
  open,
  organisationName,
}: PendingVerificationDialogProps) {
  const router = useRouter();

  function goToStatus() {
    router.replace(VERIFICATION_ROUTE);
    router.refresh();
  }

  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Pendaftaran diterima</DialogTitle>
          <DialogDescription className="leading-relaxed">
            Data dan dokumen {organisationName} sudah kami terima. Admin akan
            memeriksanya terlebih dahulu, dan kamu baru bisa masuk dashboard
            setelah verifikasi disetujui.
          </DialogDescription>
        </DialogHeader>

        <p className="rounded-lg bg-canvas px-4 py-3 text-sm text-brand-ink/60">
          Kamu akan mendapat notifikasi begitu admin selesai memeriksa. Sambil
          menunggu, data yang kamu kirim masih bisa diperbaiki.
        </p>

        <DialogFooter>
          <Button onClick={goToStatus} className="w-full" size="lg">
            Lihat status verifikasi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
