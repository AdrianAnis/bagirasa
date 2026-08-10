"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import type { Notification } from "@/lib/db/notifications";
import { cn } from "@/lib/utils";

function formatMoment(value: string): string {
  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type NotificationListProps = {
  notifications: Notification[];
  unreadCount: number;
};

export function NotificationList({
  notifications,
  unreadCount,
}: NotificationListProps) {
  const router = useRouter();
  const [isMarking, setIsMarking] = useState(false);

  async function markAllRead() {
    setIsMarking(true);

    const response = await fetch("/api/notifications", { method: "POST" });

    if (!response.ok) {
      const result = await response.json();
      toast.error(result.error ?? "Gagal menandai notifikasi");
      setIsMarking(false);
      return;
    }

    toast.success("Semua notifikasi ditandai dibaca");
    router.refresh();
    setIsMarking(false);
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        title="Belum ada notifikasi"
        description="Kabar donasi masuk, jawaban penerima, dan konfirmasi penyerahan akan muncul di sini."
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {unreadCount > 0 ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-brand-ink/55">
            {unreadCount} notifikasi belum dibaca
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={markAllRead}
            disabled={isMarking}
          >
            {isMarking ? "Menandai..." : "Tandai semua dibaca"}
          </Button>
        </div>
      ) : null}

      <ul className="flex flex-col gap-3">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={cn(
              "rounded-xl border px-5 py-4",
              notification.is_read
                ? "border-brand-ink/10 bg-white"
                : "border-brand/30 bg-brand-tint/40",
            )}
          >
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-medium text-brand-ink">{notification.title}</p>
              <p className="numeric text-xs text-brand-ink/40">
                {formatMoment(notification.created_at)}
              </p>
            </div>
            <p className="mt-1 text-sm leading-relaxed text-brand-ink/60">
              {notification.body}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
