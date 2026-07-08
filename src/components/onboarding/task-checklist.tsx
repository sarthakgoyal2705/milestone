"use client";

import { useTransition } from "react";
import { toast } from "sonner";

import { toggleTaskInstanceAction } from "@/actions/onboarding";
import { Checkbox } from "@/components/ui/checkbox";

export type TaskInstance = {
  id: string;
  isComplete: boolean;
  taskTemplate: { title: string };
};

export function TaskChecklistItem({ instance }: { instance: TaskInstance }) {
  const [pending, startTransition] = useTransition();

  function handleToggle(checked: boolean) {
    const formData = new FormData();
    formData.set("instanceId", instance.id);
    formData.set("isComplete", String(checked));
    startTransition(async () => {
      const result = await toggleTaskInstanceAction(undefined, formData);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <label className="flex items-center gap-3 py-2">
      <Checkbox
        checked={instance.isComplete}
        onCheckedChange={(checked) => handleToggle(checked === true)}
        disabled={pending}
      />
      <span className={instance.isComplete ? "text-muted line-through" : "text-powder-100"}>
        {instance.taskTemplate.title}
      </span>
    </label>
  );
}
