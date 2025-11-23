/**
 * Script to populate the current month with sample events
 * Run this from the browser console or import and call populateCurrentMonthEvents()
 */

import { CalendarEvent, CalendarEventType, CalendarParticipant } from "../lib/events-store";
import { CalendarPerson, createDefaultPeople } from "../lib/people-store";

const EVENT_TYPES: CalendarEventType[] = [
  "time-off",
  "birthday",
  "work-anniversary",
  "company-event",
  "deadline",
];

// Event templates with appropriate types and titles
const EVENT_TEMPLATES: Record<CalendarEventType, string[]> = {
  "time-off": ["Vacation", "Sick Leave", "Personal Day", "Mental Health Day"],
  "birthday": ["Birthday Celebration", "Birthday Party"],
  "work-anniversary": ["Work Anniversary", "Anniversary Celebration"],
  "company-event": [
    "All Hands Meeting",
    "Team Standup",
    "Sprint Planning",
    "Retrospective",
    "Product Demo",
    "Engineering Sync",
    "Design Review",
    "Company Happy Hour",
    "Team Lunch",
    "Workshop",
  ],
  "deadline": [
    "Project Deadline",
    "Release Deadline",
    "Sprint End",
    "Feature Launch",
    "Documentation Due",
  ],
};

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomTimeSlot(): { hour: number; minute: number } {
  // Generate times between 9 AM and 5 PM
  const hour = getRandomInt(9, 17);
  const minute = getRandomInt(0, 1) * 30; // 0 or 30 minutes
  return { hour, minute };
}

function createEventId(): string {
  return `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function createParticipantFromPerson(person: CalendarPerson): CalendarParticipant {
  return {
    id: `participant-${person.id}`,
    personId: person.id,
    name: person.name,
    email: person.email,
    role: "attendee",
    personRole: person.role,
  };
}

function getRandomParticipants(
  people: CalendarPerson[],
  minCount: number = 1,
  maxCount: number = 4,
): CalendarParticipant[] {
  const count = getRandomInt(minCount, Math.min(maxCount, people.length));
  const shuffled = [...people].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count).map(createParticipantFromPerson);
}

function createEventForDay(
  date: Date,
  people: CalendarPerson[],
  eventType: CalendarEventType,
): CalendarEvent {
  const now = new Date();
  const eventId = createEventId();
  const title = getRandomElement(EVENT_TEMPLATES[eventType]);
  
  // Determine if event is all-day based on type
  const isAllDay = eventType === "birthday" || eventType === "work-anniversary" || 
                   eventType === "time-off" || Math.random() < 0.2;

  let startsAt: Date;
  let endsAt: Date | null = null;

  if (isAllDay) {
    // All-day events start at midnight
    startsAt = new Date(date);
    startsAt.setHours(0, 0, 0, 0);
  } else {
    // Timed events
    const { hour, minute } = getRandomTimeSlot();
    startsAt = new Date(date);
    startsAt.setHours(hour, minute, 0, 0);
    
    // End time is 30 minutes to 2 hours later
    const durationMinutes = getRandomInt(30, 120);
    endsAt = new Date(startsAt);
    endsAt.setMinutes(endsAt.getMinutes() + durationMinutes);
  }

  // Select owner and attendees
  const allParticipants = getRandomParticipants(people, 1, 5);
  const owner = allParticipants[0];
  const attendees = allParticipants.slice(1);

  return {
    id: eventId,
    title,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt ? endsAt.toISOString() : null,
    isAllDay,
    type: eventType,
    description: eventType === "company-event" 
      ? `${title} - ${getRandomElement(["In-person", "Virtual", "Hybrid"])}`
      : undefined,
    owner: {
      ...owner,
      role: "organizer",
    },
    attendees,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
    source: { provider: "local" },
  };
}

function getDaysInCurrentMonth(): Date[] {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  
  const days: Date[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(year, month, day));
  }
  
  return days;
}

export function populateCurrentMonthEvents(): boolean {
  if (typeof window === "undefined") {
    console.error("This script must be run in a browser environment");
    return false;
  }

  try {
    // Check if events already exist
    const existingEventsJson = window.localStorage.getItem("calendar-events");
    if (existingEventsJson) {
      try {
        const existingEvents = JSON.parse(existingEventsJson) as CalendarEvent[];
        if (existingEvents.length > 0) {
          console.log(`Events storage already contains ${existingEvents.length} events. Skipping population.`);
          return false;
        }
      } catch (e) {
        // If parsing fails, treat as empty
      }
    }

    // Get people from storage, or initialize with defaults if missing
    let people: CalendarPerson[];
    const peopleJson = window.localStorage.getItem("calendar-people");
    
    if (!peopleJson) {
      // Initialize people with defaults if they don't exist
      console.log("No people found in storage. Initializing with default people...");
      people = createDefaultPeople();
      window.localStorage.setItem("calendar-people", JSON.stringify(people));
      console.log(`Initialized ${people.length} default people.`);
    } else {
      try {
        people = JSON.parse(peopleJson) as CalendarPerson[];
        if (people.length === 0) {
          // If storage exists but is empty, initialize with defaults
          console.log("People storage is empty. Initializing with default people...");
          people = createDefaultPeople();
          window.localStorage.setItem("calendar-people", JSON.stringify(people));
          console.log(`Initialized ${people.length} default people.`);
        }
      } catch (e) {
        // If parsing fails, initialize with defaults
        console.log("Failed to parse people storage. Initializing with default people...");
        people = createDefaultPeople();
        window.localStorage.setItem("calendar-people", JSON.stringify(people));
        console.log(`Initialized ${people.length} default people.`);
      }
    }

    // Generate events for current month
    const days = getDaysInCurrentMonth();
    const events: CalendarEvent[] = [];

    for (const day of days) {
      // Skip weekends for some event types, but allow all types
      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
      
      // Generate 3-5 events per day
      const eventCount = getRandomInt(3, 5);
      
      // Distribute event types appropriately
      const typesForDay: CalendarEventType[] = [];
      
      // Always include at least one company-event on weekdays
      if (!isWeekend) {
        typesForDay.push("company-event");
      }
      
      // Add variety of types
      for (let i = typesForDay.length; i < eventCount; i++) {
        // Weighted random selection - more company events, fewer birthdays/anniversaries
        const rand = Math.random();
        if (rand < 0.5) {
          typesForDay.push("company-event");
        } else if (rand < 0.7) {
          typesForDay.push("deadline");
        } else if (rand < 0.85) {
          typesForDay.push("time-off");
        } else if (rand < 0.95) {
          typesForDay.push("birthday");
        } else {
          typesForDay.push("work-anniversary");
        }
      }

      // Create events for the day
      for (const eventType of typesForDay.slice(0, eventCount)) {
        const event = createEventForDay(day, people, eventType);
        events.push(event);
      }
    }

    // Save to localStorage
    window.localStorage.setItem("calendar-events", JSON.stringify(events));
    
    console.log(`Successfully populated ${events.length} events for the current month!`);
    console.log(`Events span ${days.length} days with ${events.length / days.length} events per day on average.`);
    
    return true;
  } catch (error) {
    console.error("Error populating events:", error);
    return false;
  }
}

// If running directly in browser console
if (typeof window !== "undefined") {
  (window as any).populateCurrentMonthEvents = populateCurrentMonthEvents;
}

