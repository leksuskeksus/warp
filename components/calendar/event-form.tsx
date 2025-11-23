"use client";

import { useEffect, useId, useRef, useState } from "react";

import { Select } from "@/components/ui/select";
import { EVENT_TYPE_LABELS } from "@/lib/calendar";
import { CalendarEventType } from "@/lib/events-store";

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
};

const EVENT_TYPE_OPTIONS: CalendarEventType[] = [
  "company-event",
  "deadline",
  "time-off",
  "birthday",
  "work-anniversary",
];

export function CalendarEventForm({
  initialValues,
  onSubmit,
  isSaving = false,
  onValidationChange,
  onSubmitRef,
}: CalendarEventFormProps) {
  const typeSelectId = useId();
  const [values, setValues] = useState<CalendarEventFormValues>(initialValues);
  const formRef = useRef<HTMLFormElement>(null);

  // Sync with initialValues changes
  useEffect(() => {
    setValues(initialValues);
  }, [initialValues]);

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
      onSubmit(values);
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
  }, [onSubmitRef, onSubmit, isValid, values]);

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newType = e.target.value as CalendarEventType;
    setValues((prev) => ({
      ...prev,
      type: newType,
    }));
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="flex min-h-full flex-col">
      <div className="flex-1 -mx-[20px] space-y-[24px] px-[20px] pb-[32px] pt-[8px]">
        <section className="flex flex-col gap-[12px]">
          <label htmlFor={typeSelectId} className="flex flex-col gap-[6px]">
            <span className="text-tag font-semibold uppercase tracking-[0.12em] text-fg3">
              Event type
            </span>
            <Select
              id={typeSelectId}
              value={values.type}
              onChange={handleTypeChange}
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
      </div>
    </form>
  );
}
