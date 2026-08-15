import Link from "next/link";

import { Logo } from "@/components/shared/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-svh bg-canvas">
      <main className="mx-auto flex w-full max-w-xl flex-col items-center px-6 py-12 sm:py-16">
        <Logo href="/" className="text-2xl" />

        <div className="mt-10 w-full">{children}</div>

        <p className="mt-8 text-sm text-brand-ink/55">
          Sudah punya akun?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand underline underline-offset-2"
          >
            Masuk
          </Link>
        </p>
      </main>
    </div>
  );
}
