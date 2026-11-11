import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { strings, type Lang, type Strings } from './content';

/** Everything Tumbuh remembers. It stays on this phone only; there is no account. */
type Saved = {
  onboarded: boolean;
  lang: Lang;
  babyName: string;
  age: number; // months, 0–36
  erupted: Record<string, boolean>; // tooth id → in
  checks: Record<string, Record<string, boolean>>; // 'YYYY-MM-DD' → item key → done
};

const KEY = 'tumbuh:v1';
const initial: Saved = { onboarded: false, lang: 'bm', babyName: '', age: 6, erupted: {}, checks: {} };

export const today = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

type Ctx = Saved & {
  ready: boolean;
  t: Strings;
  setLang: (l: Lang) => void;
  setAge: (a: number) => void;
  /** Step the age by +1/-1 from the latest value (safe for rapid taps). */
  addAge: (d: number) => void;
  setName: (n: string) => void;
  /** Baby's name, or 'si kecil' / 'your little one'. */
  name: string;
  finishWelcome: () => void;
  toggleTooth: (id: string) => void;
  toggleCheck: (key: string) => void;
  todayChecks: Record<string, boolean>;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Saved>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setData({ ...initial, ...JSON.parse(raw) });
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    // Keep only the last 14 days of checklist ticks.
    const keep = Object.keys(data.checks).sort().slice(-14);
    const checks = Object.fromEntries(keep.map((k) => [k, data.checks[k]]));
    AsyncStorage.setItem(KEY, JSON.stringify({ ...data, checks })).catch(() => {});
  }, [data, ready]);

  const update = useCallback((fn: (d: Saved) => Saved) => setData((d) => fn(d)), []);

  const value = useMemo<Ctx>(() => {
    const day = today();
    return {
      ...data,
      ready,
      t: strings[data.lang],
      todayChecks: data.checks[day] ?? {},
      setLang: (lang) => update((d) => ({ ...d, lang })),
      name: data.babyName.trim() || strings[data.lang].littleOne,
      setName: (n) => update((d) => ({ ...d, babyName: n.slice(0, 24) })),
      setAge: (a) => update((d) => ({ ...d, age: Math.max(0, Math.min(36, a)) })),
      addAge: (n) => update((d) => ({ ...d, age: Math.max(0, Math.min(36, d.age + n)) })),
      finishWelcome: () => update((d) => ({ ...d, onboarded: true })),
      toggleTooth: (id) =>
        update((d) => {
          const erupted = { ...d.erupted };
          if (erupted[id]) delete erupted[id];
          else erupted[id] = true;
          return { ...d, erupted };
        }),
      toggleCheck: (key) =>
        update((d) => {
          const cur = d.checks[day] ?? {};
          return { ...d, checks: { ...d.checks, [day]: { ...cur, [key]: !cur[key] } } };
        }),
    };
  }, [data, ready, update]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
