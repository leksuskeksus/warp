"use client";

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
  personId?: string;
  name: string;
  email?: string;
  role?: "organizer" | "attendee" | "watcher";
  personRole?: string;
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
  return [];
}

const eventsStore = createPersistentStore<CalendarEvent[]>("calendar-events", createDemoEvents());

export const useEvents = eventsStore.useStoreValue;
export const getEvents = eventsStore.get;
export const setEvents = eventsStore.set;
export const subscribeToEvents = eventsStore.subscribe;
