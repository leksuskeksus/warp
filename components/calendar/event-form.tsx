"use client";

import { useEffect, useLayoutEffect, useId, useRef, useState } from "react";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EVENT_TYPE_LABELS } from "@/lib/calendar";
import { CalendarEventType } from "@/lib/events-store";
import { CalendarPerson } from "@/lib/people-store";

// Simple avatar component
function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  
  // Generate a consistent color based on name
  const hash = name.split("").reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const hue = Math.abs(hash) % 360;
  
  return (
    <div
      className="flex items-center justify-center rounded-full text-body-2 font-medium text-white"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: `hsl(${hue}, 65%, 50%)`,
      }}
    >
      {initials}
    </div>
  );
}

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
  onChange?: (values: CalendarEventFormValues) => void;
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
  { value: "", label: "Does not repeat" },
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

function getEventNamePlaceholder(type: CalendarEventType): string {
  switch (type) {
    case "company-event":
      return "Event name";
    case "deadline":
      return "Deadline name";
    case "time-off":
      return "Time off reason";
    case "birthday":
      return "Person's name";
    case "work-anniversary":
      return "Person's name";
    default:
      return "Event name";
  }
}

export function CalendarEventForm({
  initialValues,
  onSubmit,
  isSaving = false,
  onValidationChange,
  onSubmitRef,
  onChange,
  people = [],
}: CalendarEventFormProps) {
  const typeSelectId = useId();
  const nameInputId = useId();
  const birthdayBoyId = useId();
  const allDayId = useId();
  const startDateId = useId();
  const startTimeId = useId();
  const endDateId = useId();
  const endTimeId = useId();
  const repeatId = useId();
  const participantsSelectId = useId();
  
  const [values, setValues] = useState<CalendarEventFormValues>(initialValues);
  const [selectedParticipantIds, setSelectedParticipantIds] = useState<Set<string>>(new Set());
  const formRef = useRef<HTMLFormElement>(null);
  const isInitialMount = useRef(true);
  const onChangeRef = useRef(onChange);
  const prevValuesRef = useRef<CalendarEventFormValues>(initialValues);
  const lastBirthdayPersonIdRef = useRef<string | null>(null);

  // Keep onChange ref up to date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Sync with initialValues changes
  useEffect(() => {
    setValues(initialValues);
    prevValuesRef.current = initialValues;
    isInitialMount.current = true;
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

  // Store people in a ref to avoid dependency array issues
  const peopleRef = useRef(people);
  useEffect(() => {
    peopleRef.current = people;
  }, [people]);

  // Auto-update title and settings based on event type
  useEffect(() => {
    const isBirthday = values.type === "birthday";
    const isTimeOff = values.type === "time-off";
    const isWorkAnniversary = values.type === "work-anniversary";
    
    if (isBirthday) {
      const selectedPerson = values.personId ? peopleRef.current.find((p) => p.id === values.personId) : null;
      const personChanged = values.personId !== lastBirthdayPersonIdRef.current;
      
      // Update title if person changed or if title doesn't match expected
      if (selectedPerson && personChanged) {
        const expectedTitle = `${selectedPerson.name}'s Birthday`;
        lastBirthdayPersonIdRef.current = values.personId || null;
        setValues((prev) => ({
          ...prev,
          title: expectedTitle,
          isAllDay: true,
          recurrenceRule: "yearly",
        }));
      } else if (isBirthday && (!values.isAllDay || values.recurrenceRule !== "yearly")) {
        // Ensure settings are correct even if person hasn't changed
        setValues((prev) => ({
          ...prev,
          isAllDay: true,
          recurrenceRule: "yearly",
        }));
      }
    } else if (isTimeOff || isWorkAnniversary) {
      // Time-off and work-anniversary are always all-day
      if (!values.isAllDay) {
        setValues((prev) => ({ ...prev, isAllDay: true }));
      }
      
      if (isWorkAnniversary) {
        // Work-anniversary always repeats yearly
        if (values.recurrenceRule !== "yearly") {
          setValues((prev) => ({ ...prev, recurrenceRule: "yearly" }));
        }
        
        // Auto-update title for work-anniversary when person changes
        if (values.personId) {
          const selectedPerson = peopleRef.current.find((p) => p.id === values.personId);
          if (selectedPerson) {
            const expectedTitle = `${selectedPerson.name}'s Work Anniversary`;
            if (values.title !== expectedTitle) {
              setValues((prev) => ({ ...prev, title: expectedTitle }));
            }
          }
        }
      } else if (isTimeOff) {
        // Auto-update title for time-off when person changes
        if (values.personId) {
          const selectedPerson = peopleRef.current.find((p) => p.id === values.personId);
          if (selectedPerson) {
            const expectedTitle = `${selectedPerson.name} Time Off`;
            if (values.title !== expectedTitle) {
              setValues((prev) => ({ ...prev, title: expectedTitle }));
            }
          }
        }
      }
      
      // Reset ref when not birthday type
      if (isTimeOff || isWorkAnniversary) {
        lastBirthdayPersonIdRef.current = null;
      }
    } else {
      // Reset ref when not a person event type
      lastBirthdayPersonIdRef.current = null;
    }
  }, [values.type, values.personId, values.isAllDay, values.recurrenceRule, values.title]);

  // Notify parent of value changes in real-time (using useLayoutEffect for immediate updates)
  useLayoutEffect(() => {
    // Skip initial mount to avoid calling onChange on first render
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevValuesRef.current = values;
      return;
    }

    // Quick shallow comparison
    const hasChanged = 
      prevValuesRef.current.title !== values.title ||
      prevValuesRef.current.type !== values.type ||
      prevValuesRef.current.isAllDay !== values.isAllDay ||
      prevValuesRef.current.startDate !== values.startDate ||
      prevValuesRef.current.startTime !== values.startTime ||
      prevValuesRef.current.endDate !== values.endDate ||
      prevValuesRef.current.endTime !== values.endTime ||
      prevValuesRef.current.recurrenceRule !== values.recurrenceRule ||
      prevValuesRef.current.attendeesInput !== values.attendeesInput;

    if (hasChanged && onChangeRef.current) {
      prevValuesRef.current = values;
      // Call immediately in useLayoutEffect - runs synchronously after DOM updates but before paint
      onChangeRef.current(values);
    }
  }, [values]);

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

  const handleCheckboxChange = (field: keyof CalendarEventFormValues) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setValues((prev) => ({
      ...prev,
      [field]: e.target.checked,
    }));
  };

  const handleParticipantAdd = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const personId = e.target.value;
    if (personId && !selectedParticipantIds.has(personId)) {
      setSelectedParticipantIds((prev) => {
        const next = new Set([...prev, personId]);
        // Update attendeesInput
        setValues((currentValues) => {
          const attendeesLines = Array.from(next).map((id) => {
            const person = people.find((p) => p.id === id);
            if (!person) return "";
            return person.email ? `${person.name} <${person.email}>` : person.name;
          });
          return {
            ...currentValues,
            attendeesInput: attendeesLines.join("\n"),
          };
        });
        return next;
      });
      e.target.value = ""; // Reset select
    }
  };

  const handleParticipantRemove = (personId: string) => {
    setSelectedParticipantIds((prev) => {
      const next = new Set(prev);
      next.delete(personId);
      // Update attendeesInput
      setValues((currentValues) => {
        const attendeesLines = Array.from(next).map((id) => {
          const person = people.find((p) => p.id === id);
          if (!person) return "";
          return person.email ? `${person.name} <${person.email}>` : person.name;
        });
        return {
          ...currentValues,
          attendeesInput: attendeesLines.join("\n"),
        };
      });
      return next;
    });
  };

  const availablePeople = people.filter((p) => !selectedParticipantIds.has(p.id));
  const selectedParticipants = people.filter((p) => selectedParticipantIds.has(p.id));

  const isCompanyEvent = values.type === "company-event";
  const isBirthday = values.type === "birthday";
  const isTimeOff = values.type === "time-off";
  const isDeadline = values.type === "deadline";
  const isWorkAnniversary = values.type === "work-anniversary";
  const isPersonEvent = isBirthday || isTimeOff || isWorkAnniversary;

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex min-h-full flex-col">
      <div className="flex-1 -mx-[20px] space-y-[20px] px-[20px] pb-[32px] pt-[8px]">
        {isCompanyEvent || isBirthday || isTimeOff || isDeadline || isWorkAnniversary ? (
          <>
            {/* Name */}
            <div className="flex items-center gap-[12px]">
              <label htmlFor={nameInputId} className="text-body-2 text-fg">
                Name
              </label>
              <Input
                id={nameInputId}
                type="text"
                value={values.title}
                onChange={handleChange("title")}
                disabled={isSaving}
                placeholder={getEventNamePlaceholder(values.type)}
                className="flex-1 max-w-[420px]"
              />
            </div>

            {/* Type */}
            <div className="flex items-center gap-[12px]">
              <label htmlFor={typeSelectId} className="text-body-2 text-fg">
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

            {/* Person selector - for birthday, time-off, and work-anniversary */}
            {isPersonEvent && (
              <div className="flex items-center gap-[12px]">
                <label htmlFor={birthdayBoyId} className="text-body-2 text-fg">
                  {isBirthday ? "Person" : isTimeOff ? "Person" : "Person"}
                </label>
                <Select
                  id={birthdayBoyId}
                  value={values.personId || ""}
                  onChange={handleChange("personId")}
                  disabled={isSaving}
                  className="flex-1 max-w-[420px]"
                >
                  <option value="">Select person...</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.id}>
                      {person.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* All day checkbox - shown for company-event and deadline */}
            {(isCompanyEvent || isDeadline) && (
              <div className="flex items-center">
                <label htmlFor={allDayId} className="flex items-center gap-[8px] cursor-pointer">
                  <input
                    id={allDayId}
                    type="checkbox"
                    checked={values.isAllDay}
                    onChange={handleCheckboxChange("isAllDay")}
                    disabled={isSaving}
                    className="w-[16px] h-[16px] cursor-pointer"
                  />
                  <span className="text-body-2 text-fg">All day</span>
                </label>
              </div>
            )}

            {/* Time Started and Date Started - for company-event and deadline */}
            {(isCompanyEvent || isDeadline) && (
              <div className="flex items-center gap-[12px]">
                {!values.isAllDay && (
                  <Input
                    id={startTimeId}
                    type="time"
                    value={values.startTime}
                    onChange={handleChange("startTime")}
                    disabled={isSaving}
                    className="w-[100px]"
                    placeholder="Time Started"
                  />
                )}
                <Input
                  id={startDateId}
                  type="date"
                  value={values.startDate}
                  onChange={handleChange("startDate")}
                  disabled={isSaving}
                  className={values.isAllDay ? "flex-1 max-w-[420px]" : "flex-1 max-w-[320px]"}
                />
              </div>
            )}

            {/* Date Started - for birthday, time-off, and work-anniversary (all-day only) */}
            {isPersonEvent && (
              <div className="flex items-center gap-[12px]">
                <label htmlFor={startDateId} className="text-body-2 text-fg">
                  Date
                </label>
                <Input
                  id={startDateId}
                  type="date"
                  value={values.startDate}
                  onChange={handleChange("startDate")}
                  disabled={isSaving}
                  className="flex-1 max-w-[420px]"
                />
              </div>
            )}

            {/* Time Ended and Date Ended - for company-event and time-off */}
            {(isCompanyEvent || isTimeOff) && (
              <div className="flex items-center gap-[12px]">
                {isCompanyEvent && !values.isAllDay && (
                  <Input
                    id={endTimeId}
                    type="time"
                    value={values.endTime}
                    onChange={handleChange("endTime")}
                    disabled={isSaving}
                    className="w-[100px]"
                    placeholder="Time Ended"
                  />
                )}
                <Input
                  id={endDateId}
                  type="date"
                  value={values.endDate}
                  onChange={handleChange("endDate")}
                  disabled={isSaving}
                  className={isCompanyEvent && !values.isAllDay ? "flex-1 max-w-[320px]" : "flex-1 max-w-[420px]"}
                />
              </div>
            )}

            {/* Repeat - shown for company-event, deadline, and work-anniversary */}
            {(isCompanyEvent || isDeadline || isWorkAnniversary) && (
              <div className="flex items-center gap-[12px]">
                <label htmlFor={repeatId} className="text-body-2 text-fg">
                  Repeat
                </label>
                <Select
                  id={repeatId}
                  value={values.recurrenceRule || ""}
                  onChange={handleChange("recurrenceRule")}
                  disabled={isSaving || isWorkAnniversary}
                  className="flex-1 max-w-[420px]"
                >
                  {REPEAT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {/* Participants - only for company-event */}
            {isCompanyEvent && (
              <div className="flex flex-col gap-[12px]">
                <label className="text-body-2 text-fg">Participants</label>
                <div className="flex flex-col gap-[8px]">
                  {/* Creator/Organizer */}
                  <div className="flex items-center gap-[8px]">
                    <Avatar name={values.ownerName || "You"} size={32} />
                    <span className="text-body-2 text-fg">{values.ownerName || "You"}</span>
                    <span className="text-caption text-fg4">(Organizer)</span>
                  </div>
                  
                  {/* Selected participants */}
                  {selectedParticipants.map((person) => (
                    <div key={person.id} className="flex items-center gap-[8px]">
                      <Avatar name={person.name} size={32} />
                      <span className="text-body-2 text-fg">{person.name}</span>
                      <button
                        type="button"
                        onClick={() => handleParticipantRemove(person.id)}
                        disabled={isSaving}
                        className="ml-auto text-caption text-fg4 hover:text-fg2"
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
                      className="w-full max-w-[420px]"
                    >
                      <option value="">Add Participant</option>
                      {availablePeople.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.name}
                        </option>
                      ))}
                    </Select>
                  )}
                </div>
              </div>
            )}
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
