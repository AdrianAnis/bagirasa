import { z } from "zod";

import { documentFileSchema } from "@/lib/validations/upload";

export const donorProfileFields = z.object({
  name: z.string().trim().min(3, "Nama restoran minimal 3 karakter"),
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
});

export const donorProfileCreateSchema = donorProfileFields.extend({
  ktpFile: documentFileSchema,
});

export const donorProfileUpdateSchema = donorProfileFields.extend({
  ktpFile: documentFileSchema.optional(),
});

export type DonorProfileFormInput = z.infer<typeof donorProfileUpdateSchema>;

export const donorProfilePayloadSchema = donorProfileFields.extend({
  ktpUrl: z.string().trim().min(1, "Dokumen KTP wajib diunggah"),
});

export type DonorProfilePayload = z.infer<typeof donorProfilePayloadSchema>;
