"use client";

import { CSSProperties, KeyboardEvent, MouseEvent, useEffect, useState } from "react";
import { format } from "date-fns";

import { cn } from "@/lib/cn";
import { HydratedCalendarEvent } from "@/lib/events-store";
import { getEventTypePalette } from "@/lib/calendar";

type CalendarDayCellEventProps = {
  event: HydratedCalendarEvent;
  isSelected?: boolean;
  isPartOfSelectedRecurringSeries?: boolean;
  hasSelectedEvent?: boolean;
  onSelect?: (event: HydratedCalendarEvent) => void;
};

export function CalendarDayCellEvent({
  event,
  isSelected,
  isPartOfSelectedRecurringSeries = false,
  hasSelectedEvent = false,
  onSelect,
}: CalendarDayCellEventProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleClick = (interactionEvent: MouseEvent<HTMLDivElement>) => {
    interactionEvent.stopPropagation();
    if (!isDraft && onSelect) {
      onSelect(event);
    }
  };

  const handleKeyDown = (keyboardEvent: KeyboardEvent<HTMLDivElement>) => {
    if (keyboardEvent.key !== "Enter" && keyboardEvent.key !== " ") {
      return;
    }

    keyboardEvent.preventDefault();
    keyboardEvent.stopPropagation();
    if (!isDraft && onSelect) {
      onSelect(event);
    }
  };

  const isDraft = event.id.startsWith("draft-");
  const palette = getEventTypePalette(event.type, isSelected);
  const isInteractive = Boolean(onSelect) && !isDraft; // Draft events are not interactive
  const shouldBeFullyOpaque = isSelected || isPartOfSelectedRecurringSeries;
  const shouldReduceOpacity = hasSelectedEvent && !shouldBeFullyOpaque;
  const paletteStyle: CSSProperties = {
    "--event-bg": palette.background,
    "--event-fg": palette.foreground,
    "--event-muted": palette.muted,
    "--event-subtle": palette.subtle,
    "--event-ring": palette.ring,
  };

  const shouldShowTime = event.isAllDay || event.title.length <= 18;
  const timeDisplay = event.isAllDay 
    ? "All day"
    : isMounted
      ? format(event.startsAt, "h:mm a")
      : "";

  return (
    <div
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-calendar-day-event="true"
      style={paletteStyle}
      className={cn(
        "flex h-[20px] items-center gap-[6px] rounded-sm bg-[var(--event-bg)] px-[4px] text-tag text-[var(--event-fg)] leading-none outline-none transition",
        isDraft && "opacity-60 border border-dashed border-[var(--event-fg)]/30",
        isInteractive ? "cursor-pointer hover:brightness-105 active:brightness-95" : "cursor-default",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--event-ring)] focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--event-bg)]",
        isSelected && "shadow-[0_0_0_2px_rgba(255,255,255,0.55)]",
        shouldReduceOpacity && "opacity-30",
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
          {timeDisplay}
        </span>
      )}
    </div>
  );
}

