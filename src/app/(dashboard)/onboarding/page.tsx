import Link from "next/link";
import { redirect } from "next/navigation";
import { ListChecks, Settings2 } from "lucide-react";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskChecklistItem } from "@/components/onboarding/task-checklist";

export default async function OnboardingPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!session.user.employeeId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Onboarding
        </h1>
        <Card>
          <CardContent className="py-10 text-center text-muted">
            No employee profile is linked to this account.
          </CardContent>
        </Card>
      </div>
    );
  }

  const tasks = await prisma.onboardingTaskInstance.findMany({
    where: { employeeId: session.user.employeeId },
    include: { taskTemplate: true },
    orderBy: { taskTemplate: { order: "asc" } },
  });

  const completedCount = tasks.filter((t) => t.isComplete).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
            Onboarding
          </h1>
          <p className="mt-1 text-muted">
            {tasks.length > 0
              ? `${completedCount} of ${tasks.length} tasks complete.`
              : "Your onboarding checklist."}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {(session.user.role === "MANAGER" || session.user.role === "ADMIN") && (
            <Button variant="secondary" asChild>
              <Link href="/onboarding/progress">
                <ListChecks className="size-4" />
                Progress
              </Link>
            </Button>
          )}
          {session.user.role === "ADMIN" && (
            <Button variant="secondary" asChild>
              <Link href="/onboarding/templates">
                <Settings2 className="size-4" />
                Templates
              </Link>
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="divide-y divide-hairline pt-6">
          {tasks.length === 0 && (
            <p className="py-10 text-center text-muted">No onboarding tasks assigned.</p>
          )}
          {tasks.map((task) => (
            <TaskChecklistItem key={task.id} instance={task} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
