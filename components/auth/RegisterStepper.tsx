"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type RegisterStep = {
  title: string;
  description: string;
};

type RegisterStepperProps = {
  steps: RegisterStep[];
  currentStep: number;
  eyebrow: string;
  isSubmitting: boolean;
  onBack: () => void;
  onNext: () => void;
  children: React.ReactNode;
};

export function RegisterStepper({
  steps,
  currentStep,
  eyebrow,
  isSubmitting,
  onBack,
  onNext,
  children,
}: RegisterStepperProps) {
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  return (
    <div className="w-full max-w-xl">
      <div className="text-center">
        <p className="eyebrow text-brand/70">{eyebrow}</p>
        <h1 className="mt-2 text-title font-semibold text-brand-ink">
          {step.title}
        </h1>
        <p className="mt-2 text-sm text-brand-ink/55">{step.description}</p>
      </div>

      <ol className="mt-6 flex items-center gap-2" aria-label="Kemajuan pendaftaran">
        {steps.map((item, index) => (
          <li key={item.title} className="flex-1">
            <span className="sr-only">
              Langkah {index + 1} dari {steps.length}: {item.title}
            </span>
            <span
              aria-hidden
              className={cn(
                "block h-1 rounded-full transition-colors",
                index <= currentStep ? "bg-brand" : "bg-brand-ink/12",
              )}
            />
          </li>
        ))}
      </ol>

      <p className="numeric mt-2 text-center text-xs text-brand-ink/40">
        Langkah {currentStep + 1} dari {steps.length}
      </p>

      <div className="mt-6 flex flex-col gap-5 rounded-xl border border-brand-ink/10 bg-white p-6">
        {children}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={currentStep === 0 || isSubmitting}
        >
          Kembali
        </Button>

        <Button type="button" onClick={onNext} disabled={isSubmitting} size="lg">
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
