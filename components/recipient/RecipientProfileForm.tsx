"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { LocationPicker } from "@/components/shared/LocationPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BASE_ALLERGENS } from "@/lib/config";
import type { Recipient } from "@/lib/db/recipients";
import { uploadIdentityDocument } from "@/lib/supabase/storage";
import {
  RECIPIENT_TYPE_LABEL,
  RECIPIENT_TYPES,
  recipientProfileCreateSchema,
  recipientProfileUpdateSchema,
  type RecipientProfileFormInput,
} from "@/lib/validations/recipient";

const SELECT_CLASS =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50";

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
      type: (recipient?.type as RecipientProfileFormInput["type"]) ?? defaultType,
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
      <div className="flex flex-col gap-2">
        <Label htmlFor="type">Jenis lembaga</Label>
        <select id="type" className={SELECT_CLASS} {...register("type")}>
          {RECIPIENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {RECIPIENT_TYPE_LABEL[type]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Nama lembaga</Label>
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
        <Label htmlFor="phone">Nomor telepon pengurus</Label>
        <Input id="phone" inputMode="numeric" {...register("phone")} />
        {errors.phone ? (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="capacity">Jumlah penghuni</Label>
          <Input
            id="capacity"
            type="number"
            min={1}
            {...register("capacity", { valueAsNumber: true })}
          />
          {errors.capacity ? (
            <p className="text-sm text-destructive">{errors.capacity.message}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="currentNeed">Kebutuhan porsi saat ini</Label>
          <Input
            id="currentNeed"
            type="number"
            min={0}
            {...register("currentNeed", { valueAsNumber: true })}
          />
          {errors.currentNeed ? (
            <p className="text-sm text-destructive">
              {errors.currentNeed.message}
            </p>
          ) : null}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Kebutuhan porsi menentukan berapa banyak donasi yang dialokasikan
        kepadamu. Angka ini berkurang otomatis setiap kali penyerahan selesai.
      </p>

      <div className="flex flex-col gap-2">
        <Label>Titik lokasi lembaga</Label>
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
        <Label>Pantangan alergen</Label>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {BASE_ALLERGENS.map((allergen) => (
            <label
              key={allergen}
              className="flex items-center gap-2 text-sm capitalize"
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
        <p className="text-sm text-muted-foreground">
          Donasi yang mengandung alergen ini tidak akan pernah dikirimkan
          kepadamu.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          className="size-4 accent-brand"
          {...register("halalOnly")}
        />
        Hanya menerima makanan halal
      </label>

      <div className="flex flex-col gap-2">
        <Label htmlFor="legalDocFile">
          Dokumen legal lembaga{" "}
          {isEditing ? "(kosongkan bila tidak diganti)" : ""}
        </Label>
        <Input
          id="legalDocFile"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setValue("legalDocFile", file, { shouldValidate: true });
          }}
        />
        {errors.legalDocFile ? (
          <p className="text-sm text-destructive">
            {errors.legalDocFile.message as string}
          </p>
        ) : null}
        <p className="text-sm text-muted-foreground">
          Maksimal 5 MB. Disimpan di penyimpanan privat, hanya bisa dibuka
          olehmu dan admin.
        </p>
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Menyimpan..." : "Simpan profil"}
      </Button>
    </form>
  );
}
