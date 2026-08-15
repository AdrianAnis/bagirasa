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
              "h-9 rounded-full border px-4 text-sm capitalize transition-colors",
              isSelected
                ? "border-brand bg-brand text-white"
                : "border-input text-brand-ink/60 hover:border-brand/50",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
