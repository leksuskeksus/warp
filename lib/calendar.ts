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



