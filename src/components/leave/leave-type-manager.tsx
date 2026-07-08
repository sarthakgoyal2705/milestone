"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, Trash2, Pencil, Check, X, CalendarPlus } from "lucide-react";
import { toast } from "sonner";

import {
  createLeaveTypeAction,
  renameLeaveTypeAction,
  deleteLeaveTypeAction,
  allocateBalancesAction,
} from "@/actions/leave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type LeaveType = { id: string; name: string; defaultAnnualDays: number };

const CURRENT_YEAR = new Date().getFullYear();

function CreateLeaveTypeForm() {
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function action(formData: FormData) {
    startTransition(async () => {
      const result = await createLeaveTypeAction(undefined, formData);
      if (result?.success) {
        toast.success("Leave type created.");
        formRef.current?.reset();
      } else {
        setError(result?.error);
      }
    });
  }

  return (
    <form ref={formRef} action={action} className="flex items-start gap-3">
      <div className="flex-1">
        <Input name="name" placeholder="Leave type name" required />
      </div>
      <div className="w-40">
        <Input name="defaultAnnualDays" type="number" min={0} step={0.5} placeholder="Days/year" required />
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="size-4" />
        Add
      </Button>
      {error && <p className="text-sm text-danger">{error}</p>}
    </form>
  );
}

function LeaveTypeRow({ leaveType }: { leaveType: LeaveType }) {
  const [editing, setEditing] = useState(false);
  const [renameError, setRenameError] = useState<string | undefined>();
  const [renamePending, startRenameTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();
  const [allocatePending, startAllocateTransition] = useTransition();

  function renameAction(formData: FormData) {
    startRenameTransition(async () => {
      const result = await renameLeaveTypeAction(undefined, formData);
      if (result?.success) {
        toast.success("Leave type updated.");
        setEditing(false);
      } else {
        setRenameError(result?.error);
      }
    });
  }

  function handleDelete() {
    const formData = new FormData();
    formData.set("leaveTypeId", leaveType.id);
    startDeleteTransition(async () => {
      const result = await deleteLeaveTypeAction(undefined, formData);
      if (result?.success) toast.success("Leave type deleted.");
      else if (result?.error) toast.error(result.error);
    });
  }

  function handleAllocate() {
    const formData = new FormData();
    formData.set("leaveTypeId", leaveType.id);
    formData.set("year", String(CURRENT_YEAR));
    startAllocateTransition(async () => {
      const result = await allocateBalancesAction(undefined, formData);
      if (result?.success) toast.success(`Allocated ${CURRENT_YEAR} balances.`);
      else if (result?.error) toast.error(result.error);
    });
  }

  if (editing) {
    return (
      <form action={renameAction} className="flex items-center gap-2 px-4 py-3">
        <input type="hidden" name="leaveTypeId" value={leaveType.id} />
        <Input name="name" defaultValue={leaveType.name} autoFocus className="flex-1" />
        <Input
          name="defaultAnnualDays"
          type="number"
          min={0}
          step={0.5}
          defaultValue={leaveType.defaultAnnualDays}
          className="w-32"
        />
        <Button type="submit" size="icon" variant="ghost" disabled={renamePending}>
          <Check className="size-4" />
        </Button>
        <Button type="button" size="icon" variant="ghost" onClick={() => setEditing(false)}>
          <X className="size-4" />
        </Button>
        {renameError && <p className="text-sm text-danger">{renameError}</p>}
      </form>
    );
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <p className="font-medium text-powder-100">{leaveType.name}</p>
        <p className="text-sm text-muted">{leaveType.defaultAnnualDays} days / year</p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="sm" variant="secondary" onClick={handleAllocate} disabled={allocatePending}>
          <CalendarPlus className="size-4" />
          {allocatePending ? "Allocating…" : `Allocate ${CURRENT_YEAR}`}
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setEditing(true)}>
          <Pencil className="size-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={handleDelete} disabled={deletePending}>
          <Trash2 className="size-4 text-danger" />
        </Button>
      </div>
    </div>
  );
}

export function LeaveTypeManager({ leaveTypes }: { leaveTypes: LeaveType[] }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <CreateLeaveTypeForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="divide-y divide-hairline p-0">
          {leaveTypes.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted">No leave types yet.</p>
          )}
          {leaveTypes.map((leaveType) => (
            <LeaveTypeRow key={leaveType.id} leaveType={leaveType} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
