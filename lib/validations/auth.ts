import { z } from "zod";

import { donorProfileFields } from "@/lib/validations/donor";
import { recipientProfileFields } from "@/lib/validations/recipient";
import { documentFileSchema } from "@/lib/validations/upload";

export const REGISTRABLE_ROLES = ["donor", "recipient"] as const;

export type RegistrableRole = (typeof REGISTRABLE_ROLES)[number];

export const ROLE_LABEL: Record<RegistrableRole, string> = {
  donor: "Penyumbang",
  recipient: "Penerima",
};

export const loginSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;

const accountFields = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
});

const PASSWORD_MISMATCH = {
  message: "Konfirmasi password tidak sama",
  path: ["confirmPassword"],
};

function passwordMatches(value: {
  password: string;
  confirmPassword: string;
}): boolean {
  return value.password === value.confirmPassword;
}

export const donorRegistrationSchema = accountFields
  .extend(donorProfileFields.shape)
  .extend({ document: documentFileSchema })
  .refine(passwordMatches, PASSWORD_MISMATCH);

export type DonorRegistrationInput = z.infer<typeof donorRegistrationSchema>;

export const recipientRegistrationSchema = accountFields
  .extend(recipientProfileFields.omit({ currentNeed: true }).shape)
  .extend({ document: documentFileSchema })
  .refine(passwordMatches, PASSWORD_MISMATCH);

export type RecipientRegistrationInput = z.infer<
  typeof recipientRegistrationSchema
>;
