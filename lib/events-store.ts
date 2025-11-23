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
  ];
}

const eventsStore = createPersistentStore<CalendarEvent[]>("calendar-events", createDemoEvents());

export const useEvents = eventsStore.useStoreValue;
export const getEvents = eventsStore.get;
export const setEvents = eventsStore.set;
export const subscribeToEvents = eventsStore.subscribe;

