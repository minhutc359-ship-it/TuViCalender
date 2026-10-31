import { createContext, useContext, type ReactNode } from 'react';
import { useStoredState } from '../../../lib/storage';
import {
  APPEARANCE_KEY,
  REFERENCE_ART_ENABLED,
  isTarotAppearance,
  type TarotAppearanceId,
} from '../data/appearance';

interface AppearanceContext {
  appearance: TarotAppearanceId;
  setAppearance: (value: TarotAppearanceId) => void;
  storageError: boolean;
}
const Context = createContext<AppearanceContext>({
  appearance: 'celestial-v1',
  setAppearance: () => {},
  storageError: false,
});
export function TarotAppearanceProvider({ children }: { children: ReactNode }) {
  const [appearance, setAppearance, storageError] = useStoredState<TarotAppearanceId>(
    APPEARANCE_KEY,
    'celestial-v1',
    isTarotAppearance,
  );
  return (
    <Context.Provider
      value={{
        appearance: REFERENCE_ART_ENABLED ? appearance : 'celestial-v1',
        setAppearance: (value) => {
          if (value !== 'jojo-ref' || REFERENCE_ART_ENABLED) setAppearance(value);
        },
        storageError,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useTarotAppearance() {
  return useContext(Context);
}
