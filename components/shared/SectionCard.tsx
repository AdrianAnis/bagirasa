import { cn } from "@/lib/utils";

type SectionCardProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export function SectionCard({
  title,
  description,
  action,
  className,
  children,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-xl border border-brand-ink/8 bg-white p-5",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-brand-ink">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-brand-ink/50">{description}</p>
          ) : null}
        </div>
        {action}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}
