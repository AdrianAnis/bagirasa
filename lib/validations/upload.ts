import { z } from "zod";

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_DOCUMENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
] as const;

export const ACCEPTED_DOCUMENT_ACCEPT_ATTRIBUTE =
  ACCEPTED_DOCUMENT_TYPES.join(",");

export const documentFileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, "File belum dipilih")
  .refine((file) => file.size <= MAX_UPLOAD_BYTES, "Ukuran file maksimal 5 MB")
  .refine(
    (file) =>
      (ACCEPTED_DOCUMENT_TYPES as readonly string[]).includes(file.type),
    "Format harus JPG, PNG, WEBP, atau PDF",
  );
