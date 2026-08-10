import { z } from "zod";

export const verificationActionSchema = z.object({
  profileId: z.uuid("ID akun tidak valid"),
  status: z.enum(["verified", "rejected"]),
});

export type VerificationActionInput = z.infer<typeof verificationActionSchema>;
