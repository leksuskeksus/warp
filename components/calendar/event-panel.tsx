"use client";

import { MouseEvent, useMemo } from "react";

import { HydratedCalendarEvent } from "@/lib/events-store";
import { formatEventSchedule, getEventTypeLabel } from "@/lib/calendar";

import type { CalendarEventFormValues } from "./event-form";
import { CalendarEventForm } from "./event-form";

type CalendarEventPanelProps =
  | {
      mode: "view";
      event: HydratedCalendarEvent;
      localTimeZone: string;
      onClose: () => void;
    }
  | {
      mode: "edit";
      initialValues: CalendarEventFormValues;
      onSubmit?: (values: CalendarEventFormValues) => void;
      onCancel?: () => void;
      isSaving?: boolean;
      onValidationChange?: (isValid: boolean) => void;
      onSubmitRef?: (submitFn: () => void) => void;
    };

export function CalendarEventPanel(props: CalendarEventPanelProps) {
  if (props.mode === "view") {
    return <CalendarEventPanelView {...props} />;
  }

  return <CalendarEventPanelEdit {...props} />;
}

function CalendarEventPanelView({
  event,
  onClose,
  localTimeZone,
}: {
  event: HydratedCalendarEvent;
  onClose: () => void;
  localTimeZone: string;
}) {
  const typeLabel = getEventTypeLabel(event.type);
  const scheduleLabel = useMemo(() => formatEventSchedule(event), [event]);
  const timezoneLabel = event.timeZone ?? localTimeZone;

  return (
    <div className="flex min-h-full flex-col gap-[20px]">
      <div className="flex flex-col gap-[6px]">
        {typeLabel && (
          <span className="text-caption font-semibold uppercase tracking-[0.12em] text-fg4">
            {typeLabel}
          </span>
        )}
        <h2 className="text-h3 text-fg">{event.title}</h2>
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
            event.attendees.map((person) => <span key={person.id}>{person.name}</span>)
          )}
        </div>
      </div>
    </div>
  );
}

function CalendarEventPanelEdit({
  initialValues,
  onSubmit,
  onCancel,
  isSaving,
  onValidationChange,
  onSubmitRef,
}: {
  initialValues: CalendarEventFormValues;
  onSubmit?: (values: CalendarEventFormValues) => void;
  onCancel?: () => void;
  isSaving?: boolean;
  onValidationChange?: (isValid: boolean) => void;
  onSubmitRef?: (submitFn: () => void) => void;
}) {
  return (
    <CalendarEventForm
      initialValues={initialValues}
      onSubmit={onSubmit}
      isSaving={isSaving}
      onValidationChange={onValidationChange}
      onSubmitRef={onSubmitRef}
    />
  );
}

