"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { X, Check, Ban } from "lucide-react";

import {
  cancelLeaveRequestAction,
  approveLeaveRequestAction,
  rejectLeaveRequestAction,
} from "@/actions/leave";
import { Button } from "@/components/ui/button";

function useRequestAction(
  action: (prevState: undefined, formData: FormData) => Promise<{ error?: string; success?: boolean } | undefined>,
  requestId: string,
  successMessage: string
) {
  const [pending, startTransition] = useTransition();

  function run() {
    const formData = new FormData();
    formData.set("requestId", requestId);
    startTransition(async () => {
      const result = await action(undefined, formData);
      if (result?.success) toast.success(successMessage);
      else if (result?.error) toast.error(result.error);
    });
  }

  return { run, pending };
}

export function CancelLeaveRequestButton({ requestId }: { requestId: string }) {
  const { run, pending } = useRequestAction(cancelLeaveRequestAction, requestId, "Request cancelled.");
  return (
    <Button size="sm" variant="ghost" onClick={run} disabled={pending}>
      <Ban className="size-4" />
      {pending ? "Cancelling…" : "Cancel"}
    </Button>
  );
}

export function ApproveLeaveRequestButton({ requestId }: { requestId: string }) {
  const { run, pending } = useRequestAction(approveLeaveRequestAction, requestId, "Request approved.");
  return (
    <Button size="sm" onClick={run} disabled={pending}>
      <Check className="size-4" />
      {pending ? "Approving…" : "Approve"}
    </Button>
  );
}

export function RejectLeaveRequestButton({ requestId }: { requestId: string }) {
  const { run, pending } = useRequestAction(rejectLeaveRequestAction, requestId, "Request rejected.");
  return (
    <Button size="sm" variant="secondary" onClick={run} disabled={pending}>
      <X className="size-4" />
      {pending ? "Rejecting…" : "Reject"}
    </Button>
  );
}
