import { useState, useSyncExternalStore } from 'react';
import { deviceDatabase } from '../offline/db';

export function readStorage<T>(
  key: string,
  fallback: T,
  validate?: (value: unknown) => value is T,
): T {
  try {
    const raw = deviceDatabase.getItem(key);
    if (!raw) return fallback;
    const value: unknown = JSON.parse(raw);
    return !validate || validate(value) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): boolean {
  try {
    return deviceDatabase.write(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

export function useStoredState<T>(
  key: string,
  initial: T,
  validate?: (value: unknown) => value is T,
) {
  useSyncExternalStore(
    deviceDatabase.subscribe,
    () => deviceDatabase.state,
    () => deviceDatabase.state,
  );
  const value = readStorage(key, initial, validate);
  const [storageError, setStorageError] = useState(false);
  const update = (next: T) => {
    setStorageError(!writeStorage(key, next));
  };
  return [value, update, storageError] as const;
}
