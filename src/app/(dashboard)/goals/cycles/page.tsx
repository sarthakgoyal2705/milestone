import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CycleManager } from "@/components/goals/cycle-manager";

export default async function ReviewCyclesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/goals");

  const cycles = await prisma.reviewCycle.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Review Cycles
        </h1>
        <p className="mt-1 text-muted">
          Only one cycle is active at a time. Activating a cycle advances the whole company.
        </p>
      </div>

      <CycleManager cycles={cycles} />
    </div>
  );
}
