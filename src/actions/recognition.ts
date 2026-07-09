"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function giveKudosAction(formData: FormData) {
  const session = await requireSession();

  const toEmployeeId = formData.get("toEmployeeId") as string;
  const badge = formData.get("badge") as string;
  const message = formData.get("message") as string;

  if (!toEmployeeId || !badge || !message) {
    return { error: "Please fill in all fields." };
  }

  // Prevent sending to self if employee profile exists
  if (session.user.employeeId === toEmployeeId) {
    return { error: "You cannot give kudos to yourself." };
  }

  await prisma.recognition.create({
    data: {
      fromUserId: session.user.id,
      toEmployeeId,
      badge,
      message,
    },
  });

  revalidatePath("/recognition");
  return { success: true };
}
