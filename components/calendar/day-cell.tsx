"use client";

import { KeyboardEvent, MouseEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { addMinutes, format } from "date-fns";

import { cn } from "@/lib/cn";
import { HydratedCalendarEvent } from "@/lib/events-store";
import type { CalendarDay as CalendarDayModel } from "@/lib/calendar";
import { areEventsInSameRecurringSeries } from "@/lib/calendar";

import { CalendarDayCellEvent } from "./day-cell-event";

type HoverIndicatorState = {
  slotIndex: number;
  ratio: number;
  top: number;
  width: number;
  containerWidth: number;
  previousEventId: string | null;
  nextEventId: string | null;
};

export type CalendarDayCellCreateEventPayload = {
  day: CalendarDayModel;
  start: Date;
  end: Date;
  previousEventId?: string | null;
  nextEventId?: string | null;
};

type CalendarDayCellProps = {
  day: CalendarDayModel;
  selectedEventId?: string | null;
  selectedEvent?: HydratedCalendarEvent | null;
  onEventClick?: (event: HydratedCalendarEvent) => void;
  onEventCreate?: (payload: CalendarDayCellCreateEventPayload) => void;
};

export function CalendarDayCell({
  day,
  selectedEventId,
  selectedEvent,
  onEventClick,
  onEventCreate,
}: CalendarDayCellProps) {
  const indicatorColor = "var(--color-red-500)"; // red color from design system
  const eventContainerRef = useRef<HTMLDivElement | null>(null);
  const [hoverState, setHoverState] = useState<HoverIndicatorState | null>(null);
  const [showAnimation, setShowAnimation] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [visibleEventCount, setVisibleEventCount] = useState<number | null>(null);

  const hasEvents = day.events.length > 0;
  
  // Calculate grouped events (time-off events grouped together)
  const groupedEventsData = useMemo(() => {
    const timeOffEvents: HydratedCalendarEvent[] = [];
    const otherEvents: HydratedCalendarEvent[] = [];
    
    day.events.forEach((event) => {
      if (event.type === "time-off") {
        timeOffEvents.push(event);
      } else {
        otherEvents.push(event);
      }
    });

    // Count unique people for time-off (by owner ID or name)
    const uniqueTimeOffPeople = new Set<string>();
    timeOffEvents.forEach((event) => {
      const personId = event.owner.id || event.owner.name;
      uniqueTimeOffPeople.add(personId);
    });

    // Create grouped events list: grouped time-off first (if any), then other events
    const renderedEvents: HydratedCalendarEvent[] = [];
    
    if (timeOffEvents.length > 0) {
      // Create a synthetic grouped event for display
      const firstTimeOffEvent = timeOffEvents[0];
      const groupedTimeOffEvent: HydratedCalendarEvent = {
        ...firstTimeOffEvent,
        id: `grouped-time-off-${day.date.toISOString()}`,
        title: `${uniqueTimeOffPeople.size} ${uniqueTimeOffPeople.size === 1 ? "person" : "people"} off`,
      };
      renderedEvents.push(groupedTimeOffEvent);
    }
    
    renderedEvents.push(...otherEvents);

    return {
      renderedEvents,
      timeOffEvents,
      groupedEventsCount: renderedEvents.length,
    };
  }, [day.events, day.date]);
  
  // Event height is 20px, gap is 2px
  // For N events: height = N * 20 + (N - 1) * 2 = 22N - 2
  // For N events + "more events" text: height = N * 20 + N * 2 + 20 = 22N + 20
  const EVENT_HEIGHT = 20;
  const EVENT_GAP = 2;
  const MORE_EVENTS_TEXT_HEIGHT = 20; // Same height as an event
  
  // Calculate how many events can fit
  const calculateVisibleEvents = useCallback(() => {
    const container = eventContainerRef.current;
    if (!container || groupedEventsData.groupedEventsCount === 0) {
      setVisibleEventCount(null);
      return;
    }

    const containerHeight = container.clientHeight;
    if (containerHeight === 0) {
      setVisibleEventCount(null);
      return;
    }

    // First check if all grouped events fit without "more events" text
    // Height for all events: groupedEventsCount * 20 + (groupedEventsCount - 1) * 2
    const heightForAllEvents = groupedEventsData.groupedEventsCount * EVENT_HEIGHT + (groupedEventsData.groupedEventsCount - 1) * EVENT_GAP;
    
    if (heightForAllEvents <= containerHeight) {
      // All events fit
      setVisibleEventCount(groupedEventsData.groupedEventsCount);
      return;
    }

    // Not all events fit, calculate how many events + "more events" text can fit
    // Height = N * 20 + N * 2 + 20 = 22N + 20
    // So: 22N + 20 <= containerHeight
    // N <= (containerHeight - 20) / 22
    const maxEventsWithMoreText = Math.floor((containerHeight - MORE_EVENTS_TEXT_HEIGHT) / (EVENT_HEIGHT + EVENT_GAP));
    
    if (maxEventsWithMoreText > 0) {
      setVisibleEventCount(maxEventsWithMoreText);
    } else {
      // Even the "more events" text doesn't fit, but show it anyway
      setVisibleEventCount(0);
    }
  }, [groupedEventsData.groupedEventsCount]);

  // Recalculate when container size or events change
  useEffect(() => {
    calculateVisibleEvents();
    
    const container = eventContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      calculateVisibleEvents();
    });

    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [calculateVisibleEvents]);

  useEffect(() => {
    if (hoverState) {
      // Clear any existing timeout
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      // Set timeout to show animation after 0.2s delay
      hoverTimeoutRef.current = setTimeout(() => {
        setShowAnimation(true);
      }, 200);
    } else {
      // Clear timeout and hide animation immediately when hover ends
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
        hoverTimeoutRef.current = null;
      }
      setShowAnimation(false);
    }

    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, [hoverState]);

  const handleMouseMove = (interactionEvent: MouseEvent<HTMLDivElement>) => {
    interactionEvent.stopPropagation();

    const container = eventContainerRef.current;
    if (!container) {
      return;
    }

    const rect = container.getBoundingClientRect();
    if (rect.height === 0) {
      setHoverState(null);
      return;
    }

    const pointerY = interactionEvent.clientY;
    const pointerX = interactionEvent.clientX;

    if (
      pointerY < rect.top ||
      pointerY > rect.bottom ||
      pointerX < rect.left ||
      pointerX > rect.right
    ) {
      setHoverState(null);
      return;
    }

    const eventElements = Array.from(
      container.querySelectorAll<HTMLElement>('[data-calendar-day-event="true"]'),
    );
    const eventRects = eventElements.map((element) => element.getBoundingClientRect());

    const isPointerOverEvent = eventRects.some(
      (eventRect) =>
        pointerY >= eventRect.top &&
        pointerY <= eventRect.bottom &&
        pointerX >= eventRect.left &&
        pointerX <= eventRect.right,
    );

    if (isPointerOverEvent) {
      if (hoverState !== null) {
        setHoverState(null);
      }
      return;
    }

    const containerHeight = rect.height;
    const containerWidth = rect.width;
    const relativeY = pointerY - rect.top;
    const INTERACTIVE_PAD = 12;

    type Slot = {
      slotIndex: number;
      start: number;
      end: number;
      center: number;
      width: number;
      previousEventId: string | null;
      nextEventId: string | null;
    };

    const slots: Slot[] = [];

    if (eventRects.length === 0) {
      const slotHeight = Math.max(containerHeight, INTERACTIVE_PAD * 2);
      slots.push({
        slotIndex: 0,
        start: 0,
        end: slotHeight,
        center: slotHeight / 2,
        width: containerWidth,
        previousEventId: null,
        nextEventId: null,
      });
    } else {
      const eventBounds = eventRects.map((eventRect) => ({
        top: eventRect.top - rect.top,
        bottom: eventRect.bottom - rect.top,
        width: eventRect.width,
      }));

      const eventWidth = eventBounds[0]?.width ?? containerWidth;

      const renderedEvents = groupedEventsData.renderedEvents;
      const firstGapHeight = eventBounds[0].top;
      if (firstGapHeight >= 0) {
        slots.push({
          slotIndex: 0,
          start: 0,
          end: Math.min(eventBounds[0].top + INTERACTIVE_PAD, containerHeight),
          center: Math.min(eventBounds[0].top / 2, INTERACTIVE_PAD),
          width: eventWidth,
          previousEventId: null,
          nextEventId: renderedEvents[0]?.id ?? null,
        });
      }

      for (let index = 1; index < eventBounds.length; index += 1) {
        const previousBounds = eventBounds[index - 1];
        const currentBounds = eventBounds[index];
        const gapStart = previousBounds.bottom;
        const gapEnd = currentBounds.top;
        const gapHeight = gapEnd - gapStart;

        if (gapHeight >= 0) {
          slots.push({
            slotIndex: index,
            start: Math.max(0, gapStart - INTERACTIVE_PAD),
            end: Math.min(containerHeight, gapEnd + INTERACTIVE_PAD),
            center: gapStart + gapHeight / 2,
            width: eventWidth,
            previousEventId: renderedEvents[index - 1]?.id ?? null,
            nextEventId: renderedEvents[index]?.id ?? null,
          });
        }
      }

      const lastBounds = eventBounds[eventBounds.length - 1];
      const trailingGapHeight = containerHeight - lastBounds.bottom;
      if (trailingGapHeight >= 0) {
        slots.push({
          slotIndex: eventBounds.length,
          start: Math.max(0, lastBounds.bottom - INTERACTIVE_PAD),
          end: Math.min(containerHeight, lastBounds.bottom + INTERACTIVE_PAD * 2),
          center: lastBounds.bottom,
          width: eventWidth,
          previousEventId: renderedEvents[renderedEvents.length - 1]?.id ?? null,
          nextEventId: null,
        });
      }

      if (slots.length === 0) {
        // Fallback: allow creation after the last event if gaps are too small to detect
        slots.push({
          slotIndex: eventBounds.length,
          start: Math.max(0, containerHeight - INTERACTIVE_PAD),
          end: containerHeight,
          center: Math.max(0, containerHeight - INTERACTIVE_PAD / 2),
          width: eventWidth,
          previousEventId: renderedEvents[renderedEvents.length - 1]?.id ?? null,
          nextEventId: null,
        });
      }
    }

    const activeSlot = slots.find(
      (slot) => relativeY >= slot.start && relativeY <= slot.end,
    );

    if (!activeSlot) {
      if (hoverState !== null) {
        setHoverState(null);
      }
      return;
    }

    const ratio = containerHeight === 0 ? 0 : activeSlot.center / containerHeight;

    setHoverState((previous) => {
      if (
        previous &&
        previous.slotIndex === activeSlot.slotIndex &&
        Math.abs(previous.top - activeSlot.center) < 1 &&
        Math.abs(previous.width - activeSlot.width) < 1 &&
        Math.abs(previous.containerWidth - containerWidth) < 1 &&
        previous.previousEventId === activeSlot.previousEventId &&
        previous.nextEventId === activeSlot.nextEventId
      ) {
        return previous;
      }

      return {
        slotIndex: activeSlot.slotIndex,
        ratio,
        top: activeSlot.center,
        width: activeSlot.width,
        containerWidth,
        previousEventId: activeSlot.previousEventId,
        nextEventId: activeSlot.nextEventId,
      };
    });
  };

  const handleMouseLeave = () => {
    if (hoverState !== null) {
      setHoverState(null);
    }
  };

  const createEventAtHoverState = () => {
    if (!hoverState) {
      return;
    }

    const startOfDay = new Date(
      day.date.getFullYear(),
      day.date.getMonth(),
      day.date.getDate(),
      0,
      0,
      0,
      0,
    );

    let start: Date;

    // If there's a previous event, use its end time as the start time
    if (hoverState.previousEventId) {
      const previousEvent = day.events.find((event) => event.id === hoverState.previousEventId);
      if (previousEvent) {
        const previousEnd = previousEvent.endsAt ?? previousEvent.startsAt;
        // Round to nearest 15 minutes
        const minutes = previousEnd.getMinutes();
        const roundedMinutes = Math.round(minutes / 15) * 15;
        start = new Date(previousEnd);
        start.setMinutes(roundedMinutes);
        start.setSeconds(0);
        start.setMilliseconds(0);
        
        // If rounding caused it to go to the next hour, adjust
        if (roundedMinutes >= 60) {
          start.setHours(start.getHours() + 1);
          start.setMinutes(0);
        }
      } else {
        // Fallback to ratio-based calculation if previous event not found
        const minutesInDay = 24 * 60;
        const suggestedMinutes = Math.min(
          Math.round((hoverState.ratio * minutesInDay) / 15) * 15,
          minutesInDay - 15,
        );
        start = addMinutes(startOfDay, suggestedMinutes);
      }
    } else {
      // No previous event, use ratio-based calculation
      const minutesInDay = 24 * 60;
      const suggestedMinutes = Math.min(
        Math.round((hoverState.ratio * minutesInDay) / 15) * 15,
        minutesInDay - 15,
      );
      start = addMinutes(startOfDay, suggestedMinutes);
    }

    const rawEnd = addMinutes(start, 30);
    const cappedEnd =
      rawEnd.getFullYear() === start.getFullYear() &&
      rawEnd.getMonth() === start.getMonth() &&
      rawEnd.getDate() === start.getDate()
        ? rawEnd
        : new Date(start.getFullYear(), start.getMonth(), start.getDate(), 23, 59, 0, 0);

    onEventCreate?.({
      day,
      start,
      end: cappedEnd,
      previousEventId: hoverState.previousEventId ?? null,
      nextEventId: hoverState.nextEventId ?? null,
    });
  };

  const indicatorMetrics = useMemo(() => {
    if (!hoverState) {
      return null;
    }

    const CIRCLE_SIZE = 12;
    const BRIDGE_WIDTH = 12;
    const MIN_LINE_WIDTH = 12;

    const lineWidth = Math.max(Number.isFinite(hoverState.width) ? hoverState.width : MIN_LINE_WIDTH, MIN_LINE_WIDTH);
    // Line extends 4px past event width
    const totalLineWidth = lineWidth + 4;
    // Circle starts right when events end (left edge at lineWidth), so center is at lineWidth + radius
    const circleCenter = lineWidth + CIRCLE_SIZE / 2;
    // Calculate delay so circle appears when line reaches event width
    const ANIMATION_DURATION = 0.1;
    const circleDelay = (lineWidth / totalLineWidth) * ANIMATION_DURATION;

    return {
      lineWidth,
      totalLineWidth,
      circleCenter,
      circleSize: CIRCLE_SIZE,
      circleDelay,
    };
  }, [hoverState]);

  const handleCreateEventClick = (interactionEvent: MouseEvent<HTMLDivElement>) => {
    interactionEvent.preventDefault();
    interactionEvent.stopPropagation();
    
    if (!hoverState) {
      return;
    }

    createEventAtHoverState();
  };

  const handleCreateEventKeyDown = (keyboardEvent: KeyboardEvent<HTMLDivElement>) => {
    if (keyboardEvent.key !== "Enter" && keyboardEvent.key !== " ") {
      return;
    }

    keyboardEvent.preventDefault();
    keyboardEvent.stopPropagation();
    createEventAtHoverState();
  };

  return (
    <div
      className={cn(
        "relative flex h-full w-full flex-col rounded-[12px] border-2 bg-bg px-[14px] pb-[14px] pt-[12px] text-fg transition-all duration-150",
        day.isSelected ? "border-[#3AD33A]" : "border-transparent",
        !day.isSelected &&
          "group-hover:border-border group-hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08)] group-active:border-success/60 group-active:shadow-[0_0_0_1px_rgba(22,163,74,0.45)]",
        day.isToday && "bg-bg2",
        day.isToday && !day.isSelected && "border-border",
        day.isDimmed && "opacity-30",
      )}
    >
      {day.isMonthStart && (
        <span
          className={cn(
            "absolute left-[14px] top-[12px] inline-flex translate-y-[6px] text-h3 font-medium leading-none text-fg2 transition-opacity duration-150",
            selectedEvent &&
              !day.events.some((event) => event.id === selectedEvent.id) &&
              "opacity-30",
          )}
        >
          {format(day.date, "MMM")}
          {"\u00a0"}
        </span>
      )}
      <div className="relative flex w-full items-center justify-center">
        <span
          className={cn(
            "relative inline-flex items-baseline text-h2 font-medium leading-none text-center transition-opacity duration-150",
            selectedEvent &&
              !day.events.some((event) => event.id === selectedEvent.id) &&
              "opacity-30",
          )}
        >
          {format(day.date, "d")}
        </span>
      </div>
      <div
        ref={eventContainerRef}
        className="relative flex flex-1 flex-col gap-[2px] overflow-visible"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        role="presentation"
      >
        {(() => {
          const { renderedEvents, timeOffEvents } = groupedEventsData;

          // Apply visibility limit
          const eventsToShow = visibleEventCount !== null && visibleEventCount < renderedEvents.length
            ? renderedEvents.slice(0, visibleEventCount)
            : renderedEvents;
          
          const remainingCount = renderedEvents.length - eventsToShow.length;
          const showMoreEvents = remainingCount > 0;

          return (
            <>
              {eventsToShow.map((event) => {
                const isGroupedTimeOff = event.id.startsWith("grouped-time-off-");
                const isSelected = selectedEventId === event.id;
                
                // For grouped time-off, check if any of the underlying events is selected
                const isAnyTimeOffSelected = isGroupedTimeOff 
                  ? timeOffEvents.some((e) => e.id === selectedEventId)
                  : false;
                
                const actualIsSelected = isGroupedTimeOff ? isAnyTimeOffSelected : isSelected;
                
                const isPartOfSelectedRecurringSeries =
                  selectedEvent && !actualIsSelected && selectedEventId
                    ? (isGroupedTimeOff
                        ? timeOffEvents.some((e) => areEventsInSameRecurringSeries(e, selectedEvent))
                        : areEventsInSameRecurringSeries(event, selectedEvent))
                    : false;

                return (
                  <CalendarDayCellEvent
                    key={event.id}
                    event={event}
                    isSelected={actualIsSelected}
                    isPartOfSelectedRecurringSeries={isPartOfSelectedRecurringSeries}
                    hasSelectedEvent={!!selectedEventId}
                    onSelect={(e) => {
                      // When clicking grouped time-off, select the first underlying event
                      if (isGroupedTimeOff && timeOffEvents.length > 0 && onEventClick) {
                        onEventClick(timeOffEvents[0]);
                      } else if (onEventClick) {
                        onEventClick(event);
                      }
                    }}
                  />
                );
              })}
              {showMoreEvents && (
                <div className="flex h-[20px] items-center justify-center rounded-sm px-[4px] text-tag text-fg leading-none">
                  {remainingCount} more {remainingCount === 1 ? "event" : "events"}
                </div>
              )}
            </>
          );
        })()}

        {hoverState && indicatorMetrics && showAnimation && (
          <div className="absolute inset-0 z-50 pointer-events-none">
            <div
              className="absolute left-0 flex cursor-pointer pointer-events-auto"
              style={{
                top: `${hoverState.top}px`,
                transform: "translateY(-50%)",
                height: "12px",
                alignItems: "center",
              }}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={handleCreateEventClick}
              onKeyDown={handleCreateEventKeyDown}
              role="button"
              tabIndex={0}
              aria-label={hasEvents ? "Create event at this time" : "Create your first event"}
            >
              <div
                className="h-[2px] rounded-full origin-left"
                style={{
                  width: `${indicatorMetrics.totalLineWidth}px`,
                  backgroundColor: indicatorColor,
                  animation: "lineGrow 0.1s ease-in-out forwards",
                  transform: "scaleX(0)",
                }}
              />
            </div>
            <div
              className="absolute flex size-[12px] items-center justify-center rounded-full text-[10px] font-semibold leading-none text-white transition-transform duration-150 hover:scale-[1.08] active:scale-[0.95] origin-center cursor-pointer pointer-events-auto"
              style={{
                top: `${hoverState.top}px`,
                left: `${indicatorMetrics.circleCenter}px`,
                transform: "translate(-50%, -50%) scale(0)",
                backgroundColor: indicatorColor,
                animation: `circleAppear 0.1s ease-in-out ${indicatorMetrics.circleDelay}s forwards`,
              }}
              aria-label={hasEvents ? "Create event at this time" : "Create your first event"}
              onMouseDown={(event) => {
                event.preventDefault();
                event.stopPropagation();
              }}
              onPointerDown={(event) => {
                event.stopPropagation();
              }}
              onClick={(event) => {
                event.stopPropagation();
                handleCreateEventClick(event);
              }}
              onKeyDown={handleCreateEventKeyDown}
              role="button"
              tabIndex={0}
            >
              +
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

