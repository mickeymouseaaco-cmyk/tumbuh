/**
 * Utama dashboard pieces: recent tooth records, and the next dentist appointment with a reminder.
 */
import { router } from 'expo-router';
import { ArrowRight, CalendarHeart, CalendarPlus, ClipboardList, Eye, Stethoscope, X } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { DatePicker } from '@/components/fluoride-card';
import { H2, PressableScale, T, enter } from '@/components/ui';
import { toothName, type Jaw, type Kind, type Side } from '@/lib/content';
import { daysUntil, fmt } from '@/lib/fluoride';
import { haptic } from '@/lib/haptics';
import { fdi, findingOf, sorted, type Entry } from '@/lib/records';
import { addAppointmentToCalendar, appointmentGoogleUrl } from '@/lib/reminders';
import { useStore } from '@/lib/store';
import { radius, tint, tone, typo, useTheme } from '@/theme';

/** Every record of the active child, newest first. */
export function useAllRecords() {
  const { records } = useStore();
  const all: (Entry & { tooth: string })[] = [];
  for (const [tooth, list] of Object.entries(records)) for (const e of list) all.push({ ...e, tooth });
  return sorted(all) as (Entry & { tooth: string })[];
}

export function RecentUpdates({ index = 0 }: { index?: number }) {
  const { c } = useTheme();
  const { lang } = useStore();
  const all = useAllRecords();
  const recent = all.slice(0, 3);
  const bm = lang === 'bm';
  return (
    <Animated.View entering={enter(index)} style={{ gap: 12, padding: 18, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
          <ClipboardList size={22} color={c.onBrandSoft} strokeWidth={2} />
        </View>
        <H2>{bm ? 'Kemas kini gigi terkini' : 'Recent tooth updates'}</H2>
      </View>
      {recent.length ? (
        recent.map((e) => {
          const [jaw, kind, side] = e.tooth.split('-') as [Jaw, Kind, Side];
          const f = findingOf(e.finding);
          const t = tone(c, f.tone);
          const Icon = e.by === 'dentist' ? Stethoscope : Eye;
          return (
            <View key={e.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: radius.tile, backgroundColor: c.surfaceAlt }}>
              <View style={{ width: 42, alignItems: 'center', paddingVertical: 4, borderRadius: 12, backgroundColor: c.brandSoft }}>
                <T style={[typo.label, { color: c.onBrandSoft, fontVariant: ['tabular-nums'] }]}>{fdi(jaw, kind, side)}</T>
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.fg }} />
                  <T style={typo.label} numberOfLines={1}>{f[lang]}</T>
                </View>
                <T style={[typo.caption, { color: c.textMuted }]} numberOfLines={1}>{toothName(jaw, kind, lang)} · {fmt(e.date, lang)}</T>
              </View>
              <Icon size={16} color={e.by === 'dentist' ? tone(c, 'success').fg : c.onBrandSoft} accessibilityLabel={e.by === 'dentist' ? (bm ? 'Disahkan doktor gigi' : 'Dentist confirmed') : bm ? 'Pemerhatian ibu bapa' : 'Parent observation'} />
            </View>
          );
        })
      ) : (
        <T style={[typo.bodySm, { color: c.textMuted }]}>{bm ? 'Belum ada rekod. Tekan mana-mana gigi di carta untuk mencatat apa yang anda nampak.' : 'No records yet. Tap any tooth on the chart to note what you see.'}</T>
      )}
      <PressableScale accessibilityRole="button" onPress={() => router.navigate('/teeth')} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 46, borderRadius: radius.pill, backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.accentBorder }}>
        <T style={[typo.label, { color: c.accentText }]}>{bm ? 'Buka carta gigi' : 'Open teeth chart'}</T>
        <ArrowRight size={16} color={c.accentText} strokeWidth={2.4} />
      </PressableScale>
    </Animated.View>
  );
}

export function AppointmentCard({ index = 0 }: { index?: number }) {
  const { c } = useTheme();
  const { t, lang, name, nextVisit, setNextVisit } = useStore();
  const [picking, setPicking] = useState(false);
  const bm = lang === 'bm';
  const lilac = tint(c, 'lilac');
  const days = nextVisit ? daysUntil(nextVisit) : null;
  const past = days !== null && days < 0;
  const pill = { flexDirection: 'row' as const, alignItems: 'center' as const, justifyContent: 'center' as const, gap: 8, minHeight: 44, paddingHorizontal: 14, borderRadius: radius.pill };
  const when = days === null ? '' : days === 0 ? (bm ? 'Hari ini' : 'Today') : days === 1 ? (bm ? 'Esok' : 'Tomorrow') : past ? (bm ? 'Sudah lepas' : 'Passed') : bm ? `${days} hari lagi` : `In ${days} days`;

  return (
    <Animated.View entering={enter(index)} style={{ gap: 12, padding: 18, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: lilac.bg, borderWidth: 1, borderColor: c.border }}>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
          <CalendarHeart size={22} color={lilac.fg} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <T style={[typo.heading, { color: lilac.fg }]}>{bm ? 'Temu janji doktor gigi' : 'Dentist appointment'}</T>
          {nextVisit && !past ? (
            <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
              <T style={[typo.label, { fontSize: 16 }]}>{fmt(nextVisit, lang)}</T>
              <T style={[typo.caption, { color: lilac.fg }]}>{when}</T>
            </View>
          ) : (
            <T style={[typo.bodySm, { color: c.text }]}>{past ? (bm ? 'Temu janji lepas sudah berlalu. Set yang seterusnya.' : 'The last appointment has passed. Set the next one.') : t.visitBody}</T>
          )}
        </View>
        {nextVisit ? (
          <PressableScale accessibilityRole="button" accessibilityLabel={bm ? 'Buang temu janji' : 'Remove appointment'} onPress={() => { haptic.soft(); setNextVisit(null); }} style={{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' }}>
            <X size={18} color={c.textMuted} />
          </PressableScale>
        ) : null}
      </View>
      {nextVisit && !past ? (
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <PressableScale accessibilityRole="button" onPress={() => { haptic.soft(); addAppointmentToCalendar(nextVisit, lang, name); }} style={{ ...pill, flex: 1, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
            <CalendarPlus size={16} color={c.text} />
            <T style={typo.label}>{bm ? 'Kalendar iPhone' : 'iPhone Calendar'}</T>
          </PressableScale>
          <PressableScale accessibilityRole="button" onPress={() => Linking.openURL(appointmentGoogleUrl(nextVisit, lang, name))} style={{ ...pill, flex: 1, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
            <T style={typo.label}>Google</T>
          </PressableScale>
        </View>
      ) : null}
      {picking ? (
        <DatePicker lang={lang} future start={nextVisit && !past ? nextVisit : undefined} saveLabel={bm ? 'Simpan' : 'Save'} onSave={(k) => { haptic.success(); setNextVisit(k); setPicking(false); }} />
      ) : (
        <PressableScale accessibilityRole="button" onPress={() => { haptic.tap(); setPicking(true); }} style={{ ...pill, backgroundColor: nextVisit && !past ? 'transparent' : c.accent }}>
          <T style={[typo.label, { color: nextVisit && !past ? c.accentText : c.onAccent }]}>{nextVisit && !past ? (bm ? 'Tukar tarikh' : 'Change date') : bm ? 'Set temu janji' : 'Set an appointment'}</T>
        </PressableScale>
      )}
    </Animated.View>
  );
}
