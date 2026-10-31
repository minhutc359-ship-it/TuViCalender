import { readStorage } from './storage';
export interface Profile {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  timezone?: string;
  consentAt?: string;
  tradition?: 'eastern' | 'western' | 'fusion';
}
export const PROFILE_KEY = 'astroai.profiles.v1';
export const ACTIVE_PROFILE_KEY = 'astroai.active-profile.v1';
export function isProfileDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    year >= 1900 &&
    year <= 2100 &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}
export function isProfiles(value: unknown): value is Profile[] {
  return (
    Array.isArray(value) &&
    value.every(
      (p) =>
        p &&
        typeof p.id === 'string' &&
        p.id.length > 0 &&
        p.id.length <= 200 &&
        typeof p.name === 'string' &&
        p.name.length <= 200 &&
        typeof p.birthDate === 'string' &&
        isProfileDate(p.birthDate) &&
        typeof p.birthTime === 'string' &&
        (p.birthTime === '' || /^([01]\d|2[0-3]):[0-5]\d$/.test(p.birthTime)) &&
        typeof p.birthPlace === 'string' &&
        p.birthPlace.length <= 500 &&
        (p.timezone === undefined || isTimeZone(p.timezone)) &&
        (p.consentAt === undefined ||
          (typeof p.consentAt === 'string' && Number.isFinite(Date.parse(p.consentAt)))) &&
        (p.tradition === undefined || ['eastern', 'western', 'fusion'].includes(p.tradition)),
    )
  );
}
export function getActiveProfile() {
  const profiles = readStorage<Profile[]>(PROFILE_KEY, [], isProfiles);
  const id = readStorage(ACTIVE_PROFILE_KEY, '');
  return profiles.find((p) => p.id === id) ?? profiles[0];
}
export function isTimeZone(value: unknown): value is string {
  if (typeof value !== 'string' || value.length > 100) return false;
  try {
    new Intl.DateTimeFormat('en', { timeZone: value }).format();
    return true;
  } catch {
    return false;
  }
}
