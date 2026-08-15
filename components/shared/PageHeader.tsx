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
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-brand-ink/8 pb-6">
      <div className="max-w-xl">
        {eyebrow ? (
          <p className="text-sm text-brand-ink/45">{eyebrow}</p>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-brand-ink">
          {title}
        </h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-brand-ink/55">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
