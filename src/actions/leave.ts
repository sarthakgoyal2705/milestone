"use server";

import { revalidatePath } from "next/cache";
import { differenceInCalendarDays } from "date-fns";

import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";
import {
  leaveTypeSchema,
  renameLeaveTypeSchema,
  deleteLeaveTypeSchema,
  allocateBalancesSchema,
  createLeaveRequestSchema,
  leaveRequestIdSchema,
} from "@/lib/validations/leave";

export type ActionState = { error?: string; success?: boolean } | undefined;

function actorName(session: Awaited<ReturnType<typeof requireSession>>) {
  return session.user.name ?? session.user.email ?? "Unknown";
}

export async function createLeaveTypeAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["ADMIN"]);
  const parsed = leaveTypeSchema.safeParse({
    name: formData.get("name"),
    defaultAnnualDays: formData.get("defaultAnnualDays"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const existing = await prisma.leaveType.findUnique({ where: { name: parsed.data.name } });
  if (existing) return { error: "A leave type with this name already exists." };

  await prisma.leaveType.create({ data: parsed.data });

  await writeAuditLog({
    userId: session.user.id,
    actorName: actorName(session),
    action: `Created leave type ${parsed.data.name}`,
    entityType: "LeaveType",
  });

  revalidatePath("/leave/types");
  return { success: true };
}

export async function renameLeaveTypeAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["ADMIN"]);
  const parsed = renameLeaveTypeSchema.safeParse({
    leaveTypeId: formData.get("leaveTypeId"),
    name: formData.get("name"),
    defaultAnnualDays: formData.get("defaultAnnualDays"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const existing = await prisma.leaveType.findUnique({ where: { name: parsed.data.name } });
  if (existing && existing.id !== parsed.data.leaveTypeId) {
    return { error: "A leave type with this name already exists." };
  }

  await prisma.leaveType.update({
    where: { id: parsed.data.leaveTypeId },
    data: { name: parsed.data.name, defaultAnnualDays: parsed.data.defaultAnnualDays },
  });

  revalidatePath("/leave/types");
  return { success: true };
}

export async function deleteLeaveTypeAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["ADMIN"]);
  const parsed = deleteLeaveTypeSchema.safeParse({ leaveTypeId: formData.get("leaveTypeId") });
  if (!parsed.success) return { error: "Invalid input." };

  const usageCount = await prisma.leaveRequest.count({
    where: { leaveTypeId: parsed.data.leaveTypeId },
  });
  if (usageCount > 0) {
    return { error: "This leave type has existing requests and cannot be deleted." };
  }

  await prisma.leaveBalance.deleteMany({ where: { leaveTypeId: parsed.data.leaveTypeId } });
  await prisma.leaveType.delete({ where: { id: parsed.data.leaveTypeId } });

  revalidatePath("/leave/types");
  return { success: true };
}

export async function allocateBalancesAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["ADMIN"]);
  const parsed = allocateBalancesSchema.safeParse({
    leaveTypeId: formData.get("leaveTypeId"),
    year: formData.get("year"),
  });
  if (!parsed.success) return { error: "Invalid input." };

  const leaveType = await prisma.leaveType.findUnique({ where: { id: parsed.data.leaveTypeId } });
  if (!leaveType) return { error: "Leave type not found." };

  const employees = await prisma.employee.findMany({
    where: { status: { not: "TERMINATED" } },
    select: { id: true },
  });

  await prisma.$transaction(
    employees.map((employee) =>
      prisma.leaveBalance.upsert({
        where: {
          employeeId_leaveTypeId_year: {
            employeeId: employee.id,
            leaveTypeId: leaveType.id,
            year: parsed.data.year,
          },
        },
        update: {},
        create: {
          employeeId: employee.id,
          leaveTypeId: leaveType.id,
          year: parsed.data.year,
          allocatedDays: leaveType.defaultAnnualDays,
        },
      })
    )
  );

  await writeAuditLog({
    userId: session.user.id,
    actorName: actorName(session),
    action: `Allocated ${leaveType.name} balances for ${parsed.data.year}`,
    entityType: "LeaveType",
    entityId: leaveType.id,
  });

  revalidatePath("/leave/types");
  revalidatePath("/leave");
  return { success: true };
}

export async function createLeaveRequestAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();
  if (!session.user.employeeId) return { error: "No employee profile linked to this account." };

  const parsed = createLeaveRequestSchema.safeParse({
    leaveTypeId: formData.get("leaveTypeId"),
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate"),
    reason: formData.get("reason") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const daysCount = differenceInCalendarDays(parsed.data.endDate, parsed.data.startDate) + 1;
  const year = parsed.data.startDate.getFullYear();

  const balance = await prisma.leaveBalance.findUnique({
    where: {
      employeeId_leaveTypeId_year: {
        employeeId: session.user.employeeId,
        leaveTypeId: parsed.data.leaveTypeId,
        year,
      },
    },
  });

  const remaining = balance ? balance.allocatedDays - balance.usedDays : 0;
  if (daysCount > remaining) {
    return { error: `Not enough balance. You have ${remaining} day(s) remaining.` };
  }

  const request = await prisma.leaveRequest.create({
    data: {
      employeeId: session.user.employeeId,
      leaveTypeId: parsed.data.leaveTypeId,
      startDate: parsed.data.startDate,
      endDate: parsed.data.endDate,
      daysCount,
      reason: parsed.data.reason,
    },
    include: { employee: { include: { manager: { include: { user: true } } } }, leaveType: true },
  });

  if (request.employee.manager) {
    await prisma.notification.create({
      data: {
        userId: request.employee.manager.user.id,
        type: "LEAVE_REQUEST_SUBMITTED",
        title: "Leave request awaiting approval",
        body: `${request.employee.firstName} ${request.employee.lastName} requested ${daysCount} day(s) of ${request.leaveType.name}.`,
        linkUrl: "/leave/approvals",
      },
    });
  }

  revalidatePath("/leave");
  revalidatePath("/leave/approvals");
  return { success: true };
}

export async function cancelLeaveRequestAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();
  const parsed = leaveRequestIdSchema.safeParse({ requestId: formData.get("requestId") });
  if (!parsed.success) return { error: "Invalid input." };

  const request = await prisma.leaveRequest.findUnique({ where: { id: parsed.data.requestId } });
  if (!request || request.employeeId !== session.user.employeeId) {
    return { error: "Leave request not found." };
  }
  if (request.status !== "PENDING") {
    return { error: "Only pending requests can be cancelled." };
  }

  await prisma.leaveRequest.update({
    where: { id: request.id },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/leave");
  revalidatePath("/leave/approvals");
  return { success: true };
}

async function requireManagerOfEmployee(
  session: Awaited<ReturnType<typeof requireSession>>,
  employeeId: string
) {
  if (session.user.role === "ADMIN") return;
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee || employee.managerId !== session.user.employeeId) {
    throw new Error("You can only act on requests from your direct reports.");
  }
}

export async function approveLeaveRequestAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["MANAGER", "ADMIN"]);
  const parsed = leaveRequestIdSchema.safeParse({ requestId: formData.get("requestId") });
  if (!parsed.success) return { error: "Invalid input." };

  const request = await prisma.leaveRequest.findUnique({
    where: { id: parsed.data.requestId },
    include: { employee: { include: { user: true } }, leaveType: true },
  });
  if (!request) return { error: "Leave request not found." };

  try {
    await requireManagerOfEmployee(session, request.employeeId);
  } catch {
    return { error: "You can only approve requests from your direct reports." };
  }

  if (request.status !== "PENDING") return { error: "This request is no longer pending." };

  const year = request.startDate.getFullYear();

  await prisma.$transaction([
    prisma.leaveRequest.update({
      where: { id: request.id },
      data: { status: "APPROVED", approverId: session.user.employeeId, approvedAt: new Date() },
    }),
    prisma.leaveBalance.update({
      where: {
        employeeId_leaveTypeId_year: {
          employeeId: request.employeeId,
          leaveTypeId: request.leaveTypeId,
          year,
        },
      },
      data: { usedDays: { increment: request.daysCount } },
    }),
  ]);

  await prisma.notification.create({
    data: {
      userId: request.employee.user.id,
      type: "LEAVE_STATUS_CHANGED",
      title: "Leave request approved",
      body: `Your ${request.leaveType.name} request was approved.`,
      linkUrl: "/leave",
    },
  });

  await writeAuditLog({
    userId: session.user.id,
    actorName: actorName(session),
    action: `Approved leave request for ${request.employee.firstName} ${request.employee.lastName}`,
    entityType: "LeaveRequest",
    entityId: request.id,
  });

  revalidatePath("/leave");
  revalidatePath("/leave/approvals");
  return { success: true };
}

export async function rejectLeaveRequestAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["MANAGER", "ADMIN"]);
  const parsed = leaveRequestIdSchema.safeParse({ requestId: formData.get("requestId") });
  if (!parsed.success) return { error: "Invalid input." };

  const request = await prisma.leaveRequest.findUnique({
    where: { id: parsed.data.requestId },
    include: { employee: { include: { user: true } }, leaveType: true },
  });
  if (!request) return { error: "Leave request not found." };

  try {
    await requireManagerOfEmployee(session, request.employeeId);
  } catch {
    return { error: "You can only reject requests from your direct reports." };
  }

  if (request.status !== "PENDING") return { error: "This request is no longer pending." };

  await prisma.leaveRequest.update({
    where: { id: request.id },
    data: { status: "REJECTED", approverId: session.user.employeeId, approvedAt: new Date() },
  });

  await prisma.notification.create({
    data: {
      userId: request.employee.user.id,
      type: "LEAVE_STATUS_CHANGED",
      title: "Leave request rejected",
      body: `Your ${request.leaveType.name} request was rejected.`,
      linkUrl: "/leave",
    },
  });

  await writeAuditLog({
    userId: session.user.id,
    actorName: actorName(session),
    action: `Rejected leave request for ${request.employee.firstName} ${request.employee.lastName}`,
    entityType: "LeaveRequest",
    entityId: request.id,
  });

  revalidatePath("/leave");
  revalidatePath("/leave/approvals");
  return { success: true };
}
