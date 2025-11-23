"use client";

import { createPersistentStore } from "./storage";

export type CalendarPerson = {
  id: string;
  name: string;
  role: string;
  email?: string;
  team?: string;
};

export function createDefaultPeople(): CalendarPerson[] {
  return [
    {
      id: "person-alexey-primechaev",
      name: "Alexey Primechaev",
      role: "Chief Executive Officer",
      email: "alexey@warp.dev",
    },
    {
      id: "person-rahul-sonwalkar",
      name: "Rahul Sonwalkar",
      role: "Head of Operations",
      email: "rahul@warp.dev",
    },
    {
      id: "person-jordan-smith",
      name: "Jordan Smith",
      role: "Staff Software Engineer",
      email: "jordan@warp.dev",
    },
    {
      id: "person-priya-patel",
      name: "Priya Patel",
      role: "Product Manager",
      email: "priya@warp.dev",
    },
    {
      id: "person-emily-chen",
      name: "Emily Chen",
      role: "Finance Lead",
      email: "emily@warp.dev",
    },
    {
      id: "person-lucas-martinez",
      name: "Lucas Martinez",
      role: "Design Director",
      email: "lucas@warp.dev",
    },
    {
      id: "person-sarah-kim",
      name: "Sarah Kim",
      role: "Customer Success Manager",
      email: "sarah@warp.dev",
    },
    {
      id: "person-david-wong",
      name: "David Wong",
      role: "DevOps Engineer",
      email: "david@warp.dev",
    },
    {
      id: "person-maria-garcia",
      name: "Maria Garcia",
      role: "Marketing Strategist",
      email: "maria@warp.dev",
    },
    {
      id: "person-tom-anderson",
      name: "Tom Anderson",
      role: "Security Engineer",
      email: "tom@warp.dev",
    },
    {
      id: "person-zoe-williams",
      name: "Zoe Williams",
      role: "Recruiting Partner",
      email: "zoe@warp.dev",
    },
    {
      id: "person-miguel-alvarez",
      name: "Miguel Alvarez",
      role: "Infrastructure Engineer",
      email: "miguel@warp.dev",
    },
    {
      id: "person-hannah-kim",
      name: "Hannah Kim",
      role: "Brand Strategist",
      email: "hannah@warp.dev",
    },
    {
      id: "person-marcus-johnson",
      name: "Marcus Johnson",
      role: "Data Scientist",
      email: "marcus@warp.dev",
    },
    {
      id: "person-sofia-rossi",
      name: "Sofia Rossi",
      role: "QA Lead",
      email: "sofia@warp.dev",
    },
  ];
}

const peopleStore = createPersistentStore<CalendarPerson[]>(
  "calendar-people",
  createDefaultPeople(),
);

export const usePeople = peopleStore.useStoreValue;
export const getPeople = peopleStore.get;
export const setPeople = peopleStore.set;
export const subscribeToPeople = peopleStore.subscribe;


