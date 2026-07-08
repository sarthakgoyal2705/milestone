import { redirect } from "next/navigation";
import { format } from "date-fns";

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

export default async function TeamAttendancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "EMPLOYEE") redirect("/attendance");

  const isAdmin = session.user.role === "ADMIN";

  const reports = await prisma.employee.findMany({
    where: isAdmin ? {} : { managerId: session.user.employeeId ?? undefined },
    include: {
      attendanceEntries: {
        orderBy: { clockIn: "desc" },
        take: 1,
      },
    },
    orderBy: [{ firstName: "asc" }],
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Team Attendance
        </h1>
        <p className="mt-1 text-muted">Most recent clock-in status for each team member.</p>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last clock in</TableHead>
                <TableHead>Last clock out</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted">
                    No team members found.
                  </TableCell>
                </TableRow>
              )}
              {reports.map((employee) => {
                const latest = employee.attendanceEntries[0];
                const isClockedIn = latest && !latest.clockOut;
                return (
                  <TableRow key={employee.id}>
                    <TableCell className="font-medium text-powder-100">
                      {employee.firstName} {employee.lastName}
                    </TableCell>
                    <TableCell>
                      {!latest ? (
                        <Badge variant="neutral">No entries</Badge>
                      ) : isClockedIn ? (
                        <Badge variant="success">Clocked in</Badge>
                      ) : (
                        <Badge variant="neutral">Clocked out</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted">
                      {latest ? format(latest.clockIn, "MMM d, h:mm a") : "—"}
                    </TableCell>
                    <TableCell className="text-muted">
                      {latest?.clockOut ? format(latest.clockOut, "MMM d, h:mm a") : "—"}
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
