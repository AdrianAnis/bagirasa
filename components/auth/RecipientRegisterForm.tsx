"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm, useWatch, type FieldPath } from "react-hook-form";
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
import { ChipGroup } from "@/components/shared/ChipGroup";
import { Field } from "@/components/shared/Field";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { SwitchField } from "@/components/shared/SwitchField";
import { Input } from "@/components/ui/input";
import { BASE_ALLERGENS } from "@/lib/config";
import { registerRecipient } from "@/lib/registration";
import { cn } from "@/lib/utils";
import {
  recipientRegistrationSchema,
  ROLE_LABEL,
  type RecipientRegistrationInput,
} from "@/lib/validations/auth";
import {
  RECIPIENT_TYPE_LABEL,
  RECIPIENT_TYPES,
  type RecipientType,
} from "@/lib/validations/recipient";
import { ACCEPTED_DOCUMENT_ACCEPT_ATTRIBUTE } from "@/lib/validations/upload";

const STEPS: RegisterStep[] = [
  {
    title: "Buat akun",
    description: "Email dan password untuk masuk ke BagiRasa.",
  },
  {
    title: "Data lembaga",
    description: "Identitas dan lokasi yang akan dilihat restoran penyumbang.",
  },
  {
    title: "Keamanan pangan",
    description: "Menentukan donasi mana yang aman dikirimkan kepadamu.",
  },
  {
    title: "Dokumen verifikasi",
    description: "Diperiksa admin sebelum lembagamu bisa menerima donasi.",
  },
];

const STEP_FIELDS: FieldPath<RecipientRegistrationInput>[][] = [
  ["email", "password", "confirmPassword"],
  ["name", "address", "phone", "lat", "lng"],
  ["capacity", "allergenRestrictions", "halalOnly"],
  ["document"],
];

type RecipientRegisterFormProps = {
  recipientType: RecipientType;
};

export function RecipientRegisterForm({
  recipientType,
}: RecipientRegisterFormProps) {
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
  } = useForm<RecipientRegistrationInput>({
    resolver: zodResolver(recipientRegistrationSchema),
    mode: "onTouched",
    defaultValues: {
      type: recipientType,
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      address: "",
      phone: "",
      capacity: 1,
      allergenRestrictions: [],
      halalOnly: true,
    },
  });

  const lat = useWatch({ control, name: "lat" });
  const lng = useWatch({ control, name: "lng" });
  const selectedType = useWatch({ control, name: "type" });
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
    const result = await registerRecipient(getValues());

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
      { label: "Jenis lembaga", value: RECIPIENT_TYPE_LABEL[values.type] },
      { label: "Nama lembaga", value: values.name },
      { label: "Email", value: values.email },
      { label: "Telepon", value: values.phone },
      { label: "Alamat", value: values.address },
      { label: "Jumlah penghuni", value: `${values.capacity} orang` },
      {
        label: "Pantangan alergen",
        value:
          values.allergenRestrictions.length > 0
            ? values.allergenRestrictions.join(", ")
            : "Tidak ada",
      },
      {
        label: "Makanan halal saja",
        value: values.halalOnly ? "Ya" : "Tidak",
      },
      { label: "Dokumen", value: values.document?.name ?? "Belum dipilih" },
    ];
  }

  return (
    <>
      <RegisterStepper
        steps={STEPS}
        currentStep={currentStep}
        eyebrow={`${ROLE_LABEL.recipient} · ${RECIPIENT_TYPE_LABEL[selectedType]}`}
        isSubmitting={isSubmitting}
        onBack={() => setCurrentStep(currentStep - 1)}
        onNext={onNext}
      >
        <input type="hidden" {...register("type")} />

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
              label="Jenis lembaga"
              hint="Tidak bisa diubah sendiri setelah akun dibuat."
            >
              <Controller
                control={control}
                name="type"
                render={({ field }) => (
                  <div
                    role="radiogroup"
                    aria-label="Jenis lembaga"
                    className="grid gap-3 sm:grid-cols-2"
                  >
                    {RECIPIENT_TYPES.map((option) => (
                      <button
                        key={option}
                        type="button"
                        role="radio"
                        aria-checked={field.value === option}
                        onClick={() => field.onChange(option)}
                        className={cn(
                          "rounded-lg border px-4 py-3 text-sm font-medium transition-colors",
                          field.value === option
                            ? "border-brand bg-brand-tint text-brand-deep"
                            : "border-brand-ink/15 bg-white text-brand-ink/70 hover:border-brand-ink/30",
                        )}
                      >
                        {RECIPIENT_TYPE_LABEL[option]}
                      </button>
                    ))}
                  </div>
                )}
              />
            </Field>

            <Field
              label="Nama lembaga"
              htmlFor="name"
              error={errors.name?.message}
            >
              <Input id="name" {...register("name")} />
            </Field>

            <Field
              label="Nomor telepon pengurus"
              htmlFor="phone"
              error={errors.phone?.message}
            >
              <Input id="phone" inputMode="numeric" {...register("phone")} />
            </Field>

            <Field
              label="Lokasi lembaga"
              hint="Taruh pin di lokasi lembagamu. Alamatnya akan terisi sendiri."
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
          <>
            <Field
              label="Jumlah penghuni"
              htmlFor="capacity"
              hint="Dipakai menilai seberapa mendesak kebutuhanmu dibanding lembaga lain."
              error={errors.capacity?.message}
            >
              <Input
                id="capacity"
                type="number"
                min={1}
                {...register("capacity", { valueAsNumber: true })}
              />
            </Field>

            <Field
              label="Pantangan alergen"
              hint="Donasi yang mengandung alergen ini tidak akan pernah dikirimkan kepadamu."
            >
              <Controller
                control={control}
                name="allergenRestrictions"
                render={({ field }) => (
                  <ChipGroup
                    label="Pantangan alergen"
                    options={BASE_ALLERGENS}
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            </Field>

            <Controller
              control={control}
              name="halalOnly"
              render={({ field }) => (
                <SwitchField
                  id="halalOnly"
                  label="Hanya menerima makanan halal"
                  description="Donasi non-halal tidak akan dicocokkan denganmu."
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </>
        ) : null}

        {currentStep === 3 ? (
          <Field
            label="Dokumen legal lembaga"
            htmlFor="document"
            hint="Maksimal 5 MB. Format JPG, PNG, WEBP, atau PDF. Disimpan di penyimpanan privat — hanya bisa dibuka olehmu dan admin."
            error={errors.document?.message as string | undefined}
          >
            <Input
              id="document"
              type="file"
              accept={ACCEPTED_DOCUMENT_ACCEPT_ATTRIBUTE}
              onChange={(event) => {
                const file = event.target.files?.[0];
                setValue("document", file as File, { shouldValidate: true });
              }}
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
