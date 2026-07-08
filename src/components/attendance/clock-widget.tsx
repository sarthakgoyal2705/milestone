"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { LogIn, LogOut } from "lucide-react";
import { format } from "date-fns";

import { clockInAction, clockOutAction } from "@/actions/attendance";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function ClockWidget({
  openEntry,
}: {
  openEntry: { id: string; clockIn: Date } | null;
}) {
  const [pending, startTransition] = useTransition();

  function handleClockIn() {
    startTransition(async () => {
      const result = await clockInAction();
      if (result?.success) toast.success("Clocked in.");
      else if (result?.error) toast.error(result.error);
    });
  }

  function handleClockOut() {
    if (!openEntry) return;
    const formData = new FormData();
    formData.set("entryId", openEntry.id);
    startTransition(async () => {
      const result = await clockOutAction(undefined, formData);
      if (result?.success) toast.success("Clocked out.");
      else if (result?.error) toast.error(result.error);
    });
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
        <div>
          {openEntry ? (
            <>
              <p className="text-sm text-muted">Clocked in since</p>
              <p className="font-display text-xl font-semibold text-powder-100">
                {format(openEntry.clockIn, "h:mm a, MMM d")}
              </p>
            </>
          ) : (
            <>
              <p className="text-sm text-muted">Status</p>
              <p className="font-display text-xl font-semibold text-powder-100">Clocked out</p>
            </>
          )}
        </div>
        {openEntry ? (
          <Button variant="secondary" onClick={handleClockOut} disabled={pending}>
            <LogOut className="size-4" />
            {pending ? "Clocking out…" : "Clock out"}
          </Button>
        ) : (
          <Button onClick={handleClockIn} disabled={pending}>
            <LogIn className="size-4" />
            {pending ? "Clocking in…" : "Clock in"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
