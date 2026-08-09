import Link from "next/link";
import { redirect } from "next/navigation";

import { RecipientProfileForm } from "@/components/recipient/RecipientProfileForm";
import { getCurrentProfile } from "@/lib/db/profiles";
import { getCurrentRecipient } from "@/lib/db/recipients";
import { createClient } from "@/lib/supabase/server";
import {
  RECIPIENT_TYPES,
  type RecipientProfileFormInput,
} from "@/lib/validations/recipient";

export default async function RecipientProfilePage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const recipient = await getCurrentRecipient();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const metadataType = user?.user_metadata?.recipient_type;
  const defaultType: RecipientProfileFormInput["type"] =
    RECIPIENT_TYPES.find((type) => type === metadataType) ?? "panti_asuhan";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
      <div>
        <h1 className="text-2xl font-semibold text-brand">Profil Lembaga</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Data ini menentukan donasi mana yang aman dikirimkan kepadamu.
          Pantangan alergen dan status halal dipakai sebagai penyaring wajib.
        </p>
      </div>

      <RecipientProfileForm
        userId={profile.id}
        recipient={recipient}
        defaultType={defaultType}
      />

      <Link href="/recipient" className="text-sm text-brand underline">
        Kembali ke dashboard
      </Link>
    </main>
  );
}
