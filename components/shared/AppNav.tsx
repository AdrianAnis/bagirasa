"use client";

import { Bell, LogOut, Plus, User, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

export type NavLink = {
  href: string;
  label: string;
};

export type PrimaryAction = {
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
  profileHref: string | null;
  profileLabel: string;
  primaryAction: PrimaryAction | null;
  unreadCount: number;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu verifikasi",
  verified: "Terverifikasi",
  rejected: "Verifikasi ditolak",
};

const STATUS_DOT: Record<string, string> = {
  pending: "bg-amber-500",
  verified: "bg-brand",
  rejected: "bg-red-500",
};

export function AppNav({
  links,
  email,
  roleLabel,
  organisationName,
  verificationStatus,
  notificationsHref,
  profileHref,
  profileLabel,
  primaryAction,
  unreadCount,
}: AppNavProps) {
  const pathname = usePathname();
  const router = useRouter();
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
    <header className="sticky top-0 z-40 border-b border-brand-ink/8 bg-white/85 backdrop-blur">
      <div className="mx-auto grid h-16 w-full max-w-5xl grid-cols-[1fr_auto_1fr] items-center px-4">
        <Logo href={links[0]?.href ?? "/"} className="justify-self-start" />

        <nav className="hidden h-16 items-center gap-8 md:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "relative flex h-full items-center text-sm transition-colors after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:transition-colors",
                isActive(link.href)
                  ? "font-bold text-brand-ink after:bg-brand"
                  : "text-brand-ink/50 after:bg-transparent hover:text-brand-ink",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="col-start-3 flex items-center justify-end gap-2">
          {primaryAction ? (
            <Button asChild size="sm" className="h-9">
              <Link href={primaryAction.href}>
                <Plus className="size-4" aria-hidden />
                <span className="hidden sm:inline">{primaryAction.label}</span>
                <span className="sr-only sm:hidden">{primaryAction.label}</span>
              </Link>
            </Button>
          ) : null}

          {notificationsHref ? (
            <Link
              href={notificationsHref}
              aria-label={
                unreadCount > 0
                  ? `Notifikasi, ${unreadCount} belum dibaca`
                  : "Notifikasi"
              }
              className={cn(
                "relative flex size-10 items-center justify-center rounded-full transition-colors",
                isActive(notificationsHref)
                  ? "bg-brand-tint text-brand-deep"
                  : "text-brand-ink/60 hover:bg-canvas hover:text-brand-ink",
              )}
            >
              <Bell className="size-[18px]" aria-hidden />
              {unreadCount > 0 ? (
                <span className="numeric absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold leading-4 text-white">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              ) : null}
            </Link>
          ) : null}

          <DropdownMenu>
            <DropdownMenuTrigger
              aria-label="Menu akun"
              className="flex size-10 items-center justify-center rounded-full bg-canvas text-brand-ink transition-colors outline-none hover:bg-brand-tint focus-visible:ring-3 focus-visible:ring-ring/50 data-[state=open]:bg-brand-tint"
            >
              <UserRound className="size-[18px]" aria-hidden />
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <div className="px-3 py-2">
                <p className="truncate text-sm font-medium text-brand-ink">
                  {organisationName ?? roleLabel}
                </p>
                <p className="mt-0.5 truncate text-xs text-brand-ink/45">
                  {email}
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-xs text-brand-ink/55">
                  <span
                    aria-hidden
                    className={cn(
                      "size-1.5 rounded-full",
                      STATUS_DOT[verificationStatus] ?? "bg-brand-ink/30",
                    )}
                  />
                  {STATUS_LABEL[verificationStatus] ?? verificationStatus}
                </p>
              </div>

              {links.length > 0 ? (
                <div className="md:hidden">
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Navigasi</DropdownMenuLabel>
                  {links.map((link) => (
                    <DropdownMenuItem key={link.href} asChild>
                      <Link href={link.href}>{link.label}</Link>
                    </DropdownMenuItem>
                  ))}
                </div>
              ) : null}

              <DropdownMenuSeparator />

              {profileHref ? (
                <DropdownMenuItem asChild>
                  <Link href={profileHref}>
                    <User aria-hidden />
                    {profileLabel}
                  </Link>
                </DropdownMenuItem>
              ) : null}

              <DropdownMenuItem
                disabled={isLoggingOut}
                onSelect={(event) => {
                  event.preventDefault();
                  onLogout();
                }}
              >
                <LogOut aria-hidden />
                {isLoggingOut ? "Keluar..." : "Keluar"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
