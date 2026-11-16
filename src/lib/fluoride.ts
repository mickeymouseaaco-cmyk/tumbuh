/**
 * Fluoride varnish at the clinic: every 6 months once the first tooth is in.
 * Dates are plain 'YYYY-MM-DD' strings in the phone's own time zone.
 */
import { Platform } from 'react-native';

import type { Lang } from './content';

export const EVERY_MONTHS = 6;

const pad = (n: number) => String(n).padStart(2, '0');
export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k: string) => {
  const [y, m, d] = k.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** Same day N months later (31 Aug + 6 → 28/29 Feb, not 3 Mar). */
export function addMonths(k: string, n: number) {
  const d = fromKey(k);
  const day = d.getDate();
  const t = new Date(d.getFullYear(), d.getMonth() + n, 1);
  const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
  t.setDate(Math.min(day, last));
  return toKey(t);
}

/** Whole days from today to k (negative = past). */
export function daysUntil(k: string) {
  const now = new Date();
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  return Math.round((fromKey(k).getTime() - a) / 86400000);
}

const MONTHS = {
  bm: ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
};
export const monthName = (m: number, lang: Lang) => MONTHS[lang][m];
export const fmt = (k: string, lang: Lang) => {
  const d = fromKey(k);
  return `${d.getDate()} ${MONTHS[lang][d.getMonth()]} ${d.getFullYear()}`;
};

/** Where the next varnish stands. */
export function fluorideStatus(history: string[]) {
  const last = history.length ? history[history.length - 1] : null;
  if (!last) return { last: null, next: null, days: null, state: 'none' as const, progress: 0 };
  const next = addMonths(last, EVERY_MONTHS);
  const days = daysUntil(next);
  const total = -daysUntil(last) + days || 1;
  const progress = Math.max(0, Math.min(1, -daysUntil(last) / total));
  // "soon" in the last 3 weeks, "due" from the day itself
  const state = days <= 0 ? ('due' as const) : days <= 21 ? ('soon' as const) : ('ok' as const);
  return { last, next, days, state, progress };
}

/* ---------- calendar reminder ---------- */

const ics = (s: string) => s.replace(/[\\;,]/g, (x) => `\\${x}`).replace(/\n/g, '\\n');

function reminderText(lang: Lang, name: string) {
  return lang === 'bm'
    ? {
        title: `Sapuan fluorida ${name} 🦷`,
        body: `Masa untuk sapuan fluorida (varnis) di klinik pergigian — setiap 6 bulan. Buat temu janji, kemudian tandakan dalam Tumbuh.`,
      }
    : {
        title: `${name}'s fluoride varnish 🦷`,
        body: `Time for fluoride varnish at the dental clinic — every 6 months. Book a visit, then mark it in Tumbuh.`,
      };
}

/**
 * An all-day event on the due date that repeats every 6 months, with alerts a week before and on the
 * morning itself. Opens the phone's Calendar "Add event" screen (iPhone) or downloads the .ics file.
 */
export function addToCalendar(due: string, lang: Lang, name: string) {
  const doc = (globalThis as any).document;
  if (Platform.OS !== 'web' || !doc) return;
  const { title, body } = reminderText(lang, name);
  const start = due.replace(/-/g, '');
  const nextDay = fromKey(due);
  nextDay.setDate(nextDay.getDate() + 1);
  const endNext = toKey(nextDay).replace(/-/g, ''); // all-day events end the next day
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Tumbuh//Fluoride//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:tumbuh-fluoride-${start}@tumbuh.app`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${endNext}`,
    'RRULE:FREQ=MONTHLY;INTERVAL=6;COUNT=10',
    `SUMMARY:${ics(title)}`,
    `DESCRIPTION:${ics(body)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${ics(title)}`,
    'TRIGGER:-P7D',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${ics(title)}`,
    'TRIGGER:PT9H',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  const text = lines.join('\r\n');
  // iPhone/iPad: opening the event itself shows Calendar's "Add to Calendar" screen.
  const ua = (globalThis as any).navigator?.userAgent ?? '';
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && (globalThis as any).navigator?.maxTouchPoints > 1)) {
    (globalThis as any).location.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(text)}`;
    return;
  }
  // elsewhere: download the .ics file, which opens in the calendar app
  const blob = new (globalThis as any).Blob([text], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = doc.createElement('a');
  a.href = url;
  a.download = 'tumbuh-fluorida.ics';
  doc.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 4000);
}

/** The same reminder in Google Calendar (for Android / Google users). */
export function googleCalendarUrl(due: string, lang: Lang, name: string) {
  const { title, body } = reminderText(lang, name);
  const d = fromKey(due);
  d.setDate(d.getDate() + 1);
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: body,
    dates: `${due.replace(/-/g, '')}/${toKey(d).replace(/-/g, '')}`,
    recur: 'RRULE:FREQ=MONTHLY;INTERVAL=6;COUNT=10',
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}
