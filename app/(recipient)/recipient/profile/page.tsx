import { redirect } from "next/navigation";

import { RecipientProfileForm } from "@/components/recipient/RecipientProfileForm";
import { PageHeader } from "@/components/shared/PageHeader";
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
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Penerima"
        title="Profil lembaga"
        description="Pantangan alergen dan status halal dipakai sebagai penyaring wajib. Donasi yang bertentangan tidak akan pernah dikirimkan kepadamu."
      />

      <div className="max-w-2xl">
        <RecipientProfileForm
          userId={profile.id}
          recipient={recipient}
          defaultType={defaultType}
        />
      </div>
    </div>
  );
}
