import { NotificationList } from "@/components/shared/NotificationList";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  countUnreadNotifications,
  listNotifications,
} from "@/lib/db/notifications";

export default async function DonorNotificationsPage() {
  const [notifications, unreadCount] = await Promise.all([
    listNotifications(),
    countUnreadNotifications(),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        eyebrow="Penyumbang"
        title="Notifikasi"
        description="Kabar dari penerima donasimu — jawaban terima atau tolak, dan konfirmasi penyerahan."
      />

      <NotificationList
        notifications={notifications}
        unreadCount={unreadCount}
      />
    </div>
  );
}
