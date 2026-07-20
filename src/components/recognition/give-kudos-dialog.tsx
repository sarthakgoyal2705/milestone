"use client";

import { useState, useTransition } from "react";
import { Award, Rocket, Heart, Star, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { giveKudosAction } from "@/actions/recognition";

const BADGES = [
  { id: "star", label: "Star Performer", icon: Star, color: "text-warning" },
  { id: "rocket", label: "Fast Learner", icon: Rocket, color: "text-rust-600 dark:text-rust" },
  { id: "heart", label: "Team Player", icon: Heart, color: "text-rose" },
  { id: "trophy", label: "Problem Solver", icon: Award, color: "text-teal" },
  { id: "check", label: "Get it Done", icon: CheckCircle, color: "text-success" },
];

export function GiveKudosDialog({ employees }: { employees: { id: string; name: string }[] }) {
  const [open, setOpen] = useState(false);
  const [badge, setBadge] = useState("star");
  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    formData.append("badge", badge);
    startTransition(async () => {
      const res = await giveKudosAction(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Kudos sent!");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Award className="size-4" />
          Give Kudos
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Give Kudos</DialogTitle>
          <DialogDescription>
            Recognize a colleague for their great work.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Who do you want to recognize?</label>
            <Select name="toEmployeeId" required>
              <SelectTrigger>
                <SelectValue placeholder="Select a colleague..." />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Select a Badge</label>
            <div className="grid grid-cols-5 gap-2">
              {BADGES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBadge(b.id)}
                  className={`flex flex-col items-center gap-1 rounded-md border p-2 transition-colors ${
                    badge === b.id
                      ? "border-rust bg-rust/10"
                      : "border-hairline bg-surface hover:bg-surface-hover"
                  }`}
                >
                  <b.icon className={`size-6 ${b.color}`} />
                </button>
              ))}
            </div>
            <p className="text-center text-xs font-medium text-muted mt-1">
              {BADGES.find((b) => b.id === badge)?.label}
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Message</label>
            <Textarea
              name="message"
              required
              placeholder="Tell them why they are awesome..."
              className="h-24 resize-none"
            />
          </div>

          <div className="mt-4 flex justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Sending..." : "Send Kudos"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { BADGES };
