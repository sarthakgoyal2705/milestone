"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CommentThread } from "@/components/ui/comment-thread";

type GoalCommentsDialogProps = {
  goalId: string;
  goalTitle: string;
  comments: any[];
};

export function GoalCommentsDialog({ goalId, goalTitle, comments }: GoalCommentsDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <MessageSquare className="size-4" />
          Comments ({comments.length})
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="truncate">Comments: {goalTitle}</DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <CommentThread
            entityType="goal"
            entityId={goalId}
            comments={comments}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
