import { createContext, useContext, useEffect, useState, useRef, ReactNode, useCallback } from 'react';
import { getLifeStats, LifeStats } from '@/utils/lifeCalc';

interface ChronosContextValue {
  dob: Date | null;
  stats: LifeStats | null;
  // Only updates every 1s but value is a number that changes — components that need
  // this will re-render. Components that only need dob won't.
  isLoaded: boolean;
  setUserDob: (dateString: string) => void;
  clearDob: () => void;
}

const ChronosContext = createContext<ChronosContextValue | undefined>(undefined);

const STORAGE_KEY = 'chronos_dob';

export function ChronosProvider({ children }: { children: ReactNode }) {
  const [dob, setDob] = useState<Date | null>(null);
  const [stats, setStats] = useState<LifeStats | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const dobRef = useRef<Date | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = new Date(saved);
      if (!isNaN(parsed.getTime())) {
        dobRef.current = parsed;
        setDob(parsed);
        setIsLoaded(true);
      }
    }
  }, []);

  useEffect(() => {
    dobRef.current = dob;
    if (!dob) {
      setStats(null);
      return;
    }

    setStats(getLifeStats(dob));

    const interval = setInterval(() => {
      if (dobRef.current) {
        setStats(getLifeStats(dobRef.current));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dob]);

  const setUserDob = useCallback((dateString: string) => {
    const parsed = new Date(dateString);
    if (isNaN(parsed.getTime())) return;
    localStorage.setItem(STORAGE_KEY, parsed.toISOString());
    dobRef.current = parsed;
    setDob(parsed);
    setIsLoaded(true);
  }, []);

  const clearDob = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    dobRef.current = null;
    setDob(null);
    setStats(null);
    setIsLoaded(false);
  }, []);

  return (
    <ChronosContext.Provider value={{ dob, stats, isLoaded, setUserDob, clearDob }}>
      {children}
    </ChronosContext.Provider>
  );
}

export function useChronos(): ChronosContextValue {
  const ctx = useContext(ChronosContext);
  if (!ctx) throw new Error('useChronos must be used within ChronosProvider');
  return ctx;
}
