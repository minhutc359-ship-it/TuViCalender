import { useState } from 'react';

export function readStorage<T>(
  key: string,
  fallback: T,
  validate?: (value: unknown) => value is T,
): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const value: unknown = JSON.parse(raw);
    return !validate || validate(value) ? (value as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function useStoredState<T>(
  key: string,
  initial: T,
  validate?: (value: unknown) => value is T,
) {
  const [value, setValue] = useState<T>(() => readStorage(key, initial, validate));
  const [storageError, setStorageError] = useState(false);
  const update = (next: T) => {
    setStorageError(!writeStorage(key, next));
    setValue(next);
  };
  return [value, update, storageError] as const;
}
