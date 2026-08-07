import { commitMatches, previewMatches } from "@/lib/db/matches";
import { matchingRequestSchema } from "@/lib/validations/match";

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

  const parsed = matchingRequestSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 },
    );
  }

  const { donationId, mode, recipientIds, commit } = parsed.data;
  const selectedIds = mode === "manual" ? recipientIds : undefined;

  const result = commit
    ? await commitMatches(donationId, selectedIds)
    : await previewMatches(donationId, selectedIds);

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ data: result.data }, { status: commit ? 201 : 200 });
}
