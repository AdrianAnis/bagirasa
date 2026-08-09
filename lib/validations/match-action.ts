import { z } from "zod";

export const MATCH_ACTIONS = ["accept", "reject", "handover"] as const;

export const matchActionSchema = z.object({
  matchId: z.uuid("ID donasi tidak valid"),
  action: z.enum(MATCH_ACTIONS),
});

export type MatchActionInput = z.infer<typeof matchActionSchema>;
