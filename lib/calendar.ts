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



