"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EVENT_TYPE_LABELS } from "@/lib/calendar";
import { CalendarEventType } from "@/lib/events-store";
import { CalendarPerson } from "@/lib/people-store";

export type CalendarEventFormValues = {
  // Placeholder type - minimal structure to prevent type errors
  // To be redesigned from scratch
  type: CalendarEventType;
  title: string;
  isAllDay: boolean;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  timeZone: string;
  location: string;
  description: string;
  attendeesInput: string;
  recurrenceRule: string;
  personId: string;
  ownerName: string;
  ownerEmail: string;
};

type CalendarEventFormProps = {
  initialValues: CalendarEventFormValues;
  onSubmit?: (values: CalendarEventFormValues) => void;
  isSaving?: boolean;
  onValidationChange?: (isValid: boolean) => void;
  onSubmitRef?: (submitFn: () => void) => void;
  people?: CalendarPerson[];
};

const EVENT_TYPE_OPTIONS: CalendarEventType[] = [
  "company-event",
  "deadline",
  "time-off",
  "birthday",
  "work-anniversary",
];

const REPEAT_OPTIONS = [
  { value: "", label: "Never" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

export function CalendarEventForm({
  initialValues,
  onSubmit,
  isSaving = false,
  onValidationChange,
  onSubmitRef,
  people = [],
}: CalendarEventFormProps) {
  const typeSelectId = useId();
  const startDateId = useId();
  const startTimeId = useId();
  const endDateId = useId();
  const endTimeId = useId();
  const repeatId = useId();
  const participantsSelectId = useId();
  
  const [values, setValues] = useState<CalendarEventFormValues>(initialValues);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<Set<string>>(new Set());
  const formRef = useRef<HTMLFormElement>(null);

  // Sync with initialValues changes
  useEffect(() => {
    setValues(initialValues);
    // Parse existing attendees from attendeesInput
    if (initialValues.attendeesInput) {
      const lines = initialValues.attendeesInput.split(/\r?\n/).filter(Boolean);
      const ids = new Set<string>();
      lines.forEach((line) => {
        const person = people.find((p) => {
          const match = line.match(/<([^>]+)>/);
          const email = match?.[1]?.trim();
          return p.email === email || p.name === line.replace(/<[^>]+>/, "").trim();
        });
        if (person) {
          ids.add(person.id);
        }
      });
      setSelectedParticipantIds(ids);
    }
  }, [initialValues, people]);

  // Basic validation - can be expanded later
  const isValid = true; // Placeholder - will be implemented with actual validation

  // Notify parent of validation state changes
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(isValid);
    }
  }, [isValid, onValidationChange]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (isValid && onSubmit) {
      // Convert selected participants to attendeesInput format
      const attendeesLines = Array.from(selectedParticipantIds).map((id) => {
        const person = people.find((p) => p.id === id);
        if (!person) return "";
        return person.email ? `${person.name} <${person.email}>` : person.name;
      });
      onSubmit({
        ...values,
        attendeesInput: attendeesLines.join("\n"),
      });
    }
  };

  // Expose submit handler to parent
  useEffect(() => {
    if (onSubmitRef) {
      onSubmitRef(() => {
        if (formRef.current) {
          formRef.current.requestSubmit();
        } else {
          handleSubmit();
        }
      });
    }
  }, [onSubmitRef, onSubmit, isValid, values, selectedParticipantIds, people]);

  const handleChange = (field: keyof CalendarEventFormValues) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setValues((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  const handleParticipantAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const personId = e.target.value;
    if (personId && !selectedParticipantIds.has(personId)) {
      setSelectedParticipantIds((prev) => new Set([...prev, personId]));
      e.target.value = ""; // Reset select
    }
  };

  const handleParticipantRemove = (personId: string) => {
    setSelectedParticipantIds((prev) => {
      const next = new Set(prev);
      next.delete(personId);
      return next;
    });
  };

  const availablePeople = people.filter((p) => !selectedParticipantIds.has(p.id));
  const selectedParticipants = people.filter((p) => selectedParticipantIds.has(p.id));

  // For now, only show full form for company-event
  const isCompanyEvent = values.type === "company-event";

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex min-h-full flex-col">
      <div className="flex-1 -mx-[20px] space-y-[20px] px-[20px] pb-[32px] pt-[8px]">
        {isCompanyEvent ? (
          <>
            {/* Type */}
            <div className="flex items-center">
              <label htmlFor={typeSelectId} className="w-[100px] shrink-0 text-body-2 text-fg">
                Type
              </label>
              <Select
                id={typeSelectId}
                value={values.type}
                onChange={handleChange("type")}
                disabled={isSaving}
                className="flex-1 max-w-[420px]"
              >
                {EVENT_TYPE_OPTIONS.map((type) => (
                  <option key={type} value={type}>
                    {EVENT_TYPE_LABELS[type]}
                  </option>
                ))}
              </Select>
            </div>

            {/* Starts */}
            <div className="flex items-center">
              <label htmlFor={startDateId} className="w-[100px] shrink-0 text-body-2 text-fg">
                Starts
              </label>
              <div className="flex flex-1 items-center gap-[8px] max-w-[420px]">
                <Input
                  id={startDateId}
                  type="text"
                  value={values.startDate}
                  onChange={handleChange("startDate")}
                  disabled={isSaving}
                  placeholder="YYYY-MM-DD"
                  className="flex-1"
                />
                <Input
                  id={startTimeId}
                  type="text"
                  value={values.startTime}
                  onChange={handleChange("startTime")}
                  disabled={isSaving}
                  placeholder="HH:MM"
                  className="w-[120px]"
                />
              </div>
            </div>

            {/* Ends */}
            <div className="flex items-center">
              <label htmlFor={endDateId} className="w-[100px] shrink-0 text-body-2 text-fg">
                Ends
              </label>
              <div className="flex flex-1 items-center gap-[8px] max-w-[420px]">
                <Input
                  id={endDateId}
                  type="text"
                  value={values.endDate}
                  onChange={handleChange("endDate")}
                  disabled={isSaving}
                  placeholder="YYYY-MM-DD"
                  className="flex-1"
                />
                <Input
                  id={endTimeId}
                  type="text"
                  value={values.endTime}
                  onChange={handleChange("endTime")}
                  disabled={isSaving}
                  placeholder="HH:MM"
                  className="w-[120px]"
                />
              </div>
            </div>

            {/* Repeat */}
            <div className="flex items-center">
              <label htmlFor={repeatId} className="w-[100px] shrink-0 text-body-2 text-fg">
                Repeat
              </label>
              <Select
                id={repeatId}
                value={values.recurrenceRule || ""}
                onChange={handleChange("recurrenceRule")}
                disabled={isSaving}
                className="flex-1 max-w-[420px]"
              >
                {REPEAT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            {/* Participants */}
            <div className="flex items-start">
              <label htmlFor={participantsSelectId} className="w-[100px] shrink-0 pt-[10px] text-body-2 text-fg">
                Participants
              </label>
              <div className="flex flex-1 flex-col gap-[8px] max-w-[420px]">
                {/* Creator/Organizer */}
                <div className="flex items-center gap-[8px] text-body-2 text-fg">
                  <span>{values.ownerName || "You"}</span>
                  <span className="text-caption text-fg4">· Organizer</span>
                </div>
                
                {/* Selected participants */}
                {selectedParticipants.map((person) => (
                  <div key={person.id} className="flex items-center gap-[8px]">
                    <span className="text-body-2 text-fg">{person.name}</span>
                    <button
                      type="button"
                      onClick={() => handleParticipantRemove(person.id)}
                      disabled={isSaving}
                      className="text-caption text-fg4 hover:text-fg2"
                    >
                      Remove
                    </button>
                  </div>
                ))}

                {/* Add participant dropdown */}
                {availablePeople.length > 0 && (
                  <Select
                    id={participantsSelectId}
                    value=""
                    onChange={handleParticipantAdd}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    <option value="">Add participant...</option>
                    {availablePeople.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.name}
                      </option>
                    ))}
                  </Select>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Fallback for other event types - keep existing layout */
        <section className="flex flex-col gap-[12px]">
          <label htmlFor={typeSelectId} className="flex flex-col gap-[6px]">
            <span className="text-tag font-semibold uppercase tracking-[0.12em] text-fg3">
              Event type
            </span>
            <Select
              id={typeSelectId}
              value={values.type}
                onChange={handleChange("type")}
              disabled={isSaving}
            >
              {EVENT_TYPE_OPTIONS.map((type) => (
                <option key={type} value={type}>
                  {EVENT_TYPE_LABELS[type]}
                </option>
              ))}
            </Select>
          </label>
        </section>
        )}
      </div>
    </form>
  );
}
