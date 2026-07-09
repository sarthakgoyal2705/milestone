"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function logTimeAction(formData: FormData) {
  const session = await requireSession();

  const dateStr = formData.get("date") as string;
  const project = formData.get("project") as string;
  const hoursStr = formData.get("hours") as string;
  const description = formData.get("description") as string;

  if (!dateStr || !project || !hoursStr) {
    return { error: "Please fill in all required fields." };
  }

  const hours = parseFloat(hoursStr);
  if (isNaN(hours) || hours <= 0 || hours > 24) {
    return { error: "Please enter a valid number of hours between 0 and 24." };
  }

  await prisma.timesheetEntry.create({
    data: {
      employeeId: session.user.employeeId!,
      date: new Date(dateStr),
      project,
      hours,
      description,
    },
  });

  revalidatePath("/timesheets");
  return { success: true };
}

export async function deleteTimesheetEntryAction(id: string) {
  const session = await requireSession();

  const entry = await prisma.timesheetEntry.findUnique({
    where: { id },
  });

  if (!entry || entry.employeeId !== session.user.employeeId) {
    return { error: "Entry not found or unauthorized." };
  }

  await prisma.timesheetEntry.delete({
    where: { id },
  });

  revalidatePath("/timesheets");
  return { success: true };
}
