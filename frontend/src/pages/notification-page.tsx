import { useEffect, useState } from "react";
import api from "@/utils/axiosConfig";

// ── Types ────────────────────────────────────────────────────────────────────

type NotificationType = "mention";

type Notification = {
  _id: string;
  message: string;
  read: boolean;
  type: NotificationType;
  post: string;
  actor: { _id: string; username: string };
  createdAt: string;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ── NotificationCard ─────────────────────────────────────────────────────────

type NotificationCardProps = {
  notification: Notification;
};

const NotificationCard = ({ notification }: NotificationCardProps) => {
  const { message, read, createdAt, post } = notification;

  return (
    <a
      href={`/post/${post}`}
      className={`flex items-start gap-3 rounded-lg border p-4 transition-colors hover:bg-muted/50 ${
        read ? "border-border bg-background" : "border-primary/20 bg-primary/5"
      }`}
    >
      <span
        className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
          read ? "bg-transparent" : "bg-primary"
        }`}
      />
      <div className="flex flex-1 flex-col gap-0.5">
        <p className="text-sm text-foreground">{message}</p>
        <span className="text-xs text-muted-foreground">{timeAgo(createdAt)}</span>
      </div>
    </a>
  );
};

// ── NotificationPage ─────────────────────────────────────────────────────────

export const NotificationPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndMarkRead = async () => {
      try {
        const { data } = await api.get<Notification[]>("/notifications");
        setNotifications(data);

        const unreadIds = data
          .filter((n) => !n.read)
          .map((n) => n._id);

        if (unreadIds.length > 0) {
          // Fire and forget — UI is already updated optimistically below
          api.post("/notifications/", { ids: unreadIds }).catch(() => {});
          // Optimistically flip all to read in local state
          setNotifications((prev) =>
            prev.map((n) => (n.read ? n : { ...n, read: true }))
          );
        }
      } catch {
        setError("Failed to load notifications.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndMarkRead();
  }, []);

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="mb-6 text-xl font-semibold text-foreground">Notifications</h1>

      {loading && (
        <div className="flex flex-col gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-16 animate-pulse rounded-lg border border-border bg-muted"
            />
          ))}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {!loading && !error && notifications.length === 0 && (
        <p className="text-sm text-muted-foreground">No notifications yet.</p>
      )}

      {!loading && !error && notifications.length > 0 && (
        <div className="flex flex-col gap-2">
          {notifications.map((notification) => (
            <NotificationCard key={notification._id} notification={notification} />
          ))}
        </div>
      )}
    </div>
  );
};