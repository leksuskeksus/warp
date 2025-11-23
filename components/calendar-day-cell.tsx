"use client";

import { format } from "date-fns";

import { cn } from "@/lib/cn";
import { HydratedCalendarEvent } from "@/lib/events-store";

type CalendarDayCellProps = {
  day: {
    date: Date;
    isToday: boolean;
    isMonthStart: boolean;
    events: HydratedCalendarEvent[];
  };
};

export function CalendarDayCell({ day }: CalendarDayCellProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-[10px] bg-bg px-[18px] pb-[18px] pt-[14px] text-fg transition-default",
        day.isToday && "bg-bg2 ring-1 ring-ring",
      )}
    >
      <div className="flex items-center justify-center">
        <span className="text-h2 font-medium leading-none text-center">
          {format(day.date, "d")}
        </span>
        {day.isMonthStart && (
          <span className="ml-[8px] text-tag font-medium text-fg3">
            {format(day.date, "MMM")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-[6px] overflow-hidden">
        {day.events.map((event) => {
          const shouldShowTime = event.isAllDay || event.name.length <= 18;

          return (
            <div
              key={event.id}
              className="flex h-[20px] items-center gap-[6px] rounded-sm border border-border bg-bg2/80 px-[6px] text-tag leading-none"
            >
              <span className="min-w-0 overflow-hidden whitespace-nowrap text-fg">
                {event.name}
              </span>
              {shouldShowTime && (
                <span className="ml-auto shrink-0 whitespace-nowrap text-fg3">
                  {event.isAllDay ? "All day" : format(event.startsAt, "h:mm a")}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

