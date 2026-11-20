/**
 * Brushing time: set the morning and bedtime brushing times (shared by all the children) and put a daily
 * alarm for each into the phone's calendar.
 */
import { BellRing, CalendarPlus, Minus, Moon, Plus, Sun } from 'lucide-react-native';
import { useState, type ReactNode } from 'react';
import { Linking, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { H2, PressableScale, T, enter } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { addBrushingToCalendar, brushingGoogleUrl, fromMin, niceTime, toMin } from '@/lib/reminders';
import { useStore } from '@/lib/store';
import { motion, radius, typo, useTheme } from '@/theme';

const L = {
  bm: {
    title: 'Masa berus gigi',
    sub: 'Pilih masa, kemudian tambah penggera ke kalendar telefon. Ia berbunyi setiap hari walaupun Tumbuh ditutup.',
    morning: 'Pagi',
    night: 'Sebelum tidur',
    earlier: 'Awalkan 15 minit',
    later: 'Lewatkan 15 minit',
    set: 'Set penggera harian',
    iphone: 'Kalendar iPhone',
    gMorning: 'Google · pagi',
    gNight: 'Google · malam',
    note: 'Untuk semua anak. Tukar masa? Tambah semula ke kalendar (padam yang lama).',
  },
  en: {
    title: 'Brushing time',
    sub: 'Pick the times, then add an alarm to the phone’s calendar. It rings every day, even with Tumbuh closed.',
    morning: 'Morning',
    night: 'Bedtime',
    earlier: '15 minutes earlier',
    later: '15 minutes later',
    set: 'Set daily alarms',
    iphone: 'iPhone Calendar',
    gMorning: 'Google · morning',
    gNight: 'Google · bedtime',
    note: 'For all the children. Changed the time? Add it again (and delete the old one).',
  },
};

function TimeRow({ icon, label, value, onStep }: { icon: ReactNode; label: string; value: string; onStep: (d: number) => void }) {
  const { c } = useTheme();
  const { lang } = useStore();
  const s = L[lang];
  const btn = { width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center' as const, justifyContent: 'center' as const };
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 8, paddingLeft: 14, borderRadius: radius.tile, backgroundColor: c.surfaceAlt }}>
      <View style={{ width: 36, height: 36, borderRadius: 12, backgroundColor: c.brandSoft, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <View style={{ flex: 1 }}>
        <T style={[typo.caption, { color: c.textMuted }]}>{label}</T>
        <T style={{ ...typo.heading, fontVariant: ['tabular-nums'] }}>{niceTime(value, lang)}</T>
      </View>
      <PressableScale accessibilityRole="button" accessibilityLabel={`${label}: ${s.earlier}`} onPress={() => onStep(-15)} style={btn}>
        <Minus size={18} color={c.text} strokeWidth={2.4} />
      </PressableScale>
      <PressableScale accessibilityRole="button" accessibilityLabel={`${label}: ${s.later}`} onPress={() => onStep(15)} style={btn}>
        <Plus size={18} color={c.text} strokeWidth={2.4} />
      </PressableScale>
    </View>
  );
}

export function BrushReminder({ index = 0 }: { index?: number }) {
  const { c } = useTheme();
  const { lang, brush, setBrush } = useStore();
  const s = L[lang];
  const [open, setOpen] = useState(false);
  const step = (which: 'morning' | 'night', d: number) => {
    haptic.tap();
    setBrush({ [which]: fromMin(toMin(brush[which]) + d) });
  };
  const pill = { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 8, minHeight: 46, paddingHorizontal: 16, borderRadius: radius.pill };

  return (
    <Animated.View entering={enter(index)} style={{ gap: 12, padding: 18, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <BellRing size={22} color={c.accentText} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <H2>{s.title}</H2>
          <T style={[typo.caption, { color: c.textMuted }]}>{s.sub}</T>
        </View>
      </View>
      <TimeRow icon={<Sun size={18} color={c.onBrandSoft} strokeWidth={2.2} />} label={s.morning} value={brush.morning} onStep={(d) => step('morning', d)} />
      <TimeRow icon={<Moon size={18} color={c.onBrandSoft} strokeWidth={2.2} />} label={s.night} value={brush.night} onStep={(d) => step('night', d)} />
      {!open ? (
        <PressableScale accessibilityRole="button" onPress={() => { haptic.tap(); setOpen(true); }} style={{ ...pill, backgroundColor: c.accent }}>
          <CalendarPlus size={18} color={c.onAccent} strokeWidth={2.2} />
          <T style={[typo.label, { color: c.onAccent }]}>{s.set}</T>
        </PressableScale>
      ) : (
        <Animated.View entering={FadeIn.duration(motion.base)} style={{ gap: 8 }}>
          <PressableScale accessibilityRole="button" onPress={() => { haptic.soft(); addBrushingToCalendar(brush, lang); }} style={{ ...pill, backgroundColor: c.accent }}>
            <CalendarPlus size={18} color={c.onAccent} strokeWidth={2.2} />
            <T style={[typo.label, { color: c.onAccent }]}>{s.iphone}</T>
          </PressableScale>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['morning', 'night'] as const).map((w) => (
              <PressableScale key={w} accessibilityRole="button" onPress={() => { haptic.soft(); Linking.openURL(brushingGoogleUrl(w, brush[w], lang)); }} style={{ ...pill, flex: 1, paddingHorizontal: 10, backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.border }}>
                <T style={typo.label}>{w === 'morning' ? s.gMorning : s.gNight}</T>
              </PressableScale>
            ))}
          </View>
          <T style={[typo.caption, { color: c.textMuted }]}>{s.note}</T>
        </Animated.View>
      )}
    </Animated.View>
  );
}
