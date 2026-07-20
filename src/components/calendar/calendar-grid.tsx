"use client";

import { useState } from "react";
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, isWithinInterval, startOfDay, endOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Palmtree, Cake, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";

type CalendarEvent = {
  id: string;
  title: string;
  date: Date;
  type: "holiday" | "leave" | "birthday" | "anniversary";
  colorClass: string;
  icon?: React.ReactNode;
};

type CalendarGridProps = {
  events: CalendarEvent[];
  month: Date;
  onMonthChange: (date: Date) => void;
};

export function CalendarGrid({ events, month, onMonthChange }: CalendarGridProps) {
  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const dateFormat = "d";
  const rows = [];

  let days = [];
  let day = startDate;
  let formattedDate = "";

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      formattedDate = format(day, dateFormat);
      const cloneDay = day;
      
      const dayEvents = events.filter(e => isSameDay(e.date, cloneDay));

      days.push(
        <div
          className={`min-h-24 border border-hairline p-2 transition-colors hover:bg-surface-hover ${
            !isSameMonth(day, monthStart)
              ? "bg-ink-900/50 text-muted"
              : isSameDay(day, new Date())
              ? "bg-ink-700/30 font-semibold"
              : "bg-surface"
          }`}
          key={day.toString()}
        >
          <span className="flex justify-end">
            <span className={`flex size-6 items-center justify-center rounded-full text-sm ${isSameDay(day, new Date()) ? 'bg-rust text-white' : ''}`}>
              {formattedDate}
            </span>
          </span>
          <div className="mt-1 flex flex-col gap-1">
            {dayEvents.map(event => (
              <div 
                key={event.id} 
                className={`flex items-center gap-1.5 rounded-sm px-1.5 py-1 text-xs font-medium ${event.colorClass}`}
                title={event.title}
              >
                {event.icon}
                <span className="truncate">{event.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toString()}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl font-semibold tracking-tight text-powder-100">
          {format(monthStart, "MMMM yyyy")}
        </h2>
        <div className="flex gap-2">
          <Button variant="secondary" size="icon" onClick={() => onMonthChange(subMonths(month, 1))}>
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="secondary" size="sm" onClick={() => onMonthChange(new Date())}>
            Today
          </Button>
          <Button variant="secondary" size="icon" onClick={() => onMonthChange(addMonths(month, 1))}>
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      
      <div className="rounded-lg border border-hairline bg-surface overflow-hidden">
        <div className="grid grid-cols-7 border-b border-hairline bg-ink-950/40">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-2 text-center text-sm font-medium text-muted uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>
        <div>
          {rows}
        </div>
      </div>
    </div>
  );
}
