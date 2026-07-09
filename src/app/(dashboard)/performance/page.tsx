import { redirect } from "next/navigation";
import { format } from "date-fns";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ReviewFormDialog } from "@/components/performance/review-form-dialog";

export default async function PerformancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (!session.user.employeeId) {
    return (
      <div className="flex flex-col gap-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
          Performance
        </h1>
        <Card>
          <CardContent className="py-10 text-center text-muted">
            No employee profile is linked to this account.
          </CardContent>
        </Card>
      </div>
    );
  }

  // Fetch active cycle
  const activeCycle = await prisma.reviewCycle.findFirst({
    where: { isActive: true },
  });

  // Fetch user's direct reports if any
  const employee = await prisma.employee.findUnique({
    where: { id: session.user.employeeId },
    include: { directReports: { select: { id: true, firstName: true, lastName: true } } },
  });

  // Fetch all reviews (given and received)
  const reviews = await prisma.performanceReview.findMany({
    where: {
      OR: [
        { employeeId: session.user.employeeId }, // Received
        { reviewerId: session.user.employeeId }  // Given
      ]
    },
    include: {
      cycle: true,
      employee: { select: { firstName: true, lastName: true } },
      reviewer: { select: { firstName: true, lastName: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Helper flags
  const selfReviewSubmitted = activeCycle 
    ? reviews.some(r => r.cycleId === activeCycle.id && r.type === "SELF" && r.employeeId === session.user.employeeId)
    : false;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
            Performance Reviews
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
      </div>

      {activeCycle && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardContent className="flex flex-col gap-4 pt-6">
              <div>
                <h3 className="font-display text-lg font-semibold text-powder-100">Self Evaluation</h3>
                <p className="text-sm text-muted">Reflect on your achievements and areas for growth this cycle.</p>
              </div>
              <div>
                {selfReviewSubmitted ? (
                  <Badge variant="success">Submitted</Badge>
                ) : (
                  <ReviewFormDialog 
                    employeeId={session.user.employeeId}
                    employeeName={`${employee?.firstName} ${employee?.lastName}`}
                    cycleId={activeCycle.id}
                    cycleName={activeCycle.name}
                    type="SELF"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {employee?.directReports && employee.directReports.length > 0 && (
            <Card>
              <CardContent className="flex flex-col gap-4 pt-6">
                <div>
                  <h3 className="font-display text-lg font-semibold text-powder-100">Team Reviews</h3>
                  <p className="text-sm text-muted">Evaluate your direct reports for the current cycle.</p>
                </div>
                <div className="flex flex-col gap-2">
                  {employee.directReports.map(report => {
                    const managerReviewSubmitted = reviews.some(
                      r => r.cycleId === activeCycle.id && r.type === "MANAGER" && r.employeeId === report.id
                    );
                    
                    return (
                      <div key={report.id} className="flex items-center justify-between p-3 border border-hairline rounded-md bg-surface-hover">
                        <span className="font-medium text-sm">{report.firstName} {report.lastName}</span>
                        {managerReviewSubmitted ? (
                          <Badge variant="success">Submitted</Badge>
                        ) : (
                          <ReviewFormDialog 
                            employeeId={report.id}
                            employeeName={`${report.firstName} ${report.lastName}`}
                            cycleId={activeCycle.id}
                            cycleName={activeCycle.name}
                            type="MANAGER"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="flex flex-col gap-4 mt-4">
        <h2 className="font-display text-xl font-semibold tracking-tight text-powder-100">
          Review History
        </h2>
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center text-muted">
              No performance reviews found.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review) => {
              const isReceived = review.employeeId === session.user.employeeId;
              
              return (
                <Card key={review.id}>
                  <CardContent className="flex flex-col gap-3 pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant={isReceived ? "teal" : "rust"}>
                            {isReceived ? "Received" : "Given"}
                          </Badge>
                          <Badge variant="neutral">{review.type}</Badge>
                        </div>
                        <h4 className="font-medium text-powder-100">
                          {isReceived 
                            ? `From ${review.reviewer.firstName} ${review.reviewer.lastName}` 
                            : `To ${review.employee.firstName} ${review.employee.lastName}`
                          }
                        </h4>
                        <p className="text-xs text-muted">{review.cycle.name}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-2xl font-semibold text-powder-100">{review.rating}/5</span>
                        <span className="text-xs text-muted">{format(review.createdAt, "MMM d, yyyy")}</span>
                      </div>
                    </div>

                    <div className="mt-2 space-y-3 text-sm">
                      <div>
                        <span className="font-semibold text-powder-100 block mb-0.5">Strengths</span>
                        <p className="text-muted whitespace-pre-wrap">{review.strengths}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-powder-100 block mb-0.5">Areas for Improvement</span>
                        <p className="text-muted whitespace-pre-wrap">{review.improvements}</p>
                      </div>
                      {review.comments && (
                        <div>
                          <span className="font-semibold text-powder-100 block mb-0.5">Comments</span>
                          <p className="text-muted whitespace-pre-wrap">{review.comments}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
