import { saveRecipientProfile } from "@/lib/db/recipients";
import { recipientProfilePayloadSchema } from "@/lib/validations/recipient";

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

  const parsed = recipientProfilePayloadSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 },
    );
  }

  const result = await saveRecipientProfile(parsed.data);

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ data: result.data }, { status: 200 });
}
