"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Send, Trash2, Check, Undo2 } from "lucide-react";

import {
  submitGoalAction,
  deleteGoalAction,
  approveGoalAction,
  returnGoalAction,
} from "@/actions/goals";
import { Button } from "@/components/ui/button";

function useGoalAction(
  action: (prevState: undefined, formData: FormData) => Promise<{ error?: string; success?: boolean } | undefined>,
  goalId: string,
  successMessage: string
) {
  const [pending, startTransition] = useTransition();

  function run() {
    const formData = new FormData();
    formData.set("goalId", goalId);
    startTransition(async () => {
      const result = await action(undefined, formData);
      if (result?.success) toast.success(successMessage);
      else if (result?.error) toast.error(result.error);
    });
  }

  return { run, pending };
}

export function SubmitGoalButton({ goalId }: { goalId: string }) {
  const { run, pending } = useGoalAction(submitGoalAction, goalId, "Submitted for approval.");
  return (
    <Button size="sm" variant="secondary" onClick={run} disabled={pending}>
      <Send className="size-4" />
      {pending ? "Submitting…" : "Submit"}
    </Button>
  );
}

export function DeleteGoalButton({ goalId }: { goalId: string }) {
  const { run, pending } = useGoalAction(deleteGoalAction, goalId, "Goal deleted.");
  return (
    <Button size="icon" variant="ghost" onClick={run} disabled={pending}>
      <Trash2 className="size-4 text-danger" />
    </Button>
  );
}

export function ApproveGoalButton({ goalId }: { goalId: string }) {
  const { run, pending } = useGoalAction(approveGoalAction, goalId, "Goal approved.");
  return (
    <Button size="sm" onClick={run} disabled={pending}>
      <Check className="size-4" />
      {pending ? "Approving…" : "Approve"}
    </Button>
  );
}

export function ReturnGoalButton({ goalId }: { goalId: string }) {
  const { run, pending } = useGoalAction(returnGoalAction, goalId, "Goal returned.");
  return (
    <Button size="sm" variant="secondary" onClick={run} disabled={pending}>
      <Undo2 className="size-4" />
      {pending ? "Returning…" : "Return"}
    </Button>
  );
}
