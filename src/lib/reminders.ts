/**
 * Daily brushing reminders. A web app on iPhone can't ring an alarm by itself at a set time, so the
 * reminders go into the phone's own calendar: a repeating event every morning and every night with an
 * alert at that minute. It rings even when Tumbuh is closed.
 */
import { Platform } from 'react-native';

import type { Lang } from './content';
import type { BrushTimes } from './store';

const ics = (s: string) => s.replace(/[\;,]/g, (x) => `\\${x}`).replace(/\n/g, '\\n');
const pad = (n: number) => String(n).padStart(2, '0');

/** '07:30' → minutes after midnight. */
export const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
export const fromMin = (min: number) => {
  const m = ((min % 1440) + 1440) % 1440;
  return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
};
/** 24 h → '7:30 pagi' / '8:30 malam' (BM) or '7:30 am' (EN). */
export function niceTime(hhmm: string, lang: Lang) {
  const [h, m] = hhmm.split(':').map(Number);
  const h12 = h % 12 === 0 ? 12 : h % 12;
  if (lang === 'en') return `${h12}:${pad(m)} ${h < 12 ? 'am' : 'pm'}`;
  const part = h < 12 ? 'pagi' : h < 14 ? 'tengah hari' : h < 19 ? 'petang' : 'malam';
  return `${h12}:${pad(m)} ${part}`;
}

function text(lang: Lang, which: 'morning' | 'night') {
  if (lang === 'bm') {
    return which === 'morning'
      ? { title: '🪥 Masa berus gigi anak (pagi)', body: 'Bantu si kecil berus gigi selepas sarapan. Ubat gigi berfluorida: sebesar butir beras bawah 3 tahun, sebesar kacang pea 3–6 tahun. Tandakan dalam Tumbuh.' }
      : { title: '🪥 Masa berus gigi anak (sebelum tidur)', body: 'Berus gigi si kecil sebelum tidur — inilah berus paling penting. Selepas berus, tiada lagi susu atau makanan. Tandakan dalam Tumbuh.' };
  }
  return which === 'morning'
    ? { title: "🪥 Kids' tooth brushing (morning)", body: 'Help your little one brush after breakfast. Fluoride toothpaste: a rice-grain smear under 3, a pea size from 3 to 6. Tick it in Tumbuh.' }
    : { title: "🪥 Kids' tooth brushing (bedtime)", body: 'Brush before bed — the most important brush of the day. Nothing but water after it. Tick it in Tumbuh.' };
}

function event(lang: Lang, which: 'morning' | 'night', hhmm: string) {
  const { title, body } = text(lang, which);
  const d = new Date();
  const day = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const start = `${day}T${hhmm.replace(':', '')}00`;
  const end = `${day}T${fromMin(toMin(hhmm) + 10).replace(':', '')}00`;
  const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  return [
    'BEGIN:VEVENT',
    `UID:tumbuh-brush-${which}@tumbuh.app`,
    `DTSTAMP:${stamp}`,
    `DTSTART:${start}`, // no time zone: the phone's own local time, every day
    `DTEND:${end}`,
    'RRULE:FREQ=DAILY',
    `SUMMARY:${ics(title)}`,
    `DESCRIPTION:${ics(body)}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${ics(title)}`,
    'TRIGGER:PT0M',
    'END:VALARM',
    'END:VEVENT',
  ];
}

/** Open the phone's Calendar "Add" screen with both daily events (or download the .ics elsewhere). */
export function addBrushingToCalendar(times: BrushTimes, lang: Lang) {
  const doc = (globalThis as any).document;
  if (Platform.OS !== 'web' || !doc) return;
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Tumbuh//Brushing//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', ...event(lang, 'morning', times.morning), ...event(lang, 'night', times.night), 'END:VCALENDAR'];
  const body = lines.join('\r\n');
  const nav = (globalThis as any).navigator;
  const ua = nav?.userAgent ?? '';
  if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && nav?.maxTouchPoints > 1)) {
    (globalThis as any).location.href = `data:text/calendar;charset=utf-8,${encodeURIComponent(body)}`;
    return;
  }
  const blob = new (globalThis as any).Blob([body], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = doc.createElement('a');
  a.href = url;
  a.download = 'tumbuh-berus-gigi.ics';
  doc.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 4000);
}

/** One daily event in Google Calendar (Google only takes one event per link). */
export function brushingGoogleUrl(which: 'morning' | 'night', hhmm: string, lang: Lang) {
  const { title, body } = text(lang, which);
  const d = new Date();
  const day = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
  const q = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: body,
    dates: `${day}T${hhmm.replace(':', '')}00/${day}T${fromMin(toMin(hhmm) + 10).replace(':', '')}00`,
    recur: 'RRULE:FREQ=DAILY',
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

/**
 * Which brushing is due right now and not ticked yet (for the nudge on Utama).
 * Morning counts from its time until noon; night from its time until midnight.
 */
export function dueBrushing(times: BrushTimes, done: Record<string, boolean>, now = new Date()): 'morning' | 'night' | null {
  const m = now.getHours() * 60 + now.getMinutes();
  const mor = toMin(times.morning);
  const nig = toMin(times.night);
  if (!done.a && m >= mor && m < 12 * 60) return 'morning';
  if (!done.b && m >= nig) return 'night';
  return null;
}
