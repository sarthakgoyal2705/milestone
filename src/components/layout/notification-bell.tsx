"use client";

import Link from "next/link";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type NotificationSummary = {
  id: string;
  title: string;
  body: string;
  linkUrl: string | null;
  isRead: boolean;
};

export function NotificationBell({
  notifications,
  unreadCount,
}: {
  notifications: NotificationSummary[];
  unreadCount: number;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:bg-ink-800/60 hover:text-powder-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal/50">
        <Bell className="size-4.5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex size-2 rounded-full bg-rust" />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted">You&apos;re all caught up.</p>
        ) : (
          notifications.map((n) => (
            <DropdownMenuItem key={n.id} asChild>
              <Link href={n.linkUrl ?? "/notifications"} className="flex flex-col items-start gap-0.5">
                <span className="text-sm font-medium text-powder-100">{n.title}</span>
                <span className="text-xs text-muted">{n.body}</span>
              </Link>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/notifications" className="justify-center text-sm text-teal">
            View all
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
