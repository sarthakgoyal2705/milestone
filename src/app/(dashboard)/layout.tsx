import Link from "next/link";
import { redirect } from "next/navigation";
import { Menu } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { NotificationBell } from "@/components/layout/notification-bell";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import * as DialogPrimitive from "@radix-ui/react-dialog";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const user = session.user;

  const [employee, notifications, unreadCount] = await Promise.all([
    prisma.employee.findUnique({ where: { userId: user.id } }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
    prisma.notification.count({ where: { userId: user.id, isRead: false } }),
  ]);

  const displayName = employee ? `${employee.firstName} ${employee.lastName}` : user.email!;

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-hairline bg-ink-900 px-4 py-6 lg:flex">
        <Link href="/dashboard" className="mb-8 flex items-center gap-2.5 px-2 font-display text-lg font-semibold tracking-tight">
          <span className="flex size-8 items-center justify-center rounded-md bg-rust text-sm text-white">M</span>
          Milestone
        </Link>
        <SidebarNav role={user.role} />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-hairline bg-ink-900/80 px-4 backdrop-blur-md sm:px-6">
          <Sheet>
            <SheetTrigger className="flex size-9 items-center justify-center rounded-md text-muted hover:bg-ink-800/60 hover:text-powder-100 lg:hidden">
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col px-4 py-6">
              <VisuallyHidden asChild>
                <DialogPrimitive.Title>Navigation</DialogPrimitive.Title>
              </VisuallyHidden>
              <Link href="/dashboard" className="mb-8 flex items-center gap-2.5 px-2 font-display text-lg font-semibold tracking-tight">
                <span className="flex size-8 items-center justify-center rounded-md bg-rust text-sm text-white">M</span>
                Milestone
              </Link>
              <SidebarNav role={user.role} />
            </SheetContent>
          </Sheet>

          <div className="flex-1" />

          <NotificationBell notifications={notifications} unreadCount={unreadCount} />
          <UserMenu name={displayName} role={user.role} />
        </header>

        <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
      </div>
    </div>
  );
}
