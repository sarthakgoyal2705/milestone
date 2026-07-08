"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";
import { clockOutSchema } from "@/lib/validations/attendance";

export type ActionState = { error?: string; success?: boolean } | undefined;

export async function clockInAction(): Promise<ActionState> {
  const session = await requireSession();
  if (!session.user.employeeId) return { error: "No employee profile linked to this account." };

  const openEntry = await prisma.attendanceEntry.findFirst({
    where: { employeeId: session.user.employeeId, clockOut: null },
  });
  if (openEntry) return { error: "You're already clocked in." };

  await prisma.attendanceEntry.create({
    data: { employeeId: session.user.employeeId, clockIn: new Date() },
  });

  revalidatePath("/attendance");
  return { success: true };
}

export async function clockOutAction(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await requireSession();
  const parsed = clockOutSchema.safeParse({
    entryId: formData.get("entryId"),
    notes: formData.get("notes") || undefined,
  });
  if (!parsed.success) return { error: "Invalid input." };

  const entry = await prisma.attendanceEntry.findUnique({ where: { id: parsed.data.entryId } });
  if (!entry || entry.employeeId !== session.user.employeeId) {
    return { error: "Attendance entry not found." };
  }
  if (entry.clockOut) return { error: "This entry is already clocked out." };

  const clockOut = new Date();
  const totalMinutes = Math.round((clockOut.getTime() - entry.clockIn.getTime()) / 60000);

  await prisma.attendanceEntry.update({
    where: { id: entry.id },
    data: { clockOut, totalMinutes, notes: parsed.data.notes },
  });

  revalidatePath("/attendance");
  return { success: true };
}
