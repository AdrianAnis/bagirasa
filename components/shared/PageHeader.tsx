type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-brand-ink/10 pb-6">
      <div className="max-w-xl">
        {eyebrow ? <p className="eyebrow text-brand/70">{eyebrow}</p> : null}
        <h1 className="mt-2 text-title font-semibold text-brand-ink">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm text-brand-ink/60">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
