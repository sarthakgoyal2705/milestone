"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";
import {
  createGoalSchema,
  updateGoalSchema,
  goalIdSchema,
  deployGoalSchema,
  checkInSchema,
  createCycleSchema,
  activateCycleSchema,
} from "@/lib/validations/goals";

export type ActionState = { error?: string; success?: boolean } | undefined;

function actorName(session: Awaited<ReturnType<typeof requireSession>>) {
  return session.user.name ?? session.user.email ?? "Unknown";
}

async function notify(params: {
  userId: string;
  type:
    | "GOAL_APPROVAL_NEEDED"
    | "GOAL_STATUS_CHANGED"
    | "LEAVE_REQUEST_SUBMITTED"
    | "LEAVE_STATUS_CHANGED"
    | "ONBOARDING_TASK_ASSIGNED"
    | "DOCUMENT_UPLOADED"
    | "PAYSLIP_GENERATED"
    | "GENERAL";
  title: string;
  body: string;
  linkUrl?: string;
}) {
  await prisma.notification.create({ data: params });
}

async function getActiveCycle() {
  const cycle = await prisma.reviewCycle.findFirst({ where: { isActive: true } });
  return cycle;
}

export async function createGoalAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();
  if (!session.user.employeeId) return { error: "No employee profile linked to this account." };

  const parsed = createGoalSchema.safeParse({
    thrustArea: formData.get("thrustArea"),
    title: formData.get("title"),
    description: formData.get("description"),
    target: formData.get("target"),
    uom: formData.get("uom"),
    weightage: formData.get("weightage"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const cycle = await getActiveCycle();
  if (!cycle || cycle.order !== 0) {
    return { error: "Goal setting is only open during the goal-setting cycle." };
  }

  await prisma.goal.create({
    data: {
      employeeId: session.user.employeeId,
      cycleId: cycle.id,
      ...parsed.data,
      status: "DRAFT",
    },
  });

  revalidatePath("/goals");
  return { success: true };
}

export async function updateGoalAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();
  const parsed = updateGoalSchema.safeParse({
    goalId: formData.get("goalId"),
    thrustArea: formData.get("thrustArea"),
    title: formData.get("title"),
    description: formData.get("description"),
    target: formData.get("target"),
    uom: formData.get("uom"),
    weightage: formData.get("weightage"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const goal = await prisma.goal.findUnique({ where: { id: parsed.data.goalId } });
  if (!goal || goal.employeeId !== session.user.employeeId) {
    return { error: "Goal not found." };
  }
  if (goal.status !== "DRAFT" && goal.status !== "RETURNED") {
    return { error: "Only draft or returned goals can be edited." };
  }

  const { goalId, ...data } = parsed.data;
  await prisma.goal.update({
    where: { id: goalId },
    data: { ...data, status: "DRAFT" },
  });

  revalidatePath("/goals");
  return { success: true };
}

export async function deleteGoalAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();
  const parsed = goalIdSchema.safeParse({ goalId: formData.get("goalId") });
  if (!parsed.success) return { error: "Invalid input." };

  const goal = await prisma.goal.findUnique({ where: { id: parsed.data.goalId } });
  if (!goal || goal.employeeId !== session.user.employeeId) {
    return { error: "Goal not found." };
  }
  if (goal.status !== "DRAFT") {
    return { error: "Only draft goals can be deleted." };
  }

  await prisma.goal.delete({ where: { id: goal.id } });
  revalidatePath("/goals");
  return { success: true };
}

export async function submitGoalAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();
  const parsed = goalIdSchema.safeParse({ goalId: formData.get("goalId") });
  if (!parsed.success) return { error: "Invalid input." };

  const goal = await prisma.goal.findUnique({
    where: { id: parsed.data.goalId },
    include: { employee: { include: { manager: { include: { user: true } } } } },
  });
  if (!goal || goal.employeeId !== session.user.employeeId) {
    return { error: "Goal not found." };
  }
  if (goal.status !== "DRAFT" && goal.status !== "RETURNED") {
    return { error: "This goal has already been submitted." };
  }

  await prisma.goal.update({ where: { id: goal.id }, data: { status: "PENDING_APPROVAL" } });

  if (goal.employee.manager) {
    await notify({
      userId: goal.employee.manager.user.id,
      type: "GOAL_APPROVAL_NEEDED",
      title: "Goal awaiting approval",
      body: `${goal.employee.firstName} ${goal.employee.lastName} submitted "${goal.title}" for approval.`,
      linkUrl: "/goals/team",
    });
  }

  revalidatePath("/goals");
  revalidatePath("/goals/team");
  return { success: true };
}

async function requireManagerOf(
  session: Awaited<ReturnType<typeof requireSession>>,
  employeeId: string
) {
  if (session.user.role === "ADMIN") return;
  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (!employee || employee.managerId !== session.user.employeeId) {
    throw new Error("You can only manage goals for your direct reports.");
  }
}

export async function approveGoalAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["MANAGER", "ADMIN"]);
  const parsed = goalIdSchema.safeParse({ goalId: formData.get("goalId") });
  if (!parsed.success) return { error: "Invalid input." };

  const goal = await prisma.goal.findUnique({
    where: { id: parsed.data.goalId },
    include: { employee: { include: { user: true } } },
  });
  if (!goal) return { error: "Goal not found." };

  try {
    await requireManagerOf(session, goal.employeeId);
  } catch {
    return { error: "You can only approve goals for your direct reports." };
  }

  if (goal.status !== "PENDING_APPROVAL") {
    return { error: "Only pending goals can be approved." };
  }

  await prisma.goal.update({ where: { id: goal.id }, data: { status: "APPROVED" } });

  await notify({
    userId: goal.employee.user.id,
    type: "GOAL_STATUS_CHANGED",
    title: "Goal approved",
    body: `Your goal "${goal.title}" was approved.`,
    linkUrl: "/goals",
  });

  await writeAuditLog({
    userId: session.user.id,
    actorName: actorName(session),
    action: `Approved goal "${goal.title}"`,
    entityType: "Goal",
    entityId: goal.id,
  });

  revalidatePath("/goals");
  revalidatePath("/goals/team");
  return { success: true };
}

export async function returnGoalAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["MANAGER", "ADMIN"]);
  const parsed = goalIdSchema.safeParse({ goalId: formData.get("goalId") });
  if (!parsed.success) return { error: "Invalid input." };

  const goal = await prisma.goal.findUnique({
    where: { id: parsed.data.goalId },
    include: { employee: { include: { user: true } } },
  });
  if (!goal) return { error: "Goal not found." };

  try {
    await requireManagerOf(session, goal.employeeId);
  } catch {
    return { error: "You can only return goals for your direct reports." };
  }

  if (goal.status !== "PENDING_APPROVAL") {
    return { error: "Only pending goals can be returned." };
  }

  await prisma.goal.update({ where: { id: goal.id }, data: { status: "RETURNED" } });

  await notify({
    userId: goal.employee.user.id,
    type: "GOAL_STATUS_CHANGED",
    title: "Goal returned",
    body: `Your goal "${goal.title}" was returned for changes.`,
    linkUrl: "/goals",
  });

  await writeAuditLog({
    userId: session.user.id,
    actorName: actorName(session),
    action: `Returned goal "${goal.title}"`,
    entityType: "Goal",
    entityId: goal.id,
  });

  revalidatePath("/goals");
  revalidatePath("/goals/team");
  return { success: true };
}

export async function deployGoalAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["MANAGER", "ADMIN"]);

  const parsed = deployGoalSchema.safeParse({
    employeeId: formData.get("employeeId"),
    thrustArea: formData.get("thrustArea"),
    title: formData.get("title"),
    description: formData.get("description"),
    target: formData.get("target"),
    uom: formData.get("uom"),
    weightage: formData.get("weightage"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  try {
    await requireManagerOf(session, parsed.data.employeeId);
  } catch {
    return { error: "You can only deploy goals for your direct reports." };
  }

  const cycle = await getActiveCycle();
  if (!cycle) return { error: "No active review cycle." };

  const { employeeId, ...data } = parsed.data;
  const goal = await prisma.goal.create({
    data: {
      employeeId,
      cycleId: cycle.id,
      ...data,
      status: "APPROVED",
      isManagerDeployed: true,
    },
  });

  const employee = await prisma.employee.findUnique({ where: { id: employeeId } });
  if (employee) {
    await notify({
      userId: employee.userId,
      type: "GOAL_STATUS_CHANGED",
      title: "New goal assigned",
      body: `Your manager assigned you a new goal: "${goal.title}".`,
      linkUrl: "/goals",
    });
  }

  revalidatePath("/goals");
  revalidatePath("/goals/team");
  return { success: true };
}

export async function upsertCheckInAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();

  const parsed = checkInSchema.safeParse({
    goalId: formData.get("goalId"),
    actual: formData.get("actual"),
    score: formData.get("score") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const goal = await prisma.goal.findUnique({ where: { id: parsed.data.goalId } });
  if (!goal) return { error: "Goal not found." };

  const isOwner = goal.employeeId === session.user.employeeId;
  if (!isOwner) {
    try {
      await requireManagerOf(session, goal.employeeId);
    } catch {
      return { error: "You cannot check in on this goal." };
    }
  }

  if (goal.status !== "APPROVED") {
    return { error: "Only approved goals can receive check-ins." };
  }

  const cycle = await getActiveCycle();
  if (!cycle || cycle.order === 0) {
    return { error: "Check-ins are only open during a check-in cycle." };
  }

  await prisma.goalCheckIn.upsert({
    where: { goalId_cycleId: { goalId: goal.id, cycleId: cycle.id } },
    update: { actual: parsed.data.actual, score: parsed.data.score },
    create: {
      goalId: goal.id,
      cycleId: cycle.id,
      actual: parsed.data.actual,
      score: parsed.data.score,
    },
  });

  revalidatePath("/goals");
  revalidatePath("/goals/team");
  return { success: true };
}

export async function createCycleAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["ADMIN"]);
  const parsed = createCycleSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const existing = await prisma.reviewCycle.findUnique({ where: { name: parsed.data.name } });
  if (existing) return { error: "A cycle with this name already exists." };

  const last = await prisma.reviewCycle.findFirst({ orderBy: { order: "desc" } });
  await prisma.reviewCycle.create({
    data: { name: parsed.data.name, order: (last?.order ?? -1) + 1 },
  });

  await writeAuditLog({
    userId: session.user.id,
    actorName: actorName(session),
    action: `Created review cycle ${parsed.data.name}`,
    entityType: "ReviewCycle",
  });

  revalidatePath("/goals/cycles");
  return { success: true };
}

export async function activateCycleAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["ADMIN"]);
  const parsed = activateCycleSchema.safeParse({ cycleId: formData.get("cycleId") });
  if (!parsed.success) return { error: "Invalid input." };

  const cycle = await prisma.reviewCycle.findUnique({ where: { id: parsed.data.cycleId } });
  if (!cycle) return { error: "Cycle not found." };

  await prisma.$transaction([
    prisma.reviewCycle.updateMany({ where: { isActive: true }, data: { isActive: false } }),
    prisma.reviewCycle.update({ where: { id: cycle.id }, data: { isActive: true } }),
  ]);

  await writeAuditLog({
    userId: session.user.id,
    actorName: actorName(session),
    action: `Activated review cycle ${cycle.name}`,
    entityType: "ReviewCycle",
    entityId: cycle.id,
  });

  revalidatePath("/goals/cycles");
  revalidatePath("/goals");
  revalidatePath("/goals/team");
  return { success: true };
}
