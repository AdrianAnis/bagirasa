import { redirect } from "next/navigation";

import { DonorRegisterForm } from "@/components/auth/DonorRegisterForm";
import { RecipientRegisterForm } from "@/components/auth/RecipientRegisterForm";
import {
  REGISTRABLE_ROLES,
  type RegistrableRole,
} from "@/lib/validations/auth";
import {
  RECIPIENT_TYPES,
  type RecipientType,
} from "@/lib/validations/recipient";

function parseRole(value: string | undefined): RegistrableRole | null {
  return REGISTRABLE_ROLES.find((role) => role === value) ?? null;
}

function parseRecipientType(value: string | undefined): RecipientType | null {
  return RECIPIENT_TYPES.find((type) => type === value) ?? null;
}

export default async function RegisterPage({
  searchParams,
}: PageProps<"/register">) {
  const params = await searchParams;
  const role = parseRole(
    typeof params.role === "string" ? params.role : undefined,
  );

  if (!role) {
    redirect("/choose-role");
  }

  if (role === "donor") {
    return <DonorRegisterForm />;
  }

  const recipientType = parseRecipientType(
    typeof params.type === "string" ? params.type : undefined,
  );

  if (!recipientType) {
    redirect("/choose-role");
  }

  return <RecipientRegisterForm recipientType={recipientType} />;
}
