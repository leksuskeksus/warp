"use client";

import {
  MutableRefObject,
  MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { format } from "date-fns";

import { cn } from "@/lib/cn";
import { HydratedCalendarEvent } from "@/lib/events-store";
import type { CalendarDay } from "@/lib/calendar";

import { CalendarDayCell, type CalendarDayCellCreateEventPayload } from "./day-cell";

export type CalendarWeekViewportEvent = {
  weekIndex: number;
  date: Date;
  isIntersecting: boolean;
  relativeTop: number;
};

type CalendarWeekRange = {
  start: number;
  end: number;
};

type CalendarViewProps = {
  days: CalendarDay[];
  weekRange: CalendarWeekRange;
  totalWeeks: number;
  selectedEventId?: string | null;
  selectedEvent?: HydratedCalendarEvent | null;
  onDaySelect: (date: Date, additive: boolean, isRange: boolean) => void;
  onEventSelect: (event: HydratedCalendarEvent) => void;
  onEventCreate: (payload: CalendarDayCellCreateEventPayload) => void;
  onRequestRangeChange: (direction: "up" | "down") => void;
  scrollContainerRef: MutableRefObject<HTMLDivElement | null>;
  todayWeekIndex: number;
  onTodayWeekStartNode?: (node: HTMLButtonElement | null) => void;
  onWeekInView?: (event: CalendarWeekViewportEvent) => void;
};

export function CalendarView({
  days,
  weekRange,
  totalWeeks,
  selectedEventId = null,
  selectedEvent = null,
  onDaySelect,
  onEventSelect,
  onEventCreate,
  onRequestRangeChange,
  scrollContainerRef,
  todayWeekIndex,
  onTodayWeekStartNode,
  onWeekInView,
}: CalendarViewProps) {
  const topSentinelRef = useRef<HTMLButtonElement | null>(null);
  const bottomSentinelRef = useRef<HTMLButtonElement | null>(null);
  const weekStartNodesRef = useRef<Map<number, HTMLButtonElement>>(new Map());

  const hasMoreUp = weekRange.start > 0;
  const hasMoreDown = weekRange.end < totalWeeks;

  const setTopSentinel = useCallback((node: HTMLButtonElement | null) => {
    topSentinelRef.current = node;
  }, []);

  const setBottomSentinel = useCallback((node: HTMLButtonElement | null) => {
    bottomSentinelRef.current = node;
  }, []);

  const registerWeekStartNode = useCallback((weekIndex: number, node: HTMLButtonElement | null) => {
    const map = weekStartNodesRef.current;
    if (node) {
      map.set(weekIndex, node);
    } else {
      map.delete(weekIndex);
    }
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

  useEffect(() => {
    if (!onWeekInView) {
      return;
    }

    const root = scrollContainerRef.current;
    if (!root) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const rootRect = root.getBoundingClientRect();

        entries.forEach((entry) => {
          const target = entry.target as HTMLElement;
          const weekIndexAttr = target.dataset.weekIndex;
          const dayMsAttr = target.dataset.dayMs;
          if (!weekIndexAttr || !dayMsAttr) {
            return;
          }
          const weekIndex = Number.parseInt(weekIndexAttr, 10);
          const date = new Date(Number(dayMsAttr));
          const relativeTop = entry.boundingClientRect.top - rootRect.top;

          onWeekInView({
            weekIndex,
            date,
            isIntersecting: entry.isIntersecting,
            relativeTop,
          });
        });
      },
      {
        root,
        threshold: [0],
        rootMargin: "0px 0px -80% 0px",
      },
    );

    weekStartNodesRef.current.forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, [onWeekInView, scrollContainerRef, weekRange.start, weekRange.end]);

  const handleDayClick = (date: Date) => (event: MouseEvent<HTMLButtonElement>) => {
    // Cmd/Ctrl+click for additive selection (add/remove from selection)
    // Shift+click for range selection (select all days between)
    const isAdditive = event.metaKey || event.ctrlKey;
    const isRange = event.shiftKey;
    onDaySelect(date, isAdditive, isRange);
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
        const isTodayWeekStart = isStartOfWeek && day.weekIndex === todayWeekIndex;

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
            data-date={format(day.date, "yyyy-MM-dd")}
            ref={(node) => {
              if (shouldAttachTop) {
                setTopSentinel(node);
              }
              if (shouldAttachBottom) {
                setBottomSentinel(node);
              }
              if (isTodayWeekStart) {
                onTodayWeekStartNode?.(node);
              }
              if (isStartOfWeek) {
                registerWeekStartNode(day.weekIndex, node);
                if (node) {
                  node.dataset.weekIndex = String(day.weekIndex);
                  node.dataset.dayMs = String(day.date.getTime());
                }
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
                selectedEvent={selectedEvent}
                onEventClick={onEventSelect}
                onEventCreate={onEventCreate}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}

