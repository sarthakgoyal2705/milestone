"use client";

import { useState, useTransition } from "react";
import { ClipboardCheck } from "lucide-react";
import { toast } from "sonner";

import { upsertCheckInAction } from "@/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export function CheckInDialog({
  goalId,
  goalTitle,
  cycleName,
  existing,
}: {
  goalId: string;
  goalTitle: string;
  cycleName: string;
  existing?: { actual: string; score: number | null };
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function action(formData: FormData) {
    formData.set("goalId", goalId);
    startTransition(async () => {
      const result = await upsertCheckInAction(undefined, formData);
      if (result?.success) {
        toast.success("Check-in saved.");
        setOpen(false);
      } else {
        setError(result?.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="secondary">
          <ClipboardCheck className="size-4" />
          {existing ? "Update check-in" : "Check in"}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check in — {cycleName}</DialogTitle>
          <DialogDescription>{goalTitle}</DialogDescription>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="actual">Actual progress</Label>
            <Textarea id="actual" name="actual" defaultValue={existing?.actual} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="score">Score (0–10)</Label>
            <Input
              id="score"
              name="score"
              type="number"
              min={0}
              max={10}
              step={0.5}
              defaultValue={existing?.score ?? undefined}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-danger">
              {error}
            </p>
          )}

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? "Saving…" : "Save check-in"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
