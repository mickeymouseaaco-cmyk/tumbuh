/**
 * Fluoride varnish tracker: log each clinic visit, count down to the next one (every 6 months),
 * and add a repeating reminder to the phone's calendar.
 */
import { BellRing, CalendarPlus, Check, ChevronDown, Minus, Plus, ShieldCheck, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Linking, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { PressableScale, T, enter } from '@/components/ui';
import type { Lang } from '@/lib/content';
import { addMonths, addToCalendar, daysUntil, fluorideStatus, fmt, fromKey, googleCalendarUrl, monthName, toKey } from '@/lib/fluoride';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { fonts, motion, radius, tint, useTheme } from '@/theme';

const L = {
  bm: {
    title: 'Sapuan fluorida',
    sub: 'Varnis fluorida di klinik pergigian · setiap 6 bulan',
    notYet: 'Mula bila gigi pertama keluar. Kami akan ingatkan.',
    first: 'Gigi dah keluar — masa untuk sapuan fluorida pertama!',
    daysLeft: 'hari lagi',
    next: 'Seterusnya',
    last: 'Terakhir',
    dueToday: 'Hari ini masanya!',
    late: (n: number) => `Lewat ${n} hari`,
    soon: 'Dah dekat — buat temu janji sekarang',
    didToday: 'Dah buat hari ini',
    otherDate: 'Tarikh lain',
    save: 'Simpan tarikh',
    remind: 'Ingatkan saya',
    iphone: 'Kalendar iPhone',
    google: 'Google Calendar',
    remindNote: 'Peringatan berulang setiap 6 bulan — seminggu sebelum dan pada pagi hari itu.',
    history: 'Sejarah',
    tapAgain: 'Tekan lagi untuk padam',
    saved: 'Disimpan! Tambah peringatan untuk sapuan seterusnya:',
    day: 'Hari',
    month: 'Bulan',
    year: 'Tahun',
  },
  en: {
    title: 'Fluoride varnish',
    sub: 'Painted on at the dental clinic · every 6 months',
    notYet: 'Starts when the first tooth comes in. We’ll remind you.',
    first: 'Teeth are in — time for the first fluoride varnish!',
    daysLeft: 'days to go',
    next: 'Next',
    last: 'Last',
    dueToday: 'It’s due today!',
    late: (n: number) => `${n} days overdue`,
    soon: 'Coming up — book a visit now',
    didToday: 'Done today',
    otherDate: 'Another date',
    save: 'Save date',
    remind: 'Remind me',
    iphone: 'iPhone Calendar',
    google: 'Google Calendar',
    remindNote: 'Repeats every 6 months — a week before and on the morning itself.',
    history: 'History',
    tapAgain: 'Tap again to delete',
    saved: 'Saved! Add a reminder for the next one:',
    day: 'Day',
    month: 'Month',
    year: 'Year',
  },
};

/** − value + */
function Stepper({ label, value, onStep }: { label: string; value: string; onStep: (d: number) => void }) {
  const { c } = useTheme();
  const btn = { width: 38, height: 38, borderRadius: 19, alignItems: 'center' as const, justifyContent: 'center' as const, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border };
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 6 }}>
      <T style={{ fontSize: 11, color: c.textMuted, fontFamily: fonts.semi, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</T>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <PressableScale accessibilityRole="button" accessibilityLabel={`${label} −`} onPress={() => onStep(-1)} style={btn}>
          <Minus size={16} color={c.text} />
        </PressableScale>
        <T style={{ minWidth: 40, textAlign: 'center', fontFamily: fonts.bold, fontVariant: ['tabular-nums'] }}>{value}</T>
        <PressableScale accessibilityRole="button" accessibilityLabel={`${label} +`} onPress={() => onStep(1)} style={btn}>
          <Plus size={16} color={c.text} />
        </PressableScale>
      </View>
    </View>
  );
}

/** Day / month / year steppers. Past dates by default; `future` allows today to two years ahead instead. */
export function DatePicker({ lang, onSave, future = false, start, saveLabel }: { lang: Lang; onSave: (k: string) => void; future?: boolean; start?: string; saveLabel?: string }) {
  const { c } = useTheme();
  const s = L[lang];
  const [d, setD] = useState(() => (start ? fromKey(start) : new Date()));
  const clamp = (x: Date) => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const min = future ? now : new Date(now.getFullYear() - 6, 0, 1);
    const max = future ? new Date(now.getFullYear() + 2, 11, 31) : now;
    return x > max ? max : x < min ? min : x;
  };
  const move = (part: 'd' | 'm' | 'y', n: number) => {
    haptic.tap();
    setD((x) => {
      const y = new Date(x);
      if (part === 'd') y.setDate(y.getDate() + n);
      else {
        // keep the day inside the new month (31 → 30/28)
        const day = y.getDate();
        y.setDate(1);
        if (part === 'm') y.setMonth(y.getMonth() + n);
        else y.setFullYear(y.getFullYear() + n);
        y.setDate(Math.min(day, new Date(y.getFullYear(), y.getMonth() + 1, 0).getDate()));
      }
      return clamp(y);
    });
  };
  return (
    <Animated.View entering={FadeIn.duration(motion.base)} exiting={FadeOut.duration(140)} style={{ gap: 14, padding: 14, borderRadius: radius.tile, backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.border }}>
      <View style={{ flexDirection: 'row', gap: 4 }}>
        <Stepper label={s.day} value={String(d.getDate())} onStep={(n) => move('d', n)} />
        <Stepper label={s.month} value={monthName(d.getMonth(), lang)} onStep={(n) => move('m', n)} />
        <Stepper label={s.year} value={String(d.getFullYear())} onStep={(n) => move('y', n)} />
      </View>
      <PressableScale accessibilityRole="button" onPress={() => onSave(toKey(d))}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 46, borderRadius: radius.pill, backgroundColor: c.accent }}>
        <Check size={17} color={c.onAccent} strokeWidth={2.6} />
        <T style={{ fontFamily: fonts.semi, color: c.onAccent }}>{saveLabel ?? s.save} · {fmt(toKey(d), lang)}</T>
      </PressableScale>
    </Animated.View>
  );
}

export function FluorideCard({ index = 0 }: { index?: number }) {
  const { c } = useTheme();
  const { lang, name, erupted, fluoride, logFluoride, removeFluoride } = useStore();
  const s = L[lang];
  const st = fluorideStatus(fluoride);
  const hasTeeth = Object.keys(erupted).length > 0;
  const [picking, setPicking] = useState(false);
  const [reminding, setReminding] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [armed, setArmed] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  // "first one" counts as due once a tooth is in
  const due = st.state === 'due' || (st.state === 'none' && hasTeeth);
  const tone = tint(c, due ? 'rose' : st.state === 'soon' ? 'butter' : 'mint');

  // the bar fills up over the 6 months
  const fillV = useSharedValue(0);
  useEffect(() => {
    fillV.value = withTiming(st.progress, { duration: 900, easing: motion.ease });
  }, [st.progress, fillV]);
  const barStyle = useAnimatedStyle(() => ({ transform: [{ scaleX: fillV.value }] }));

  const save = (k: string) => {
    haptic.success();
    logFluoride(k);
    setPicking(false);
    setJustSaved(true);
    setReminding(true);
  };

  // a reminder is for the next due date; if that's today/past (or there's none yet), a nudge in a week
  const inAWeek = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return toKey(d);
  })();
  const remindFor = st.next && daysUntil(st.next) > 0 ? st.next : inAWeek;
  const nextAfterSave = fluoride.length ? addMonths(fluoride[fluoride.length - 1], 6) : remindFor;

  const headline =
    st.state === 'none'
      ? hasTeeth
        ? s.first
        : s.notYet
      : st.days! < 0
        ? s.late(-st.days!)
        : st.days === 0
          ? s.dueToday
          : null;

  const pill = { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 7, minHeight: 44, paddingHorizontal: 14, borderRadius: radius.pill };

  return (
    <Animated.View entering={enter(index)} layout={LinearTransition.duration(motion.base)}
      style={{ gap: 14, padding: 18, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: tone.bg, borderWidth: 1, borderColor: due ? tone.fg : c.border }}>
      {/* header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
          <ShieldCheck size={22} color={tone.fg} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <T style={{ fontFamily: fonts.display, fontSize: 17, color: tone.fg }}>{s.title}</T>
          <T style={{ fontSize: 12.5, color: tone.fg, opacity: 0.8 }}>{s.sub}</T>
        </View>
      </View>

      {/* status */}
      {headline ? (
        <T style={{ fontFamily: fonts.semi, fontSize: 16, lineHeight: 22, color: tone.fg }}>{headline}</T>
      ) : null}
      {st.next ? (
        <View style={{ gap: 8 }}>
          {st.days! > 0 ? (
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
              <T style={{ fontFamily: fonts.display, fontSize: 40, lineHeight: 44, color: tone.fg, fontVariant: ['tabular-nums'] }}>{st.days}</T>
              <T style={{ fontFamily: fonts.semi, color: tone.fg }}>{s.daysLeft}</T>
            </View>
          ) : null}
          <View style={{ height: 8, borderRadius: 4, backgroundColor: c.track, overflow: 'hidden' }}>
            <Animated.View style={[{ height: 8, width: '100%', borderRadius: 4, backgroundColor: tone.fg, transformOrigin: 'left' }, barStyle]} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T style={{ fontSize: 12.5, color: tone.fg, opacity: 0.85 }}>{s.last}: {fmt(st.last!, lang)}</T>
            <T style={{ fontSize: 12.5, color: tone.fg, fontFamily: fonts.semi }}>{s.next}: {fmt(st.next, lang)}</T>
          </View>
          {st.state === 'soon' ? <T style={{ fontSize: 13, color: tone.fg, fontFamily: fonts.semi }}>{s.soon}</T> : null}
        </View>
      ) : null}

      {/* actions */}
      {hasTeeth || fluoride.length ? (
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <PressableScale accessibilityRole="button" onPress={() => save(toKey(new Date()))} style={{ ...pill, flexGrow: 1, backgroundColor: c.accent }}>
            <Check size={17} color={c.onAccent} strokeWidth={2.6} />
            <T style={{ fontFamily: fonts.semi, fontSize: 14, color: c.onAccent }}>{s.didToday}</T>
          </PressableScale>
          <PressableScale accessibilityRole="button" accessibilityState={{ expanded: picking }}
            onPress={() => { haptic.tap(); setPicking((v) => !v); }}
            style={{ ...pill, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
            <T style={{ fontSize: 14, fontFamily: fonts.semi }}>{s.otherDate}</T>
          </PressableScale>
        </View>
      ) : null}
      {picking ? <DatePicker lang={lang} onSave={save} /> : null}

      {/* reminder */}
      <View style={{ gap: 8 }}>
        {justSaved ? <T style={{ fontSize: 13.5, fontFamily: fonts.semi, color: tone.fg }}>{s.saved}</T> : null}
        {!reminding ? (
          <PressableScale accessibilityRole="button" onPress={() => { haptic.tap(); setReminding(true); }}
            style={{ ...pill, alignSelf: 'flex-start', backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
            <BellRing size={16} color={c.text} />
            <T style={{ fontSize: 14, fontFamily: fonts.semi }}>{s.remind}</T>
          </PressableScale>
        ) : (
          <Animated.View entering={FadeIn.duration(motion.base)} style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              <PressableScale accessibilityRole="button" onPress={() => { haptic.soft(); addToCalendar(justSaved ? nextAfterSave : remindFor, lang, name); }}
                style={{ ...pill, flexGrow: 1, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
                <CalendarPlus size={16} color={c.text} />
                <T style={{ fontSize: 14, fontFamily: fonts.semi }}>{s.iphone}</T>
              </PressableScale>
              <PressableScale accessibilityRole="button" onPress={() => { haptic.soft(); Linking.openURL(googleCalendarUrl(justSaved ? nextAfterSave : remindFor, lang, name)); }}
                style={{ ...pill, flexGrow: 1, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
                <CalendarPlus size={16} color={c.text} />
                <T style={{ fontSize: 14, fontFamily: fonts.semi }}>{s.google}</T>
              </PressableScale>
            </View>
            <T style={{ fontSize: 12, lineHeight: 17, color: tone.fg, opacity: 0.8 }}>
              {s.remindNote} ({fmt(justSaved ? nextAfterSave : remindFor, lang)})
            </T>
          </Animated.View>
        )}
      </View>

      {/* history */}
      {fluoride.length ? (
        <View style={{ gap: 8 }}>
          <PressableScale accessibilityRole="button" accessibilityState={{ expanded: showHistory }} onPress={() => { setShowHistory((v) => !v); setArmed(null); }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, alignSelf: 'flex-start' }}>
            <T style={{ fontSize: 13, fontFamily: fonts.semi, color: tone.fg }}>{s.history} · {fluoride.length}</T>
            <View style={{ transform: [{ rotate: showHistory ? '180deg' : '0deg' }] }}>
              <ChevronDown size={16} color={tone.fg} />
            </View>
          </PressableScale>
          {showHistory ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {[...fluoride].reverse().map((k) => {
                const on = armed === k;
                return (
                  <PressableScale key={k} accessibilityRole="button" accessibilityLabel={`${fmt(k, lang)}. ${s.tapAgain}`}
                    onPress={() => {
                      if (!on) return setArmed(k);
                      haptic.soft();
                      removeFluoride(k);
                      setArmed(null);
                      setJustSaved(false);
                    }}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: on ? tint(c, 'rose').fg : c.surface, borderWidth: 1, borderColor: c.border }}>
                    <T style={{ fontSize: 13, fontVariant: ['tabular-nums'], color: on ? c.ink : c.text }}>{on ? s.tapAgain : fmt(k, lang)}</T>
                    <X size={13} color={on ? c.ink : c.textMuted} />
                  </PressableScale>
                );
              })}
            </View>
          ) : null}
        </View>
      ) : null}
    </Animated.View>
  );
}

/** Should the fluoride card jump to the top of Utama? */
export function fluorideIsDue(history: string[], hasTeeth: boolean) {
  const st = fluorideStatus(history);
  return st.state === 'due' || (st.state === 'none' && hasTeeth);
}

