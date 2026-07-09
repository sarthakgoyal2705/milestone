"use client";

import { useState, useEffect, useTransition } from "react";
import { startOfMonth, endOfMonth, setYear, setMonth, isSameMonth } from "date-fns";
import { Palmtree, Cake, Gift, Calendar as CalendarIcon } from "lucide-react";
import { CalendarGrid } from "@/components/calendar/calendar-grid";
import { getCalendarDataAction } from "@/actions/calendar";
import { AddHolidayDialog } from "@/components/calendar/add-holiday-dialog";

type CalendarEvent = React.ComponentProps<typeof CalendarGrid>["events"][0];

export function CalendarWrapper({ role }: { role: string }) {
  const [month, setMonthState] = useState(startOfMonth(new Date()));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const { holidays, leaveRequests, employees } = await getCalendarDataAction(monthStart, monthEnd);
      
      const newEvents: CalendarEvent[] = [];

      // Add Holidays
      holidays.forEach(h => {
        newEvents.push({
          id: `hol_${h.id}`,
          title: h.name,
          date: h.date,
          type: "holiday",
          colorClass: "bg-rust/20 text-rust-600 dark:bg-rust-100 dark:text-rust",
          icon: <CalendarIcon className="size-3" />
        });
      });

      // Add Leaves
      leaveRequests.forEach(l => {
        // Expand leave range into individual days for the calendar
        let curr = l.startDate;
        while (curr <= l.endDate) {
          if (curr >= monthStart && curr <= monthEnd) {
             newEvents.push({
              id: `leave_${l.id}_${curr.getTime()}`,
              title: `${l.employee.firstName} ${l.employee.lastName} (Leave)`,
              date: new Date(curr),
              type: "leave",
              colorClass: "bg-teal/10 text-teal-600 dark:bg-teal-100 dark:text-teal",
              icon: <Palmtree className="size-3" />
            });
          }
          curr = new Date(curr.getTime() + 86400000); // add 1 day
        }
      });

      // Add Birthdays & Anniversaries (repeating yearly)
      employees.forEach(e => {
        // Assume hireDate is anniversary. If birthday exists in schema, we'd add it too.
        // We need to set the year of the event to the current viewing year.
        if (e.hireDate) {
          const annivDate = setYear(e.hireDate, month.getFullYear());
          if (isSameMonth(annivDate, month)) {
            const years = month.getFullYear() - e.hireDate.getFullYear();
            if (years > 0) {
              newEvents.push({
                id: `anniv_${e.id}`,
                title: `${e.firstName} ${e.lastName} - ${years}yr Anniv.`,
                date: annivDate,
                type: "anniversary",
                colorClass: "bg-rose/20 text-rose dark:bg-rose-100 dark:text-rose",
                icon: <Gift className="size-3" />
              });
            }
          }
        }
      });

      setEvents(newEvents);
    });
  }, [month]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-powder-100">
            Company Calendar
          </h1>
          <p className="mt-1 text-muted">Holidays, leaves, and team events.</p>
        </div>
        {role === "ADMIN" && (
          <AddHolidayDialog />
        )}
      </div>

      <div className="relative">
        {isPending && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <span className="text-sm font-medium text-muted">Loading...</span>
          </div>
        )}
        <CalendarGrid events={events} month={month} onMonthChange={setMonthState} />
      </div>
    </div>
  );
}
