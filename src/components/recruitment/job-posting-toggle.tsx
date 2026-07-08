"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { toggleJobPostingAction } from "@/actions/recruitment";
import { Button } from "@/components/ui/button";

export function JobPostingToggle({
  jobPostingId,
  isOpen,
}: {
  jobPostingId: string;
  isOpen: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function run() {
    const formData = new FormData();
    formData.set("jobPostingId", jobPostingId);
    formData.set("isOpen", String(!isOpen));
    startTransition(async () => {
      const result = await toggleJobPostingAction(undefined, formData);
      if (result?.success) toast.success(isOpen ? "Posting closed." : "Posting reopened.");
      else if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Button size="sm" variant="secondary" onClick={run} disabled={pending}>
      {pending ? "Saving…" : isOpen ? "Close posting" : "Reopen posting"}
    </Button>
  );
}
