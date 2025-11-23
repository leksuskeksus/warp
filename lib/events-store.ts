"use client";

import { addDays, set, startOfWeek } from "date-fns";

import { createPersistentStore } from "./storage";

export const WEEK_START = 0;

export type CalendarEventType =
  | "time-off"
  | "birthday"
  | "work-anniversary"
  | "company-event"
  | "deadline";

export type CalendarParticipant = {
  id: string;
  name: string;
  email?: string;
  role?: "organizer" | "attendee" | "watcher";
};

export type CalendarEventSource =
  | { provider: "local" }
  | { provider: "google"; calendarId: string; eventId: string };

export type CalendarEvent = {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string | null;
  isAllDay: boolean;
  type: CalendarEventType;
  description?: string;
  owner: CalendarParticipant;
  attendees: CalendarParticipant[];
  location?: string;
  timeZone?: string;
  recurrenceRule?: string;
  source?: CalendarEventSource;
  createdAt: string;
  updatedAt: string;
};

export type HydratedCalendarEvent = Omit<CalendarEvent, "startsAt" | "endsAt"> & {
  startsAt: Date;
  endsAt: Date | null;
};

export function hydrateEvent(event: CalendarEvent): HydratedCalendarEvent {
  return {
    ...event,
    startsAt: new Date(event.startsAt),
    endsAt: event.endsAt ? new Date(event.endsAt) : null,
  };
}

export function hydrateEvents(events: CalendarEvent[]): HydratedCalendarEvent[] {
  return events.map(hydrateEvent);
}

function createDemoEvents(): CalendarEvent[] {
  const today = new Date();
  const base = startOfWeek(today, { weekStartsOn: WEEK_START });
  const timestamp = new Date().toISOString();

  const people: Record<string, CalendarParticipant> = {
    alexey: { id: "p-1", name: "Alexey Primechaev", email: "alexey@warp.dev", role: "organizer" },
    rahul: { id: "p-2", name: "Rahul Sonwalkar", email: "rahul@warp.dev" },
    jordan: { id: "p-3", name: "Jordan Smith", email: "jordan@warp.dev" },
    priya: { id: "p-4", name: "Priya Patel", email: "priya@warp.dev" },
    emily: { id: "p-5", name: "Emily Chen", email: "emily@warp.dev" },
    lucas: { id: "p-6", name: "Lucas Martínez", email: "lucas@warp.dev" },
  };

  return [
    {
      id: "event-1",
      title: "Alexey PTO",
      startsAt: addDays(base, 3).toISOString(),
      endsAt: addDays(base, 7).toISOString(),
      isAllDay: true,
      type: "time-off",
      description: "Recharge before the next release cadence.",
      owner: people.alexey,
      attendees: [people.rahul],
      timeZone: "America/Los_Angeles",
      source: { provider: "local" },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "event-2",
      title: "Rahul’s Birthday",
      startsAt: addDays(base, 2).toISOString(),
      endsAt: addDays(base, 3).toISOString(),
      isAllDay: true,
      type: "birthday",
      description: "Send a note or join for cake in the afternoon.",
      owner: people.rahul,
      attendees: [people.alexey, people.jordan, people.priya],
      timeZone: "America/New_York",
      source: { provider: "local" },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "event-3",
      title: "Jordan 5-Year Anniversary",
      startsAt: addDays(base, 5).toISOString(),
      endsAt: addDays(base, 6).toISOString(),
      isAllDay: true,
      type: "work-anniversary",
      description: "Celebrate Jordan’s five-year milestone at Warp.",
      owner: people.jordan,
      attendees: [people.alexey, people.rahul, people.priya],
      source: { provider: "local" },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "event-4",
      title: "Warp Quarterly All-Hands",
      startsAt: set(addDays(base, 1), { hours: 18, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString(),
      endsAt: set(addDays(base, 1), { hours: 19, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString(),
      isAllDay: false,
      type: "company-event",
      description: "Company-wide updates, demos, and Q&A.",
      owner: people.alexey,
      attendees: [people.rahul, people.jordan, people.priya, people.emily, people.lucas],
      location: "Virtual · Zoom",
      timeZone: "America/Los_Angeles",
      source: { provider: "local" },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
    {
      id: "event-5",
      title: "Q2 Billing Deadline",
      startsAt: set(addDays(base, 4), { hours: 21, minutes: 0, seconds: 0, milliseconds: 0 }).toISOString(),
      endsAt: null,
      isAllDay: false,
      type: "deadline",
      description: "Submit expense approvals before finance closes the books.",
      owner: people.emily,
      attendees: [people.alexey, people.rahul],
      recurrenceRule: "FREQ=MONTHLY;BYDAY=MO;BYSETPOS=1",
      timeZone: "America/Chicago",
      source: { provider: "local" },
      createdAt: timestamp,
      updatedAt: timestamp,
    },
  ];
}

const eventsStore = createPersistentStore<CalendarEvent[]>("calendar-events", createDemoEvents());

export const useEvents = eventsStore.useStoreValue;
export const getEvents = eventsStore.get;
export const setEvents = eventsStore.set;
export const subscribeToEvents = eventsStore.subscribe;

