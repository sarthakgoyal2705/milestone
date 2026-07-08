import { notFound, redirect } from "next/navigation";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CandidateDialog } from "@/components/recruitment/candidate-dialog";
import { JobPostingToggle } from "@/components/recruitment/job-posting-toggle";
import {
  AdvanceCandidateButton,
  RejectCandidateButton,
} from "@/components/recruitment/candidate-stage-actions";
import { HireCandidateDialog } from "@/components/recruitment/hire-candidate-dialog";
import type { PipelineStage } from "@/generated/prisma/enums";

const STAGE_ORDER: PipelineStage[] = [
  "APPLIED",
  "SCREENING",
  "INTERVIEW",
  "OFFER",
  "HIRED",
  "REJECTED",
];

const STAGE_VARIANT: Record<PipelineStage, "neutral" | "teal" | "warning" | "success" | "danger"> = {
  APPLIED: "neutral",
  SCREENING: "teal",
  INTERVIEW: "teal",
  OFFER: "warning",
  HIRED: "success",
  REJECTED: "danger",
};

export default async function JobPostingDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role === "EMPLOYEE") redirect("/dashboard");

  const { jobId } = await params;

  const posting = await prisma.jobPosting.findUnique({
    where: { id: jobId },
    include: {
      department: true,
      candidates: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!posting) notFound();

  const [departments, managers, templates] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.employee.findMany({
      select: { id: true, firstName: true, lastName: true },
      orderBy: [{ firstName: "asc" }],
    }),
    prisma.onboardingTemplate.findMany({ orderBy: { name: "asc" } }),
  ]);

  const grouped = STAGE_ORDER.map((stage) => ({
    stage,
    candidates: posting.candidates.filter((c) => c.stage === stage),
  })).filter((group) => group.candidates.length > 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
            {posting.title}
          </h1>
          <p className="mt-1 flex items-center gap-2 text-muted">
            {posting.department?.name ?? "No department"}
            <Badge variant={posting.isOpen ? "success" : "neutral"}>
              {posting.isOpen ? "Open" : "Closed"}
            </Badge>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <JobPostingToggle jobPostingId={posting.id} isOpen={posting.isOpen} />
          <CandidateDialog jobPostingId={posting.id} />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6 text-sm text-muted">{posting.description}</CardContent>
      </Card>

      {grouped.length === 0 && (
        <Card>
          <CardContent className="py-10 text-center text-muted">No candidates yet.</CardContent>
        </Card>
      )}

      {grouped.map((group) => (
        <div key={group.stage} className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-semibold text-powder-100">
            {group.stage.charAt(0) + group.stage.slice(1).toLowerCase()} ({group.candidates.length})
          </h2>
          <div className="flex flex-col gap-3">
            {group.candidates.map((candidate) => (
              <Card key={candidate.id}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
                  <div>
                    <p className="font-medium text-powder-100">{candidate.name}</p>
                    <p className="text-sm text-muted">{candidate.email}</p>
                    {candidate.notes && <p className="mt-1 text-sm text-muted">{candidate.notes}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STAGE_VARIANT[candidate.stage]}>{candidate.stage}</Badge>
                    {candidate.stage === "OFFER" && (
                      <HireCandidateDialog
                        candidateId={candidate.id}
                        candidateName={candidate.name}
                        candidateEmail={candidate.email}
                        departments={departments}
                        managers={managers}
                        templates={templates}
                      />
                    )}
                    {candidate.stage !== "HIRED" && candidate.stage !== "REJECTED" && (
                      <>
                        <AdvanceCandidateButton candidateId={candidate.id} stage={candidate.stage} />
                        <RejectCandidateButton candidateId={candidate.id} />
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
