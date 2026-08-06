"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { LocationPicker } from "@/components/shared/LocationPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nama restoran</Label>
        <Input id="name" {...register("name")} />
        {errors.name ? (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="address">Alamat lengkap</Label>
        <Input id="address" {...register("address")} />
        {errors.address ? (
          <p className="text-sm text-destructive">{errors.address.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Nomor telepon</Label>
        <Input id="phone" inputMode="numeric" {...register("phone")} />
        {errors.phone ? (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <Label>Titik lokasi restoran</Label>
        <LocationPicker
          value={position}
          onChange={(next) => {
            setValue("lat", next.lat, { shouldValidate: true });
            setValue("lng", next.lng, { shouldValidate: true });
          }}
          error={errors.lat?.message ?? errors.lng?.message}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="ktpFile">
          Dokumen KTP pemilik {isEditing ? "(kosongkan bila tidak diganti)" : ""}
        </Label>
        <Input
          id="ktpFile"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setValue("ktpFile", file, { shouldValidate: true });
          }}
        />
        {errors.ktpFile ? (
          <p className="text-sm text-destructive">
            {errors.ktpFile.message as string}
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          Maksimal 5 MB. Format JPG, PNG, WEBP, atau PDF. Dokumen disimpan di
          penyimpanan privat dan hanya bisa dibuka olehmu dan admin.
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : "Simpan profil"}
      </Button>
    </form>
  );
}
