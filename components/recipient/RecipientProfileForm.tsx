"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { ChipGroup } from "@/components/shared/ChipGroup";
import { Field, FormSection } from "@/components/shared/Field";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { SwitchField } from "@/components/shared/SwitchField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BASE_ALLERGENS } from "@/lib/config";
import type { Recipient } from "@/lib/db/recipients";
import { uploadIdentityDocument } from "@/lib/supabase/storage";
import {
  RECIPIENT_TYPE_LABEL,
  recipientProfileCreateSchema,
  recipientProfileUpdateSchema,
  type RecipientProfileFormInput,
} from "@/lib/validations/recipient";

type RecipientProfileFormProps = {
  userId: string;
  recipient: Recipient | null;
  defaultType: RecipientProfileFormInput["type"];
};

export function RecipientProfileForm({
  userId,
  recipient,
  defaultType,
}: RecipientProfileFormProps) {
  const router = useRouter();
  const isEditing = recipient !== null;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RecipientProfileFormInput>({
    resolver: zodResolver(
      isEditing ? recipientProfileUpdateSchema : recipientProfileCreateSchema,
    ),
    defaultValues: {
      type:
        (recipient?.type as RecipientProfileFormInput["type"]) ?? defaultType,
      name: recipient?.name ?? "",
      address: recipient?.address ?? "",
      phone: recipient?.phone ?? "",
      capacity: recipient?.capacity ?? 1,
      currentNeed: recipient?.current_need ?? 0,
      halalOnly: recipient?.halal_only ?? true,
      allergenRestrictions:
        (recipient?.allergen_restrictions as RecipientProfileFormInput["allergenRestrictions"]) ??
        [],
      lat: recipient ? Number(recipient.lat) : undefined,
      lng: recipient ? Number(recipient.lng) : undefined,
    },
  });

  const lat = useWatch({ control, name: "lat" });
  const lng = useWatch({ control, name: "lng" });
  const position =
    typeof lat === "number" && typeof lng === "number" ? { lat, lng } : null;

  async function onSubmit(values: RecipientProfileFormInput) {
    let legalDocUrl = recipient?.legal_doc_url ?? "";

    if (values.legalDocFile) {
      const upload = await uploadIdentityDocument(
        values.legalDocFile,
        userId,
        "legal-doc",
      );

      if (!upload.ok) {
        toast.error(`Gagal mengunggah dokumen: ${upload.error}`);
        return;
      }

      legalDocUrl = upload.path;
    }

    const response = await fetch("/api/recipients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: values.type,
        name: values.name,
        address: values.address,
        lat: values.lat,
        lng: values.lng,
        phone: values.phone,
        capacity: values.capacity,
        currentNeed: values.currentNeed,
        allergenRestrictions: values.allergenRestrictions,
        halalOnly: values.halalOnly,
        legalDocUrl,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error ?? "Gagal menyimpan profil");
      return;
    }

    toast.success("Profil lembaga tersimpan");
    router.replace("/recipient");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <input type="hidden" {...register("type")} />

      <FormSection title="Identitas lembaga">
        <Field label="Jenis lembaga" hint="Ditentukan saat pendaftaran dan tidak bisa diubah. Hubungi admin bila ada kekeliruan.">
          <p className="rounded-md border border-brand-ink/12 bg-canvas px-3 py-2 text-sm text-brand-ink/70">
            {RECIPIENT_TYPE_LABEL[recipient?.type ?? defaultType]}
          </p>
        </Field>

        <Field label="Nama lembaga" htmlFor="name" error={errors.name?.message}>
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
          hint="Geser pin bila lokasimu berubah. Alamatnya ikut diperbarui."
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
      </FormSection>

      <FormSection
        title="Kapasitas dan kebutuhan"
        description="Kebutuhan porsi menentukan berapa banyak donasi yang dialokasikan kepadamu, dan berkurang otomatis setiap penyerahan selesai."
      >
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
      </FormSection>

      <FormSection
        title="Keamanan pangan"
        description="Dipakai sebagai penyaring wajib. Donasi yang bertentangan tidak akan pernah dikirimkan kepadamu."
      >
        <Field label="Pantangan alergen">
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
      </FormSection>

      <FormSection
        title="Dokumen verifikasi"
        description="Diperiksa admin sebelum lembaga bisa menerima donasi."
      >
        <Field
          label={`Dokumen legal lembaga${isEditing ? " (kosongkan bila tidak diganti)" : ""}`}
          htmlFor="legalDocFile"
          hint="Maksimal 5 MB. Format JPG, PNG, WEBP, atau PDF. Disimpan di penyimpanan privat — hanya bisa dibuka olehmu dan admin."
          error={errors.legalDocFile?.message as string | undefined}
        >
          <Input
            id="legalDocFile"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setValue("legalDocFile", file, { shouldValidate: true });
            }}
          />
        </Field>
      </FormSection>

      <Button type="submit" disabled={isSubmitting} size="lg">
        {isSubmitting ? "Menyimpan..." : "Simpan profil"}
      </Button>
    </form>
  );
}
