"use client";

import { format } from "date-fns";

import { cn } from "@/lib/cn";
import { HydratedCalendarEvent } from "@/lib/events-store";

type CalendarInspectorEventProps = {
  event: HydratedCalendarEvent;
  isSelected?: boolean;
  onSelect?: (event: HydratedCalendarEvent) => void;
};

export function CalendarInspectorEvent({
  event,
  isSelected = false,
  onSelect,
}: CalendarInspectorEventProps) {
  const handleSelect = () => {
    onSelect?.(event);
  };

  return (
    <button
      type="button"
      onClick={handleSelect}
      className={cn(
        "flex w-full items-center justify-between rounded-md border border-border bg-bg px-[12px] py-[10px] text-left transition hover:border-ring hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
        isSelected && "border-success bg-green-50",
      )}
    >
      <div className="flex min-w-0 flex-col gap-[4px]">
        <span className="text-body-2 font-medium text-fg">{event.title}</span>
        {event.description && (
          <span className="text-caption text-fg3 line-clamp-1">
            {event.description}
          </span>
        )}
      </div>
      <div className="ml-[12px] flex min-w-[120px] flex-col items-end gap-[4px] text-right">
        <span className="text-tag text-fg3">
          {event.isAllDay
            ? "All day"
            : event.endsAt
              ? `${format(event.startsAt, "h:mm a")} – ${format(event.endsAt, "h:mm a")}`
              : format(event.startsAt, "h:mm a")}
        </span>
        {event.attendees.length > 0 && (
          <span className="text-caption text-fg4 line-clamp-1 max-w-[160px]">
            {event.attendees.map((person) => person.name).join(", ")}
          </span>
        )}
      </div>
    </button>
  );
}


