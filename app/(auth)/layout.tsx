import Link from "next/link";

import { Logo } from "@/components/shared/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-canvas">
      <header className="border-b border-brand-ink/10 bg-white">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center px-4">
          <Logo />
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        {children}
      </main>

      <footer className="mx-auto w-full max-w-5xl px-4 py-6">
        <Link
          href="/"
          className="text-sm text-brand-ink/50 transition-colors hover:text-brand"
        >
          Kembali ke beranda
        </Link>
      </footer>
    </div>
  );
}
