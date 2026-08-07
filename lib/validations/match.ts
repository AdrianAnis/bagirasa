import { z } from "zod";

export const SELECTION_MODES = ["auto", "manual"] as const;

export const matchingRequestSchema = z
  .object({
    donationId: z.uuid("ID donasi tidak valid"),
    mode: z.enum(SELECTION_MODES),
    recipientIds: z.array(z.uuid()).optional(),
    commit: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.mode !== "manual" ||
      (value.recipientIds !== undefined && value.recipientIds.length > 0),
    {
      message: "Pilih minimal satu penerima untuk mode manual",
      path: ["recipientIds"],
    },
  );

export type MatchingRequestInput = z.infer<typeof matchingRequestSchema>;
