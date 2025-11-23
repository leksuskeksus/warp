"use client";

import { KeyboardEvent, MouseEvent } from "react";
import { format } from "date-fns";

import { cn } from "@/lib/cn";
import { HydratedCalendarEvent } from "@/lib/events-store";

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

  const shouldShowTime = event.isAllDay || event.title.length <= 18;

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex h-[20px] cursor-pointer items-center gap-[6px] rounded-sm border border-border bg-bg2/80 px-[2px] text-tag leading-none outline-none transition",
        isSelected && "border-success bg-green-50",
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
}

