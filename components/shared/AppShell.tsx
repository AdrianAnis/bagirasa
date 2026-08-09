import { redirect } from "next/navigation";

import { AppNav, type NavLink } from "@/components/shared/AppNav";
import { getCurrentDonor } from "@/lib/db/donors";
import { getCurrentProfile } from "@/lib/db/profiles";
import { getCurrentRecipient } from "@/lib/db/recipients";

const NAV_LINKS: Record<string, NavLink[]> = {
  donor: [
    { href: "/donor", label: "Dashboard" },
    { href: "/donor/donations/new", label: "Buat donasi" },
    { href: "/donor/profile", label: "Profil restoran" },
  ],
  recipient: [
    { href: "/recipient", label: "Dashboard" },
    { href: "/recipient/profile", label: "Profil lembaga" },
  ],
  admin: [{ href: "/admin", label: "Verifikasi akun" }],
};

const ROLE_LABEL: Record<string, string> = {
  donor: "Penyumbang",
  recipient: "Penerima",
  admin: "Admin",
};

type AppShellProps = {
  children: React.ReactNode;
};

export async function AppShell({ children }: AppShellProps) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const organisation =
    profile.role === "donor"
      ? ((await getCurrentDonor())?.name ?? null)
      : profile.role === "recipient"
        ? ((await getCurrentRecipient())?.name ?? null)
        : null;

  return (
    <div className="flex min-h-svh flex-col bg-canvas">
      <AppNav
        links={NAV_LINKS[profile.role] ?? []}
        email={profile.email}
        roleLabel={ROLE_LABEL[profile.role] ?? profile.role}
        organisationName={organisation}
        verificationStatus={profile.verification_status}
      />
      <div className="mx-auto w-full max-w-5xl flex-1 px-4 py-10">
        {children}
      </div>
    </div>
  );
}
