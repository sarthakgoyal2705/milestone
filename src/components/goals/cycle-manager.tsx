"use client";

import { useRef, useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { createCycleAction, activateCycleAction } from "@/actions/goals";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type Cycle = { id: string; name: string; order: number; isActive: boolean };

function CreateCycleForm() {
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function action(formData: FormData) {
    startTransition(async () => {
      const result = await createCycleAction(undefined, formData);
      if (result?.success) {
        toast.success("Cycle created.");
        formRef.current?.reset();
      } else {
        setError(result?.error);
      }
    });
  }

  return (
    <form ref={formRef} action={action} className="flex items-start gap-3">
      <div className="flex-1">
        <Input name="name" placeholder="New cycle name" required />
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="size-4" />
        Add
      </Button>
    </form>
  );
}

function CycleRow({ cycle }: { cycle: Cycle }) {
  const [pending, startTransition] = useTransition();

  function activate() {
    const formData = new FormData();
    formData.set("cycleId", cycle.id);
    startTransition(async () => {
      const result = await activateCycleAction(undefined, formData);
      if (result?.success) toast.success(`${cycle.name} is now active.`);
      else if (result?.error) toast.error(result.error);
    });
  }

  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-powder-100">{cycle.name}</span>
        {cycle.isActive && <Badge variant="teal">Active</Badge>}
      </div>
      {!cycle.isActive && (
        <Button size="sm" variant="secondary" onClick={activate} disabled={pending}>
          {pending ? "Activating…" : "Activate"}
        </Button>
      )}
    </div>
  );
}

export function CycleManager({ cycles }: { cycles: Cycle[] }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <CreateCycleForm />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="divide-y divide-hairline p-0">
          {cycles.map((cycle) => (
            <CycleRow key={cycle.id} cycle={cycle} />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
