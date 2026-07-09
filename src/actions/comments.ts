"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function addCommentAction(
  entityType: string,
  entityId: string,
  body: string
) {
  const session = await requireSession();

  if (!body.trim()) {
    return { error: "Comment cannot be empty." };
  }

  await prisma.comment.create({
    data: {
      userId: session.user.id,
      entityType,
      entityId,
      body: body.trim(),
    },
  });

  // Revalidate the paths that might show this comment thread
  if (entityType === "goal") revalidatePath(`/goals/${entityId}`);
  if (entityType === "candidate") revalidatePath(`/recruitment/${entityId}`); // Assumes recruitment path is somewhat like this
  
  return { success: true };
}
