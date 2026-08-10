"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type NavLink = {
  href: string;
  label: string;
};

type AppNavProps = {
  links: NavLink[];
  email: string;
  roleLabel: string;
  organisationName: string | null;
  verificationStatus: string;
  notificationsHref: string | null;
  unreadCount: number;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu verifikasi",
  verified: "Terverifikasi",
  rejected: "Verifikasi ditolak",
};

export function AppNav({
  links,
  email,
  roleLabel,
  organisationName,
  verificationStatus,
  notificationsHref,
  unreadCount,
}: AppNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  function isActive(href: string): boolean {
    if (href === links[0]?.href) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  }

  async function onLogout() {
    setIsLoggingOut(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      toast.error(error.message);
      setIsLoggingOut(false);
      return;
    }

    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-40 border-b border-brand-ink/10 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center gap-6 px-4">
        <Logo href={links[0]?.href ?? "/"} />

        <nav className="hidden flex-1 items-center gap-1 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-brand-tint text-brand-deep"
                  : "text-brand-ink/60 hover:bg-brand-tint/60 hover:text-brand-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          {notificationsHref ? (
            <Link
              href={notificationsHref}
              aria-label={
                unreadCount > 0
                  ? `Notifikasi, ${unreadCount} belum dibaca`
                  : "Notifikasi"
              }
              className={cn(
                "relative flex size-9 items-center justify-center rounded-md border transition-colors",
                isActive(notificationsHref)
                  ? "border-brand bg-brand-tint text-brand-deep"
                  : "border-brand-ink/15 text-brand-ink/60 hover:text-brand-ink",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-4"
                aria-hidden
              >
                <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.7 21a2 2 0 0 1-3.4 0" />
              </svg>
              {unreadCount > 0 ? (
                <span className="numeric absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[11px] font-semibold leading-5 text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </Link>
          ) : null}

          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-brand-ink">
              {organisationName ?? roleLabel}
            </p>
            <p className="eyebrow text-brand-ink/45">
              {STATUS_LABEL[verificationStatus] ?? verificationStatus}
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="hidden sm:inline-flex"
          >
            {isLoggingOut ? "Keluar..." : "Keluar"}
          </Button>

          <button
            type="button"
            aria-label="Buka menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex size-9 flex-col items-center justify-center gap-1 rounded-md border border-brand-ink/15 md:hidden"
          >
            <span className="h-px w-4 bg-brand-ink" />
            <span className="h-px w-4 bg-brand-ink" />
            <span className="h-px w-4 bg-brand-ink" />
          </button>
        </div>
      </div>

      {isMenuOpen ? (
        <div className="border-t border-brand-ink/10 bg-white md:hidden">
          <nav className="mx-auto flex w-full max-w-5xl flex-col gap-1 px-4 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium",
                  isActive(link.href)
                    ? "bg-brand-tint text-brand-deep"
                    : "text-brand-ink/70",
                )}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-2 border-t border-brand-ink/10 pt-3">
              <p className="px-3 text-sm text-brand-ink/60">{email}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="mt-2 w-full"
              >
                {isLoggingOut ? "Keluar..." : "Keluar"}
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
