"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Field, FormSection } from "@/components/shared/Field";
import { LocationPicker } from "@/components/shared/LocationPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Donor } from "@/lib/db/donors";
import { uploadIdentityDocument } from "@/lib/supabase/storage";
import {
  donorProfileCreateSchema,
  donorProfileUpdateSchema,
  type DonorProfileFormInput,
} from "@/lib/validations/donor";

type DonorProfileFormProps = {
  userId: string;
  donor: Donor | null;
};

export function DonorProfileForm({ userId, donor }: DonorProfileFormProps) {
  const router = useRouter();
  const isEditing = donor !== null;

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<DonorProfileFormInput>({
    resolver: zodResolver(
      isEditing ? donorProfileUpdateSchema : donorProfileCreateSchema,
    ),
    defaultValues: {
      name: donor?.name ?? "",
      address: donor?.address ?? "",
      phone: donor?.phone ?? "",
      lat: donor ? Number(donor.lat) : undefined,
      lng: donor ? Number(donor.lng) : undefined,
    },
  });

  const lat = useWatch({ control, name: "lat" });
  const lng = useWatch({ control, name: "lng" });
  const position =
    typeof lat === "number" && typeof lng === "number" ? { lat, lng } : null;

  async function onSubmit(values: DonorProfileFormInput) {
    let ktpUrl = donor?.ktp_url ?? "";

    if (values.ktpFile) {
      const upload = await uploadIdentityDocument(values.ktpFile, userId, "ktp");

      if (!upload.ok) {
        toast.error(`Gagal mengunggah KTP: ${upload.error}`);
        return;
      }

      ktpUrl = upload.path;
    }

    const response = await fetch("/api/donors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: values.name,
        address: values.address,
        lat: values.lat,
        lng: values.lng,
        phone: values.phone,
        ktpUrl,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error ?? "Gagal menyimpan profil");
      return;
    }

    toast.success("Profil restoran tersimpan");
    router.replace("/donor");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <FormSection title="Identitas restoran">
        <Field label="Nama restoran" htmlFor="name" error={errors.name?.message}>
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
        title="Dokumen verifikasi"
        description="Diperiksa admin sebelum akun bisa menyalurkan donasi."
      >
        <Field
          label={`Dokumen KTP pemilik${isEditing ? " (kosongkan bila tidak diganti)" : ""}`}
          htmlFor="ktpFile"
          hint="Maksimal 5 MB. Format JPG, PNG, WEBP, atau PDF. Disimpan di penyimpanan privat — hanya bisa dibuka olehmu dan admin."
          error={errors.ktpFile?.message as string | undefined}
        >
          <Input
            id="ktpFile"
            type="file"
            accept="image/jpeg,image/png,image/webp,application/pdf"
            onChange={(event) => {
              const file = event.target.files?.[0];
              setValue("ktpFile", file, { shouldValidate: true });
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
