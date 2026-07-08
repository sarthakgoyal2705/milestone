"use client";

import { useState, useTransition } from "react";
import { Plus, Pencil } from "lucide-react";
import { toast } from "sonner";

import { createGoalAction, updateGoalAction } from "@/actions/goals";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UnitOfMeasure } from "@/generated/prisma/enums";

const UOM_LABELS: Record<UnitOfMeasure, string> = {
  MIN: "Minimize",
  MAX: "Maximize",
  TIMELINE: "Timeline",
  ZERO: "Zero-tolerance",
};

type GoalInitial = {
  id: string;
  thrustArea: string;
  title: string;
  description: string;
  target: string;
  uom: UnitOfMeasure;
  weightage: number;
};

export function GoalFormDialog({ goal }: { goal?: GoalInitial }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const isEdit = Boolean(goal);

  function action(formData: FormData) {
    startTransition(async () => {
      if (goal) formData.set("goalId", goal.id);
      const result = isEdit
        ? await updateGoalAction(undefined, formData)
        : await createGoalAction(undefined, formData);
      if (result?.success) {
        toast.success(isEdit ? "Goal updated." : "Goal added.");
        setOpen(false);
      } else {
        setError(result?.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEdit ? (
          <Button variant="secondary" size="sm">
            <Pencil className="size-4" />
            Edit
          </Button>
        ) : (
          <Button>
            <Plus className="size-4" />
            Add goal
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit goal" : "Add goal"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Saving will move this goal back to draft."
              : "Goals are submitted for your manager's approval once ready."}
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="thrustArea">Thrust area</Label>
            <Input
              id="thrustArea"
              name="thrustArea"
              defaultValue={goal?.thrustArea}
              placeholder="e.g. Customer Success"
              required
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" defaultValue={goal?.title} required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={goal?.description} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="target">Target</Label>
              <Input id="target" name="target" defaultValue={goal?.target} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="uom">Unit of measure</Label>
              <Select name="uom" defaultValue={goal?.uom ?? "MAX"}>
                <SelectTrigger id="uom">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(UOM_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="weightage">Weightage (%)</Label>
            <Input
              id="weightage"
              name="weightage"
              type="number"
              min={1}
              max={100}
              defaultValue={goal?.weightage ?? 10}
              required
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
              {pending ? "Saving…" : isEdit ? "Save changes" : "Add goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
