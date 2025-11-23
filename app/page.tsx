"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { addDays, format, isSameDay, parseISO, startOfDay, startOfMonth, startOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import {
  CalendarEventType,
  CalendarParticipant,
  HydratedCalendarEvent,
  hydrateEvents,
  useEvents,
  WEEK_START as EVENTS_WEEK_START,
} from "@/lib/events-store";
import { CalendarDayCell } from "@/components/calendar-day-cell";

const WEEK_START = EVENTS_WEEK_START;
const WEEKS_TO_RENDER = 156;

type BaseCalendarDay = {
  date: Date;
  label: string;
  isToday: boolean;
  isMonthStart: boolean;
  events: HydratedCalendarEvent[];
};

type CalendarDay = BaseCalendarDay & {
  isSelected: boolean;
  isDimmed: boolean;
};

const EVENT_TYPE_LABELS: Record<CalendarEventType, string> = {
  "time-off": "Time Off",
  birthday: "Birthday",
  "work-anniversary": "Work Anniversary",
  "company-event": "Company Event",
  deadline: "Deadline",
};

function generateCalendarDays(totalWeeks: number, today: Date, events: HydratedCalendarEvent[]): BaseCalendarDay[] {
  const firstVisibleDay = startOfWeek(today, { weekStartsOn: WEEK_START });
  const totalDays = totalWeeks * 7;

  return Array.from({ length: totalDays }, (_, index) => {
    const dayDate = addDays(firstVisibleDay, index);

    return {
      date: dayDate,
      label: format(dayDate, "d"),
      isToday: isSameDay(dayDate, today),
      isMonthStart: isSameDay(dayDate, startOfMonth(dayDate)),
      events: events.filter((event) => {
        const dayStart = startOfDay(dayDate).getTime();
        const eventStartDay = startOfDay(event.startsAt).getTime();
        const eventEndDay = startOfDay(event.endsAt ?? event.startsAt).getTime();
        return eventStartDay <= dayStart && eventEndDay >= dayStart;
      }),
    };
  });
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [persistedEvents] = useEvents();
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<HydratedCalendarEvent | null>(null);
  const selectedDaysRef = useRef(selectedDays);
  const selectedEventRef = useRef<HydratedCalendarEvent | null>(null);
  const localTimeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const selectedEventId = selectedEvent?.id ?? null;

  const hydratedEvents = useMemo(() => {
    const events = hydrateEvents(persistedEvents);
    return events.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  }, [persistedEvents]);

  useEffect(() => {
    if (!selectedEvent) {
      return;
    }

    const updatedEvent = hydratedEvents.find((event) => event.id === selectedEvent.id);
    if (!updatedEvent) {
      setSelectedEvent(null);
      return;
    }

    if (updatedEvent !== selectedEvent) {
      setSelectedEvent(updatedEvent);
    }
  }, [hydratedEvents, selectedEvent]);

  const filteredEvents = useMemo(() => {
    if (selectedDays.size === 0) {
      return hydratedEvents;
    }

    return hydratedEvents.filter((event) => {
      const eventStart = startOfDay(event.startsAt).getTime();
      const eventEnd = startOfDay(event.endsAt ?? event.startsAt).getTime();

      for (const selectedKey of selectedDays) {
        const selectedTime = startOfDay(parseISO(selectedKey)).getTime();
        if (selectedTime >= eventStart && selectedTime <= eventEnd) {
          return true;
        }
      }

      return false;
    });
  }, [hydratedEvents, selectedDays]);

  const calendarDays = useMemo(() => {
    const now = new Date();
    const normalizedToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const baseDays = generateCalendarDays(WEEKS_TO_RENDER, normalizedToday, hydratedEvents);
    const hasSelection = selectedDays.size > 0;

    return baseDays.map((day) => {
      const key = format(day.date, "yyyy-MM-dd");
      const isSelected = selectedDays.has(key);
      return {
        ...day,
        isSelected,
        isDimmed: hasSelection && !isSelected,
      };
    });
  }, [hydratedEvents, selectedDays]);

  const inspectorSections = useMemo<Array<{ date: Date; events: HydratedCalendarEvent[] }>>(() => {
    const groups = new Map<string, { date: Date; events: HydratedCalendarEvent[] }>();

    filteredEvents.forEach((event) => {
      const key = format(event.startsAt, "yyyy-MM-dd");
      if (!groups.has(key)) {
        groups.set(key, { date: startOfDay(event.startsAt), events: [] });
      }
      groups.get(key)!.events.push(event);
    });

    return Array.from(groups.values())
      .map((group) => ({
        ...group,
        events: [...group.events].sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime()),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filteredEvents]);

  const selectedEventTypeLabel = selectedEvent ? EVENT_TYPE_LABELS[selectedEvent.type] : null;

  const selectedEventScheduleLabel = useMemo(() => {
    if (!selectedEvent) {
      return null;
    }

    const start = selectedEvent.startsAt;
    const end = selectedEvent.endsAt ?? selectedEvent.startsAt;

    if (selectedEvent.isAllDay) {
      return isSameDay(start, end)
        ? format(start, "EEEE, MMM d")
        : `${format(start, "EEE, MMM d")} – ${format(end, "EEE, MMM d")}`;
    }

    if (!selectedEvent.endsAt) {
      return format(start, "EEE, MMM d · h:mm a");
    }

    return isSameDay(start, selectedEvent.endsAt)
      ? `${format(start, "EEE, MMM d · h:mm a")} – ${format(selectedEvent.endsAt, "h:mm a")}`
      : `${format(start, "EEE, MMM d · h:mm a")} – ${format(selectedEvent.endsAt, "EEE, MMM d · h:mm a")}`;
  }, [selectedEvent]);

  const toggleDaySelection = (date: Date, additive: boolean) => {
    const key = format(date, "yyyy-MM-dd");
    setSelectedDays((prev) => {
      const alreadySelected = prev.has(key);

      if (!additive) {
        if (alreadySelected && prev.size === 1) {
          return new Set();
        }
        const next = new Set<string>();
        if (!alreadySelected) {
          next.add(key);
        }
        if (next.size > 0) {
          setIsSidebarOpen(true);
        }
        return next;
      }

      const next = new Set(prev);
      if (alreadySelected) {
        next.delete(key);
      } else {
        next.add(key);
      }
      if (next.size > 0) {
        setIsSidebarOpen(true);
      }
      return next;
    });
  };

  const handleEventSelect = (calendarEvent: HydratedCalendarEvent) => {
    setSelectedEvent(calendarEvent);
    setIsSidebarOpen(true);
  };

  const handleEventClose = () => {
    setSelectedEvent(null);
  };

  const toggleSidebar = () => {
    if (selectedDays.size > 0 || selectedEvent) {
      setIsSidebarOpen(true);
      return;
    }
    setIsSidebarOpen((previous) => !previous);
  };

  useEffect(() => {
    selectedDaysRef.current = selectedDays;
  }, [selectedDays]);

  useEffect(() => {
    selectedEventRef.current = selectedEvent;
  }, [selectedEvent]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }

      if (!(event.key === "i" || event.key === "I")) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)) {
        return;
      }

      event.preventDefault();
      setIsSidebarOpen((previous) => {
        if (selectedDaysRef.current.size > 0 || selectedEventRef.current) {
          return true;
        }
        return !previous;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="force-light flex h-screen bg-bg text-g8">
      <div className="max-tablet:hidden sticky inset-0 right-auto flex h-screen min-w-[250px] flex-col justify-between bg-g98 p-[20px]">
        <div>
          <Image
            src="/warp-logo@512w.webp"
            alt="Warp logo"
            className="h-[30px] w-auto"
            width={0}
            height={0}
            sizes="100vw"
            priority
          />
        </div>
        <div className="flex flex-col gap-[15px]">
          <div className="flex items-center gap-[7px]">
            <div className="bg-g96 outline outline-border relative size-[30px] flex-none overflow-clip rounded-full">
              {/* Placeholder avatar */}
            </div>
            <div className="flex flex-1 flex-col">
              <p className="text-caption line-clamp-1 text-left">Alexey Primechaev</p>
              <p className="text-tag text-fg3 line-clamp-1 text-left font-medium">
                primall96@gmail.com
              </p>
            </div>
          </div>
          <div className="text-caption text-fg3 transition-default *:hover:text-fg flex gap-[10px] has-[a]:underline">
            <a href="/auth/logout">Log Out</a>
            <a target="_blank" href="https://www.joinwarp.com/privacy">
              Privacy
            </a>
            <a target="_blank" href="https://www.joinwarp.com/terms">
              Terms
            </a>
          </div>
        </div>
      </div>

      <main className="relative flex flex-1 min-h-0 flex-col overflow-hidden border border-border bg-bg">
        <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-[51px] items-center justify-between gap-[20px] px-[32px]">
          <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-[rgba(255,255,255,1)] to-[rgba(255,255,255,0)]" />
          <div className="relative z-20 flex flex-1 justify-center">
            <div className="pointer-events-auto flex h-[35px] w-full max-w-[420px] items-center gap-[10px] rounded-md border border-border bg-bg px-[14px] transition-[border,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/40">
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-fg3"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
                            <Input
                type="search"
                placeholder="Search"
                className="h-full flex-1 border-none bg-transparent p-0 text-body-2 text-fg placeholder:text-fg4 focus-visible:border-none focus-visible:ring-0 focus-visible:ring-offset-0"
              />
              <div className="flex items-center gap-[3px]">
                <span className="flex size-[18px] items-center justify-center rounded-[6px] border border-border bg-bg2 text-caption font-semibold leading-none">
                  ⌘
                        </span>
                <span className="flex size-[18px] items-center justify-center rounded-[6px] border border-border bg-bg2 text-caption font-semibold leading-none">
                  K
                        </span>
                      </div>
                    </div>
                  </div>
          <div className="pointer-events-auto relative z-20 flex items-center justify-end">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleSidebar}
              className="flex h-[35px] items-center rounded-md px-[14px] pr-[7px] text-button-2 font-medium"
            >
              <span>Inspector</span>
              <span className="ml-[7px] flex size-[18px] items-center justify-center rounded-[6px] border border-border bg-bg2 text-caption font-semibold leading-none">
                I
              </span>
            </Button>
                </div>
        </header>
        <div className="relative flex flex-1 min-h-0">
          <div
            className={cn(
              "scrollbar-hide flex-1 overflow-y-auto bg-bg px-[12px] pb-[24px] pt-[12px] transition-[margin-right] duration-200 ease-out min-h-0",
              isSidebarOpen ? "mr-[295px]" : "mr-0",
            )}
          >
            <div
              className="grid h-full min-h-screen grid-cols-7 gap-[1px] bg-border"
              style={{
                gridAutoRows: "minmax(calc(100svh/5), 1fr)",
              }}
            >
              {calendarDays.map((day) => (
                <button
                  key={format(day.date, "yyyy-MM-dd")}
                  type="button"
                  className={cn(
                    "group relative flex h-full w-full items-stretch bg-bg text-left focus:outline-none",
                  )}
                  onClick={(event) => toggleDaySelection(day.date, event.shiftKey)}
                >
                  <div className="flex h-full w-full">
                      <CalendarDayCell
                        day={day}
                        selectedEventId={selectedEventId}
                        onEventClick={handleEventSelect}
                      />
                  </div>
                </button>
              ))}
                  </div>
                </div>

          <aside className={cn(
            "pointer-events-none absolute bottom-[7px] right-[7px] top-0 flex w-[288px] pt-[7px]",
            isSidebarOpen ? "z-10" : "z-0",
          )}>
            <div
              className={cn(
                "relative flex h-full w-full flex-col overflow-hidden rounded-md border border-border bg-white transition-transform duration-200 ease-out",
                isSidebarOpen
                  ? "pointer-events-auto translate-x-0"
                  : "pointer-events-none translate-x-full",
              )}
            >
              <div className="scrollbar-hide flex-1 overflow-y-auto px-[20px] pb-[20px] pt-[67px] text-body-2 text-fg3">
                {selectedEvent ? (
                  <div className="flex h-full flex-col gap-[20px]">
                    <div className="flex items-start justify-between gap-[12px]">
                      <div className="flex flex-col gap-[6px]">
                        {selectedEventTypeLabel && (
                          <span className="text-caption font-semibold uppercase tracking-[0.12em] text-fg4">
                            {selectedEventTypeLabel}
                          </span>
                        )}
                        <h2 className="text-h3 text-fg">{selectedEvent.title}</h2>
                      </div>
                      <button
                        type="button"
                        onClick={handleEventClose}
                        aria-label="Close event details"
                        className="flex size-[32px] items-center justify-center rounded-full border border-border bg-bg2 text-button-2 font-medium text-fg transition hover:border-ring hover:bg-bg focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40"
                      >
                        X
                      </button>
                    </div>

                    <div className="flex flex-col gap-[16px] rounded-md border border-border bg-bg px-[16px] py-[16px] text-fg">
                      <div className="flex flex-col gap-[4px]">
                        <span className="text-caption uppercase tracking-[0.08em] text-fg4">Schedule</span>
                        {selectedEventScheduleLabel && (
                          <span className="text-body-2 text-fg">{selectedEventScheduleLabel}</span>
                        )}
                        {(selectedEvent.timeZone || !selectedEvent.isAllDay) && (
                          <span className="text-caption text-fg4">
                            {selectedEvent.timeZone ?? localTimeZone}
                          </span>
                        )}
                      </div>

                      {selectedEvent.location && (
                        <div className="flex flex-col gap-[4px]">
                          <span className="text-caption uppercase tracking-[0.08em] text-fg4">Location</span>
                          <span className="text-body-2 text-fg">{selectedEvent.location}</span>
                        </div>
                      )}

                      {selectedEvent.recurrenceRule && (
                        <div className="flex flex-col gap-[4px]">
                          <span className="text-caption uppercase tracking-[0.08em] text-fg4">Repeats</span>
                          <span className="text-body-2 text-fg3">{selectedEvent.recurrenceRule}</span>
                        </div>
                      )}
                    </div>

                    {selectedEvent.description && (
                      <div className="flex flex-col gap-[6px]">
                        <span className="text-caption uppercase tracking-[0.08em] text-fg4">Description</span>
                        <p className="whitespace-pre-wrap text-body-2 text-fg3">{selectedEvent.description}</p>
                      </div>
                    )}

                    <div className="flex flex-col gap-[6px]">
                      <span className="text-caption uppercase tracking-[0.08em] text-fg4">People</span>
                      <div className="flex flex-col gap-[4px] text-body-2 text-fg">
                        <span>
                          {selectedEvent.owner.name}
                          <span className="text-caption text-fg4"> · Organizer</span>
                        </span>
                        {selectedEvent.attendees.length === 0 ? (
                          <span className="text-caption text-fg4">No additional attendees</span>
                        ) : (
                          selectedEvent.attendees.map((person: CalendarParticipant) => (
                            <span key={person.id}>{person.name}</span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                ) : inspectorSections.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-caption text-fg4">
                    No events scheduled
                  </div>
                ) : (
                  <div className="flex flex-col gap-[20px]">
                    {inspectorSections.map((section) => (
                      <div key={section.date.toISOString()} className="flex flex-col gap-[10px]">
                        <div className="flex items-baseline justify-between">
                          <span className="text-caption font-semibold uppercase tracking-[0.12em] text-fg2">
                            {format(section.date, "EEE, MMM d")}
                          </span>
                          <span className="text-tag text-fg4">
                            {section.events.length} event{section.events.length > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="flex flex-col gap-[8px]">
                          {section.events.map((event: HydratedCalendarEvent) => (
                            <button
                              key={event.id}
                              type="button"
                              onClick={() => handleEventSelect(event)}
                              className={cn(
                                "flex w-full items-center justify-between rounded-md border border-border bg-bg px-[12px] py-[10px] text-left transition hover:border-ring hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08)] focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/40",
                                selectedEventId === event.id && "border-success bg-green-50",
                              )}
                            >
                              <div className="flex min-w-0 flex-col gap-[4px]">
                                <span className="text-body-2 font-medium text-fg">{event.title}</span>
                                {event.description && (
                                  <span className="text-caption text-fg3 line-clamp-1">
                                    {event.description}
                                  </span>
                                )}
                              </div>
                              <div className="ml-[12px] flex min-w-[120px] flex-col items-end gap-[4px] text-right">
                                <span className="text-tag text-fg3">
                                  {event.isAllDay
                                    ? "All day"
                                    : event.endsAt
                                      ? `${format(event.startsAt, "h:mm a")} – ${format(event.endsAt, "h:mm a")}`
                                      : format(event.startsAt, "h:mm a")}
                                </span>
                                {event.attendees.length > 0 && (
                                  <span className="text-caption text-fg4 line-clamp-1 max-w-[160px]">
                                    {event.attendees.map((p) => p.name).join(", ")}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
