"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";
import {
  createJobPostingSchema,
  toggleJobPostingSchema,
  createCandidateSchema,
  advanceCandidateSchema,
  hireCandidateSchema,
} from "@/lib/validations/recruitment";

export type ActionState = { error?: string; success?: boolean } | undefined;

function actorName(session: { user: { name?: string | null; email?: string | null } }) {
  return session.user.name ?? session.user.email ?? "Unknown";
}

export async function createJobPostingAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["MANAGER", "ADMIN"]);

  const parsed = createJobPostingSchema.safeParse({
    title: formData.get("title"),
    departmentId: formData.get("departmentId") || null,
    description: formData.get("description"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  await prisma.jobPosting.create({
    data: { ...parsed.data, createdById: session.user.id },
  });

  revalidatePath("/recruitment");
  return { success: true };
}

export async function toggleJobPostingAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["MANAGER", "ADMIN"]);
  const parsed = toggleJobPostingSchema.safeParse({
    jobPostingId: formData.get("jobPostingId"),
    isOpen: formData.get("isOpen"),
  });
  if (!parsed.success) return { error: "Invalid input." };

  await prisma.jobPosting.update({
    where: { id: parsed.data.jobPostingId },
    data: { isOpen: parsed.data.isOpen },
  });

  revalidatePath("/recruitment");
  return { success: true };
}

export async function createCandidateAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  await requireRole(["MANAGER", "ADMIN"]);

  const parsed = createCandidateSchema.safeParse({
    jobPostingId: formData.get("jobPostingId"),
    name: formData.get("name"),
    email: formData.get("email"),
    resumeUrl: formData.get("resumeUrl") || "",
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { resumeUrl, ...rest } = parsed.data;
  await prisma.candidate.create({
    data: { ...rest, resumeUrl: resumeUrl || null },
  });

  revalidatePath(`/recruitment/${parsed.data.jobPostingId}`);
  return { success: true };
}

export async function advanceCandidateAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["MANAGER", "ADMIN"]);
  const parsed = advanceCandidateSchema.safeParse({
    candidateId: formData.get("candidateId"),
    stage: formData.get("stage"),
  });
  if (!parsed.success) return { error: "Invalid input." };

  const candidate = await prisma.candidate.findUnique({ where: { id: parsed.data.candidateId } });
  if (!candidate) return { error: "Candidate not found." };
  if (candidate.stage === "HIRED") return { error: "This candidate has already been hired." };

  await prisma.candidate.update({
    where: { id: candidate.id },
    data: { stage: parsed.data.stage },
  });

  await writeAuditLog({
    userId: session.user.id,
    actorName: actorName(session),
    action: `Moved candidate ${candidate.name} to ${parsed.data.stage}`,
    entityType: "Candidate",
    entityId: candidate.id,
  });

  revalidatePath(`/recruitment/${candidate.jobPostingId}`);
  return { success: true };
}

export async function hireCandidateAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["MANAGER", "ADMIN"]);

  const parsed = hireCandidateSchema.safeParse({
    candidateId: formData.get("candidateId"),
    email: formData.get("email"),
    password: formData.get("password"),
    jobTitle: formData.get("jobTitle"),
    departmentId: formData.get("departmentId") || null,
    managerId: formData.get("managerId") || null,
    hireDate: formData.get("hireDate"),
    onboardingTemplateId: formData.get("onboardingTemplateId") || null,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const candidate = await prisma.candidate.findUnique({ where: { id: parsed.data.candidateId } });
  if (!candidate) return { error: "Candidate not found." };
  if (candidate.stage === "HIRED") return { error: "This candidate has already been hired." };

  const existingUser = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existingUser) return { error: "A user with this email already exists." };

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const { employee, userId } = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: { email: parsed.data.email, passwordHash, role: "EMPLOYEE" },
    });

    const newEmployee = await tx.employee.create({
      data: {
        userId: user.id,
        firstName: candidate.name.split(" ")[0] || candidate.name,
        lastName: candidate.name.split(" ").slice(1).join(" ") || "-",
        jobTitle: parsed.data.jobTitle,
        departmentId: parsed.data.departmentId || null,
        managerId: parsed.data.managerId || null,
        hireDate: parsed.data.hireDate,
      },
    });

    await tx.candidate.update({
      where: { id: candidate.id },
      data: { stage: "HIRED", hiredEmployeeId: newEmployee.id },
    });

    if (parsed.data.onboardingTemplateId) {
      const tasks = await tx.onboardingTaskTemplate.findMany({
        where: { templateId: parsed.data.onboardingTemplateId },
      });
      if (tasks.length > 0) {
        await tx.onboardingTaskInstance.createMany({
          data: tasks.map((task) => ({
            employeeId: newEmployee.id,
            taskTemplateId: task.id,
          })),
        });
      }
    }

    return { employee: newEmployee, userId: user.id };
  });

  if (parsed.data.onboardingTemplateId) {
    await prisma.notification.create({
      data: {
        userId,
        type: "ONBOARDING_TASK_ASSIGNED",
        title: "Welcome to Milestone!",
        body: "Your onboarding checklist is ready.",
        linkUrl: "/onboarding",
      },
    });
  }

  await writeAuditLog({
    userId: session.user.id,
    actorName: actorName(session),
    action: `Hired ${candidate.name} as ${parsed.data.jobTitle}`,
    entityType: "Employee",
    entityId: employee.id,
  });

  revalidatePath(`/recruitment/${candidate.jobPostingId}`);
  revalidatePath("/directory");
  return { success: true };
}
