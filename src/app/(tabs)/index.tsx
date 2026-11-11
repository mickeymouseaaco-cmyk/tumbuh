import { router } from 'expo-router';
import { CalendarDays, Check, Minus, Plus } from 'lucide-react-native';
import { Pressable, StyleSheet, View } from 'react-native';

import { Card, Eyebrow, H2, Screen, T, c, f } from '@/components/ui';
import { checklist, tipFor } from '@/lib/content';
import { useStore } from '@/lib/store';
import { dueAndNext, range } from '@/lib/teeth';

export default function Home() {
  const { t, lang, age, setAge, erupted, todayChecks, toggleCheck } = useStore();
  const count = Object.keys(erupted).filter((k) => erupted[k]).length;
  const { due, next } = dueAndNext(age, erupted, lang);
  const items = checklist(lang, count > 0 || age >= 6);

  return (
    <Screen title={t.hello} subtitle={t.helloSub}>
      <Card style={{ gap: 16 }}>
        <View style={s.row}>
          <View>
            <T style={{ fontSize: 13, color: c.muted }}>{t.ageLabel}</T>
            <T style={{ fontFamily: f.bold, fontSize: 30, letterSpacing: -0.5 }}>
              {age} <T style={{ fontFamily: f.medium, fontSize: 15, color: c.muted }}>{t.months}</T>
            </T>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable accessibilityRole="button" accessibilityLabel={t.ageDown} onPress={() => setAge(age - 1)} style={s.round}>
              <Minus size={18} color={c.text} strokeWidth={2} />
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={t.ageUp} onPress={() => setAge(age + 1)} style={s.round}>
              <Plus size={18} color={c.text} strokeWidth={2} />
            </Pressable>
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <View style={s.row}>
            <T style={{ fontSize: 13, color: c.muted }}>{t.teethIn}</T>
            <T style={{ fontSize: 13, fontFamily: f.semi }}>{count} / 20</T>
          </View>
          <View style={s.track}>
            <View style={[s.fill, { width: `${(count / 20) * 100}%` }]} />
          </View>
        </View>
      </Card>

      <Card style={{ gap: 12 }}>
        <H2>{t.nowTitle}</H2>
        {due.length ? (
          <View style={{ gap: 10 }}>
            {due.map((d) => (
              <View key={d.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={s.dueDot} />
                <T style={{ flex: 1, fontSize: 14 }}>{d.name}</T>
                <T style={{ fontSize: 13, color: c.muted }}>{range(d.r, t.unit)}</T>
              </View>
            ))}
          </View>
        ) : (
          <T style={{ fontSize: 14, lineHeight: 21, color: c.muted }}>{t.noDue}</T>
        )}
        <View style={{ borderTopWidth: 1, borderTopColor: c.line, paddingTop: 12 }}>
          <T style={{ fontSize: 13, lineHeight: 20, color: c.muted }}>
            <T style={{ fontSize: 13, fontFamily: f.semi }}>{t.nextTitle}: </T>
            {next ? `${next.name} · ${range(next.r, t.unit)}` : t.allDone}
          </T>
        </View>
        <Pressable accessibilityRole="button" onPress={() => router.navigate('/teeth')} style={s.outlineBtn}>
          <T style={{ fontFamily: f.semi, fontSize: 14, color: c.primary }}>{t.openChart}</T>
        </Pressable>
      </Card>

      <Card style={{ paddingVertical: 8 }}>
        <H2 style={{ marginTop: 10, marginBottom: 4 }}>{t.todayTitle}</H2>
        {items.map((it) => {
          const done = !!todayChecks[it.key];
          return (
            <Pressable
              key={it.key}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              onPress={() => toggleCheck(it.key)}
              style={s.check}>
              <View style={[s.box, done && { backgroundColor: c.primary, borderColor: c.primary }]}>
                {done ? <Check size={14} color="#FFFFFF" strokeWidth={3} /> : null}
              </View>
              <T style={{ color: done ? c.faint : c.text }}>{it.label}</T>
            </Pressable>
          );
        })}
      </Card>

      <View style={s.tip}>
        <Eyebrow>{t.tipTitle}</Eyebrow>
        <T style={{ lineHeight: 23 }}>{tipFor(age, lang)}</T>
      </View>

      <Card style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
        <View style={s.visitIcon}>
          <CalendarDays size={20} color={c.onAmber} strokeWidth={1.8} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <H2 style={{ fontSize: 15 }}>{t.visitTitle}</H2>
          <T style={{ fontSize: 14, lineHeight: 21, color: c.muted }}>{t.visitBody}</T>
        </View>
      </Card>
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  round: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, borderColor: c.outline, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
  track: { height: 8, borderRadius: 4, backgroundColor: c.track, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4, backgroundColor: c.primary },
  dueDot: { width: 10, height: 10, borderRadius: 3, borderWidth: 1.5, borderStyle: 'dashed', borderColor: c.primary, backgroundColor: c.primarySoft },
  outlineBtn: { alignSelf: 'flex-start', minHeight: 44, paddingHorizontal: 18, borderRadius: 999, borderWidth: 1, borderColor: c.primary, justifyContent: 'center' },
  check: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 52 },
  box: { width: 24, height: 24, borderRadius: 8, borderWidth: 1.5, borderColor: '#B9C4C1', backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' },
  tip: { backgroundColor: c.primarySoft, borderRadius: 20, padding: 18, gap: 6 },
  visitIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: c.amber, alignItems: 'center', justifyContent: 'center' },
});
