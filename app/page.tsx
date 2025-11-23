"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import {
  addDays,
  format,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";

const WEEK_START = 0;
const WEEKS_TO_RENDER = 156;

type CalendarDay = {
  date: Date;
  label: string;
  isToday: boolean;
  isMonthStart: boolean;
};

function generateCalendarDays(totalWeeks: number, today: Date): CalendarDay[] {
  const firstVisibleDay = startOfWeek(today, { weekStartsOn: WEEK_START });
  const totalDays = totalWeeks * 7;

  return Array.from({ length: totalDays }, (_, index) => {
    const dayDate = addDays(firstVisibleDay, index);

    return {
      date: dayDate,
      label: format(dayDate, "d"),
      isToday: isSameDay(dayDate, today),
      isMonthStart: isSameDay(dayDate, startOfMonth(dayDate)),
    };
  });
}

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const calendarDays = useMemo(() => {
    const now = new Date();
    const normalizedToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );

    return generateCalendarDays(WEEKS_TO_RENDER, normalizedToday);
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((previous) => !previous);

  return (
    <div className="force-light flex h-screen overflow-hidden bg-bg text-g8">
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

      <main className="relative flex flex-1 overflow-hidden border border-border bg-bg">
        <div className="relative flex flex-1">
          <div className="pointer-events-none absolute right-[24px] top-[24px] z-10">
            <Button
              variant="secondary"
              size="sm"
              className="pointer-events-auto"
              onClick={toggleSidebar}
            >
              {isSidebarOpen ? "Hide details" : "Show details"}
            </Button>
                    </div>

          <div
            className={cn(
              "scrollbar-hide flex-1 overflow-y-auto bg-bg px-[12px] py-[24px] transition-[margin-right] duration-200 ease-out",
              isSidebarOpen ? "mr-[224px]" : "mr-0",
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
                    "relative flex items-center justify-center bg-bg p-[24px] text-fg transition-default",
                    day.isToday && "bg-bg2 ring-1 ring-ring",
                  )}
                >
                  <span className="text-h2 font-medium leading-none text-center">
                    {day.label}
                  </span>
                  {day.isMonthStart && (
                    <span className="absolute left-[24px] top-1/2 -translate-y-1/2 text-tag font-medium text-fg3">
                      {format(day.date, "MMM")}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          <aside className="pointer-events-none absolute inset-y-0 right-0 flex w-[224px]">
            <div
              className={cn(
                "flex h-full w-full flex-col overflow-hidden border-l border-border bg-bg2 transition-transform duration-200 ease-out",
                isSidebarOpen
                  ? "pointer-events-auto translate-x-0"
                  : "pointer-events-none translate-x-full",
              )}
            >
              <div className="scrollbar-hide flex-1 overflow-y-auto p-[20px] text-body-2 text-fg3">
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
