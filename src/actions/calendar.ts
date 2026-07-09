"use server";

import { prisma } from "@/lib/prisma";
import { requireRole, requireSession } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function getCalendarDataAction(monthStart: Date, monthEnd: Date) {
  await requireSession();

  const [holidays, leaveRequests, employees] = await Promise.all([
    prisma.holiday.findMany({
      where: {
        date: { gte: monthStart, lte: monthEnd },
      },
    }),
    prisma.leaveRequest.findMany({
      where: {
        status: "APPROVED",
        startDate: { lte: monthEnd },
        endDate: { gte: monthStart },
      },
      include: { employee: true, leaveType: true },
    }),
    prisma.employee.findMany({
      where: { status: "ACTIVE" },
      select: { id: true, firstName: true, lastName: true, hireDate: true },
    }),
  ]);

  return { holidays, leaveRequests, employees };
}

export async function createHolidayAction(formData: FormData) {
  await requireRole(["ADMIN"]);

  const name = formData.get("name") as string;
  const dateStr = formData.get("date") as string;
  const region = formData.get("region") as string;

  if (!name || !dateStr) return { error: "Name and date are required." };

  await prisma.holiday.create({
    data: {
      name,
      date: new Date(dateStr),
      region: region || null,
    },
  });

  revalidatePath("/calendar");
  return { success: true };
}

export async function deleteHolidayAction(id: string) {
  await requireRole(["ADMIN"]);
  
  await prisma.holiday.delete({ where: { id } });
  
  revalidatePath("/calendar");
  return { success: true };
}
