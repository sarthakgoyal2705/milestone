import { redirect } from "next/navigation";
import { BellOff } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { markAllNotificationsRead, markNotificationRead } from "@/actions/notifications";

export default async function NotificationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-powder-100">
            Notifications
          </h1>
          <p className="mt-1 text-muted">Everything relevant to you, in one place.</p>
        </div>
        {hasUnread && (
          <form action={markAllNotificationsRead}>
            <Button type="submit" variant="secondary" size="sm">
              Mark all as read
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <BellOff className="size-8 text-muted" />
            <p className="text-sm text-muted">You have no notifications yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => (
            <form key={n.id} action={markNotificationRead.bind(null, n.id)}>
              <button
                type="submit"
                className="flex w-full items-start justify-between gap-4 rounded-lg border border-hairline bg-surface p-4 text-left transition-colors duration-150 ease-out-confident hover:border-teal/30"
              >
                <div>
                  <div className="flex items-center gap-2">
                    {!n.isRead && <span className="size-1.5 rounded-full bg-rust" />}
                    <span className="text-sm font-medium text-powder-100">{n.title}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">{n.body}</p>
                </div>
                <span className="shrink-0 text-xs text-muted">
                  {n.createdAt.toLocaleDateString()}
                </span>
              </button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
