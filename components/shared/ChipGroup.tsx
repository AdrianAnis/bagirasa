"use client";

import { cn } from "@/lib/utils";

type ChipGroupProps<Option extends string> = {
  label: string;
  options: readonly Option[];
  value: Option[];
  onChange: (next: Option[]) => void;
};

export function ChipGroup<Option extends string>({
  label,
  options,
  value,
  onChange,
}: ChipGroupProps<Option>) {
  function toggle(option: Option) {
    onChange(
      value.includes(option)
        ? value.filter((item) => item !== option)
        : [...value, option],
    );
  }

  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = value.includes(option);

        return (
          <button
            key={option}
            type="button"
            aria-pressed={isSelected}
            onClick={() => toggle(option)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-sm capitalize transition-colors",
              isSelected
                ? "border-brand bg-brand text-white"
                : "border-brand-ink/15 bg-white text-brand-ink/70 hover:border-brand-ink/30",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
