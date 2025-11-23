"use client";

import {
  MutableRefObject,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";

import { cn } from "@/lib/cn";
import { HydratedCalendarEvent } from "@/lib/events-store";
import type { CalendarDay } from "@/lib/calendar";

import { CalendarDayCell } from "./day-cell";

type CalendarWeekRange = {
  start: number;
  end: number;
};

type CalendarViewProps = {
  days: CalendarDay[];
  weekRange: CalendarWeekRange;
  totalWeeks: number;
  selectedEventId?: string | null;
  onDaySelect: (date: Date, additive: boolean) => void;
  onEventSelect: (event: HydratedCalendarEvent) => void;
  onRequestRangeChange: (direction: "up" | "down") => void;
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>;
  onTodayNode?: (node: HTMLButtonElement | null) => void;
};

export function CalendarView({
  days,
  weekRange,
  totalWeeks,
  selectedEventId = null,
  onDaySelect,
  onEventSelect,
  onRequestRangeChange,
  scrollContainerRef,
  onTodayNode,
}: CalendarViewProps) {
  const topSentinelRef = useRef<HTMLButtonElement | null>(null);
  const bottomSentinelRef = useRef<HTMLButtonElement | null>(null);

  const hasMoreUp = weekRange.start > 0;
  const hasMoreDown = weekRange.end < totalWeeks;

  const setTopSentinel = useCallback((node: HTMLButtonElement | null) => {
    topSentinelRef.current = node;
  }, []);

  const setBottomSentinel = useCallback((node: HTMLButtonElement | null) => {
    bottomSentinelRef.current = node;
  }, []);

  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }
          if (entry.target === topSentinelRef.current) {
            onRequestRangeChange("up");
          } else if (entry.target === bottomSentinelRef.current) {
            onRequestRangeChange("down");
          }
        });
      },
      {
        root,
        rootMargin: "400px 0px",
        threshold: 0,
      },
    );

    if (hasMoreUp && topSentinelRef.current) {
      observer.observe(topSentinelRef.current);
    }

    if (hasMoreDown && bottomSentinelRef.current) {
      observer.observe(bottomSentinelRef.current);
    }

    return () => observer.disconnect();
  }, [
    hasMoreUp,
    hasMoreDown,
    onRequestRangeChange,
    scrollContainerRef,
    weekRange.start,
    weekRange.end,
  ]);

  const handleDayClick = (date: Date) => (event: MouseEvent<HTMLButtonElement>) => {
    onDaySelect(date, event.shiftKey);
  };

  const placeholderClassName = useMemo(
    () =>
      cn(
        "group relative flex h-full w-full items-stretch bg-bg text-left",
        "pointer-events-none",
      ),
    [],
  );

  const renderWindowStart = Math.max(0, weekRange.start - 2);
  const renderWindowEnd = Math.min(totalWeeks, weekRange.end + 2);

  return (
    <div
      className="grid h-full min-h-screen grid-cols-7 gap-[1px] bg-border"
      style={{ gridAutoRows: "minmax(calc(100svh/5), 1fr)" }}
    >
      {days.map((day) => {
        const isWithinWindow =
          day.weekIndex >= renderWindowStart && day.weekIndex < renderWindowEnd;

        const isStartOfWeek = day.dayIndex % 7 === 0;
        const isEndOfWeek = day.dayIndex % 7 === 6;
        const shouldAttachTop = hasMoreUp && isStartOfWeek && day.weekIndex === weekRange.start;
        const shouldAttachBottom =
          hasMoreDown && isEndOfWeek && day.weekIndex === weekRange.end - 1;

        if (!isWithinWindow) {
          return (
            <div
              key={day.dayIndex}
              className={placeholderClassName}
              aria-hidden="true"
            >
              <div className="flex h-full w-full rounded-[12px] border border-transparent bg-bg" />
            </div>
          );
        }

        return (
          <button
            key={day.dayIndex}
            type="button"
            ref={(node) => {
              if (shouldAttachTop) {
                setTopSentinel(node);
              }
              if (shouldAttachBottom) {
                setBottomSentinel(node);
              }
              if (day.isToday) {
                onTodayNode?.(node);
              }
            }}
            className={cn(
              "group relative flex h-full w-full items-stretch bg-bg text-left focus:outline-none",
            )}
            onClick={handleDayClick(day.date)}
          >
            <div className="flex h-full w-full">
              <CalendarDayCell
                day={day}
                selectedEventId={selectedEventId}
                onEventClick={onEventSelect}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

