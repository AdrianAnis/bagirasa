import { createDonation } from "@/lib/db/donations";
import { donationCreateSchema } from "@/lib/validations/donation";

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

  const parsed = donationCreateSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Data tidak valid" },
      { status: 400 },
    );
  }

  const result = await createDonation(parsed.data);

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ data: result.data }, { status: 201 });
}
