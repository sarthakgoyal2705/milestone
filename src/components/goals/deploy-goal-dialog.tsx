"use client";

import { useState, useTransition } from "react";
import { Rocket } from "lucide-react";
import { toast } from "sonner";

import { deployGoalAction } from "@/actions/goals";
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

type Report = { id: string; firstName: string; lastName: string };

const UOM_LABELS: Record<string, string> = {
  MIN: "Minimize",
  MAX: "Maximize",
  TIMELINE: "Timeline",
  ZERO: "Zero-tolerance",
};

export function DeployGoalDialog({ reports }: { reports: Report[] }) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function action(formData: FormData) {
    startTransition(async () => {
      const result = await deployGoalAction(undefined, formData);
      if (result?.success) {
        toast.success("Goal deployed.");
        setOpen(false);
      } else {
        setError(result?.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Rocket className="size-4" />
          Deploy goal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Deploy a goal</DialogTitle>
          <DialogDescription>
            Assigns a pre-approved goal directly to a direct report.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="employeeId">Employee</Label>
            <Select name="employeeId" required>
              <SelectTrigger id="employeeId">
                <SelectValue placeholder="Select a direct report" />
              </SelectTrigger>
              <SelectContent>
                {reports.map((report) => (
                  <SelectItem key={report.id} value={report.id}>
                    {report.firstName} {report.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="thrustArea">Thrust area</Label>
            <Input id="thrustArea" name="thrustArea" required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="target">Target</Label>
              <Input id="target" name="target" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="uom">Unit of measure</Label>
              <Select name="uom" defaultValue="MAX">
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
            <Input id="weightage" name="weightage" type="number" min={1} max={100} defaultValue={10} required />
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
              {pending ? "Deploying…" : "Deploy goal"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
