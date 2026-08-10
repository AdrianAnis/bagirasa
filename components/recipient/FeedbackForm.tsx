"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { MAX_RATING, RATING_LABEL } from "@/lib/validations/feedback";

type FeedbackFormProps = {
  matchId: string;
  donorName: string;
};

export function FeedbackForm({ matchId, donorName }: FeedbackFormProps) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const shown = hovered || rating;

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (rating === 0) {
      toast.error("Pilih dulu berapa bintang");
      return;
    }

    setIsSubmitting(true);

    const response = await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        matchId,
        rating,
        comment: comment.trim() || undefined,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      toast.error(result.error ?? "Gagal mengirim penilaian");
      setIsSubmitting(false);
      return;
    }

    toast.success("Terima kasih atas penilaianmu");
    router.refresh();
    setIsSubmitting(false);
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div>
        <p className="text-sm font-medium text-brand-ink">
          Bagaimana donasi dari {donorName}?
        </p>
        <p className="mt-1 text-sm text-brand-ink/50">
          Penilaianmu membentuk reputasi restoran ini di BagiRasa.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div
          className="flex items-center gap-1"
          onMouseLeave={() => setHovered(0)}
        >
          {Array.from({ length: MAX_RATING }, (_, index) => index + 1).map(
            (star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star} bintang`}
                aria-pressed={rating === star}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHovered(star)}
                onFocus={() => setHovered(star)}
                onBlur={() => setHovered(0)}
                className="rounded p-0.5 transition-transform hover:scale-110"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className={cn(
                    "size-7",
                    star <= shown
                      ? "fill-brand text-brand"
                      : "fill-none text-brand-ink/25",
                  )}
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                >
                  <path d="M12 3.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.65l5.9-.85z" />
                </svg>
              </button>
            ),
          )}
        </div>

        {shown > 0 ? (
          <span className="text-sm text-brand-ink/60">
            {RATING_LABEL[shown]}
          </span>
        ) : null}
      </div>

      <Textarea
        rows={2}
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        placeholder="Catatan untuk restoran (opsional)"
        maxLength={500}
      />

      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "Mengirim..." : "Kirim penilaian"}
      </Button>
    </form>
  );
}
