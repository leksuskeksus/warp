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
    isSelected?: boolean;
    isDimmed?: boolean;
  };
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
        <span className="text-h2 font-medium leading-none text-center">
          {format(day.date, "d")}
        </span>
        {day.isMonthStart && (
          <span className="text-tag font-medium text-fg3">
            {format(day.date, "MMM")}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-[3px] overflow-hidden">
        {day.events.map((event) => {
          const shouldShowTime = event.isAllDay || event.title.length <= 18;
          const isSelectedEvent = selectedEventId === event.id;

          return (
            <div
              key={event.id}
              role="button"
              tabIndex={0}
              onClick={(interactionEvent) => {
                interactionEvent.stopPropagation();
                onEventClick?.(event);
              }}
              onKeyDown={(keyboardEvent) => {
                if (keyboardEvent.key === "Enter" || keyboardEvent.key === " ") {
                  keyboardEvent.preventDefault();
                  keyboardEvent.stopPropagation();
                  onEventClick?.(event);
                }
              }}
              className={cn(
                "flex h-[20px] cursor-pointer items-center gap-[6px] rounded-sm border border-border bg-bg2/80 px-[2px] text-tag leading-none outline-none transition",
                isSelectedEvent && "border-success bg-green-50",
                "focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/50",
              )}
            >
              <span className="min-w-0 overflow-hidden whitespace-nowrap text-fg">
                {event.title}
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

