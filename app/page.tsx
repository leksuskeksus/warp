"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

import { format, parseISO, startOfDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import {
  HydratedCalendarEvent,
  hydrateEvents,
  useEvents,
  WEEK_START as EVENTS_WEEK_START,
} from "@/lib/events-store";
import { CalendarView } from "@/components/calendar/calendar-view";
import type { CalendarDay } from "@/lib/calendar";
import { buildCalendarDays } from "@/lib/calendar";
import { CalendarInspector, CalendarInspectorSection } from "@/components/calendar/inspector";

const WEEK_START = EVENTS_WEEK_START;
const WEEKS_TO_RENDER = 156;

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

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const now = new Date();
    const normalizedToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    const baseDays = buildCalendarDays(WEEKS_TO_RENDER, normalizedToday, hydratedEvents, WEEK_START);
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

  const inspectorSections = useMemo<CalendarInspectorSection[]>(() => {
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
      if (isSidebarOpen) {
        setSelectedDays(new Set());
        setSelectedEvent(null);
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
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
          setSelectedDays(new Set());
          setSelectedEvent(null);
          return false;
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
            <CalendarView
              days={calendarDays}
              selectedEventId={selectedEventId}
              onDaySelect={toggleDaySelection}
              onEventSelect={handleEventSelect}
            />
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
              <CalendarInspector
                sections={inspectorSections}
                selectedEvent={selectedEvent}
                selectedEventId={selectedEventId}
                onSelectEvent={handleEventSelect}
                onCloseEvent={handleEventClose}
                localTimeZone={localTimeZone}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
