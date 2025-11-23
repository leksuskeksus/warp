"use client";

import { MouseEvent } from "react";
import { format } from "date-fns";

import { cn } from "@/lib/cn";
import { HydratedCalendarEvent } from "@/lib/events-store";

import { CalendarDay, CalendarDayCell } from "./day-cell";

type CalendarViewProps = {
  days: CalendarDay[];
  selectedEventId?: string | null;
  onDaySelect: (date: Date, additive: boolean) => void;
  onEventSelect: (event: HydratedCalendarEvent) => void;
};

export function CalendarView({
  days,
  selectedEventId = null,
  onDaySelect,
  onEventSelect,
}: CalendarViewProps) {
  const handleDayClick = (date: Date) => (event: MouseEvent<HTMLButtonElement>) => {
    onDaySelect(date, event.shiftKey);
  };

  return (
    <div
      className="grid h-full min-h-screen grid-cols-7 gap-[1px] bg-border"
      style={{ gridAutoRows: "minmax(calc(100svh/5), 1fr)" }}
    >
      {days.map((day) => (
        <button
          key={format(day.date, "yyyy-MM-dd")}
          type="button"
          className={cn("group relative flex h-full w-full items-stretch bg-bg text-left focus:outline-none")}
          onClick={handleDayClick(day.date)}
        >
          <div className="flex h-full w-full">
            <CalendarDayCell day={day} selectedEventId={selectedEventId} onEventClick={onEventSelect} />
          </div>
        </button>
      ))}
    </div>
  );
}


