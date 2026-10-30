import { readStorage } from './storage';
export interface Profile {
  id: string;
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
}
export const PROFILE_KEY = 'astroai.profiles.v1';
export const ACTIVE_PROFILE_KEY = 'astroai.active-profile.v1';
export function isProfiles(value: unknown): value is Profile[] {
  return (
    Array.isArray(value) &&
    value.every(
      (p) =>
        p &&
        typeof p.id === 'string' &&
        typeof p.name === 'string' &&
        typeof p.birthDate === 'string' &&
        /^\d{4}-\d{2}-\d{2}$/.test(p.birthDate) &&
        Number.isFinite(new Date(p.birthDate).getTime()) &&
        typeof p.birthTime === 'string' &&
        typeof p.birthPlace === 'string',
    )
  );
}
export function getActiveProfile() {
  const profiles = readStorage<Profile[]>(PROFILE_KEY, [], isProfiles);
  const id = readStorage(ACTIVE_PROFILE_KEY, '');
  return profiles.find((p) => p.id === id) ?? profiles[0];
}
