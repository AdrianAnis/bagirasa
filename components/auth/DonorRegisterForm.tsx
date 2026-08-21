"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { toast } from "sonner";

import {
  ConfirmRegistrationDialog,
  type SummaryRow,
} from "@/components/auth/ConfirmRegistrationDialog";
import { PendingVerificationDialog } from "@/components/auth/PendingVerificationDialog";
import {
  RegisterStepper,
  type RegisterStep,
} from "@/components/auth/RegisterStepper";
import { Field } from "@/components/shared/Field";
import { FileField } from "@/components/shared/FileField";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { Input } from "@/components/ui/input";
import { registerDonor } from "@/lib/registration";
import {
  donorRegistrationSchema,
  ROLE_LABEL,
  type DonorRegistrationInput,
} from "@/lib/validations/auth";
import { ACCEPTED_DOCUMENT_ACCEPT_ATTRIBUTE } from "@/lib/validations/upload";

const STEPS: RegisterStep[] = [
  {
    title: "Buat akun",
    description: "Email dan password untuk masuk ke BagiRasa.",
  },
  {
    title: "Data restoran",
    description: "Identitas dan lokasi yang akan dilihat lembaga penerima.",
  },
  {
    title: "Dokumen verifikasi",
    description: "Diperiksa admin sebelum akunmu bisa menyalurkan donasi.",
  },
];

const STEP_FIELDS: FieldPath<DonorRegistrationInput>[][] = [
  ["email", "password", "confirmPassword"],
  ["name", "address", "phone", "lat", "lng"],
  ["document"],
];

export function DonorRegisterForm() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  const {
    register,
    control,
    setValue,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<DonorRegistrationInput>({
    resolver: zodResolver(donorRegistrationSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      address: "",
      phone: "",
    },
  });

  const lat = useWatch({ control, name: "lat" });
  const lng = useWatch({ control, name: "lng" });
  const documentFile = useWatch({ control, name: "document" });
  const position =
    typeof lat === "number" && typeof lng === "number" ? { lat, lng } : null;

  async function onNext() {
    const isStepValid = await trigger(STEP_FIELDS[currentStep]);

    if (!isStepValid) {
      return;
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
      return;
    }

    setIsConfirming(true);
  }

  async function onConfirm() {
    setIsSubmitting(true);
    const result = await registerDonor(getValues());

    if (!result.ok) {
      toast.error(result.error);
      setIsSubmitting(false);
      setIsConfirming(false);
      return;
    }

    setIsConfirming(false);
    setIsRegistered(true);
  }

  function buildSummary(): SummaryRow[] {
    const values = getValues();

    return [
      { label: "Nama restoran", value: values.name },
      { label: "Email", value: values.email },
      { label: "Telepon", value: values.phone },
      { label: "Alamat", value: values.address },
      { label: "Dokumen", value: values.document?.name ?? "Belum dipilih" },
    ];
  }

  return (
    <>
      <RegisterStepper
        steps={STEPS}
        currentStep={currentStep}
        eyebrow={ROLE_LABEL.donor}
        isSubmitting={isSubmitting}
        onStepSelect={setCurrentStep}
        onNext={onNext}
      >
        {currentStep === 0 ? (
          <>
            <Field label="Email" htmlFor="email" error={errors.email?.message}>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register("email")}
              />
            </Field>

            <Field
              label="Password"
              htmlFor="password"
              hint="Minimal 8 karakter."
              error={errors.password?.message}
            >
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                {...register("password")}
              />
            </Field>

            <Field
              label="Ulangi password"
              htmlFor="confirmPassword"
              error={errors.confirmPassword?.message}
            >
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                {...register("confirmPassword")}
              />
            </Field>
          </>
        ) : null}

        {currentStep === 1 ? (
          <>
            <Field
              label="Nama restoran"
              htmlFor="name"
              error={errors.name?.message}
            >
              <Input id="name" {...register("name")} />
            </Field>

            <Field
              label="Nomor telepon"
              htmlFor="phone"
              error={errors.phone?.message}
            >
              <Input id="phone" inputMode="numeric" {...register("phone")} />
            </Field>

            <Field
              label="Lokasi restoran"
              hint="Taruh pin di lokasi restoranmu. Alamatnya akan terisi sendiri."
              error={errors.lat?.message ?? errors.lng?.message}
            >
              <LocationPicker
                value={position}
                onChange={(next) => {
                  setValue("lat", next.lat, { shouldValidate: true });
                  setValue("lng", next.lng, { shouldValidate: true });
                }}
                onAddressResolved={(address) =>
                  setValue("address", address, { shouldValidate: true })
                }
              />
            </Field>

            <Field
              label="Alamat"
              htmlFor="address"
              hint="Terisi otomatis dari pin. Tambahkan nomor bangunan atau patokan bila perlu."
              error={errors.address?.message}
            >
              <Input id="address" {...register("address")} />
            </Field>
          </>
        ) : null}

        {currentStep === 2 ? (
          <Field
            label="Dokumen KTP pemilik"
            htmlFor="document"
            hint="Disimpan di penyimpanan privat — hanya bisa dibuka olehmu dan admin."
            error={errors.document?.message as string | undefined}
          >
            <FileField
              id="document"
              accept={ACCEPTED_DOCUMENT_ACCEPT_ATTRIBUTE}
              placeholder="Pilih foto KTP"
              file={documentFile}
              onSelect={(file) =>
                setValue("document", file, { shouldValidate: true })
              }
            />
          </Field>
        ) : null}
      </RegisterStepper>

      <ConfirmRegistrationDialog
        open={isConfirming}
        rows={isConfirming ? buildSummary() : []}
        isSubmitting={isSubmitting}
        onCancel={() => setIsConfirming(false)}
        onConfirm={onConfirm}
      />

      <PendingVerificationDialog
        open={isRegistered}
        organisationName={getValues("name")}
      />
    </>
  );
}
