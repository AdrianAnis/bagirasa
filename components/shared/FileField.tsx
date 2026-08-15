"use client";

import { Check, Upload } from "lucide-react";

import { cn } from "@/lib/utils";

function formatSize(bytes: number) {
  return bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${Math.round(bytes / 1024)} KB`;
}

type FileFieldProps = {
  id: string;
  accept: string;
  placeholder: string;
  file: File | undefined;
  onSelect: (file: File) => void;
};

export function FileField({
  id,
  accept,
  placeholder,
  file,
  onSelect,
}: FileFieldProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-3.5 rounded-lg border px-4 py-3 transition-colors",
        file
          ? "border-brand/40 bg-brand-tint/50"
          : "border-input hover:border-brand/50",
      )}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-md transition-colors",
          file ? "bg-brand text-white" : "bg-brand-tint text-brand",
        )}
      >
        {file ? (
          <Check className="size-4.5" aria-hidden />
        ) : (
          <Upload className="size-4.5" aria-hidden />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-brand-ink">
          {file ? file.name : placeholder}
        </span>
        <span className="mt-0.5 block text-xs text-brand-ink/45">
          {file ? formatSize(file.size) : "JPG, PNG, WEBP, atau PDF · maks 5 MB"}
        </span>
      </span>

      {file ? (
        <span className="shrink-0 text-xs font-medium text-brand">Ganti</span>
      ) : null}

      <input
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => {
          const next = event.target.files?.[0];

          if (next) {
            onSelect(next);
          }
        }}
      />
    </label>
  );
}
