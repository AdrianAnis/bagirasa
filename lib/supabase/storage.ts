import { createClient } from "@/lib/supabase/client";

export const IDENTITY_BUCKET = "identity-documents";

export type UploadResult =
  | { ok: true; path: string }
  | { ok: false; error: string };

export async function uploadIdentityDocument(
  file: File,
  userId: string,
  prefix: string,
): Promise<UploadResult> {
  const supabase = createClient();
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const path = `${userId}/${prefix}-${Date.now()}.${extension}`;

  const { error } = await supabase.storage
    .from(IDENTITY_BUCKET)
    .upload(path, file, { upsert: true });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, path };
}
