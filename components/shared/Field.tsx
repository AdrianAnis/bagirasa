import { Label } from "@/components/ui/label";

type FieldProps = {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
};

export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={htmlFor} className="text-brand-ink">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-sm text-brand-ink/45">{hint}</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
    </div>
  );
}

type FormSectionProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
};

export function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <section className="rounded-xl border border-brand-ink/10 bg-white p-5">
      <div className="border-b border-brand-ink/10 pb-4">
        <h2 className="font-semibold text-brand-ink">{title}</h2>
        {description ? (
          <p className="mt-1 text-sm text-brand-ink/55">{description}</p>
        ) : null}
      </div>
      <div className="flex flex-col gap-5 pt-5">{children}</div>
    </section>
  );
}
