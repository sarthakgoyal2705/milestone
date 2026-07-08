"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";
import { createEmployeeSchema } from "@/lib/validations/auth";
import {
  updateEmployeeSchema,
  departmentNameSchema,
  renameDepartmentSchema,
  deleteDepartmentSchema,
} from "@/lib/validations/directory";

export type ActionState = { error?: string; success?: boolean } | undefined;

function currentActorName(session: Awaited<ReturnType<typeof requireSession>>) {
  return session.user.name ?? session.user.email ?? "Unknown";
}

export async function createEmployeeAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["ADMIN"]);

  const parsed = createEmployeeSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    jobTitle: formData.get("jobTitle"),
    departmentId: formData.get("departmentId") || null,
    managerId: formData.get("managerId") || null,
    hireDate: formData.get("hireDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { error: "A user with this email already exists." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const employee = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: parsed.data.email,
        passwordHash,
        role: parsed.data.role,
      },
    });

    return tx.employee.create({
      data: {
        userId: user.id,
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        jobTitle: parsed.data.jobTitle,
        departmentId: parsed.data.departmentId || null,
        managerId: parsed.data.managerId || null,
        hireDate: parsed.data.hireDate,
      },
    });
  });

  await writeAuditLog({
    userId: session.user.id,
    actorName: currentActorName(session),
    action: `Added employee ${parsed.data.firstName} ${parsed.data.lastName}`,
    entityType: "Employee",
    entityId: employee.id,
  });

  revalidatePath("/directory");
  revalidatePath("/org-chart");

  return { success: true };
}

export async function updateEmployeeAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["ADMIN"]);

  const parsed = updateEmployeeSchema.safeParse({
    employeeId: formData.get("employeeId"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    jobTitle: formData.get("jobTitle"),
    phone: formData.get("phone") || null,
    role: formData.get("role"),
    status: formData.get("status"),
    departmentId: formData.get("departmentId") || null,
    managerId: formData.get("managerId") || null,
    hireDate: formData.get("hireDate"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  if (parsed.data.managerId === parsed.data.employeeId) {
    return { error: "An employee cannot be their own manager." };
  }

  const target = await prisma.employee.findUnique({ where: { id: parsed.data.employeeId } });
  if (!target) {
    return { error: "Employee not found." };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: target.userId },
      data: { role: parsed.data.role },
    }),
    prisma.employee.update({
      where: { id: parsed.data.employeeId },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        jobTitle: parsed.data.jobTitle,
        phone: parsed.data.phone || null,
        status: parsed.data.status,
        departmentId: parsed.data.departmentId || null,
        managerId: parsed.data.managerId || null,
        hireDate: parsed.data.hireDate,
      },
    }),
  ]);

  await writeAuditLog({
    userId: session.user.id,
    actorName: currentActorName(session),
    action: `Updated employee ${parsed.data.firstName} ${parsed.data.lastName}`,
    entityType: "Employee",
    entityId: parsed.data.employeeId,
  });

  revalidatePath("/directory");
  revalidatePath(`/directory/${parsed.data.employeeId}`);
  revalidatePath("/org-chart");

  return { success: true };
}

export async function createDepartmentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["ADMIN"]);

  const parsed = departmentNameSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.department.findUnique({ where: { name: parsed.data.name } });
  if (existing) {
    return { error: "A department with this name already exists." };
  }

  const department = await prisma.department.create({ data: { name: parsed.data.name } });

  await writeAuditLog({
    userId: session.user.id,
    actorName: currentActorName(session),
    action: `Created department ${parsed.data.name}`,
    entityType: "Department",
    entityId: department.id,
  });

  revalidatePath("/directory/departments");
  revalidatePath("/directory");

  return { success: true };
}

export async function renameDepartmentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["ADMIN"]);

  const parsed = renameDepartmentSchema.safeParse({
    departmentId: formData.get("departmentId"),
    name: formData.get("name"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.department.findUnique({ where: { name: parsed.data.name } });
  if (existing && existing.id !== parsed.data.departmentId) {
    return { error: "A department with this name already exists." };
  }

  await prisma.department.update({
    where: { id: parsed.data.departmentId },
    data: { name: parsed.data.name },
  });

  await writeAuditLog({
    userId: session.user.id,
    actorName: currentActorName(session),
    action: `Renamed department to ${parsed.data.name}`,
    entityType: "Department",
    entityId: parsed.data.departmentId,
  });

  revalidatePath("/directory/departments");
  revalidatePath("/directory");

  return { success: true };
}

export async function deleteDepartmentAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["ADMIN"]);

  const parsed = deleteDepartmentSchema.safeParse({
    departmentId: formData.get("departmentId"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const memberCount = await prisma.employee.count({
    where: { departmentId: parsed.data.departmentId },
  });
  if (memberCount > 0) {
    return { error: "Reassign or remove all employees from this department first." };
  }

  const department = await prisma.department.delete({
    where: { id: parsed.data.departmentId },
  });

  await writeAuditLog({
    userId: session.user.id,
    actorName: currentActorName(session),
    action: `Deleted department ${department.name}`,
    entityType: "Department",
    entityId: department.id,
  });

  revalidatePath("/directory/departments");
  revalidatePath("/directory");

  return { success: true };
}
