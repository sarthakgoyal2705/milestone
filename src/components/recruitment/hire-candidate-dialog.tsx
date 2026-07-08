"use client";

import { useState, useTransition } from "react";
import { UserCheck } from "lucide-react";
import { toast } from "sonner";

import { hireCandidateAction } from "@/actions/recruitment";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Department = { id: string; name: string };
type Manager = { id: string; firstName: string; lastName: string };
type Template = { id: string; name: string };

export function HireCandidateDialog({
  candidateId,
  candidateName,
  candidateEmail,
  departments,
  managers,
  templates,
}: {
  candidateId: string;
  candidateName: string;
  candidateEmail: string;
  departments: Department[];
  managers: Manager[];
  templates: Template[];
}) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [pending, startTransition] = useTransition();

  function action(formData: FormData) {
    formData.set("candidateId", candidateId);
    startTransition(async () => {
      const result = await hireCandidateAction(undefined, formData);
      if (result?.success) {
        toast.success(`${candidateName} hired.`);
        setOpen(false);
      } else {
        setError(result?.error);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <UserCheck className="size-4" />
          Hire
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Hire {candidateName}</DialogTitle>
          <DialogDescription>
            Creates their login and employee record, and assigns an onboarding checklist.
          </DialogDescription>
        </DialogHeader>

        <form action={action} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email">Login email</Label>
              <Input id="email" name="email" type="email" defaultValue={candidateEmail} required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Temporary password</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="jobTitle">Job title</Label>
              <Input id="jobTitle" name="jobTitle" required />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="hireDate">Hire date</Label>
              <Input id="hireDate" name="hireDate" type="date" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="departmentId">Department</Label>
              <Select name="departmentId">
                <SelectTrigger id="departmentId">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((department) => (
                    <SelectItem key={department.id} value={department.id}>
                      {department.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="managerId">Manager</Label>
              <Select name="managerId">
                <SelectTrigger id="managerId">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id}>
                      {manager.firstName} {manager.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="onboardingTemplateId">Onboarding template</Label>
            <Select name="onboardingTemplateId">
              <SelectTrigger id="onboardingTemplateId">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
              {pending ? "Hiring…" : "Hire candidate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
