import { confirmHandover, respondToMatch } from "@/lib/db/matches";
import { matchActionSchema } from "@/lib/validations/match-action";

export async function POST(request: Request): Promise<Response> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: "Body bukan JSON yang valid" },
      { status: 400 },
    );
  }

  const parsed = matchActionSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 },
    );
  }

  const { matchId, action } = parsed.data;

  const result =
    action === "handover"
      ? await confirmHandover(matchId)
      : await respondToMatch(matchId, action === "accept");

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ ok: true }, { status: 200 });
}
