"use client";

import { MouseEvent, useMemo } from "react";

import { HydratedCalendarEvent } from "@/lib/events-store";
import { formatEventSchedule, getEventTypeLabel } from "@/lib/calendar";

type CalendarEventDetailsProps = {
  event: HydratedCalendarEvent;
  onClose: () => void;
  localTimeZone: string;
};

export function CalendarEventDetails({ event, onClose, localTimeZone }: CalendarEventDetailsProps) {
  const typeLabel = getEventTypeLabel(event.type);
  const scheduleLabel = useMemo(() => formatEventSchedule(event), [event]);

  const timezoneLabel = event.timeZone ?? localTimeZone;

  const handleClose = (interactionEvent: MouseEvent<HTMLButtonElement>) => {
    interactionEvent.preventDefault();
    onClose();
  };

  return (
    <div className="flex h-full flex-col gap-[20px]">
      <div className="flex items-start justify-between gap-[12px]">
        <div className="flex flex-col gap-[6px]">
          {typeLabel && (
            <span className="text-caption font-semibold uppercase tracking-[0.12em] text-fg4">
              {typeLabel}
            </span>
          )}
          <h2 className="text-h3 text-fg">{event.title}</h2>
        </div>
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close event details"
          className="flex size-[32px] items-center justify-center rounded-full border border-border bg-bg2 text-button-2 font-medium text-fg transition hover:border-ring hover:bg-bg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
        >
          X
        </button>
      </div>

      <div className="flex flex-col gap-[16px] rounded-md border border-border bg-bg px-[16px] py-[16px] text-fg">
        <div className="flex flex-col gap-[4px]">
          <span className="text-caption uppercase tracking-[0.08em] text-fg4">Schedule</span>
          <span className="text-body-2 text-fg">{scheduleLabel}</span>
          {(event.timeZone || !event.isAllDay) && (
            <span className="text-caption text-fg4">{timezoneLabel}</span>
          )}
        </div>

        {event.location && (
          <div className="flex flex-col gap-[4px]">
            <span className="text-caption uppercase tracking-[0.08em] text-fg4">Location</span>
            <span className="text-body-2 text-fg">{event.location}</span>
          </div>
        )}

        {event.recurrenceRule && (
          <div className="flex flex-col gap-[4px]">
            <span className="text-caption uppercase tracking-[0.08em] text-fg4">Repeats</span>
            <span className="text-body-2 text-fg3">{event.recurrenceRule}</span>
          </div>
        )}
      </div>

      {event.description && (
        <div className="flex flex-col gap-[6px]">
          <span className="text-caption uppercase tracking-[0.08em] text-fg4">Description</span>
          <p className="whitespace-pre-wrap text-body-2 text-fg3">{event.description}</p>
        </div>
      )}

      <div className="flex flex-col gap-[6px]">
        <span className="text-caption uppercase tracking-[0.08em] text-fg4">People</span>
        <div className="flex flex-col gap-[4px] text-body-2 text-fg">
          <span>
            {event.owner.name}
            <span className="text-caption text-fg4"> · Organizer</span>
          </span>
          {event.attendees.length === 0 ? (
            <span className="text-caption text-fg4">No additional attendees</span>
          ) : (
            event.attendees.map((person) => (
              <span key={person.id}>{person.name}</span>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


