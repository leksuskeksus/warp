"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { addDays, format, isSameDay, startOfMonth, startOfWeek } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import {
  CalendarEvent as StoredCalendarEvent,
  useEvents,
  WEEK_START as EVENTS_WEEK_START,
} from "@/lib/events-store";

const WEEK_START = EVENTS_WEEK_START;
const WEEKS_TO_RENDER = 156;

type CalendarDay = {
  date: Date;
  label: string;
  isToday: boolean;
  isMonthStart: boolean;
  events: HydratedCalendarEvent[];
};

type HydratedCalendarEvent = Omit<StoredCalendarEvent, "startsAt" | "endsAt"> & {
  startsAt: Date;
  endsAt: Date;
};

function normalizeEvent(event: StoredCalendarEvent): HydratedCalendarEvent {
  return {
    ...event,
    startsAt: new Date(event.startsAt),
    endsAt: new Date(event.endsAt),
  };
}

function generateCalendarDays(totalWeeks: number, today: Date, events: StoredCalendarEvent[]): CalendarDay[] {
  const firstVisibleDay = startOfWeek(today, { weekStartsOn: WEEK_START });
  const totalDays = totalWeeks * 7;
  const normalizedEvents = events.map(normalizeEvent);

  return Array.from({ length: totalDays }, (_, index) => {
    const dayDate = addDays(firstVisibleDay, index);

    return {
      date: dayDate,
      label: format(dayDate, "d"),
      isToday: isSameDay(dayDate, today),
      isMonthStart: isSameDay(dayDate, startOfMonth(dayDate)),
      events: normalizedEvents.filter((event) => isSameDay(event.startsAt, dayDate)),
    };
  });
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [persistedEvents] = useEvents();

  const calendarDays = useMemo(() => {
    const now = new Date();
    const normalizedToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    return generateCalendarDays(WEEKS_TO_RENDER, normalizedToday, persistedEvents);
  }, [persistedEvents]);

  const toggleSidebar = () => setIsSidebarOpen((previous) => !previous);

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
      setIsSidebarOpen((previous) => !previous);
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
                <div
                  key={format(day.date, "yyyy-MM-dd")}
                  className={cn(
                    "relative flex flex-col gap-[10px] bg-bg px-[18px] pb-[18px] pt-[14px] text-fg transition-default",
                    day.isToday && "bg-bg2 ring-1 ring-ring",
                  )}
                >
                  <div className="flex items-center justify-center">
                    <span className="text-h2 font-medium leading-none text-center">
                      {day.label}
                    </span>
                    {day.isMonthStart && (
                      <span className="ml-[8px] text-tag font-medium text-fg3">
                        {format(day.date, "MMM")}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-[6px] overflow-hidden">
                    {day.events.map((event) => {
                      const shouldShowTime = event.isAllDay || event.name.length <= 18;

                      return (
                        <div
                          key={event.id}
                          className="flex h-[20px] items-center gap-[6px] rounded-sm border border-border bg-bg2/80 px-[6px] text-tag leading-none"
                        >
                          <span className="min-w-0 overflow-hidden whitespace-nowrap text-fg">
                            {event.name}
                          </span>
                          {shouldShowTime && (
                            <span className="ml-auto shrink-0 whitespace-nowrap text-fg3">
                              {event.isAllDay
                                ? "All day"
                                : format(event.startsAt, "h:mm a")}
                            </span>
                          )}
                    </div>
                      );
                    })}
                  </div>
                </div>
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
                <p className="leading-relaxed">
                  Sidebar content placeholder. Toggle button in the top right collapses this
                  panel; when hidden the calendar expands to fill the full width.
                </p>
        </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
