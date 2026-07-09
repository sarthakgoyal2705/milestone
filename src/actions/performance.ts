"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/rbac";
import { revalidatePath } from "next/cache";

export async function submitReviewAction(formData: FormData) {
  const session = await requireSession();

  const employeeId = formData.get("employeeId") as string;
  const cycleId = formData.get("cycleId") as string;
  const type = formData.get("type") as "SELF" | "MANAGER" | "PEER";
  
  const ratingStr = formData.get("rating") as string;
  const rating = ratingStr ? parseInt(ratingStr, 10) : null;
  const strengths = formData.get("strengths") as string;
  const improvements = formData.get("improvements") as string;
  const comments = formData.get("comments") as string;

  if (!employeeId || !cycleId || !type) {
    return { error: "Missing required fields." };
  }

  // Prevent multiple reviews of the same type by the same reviewer for the same cycle
  const existing = await prisma.performanceReview.findUnique({
    where: {
      employeeId_reviewerId_cycleId: {
        employeeId,
        reviewerId: session.user.employeeId!,
        cycleId,
      }
    }
  });

  if (existing) {
    return { error: "You have already submitted a review for this employee in this cycle." };
  }

  await prisma.performanceReview.create({
    data: {
      employeeId,
      reviewerId: session.user.employeeId!,
      cycleId,
      type,
      rating,
      strengths,
      improvements,
      comments,
      submittedAt: new Date(),
    }
  });

  revalidatePath("/performance");
  return { success: true };
}
