import { addDays, addWeeks, addMonths, addYears, format, isSameDay, startOfDay, startOfMonth } from "date-fns";

import { CalendarEventType, HydratedCalendarEvent } from "./events-store";

export const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  "time-off": "Time Off",
  birthday: "Birthday",
  "work-anniversary": "Work Anniversary",
  "company-event": "Company Event",
  deadline: "Deadline",
};

export function getEventTypeLabel(type: CalendarEventType): string {
  return EVENT_TYPE_LABELS[type];
}

type PaletteTone = "light" | "dark";

const EVENT_TYPE_COLOR_MAP: Record<CalendarEventType, { background: string; tone: PaletteTone }> = {
  "time-off": { background: "var(--color-green-500)", tone: "light" },
  birthday: { background: "var(--color-pink-600)", tone: "light" },
  "work-anniversary": { background: "var(--color-purple-500)", tone: "light" },
  "company-event": { background: "var(--color-blue-500)", tone: "light" },
  deadline: { background: "var(--color-red-600)", tone: "light" },
};

export type EventColorPalette = {
  background: string;
  foreground: string;
  muted: string;
  subtle: string;
  ring: string;
};

const LIGHT_FOREGROUND = "var(--color-white)";
const DARK_FOREGROUND = "var(--fg)";

const LIGHT_MUTED = "rgba(255,255,255,0.86)";
const LIGHT_SUBTLE = "rgba(255,255,255,0.7)";
const LIGHT_RING = "rgba(255,255,255,0.72)";

const DARK_MUTED = "rgba(20,20,20,0.7)";
const DARK_SUBTLE = "rgba(20,20,20,0.54)";
const DARK_RING = "rgba(16,16,16,0.24)";

export function getEventTypePalette(type: CalendarEventType, isSelected: boolean = false): EventColorPalette {
  const { background, tone } = EVENT_TYPE_COLOR_MAP[type];

  // Unselected state: lighter, less saturated colors with black text
  if (!isSelected) {
    return {
      background: `color-mix(in srgb, ${background} 20%, white)`,
      foreground: "var(--color-black)",
      muted: "rgba(0,0,0,0.7)",
      subtle: "rgba(0,0,0,0.54)",
      ring: "rgba(0,0,0,0.24)",
    };
  }

  // Selected state: keep current appearance
  if (tone === "light") {
    return {
      background,
      foreground: LIGHT_FOREGROUND,
      muted: LIGHT_MUTED,
      subtle: LIGHT_SUBTLE,
      ring: LIGHT_RING,
    };
  }

  return {
    background,
    foreground: DARK_FOREGROUND,
    muted: DARK_MUTED,
    subtle: DARK_SUBTLE,
    ring: DARK_RING,
  };
}

export function formatEventSchedule(event: HydratedCalendarEvent): string {
  const start = event.startsAt;
  const end = event.endsAt ?? event.startsAt;

  if (event.isAllDay) {
    return isSameDay(start, end)
      ? format(start, "EEEE, MMM d")
      : `${format(start, "EEE, MMM d")} – ${format(end, "EEE, MMM d")}`;
  }

  if (!event.endsAt) {
    return format(start, "EEE, MMM d · h:mm a");
  }

  return isSameDay(start, event.endsAt)
    ? `${format(start, "EEE, MMM d · h:mm a")} – ${format(event.endsAt, "h:mm a")}`
    : `${format(start, "EEE, MMM d · h:mm a")} – ${format(event.endsAt, "EEE, MMM d · h:mm a")}`;
}

/**
 * Gets the base event ID from a recurrence instance ID.
 * For example: "event-123-recurrence-5" -> "event-123"
 */
function getBaseEventId(eventId: string): string {
  const recurrenceMatch = eventId.match(/^(.+)-recurrence-\d+$/);
  return recurrenceMatch ? recurrenceMatch[1] : eventId;
}

/**
 * Checks if two events are part of the same recurring series.
 * Events are considered part of the same recurring series if they:
 * - Have the same recurrenceRule (non-empty)
 * - Have the same title
 * - Have the same type
 * - Have the same owner ID
 * - OR have base event IDs that match (for recurrence instances)
 */
export function areEventsInSameRecurringSeries(
  event1: HydratedCalendarEvent,
  event2: HydratedCalendarEvent,
): boolean {
  // If either event doesn't have a recurrence rule, they're not part of a recurring series
  if (!event1.recurrenceRule || !event2.recurrenceRule) {
    return false;
  }

  // Check if they have the same base event ID (for recurrence instances)
  const baseId1 = getBaseEventId(event1.id);
  const baseId2 = getBaseEventId(event2.id);
  if (baseId1 === baseId2) {
    // Both are instances (or the original) of the same recurring event
    return true;
  }

  // Check if they have the same recurrence rule, title, type, and owner
  return (
    event1.recurrenceRule === event2.recurrenceRule &&
    event1.title === event2.title &&
    event1.type === event2.type &&
    event1.owner.id === event2.owner.id
  );
}

export type CalendarDay = {
  date: Date;
  dayIndex: number;
  weekIndex: number;
  isToday: boolean;
  isMonthStart: boolean;
  events: HydratedCalendarEvent[];
  isSelected?: boolean;
  isDimmed?: boolean;
};

type BuildCalendarDaysOptions = {
  baseDate: Date;
  today: Date;
  startWeek: number;
  weekCount: number;
  events: HydratedCalendarEvent[];
};

/**
 * Expands recurring events into multiple instances based on their recurrence rule.
 * Generates instances for events with recurrence rules within the specified date range.
 */
export function expandRecurringEvents(
  events: HydratedCalendarEvent[],
  rangeStart: Date,
  rangeEnd: Date,
): HydratedCalendarEvent[] {
  const expanded: HydratedCalendarEvent[] = [];

  for (const event of events) {
    // Add the original event if it's not recurring
    if (!event.recurrenceRule) {
      expanded.push(event);
      continue;
    }

    // Generate recurring instances
    const originalStart = event.startsAt;
    const originalEnd = event.endsAt ?? event.startsAt;
    const duration = originalEnd.getTime() - originalStart.getTime();

    // Find the first occurrence that falls within or after the range start
    let currentDate = new Date(originalStart);
    let occurrenceIndex = 0;

    // If the original event starts before the range, fast-forward to the first occurrence in range
    if (currentDate < rangeStart) {
      switch (event.recurrenceRule) {
        case "daily": {
          const daysDiff = Math.ceil((rangeStart.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
          currentDate = addDays(currentDate, daysDiff);
          occurrenceIndex = daysDiff;
          break;
        }
        case "weekly": {
          const weeksDiff = Math.ceil((rangeStart.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
          currentDate = addWeeks(originalStart, weeksDiff);
          occurrenceIndex = weeksDiff;
          break;
        }
        case "monthly": {
          // For monthly, we need to iterate to find the right month
          while (currentDate < rangeStart && occurrenceIndex < 120) {
            currentDate = addMonths(originalStart, occurrenceIndex);
            if (currentDate >= rangeStart) break;
            occurrenceIndex++;
          }
          break;
        }
        case "yearly": {
          // For yearly, we need to iterate to find the right year
          while (currentDate < rangeStart && occurrenceIndex < 10) {
            currentDate = addYears(originalStart, occurrenceIndex);
            if (currentDate >= rangeStart) break;
            occurrenceIndex++;
          }
          break;
        }
      }
    }

    // Generate instances until we exceed the range end
    while (currentDate <= rangeEnd) {
      const instanceStart = new Date(currentDate);
      const instanceEnd = new Date(instanceStart.getTime() + duration);

      expanded.push({
        ...event,
        id: `${event.id}-recurrence-${occurrenceIndex}`,
        startsAt: instanceStart,
        endsAt: instanceEnd,
      });

      // Calculate next occurrence based on recurrence rule
      occurrenceIndex++;
      switch (event.recurrenceRule) {
        case "daily":
          currentDate = addDays(currentDate, 1);
          break;
        case "weekly":
          currentDate = addWeeks(originalStart, occurrenceIndex);
          break;
        case "monthly":
          currentDate = addMonths(originalStart, occurrenceIndex);
          break;
        case "yearly":
          currentDate = addYears(originalStart, occurrenceIndex);
          break;
        default:
          // Unknown recurrence rule, stop generating
          currentDate = new Date(rangeEnd.getTime() + 1);
          break;
      }

      // Safety limit: don't generate more than 1000 instances
      if (occurrenceIndex > 1000) {
        break;
      }
    }
  }

  return expanded;
}

export function buildCalendarDays({
  baseDate,
  today,
  startWeek,
  weekCount,
  events,
}: BuildCalendarDaysOptions): CalendarDay[] {
  const totalDays = weekCount * 7;
  
  // Calculate the date range for expanding recurring events
  const rangeStart = addDays(baseDate, startWeek * 7);
  const rangeEnd = addDays(rangeStart, totalDays);
  
  // Expand recurring events before building calendar days
  const expandedEvents = expandRecurringEvents(events, rangeStart, rangeEnd);

  return Array.from({ length: totalDays }, (_, index) => {
    const absoluteDayIndex = startWeek * 7 + index;
    const dayDate = addDays(baseDate, absoluteDayIndex);
    const dayStart = startOfDay(dayDate).getTime();

    return {
      date: dayDate,
      dayIndex: absoluteDayIndex,
      weekIndex: startWeek + Math.floor(index / 7),
      isToday: isSameDay(dayDate, today),
      isMonthStart: isSameDay(dayDate, startOfMonth(dayDate)),
      events: expandedEvents.filter((event) => {
        const eventStartDay = startOfDay(event.startsAt).getTime();
        const eventEndDay = startOfDay(event.endsAt ?? event.startsAt).getTime();
        return eventStartDay <= dayStart && eventEndDay >= dayStart;
      }),
    };
  });
}

/**
 * Checks if two events overlap in time.
 * Handles both all-day and timed events correctly.
 */
export function doEventsOverlap(
  event1: { startsAt: Date; endsAt: Date | null; isAllDay: boolean },
  event2: { startsAt: Date; endsAt: Date | null; isAllDay: boolean },
): boolean {
  const start1 = event1.startsAt.getTime();
  const end1 = event1.endsAt ? event1.endsAt.getTime() : event1.startsAt.getTime();
  const start2 = event2.startsAt.getTime();
  const end2 = event2.endsAt ? event2.endsAt.getTime() : event2.startsAt.getTime();

  // All-day events overlap if they share any day
  if (event1.isAllDay || event2.isAllDay) {
    const day1Start = startOfDay(event1.startsAt).getTime();
    const day1End = startOfDay(event1.endsAt ?? event1.startsAt).getTime();
    const day2Start = startOfDay(event2.startsAt).getTime();
    const day2End = startOfDay(event2.endsAt ?? event2.startsAt).getTime();
    
    // Overlap if day ranges intersect
    return day1Start <= day2End && day2Start <= day1End;
  }

  // Timed events overlap if their time ranges intersect
  // Two events overlap if: start1 < end2 && start2 < end1
  return start1 < end2 && start2 < end1;
}

/**
 * Checks if two participants are the same person.
 * Compares by ID, personId, email, or name.
 */
function areParticipantsSame(
  p1: { id?: string; personId?: string; email?: string; name: string },
  p2: { id?: string; personId?: string; email?: string; name: string },
): boolean {
  // Compare by ID or personId first (most reliable)
  if (p1.id && p2.id && p1.id === p2.id) return true;
  if (p1.personId && p2.personId && p1.personId === p2.personId) return true;
  
  // Compare by email (case-insensitive)
  if (p1.email && p2.email && p1.email.toLowerCase() === p2.email.toLowerCase()) return true;
  
  // Compare by name as fallback
  return p1.name === p2.name;
}

/**
 * Checks if two events share any participants (owner or attendees).
 */
function doEventsShareParticipants(
  event1: { owner: { id?: string; personId?: string; email?: string; name: string }; attendees: Array<{ id?: string; personId?: string; email?: string; name: string }> },
  event2: { owner: { id?: string; personId?: string; email?: string; name: string }; attendees: Array<{ id?: string; personId?: string; email?: string; name: string }> },
): boolean {
  // Get all participants from event1 (owner + attendees)
  const event1Participants = [event1.owner, ...event1.attendees];
  
  // Get all participants from event2 (owner + attendees)
  const event2Participants = [event2.owner, ...event2.attendees];
  
  // Check if any participant from event1 matches any participant from event2
  return event1Participants.some((p1) =>
    event2Participants.some((p2) => areParticipantsSame(p1, p2)),
  );
}

/**
 * Finds all events that conflict (overlap) with a given event.
 * Returns an array of conflicting events.
 */
export function findConflictingEvents(
  newEvent: { startsAt: Date; endsAt: Date | null; isAllDay: boolean },
  existingEvents: HydratedCalendarEvent[],
): HydratedCalendarEvent[] {
  return existingEvents.filter((existingEvent) =>
    doEventsOverlap(newEvent, existingEvent),
  );
}

/**
 * Finds all events that conflict (overlap) with a given event AND share participants.
 * Only returns conflicts where the same people are involved in both events.
 */
export function findConflictingEventsWithSharedParticipants(
  newEvent: {
    startsAt: Date;
    endsAt: Date | null;
    isAllDay: boolean;
    owner: { id?: string; personId?: string; email?: string; name: string };
    attendees: Array<{ id?: string; personId?: string; email?: string; name: string }>;
  },
  existingEvents: HydratedCalendarEvent[],
): HydratedCalendarEvent[] {
  return existingEvents.filter((existingEvent) => {
    // First check if events overlap in time
    if (!doEventsOverlap(newEvent, existingEvent)) {
      return false;
    }
    
    // Then check if they share participants
    return doEventsShareParticipants(newEvent, existingEvent);
  });
}



