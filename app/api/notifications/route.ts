import { markAllNotificationsRead } from "@/lib/db/notifications";

export async function POST(): Promise<Response> {
  const ok = await markAllNotificationsRead();

  if (!ok) {
    return Response.json(
      { error: "Gagal menandai notifikasi" },
      { status: 400 },
    );
  }

  return Response.json({ ok: true }, { status: 200 });
}
