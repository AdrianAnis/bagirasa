type EmptyStateProps = {
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-brand-ink/15 bg-canvas px-6 py-12 text-center">
      <p className="font-medium text-brand-ink">{title}</p>
      <p className="max-w-sm text-sm text-brand-ink/55">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
