import "server-only";

import { NOTIFICATION_TYPES } from "@/lib/config";
import { notify } from "@/lib/notify";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database.types";

export type VerificationStatus =
  Database["public"]["Enums"]["verification_status"];

export type PendingAccount = {
  profileId: string;
  email: string;
  role: Database["public"]["Enums"]["user_role"];
  status: VerificationStatus;
  createdAt: string;
  organisationName: string | null;
  address: string | null;
  phone: string | null;
  documentPath: string | null;
  documentUrl: string | null;
  detail: string | null;
};

export type AdminResult = { ok: true } | { ok: false; error: string };

async function requireAdmin(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return data?.role === "admin" ? user.id : null;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  return (await requireAdmin()) !== null;
}

export async function listAccounts(
  status: VerificationStatus,
): Promise<PendingAccount[]> {
  if (!(await requireAdmin())) {
    return [];
  }

  const admin = createAdminClient();

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, email, role, verification_status, created_at")
    .eq("verification_status", status)
    .neq("role", "admin")
    .order("created_at", { ascending: true });

  if (!profiles || profiles.length === 0) {
    return [];
  }

  const profileIds = profiles.map((profile) => profile.id);

  const [{ data: donors }, { data: recipients }] = await Promise.all([
    admin
      .from("donors")
      .select("profile_id, name, address, phone, ktp_url")
      .in("profile_id", profileIds),
    admin
      .from("recipients")
      .select(
        "profile_id, name, address, phone, legal_doc_url, type, capacity, current_need",
      )
      .in("profile_id", profileIds),
  ]);

  const donorByProfile = new Map(
    (donors ?? []).map((row) => [row.profile_id, row]),
  );
  const recipientByProfile = new Map(
    (recipients ?? []).map((row) => [row.profile_id, row]),
  );

  const accounts: PendingAccount[] = [];

  for (const profile of profiles) {
    const donor = donorByProfile.get(profile.id);
    const recipient = recipientByProfile.get(profile.id);

    const documentPath = donor?.ktp_url ?? recipient?.legal_doc_url ?? null;
    let documentUrl: string | null = null;

    if (documentPath) {
      const { data: signed } = await admin.storage
        .from("identity-documents")
        .createSignedUrl(documentPath, 300);

      documentUrl = signed?.signedUrl ?? null;
    }

    accounts.push({
      profileId: profile.id,
      email: profile.email,
      role: profile.role,
      status: profile.verification_status,
      createdAt: profile.created_at,
      organisationName: donor?.name ?? recipient?.name ?? null,
      address: donor?.address ?? recipient?.address ?? null,
      phone: donor?.phone ?? recipient?.phone ?? null,
      documentPath,
      documentUrl,
      detail: recipient
        ? `${recipient.capacity} penghuni · butuh ${recipient.current_need} porsi`
        : null,
    });
  }

  return accounts;
}

export async function setVerificationStatus(
  profileId: string,
  status: Extract<VerificationStatus, "verified" | "rejected">,
): Promise<AdminResult> {
  const adminId = await requireAdmin();

  if (!adminId) {
    return { ok: false, error: "Hanya admin yang bisa memverifikasi akun" };
  }

  if (profileId === adminId) {
    return { ok: false, error: "Tidak bisa memverifikasi akunmu sendiri" };
  }

  const admin = createAdminClient();

  const { data: target } = await admin
    .from("profiles")
    .select("role, verification_status")
    .eq("id", profileId)
    .maybeSingle();

  if (!target) {
    return { ok: false, error: "Akun tidak ditemukan" };
  }

  if (target.role === "admin") {
    return { ok: false, error: "Akun admin tidak melalui verifikasi" };
  }

  const { error } = await admin
    .from("profiles")
    .update({ verification_status: status })
    .eq("id", profileId);

  if (error) {
    return { ok: false, error: error.message };
  }

  await notify([
    {
      profileId,
      title: status === "verified" ? "Akun terverifikasi" : "Verifikasi ditolak",
      body:
        status === "verified"
          ? "Dokumenmu sudah diperiksa. Akunmu kini bisa menyalurkan dan menerima donasi."
          : "Dokumen yang kamu unggah belum bisa kami verifikasi. Perbarui dokumen lalu hubungi admin.",
      type: NOTIFICATION_TYPES.verificationUpdated,
    },
  ]);

  return { ok: true };
}
