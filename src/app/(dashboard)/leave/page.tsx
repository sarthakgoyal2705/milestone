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
import { RequestLeaveDialog } from "@/components/leave/request-leave-dialog";
import { CancelLeaveRequestButton } from "@/components/leave/leave-request-actions";
import type { LeaveRequestStatus } from "@/generated/prisma/enums";

const STATUS_VARIANT: Record<LeaveRequestStatus, "warning" | "success" | "danger" | "neutral"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  CANCELLED: "neutral",
};

export default async function LeavePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!session.user.employeeId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Leave
        </h1>
        <Card>
          <CardContent className="py-10 text-center text-muted">
            No employee profile is linked to this account.
          </CardContent>
        </Card>
      </div>
    );
  }

  const year = new Date().getFullYear();

  const [leaveTypes, balances, requests] = await Promise.all([
    prisma.leaveType.findMany({ orderBy: { name: "asc" } }),
    prisma.leaveBalance.findMany({
      where: { employeeId: session.user.employeeId, year },
      include: { leaveType: true },
    }),
    prisma.leaveRequest.findMany({
      where: { employeeId: session.user.employeeId },
      include: { leaveType: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
            Leave
          </h1>
          <p className="mt-1 text-muted">Your balances and requests for {year}.</p>
        </div>
        {leaveTypes.length > 0 && <RequestLeaveDialog leaveTypes={leaveTypes} />}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {balances.length === 0 && (
          <Card className="sm:col-span-2 lg:col-span-4">
            <CardContent className="py-8 text-center text-muted">
              No leave balances allocated for {year} yet.
            </CardContent>
          </Card>
        )}
        {balances.map((balance) => (
          <Card key={balance.id}>
            <CardContent className="pt-6">
              <p className="text-sm text-muted">{balance.leaveType.name}</p>
              <p className="mt-1 font-display text-2xl font-semibold text-powder-100">
                {balance.allocatedDays - balance.usedDays}
                <span className="text-base font-normal text-muted"> / {balance.allocatedDays} left</span>
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted">
                    No leave requests yet.
                  </TableCell>
                </TableRow>
              )}
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium text-powder-100">
                    {request.leaveType.name}
                  </TableCell>
                  <TableCell className="text-muted">
                    {format(request.startDate, "MMM d")} – {format(request.endDate, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-muted">{request.daysCount}</TableCell>
                  <TableCell className="max-w-64 truncate text-muted">
                    {request.reason ?? "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[request.status]}>{request.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {request.status === "PENDING" && (
                      <CancelLeaveRequestButton requestId={request.id} />
                    )}
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
