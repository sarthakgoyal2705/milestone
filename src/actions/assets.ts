"use server";

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function addAssetAction(formData: FormData) {
  await requireRole(["ADMIN"]);

  const name = formData.get("name") as string;
  const type = formData.get("type") as "LAPTOP" | "PHONE" | "MONITOR" | "BADGE" | "KEY" | "OTHER";
  const serialNumber = formData.get("serialNumber") as string;
  const status = formData.get("status") as "AVAILABLE" | "ASSIGNED" | "MAINTENANCE" | "RETIRED";
  const assignedToId = formData.get("assignedToId") as string;
  const notes = formData.get("notes") as string;

  if (!name || !type) {
    return { error: "Name and type are required." };
  }

  try {
    await prisma.asset.create({
      data: {
        name,
        type,
        serialNumber: serialNumber || null,
        status,
        assignedToId: assignedToId || null,
        assignedAt: assignedToId ? new Date() : null,
        notes: notes || null,
      },
    });

    revalidatePath("/assets");
    return { success: true };
  } catch (err: any) {
    if (err.code === "P2002") {
      return { error: "An asset with this serial number already exists." };
    }
    return { error: "Failed to add asset." };
  }
}

export async function updateAssetStatusAction(id: string, status: string, assignedToId: string | null) {
  await requireRole(["ADMIN"]);

  const data: any = { status };
  
  if (status === "ASSIGNED" && assignedToId) {
    data.assignedToId = assignedToId;
    data.assignedAt = new Date();
  } else if (status !== "ASSIGNED") {
    data.assignedToId = null;
    data.assignedAt = null;
  }

  await prisma.asset.update({
    where: { id },
    data,
  });

  revalidatePath("/assets");
  return { success: true };
}
