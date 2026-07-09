"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ClipboardEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { submitReviewAction } from "@/actions/performance";

type ReviewFormDialogProps = {
  employeeId: string;
  employeeName: string;
  cycleId: string;
  cycleName: string;
  type: "SELF" | "MANAGER" | "PEER";
};

export function ReviewFormDialog({
  employeeId,
  employeeName,
  cycleId,
  cycleName,
  type,
}: ReviewFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [rating, setRating] = useState("");

  async function onSubmit(formData: FormData) {
    formData.append("employeeId", employeeId);
    formData.append("cycleId", cycleId);
    formData.append("type", type);
    
    startTransition(async () => {
      const res = await submitReviewAction(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Review submitted successfully");
        setOpen(false);
      }
    });
  }

  const title = type === "SELF" 
    ? "Self Evaluation" 
    : type === "MANAGER" 
    ? `Manager Review: ${employeeName}`
    : `Peer Review: ${employeeName}`;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant={type === "SELF" ? "default" : "secondary"} className="gap-2">
          <ClipboardEdit className="size-4" />
          {type === "SELF" ? "Write Self-Review" : "Write Review"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Cycle: {cycleName}
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="flex flex-col gap-5 mt-2">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Overall Rating (1-5)</label>
            <Input 
              name="rating" 
              type="number" 
              min="1" max="5" 
              required
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="max-w-[100px]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Key Strengths</label>
            <Textarea
              name="strengths"
              required
              placeholder="What did they excel at?"
              className="h-24 resize-y"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Areas for Improvement</label>
            <Textarea
              name="improvements"
              required
              placeholder="Where can they grow?"
              className="h-24 resize-y"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Additional Comments</label>
            <Textarea
              name="comments"
              placeholder="Any other feedback?"
              className="h-24 resize-y"
            />
          </div>

          <div className="mt-4 flex justify-end gap-3 border-t border-hairline pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
