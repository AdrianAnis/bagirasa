import { redirect } from "next/navigation";

import { RegisterForm } from "@/components/auth/RegisterForm";
import {
  RECIPIENT_TYPES,
  REGISTRABLE_ROLES,
  type RegisterInput,
} from "@/lib/validations/auth";

function parseRole(value: string | undefined): RegisterInput["role"] | null {
  const match = REGISTRABLE_ROLES.find((role) => role === value);
  return match ?? null;
}

function parseRecipientType(
  value: string | undefined,
): RegisterInput["recipientType"] {
  return RECIPIENT_TYPES.find((type) => type === value);
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

  const recipientType = parseRecipientType(
    typeof params.type === "string" ? params.type : undefined,
  );

  if (role === "recipient" && !recipientType) {
    redirect("/choose-role");
  }

  return <RegisterForm role={role} recipientType={recipientType} />;
}
