import { cn } from "@/lib/utils";

type RatingStarsProps = {
  value: number;
  size?: "sm" | "md";
  className?: string;
};

export function RatingStars({
  value,
  size = "sm",
  className,
}: RatingStarsProps) {
  const rounded = Math.round(value);

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`${value.toFixed(1)} dari 5 bintang`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 24 24"
          aria-hidden
          className={cn(
            size === "sm" ? "size-3.5" : "size-5",
            star <= rounded ? "fill-brand text-brand" : "fill-none text-brand-ink/25",
          )}
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <path d="M12 3.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.65l5.9-.85z" />
        </svg>
      ))}
    </span>
  );
}
