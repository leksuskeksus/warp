"use client";

import { type ChangeEvent, type FormEvent, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { EVENT_TYPE_LABELS } from "@/lib/calendar";
import { CalendarEventType } from "@/lib/events-store";
import { CalendarPerson } from "@/lib/people-store";

type EventTypeConfiguration = {
  requiresPerson: boolean;
  requiresTitle: boolean;
  autoTitleWithPerson: boolean;
  personLabel?: string;
  defaultAllDay: boolean;
  showAllDayToggle: boolean;
  showTimeInputs: boolean;
  showEndDate: boolean;
  showEndTime: boolean;
  showLocation: boolean;
  showDescription: boolean;
  showAttendees: boolean;
  showRecurrence: boolean;
};

const EVENT_TYPE_CONFIG: Record<CalendarEventType, EventTypeConfiguration> = {
  "time-off": {
    requiresPerson: true,
    requiresTitle: false,
    autoTitleWithPerson: true,
    personLabel: "Team member",
    defaultAllDay: true,
    showAllDayToggle: false,
    showTimeInputs: false,
    showEndDate: true,
    showEndTime: false,
    showLocation: false,
    showDescription: true,
    showAttendees: false,
    showRecurrence: false,
  },
  birthday: {
    requiresPerson: true,
    requiresTitle: false,
    autoTitleWithPerson: true,
    personLabel: "Celebrated teammate",
    defaultAllDay: true,
    showAllDayToggle: false,
    showTimeInputs: false,
    showEndDate: false,
    showEndTime: false,
    showLocation: false,
    showDescription: true,
    showAttendees: false,
    showRecurrence: false,
  },
  "work-anniversary": {
    requiresPerson: true,
    requiresTitle: false,
    autoTitleWithPerson: true,
    personLabel: "Honoree",
    defaultAllDay: true,
    showAllDayToggle: false,
    showTimeInputs: false,
    showEndDate: false,
    showEndTime: false,
    showLocation: false,
    showDescription: true,
    showAttendees: false,
    showRecurrence: false,
  },
  "company-event": {
    requiresPerson: false,
    requiresTitle: true,
    autoTitleWithPerson: false,
    defaultAllDay: false,
    showAllDayToggle: true,
    showTimeInputs: true,
    showEndDate: true,
    showEndTime: true,
    showLocation: true,
    showDescription: true,
    showAttendees: true,
    showRecurrence: false,
  },
  deadline: {
    requiresPerson: false,
    requiresTitle: true,
    autoTitleWithPerson: false,
    defaultAllDay: false,
    showAllDayToggle: true,
    showTimeInputs: true,
    showEndDate: false,
    showEndTime: false,
    showLocation: false,
    showDescription: true,
    showAttendees: false,
    showRecurrence: true,
  },
};

export type CalendarEventFormValues = {
  title: string;
  type: CalendarEventType;
  isAllDay: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timeZone: string;
  location: string;
  description: string;
  ownerName: string;
  ownerEmail: string;
  attendeesInput: string;
  recurrenceRule: string;
  personId: string;
};

type CalendarEventFormProps = {
  initialValues: CalendarEventFormValues;
  onSubmit: (values: CalendarEventFormValues) => void | Promise<void>;
  onCancel: () => void;
  errors?: string[];
  isSaving?: boolean;
  people: CalendarPerson[];
};

export function CalendarEventForm({
  initialValues,
  onSubmit,
  onCancel,
  errors = [],
  isSaving = false,
  people,
}: CalendarEventFormProps) {
  const [values, setValues] = useState<CalendarEventFormValues>(initialValues);

  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

  const selectedPerson = useMemo(
    () => people.find((person) => person.id === values.personId) ?? null,
    [people, values.personId],
  );

  const activeConfig = useMemo(() => EVENT_TYPE_CONFIG[values.type], [values.type]);

  const handleChange =
    (field: keyof CalendarEventFormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { value } = event.target;
      setValues((previous) => ({
        ...previous,
        [field]: value,
      }));
    };

  const handleTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextType = event.target.value as CalendarEventType;
    const nextConfig = EVENT_TYPE_CONFIG[nextType];

    setValues((previous) => {
      const next: CalendarEventFormValues = {
        ...previous,
        type: nextType,
        isAllDay: nextConfig.showTimeInputs ? nextConfig.defaultAllDay : true,
      };

      if (!nextConfig.showTimeInputs) {
        next.startTime = "00:00";
        next.endTime = "";
      } else if (nextConfig.defaultAllDay) {
        next.startTime = "00:00";
        next.endTime = nextConfig.showEndTime ? "23:59" : "";
      } else {
        next.startTime =
          previous.startTime && previous.startTime !== "00:00" ? previous.startTime : "09:00";
        next.endTime = nextConfig.showEndTime
          ? previous.endTime && previous.endTime !== "00:00"
            ? previous.endTime
            : "10:00"
          : "";
      }

      if (!nextConfig.showEndDate) {
        next.endDate = "";
      } else if (!previous.endDate) {
        next.endDate = previous.startDate;
      }

      if (!nextConfig.showDescription) {
        next.description = "";
      }

      if (!nextConfig.showLocation) {
        next.location = "";
      }

      if (!nextConfig.showAttendees) {
        next.attendeesInput = "";
      }

      if (!nextConfig.showRecurrence) {
        next.recurrenceRule = "";
      }

      if (nextConfig.requiresPerson) {
        next.personId = "";
        next.title = "";
        next.ownerName = "";
        next.ownerEmail = "";
      } else {
        next.personId = "";
        if (!previous.ownerName) {
          next.ownerName = initialValues.ownerName;
        }
        if (!previous.ownerEmail) {
          next.ownerEmail = initialValues.ownerEmail;
        }
      }

      if (!nextConfig.requiresTitle) {
        next.title = "";
      }

      return next;
    });
  };

  const handleCheckboxChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { checked } = event.target;
    setValues((previous) => {
      const config = EVENT_TYPE_CONFIG[previous.type];
      return {
        ...previous,
        isAllDay: checked,
        ...(checked
          ? {
              startTime: "00:00",
              endTime: config.showEndTime ? "23:59" : "",
            }
          : {
              startTime: previous.startTime === "00:00" ? "09:00" : previous.startTime,
              endTime: config.showEndTime
                ? previous.endTime && previous.endTime !== "00:00"
                  ? previous.endTime
                  : "10:00"
                : "",
            }),
      };
    });
  };

  const handlePersonChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const nextPersonId = event.target.value;
    const person = people.find((candidate) => candidate.id === nextPersonId) ?? null;
    setValues((previous) => ({
      ...previous,
      personId: nextPersonId,
      ownerName: person ? person.name : previous.ownerName,
      ownerEmail: person?.email ?? previous.ownerEmail,
    }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <div className="flex h-full flex-col pb-[20px]">
      <header className="flex flex-col gap-[6px] border-b border-border pb-[14px]">
        <div className="flex items-start justify-between gap-[12px]">
          <div className="flex flex-col gap-[2px]">
            <span className="text-caption font-semibold uppercase tracking-[0.12em] text-fg4">
              Create
            </span>
            <h2 className="text-h3 text-fg">New event</h2>
          </div>
          <div className="flex items-center gap-[8px]">
            <Button
              variant="subtle"
              size="sm"
              type="button"
              onClick={onCancel}
              className="h-[32px] px-[12px]"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              type="submit"
              form="calendar-event-form"
              disabled={isSaving}
              className="h-[32px] px-[16px]"
            >
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
        <p className="text-caption text-fg3">
          Fill the details below to add a new event to your calendar.
        </p>
      </header>

      {errors.length > 0 && (
        <div className="mt-[16px] flex flex-col gap-[6px] rounded-md border border-destructive/40 bg-destructive/10 px-[12px] py-[10px] text-caption text-destructive">
          {errors.map((error) => (
            <span key={error}>{error}</span>
          ))}
        </div>
      )}

      <form
        id="calendar-event-form"
        onSubmit={handleSubmit}
        className="mt-[16px] flex flex-1 flex-col gap-[18px] overflow-y-auto pr-[4px]"
      >
        <section className="flex flex-col gap-[12px]">
          <label className="flex flex-col gap-[6px]">
            <span className="text-caption font-medium uppercase tracking-[0.08em] text-fg3">
              Event type
            </span>
            <Select value={values.type} onChange={handleTypeChange}>
              {Object.entries(EVENT_TYPE_LABELS).map(([type, label]) => (
                <option key={type} value={type}>
                  {label}
                </option>
              ))}
            </Select>
          </label>

          {activeConfig.requiresPerson ? (
            <label className="flex flex-col gap-[6px]">
              <span className="text-caption font-medium uppercase tracking-[0.08em] text-fg3">
                {activeConfig.personLabel ?? "Person"}
              </span>
              <Select
                value={values.personId}
                onChange={handlePersonChange}
                required
                disabled={people.length === 0}
              >
                <option value="" disabled>
                  {people.length === 0 ? "No people available" : "Select a person"}
                </option>
                {people.map((person) => (
                  <option key={person.id} value={person.id}>
                    {person.name}
                  </option>
                ))}
              </Select>
              <span className="text-caption text-fg4">
                {people.length === 0
                  ? "Add people before creating this event type."
                  : "Required for this event type."}
              </span>
            </label>
          ) : (
            activeConfig.requiresTitle && (
              <label className="flex flex-col gap-[6px]">
                <span className="text-caption font-medium uppercase tracking-[0.08em] text-fg3">
                  Title
                </span>
                <Input
                  value={values.title}
                  onChange={handleChange("title")}
                  placeholder="Add a title"
                  required
                />
              </label>
            )
          )}

          {activeConfig.requiresPerson && (
            <div className="rounded-md border border-border bg-bg px-[12px] py-[10px] text-caption text-fg3">
              {selectedPerson
                ? `Title will be generated automatically for ${selectedPerson.name}.`
                : "Select a person to generate the event title automatically."}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-[12px]">
          {activeConfig.showAllDayToggle && (
            <div className="flex items-center gap-[8px]">
              <input
                id="all-day-toggle"
                type="checkbox"
                checked={values.isAllDay}
                onChange={handleCheckboxChange}
                className="size-[16px] cursor-pointer accent-success"
              />
              <label htmlFor="all-day-toggle" className="text-body-2 text-fg">
                All day
              </label>
            </div>
          )}

          <div
            className={`grid gap-[10px] ${
              activeConfig.showTimeInputs ? "grid-cols-2" : "grid-cols-1"
            }`}
          >
            <label className="flex flex-col gap-[6px]">
              <span className="text-caption font-medium uppercase tracking-[0.08em] text-fg3">
                Start date
              </span>
              <Input
                type="date"
                value={values.startDate}
                onChange={handleChange("startDate")}
                required
              />
            </label>

            {activeConfig.showTimeInputs && (
              <label className="flex flex-col gap-[6px]">
                <span className="text-caption font-medium uppercase tracking-[0.08em] text-fg3">
                  Start time
                </span>
                <Input
                  type="time"
                  value={values.startTime}
                  onChange={handleChange("startTime")}
                  required={!values.isAllDay}
                  disabled={values.isAllDay}
                />
              </label>
            )}
          </div>

          {activeConfig.showEndDate && (
            <div
              className={`grid gap-[10px] ${
                activeConfig.showTimeInputs && activeConfig.showEndTime ? "grid-cols-2" : "grid-cols-1"
              }`}
            >
              <label className="flex flex-col gap-[6px]">
                <span className="text-caption font-medium uppercase tracking-[0.08em] text-fg3">
                  {values.type === "time-off" ? "End date (optional)" : "End date"}
                </span>
                <Input
                  type="date"
                  value={values.endDate}
                  onChange={handleChange("endDate")}
                />
              </label>

              {activeConfig.showTimeInputs && activeConfig.showEndTime && (
                <label className="flex flex-col gap-[6px]">
                  <span className="text-caption font-medium uppercase tracking-[0.08em] text-fg3">
                    End time
                  </span>
                  <Input
                    type="time"
                    value={values.endTime}
                    onChange={handleChange("endTime")}
                    disabled={values.isAllDay}
                  />
                </label>
              )}
            </div>
          )}

          {activeConfig.showTimeInputs && !values.isAllDay && (
            <label className="flex flex-col gap-[6px]">
              <span className="text-caption font-medium uppercase tracking-[0.08em] text-fg3">
                Time zone
              </span>
              <Input
                value={values.timeZone}
                onChange={handleChange("timeZone")}
                placeholder="e.g. America/Los_Angeles"
              />
            </label>
          )}
        </section>

        {activeConfig.showLocation && (
          <section className="flex flex-col gap-[12px]">
            <label className="flex flex-col gap-[6px]">
              <span className="text-caption font-medium uppercase tracking-[0.08em] text-fg3">
                Location
              </span>
              <Input
                value={values.location}
                onChange={handleChange("location")}
                placeholder="Add a location or link"
              />
            </label>
          </section>
        )}

        {activeConfig.showDescription && (
          <section className="flex flex-col gap-[12px]">
            <label className="flex flex-col gap-[6px]">
              <span className="text-caption font-medium uppercase tracking-[0.08em] text-fg3">
                Notes
              </span>
              <Textarea
                value={values.description}
                onChange={handleChange("description")}
                placeholder="Optional context or instructions"
              />
            </label>
          </section>
        )}

        {activeConfig.showAttendees && (
          <section className="flex flex-col gap-[12px]">
            <label className="flex flex-col gap-[6px]">
              <span className="text-caption font-medium uppercase tracking-[0.08em] text-fg3">
                Attendees
              </span>
              <Textarea
                value={values.attendeesInput}
                onChange={handleChange("attendeesInput")}
                placeholder="One attendee per line (Name &lt;email@domain&gt;)"
                className="min-h-[72px]"
              />
              <span className="text-caption text-fg4">
                Each new line will add an attendee. Email is optional.
              </span>
            </label>
          </section>
        )}

        {activeConfig.showRecurrence && (
          <section className="flex flex-col gap-[12px]">
            <label className="flex flex-col gap-[6px]">
              <span className="text-caption font-medium uppercase tracking-[0.08em] text-fg3">
                Recurrence rule
              </span>
              <Input
                value={values.recurrenceRule}
                onChange={handleChange("recurrenceRule")}
                placeholder="e.g. FREQ=WEEKLY;BYDAY=MO"
              />
              <span className="text-caption text-fg4">
                Use iCal RRULE format to repeat automatically.
              </span>
            </label>
          </section>
        )}
      </form>
    </div>
  );
}

