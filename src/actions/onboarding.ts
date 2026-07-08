"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/rbac";
import {
  createTemplateSchema,
  addTaskSchema,
  deleteTaskSchema,
  toggleTaskInstanceSchema,
} from "@/lib/validations/onboarding";

export type ActionState = { error?: string; success?: boolean } | undefined;

export async function createTemplateAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["ADMIN"]);
  const parsed = createTemplateSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await prisma.onboardingTemplate.create({ data: { name: parsed.data.name } });

  revalidatePath("/onboarding/templates");
  return { success: true };
}

export async function addTaskAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["ADMIN"]);
  const parsed = addTaskSchema.safeParse({
    templateId: formData.get("templateId"),
    title: formData.get("title"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const last = await prisma.onboardingTaskTemplate.findFirst({
    where: { templateId: parsed.data.templateId },
    orderBy: { order: "desc" },
  });

  await prisma.onboardingTaskTemplate.create({
    data: {
      templateId: parsed.data.templateId,
      title: parsed.data.title,
      order: (last?.order ?? -1) + 1,
    },
  });

  revalidatePath("/onboarding/templates");
  return { success: true };
}

export async function deleteTaskAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["ADMIN"]);
  const parsed = deleteTaskSchema.safeParse({ taskId: formData.get("taskId") });
  if (!parsed.success) return { error: "Invalid input." };

  await prisma.onboardingTaskTemplate.delete({ where: { id: parsed.data.taskId } });

  revalidatePath("/onboarding/templates");
  return { success: true };
}

export async function toggleTaskInstanceAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();
  const parsed = toggleTaskInstanceSchema.safeParse({
    instanceId: formData.get("instanceId"),
    isComplete: formData.get("isComplete"),
  });
  if (!parsed.success) return { error: "Invalid input." };

  const instance = await prisma.onboardingTaskInstance.findUnique({
    where: { id: parsed.data.instanceId },
  });
  if (!instance) return { error: "Task not found." };

  const isOwner = instance.employeeId === session.user.employeeId;
  const isPrivileged = session.user.role === "ADMIN" || session.user.role === "MANAGER";
  if (!isOwner && !isPrivileged) return { error: "You cannot update this task." };

  await prisma.onboardingTaskInstance.update({
    where: { id: instance.id },
    data: {
      isComplete: parsed.data.isComplete,
      completedAt: parsed.data.isComplete ? new Date() : null,
    },
  });

  revalidatePath("/onboarding");
  revalidatePath("/onboarding/progress");
  return { success: true };
}
