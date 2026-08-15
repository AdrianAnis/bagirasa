import { NotificationList } from "@/components/shared/NotificationList";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  countUnreadNotifications,
  listNotifications,
} from "@/lib/db/notifications";

export default async function RecipientNotificationsPage() {
  const [notifications, unreadCount] = await Promise.all([
    listNotifications(),
    countUnreadNotifications(),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader
        title="Notifikasi"
        description="Kabar donasi masuk dari restoran di sekitarmu."
      />

      <NotificationList
        notifications={notifications}
        unreadCount={unreadCount}
      />
    </div>
  );
}
