"use client";

import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { HydratedCalendarEvent } from "@/lib/events-store";
import { CalendarPerson } from "@/lib/people-store";

import { CalendarEventDetails } from "./event-details";
import { CalendarEventForm, CalendarEventFormValues } from "./event-form";
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
  onRequestCreate?: () => void;
  draftEvent?: CalendarEventFormValues | null;
  onSubmitDraft?: (values: CalendarEventFormValues) => void;
  onCancelDraft?: () => void;
  draftErrors?: string[];
  isDraftSaving?: boolean;
  draftFormKey?: string | null;
  people: CalendarPerson[];
};

export function CalendarInspector({
  sections,
  selectedEvent,
  selectedEventId = null,
  onSelectEvent,
  onCloseEvent,
  localTimeZone,
  className,
  onRequestCreate,
  draftEvent = null,
  onSubmitDraft,
  onCancelDraft,
  draftErrors = [],
  isDraftSaving = false,
  draftFormKey = null,
  people,
}: CalendarInspectorProps) {
  const showCreationForm = Boolean(draftEvent);
  const showEventDetails = Boolean(selectedEvent) && !showCreationForm;

  return (
    <div
      className={cn(
        "scrollbar-hide flex-1 overflow-y-auto px-[20px] pb-[24px] text-body-2 text-fg3",
        className,
      )}
    >
      <div className="sticky top-0 z-20 -mx-[20px] mb-[20px] flex h-[51px] items-center justify-between gap-[12px] bg-[rgba(255,255,255,0.92)] px-[6px] py-[7px] backdrop-blur">
        <Button
          variant="secondary"
          size="sm"
          className="flex h-[35px] items-center rounded-md px-[14px] text-button-2 font-medium"
        >
          Filter
        </Button>
        {onRequestCreate && (
          <Button
            variant="primary"
            size="sm"
            onClick={onRequestCreate}
            className="h-[35px] px-[12px]"
          >
            New event
          </Button>
        )}
      </div>

      {showCreationForm && draftEvent && onSubmitDraft && onCancelDraft ? (
        <CalendarEventForm
          key={draftFormKey ?? "calendar-event-form"}
          initialValues={draftEvent}
          onSubmit={onSubmitDraft}
          onCancel={onCancelDraft}
          errors={draftErrors}
          isSaving={isDraftSaving}
          people={people}
        />
      ) : showEventDetails && selectedEvent ? (
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


