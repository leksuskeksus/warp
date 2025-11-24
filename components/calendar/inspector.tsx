"use client";

import { useRef, useState } from "react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { HydratedCalendarEvent } from "@/lib/events-store";
import { CalendarPerson } from "@/lib/people-store";

import type { CalendarEventFormValues } from "./event-form";
import { CalendarEventPanel } from "./event-panel";
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
  onEditEvent?: (event: HydratedCalendarEvent) => void;
  localTimeZone: string;
  className?: string;
  onRequestCreate?: () => void;
  draftEvent?: CalendarEventFormValues | null;
  onSubmitDraft?: (values: CalendarEventFormValues) => void;
  onCancelDraft?: () => void;
  onDraftChange?: (values: CalendarEventFormValues) => void;
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
  onEditEvent,
  localTimeZone,
  className,
  onRequestCreate,
  draftEvent = null,
  onSubmitDraft,
  onCancelDraft,
  onDraftChange,
  draftErrors = [],
  isDraftSaving = false,
  draftFormKey = null,
  people,
}: CalendarInspectorProps) {
  const showCreationForm = Boolean(draftEvent);
  const showEventDetails = Boolean(selectedEvent) && !showCreationForm;
  const [formIsValid, setFormIsValid] = useState(false);
  const formSubmitRef = useRef<(() => void) | null>(null);

  return (
    <div
      className={cn(
        "scrollbar-hide flex-1 overflow-y-auto px-[20px] pb-[24px] text-body-2 text-fg3",
        className,
      )}
    >
      <div className="sticky top-0 z-20 -mx-[20px] mb-[20px] flex h-[51px] items-center justify-between gap-[12px] bg-white px-[6px] py-[7px]">
        {showCreationForm ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCancelDraft}
              disabled={isDraftSaving}
              className="flex h-[35px] items-center rounded-md px-[14px] text-button-2 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                if (formSubmitRef.current) {
                  formSubmitRef.current();
                }
              }}
              disabled={!formIsValid || isDraftSaving}
              className="h-[35px] px-[12px]"
            >
              Save
            </Button>
          </>
        ) : showEventDetails ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onCloseEvent}
              className="flex h-[35px] items-center rounded-md px-[14px] text-button-2 font-medium"
            >
              Close
            </Button>
            {onEditEvent && selectedEvent && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => onEditEvent(selectedEvent)}
                className="h-[35px] px-[12px]"
              >
                Edit
              </Button>
            )}
          </>
        ) : (
          <>
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
          </>
        )}
      </div>

      {showCreationForm && draftEvent ? (
        <CalendarEventPanel
          mode="edit"
          initialValues={draftEvent}
          onSubmit={onSubmitDraft}
          onCancel={onCancelDraft}
          onChange={onDraftChange}
          isSaving={isDraftSaving}
          onValidationChange={setFormIsValid}
          onSubmitRef={(submitFn) => {
            formSubmitRef.current = submitFn;
          }}
          people={people}
        />
      ) : showEventDetails && selectedEvent ? (
        <CalendarEventPanel
          mode="view"
          event={selectedEvent}
          onClose={onCloseEvent}
          localTimeZone={localTimeZone}
        />
      ) : sections.length === 0 ? (
        <div className="flex h-full items-center justify-center text-caption text-fg4">
          No events scheduled
        </div>
      ) : (
        <div className="flex flex-col gap-[20px]">
          {sections.map((section) => (
            <div key={section.date.toISOString()} className="flex flex-col gap-[10px]">
              <div className="sticky top-[51px] z-10 -mx-[20px] flex items-baseline justify-between bg-white px-[20px] py-[8px]">
                <span className="text-caption font-semibold uppercase tracking-[0.12em] text-fg2">
                  {format(section.date, "EEE, MMM d")}
                </span>
                <span className="text-tag text-fg4">
                  {section.events.length} event{section.events.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-col gap-[8px]">
                {section.events.map((event) => {
                  const isGroupedTimeOff = event.id.startsWith("grouped-time-off-");
                  // For grouped time-off, check if any of the underlying events is selected
                  const isAnyTimeOffSelected = isGroupedTimeOff 
                    ? (event as any).__timeOffEvents?.some((e: HydratedCalendarEvent) => e.id === selectedEventId)
                    : false;
                  const actualIsSelected = isGroupedTimeOff ? isAnyTimeOffSelected : selectedEventId === event.id;
                  
                  return (
                    <CalendarInspectorEvent
                      key={event.id}
                      event={event}
                      isSelected={actualIsSelected}
                      onSelect={(e) => {
                        // When clicking grouped time-off, select the first underlying event with all grouped events attached
                        if (isGroupedTimeOff && (e as any).__timeOffEvents?.length > 0) {
                          const firstEvent = (e as any).__timeOffEvents[0];
                          // Attach all grouped events to the selected event
                          (firstEvent as any).__timeOffEvents = (e as any).__timeOffEvents;
                          onSelectEvent(firstEvent);
                        } else {
                          onSelectEvent(e);
                        }
                      }}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


