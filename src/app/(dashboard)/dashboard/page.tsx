import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { redirect } from "next/navigation";
import { ClockWidget } from "@/components/attendance/clock-widget";
import { KudosCard } from "@/components/recognition/kudos-card";
import { Badge } from "@/components/ui/badge";
import { Target, Monitor, Calendar } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const employee = await prisma.employee.findUnique({
    where: { userId: session.user.id },
    include: { department: true, directReports: true },
  });

  const firstName = employee?.firstName ?? session.user.email;

  // Fetch relevant data for widgets
  const [openEntry, recognitions, goals, assets] = await Promise.all([
    // Open attendance entry
    employee ? prisma.attendanceEntry.findFirst({
      where: { employeeId: employee.id, clockOut: null },
      orderBy: { clockIn: "desc" }
    }) : Promise.resolve(null),
    
    // Recent recognitions
    prisma.recognition.findMany({
      orderBy: { createdAt: "desc" },
      take: 2,
      include: {
        fromUser: { select: { email: true, employee: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        toEmployee: { select: { firstName: true, lastName: true, jobTitle: true, avatarUrl: true } }
      }
    }),

    // Active goals
    employee ? prisma.goal.findMany({
      where: { employeeId: employee.id, status: "APPROVED" },
      take: 3,
      orderBy: { createdAt: "desc" }
    }) : Promise.resolve([]),

    // Assigned assets
    employee ? prisma.asset.findMany({
      where: { assignedToId: employee.id },
      orderBy: { assignedAt: "desc" }
    }) : Promise.resolve([]),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Welcome back, {firstName}
        </h1>
        <p className="mt-1 text-muted">
          {employee ? `${employee.jobTitle}${employee.department ? ` · ${employee.department.name}` : ""}` : session.user.role}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Quick Actions & Recognitions */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {employee && (
            <ClockWidget openEntry={openEntry ? { id: openEntry.id, clockIn: openEntry.clockIn } : null} />
          )}

          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-semibold tracking-tight text-powder-100">
                Recent Kudos
              </h2>
              <Button variant="link" size="sm" asChild className="px-0">
                <Link href="/recognition">View all</Link>
              </Button>
            </div>
            {recognitions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted text-sm">
                  No recognitions yet. Be the first to give kudos!
                </CardContent>
              </Card>
            ) : (
              <div className="flex flex-col gap-3">
                {recognitions.map((r) => <KudosCard key={r.id} recognition={r} />)}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Goals & Assets */}
        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="size-4 text-teal" />
                Active Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              {goals.length === 0 ? (
                <p className="text-sm text-muted">No approved goals currently.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {goals.map(goal => (
                    <div key={goal.id} className="flex flex-col gap-1 border-b border-hairline pb-2 last:border-0 last:pb-0">
                      <span className="font-medium text-sm text-powder-100 line-clamp-1">{goal.title}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="neutral" className="text-[10px] uppercase">{goal.thrustArea}</Badge>
                      </div>
                    </div>
                  ))}
                  <Button variant="secondary" size="sm" asChild className="w-full mt-2">
                    <Link href="/goals">View Goals</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Monitor className="size-4 text-rust" />
                My Equipment
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assets.length === 0 ? (
                <p className="text-sm text-muted">No assets assigned to you.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {assets.map(asset => (
                    <div key={asset.id} className="flex justify-between items-center text-sm">
                      <span className="font-medium text-powder-100">{asset.name}</span>
                      <span className="text-muted">{asset.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
