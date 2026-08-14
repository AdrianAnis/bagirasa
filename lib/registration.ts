import { createClient } from "@/lib/supabase/client";
import { uploadIdentityDocument } from "@/lib/supabase/storage";
import type {
  DonorRegistrationInput,
  RecipientRegistrationInput,
} from "@/lib/validations/auth";

export type RegistrationResult = { ok: true } | { ok: false; error: string };

type AccountMetadata = {
  role: string;
  recipientType?: string;
};

async function createAccount(
  email: string,
  password: string,
  metadata: AccountMetadata,
): Promise<{ ok: true; userId: string } | { ok: false; error: string }> {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: metadata.role,
        recipient_type: metadata.recipientType ?? null,
      },
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  if (!data.session || !data.user) {
    return {
      ok: false,
      error:
        "Pendaftaran belum bisa diselesaikan karena konfirmasi email masih aktif di Supabase. Matikan Confirm email di Authentication, lalu coba lagi.",
    };
  }

  return { ok: true, userId: data.user.id };
}

async function saveProfile(
  endpoint: string,
  payload: Record<string, unknown>,
): Promise<RegistrationResult> {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (!response.ok) {
    return { ok: false, error: result.error ?? "Gagal menyimpan profil" };
  }

  return { ok: true };
}

export async function registerDonor(
  input: DonorRegistrationInput,
): Promise<RegistrationResult> {
  const account = await createAccount(input.email, input.password, {
    role: "donor",
  });

  if (!account.ok) {
    return account;
  }

  const upload = await uploadIdentityDocument(
    input.document,
    account.userId,
    "ktp",
  );

  if (!upload.ok) {
    return { ok: false, error: `Gagal mengunggah KTP: ${upload.error}` };
  }

  return saveProfile("/api/donors", {
    name: input.name,
    address: input.address,
    lat: input.lat,
    lng: input.lng,
    phone: input.phone,
    ktpUrl: upload.path,
  });
}

export async function registerRecipient(
  input: RecipientRegistrationInput,
): Promise<RegistrationResult> {
  const account = await createAccount(input.email, input.password, {
    role: "recipient",
    recipientType: input.type,
  });

  if (!account.ok) {
    return account;
  }

  const upload = await uploadIdentityDocument(
    input.document,
    account.userId,
    "legal-doc",
  );

  if (!upload.ok) {
    return { ok: false, error: `Gagal mengunggah dokumen: ${upload.error}` };
  }

  return saveProfile("/api/recipients", {
    type: input.type,
    name: input.name,
    address: input.address,
    lat: input.lat,
    lng: input.lng,
    phone: input.phone,
    capacity: input.capacity,
    currentNeed: 0,
    allergenRestrictions: input.allergenRestrictions,
    halalOnly: input.halalOnly,
    legalDocUrl: upload.path,
  });
}
