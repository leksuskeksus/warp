"use client";

import { addDays, startOfWeek } from "date-fns";

import { createPersistentStore } from "./storage";

export const WEEK_START = 0;

export type CalendarEventType = "meeting" | "reminder" | "out-of-office" | "milestone" | "other";

export type CalendarParticipant = {
  id: string;
  name: string;
};

export type CalendarEvent = {
  id: string;
  name: string;
  startsAt: string;
  endsAt: string;
  isAllDay: boolean;
  type: CalendarEventType;
  participants: CalendarParticipant[];
  notes?: string;
};

export type HydratedCalendarEvent = Omit<CalendarEvent, "startsAt" | "endsAt"> & {
  startsAt: Date;
  endsAt: Date;
};

export function hydrateEvent(event: CalendarEvent): HydratedCalendarEvent {
  return {
    ...event,
    startsAt: new Date(event.startsAt),
    endsAt: new Date(event.endsAt),
  };
}

export function hydrateEvents(events: CalendarEvent[]): HydratedCalendarEvent[] {
  return events.map(hydrateEvent);
}

function createDemoEvents(): CalendarEvent[] {
  const today = new Date();
  const base = startOfWeek(today, { weekStartsOn: WEEK_START });

  return [
    {
      id: "event-1",
      name: "Weekly sync",
      startsAt: addDays(base, 1).toISOString(),
      endsAt: addDays(base, 1).toISOString(),
      isAllDay: false,
      type: "meeting",
      participants: [
        { id: "p-1", name: "Alexey Primechaev" },
        { id: "p-2", name: "Rahul Sonwalkar" },
      ],
      notes: "Review sprint progress and blockers.",
    },
    {
      id: "event-2",
      name: "Product planning",
      startsAt: addDays(base, 2).toISOString(),
      endsAt: addDays(base, 2).toISOString(),
      isAllDay: false,
      type: "meeting",
      participants: [
        { id: "p-1", name: "Alexey Primechaev" },
        { id: "p-3", name: "John Doe" },
        { id: "p-4", name: "Jane Smith" },
      ],
    },
    {
      id: "event-3",
      name: "Company holiday",
      startsAt: addDays(base, 4).toISOString(),
      endsAt: addDays(base, 4).toISOString(),
      isAllDay: true,
      type: "out-of-office",
      participants: [],
    },
    {
      id: "event-4",
      name: "Launch milestone",
      startsAt: addDays(base, 7).toISOString(),
      endsAt: addDays(base, 7).toISOString(),
      isAllDay: true,
      type: "milestone",
      participants: [{ id: "p-5", name: "Marketing Team" }],
      notes: "Finalize launch assets and marketing pushes.",
    },
    {
      id: "event-5",
      name: "Design review",
      startsAt: addDays(base, 2).toISOString(),
      endsAt: addDays(base, 2).toISOString(),
      isAllDay: false,
      type: "meeting",
      participants: [
        { id: "p-6", name: "Design Team" },
        { id: "p-1", name: "Alexey Primechaev" },
      ],
      notes: "Evaluate latest design iterations for calendar UI.",
    },
    {
      id: "event-6",
      name: "Payroll sync",
      startsAt: addDays(base, 2).toISOString(),
      endsAt: addDays(base, 2).toISOString(),
      isAllDay: false,
      type: "reminder",
      participants: [{ id: "p-7", name: "Finance" }],
    },
    {
      id: "event-7",
      name: "Support rotation",
      startsAt: addDays(base, 5).toISOString(),
      endsAt: addDays(base, 5).toISOString(),
      isAllDay: false,
      type: "reminder",
      participants: [
        { id: "p-8", name: "Support Team" },
        { id: "p-2", name: "Rahul Sonwalkar" },
      ],
    },
    {
      id: "event-8",
      name: "Quarterly results",
      startsAt: addDays(base, 5).toISOString(),
      endsAt: addDays(base, 5).toISOString(),
      isAllDay: false,
      type: "meeting",
      participants: [
        { id: "p-9", name: "Leadership" },
        { id: "p-1", name: "Alexey Primechaev" },
      ],
      notes: "Share and analyze quarterly financial outcomes.",
    },
    {
      id: "event-9",
      name: "Customer feedback review",
      startsAt: addDays(base, 5).toISOString(),
      endsAt: addDays(base, 5).toISOString(),
      isAllDay: false,
      type: "meeting",
      participants: [
        { id: "p-6", name: "Design Team" },
        { id: "p-10", name: "Product Marketing" },
      ],
    },
    {
      id: "event-10",
      name: "Engineering retro",
      startsAt: addDays(base, 3).toISOString(),
      endsAt: addDays(base, 3).toISOString(),
      isAllDay: false,
      type: "meeting",
      participants: [
        { id: "p-11", name: "Engineering Team" },
        { id: "p-1", name: "Alexey Primechaev" },
      ],
    },
    {
      id: "event-11",
      name: "Security audit prep",
      startsAt: addDays(base, 3).toISOString(),
      endsAt: addDays(base, 3).toISOString(),
      isAllDay: false,
      type: "reminder",
      participants: [
        { id: "p-11", name: "Engineering Team" },
        { id: "p-12", name: "Security" },
      ],
    },
    {
      id: "event-12",
      name: "Office hours",
      startsAt: addDays(base, 6).toISOString(),
      endsAt: addDays(base, 6).toISOString(),
      isAllDay: false,
      type: "meeting",
      participants: [{ id: "p-13", name: "Support Leads" }],
    },
    {
      id: "event-13",
      name: "Paid leave",
      startsAt: addDays(base, 6).toISOString(),
      endsAt: addDays(base, 7).toISOString(),
      isAllDay: true,
      type: "out-of-office",
      participants: [{ id: "p-2", name: "Rahul Sonwalkar" }],
      notes: "Extended weekend break.",
    },
    {
      id: "event-14",
      name: "Content brainstorm",
      startsAt: addDays(base, 1).toISOString(),
      endsAt: addDays(base, 1).toISOString(),
      isAllDay: false,
      type: "meeting",
      participants: [
        { id: "p-14", name: "Content Team" },
        { id: "p-5", name: "Marketing Team" },
      ],
    },
    {
      id: "event-15",
      name: "Hiring sync",
      startsAt: addDays(base, 1).toISOString(),
      endsAt: addDays(base, 1).toISOString(),
      isAllDay: false,
      type: "meeting",
      participants: [
        { id: "p-15", name: "Recruiting" },
        { id: "p-1", name: "Alexey Primechaev" },
      ],
    },
  ];
}

const eventsStore = createPersistentStore<CalendarEvent[]>("calendar-events", createDemoEvents());

export const useEvents = eventsStore.useStoreValue;
export const getEvents = eventsStore.get;
export const setEvents = eventsStore.set;
export const subscribeToEvents = eventsStore.subscribe;

