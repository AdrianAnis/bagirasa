import { cn } from "@/lib/utils";

export type StatusTone = "neutral" | "waiting" | "active" | "done" | "danger";

const TONE_CLASS: Record<StatusTone, string> = {
  neutral: "bg-brand-ink/8 text-brand-ink/70",
  waiting: "bg-amber-100 text-amber-900",
  active: "bg-brand-tint text-brand-deep",
  done: "bg-brand text-white",
  danger: "bg-red-100 text-red-900",
};

type StatusBadgeProps = {
  tone: StatusTone;
  children: React.ReactNode;
};

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium",
        TONE_CLASS[tone],
      )}
    >
      {children}
    </span>
  );
}
