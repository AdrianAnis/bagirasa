import { z } from "zod";

export const REGISTRABLE_ROLES = ["donor", "recipient"] as const;
export const RECIPIENT_TYPES = ["panti_asuhan", "rumah_lansia"] as const;

export const loginSchema = z.object({
  email: z.email("Format email tidak valid"),
  password: z.string().min(1, "Password wajib diisi"),
});

export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    email: z.email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
    role: z.enum(REGISTRABLE_ROLES),
    recipientType: z.enum(RECIPIENT_TYPES).optional(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Konfirmasi password tidak sama",
    path: ["confirmPassword"],
  })
  .refine(
    (value) => value.role !== "recipient" || value.recipientType !== undefined,
    {
      message: "Jenis penerima wajib dipilih",
      path: ["recipientType"],
    },
  );

export type RegisterInput = z.infer<typeof registerSchema>;
