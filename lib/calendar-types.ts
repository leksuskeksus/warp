import { HydratedCalendarEvent } from "@/lib/events-store";

export type BaseCalendarDay = {
  date: Date;
  label: string;
  isToday: boolean;
  isMonthStart: boolean;
  events: HydratedCalendarEvent[];
};

export type CalendarDay = BaseCalendarDay & {
  isSelected: boolean;
  isDimmed: boolean;
};

export type InspectorSection = {
  date: Date;
  events: HydratedCalendarEvent[];
};

