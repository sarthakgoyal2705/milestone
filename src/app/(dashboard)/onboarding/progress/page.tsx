import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function OnboardingProgressPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "EMPLOYEE") redirect("/onboarding");

  const isAdmin = session.user.role === "ADMIN";

  const employees = await prisma.employee.findMany({
    where: {
      onboardingTasks: { some: {} },
      ...(isAdmin ? {} : { managerId: session.user.employeeId ?? undefined }),
    },
    include: { onboardingTasks: true },
    orderBy: [{ firstName: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Onboarding Progress
        </h1>
        <p className="mt-1 text-muted">Checklist completion for recently hired employees.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="py-10 text-center text-muted">
                    No one has an onboarding checklist yet.
                  </TableCell>
                </TableRow>
              )}
              {employees.map((employee) => {
                const total = employee.onboardingTasks.length;
                const complete = employee.onboardingTasks.filter((t) => t.isComplete).length;
                const isDone = total > 0 && complete === total;
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium text-powder-100">
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell className="text-muted">
                      {complete} / {total} tasks
                    </TableCell>
                    <TableCell>
                      <Badge variant={isDone ? "success" : "warning"}>
                        {isDone ? "Complete" : "In progress"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
