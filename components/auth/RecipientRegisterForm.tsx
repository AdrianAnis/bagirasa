"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { toast } from "sonner";

import {
  PendingVerificationDialog,
} from "@/components/auth/PendingVerificationDialog";
import {
  RegisterStepper,
  type RegisterStep,
} from "@/components/auth/RegisterStepper";
import { Field } from "@/components/shared/Field";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BASE_ALLERGENS } from "@/lib/config";
import { registerRecipient } from "@/lib/registration";
import {
  recipientRegistrationSchema,
  ROLE_LABEL,
  type RecipientRegistrationInput,
} from "@/lib/validations/auth";
import {
  RECIPIENT_TYPE_LABEL,
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
    title: "Kebutuhan & pantangan",
    description:
      "Menentukan berapa porsi yang dialokasikan dan donasi mana yang aman untukmu.",
  },
  {
    title: "Dokumen verifikasi",
    description: "Diperiksa admin sebelum lembagamu bisa menerima donasi.",
  },
];

const STEP_FIELDS: FieldPath<RecipientRegistrationInput>[][] = [
  ["email", "password", "confirmPassword"],
  ["name", "address", "phone", "lat", "lng"],
  ["capacity", "currentNeed", "allergenRestrictions", "halalOnly"],
  ["document"],
];

type RecipientRegisterFormProps = {
  recipientType: RecipientType;
};

export function RecipientRegisterForm({
  recipientType,
}: RecipientRegisterFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
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
      currentNeed: 0,
      allergenRestrictions: [],
      halalOnly: true,
    },
  });

  const lat = useWatch({ control, name: "lat" });
  const lng = useWatch({ control, name: "lng" });
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

    setIsSubmitting(true);
    const result = await registerRecipient(getValues());

    if (!result.ok) {
      toast.error(result.error);
      setIsSubmitting(false);
      return;
    }

    setIsRegistered(true);
  }

  return (
    <>
      <RegisterStepper
        steps={STEPS}
        currentStep={currentStep}
        eyebrow={`${ROLE_LABEL.recipient} · ${RECIPIENT_TYPE_LABEL[recipientType]}`}
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
            <Field label="Jenis lembaga" hint="Dipilih saat kamu memulai pendaftaran.">
              <p className="rounded-md border border-brand-ink/12 bg-canvas px-3 py-2 text-sm text-brand-ink/70">
                {RECIPIENT_TYPE_LABEL[recipientType]}
              </p>
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
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Jumlah penghuni"
                htmlFor="capacity"
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
                label="Kebutuhan porsi saat ini"
                htmlFor="currentNeed"
                error={errors.currentNeed?.message}
              >
                <Input
                  id="currentNeed"
                  type="number"
                  min={0}
                  {...register("currentNeed", { valueAsNumber: true })}
                />
              </Field>
            </div>

            <Field
              label="Pantangan alergen"
              hint="Donasi yang mengandung alergen ini tidak akan pernah dikirimkan kepadamu."
            >
              <div className="flex flex-wrap gap-x-5 gap-y-3">
                {BASE_ALLERGENS.map((allergen) => (
                  <label
                    key={allergen}
                    className="flex items-center gap-2 text-sm capitalize text-brand-ink/80"
                  >
                    <input
                      type="checkbox"
                      value={allergen}
                      className="size-4 accent-brand"
                      {...register("allergenRestrictions")}
                    />
                    {allergen}
                  </label>
                ))}
              </div>
            </Field>

            <Label className="flex items-center gap-2 text-sm font-normal text-brand-ink/80">
              <input
                type="checkbox"
                className="size-4 accent-brand"
                {...register("halalOnly")}
              />
              Hanya menerima makanan halal
            </Label>
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

      <PendingVerificationDialog
        open={isRegistered}
        organisationName={getValues("name")}
      />
    </>
  );
}
