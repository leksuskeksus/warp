"use client";

import { useEffect, useState } from "react";

export function createPersistentStore<T>(key: string, initialValue: T) {
  const subscribers = new Set<(value: T) => void>();

  let storeValue: T = initializeValue();

  function initializeValue(): T {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const stored = window.localStorage.getItem(key);
      if (stored != null) {
        return JSON.parse(stored) as T;
      }
    } catch (error) {
      console.error(`Failed to read storage key "${key}"`, error);
    }

    return initialValue;
  }

  function setValue(nextValue: T) {
    storeValue = nextValue;
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(key, JSON.stringify(storeValue));
      } catch (error) {
        console.error(`Failed to persist storage key "${key}"`, error);
      }
    }
    subscribers.forEach((subscriber) => subscriber(storeValue));
  }

  function subscribe(subscriber: (value: T) => void) {
    subscribers.add(subscriber);
    subscriber(storeValue);

    return () => {
      subscribers.delete(subscriber);
    };
  }

  function useStore() {
    const [value, setValueState] = useState<T>(() =>
      typeof window === "undefined" ? storeValue : initializeValue(),
    );

    useEffect(() => subscribe(setValueState), []);

    return value;
  }

  function useStoreValue(): [T, (value: T) => void] {
    const value = useStore();
    return [value, setValue];
  }

  return { get: () => storeValue, set: setValue, subscribe, useStoreValue };
}



