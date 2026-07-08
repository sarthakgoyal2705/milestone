import Link from "next/link";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Settings2 } from "lucide-react";

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
import {
  ApproveLeaveRequestButton,
  RejectLeaveRequestButton,
} from "@/components/leave/leave-request-actions";
import type { LeaveRequestStatus } from "@/generated/prisma/enums";

const STATUS_VARIANT: Record<LeaveRequestStatus, "warning" | "success" | "danger" | "neutral"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "danger",
  CANCELLED: "neutral",
};

export default async function LeaveApprovalsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "EMPLOYEE") redirect("/leave");

  const isAdmin = session.user.role === "ADMIN";

  const reportIds = (
    await prisma.employee.findMany({
      where: isAdmin ? {} : { managerId: session.user.employeeId ?? undefined },
      select: { id: true },
    })
  ).map((e) => e.id);

  const requests = await prisma.leaveRequest.findMany({
    where: { employeeId: { in: reportIds } },
    include: { employee: true, leaveType: true },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const pending = requests.filter((r) => r.status === "PENDING");
  const resolved = requests.filter((r) => r.status !== "PENDING");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
            Leave Approvals
          </h1>
          <p className="mt-1 text-muted">
            {isAdmin ? "Every employee's leave requests." : "Requests from your direct reports."}
          </p>
        </div>
        {isAdmin && (
          <Button variant="secondary" asChild>
            <Link href="/leave/types">
              <Settings2 className="size-4" />
              Leave types
            </Link>
          </Button>
        )}
      </div>

      {pending.length > 0 && (
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-3 font-display text-lg font-semibold text-powder-100">
              Pending ({pending.length})
            </h2>
            <div className="flex flex-col gap-3">
              {pending.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-hairline p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-powder-100">
                      {request.employee.firstName} {request.employee.lastName} —{" "}
                      {request.leaveType.name}
                    </p>
                    <p className="text-sm text-muted">
                      {format(request.startDate, "MMM d")} –{" "}
                      {format(request.endDate, "MMM d, yyyy")} · {request.daysCount} day(s)
                      {request.reason ? ` · ${request.reason}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <ApproveLeaveRequestButton requestId={request.id} />
                    <RejectLeaveRequestButton requestId={request.id} />
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
                <TableHead>Type</TableHead>
                <TableHead>Dates</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resolved.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted">
                    No resolved requests yet.
                  </TableCell>
                </TableRow>
              )}
              {resolved.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium text-powder-100">
                    {request.employee.firstName} {request.employee.lastName}
                  </TableCell>
                  <TableCell className="text-muted">{request.leaveType.name}</TableCell>
                  <TableCell className="text-muted">
                    {format(request.startDate, "MMM d")} – {format(request.endDate, "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="text-muted">{request.daysCount}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_VARIANT[request.status]}>{request.status}</Badge>
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
