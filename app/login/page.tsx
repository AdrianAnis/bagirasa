import Link from "next/link";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="relative min-h-svh bg-brand-ink">
      <div
        aria-hidden
        className="absolute inset-0 bg-[url('/login-bg.jpg')] bg-cover bg-center"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-brand-ink/90 via-brand-ink/70 to-brand-ink/85"
      />

      <div className="relative mx-auto flex min-h-svh w-full max-w-7xl flex-col justify-center gap-12 px-6 py-12 lg:flex-row lg:items-center lg:justify-between lg:gap-24 lg:px-12 xl:gap-32">
        <div className="animate-rise lg:max-w-md">
          <h2 className="text-title font-semibold tracking-tight text-white lg:text-display">
            Sisa hari ini{" "}
            <span className="text-brand-light">masih bisa</span> jadi makan
            malam seseorang.
          </h2>
          <p className="mt-5 max-w-md leading-relaxed text-white/65">
            Masuk untuk mencatat surplus hari ini, atau menjawab donasi yang
            sedang menunggu jawabanmu.
          </p>

          <Link
            href="/"
            className="mt-8 inline-block text-sm text-white/50 transition-colors hover:text-white"
          >
            Kembali ke beranda
          </Link>
        </div>

        <main className="animate-rise w-full [animation-delay:120ms] lg:w-[25rem] lg:shrink-0">
          <div className="rounded-2xl bg-white p-8 shadow-[0_32px_80px_-28px_rgba(6,20,15,0.75)]">
            <LoginForm />
          </div>
        </main>
      </div>
    </div>
  );
}
