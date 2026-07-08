"use client";

import { useRef, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { createTemplateAction, addTaskAction, deleteTaskAction } from "@/actions/onboarding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Task = { id: string; title: string; order: number };
type Template = { id: string; name: string; tasks: Task[] };

function CreateTemplateForm() {
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function action(formData: FormData) {
    startTransition(async () => {
      const result = await createTemplateAction(undefined, formData);
      if (result?.success) {
        toast.success("Template created.");
        formRef.current?.reset();
      } else {
        setError(result?.error);
      }
    });
  }

  return (
    <form ref={formRef} action={action} className="flex items-start gap-3">
      <div className="flex-1">
        <Input name="name" placeholder="New template name" required />
        {error && <p className="mt-1 text-sm text-danger">{error}</p>}
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="size-4" />
        Add
      </Button>
    </form>
  );
}

function AddTaskForm({ templateId }: { templateId: string }) {
  const [pending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function action(formData: FormData) {
    formData.set("templateId", templateId);
    startTransition(async () => {
      const result = await addTaskAction(undefined, formData);
      if (result?.success) formRef.current?.reset();
      else if (result?.error) toast.error(result.error);
    });
  }

  return (
    <form ref={formRef} action={action} className="flex items-center gap-2">
      <Input name="title" placeholder="New task" className="flex-1" required />
      <Button type="submit" size="sm" variant="secondary" disabled={pending}>
        <Plus className="size-4" />
        Add task
      </Button>
    </form>
  );
}

function TaskRow({ task }: { task: Task }) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const formData = new FormData();
    formData.set("taskId", task.id);
    startTransition(async () => {
      const result = await deleteTaskAction(undefined, formData);
      if (result?.error) toast.error(result.error);
    });
  }

  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-powder-100">{task.title}</span>
      <Button size="icon" variant="ghost" onClick={handleDelete} disabled={pending}>
        <Trash2 className="size-4 text-danger" />
      </Button>
    </div>
  );
}

export function TemplateManager({ templates }: { templates: Template[] }) {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardContent className="pt-6">
          <CreateTemplateForm />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle className="text-base">{template.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex flex-col divide-y divide-hairline">
                {template.tasks.length === 0 && (
                  <p className="py-2 text-sm text-muted">No tasks yet.</p>
                )}
                {template.tasks.map((task) => (
                  <TaskRow key={task.id} task={task} />
                ))}
              </div>
              <AddTaskForm templateId={template.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
