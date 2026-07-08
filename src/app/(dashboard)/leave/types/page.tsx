import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LeaveTypeManager } from "@/components/leave/leave-type-manager";

export default async function LeaveTypesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/leave");

  const leaveTypes = await prisma.leaveType.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Leave Types
        </h1>
        <p className="mt-1 text-muted">
          Manage leave types and allocate this year&apos;s balances for all active employees.
        </p>
      </div>

      <LeaveTypeManager leaveTypes={leaveTypes} />
    </div>
  );
}
