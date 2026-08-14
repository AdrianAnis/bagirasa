import { z } from "zod";

import { BASE_ALLERGENS } from "@/lib/config";
import { documentFileSchema } from "@/lib/validations/upload";

export const RECIPIENT_TYPES = ["panti_asuhan", "rumah_lansia"] as const;

export type RecipientType = (typeof RECIPIENT_TYPES)[number];

export const RECIPIENT_TYPE_LABEL: Record<RecipientType, string> = {
  panti_asuhan: "Panti Asuhan",
  rumah_lansia: "Rumah Lansia",
};

export const recipientProfileFields = z.object({
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
  legalDocFile: documentFileSchema,
});

export const recipientProfileUpdateSchema = recipientProfileFields.extend({
  legalDocFile: documentFileSchema.optional(),
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
