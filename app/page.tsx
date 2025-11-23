"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  addMinutes,
  addWeeks,
  differenceInCalendarDays,
  endOfDay,
  format,
  parseISO,
  set as setTime,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/cn";
import {
  CalendarEvent,
  CalendarParticipant,
  HydratedCalendarEvent,
  hydrateEvent,
  hydrateEvents,
  useEvents,
  WEEK_START as EVENTS_WEEK_START,
} from "@/lib/events-store";
import { CalendarView, CalendarWeekViewportEvent } from "@/components/calendar/calendar-view";
import type { CalendarDayCellCreateEventPayload } from "@/components/calendar/day-cell";
import type { CalendarDay } from "@/lib/calendar";
import { buildCalendarDays } from "@/lib/calendar";
import { CalendarInspector, CalendarInspectorSection } from "@/components/calendar/inspector";
import type { CalendarEventFormValues } from "@/components/calendar/event-form";
import { usePeople } from "@/lib/people-store";
import { populateCurrentMonthEvents } from "@/scripts/populate-events";

const WEEK_START = EVENTS_WEEK_START;
const TOTAL_WEEKS_FORWARD = 120;
const TOTAL_WEEKS_BACKWARD = 36;
const TOTAL_WEEKS = TOTAL_WEEKS_FORWARD + TOTAL_WEEKS_BACKWARD;
const INITIAL_VISIBLE_WEEKS = 12;
const WEEK_VISIBILITY_BUFFER = 6;
const TOP_SCROLL_OFFSET = 63;
const TOP_BAR_HEIGHT = 51;
const INSPECTOR_TOP_OFFSET = TOP_BAR_HEIGHT + 8;

const DEFAULT_LOCAL_OWNER: CalendarParticipant = {
  id: "local-owner",
  name: "You",
  role: "organizer",
};

const PERSON_EVENT_TYPES = new Set<CalendarEvent["type"]>([
  "time-off",
  "birthday",
  "work-anniversary",
]);

const TITLE_REQUIRED_EVENT_TYPES = new Set<CalendarEvent["type"]>([
  "company-event",
  "deadline",
]);

const END_DATE_EVENT_TYPES = new Set<CalendarEvent["type"]>(["time-off", "company-event"]);
const TIME_EVENT_TYPES = new Set<CalendarEvent["type"]>(["company-event", "deadline"]);
const END_TIME_EVENT_TYPES = new Set<CalendarEvent["type"]>(["company-event"]);
const LOCATION_EVENT_TYPES = new Set<CalendarEvent["type"]>(["company-event"]);
const ATTENDEE_EVENT_TYPES = new Set<CalendarEvent["type"]>(["company-event"]);
const RECURRENCE_EVENT_TYPES = new Set<CalendarEvent["type"]>(["deadline"]);

export default function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLeadingSidebarCollapsed, setIsLeadingSidebarCollapsed] = useState(false);
  const [persistedEvents, setPersistedEvents] = useEvents();
  const [people] = usePeople();
  const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
  const [selectedEvent, setSelectedEvent] = useState<HydratedCalendarEvent | null>(null);
  const [draftEvent, setDraftEvent] = useState<CalendarEventFormValues | null>(null);
  const [draftEventKey, setDraftEventKey] = useState<string | null>(null);
  const [draftErrors, setDraftErrors] = useState<string[]>([]);
  const [isDraftSaving, setIsDraftSaving] = useState(false);
  const selectedDaysRef = useRef(selectedDays);
  const selectedEventRef = useRef<HydratedCalendarEvent | null>(null);
  const draftEventRef = useRef<CalendarEventFormValues | null>(null);
  const peopleById = useMemo(() => {
    const map = new Map<string, (typeof people)[number]>();
    people.forEach((person) => {
      map.set(person.id, person);
    });
    return map;
  }, [people]);
  const [visibleWeekRange, setVisibleWeekRange] = useState<{ start: number; end: number }>(() => ({
    start: TOTAL_WEEKS_BACKWARD,
    end: Math.min(TOTAL_WEEKS, TOTAL_WEEKS_BACKWARD + INITIAL_VISIBLE_WEEKS),
  }));
  const calendarScrollRef = useRef<HTMLDivElement | null>(null);
  const todayWeekStartNodeRef = useRef<HTMLButtonElement | null>(null);
  const hasScrolledToTodayRef = useRef(false);
  const [visibleMonthLabel, setVisibleMonthLabel] = useState(() =>
    format(new Date(), "MMMM yyyy"),
  );
  const localTimeZone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);
  const selectedEventId = selectedEvent?.id ?? null;
  const weekViewportMapRef = useRef<Map<number, { top: number; date: Date }>>(new Map());

  // Expose populate function to browser console for easy access
  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).populateCurrentMonthEvents = () => {
        const success = populateCurrentMonthEvents();
        if (success) {
          // Refresh events from storage
          const eventsJson = window.localStorage.getItem("calendar-events");
          if (eventsJson) {
            try {
              const events = JSON.parse(eventsJson) as CalendarEvent[];
              setPersistedEvents(events);
            } catch (e) {
              console.error("Failed to refresh events after population:", e);
            }
          }
        }
        return success;
      };
    }
  }, [setPersistedEvents]);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }, []);

  const calendarBaseDate = useMemo(() => {
    const start = startOfWeek(today, { weekStartsOn: WEEK_START });
    return addWeeks(start, -TOTAL_WEEKS_BACKWARD);
  }, [today]);

  const hydratedEvents = useMemo(() => {
    const events = hydrateEvents(persistedEvents);
    return events.sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());
  }, [persistedEvents]);

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

  const baseCalendarDays = useMemo<CalendarDay[]>(
    () =>
      buildCalendarDays({
        baseDate: calendarBaseDate,
        today,
        startWeek: 0,
        weekCount: TOTAL_WEEKS,
        events: hydratedEvents,
      }),
    [calendarBaseDate, hydratedEvents, today],
  );

  const calendarDays = useMemo<CalendarDay[]>(() => {
    const hasSelection = selectedDays.size > 0;

    return baseCalendarDays.map((day) => {
      const key = format(day.date, "yyyy-MM-dd");
      const isSelected = selectedDays.has(key);

      return {
        ...day,
        isSelected,
        isDimmed: hasSelection && !isSelected,
      };
    });
  }, [baseCalendarDays, selectedDays]);

  const getWeekIndexForDate = useCallback(
    (date: Date) => {
      const dayDifference = differenceInCalendarDays(startOfDay(date), calendarBaseDate);
      return Math.floor(dayDifference / 7);
    },
    [calendarBaseDate],
  );

  const todayWeekIndex = useMemo(
    () => getWeekIndexForDate(today),
    [getWeekIndexForDate, today],
  );

  const ensureWeekVisible = useCallback(
    (weekIndex: number) => {
      if (!Number.isFinite(weekIndex)) {
        return;
      }

      const clampedIndex = Math.min(Math.max(weekIndex, 0), TOTAL_WEEKS - 1);

      setVisibleWeekRange((previous) => {
        if (clampedIndex >= previous.start && clampedIndex < previous.end) {
          return previous;
        }

        const desiredStart = Math.max(
          0,
          clampedIndex - Math.floor(INITIAL_VISIBLE_WEEKS / 2),
        );
        const maxStart = Math.max(0, TOTAL_WEEKS - INITIAL_VISIBLE_WEEKS);
        const adjustedStart = Math.min(desiredStart, maxStart);
        const adjustedEnd = Math.min(
          TOTAL_WEEKS,
          Math.max(adjustedStart + INITIAL_VISIBLE_WEEKS, clampedIndex + 1),
        );

        return {
          start: adjustedStart,
          end: adjustedEnd,
        };
      });
    },
    [],
  );

  const handleTodayWeekStartNode = useCallback((node: HTMLButtonElement | null) => {
    todayWeekStartNodeRef.current = node;
  }, []);

  const handleWeekInView = useCallback(
    ({ weekIndex, date, isIntersecting, relativeTop }: CalendarWeekViewportEvent) => {
      const map = weekViewportMapRef.current;
      const adjustedTop = relativeTop - TOP_SCROLL_OFFSET;

      if (isIntersecting) {
        map.set(weekIndex, { top: adjustedTop, date });
      } else {
        map.delete(weekIndex);
      }

      if (map.size === 0) {
        setVisibleMonthLabel(format(date, "MMMM yyyy"));
        return;
      }

      let candidateTop = Number.POSITIVE_INFINITY;
      let candidateDate: Date | null = null;

      map.forEach(({ top, date: entryDate }) => {
        if (candidateDate === null) {
          candidateTop = top;
          candidateDate = entryDate;
          return;
        }

        if (candidateTop >= 0 && top >= 0) {
          if (top < candidateTop) {
            candidateTop = top;
            candidateDate = entryDate;
          }
          return;
        }

        if (candidateTop >= 0 && top < 0) {
          return;
        }

        if (candidateTop < 0 && top >= 0) {
          candidateTop = top;
          candidateDate = entryDate;
          return;
        }

        if (top > candidateTop) {
          candidateTop = top;
          candidateDate = entryDate;
        }
      });

      if (candidateDate) {
        setVisibleMonthLabel(format(candidateDate, "MMMM yyyy"));
      }
    },
    [],
  );

  const openCreationPane = useCallback(
    (options?: { start?: Date; end?: Date }) => {
      const resolveSelectionDate = () => {
        if (selectedDays.size === 0) {
          return null;
        }

        const sortedKeys = Array.from(selectedDays).sort();
        const firstKey = sortedKeys[0];
        try {
          const parsedDate = parseISO(firstKey);
          if (Number.isNaN(parsedDate.getTime())) {
            return null;
          }
          return parsedDate;
        } catch {
          return null;
        }
      };

      const baseStart =
        options?.start ??
        (() => {
          const selection = resolveSelectionDate();
          if (selection) {
            return setTime(selection, {
              hours: 9,
              minutes: 0,
              seconds: 0,
              milliseconds: 0,
            });
          }
          const now = new Date();
          const roundedMinutes = Math.floor(now.getMinutes() / 15) * 15;
          return setTime(now, {
            hours: now.getHours(),
            minutes: roundedMinutes,
            seconds: 0,
            milliseconds: 0,
          });
        })();

      const suggestedEnd =
        options?.end && options.end.getTime() >= baseStart.getTime()
          ? options.end
          : addMinutes(baseStart, 30);

      const initialValues: CalendarEventFormValues = {
        title: "",
        type: "company-event",
        isAllDay: false,
        startDate: format(baseStart, "yyyy-MM-dd"),
        startTime: format(baseStart, "HH:mm"),
        endDate: format(suggestedEnd, "yyyy-MM-dd"),
        endTime: format(suggestedEnd, "HH:mm"),
        timeZone: localTimeZone,
        location: "",
        description: "",
        ownerName: DEFAULT_LOCAL_OWNER.name,
        ownerEmail: "",
        attendeesInput: "",
        recurrenceRule: "",
        personId: "",
      };

      setDraftEvent(initialValues);
      setDraftEventKey(crypto.randomUUID());
      setDraftErrors([]);
      setIsDraftSaving(false);
      setSelectedEvent(null);

      const startDayKey = format(baseStart, "yyyy-MM-dd");
      setSelectedDays(new Set([startDayKey]));
      setIsSidebarOpen(true);
      ensureWeekVisible(getWeekIndexForDate(baseStart));
    },
    [ensureWeekVisible, getWeekIndexForDate, localTimeZone, selectedDays],
  );

  const handleCreateIntent = useCallback(
    (payload: CalendarDayCellCreateEventPayload) => {
      openCreationPane({ start: payload.start, end: payload.end });
    },
    [openCreationPane],
  );

  const handleRequestNewEvent = useCallback(() => {
    openCreationPane();
  }, [openCreationPane]);

  const handleDraftCancel = useCallback(() => {
    setDraftEvent(null);
    setDraftEventKey(null);
    setDraftErrors([]);
    setIsDraftSaving(false);
  }, []);

  const handleDraftSubmit = useCallback(
    (values: CalendarEventFormValues) => {
      const validationErrors: string[] = [];
      const requiresPerson = PERSON_EVENT_TYPES.has(values.type);
      const requiresTitle = TITLE_REQUIRED_EVENT_TYPES.has(values.type);
      const allowEndDate = END_DATE_EVENT_TYPES.has(values.type);
      const allowTime = TIME_EVENT_TYPES.has(values.type);
      const allowEndTime = END_TIME_EVENT_TYPES.has(values.type);
      const allowLocation = LOCATION_EVENT_TYPES.has(values.type);
      const allowAttendees = ATTENDEE_EVENT_TYPES.has(values.type);
      const allowRecurrence = RECURRENCE_EVENT_TYPES.has(values.type);
      const trimmedTitle = values.title.trim();
      const selectedPerson = requiresPerson ? peopleById.get(values.personId) ?? null : null;

      if (requiresPerson && !selectedPerson) {
        validationErrors.push(
          peopleById.size === 0
            ? "Add people before creating this event type."
            : "Select a person for this event type.",
        );
      }

      if (requiresTitle && !trimmedTitle) {
        validationErrors.push("Title is required.");
      }

      if (!values.startDate) {
        validationErrors.push("Start date is required.");
      }

      let startDate = values.startDate ? parseISO(values.startDate) : null;
      if (!startDate || Number.isNaN(startDate.getTime())) {
        validationErrors.push("Start date is invalid.");
      }

      const parseTime = (input: string | undefined, fallback: { hours: number; minutes: number }) => {
        if (!input) {
          return fallback;
        }
        const [hourPart, minutePart] = input.split(":");
        const hours = Number.parseInt(hourPart ?? "", 10);
        const minutes = Number.parseInt(minutePart ?? "", 10);
        if (Number.isNaN(hours) || Number.isNaN(minutes)) {
          return fallback;
        }
        return { hours, minutes };
      };

      if (validationErrors.length > 0 || !startDate) {
        setDraftErrors(validationErrors);
        return;
      }

      const startTimeParts = parseTime(values.startTime, { hours: 9, minutes: 0 });
      const isAllDay = allowTime ? values.isAllDay : true;
      const start = isAllDay
        ? startOfDay(startDate)
        : setTime(startDate, {
            hours: startTimeParts.hours,
            minutes: startTimeParts.minutes,
            seconds: 0,
            milliseconds: 0,
          });

      let end: Date | null = null;

      if (isAllDay) {
        let endDateSource = startDate;
        if (allowEndDate && values.endDate) {
          const parsedEndDate = parseISO(values.endDate);
          if (!parsedEndDate || Number.isNaN(parsedEndDate.getTime())) {
            validationErrors.push("End date is invalid.");
          } else if (parsedEndDate.getTime() < startDate.getTime()) {
            validationErrors.push("End date must be on or after the start date.");
          } else {
            endDateSource = parsedEndDate;
          }
        }
        end = endOfDay(endDateSource);
      } else if (allowTime && (allowEndDate || (allowEndTime && values.endTime))) {
        const endDateString = allowEndDate && values.endDate ? values.endDate : values.startDate;
        const endDate = parseISO(endDateString);
        if (!endDate || Number.isNaN(endDate.getTime())) {
          validationErrors.push("End date is invalid.");
        } else {
          if (allowEndDate && endDate.getTime() < startDate.getTime()) {
            validationErrors.push("End date must be on or after the start date.");
          }
          if (allowEndTime && values.endTime) {
            const endTimeParts = parseTime(values.endTime, startTimeParts);
            end = setTime(endDate, {
              hours: endTimeParts.hours,
              minutes: endTimeParts.minutes,
              seconds: 0,
              milliseconds: 0,
            });
          }
        }
      }

      if (validationErrors.length > 0) {
        setDraftErrors(validationErrors);
        return;
      }

      if (end && end.getTime() < start.getTime()) {
        validationErrors.push("End time must be after the start time.");
      }

      if (validationErrors.length > 0) {
        setDraftErrors(validationErrors);
        return;
      }

      const description = values.description.trim();
      const location = allowLocation ? values.location.trim() : "";
      const recurrence = allowRecurrence ? values.recurrenceRule.trim() : "";
      const attendees = allowAttendees
        ? values.attendeesInput
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line.length > 0)
            .map((line) => {
              const match = line.match(/<([^>]+)>/);
              const email = match?.[1]?.trim();
              const name = match ? line.replace(match[0], "").trim() : line;
              const resolvedName = name || email || "Attendee";
              return {
                id: crypto.randomUUID(),
                name: resolvedName,
                ...(email ? { email } : {}),
              };
            })
        : [];

      const nowIso = new Date().toISOString();
      const timeZone = (values.timeZone || localTimeZone).trim() || localTimeZone;

      const ownerParticipant: CalendarParticipant =
        requiresPerson && selectedPerson
          ? {
              id: selectedPerson.id,
              name: selectedPerson.name,
              email: selectedPerson.email,
              role: "organizer",
            }
          : {
              id: DEFAULT_LOCAL_OWNER.id,
              name: DEFAULT_LOCAL_OWNER.name,
              email: undefined,
              role: DEFAULT_LOCAL_OWNER.role,
            };

      const resolvedTitle =
        requiresPerson && selectedPerson
          ? values.type === "birthday"
            ? `${selectedPerson.name}'s Birthday`
            : values.type === "time-off"
              ? `${selectedPerson.name} Time Off`
              : `${selectedPerson.name}'s Work Anniversary`
          : trimmedTitle || "Untitled Event";

      const normalizedAttendees = allowAttendees
        ? attendees.filter((attendee) => {
            if (attendee.email && ownerParticipant.email) {
              return attendee.email.toLowerCase() !== ownerParticipant.email.toLowerCase();
            }
            if (attendee.id && attendee.id === ownerParticipant.id) {
              return false;
            }
            return attendee.name !== ownerParticipant.name;
          })
        : [];

      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        title: resolvedTitle,
        startsAt: start.toISOString(),
        endsAt: end ? end.toISOString() : null,
        isAllDay,
        type: values.type,
        description: description || undefined,
        owner: ownerParticipant,
        attendees: normalizedAttendees,
        location: location || undefined,
        timeZone,
        recurrenceRule: recurrence || undefined,
        source: { provider: "local" },
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setIsDraftSaving(true);
      try {
        setPersistedEvents([...persistedEvents, newEvent]);
      const hydratedNewEvent = hydrateEvent(newEvent);
      setSelectedEvent(hydratedNewEvent);
        setDraftEvent(null);
        setDraftEventKey(null);
        setDraftErrors([]);
      setSelectedDays(new Set([format(start, "yyyy-MM-dd")]));
      setIsSidebarOpen(true);
      ensureWeekVisible(getWeekIndexForDate(start));
      } finally {
        setIsDraftSaving(false);
      }
    },
    [
      ensureWeekVisible,
      getWeekIndexForDate,
      localTimeZone,
      persistedEvents,
      peopleById,
      setPersistedEvents,
    ],
  );

  useEffect(() => {
    if (hasScrolledToTodayRef.current) {
      return;
    }

    const container = calendarScrollRef.current;
    const node = todayWeekStartNodeRef.current;
    if (!container || !node) {
      return;
    }

    const targetTop = Math.max(0, node.offsetTop - TOP_SCROLL_OFFSET);
    container.scrollTo({
      top: targetTop,
      behavior: "auto",
    });
    hasScrolledToTodayRef.current = true;
  }, [calendarDays]);

  const expandWeekRange = useCallback(
    (direction: "up" | "down") => {
      setVisibleWeekRange((previous) => {
        if (direction === "up") {
          if (previous.start === 0) {
            return previous;
          }

          const nextStart = Math.max(0, previous.start - WEEK_VISIBILITY_BUFFER);
          if (nextStart === previous.start) {
            return previous;
          }

          const nextEnd = Math.min(
            TOTAL_WEEKS,
            Math.max(previous.end, nextStart + INITIAL_VISIBLE_WEEKS),
          );

          return {
            start: nextStart,
            end: nextEnd,
          };
        }

        if (previous.end >= TOTAL_WEEKS) {
          return previous;
        }

        const nextEnd = Math.min(TOTAL_WEEKS, previous.end + WEEK_VISIBILITY_BUFFER);
        if (nextEnd === previous.end) {
          return previous;
        }

        return {
          start: previous.start,
          end: nextEnd,
        };
      });
    },
    [],
  );

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

    ensureWeekVisible(getWeekIndexForDate(updatedEvent.startsAt));
  }, [ensureWeekVisible, getWeekIndexForDate, hydratedEvents, selectedEvent]);

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
    const weekIndex = getWeekIndexForDate(date);
    setSelectedDays((prev) => {
      const alreadySelected = prev.has(key);

      if (!additive) {
        if (alreadySelected && prev.size === 1) {
          return new Set();
        }
        const next = new Set<string>();
        if (!alreadySelected) {
          next.add(key);
          ensureWeekVisible(weekIndex);
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
        ensureWeekVisible(weekIndex);
      }
      if (next.size > 0) {
        setIsSidebarOpen(true);
      }
      return next;
    });
  };

  const handleEventSelect = (calendarEvent: HydratedCalendarEvent) => {
    handleDraftCancel();
    
    // Toggle selection: if clicking the already selected event, deselect it
    if (selectedEvent?.id === calendarEvent.id) {
      setSelectedEvent(null);
      return;
    }
    
    ensureWeekVisible(getWeekIndexForDate(calendarEvent.startsAt));
    setSelectedEvent(calendarEvent);
    setIsSidebarOpen(true);
  };

  const handleEventClose = () => {
    setSelectedEvent(null);
  };

  const handleEventEdit = useCallback(
    (event: HydratedCalendarEvent) => {
      const startDate = event.startsAt;
      const endDate = event.endsAt ?? event.startsAt;

      const initialValues: CalendarEventFormValues = {
        title: event.title,
        type: event.type,
        isAllDay: event.isAllDay,
        startDate: format(startDate, "yyyy-MM-dd"),
        startTime: event.isAllDay ? "" : format(startDate, "HH:mm"),
        endDate: format(endDate, "yyyy-MM-dd"),
        endTime: event.isAllDay ? "" : endDate ? format(endDate, "HH:mm") : "",
        timeZone: event.timeZone ?? localTimeZone,
        location: event.location ?? "",
        description: event.description ?? "",
        attendeesInput: event.attendees.map((a) => (a.email ? `${a.name} <${a.email}>` : a.name)).join("\n"),
        recurrenceRule: event.recurrenceRule ?? "",
        personId: event.owner.personId ?? "",
        ownerName: event.owner.name,
        ownerEmail: event.owner.email ?? "",
      };

      setDraftEvent(initialValues);
      setDraftEventKey(crypto.randomUUID());
      setDraftErrors([]);
      setIsDraftSaving(false);
      setSelectedEvent(null);

      const startDayKey = format(startDate, "yyyy-MM-dd");
      setSelectedDays(new Set([startDayKey]));
      setIsSidebarOpen(true);
      ensureWeekVisible(getWeekIndexForDate(startDate));
    },
    [ensureWeekVisible, getWeekIndexForDate, localTimeZone],
  );

  const toggleSidebar = () => {
    if (selectedDays.size > 0 || selectedEvent || draftEvent) {
      if (isSidebarOpen) {
        setSelectedDays(new Set());
        setSelectedEvent(null);
        handleDraftCancel();
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
    draftEventRef.current = draftEvent;
  }, [draftEvent]);

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
        if (
          selectedDaysRef.current.size > 0 ||
          selectedEventRef.current ||
          draftEventRef.current
        ) {
          setSelectedDays(new Set());
          setSelectedEvent(null);
          if (draftEventRef.current) {
            handleDraftCancel();
          }
          return false;
        }
        return !previous;
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleDraftCancel]);

  return (
    <div className="force-light flex h-screen bg-bg text-g8">
      <div
        onClick={() => setIsLeadingSidebarCollapsed((prev) => !prev)}
        className={cn(
          "max-tablet:hidden sticky inset-0 right-auto flex h-screen flex-col bg-g98 transition-all duration-200 ease-out cursor-pointer",
          isLeadingSidebarCollapsed ? "w-[64px]" : "w-[250px] p-[20px]",
        )}
      />

      <main className="relative flex flex-1 min-h-0 flex-col overflow-hidden border border-border bg-bg">
        <header className="pointer-events-none absolute inset-x-0 top-0 z-30 flex h-[51px] items-center px-[32px]">
          <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-[rgba(255,255,255,1)] to-[rgba(255,255,255,0)]" />
          <div className="relative z-20 flex items-center">
            <span className="pointer-events-none text-body-2 font-medium text-fg text-left">
              {visibleMonthLabel}
            </span>
          </div>
          <div className="pointer-events-auto absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
            <div className="flex h-[35px] w-[420px] items-center gap-[10px] rounded-md border border-border bg-bg px-[14px] transition-[border,box-shadow] focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/40">
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
                <span className="flex size-[18px] items-center justify-center rounded-[6px] border border-border bg-bg text-caption font-semibold leading-none">
                  ⌘
                        </span>
                <span className="flex size-[18px] items-center justify-center rounded-[6px] border border-border bg-bg text-caption font-semibold leading-none">
                  K
                        </span>
                      </div>
                    </div>
                  </div>
          <div className="pointer-events-auto absolute right-[7px] top-[7px] z-20 flex items-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={toggleSidebar}
              className="flex h-[35px] items-center rounded-md px-[14px] pr-[7px] text-button-2 font-medium"
            >
              <span>Inspector</span>
              <span className="ml-[7px] flex size-[18px] items-center justify-center rounded-[6px] border border-border bg-bg text-caption font-semibold leading-none">
                I
              </span>
            </Button>
                </div>
        </header>
        <div className="relative flex flex-1 min-h-0">
          <div
            ref={calendarScrollRef}
            className={cn(
              "scrollbar-hide flex-1 overflow-y-auto bg-bg px-[12px] pb-[24px] pt-[12px] transition-[margin-right] duration-200 ease-out min-h-0",
              isSidebarOpen ? "mr-[295px]" : "mr-0",
            )}
          >
            <CalendarView
              days={calendarDays}
              weekRange={visibleWeekRange}
              totalWeeks={TOTAL_WEEKS}
              selectedEventId={selectedEventId}
              selectedEvent={selectedEvent}
              onDaySelect={toggleDaySelection}
              onEventSelect={handleEventSelect}
              onEventCreate={handleCreateIntent}
              onRequestRangeChange={expandWeekRange}
              scrollContainerRef={calendarScrollRef}
              todayWeekIndex={todayWeekIndex}
              onTodayWeekStartNode={handleTodayWeekStartNode}
              onWeekInView={handleWeekInView}
            />
                </div>

          <aside
            style={{ top: INSPECTOR_TOP_OFFSET }}
            className={cn(
              "pointer-events-none absolute bottom-[7px] right-[7px] flex w-[288px] pt-[7px]",
            isSidebarOpen ? "z-10" : "z-0",
            )}
          >
            <div
              className={cn(
                "relative flex h-full w-full flex-col overflow-hidden rounded-[13px] border border-border bg-white transition-transform duration-200 ease-out",
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
                onEditEvent={handleEventEdit}
                localTimeZone={localTimeZone}
                onRequestCreate={handleRequestNewEvent}
                draftEvent={draftEvent}
                onSubmitDraft={handleDraftSubmit}
                onCancelDraft={handleDraftCancel}
                draftErrors={draftErrors}
                isDraftSaving={isDraftSaving}
                draftFormKey={draftEventKey}
                people={people}
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
