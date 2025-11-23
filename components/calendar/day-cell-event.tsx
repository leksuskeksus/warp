"use client";

import { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import { format } from "date-fns";

import { cn } from "@/lib/cn";
import { HydratedCalendarEvent } from "@/lib/events-store";
import { getEventTypePalette } from "@/lib/calendar";

type CalendarDayCellEventProps = {
  event: HydratedCalendarEvent;
  isSelected?: boolean;
  onSelect?: (event: HydratedCalendarEvent) => void;
};

export function CalendarDayCellEvent({ event, isSelected, onSelect }: CalendarDayCellEventProps) {
  const handleClick = (interactionEvent: MouseEvent<HTMLDivElement>) => {
    interactionEvent.stopPropagation();
    onSelect?.(event);
  };

  const handleKeyDown = (keyboardEvent: KeyboardEvent<HTMLDivElement>) => {
    if (keyboardEvent.key !== "Enter" && keyboardEvent.key !== " ") {
      return;
    }

    keyboardEvent.preventDefault();
    keyboardEvent.stopPropagation();
    onSelect?.(event);
  };

  const palette = getEventTypePalette(event.type);
  const isInteractive = Boolean(onSelect);
  const paletteStyle: CSSProperties = {
    "--event-bg": palette.background,
    "--event-fg": palette.foreground,
    "--event-muted": palette.muted,
    "--event-subtle": palette.subtle,
    "--event-ring": palette.ring,
  };

  const shouldShowTime = event.isAllDay || event.title.length <= 18;

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-calendar-day-event="true"
      style={paletteStyle}
      className={cn(
        "flex h-[20px] items-center gap-[6px] rounded-sm bg-[var(--event-bg)] px-[4px] text-tag text-[var(--event-fg)] leading-none outline-none transition",
        isInteractive ? "cursor-pointer hover:brightness-105 active:brightness-95" : "cursor-default",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--event-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--event-bg)]",
        isSelected && "shadow-[0_0_0_2px_rgba(255,255,255,0.55)]",
      )}
      tabIndex={isInteractive ? 0 : -1}
      role={isInteractive ? "button" : undefined}
      aria-pressed={isInteractive ? !!isSelected : undefined}
    >
      <span className="min-w-0 overflow-hidden whitespace-nowrap text-[var(--event-fg)]">
        {event.title}
      </span>
      {shouldShowTime && (
        <span className="ml-auto shrink-0 whitespace-nowrap text-[var(--event-muted)]">
          {event.isAllDay ? "All day" : format(event.startsAt, "h:mm a")}
        </span>
      )}
    </div>
  );
}

