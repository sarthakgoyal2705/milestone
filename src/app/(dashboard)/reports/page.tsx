import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatTile } from "@/components/reports/stat-tile";
import { DepartmentHeadcountChart } from "@/components/reports/department-headcount-chart";
import { EmployeeStatusChart } from "@/components/reports/employee-status-chart";
import { GoalFunnelChart } from "@/components/reports/goal-funnel-chart";

const GOAL_STAGE_LABEL: Record<string, string> = {
  DRAFT: "Draft",
  PENDING_APPROVAL: "Pending",
  APPROVED: "Approved",
  RETURNED: "Returned",
};

const GOAL_STAGE_ORDER = ["DRAFT", "PENDING_APPROVAL", "APPROVED", "RETURNED"];

export default async function ReportsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const [employees, goalCounts, pendingLeaveCount, openPostingsCount] = await Promise.all([
    prisma.employee.findMany({
      select: { status: true, department: { select: { name: true } } },
    }),
    prisma.goal.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.leaveRequest.count({ where: { status: "PENDING" } }),
    prisma.jobPosting.count({ where: { isOpen: true } }),
  ]);

  const activeHeadcount = employees.filter((e) => e.status !== "TERMINATED").length;
  const pendingGoalCount =
    goalCounts.find((g) => g.status === "PENDING_APPROVAL")?._count._all ?? 0;

  const departmentMap = new Map<string, number>();
  for (const employee of employees) {
    if (employee.status === "TERMINATED") continue;
    const name = employee.department?.name ?? "Unassigned";
    departmentMap.set(name, (departmentMap.get(name) ?? 0) + 1);
  }
  const departmentData = Array.from(departmentMap.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const statusMap = { ACTIVE: 0, ON_LEAVE: 0, TERMINATED: 0 };
  for (const employee of employees) statusMap[employee.status]++;
  const statusData = [
    { name: "Active", value: statusMap.ACTIVE },
    { name: "On leave", value: statusMap.ON_LEAVE },
    { name: "Terminated", value: statusMap.TERMINATED },
  ].filter((d) => d.value > 0);

  const goalData = GOAL_STAGE_ORDER.map((status) => ({
    name: GOAL_STAGE_LABEL[status],
    count: goalCounts.find((g) => g.status === status)?._count._all ?? 0,
  }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Reports
        </h1>
        <p className="mt-1 text-muted">A snapshot of headcount, approvals, and hiring.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile label="Active headcount" value={activeHeadcount} />
        <StatTile label="Goals pending approval" value={pendingGoalCount} />
        <StatTile label="Leave requests pending" value={pendingLeaveCount} />
        <StatTile label="Open job postings" value={openPostingsCount} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Headcount by department</CardTitle>
          </CardHeader>
          <CardContent>
            {departmentData.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">No employees yet.</p>
            ) : (
              <DepartmentHeadcountChart data={departmentData} />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Employee status</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length === 0 ? (
              <p className="py-10 text-center text-sm text-muted">No employees yet.</p>
            ) : (
              <EmployeeStatusChart data={statusData} />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Goal approval funnel</CardTitle>
        </CardHeader>
        <CardContent>
          {goalData.every((d) => d.count === 0) ? (
            <p className="py-10 text-center text-sm text-muted">No goals set yet.</p>
          ) : (
            <GoalFunnelChart data={goalData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
