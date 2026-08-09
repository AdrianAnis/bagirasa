import Link from "next/link";

import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  className?: string;
  tone?: "dark" | "light";
};

export function Logo({ href = "/", className, tone = "dark" }: LogoProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-baseline gap-[0.1em] text-xl font-semibold tracking-tight",
        tone === "dark" ? "text-brand-ink" : "text-white",
        className,
      )}
    >
      <span>Bagi</span>
      <span className={tone === "dark" ? "text-brand" : "text-brand-tint"}>
        Rasa
      </span>
    </Link>
  );
}
