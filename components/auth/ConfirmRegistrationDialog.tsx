"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type SummaryRow = {
  label: string;
  value: string;
};

type ConfirmRegistrationDialogProps = {
  open: boolean;
  rows: SummaryRow[];
  isSubmitting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmRegistrationDialog({
  open,
  rows,
  isSubmitting,
  onCancel,
  onConfirm,
}: ConfirmRegistrationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => (next ? null : onCancel())}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Sudah benar semua?</DialogTitle>
          <DialogDescription>
            Periksa sekali lagi sebelum dikirim ke admin. Setelah ini data hanya
            bisa diubah lewat halaman profil.
          </DialogDescription>
        </DialogHeader>

        <dl className="flex max-h-72 flex-col divide-y divide-brand-ink/8 overflow-y-auto rounded-lg border border-brand-ink/10">
          {rows.map((row) => (
            <div key={row.label} className="flex flex-col gap-0.5 px-4 py-3">
              <dt className="eyebrow text-brand-ink/40">{row.label}</dt>
              <dd className="text-sm text-brand-ink">{row.value}</dd>
            </div>
          ))}
        </dl>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Periksa lagi
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? "Mendaftarkan..." : "Ya, daftarkan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
