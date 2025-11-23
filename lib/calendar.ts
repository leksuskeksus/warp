import { addDays, format, isSameDay, startOfDay, startOfMonth } from "date-fns";

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

export function getEventTypePalette(type: CalendarEventType): EventColorPalette {
  const { background, tone } = EVENT_TYPE_COLOR_MAP[type];

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
 * Checks if two events are part of the same recurring series.
 * Events are considered part of the same recurring series if they:
 * - Have the same recurrenceRule (non-empty)
 * - Have the same title
 * - Have the same type
 * - Have the same owner ID
 */
export function areEventsInSameRecurringSeries(
  event1: HydratedCalendarEvent,
  event2: HydratedCalendarEvent,
): boolean {
  // If either event doesn't have a recurrence rule, they're not part of a recurring series
  if (!event1.recurrenceRule || !event2.recurrenceRule) {
    return false;
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

export function buildCalendarDays({
  baseDate,
  today,
  startWeek,
  weekCount,
  events,
}: BuildCalendarDaysOptions): CalendarDay[] {
  const totalDays = weekCount * 7;

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
      events: events.filter((event) => {
        const eventStartDay = startOfDay(event.startsAt).getTime();
        const eventEndDay = startOfDay(event.endsAt ?? event.startsAt).getTime();
        return eventStartDay <= dayStart && eventEndDay >= dayStart;
      }),
    };
  });
}



