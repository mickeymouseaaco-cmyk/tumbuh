import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { strings, type Lang, type Strings } from './content';

/** One child's own record. */
export type Kid = {
  id: string;
  babyName: string;
  gender: '' | 'boy' | 'girl';
  age: number; // months, 0–36
  erupted: Record<string, boolean>; // tooth id → in
  checks: Record<string, Record<string, boolean>>; // 'YYYY-MM-DD' → item key → done
  fluoride: string[]; // 'YYYY-MM-DD' of each fluoride varnish at the clinic, oldest first
};

/** Brushing reminder times, 'HH:MM' (24 h), shared by all the children. */
export type BrushTimes = { morning: string; night: string };

/**
 * Everything Tumbuh remembers. It stays on this phone only; there is no account.
 * Several children can be followed (own child, niece, nephew…); screens see the one chosen as `active`.
 */
type Saved = {
  onboarded: boolean;
  lang: Lang;
  learned: Record<string, boolean>; // Learn cards the parent ticked as understood: 'topic:card' → true
  kids: Kid[];
  active: string;
  brush: BrushTimes;
};

const KEY = 'tumbuh:v1';
const newKid = (p: Partial<Kid> = {}): Kid => ({ id: `k${Date.now().toString(36)}${Math.floor(Math.random() * 1e3)}`, babyName: '', gender: '', age: 6, erupted: {}, checks: {}, fluoride: [], ...p });
const firstKid = newKid({ id: 'k1' });
const initial: Saved = { onboarded: false, lang: 'bm', learned: {}, kids: [firstKid], active: 'k1', brush: { morning: '07:30', night: '20:30' } };

/** Older saves had one child stored flat; move it into the list. */
function migrate(raw: any): Saved {
  if (raw && Array.isArray(raw.kids) && raw.kids.length) return { ...initial, ...raw };
  const kid = newKid({
    id: 'k1',
    babyName: raw?.babyName ?? '', gender: raw?.gender ?? '', age: raw?.age ?? 6,
    erupted: raw?.erupted ?? {}, checks: raw?.checks ?? {}, fluoride: raw?.fluoride ?? [],
  });
  return { ...initial, onboarded: !!raw?.onboarded, lang: raw?.lang ?? 'bm', learned: raw?.learned ?? {}, kids: [kid], active: 'k1' };
}

export const today = () => {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

type Ctx = Omit<Saved, 'kids'> & Omit<Kid, 'id'> & {
  ready: boolean;
  kids: Kid[];
  /** Switch to another child. */
  switchKid: (id: string) => void;
  /** Add a child and switch to them. */
  addKid: (p: { babyName: string; gender: 'boy' | 'girl'; age: number }) => void;
  /** Change the active child's name, gender or age. */
  editKid: (id: string, p: Partial<Pick<Kid, 'babyName' | 'gender' | 'age'>>) => void;
  /** Remove a child (the last one can't be removed). */
  removeKid: (id: string) => void;
  /** A child's display name. */
  kidName: (k: Kid) => string;
  setBrush: (b: Partial<BrushTimes>) => void;
  t: Strings;
  setLang: (l: Lang) => void;
  setAge: (a: number) => void;
  /** Step the age by +1/-1 from the latest value (safe for rapid taps). */
  addAge: (d: number) => void;
  setName: (n: string) => void;
  setGender: (g: 'boy' | 'girl') => void;
  /** Baby's name, or 'si kecil' / 'your little one'. */
  name: string;
  finishWelcome: () => void;
  toggleTooth: (id: string) => void;
  toggleCheck: (key: string) => void;
  todayChecks: Record<string, boolean>;
  logFluoride: (date: string) => void;
  removeFluoride: (date: string) => void;
  toggleLearned: (key: string) => void;
};

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Saved>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setData(migrate(JSON.parse(raw)));
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    if (!ready) return;
    // Keep only the last 14 days of checklist ticks for each child.
    const kids = data.kids.map((k) => {
      const keep = Object.keys(k.checks).sort().slice(-14);
      return { ...k, checks: Object.fromEntries(keep.map((d) => [d, k.checks[d]])) };
    });
    AsyncStorage.setItem(KEY, JSON.stringify({ ...data, kids })).catch(() => {});
  }, [data, ready]);

  const update = useCallback((fn: (d: Saved) => Saved) => setData((d) => fn(d)), []);

  /** Change the active child only. */
  const updateKid = useCallback(
    (fn: (k: Kid) => Kid) => setData((d) => ({ ...d, kids: d.kids.map((k) => (k.id === d.active ? fn(k) : k)) })),
    [],
  );

  const value = useMemo<Ctx>(() => {
    const day = today();
    const kid = data.kids.find((k) => k.id === data.active) ?? data.kids[0];
    const s = strings[data.lang];
    return {
      onboarded: data.onboarded,
      lang: data.lang,
      learned: data.learned,
      active: kid.id,
      brush: data.brush,
      kids: data.kids,
      babyName: kid.babyName,
      gender: kid.gender,
      age: kid.age,
      erupted: kid.erupted,
      checks: kid.checks,
      fluoride: kid.fluoride,
      ready,
      t: s,
      todayChecks: kid.checks[day] ?? {},
      setLang: (lang) => update((d) => ({ ...d, lang })),
      name: kid.babyName.trim() || s.littleOne,
      kidName: (k) => k.babyName.trim() || s.littleOne,
      setName: (n) => updateKid((k) => ({ ...k, babyName: n.slice(0, 24) })),
      setGender: (g) => updateKid((k) => ({ ...k, gender: g })),
      setAge: (a) => updateKid((k) => ({ ...k, age: Math.max(0, Math.min(36, a)) })),
      addAge: (n) => updateKid((k) => ({ ...k, age: Math.max(0, Math.min(36, k.age + n)) })),
      finishWelcome: () => update((d) => ({ ...d, onboarded: true })),
      switchKid: (id) => update((d) => (d.kids.some((k) => k.id === id) ? { ...d, active: id } : d)),
      addKid: (p) =>
        update((d) => {
          const k = newKid({ babyName: p.babyName.slice(0, 24), gender: p.gender, age: Math.max(0, Math.min(36, p.age)) });
          return { ...d, kids: [...d.kids, k], active: k.id };
        }),
      editKid: (id, p) =>
        update((d) => ({
          ...d,
          kids: d.kids.map((k) =>
            k.id === id ? { ...k, ...p, ...(p.babyName !== undefined ? { babyName: p.babyName.slice(0, 24) } : {}), ...(p.age !== undefined ? { age: Math.max(0, Math.min(36, p.age)) } : {}) } : k,
          ),
        })),
      removeKid: (id) =>
        update((d) => {
          if (d.kids.length < 2) return d;
          const kids = d.kids.filter((k) => k.id !== id);
          return { ...d, kids, active: d.active === id ? kids[0].id : d.active };
        }),
      setBrush: (b) => update((d) => ({ ...d, brush: { ...d.brush, ...b } })),
      toggleTooth: (id) =>
        updateKid((k) => {
          const erupted = { ...k.erupted };
          if (erupted[id]) delete erupted[id];
          else erupted[id] = true;
          return { ...k, erupted };
        }),
      logFluoride: (date) => updateKid((k) => ({ ...k, fluoride: [...new Set([...k.fluoride, date])].sort() })),
      removeFluoride: (date) => updateKid((k) => ({ ...k, fluoride: k.fluoride.filter((x) => x !== date) })),
      toggleLearned: (key) =>
        update((d) => {
          const learned = { ...d.learned };
          if (learned[key]) delete learned[key];
          else learned[key] = true;
          return { ...d, learned };
        }),
      toggleCheck: (key) =>
        updateKid((k) => {
          const cur = k.checks[day] ?? {};
          return { ...k, checks: { ...k.checks, [day]: { ...cur, [key]: !cur[key] } } };
        }),
    };
  }, [data, ready, update, updateKid]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
