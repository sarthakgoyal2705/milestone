"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addCommentAction } from "@/actions/comments";

type CommentThreadProps = {
  entityType: string;
  entityId: string;
  comments: {
    id: string;
    body: string;
    createdAt: Date;
    user: {
      email: string;
      employee?: { firstName: string; lastName: string; avatarUrl: string | null } | null;
    };
  }[];
};

export function CommentThread({ entityType, entityId, comments }: CommentThreadProps) {
  const [body, setBody] = useState("");
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    startTransition(async () => {
      const res = await addCommentAction(entityType, entityId, body);
      if (res.error) {
        toast.error(res.error);
      } else {
        setBody("");
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) form.requestSubmit();
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {comments.length === 0 ? (
          <p className="text-sm text-muted">No comments yet. Be the first to start the discussion.</p>
        ) : (
          comments.map((comment) => {
            const authorName = comment.user.employee
              ? `${comment.user.employee.firstName} ${comment.user.employee.lastName}`
              : comment.user.email;

            return (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="size-8">
                  <AvatarImage src={comment.user.employee?.avatarUrl || undefined} />
                  <AvatarFallback>{authorName.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col rounded-lg bg-surface-hover px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-powder-100">{authorName}</span>
                    <span className="text-xs text-muted">
                      {formatDistanceToNow(comment.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-muted">{comment.body}</p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <form onSubmit={onSubmit} className="relative">
        <Textarea
          placeholder="Add a comment..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={handleKeyDown}
          className="min-h-[80px] resize-none pr-12 pb-8 bg-surface-hover"
          disabled={isPending}
        />
        <div className="absolute bottom-2 right-2 flex items-center justify-between left-3">
           <span className="text-xs text-muted">Press Enter to send, Shift+Enter for new line</span>
          <Button
            type="submit"
            size="icon"
            variant="ghost"
            disabled={isPending || !body.trim()}
            className="h-8 w-8 hover:text-rust"
          >
            <Send className="size-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
