import Link from "next/link";
import { redirect } from "next/navigation";
import { CalendarClock } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeployGoalDialog } from "@/components/goals/deploy-goal-dialog";
import { ApproveGoalButton, ReturnGoalButton } from "@/components/goals/goal-actions";
import type { GoalStatus } from "@/generated/prisma/enums";

const STATUS_VARIANT: Record<GoalStatus, "neutral" | "warning" | "success" | "danger"> = {
  DRAFT: "neutral",
  PENDING_APPROVAL: "warning",
  APPROVED: "success",
  RETURNED: "danger",
};

export default async function TeamGoalsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "EMPLOYEE") redirect("/goals");

  const isAdmin = session.user.role === "ADMIN";

  const reports = await prisma.employee.findMany({
    where: isAdmin ? {} : { managerId: session.user.employeeId ?? undefined },
    select: { id: true, firstName: true, lastName: true },
    orderBy: [{ firstName: "asc" }],
  });

  const reportIds = reports.map((r) => r.id);

  const goals = await prisma.goal.findMany({
    where: { employeeId: { in: reportIds } },
    include: { employee: true, cycle: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const pending = goals.filter((g) => g.status === "PENDING_APPROVAL");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
            Team Goals
          </h1>
          <p className="mt-1 text-muted">
            {isAdmin ? "Every employee's goals." : "Goals for your direct reports."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isAdmin && (
            <Button variant="secondary" asChild>
              <Link href="/goals/cycles">
                <CalendarClock className="size-4" />
                Review cycles
              </Link>
            </Button>
          )}
          {reports.length > 0 && <DeployGoalDialog reports={reports} />}
        </div>
      </div>

      {pending.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-3 font-display text-lg font-semibold text-powder-100">
              Pending approval ({pending.length})
            </h2>
            <div className="flex flex-col gap-3">
              {pending.map((goal) => (
                <div
                  key={goal.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-hairline p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-powder-100">
                      {goal.employee.firstName} {goal.employee.lastName} — {goal.title}
                    </p>
                    <p className="text-sm text-muted">
                      {goal.thrustArea} · Target: {goal.target} · {goal.weightage}%
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ApproveGoalButton goalId={goal.id} />
                    <ReturnGoalButton goalId={goal.id} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Cycle</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Weightage</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {goals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted">
                    No goals yet.
                  </TableCell>
                </TableRow>
              )}
              {goals.map((goal) => (
                <TableRow key={goal.id}>
                  <TableCell className="font-medium text-powder-100">
                    {goal.employee.firstName} {goal.employee.lastName}
                  </TableCell>
                  <TableCell className="text-muted">{goal.cycle.name}</TableCell>
                  <TableCell className="text-muted">{goal.title}</TableCell>
                  <TableCell className="text-muted">{goal.weightage}%</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[goal.status]}>
                      {goal.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
