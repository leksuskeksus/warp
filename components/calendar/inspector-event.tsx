"use client";

import { CSSProperties } from "react";
import { format } from "date-fns";

import { cn } from "@/lib/cn";
import { HydratedCalendarEvent } from "@/lib/events-store";
import { getEventTypePalette } from "@/lib/calendar";

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

  const palette = getEventTypePalette(event.type, isSelected);
  const paletteStyle: CSSProperties = {
    "--event-bg": palette.background,
    "--event-fg": palette.foreground,
    "--event-muted": palette.muted,
    "--event-subtle": palette.subtle,
    "--event-ring": palette.ring,
  };

  return (
    <button
      type="button"
      onClick={handleSelect}
      style={paletteStyle}
      aria-pressed={isSelected}
      className={cn(
        "flex w-full items-center justify-between rounded-md bg-[var(--event-bg)] px-[12px] py-[10px] text-left text-[var(--event-fg)] transition hover:brightness-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--event-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--event-bg)]",
        isSelected && "shadow-[0_0_0_2px_rgba(255,255,255,0.55)]",
      )}
    >
      <div className="flex min-w-0 flex-col gap-[4px]">
        <span className="text-body-2 font-medium text-[var(--event-fg)]">{event.title}</span>
        {event.description && (
          <span className="text-caption text-[var(--event-muted)] line-clamp-1">
            {event.description}
          </span>
        )}
      </div>
      <div className="ml-[12px] flex min-w-[120px] flex-col items-end gap-[4px] text-right">
        <span className="text-tag text-[var(--event-muted)]">
          {event.isAllDay
            ? "All day"
            : event.endsAt
              ? `${format(event.startsAt, "h:mm a")} – ${format(event.endsAt, "h:mm a")}`
              : format(event.startsAt, "h:mm a")}
        </span>
        {event.attendees.length > 0 && (
          <span className="max-w-[160px] text-caption text-[var(--event-subtle)] line-clamp-1">
            {event.attendees.map((person) => person.name).join(", ")}
          </span>
        )}
      </div>
    </button>
  );
}


