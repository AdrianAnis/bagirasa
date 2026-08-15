import Link from "next/link";

import { Logo } from "@/components/shared/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-canvas">
      <header className="mx-auto flex h-20 w-full max-w-xl items-center justify-between px-6">
        <Logo href="/" />
        <p className="text-sm text-brand-ink/45">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-medium text-brand transition-opacity hover:opacity-70"
          >
            Masuk
          </Link>
        </p>
      </header>

      <main className="mx-auto w-full max-w-xl px-6 pb-24 pt-4">
        {children}
      </main>
    </div>
  );
}
