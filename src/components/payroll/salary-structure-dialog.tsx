"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { upsertSalaryStructureAction } from "@/actions/payroll";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LineItemsEditor, type LineItem } from "@/components/payroll/line-items-editor";

type ExistingStructure = {
  baseSalary: number;
  currency: string;
  allowances: LineItem[];
  deductions: LineItem[];
  effectiveFrom: Date;
};

export function SalaryStructureDialog({
  employeeId,
  employeeName,
  existing,
}: {
  employeeId: string;
  employeeName: string;
  existing?: ExistingStructure;
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function action(formData: FormData) {
    formData.set("employeeId", employeeId);
    startTransition(async () => {
      const result = await upsertSalaryStructureAction(undefined, formData);
      if (result?.success) {
        toast.success("Salary structure saved.");
        setOpen(false);
      } else {
        setError(result?.error);
      }
    });
  }

  const effectiveFromValue = existing?.effectiveFrom
    ? existing.effectiveFrom.toISOString().slice(0, 10)
    : "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="secondary" size="sm">
          {existing ? <Pencil className="size-4" /> : <Plus className="size-4" />}
          {existing ? "Edit" : "Set salary"}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Salary structure — {employeeName}</DialogTitle>
          <DialogDescription>Used to compute gross and net pay on generated payslips.</DialogDescription>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 flex flex-col gap-2">
              <Label htmlFor="baseSalary">Base salary</Label>
              <Input
                id="baseSalary"
                name="baseSalary"
                type="number"
                min={0}
                step={0.01}
                defaultValue={existing?.baseSalary}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" defaultValue={existing?.currency ?? "USD"} required />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="effectiveFrom">Effective from</Label>
            <Input
              id="effectiveFrom"
              name="effectiveFrom"
              type="date"
              defaultValue={effectiveFromValue}
              required
            />
          </div>

          <LineItemsEditor name="allowances" label="Allowances" initial={existing?.allowances ?? []} />
          <LineItemsEditor name="deductions" label="Deductions" initial={existing?.deductions ?? []} />

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
              {pending ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
