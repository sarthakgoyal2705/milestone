import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { UsersRound } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ClockWidget } from "@/components/attendance/clock-widget";

export default async function AttendancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!session.user.employeeId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Attendance
        </h1>
        <Card>
          <CardContent className="py-10 text-center text-muted">
            No employee profile is linked to this account.
          </CardContent>
        </Card>
      </div>
    );
  }

  const entries = await prisma.attendanceEntry.findMany({
    where: { employeeId: session.user.employeeId },
    orderBy: { clockIn: "desc" },
    take: 30,
  });

  const openEntry = entries.find((e) => !e.clockOut) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
            Attendance
          </h1>
          <p className="mt-1 text-muted">Clock in and out, and review your recent history.</p>
        </div>
        {(session.user.role === "MANAGER" || session.user.role === "ADMIN") && (
          <Button variant="secondary" asChild>
            <Link href="/attendance/team">
              <UsersRound className="size-4" />
              Team attendance
            </Link>
          </Button>
        )}
      </div>

      <ClockWidget openEntry={openEntry ? { id: openEntry.id, clockIn: openEntry.clockIn } : null} />

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Clock in</TableHead>
                <TableHead>Clock out</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-muted">
                    No attendance entries yet.
                  </TableCell>
                </TableRow>
              )}
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="text-muted">{format(entry.clockIn, "MMM d, yyyy")}</TableCell>
                  <TableCell className="text-muted">{format(entry.clockIn, "h:mm a")}</TableCell>
                  <TableCell className="text-muted">
                    {entry.clockOut ? format(entry.clockOut, "h:mm a") : "—"}
                  </TableCell>
                  <TableCell className="text-muted">
                    {entry.totalMinutes !== null
                      ? `${Math.floor(entry.totalMinutes / 60)}h ${entry.totalMinutes % 60}m`
                      : "—"}
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
