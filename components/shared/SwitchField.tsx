"use client";

import { Switch } from "@/components/ui/switch";

type SwitchFieldProps = {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function SwitchField({
  id,
  label,
  description,
  checked,
  onCheckedChange,
}: SwitchFieldProps) {
  return (
    <div className="flex items-center justify-between gap-5 rounded-lg border border-input px-4 py-3">
      <div className="flex flex-col gap-0.5">
        <label htmlFor={id} className="text-sm font-medium text-brand-ink">
          {label}
        </label>
        {description ? (
          <p className="text-xs leading-relaxed text-brand-ink/45">
            {description}
          </p>
        ) : null}
      </div>
      <Switch id={id} checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  );
}
