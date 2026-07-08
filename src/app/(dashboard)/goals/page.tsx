import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GoalFormDialog } from "@/components/goals/goal-form-dialog";
import { SubmitGoalButton, DeleteGoalButton } from "@/components/goals/goal-actions";
import { CheckInDialog } from "@/components/goals/check-in-dialog";
import type { GoalStatus } from "@/generated/prisma/enums";

const STATUS_VARIANT: Record<GoalStatus, "neutral" | "warning" | "success" | "danger"> = {
  DRAFT: "neutral",
  PENDING_APPROVAL: "warning",
  APPROVED: "success",
  RETURNED: "danger",
};

export default async function GoalsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const activeCycle = await prisma.reviewCycle.findFirst({ where: { isActive: true } });
  const isGoalSettingPhase = activeCycle?.order === 0;

  if (!session.user.employeeId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Goals
        </h1>
        <Card>
          <CardContent className="py-10 text-center text-muted">
            No employee profile is linked to this account.
          </CardContent>
        </Card>
      </div>
    );
  }

  const goals = await prisma.goal.findMany({
    where: { employeeId: session.user.employeeId },
    include: { checkIns: { include: { cycle: true }, orderBy: { cycle: { order: "asc" } } } },
    orderBy: { createdAt: "asc" },
  });

  const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
            My Goals
          </h1>
          <p className="mt-1 flex items-center gap-2 text-muted">
            {activeCycle ? (
              <>
                Active cycle: <Badge variant="teal">{activeCycle.name}</Badge>
              </>
            ) : (
              "No active review cycle."
            )}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {goals.length > 0 && (
            <Badge variant={totalWeightage === 100 ? "success" : "warning"}>
              {totalWeightage}% weighted
            </Badge>
          )}
          {isGoalSettingPhase && <GoalFormDialog />}
        </div>
      </div>

      {goals.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted">
            {isGoalSettingPhase
              ? "You haven't set any goals for this cycle yet."
              : "No goals were set for this cycle."}
          </CardContent>
        </Card>
      )}

      <div className="flex flex-col gap-4">
        {goals.map((goal) => {
          const checkInForActiveCycle = activeCycle
            ? goal.checkIns.find((c) => c.cycleId === activeCycle.id)
            : undefined;
          const canEdit =
            isGoalSettingPhase && (goal.status === "DRAFT" || goal.status === "RETURNED");
          const canCheckIn =
            !isGoalSettingPhase && goal.status === "APPROVED" && activeCycle !== null;

          return (
            <Card key={goal.id}>
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      {goal.thrustArea}
                    </p>
                    <h3 className="font-display text-lg font-semibold text-powder-100">
                      {goal.title}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2">
                    {goal.isManagerDeployed && <Badge variant="rust">Manager-deployed</Badge>}
                    <Badge variant={STATUS_VARIANT[goal.status]}>
                      {goal.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                <p className="text-sm text-muted">{goal.description}</p>

                <div className="flex flex-wrap gap-6 text-sm">
                  <div>
                    <span className="text-muted">Target: </span>
                    <span className="text-powder-100">{goal.target}</span>
                  </div>
                  <div>
                    <span className="text-muted">UOM: </span>
                    <span className="text-powder-100">{goal.uom}</span>
                  </div>
                  <div>
                    <span className="text-muted">Weightage: </span>
                    <span className="text-powder-100">{goal.weightage}%</span>
                  </div>
                </div>

                {goal.checkIns.length > 0 && (
                  <div className="mt-2 flex flex-col gap-2 border-t border-hairline pt-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                      Check-ins
                    </p>
                    {goal.checkIns.map((checkIn) => (
                      <div key={checkIn.id} className="flex items-start justify-between text-sm">
                        <div>
                          <span className="font-medium text-powder-100">
                            {checkIn.cycle.name}:
                          </span>{" "}
                          <span className="text-muted">{checkIn.actual}</span>
                        </div>
                        {checkIn.score !== null && (
                          <Badge variant="neutral">{checkIn.score}/10</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {(canEdit || canCheckIn) && (
                  <div className="flex items-center gap-2 border-t border-hairline pt-3">
                    {canEdit && (
                      <>
                        <GoalFormDialog goal={goal} />
                        {(goal.status === "DRAFT" || goal.status === "RETURNED") && (
                          <SubmitGoalButton goalId={goal.id} />
                        )}
                        {goal.status === "DRAFT" && <DeleteGoalButton goalId={goal.id} />}
                      </>
                    )}
                    {canCheckIn && activeCycle && (
                      <CheckInDialog
                        goalId={goal.id}
                        goalTitle={goal.title}
                        cycleName={activeCycle.name}
                        existing={
                          checkInForActiveCycle
                            ? {
                                actual: checkInForActiveCycle.actual,
                                score: checkInForActiveCycle.score,
                              }
                            : undefined
                        }
                      />
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
