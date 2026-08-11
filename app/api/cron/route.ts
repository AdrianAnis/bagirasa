import { cancelExpiredDonations } from "@/lib/db/cleanup";

export async function GET(request: Request): Promise<Response> {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return Response.json(
      { error: "CRON_SECRET belum diisi" },
      { status: 503 },
    );
  }

  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return Response.json({ error: "Tidak berwenang" }, { status: 401 });
  }

  const result = await cancelExpiredDonations();

  return Response.json({ data: result }, { status: 200 });
}
