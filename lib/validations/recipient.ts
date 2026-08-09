import { z } from "zod";

import { BASE_ALLERGENS } from "@/lib/config";
import {
  ACCEPTED_DOCUMENT_TYPES,
  MAX_UPLOAD_BYTES,
} from "@/lib/validations/donor";

export const RECIPIENT_TYPES = ["panti_asuhan", "rumah_lansia"] as const;

export const RECIPIENT_TYPE_LABEL: Record<
  (typeof RECIPIENT_TYPES)[number],
  string
> = {
  panti_asuhan: "Panti Asuhan",
  rumah_lansia: "Rumah Lansia",
};

const legalDocFileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, "File belum dipilih")
  .refine((file) => file.size <= MAX_UPLOAD_BYTES, "Ukuran file maksimal 5 MB")
  .refine(
    (file) =>
      (ACCEPTED_DOCUMENT_TYPES as readonly string[]).includes(file.type),
    "Format harus JPG, PNG, WEBP, atau PDF",
  );

const recipientProfileFields = z.object({
  type: z.enum(RECIPIENT_TYPES),
  name: z.string().trim().min(3, "Nama lembaga minimal 3 karakter"),
  address: z.string().trim().min(10, "Alamat minimal 10 karakter"),
  lat: z
    .number("Titik lokasi belum dipilih")
    .min(-90, "Latitude tidak valid")
    .max(90, "Latitude tidak valid"),
  lng: z
    .number("Titik lokasi belum dipilih")
    .min(-180, "Longitude tidak valid")
    .max(180, "Longitude tidak valid"),
  phone: z
    .string()
    .trim()
    .regex(/^08\d{7,12}$/, "Nomor tidak valid, contoh: 08123456789"),
  capacity: z
    .number("Jumlah penghuni wajib diisi")
    .int("Harus bilangan bulat")
    .min(1, "Minimal 1 orang"),
  currentNeed: z
    .number("Kebutuhan porsi wajib diisi")
    .int("Harus bilangan bulat")
    .min(0, "Tidak boleh negatif"),
  allergenRestrictions: z.array(z.enum(BASE_ALLERGENS)),
  halalOnly: z.boolean(),
});

export const recipientProfileCreateSchema = recipientProfileFields.extend({
  legalDocFile: legalDocFileSchema,
});

export const recipientProfileUpdateSchema = recipientProfileFields.extend({
  legalDocFile: legalDocFileSchema.optional(),
});

export type RecipientProfileFormInput = z.infer<
  typeof recipientProfileUpdateSchema
>;

export const recipientProfilePayloadSchema = recipientProfileFields.extend({
  legalDocUrl: z.string().trim().min(1, "Dokumen legal wajib diunggah"),
});

export type RecipientProfilePayload = z.infer<
  typeof recipientProfilePayloadSchema
>;
