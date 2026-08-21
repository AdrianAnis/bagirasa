import Link from "next/link";

import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { MONEY_DONATION_URL } from "@/lib/config";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-brand-ink/10 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-6 px-6">
          <Logo />
          <nav className="ml-auto flex items-center gap-2">
            <Link
              href="#cara-kerja"
              className="hidden rounded-md px-3 py-2 text-sm font-medium text-brand-ink/60 transition-colors hover:text-brand-ink sm:block"
            >
              Cara kerja
            </Link>
            <Link
              href="#keamanan"
              className="hidden rounded-md px-3 py-2 text-sm font-medium text-brand-ink/60 transition-colors hover:text-brand-ink sm:block"
            >
              Keamanan
            </Link>
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">Masuk</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/choose-role">Daftar</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-brand-ink/10 bg-canvas">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
          <div className="flex flex-wrap items-start justify-between gap-8">
            <div className="max-w-sm">
              <Logo />
              <p className="mt-3 text-sm text-brand-ink/55">
                Menyalurkan surplus makanan layak konsumsi dari rumah makan ke
                lembaga penerima di Semarang.
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="eyebrow text-brand-ink/40">Mulai</p>
              <Link
                href="/choose-role"
                className="text-sm text-brand-ink/70 hover:text-brand"
              >
                Daftar sebagai penyumbang
              </Link>
              <Link
                href="/choose-role"
                className="text-sm text-brand-ink/70 hover:text-brand"
              >
                Daftar sebagai penerima
              </Link>
              <Link
                href="/login"
                className="text-sm text-brand-ink/70 hover:text-brand"
              >
                Masuk
              </Link>
            </div>

            <div className="max-w-xs">
              <p className="eyebrow text-brand-ink/40">Dukung operasional</p>
              <p className="mt-2 text-sm text-brand-ink/55">
                Donasi uang membantu biaya pengantaran dan verifikasi lembaga
                penerima.
              </p>
              {MONEY_DONATION_URL ? (
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <a
                    href={MONEY_DONATION_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Donasi uang
                  </a>
                </Button>
              ) : (
                <p className="mt-3 text-sm text-brand-ink/40">
                  Kanal donasi sedang disiapkan.
                </p>
              )}
            </div>
          </div>

          <p className="border-t border-brand-ink/10 pt-6 text-sm text-brand-ink/40">
            BagiRasa · SwitchFest 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
