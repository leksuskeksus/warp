"use client";

import { format } from "date-fns";

import { cn } from "@/lib/cn";
import { HydratedCalendarEvent } from "@/lib/events-store";

import { CalendarEventDetails } from "./event-details";
import { CalendarInspectorEvent } from "./inspector-event";

export type CalendarInspectorSection = {
  date: Date;
  events: HydratedCalendarEvent[];
};

type CalendarInspectorProps = {
  sections: CalendarInspectorSection[];
  selectedEvent: HydratedCalendarEvent | null;
  selectedEventId?: string | null;
  onSelectEvent: (event: HydratedCalendarEvent) => void;
  onCloseEvent: () => void;
  localTimeZone: string;
  className?: string;
};

export function CalendarInspector({
  sections,
  selectedEvent,
  selectedEventId = null,
  onSelectEvent,
  onCloseEvent,
  localTimeZone,
  className,
}: CalendarInspectorProps) {
  return (
    <div className={cn("scrollbar-hide flex-1 overflow-y-auto px-[20px] pb-[20px] pt-[67px] text-body-2 text-fg3", className)}>
      {selectedEvent ? (
        <CalendarEventDetails event={selectedEvent} onClose={onCloseEvent} localTimeZone={localTimeZone} />
      ) : sections.length === 0 ? (
        <div className="flex h-full items-center justify-center text-caption text-fg4">
          No events scheduled
        </div>
      ) : (
        <div className="flex flex-col gap-[20px]">
          {sections.map((section) => (
            <div key={section.date.toISOString()} className="flex flex-col gap-[10px]">
              <div className="flex items-baseline justify-between">
                <span className="text-caption font-semibold uppercase tracking-[0.12em] text-fg2">
                  {format(section.date, "EEE, MMM d")}
                </span>
                <span className="text-tag text-fg4">
                  {section.events.length} event{section.events.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-col gap-[8px]">
                {section.events.map((event) => (
                  <CalendarInspectorEvent
                    key={event.id}
                    event={event}
                    isSelected={selectedEventId === event.id}
                    onSelect={onSelectEvent}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


