"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";

import {
  createDepartmentAction,
  renameDepartmentAction,
  deleteDepartmentAction,
} from "@/actions/directory";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

type Department = { id: string; name: string; _count: { employees: number } };

function CreateDepartmentForm() {
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function action(formData: FormData) {
    startTransition(async () => {
      const result = await createDepartmentAction(undefined, formData);
      if (result?.success) {
        toast.success("Department created.");
        formRef.current?.reset();
        setError(undefined);
      } else {
        setError(result?.error);
      }
    });
  }

  return (
    <form ref={formRef} action={action} className="flex items-start gap-3">
      <div className="flex-1">
        <Input name="name" placeholder="New department name" required />
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="size-4" />
        Add
      </Button>
    </form>
  );
}

function DepartmentRow({ department }: { department: Department }) {
  const [editing, setEditing] = useState(false);
  const [renameError, setRenameError] = useState<string | undefined>();
  const [renamePending, startRenameTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();

  function renameAction(formData: FormData) {
    startRenameTransition(async () => {
      const result = await renameDepartmentAction(undefined, formData);
      if (result?.success) {
        toast.success("Department renamed.");
        setEditing(false);
      } else {
        setRenameError(result?.error);
      }
    });
  }

  function deleteAction(formData: FormData) {
    startDeleteTransition(async () => {
      const result = await deleteDepartmentAction(undefined, formData);
      if (result?.success) {
        toast.success("Department deleted.");
      } else if (result?.error) {
        toast.error(result.error);
      }
    });
  }

  if (editing) {
    return (
      <form action={renameAction} className="flex items-center gap-2 px-4 py-3">
        <input type="hidden" name="departmentId" value={department.id} />
        <Input name="name" defaultValue={department.name} autoFocus className="flex-1" />
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
        <p className="font-medium text-powder-100">{department.name}</p>
        <p className="text-sm text-muted">
          {department._count.employees} {department._count.employees === 1 ? "person" : "people"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Button size="icon" variant="ghost" onClick={() => setEditing(true)}>
          <Pencil className="size-4" />
        </Button>
        <form action={deleteAction}>
          <input type="hidden" name="departmentId" value={department.id} />
          <Button type="submit" size="icon" variant="ghost" disabled={deletePending}>
            <Trash2 className="size-4 text-danger" />
          </Button>
        </form>
      </div>
    </div>
  );
}

export function DepartmentManager({ departments }: { departments: Department[] }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <CreateDepartmentForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="divide-y divide-hairline p-0">
          {departments.length === 0 && (
            <p className="px-4 py-10 text-center text-sm text-muted">No departments yet.</p>
          )}
          {departments.map((department) => (
            <DepartmentRow key={department.id} department={department} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
