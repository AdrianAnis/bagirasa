import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type Notification =
  Database["public"]["Tables"]["notifications"]["Row"];

export type NotificationDraft = {
  profileId: string;
  title: string;
  body: string;
  type: string;
  referenceId?: string;
};

export async function listNotifications(): Promise<Notification[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("profile_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return data ?? [];
}

export async function countUnreadNotifications(): Promise<number> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return 0;
  }

  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", user.id)
    .eq("is_read", false);

  return count ?? 0;
}

export async function markAllNotificationsRead(): Promise<boolean> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return false;
  }

  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("profile_id", user.id)
    .eq("is_read", false);

  return !error;
}

export async function createNotifications(
  drafts: NotificationDraft[],
): Promise<void> {
  if (drafts.length === 0) {
    return;
  }

  const admin = createAdminClient();

  await admin.from("notifications").insert(
    drafts.map((draft) => ({
      profile_id: draft.profileId,
      title: draft.title,
      body: draft.body,
      type: draft.type,
      reference_id: draft.referenceId ?? null,
    })),
  );
}
