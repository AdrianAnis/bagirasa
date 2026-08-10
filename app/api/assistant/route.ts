import { refreshInsight } from "@/lib/db/insights";

export async function POST(): Promise<Response> {
  const result = await refreshInsight();

  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  return Response.json({ data: result.insight }, { status: 201 });
}
