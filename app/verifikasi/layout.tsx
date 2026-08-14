import { Logo } from "@/components/shared/Logo";
import { SignOutButton } from "@/components/shared/SignOutButton";

export default function VerificationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-canvas">
      <header className="border-b border-brand-ink/10 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between gap-4 px-4">
          <Logo href="/verifikasi" />
          <SignOutButton />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-12">
        {children}
      </main>
    </div>
  );
}
