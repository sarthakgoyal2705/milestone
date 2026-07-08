"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { ArrowRight, X } from "lucide-react";

import { advanceCandidateAction } from "@/actions/recruitment";
import { Button } from "@/components/ui/button";
import type { PipelineStage } from "@/generated/prisma/enums";

const NEXT_STAGE: Partial<Record<PipelineStage, PipelineStage>> = {
  APPLIED: "SCREENING",
  SCREENING: "INTERVIEW",
  INTERVIEW: "OFFER",
};

const NEXT_LABEL: Partial<Record<PipelineStage, string>> = {
  APPLIED: "Move to Screening",
  SCREENING: "Move to Interview",
  INTERVIEW: "Extend Offer",
};

export function AdvanceCandidateButton({
  candidateId,
  stage,
}: {
  candidateId: string;
  stage: PipelineStage;
}) {
  const [pending, startTransition] = useTransition();
  const nextStage = NEXT_STAGE[stage];
  if (!nextStage) return null;

  function run() {
    const formData = new FormData();
    formData.set("candidateId", candidateId);
    formData.set("stage", nextStage!);
    startTransition(async () => {
      const result = await advanceCandidateAction(undefined, formData);
      if (result?.success) toast.success("Candidate advanced.");
      else if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Button size="sm" variant="secondary" onClick={run} disabled={pending}>
      <ArrowRight className="size-4" />
      {pending ? "Moving…" : NEXT_LABEL[stage]}
    </Button>
  );
}

export function RejectCandidateButton({ candidateId }: { candidateId: string }) {
  const [pending, startTransition] = useTransition();

  function run() {
    const formData = new FormData();
    formData.set("candidateId", candidateId);
    formData.set("stage", "REJECTED");
    startTransition(async () => {
      const result = await advanceCandidateAction(undefined, formData);
      if (result?.success) toast.success("Candidate rejected.");
      else if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Button size="sm" variant="ghost" onClick={run} disabled={pending}>
      <X className="size-4 text-danger" />
    </Button>
  );
}
