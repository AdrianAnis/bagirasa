import "server-only";

import { WA_RATE_LIMIT_PER_HOUR } from "@/lib/config";
import { createNotifications, type NotificationDraft } from "@/lib/db/notifications";
import { sendWhatsApp } from "@/lib/fonnte";
import { createAdminClient } from "@/lib/supabase/admin";

export type WhatsAppDispatch = {
  matchId: string;
  targetPhone: string;
  message: string;
};

async function isRateLimited(): Promise<boolean> {
  const admin = createAdminClient();
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

  const { count } = await admin
    .from("wa_logs")
    .select("id", { count: "exact", head: true })
    .eq("status", "sent")
    .gte("created_at", oneHourAgo);

  return (count ?? 0) >= WA_RATE_LIMIT_PER_HOUR;
}

export async function dispatchWhatsApp(
  dispatches: WhatsAppDispatch[],
): Promise<void> {
  if (dispatches.length === 0) {
    return;
  }

  const admin = createAdminClient();
  const rateLimited = await isRateLimited();

  for (const dispatch of dispatches) {
    const outcome = rateLimited
      ? {
          status: "skipped" as const,
          reason: `Melebihi batas ${WA_RATE_LIMIT_PER_HOUR} pesan per jam`,
        }
      : await sendWhatsApp(dispatch.targetPhone, dispatch.message);

    await admin.from("wa_logs").insert({
      match_id: dispatch.matchId,
      target_phone: dispatch.targetPhone,
      message: dispatch.message,
      status: outcome.status,
      provider_response:
        outcome.status === "sent"
          ? JSON.parse(JSON.stringify(outcome.providerResponse ?? null))
          : { reason: outcome.reason },
    });
  }
}

export async function notify(
  drafts: NotificationDraft[],
  dispatches: WhatsAppDispatch[] = [],
): Promise<void> {
  await createNotifications(drafts);
  await dispatchWhatsApp(dispatches);
}
