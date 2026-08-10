import { z } from "zod";

export const MIN_RATING = 1;
export const MAX_RATING = 5;

export const RATING_LABEL: Record<number, string> = {
  1: "Sangat kurang",
  2: "Kurang",
  3: "Cukup",
  4: "Baik",
  5: "Sangat baik",
};

export const feedbackCreateSchema = z.object({
  matchId: z.uuid("ID donasi tidak valid"),
  rating: z
    .number("Beri penilaian dulu")
    .int("Penilaian harus bilangan bulat")
    .min(MIN_RATING, "Penilaian minimal 1 bintang")
    .max(MAX_RATING, "Penilaian maksimal 5 bintang"),
  comment: z
    .string()
    .trim()
    .max(500, "Komentar maksimal 500 karakter")
    .optional(),
});

export type FeedbackCreateInput = z.infer<typeof feedbackCreateSchema>;
