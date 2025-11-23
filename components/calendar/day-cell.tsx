"use client";

import { format } from "date-fns";

import { cn } from "@/lib/cn";
import { HydratedCalendarEvent } from "@/lib/events-store";
import type { CalendarDay } from "@/lib/calendar";

import { CalendarDayCellEvent } from "./day-cell-event";

type CalendarDayCellProps = {
  day: CalendarDay;
  selectedEventId?: string | null;
  onEventClick?: (event: HydratedCalendarEvent) => void;
};

export function CalendarDayCell({ day, selectedEventId, onEventClick }: CalendarDayCellProps) {
  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col rounded-[12px] border border-transparent bg-bg px-[14px] pb-[14px] pt-[12px] text-fg transition-all duration-150",
        "group-hover:border-border group-hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08)] group-active:border-success/60 group-active:shadow-[0_0_0_1px_rgba(22,163,74,0.45)]",
        day.isToday && "bg-bg2 border-border",
        day.isSelected && "border border-success shadow-[0_0_0_1px_rgba(22,163,74,0.65)]",
        day.isDimmed && "opacity-30",
      )}
    >
      <div className="flex items-center justify-center gap-[8px]">
        <span className="text-h2 font-medium leading-none text-center">{format(day.date, "d")}</span>
        {day.isMonthStart && (
          <span className="text-tag font-medium text-fg3">
            {format(day.date, "MMM")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-[3px] overflow-hidden">
        {day.events.map((event) => (
          <CalendarDayCellEvent
            key={event.id}
            event={event}
            isSelected={selectedEventId === event.id}
            onSelect={onEventClick}
          />
        ))}
      </div>
    </div>
  );
}


