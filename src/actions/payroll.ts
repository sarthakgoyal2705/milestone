"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { writeAuditLog } from "@/lib/audit";
import {
  upsertSalaryStructureSchema,
  generatePayslipSchema,
} from "@/lib/validations/payroll";

export type ActionState = { error?: string; success?: boolean } | undefined;

export async function upsertSalaryStructureAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["ADMIN"]);

  const parsed = upsertSalaryStructureSchema.safeParse({
    employeeId: formData.get("employeeId"),
    baseSalary: formData.get("baseSalary"),
    currency: formData.get("currency") || "USD",
    allowances: formData.get("allowances") || "[]",
    deductions: formData.get("deductions") || "[]",
    effectiveFrom: formData.get("effectiveFrom"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const { employeeId, ...data } = parsed.data;

  await prisma.salaryStructure.upsert({
    where: { employeeId },
    update: data,
    create: { employeeId, ...data },
  });

  await writeAuditLog({
    userId: session.user.id,
    actorName: session.user.name ?? session.user.email ?? "Unknown",
    action: `Updated salary structure`,
    entityType: "SalaryStructure",
    entityId: employeeId,
  });

  revalidatePath("/payroll");
  return { success: true };
}

export async function generatePayslipAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireRole(["ADMIN"]);

  const parsed = generatePayslipSchema.safeParse({
    employeeId: formData.get("employeeId"),
    periodStart: formData.get("periodStart"),
    periodEnd: formData.get("periodEnd"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const structure = await prisma.salaryStructure.findUnique({
    where: { employeeId: parsed.data.employeeId },
    include: { employee: { include: { user: true } } },
  });
  if (!structure) return { error: "No salary structure set for this employee." };

  const allowances = structure.allowances as { label: string; amount: number }[];
  const deductions = structure.deductions as { label: string; amount: number }[];

  const allowanceTotal = allowances.reduce((sum, item) => sum + item.amount, 0);
  const deductionTotal = deductions.reduce((sum, item) => sum + item.amount, 0);
  const baseSalary = Number(structure.baseSalary);
  const grossPay = baseSalary + allowanceTotal;
  const netPay = grossPay - deductionTotal;

  const payslip = await prisma.payslip.create({
    data: {
      employeeId: structure.employeeId,
      periodStart: parsed.data.periodStart,
      periodEnd: parsed.data.periodEnd,
      grossPay,
      netPay,
      breakdown: {
        baseSalary,
        currency: structure.currency,
        allowances,
        deductions,
      },
    },
  });

  await prisma.notification.create({
    data: {
      userId: structure.employee.user.id,
      type: "PAYSLIP_GENERATED",
      title: "New payslip available",
      body: `Your payslip for ${parsed.data.periodStart.toDateString()} – ${parsed.data.periodEnd.toDateString()} is ready.`,
      linkUrl: "/payslips",
    },
  });

  await writeAuditLog({
    userId: session.user.id,
    actorName: session.user.name ?? session.user.email ?? "Unknown",
    action: `Generated payslip for ${structure.employee.firstName} ${structure.employee.lastName}`,
    entityType: "Payslip",
    entityId: payslip.id,
  });

  revalidatePath("/payroll");
  revalidatePath("/payslips");
  return { success: true };
}
