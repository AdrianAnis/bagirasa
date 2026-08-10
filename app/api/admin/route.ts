import { setVerificationStatus } from "@/lib/db/admin";
import { verificationActionSchema } from "@/lib/validations/admin";

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

  const parsed = verificationActionSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 },
    );
  }

  const result = await setVerificationStatus(
    parsed.data.profileId,
    parsed.data.status,
  );

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 403 });
  }

  return Response.json({ ok: true }, { status: 200 });
}
