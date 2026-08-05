import { LogoutButton } from "@/components/shared/LogoutButton";
import { getCurrentProfile } from "@/lib/db/profiles";

export default async function AdminPage() {
  const profile = await getCurrentProfile();

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-12">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-brand">Panel Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">{profile?.email}</p>
        </div>
        <LogoutButton />
      </div>
      <p className="text-sm text-muted-foreground">
        Verifikasi akun donor dan penerima dikerjakan di Fase 8.
      </p>
    </main>
  );
}
