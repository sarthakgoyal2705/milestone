"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { addAssetAction } from "@/actions/assets";

type AddAssetDialogProps = {
  employees: { id: string; name: string }[];
};

export function AddAssetDialog({ employees }: AddAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  async function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await addAssetAction(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success("Asset added successfully");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="size-4" />
          Add Asset
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Asset</DialogTitle>
          <DialogDescription>
            Register new hardware or equipment in the inventory.
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="flex flex-col gap-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Asset Name</label>
              <Input name="name" required placeholder="e.g. MacBook Pro 16" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Type</label>
              <Select name="type" required defaultValue="LAPTOP">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LAPTOP">Laptop</SelectItem>
                  <SelectItem value="MONITOR">Monitor</SelectItem>
                  <SelectItem value="PHONE">Phone</SelectItem>
                  <SelectItem value="BADGE">Badge</SelectItem>
                  <SelectItem value="KEY">Key</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Serial Number (Optional)</label>
              <Input name="serialNumber" placeholder="e.g. C02X..." />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Initial Status</label>
              <Select name="status" required defaultValue="AVAILABLE">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AVAILABLE">Available</SelectItem>
                  <SelectItem value="ASSIGNED">Assigned</SelectItem>
                  <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                  <SelectItem value="RETIRED">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Assign To (Optional)</label>
            <Select name="assignedToId">
              <SelectTrigger>
                <SelectValue placeholder="Unassigned" />
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
            <label className="text-sm font-medium">Notes</label>
            <Textarea
              name="notes"
              placeholder="Any additional details..."
              className="resize-none"
            />
          </div>

          <div className="mt-4 flex justify-end gap-3 pt-2 border-t border-hairline">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Add Asset"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
