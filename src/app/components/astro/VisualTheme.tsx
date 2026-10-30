import { createContext, useContext, useLayoutEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { MotionConfig } from 'motion/react';
import { useStoredState } from '../../../lib/storage';

export type VisualTheme = 'fusion' | 'eastern' | 'western';
export type ThemePreference = VisualTheme | 'auto';
export const THEME_KEY = 'astroai.visual-theme.v1';
export const MOTION_KEY = 'astroai.visual-motion.v1';
export const THEME_NAMES: Record<VisualTheme, string> = {
  fusion: 'Fusion · Đông & Tây',
  eastern: 'Eastern · Đông phương',
  western: 'Western · Tây phương',
};
export function isThemePreference(value: unknown): value is ThemePreference {
  return ['fusion', 'eastern', 'western', 'auto'].includes(value as string);
}
export function resolveVisualTheme(preference: ThemePreference, pathname: string): VisualTheme {
  if (preference !== 'auto') return preference;
  return pathname === '/calendar' ? 'eastern' : pathname === '/tarot' ? 'western' : 'fusion';
}
const Context = createContext<{
  preference: ThemePreference;
  resolved: VisualTheme;
  motion: 'gentle' | 'calm';
  setPreference: (v: ThemePreference) => void;
  setMotion: (v: 'gentle' | 'calm') => void;
  storageError: boolean;
}>({
  preference: 'fusion',
  resolved: 'fusion',
  motion: 'gentle',
  setPreference: () => {},
  setMotion: () => {},
  storageError: false,
});
export function VisualThemeProvider({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const [preference, setPreference, themeError] = useStoredState<ThemePreference>(
    THEME_KEY,
    'fusion',
    isThemePreference,
  );
  const [motion, setMotion, motionError] = useStoredState<'gentle' | 'calm'>(
    MOTION_KEY,
    'gentle',
    (v): v is 'gentle' | 'calm' => v === 'gentle' || v === 'calm',
  );
  const resolved = resolveVisualTheme(preference, pathname);
  useLayoutEffect(() => {
    document.documentElement.dataset.visualTheme = resolved;
    document.documentElement.dataset.motion = motion;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute(
        'content',
        resolved === 'eastern' ? '#091c1b' : resolved === 'western' ? '#11132b' : '#0d1625',
      );
  }, [resolved, motion]);
  return (
    <Context.Provider
      value={{
        preference,
        resolved,
        motion,
        setPreference,
        setMotion,
        storageError: themeError || motionError,
      }}
    >
      <MotionConfig reducedMotion={motion === 'calm' ? 'always' : 'user'}>{children}</MotionConfig>
    </Context.Provider>
  );
}
export const useVisualTheme = () => useContext(Context);
