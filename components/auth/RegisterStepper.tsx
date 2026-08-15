"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";

export type RegisterStep = {
  title: string;
  description: string;
};

type RegisterStepperProps = {
  steps: RegisterStep[];
  currentStep: number;
  eyebrow: string;
  isSubmitting: boolean;
  onStepSelect: (index: number) => void;
  onNext: () => void;
  children: React.ReactNode;
};

export function RegisterStepper({
  steps,
  currentStep,
  eyebrow,
  isSubmitting,
  onStepSelect,
  onNext,
  children,
}: RegisterStepperProps) {
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="overflow-hidden rounded-2xl border border-brand-ink/8 bg-white shadow-[0_1px_2px_rgba(16,36,28,0.04),0_16px_40px_-24px_rgba(16,36,28,0.18)]">
      <div
        role="progressbar"
        aria-valuenow={currentStep + 1}
        aria-valuemin={1}
        aria-valuemax={steps.length}
        aria-label="Kemajuan pendaftaran"
        className="h-1 w-full bg-brand-ink/8"
      >
        <div
          className="h-full bg-brand transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="p-6 sm:p-8">
        <p className="text-xs text-brand-ink/45">
          Langkah {currentStep + 1} dari {steps.length} · {eyebrow}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-brand-ink">
          {step.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-brand-ink/55">
          {step.description}
        </p>

        <div className="mt-7 flex flex-col gap-6 [&_input]:h-11">{children}</div>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-brand-ink/8 bg-canvas/70 px-6 py-4 sm:px-8">
        {currentStep === 0 ? (
          <Button asChild variant="ghost" className="text-brand-ink/55">
            <Link href="/choose-role">Ganti peran</Link>
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            className="text-brand-ink/55"
            disabled={isSubmitting}
            onClick={() => onStepSelect(currentStep - 1)}
          >
            Kembali
          </Button>
        )}

        <Button
          type="button"
          size="lg"
          disabled={isSubmitting}
          onClick={onNext}
        >
          {isSubmitting
            ? "Mendaftarkan..."
            : isLastStep
              ? "Selesaikan pendaftaran"
              : "Lanjut"}
        </Button>
      </div>
    </div>
  );
}
