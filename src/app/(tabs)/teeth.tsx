import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Bullet, Card, Eyebrow, H2, Screen, T, c, f } from '@/components/ui';
import { facts, strings, toothAges, toothId, toothName, type Jaw, type Kind } from '@/lib/content';
import { useStore } from '@/lib/store';
import { ARCH, range, statusOf, timeline, type Status } from '@/lib/teeth';

const ANGLES = [170, 148, 128, 112, 97, 83, 68, 52, 32, 10];
const SIZE: Record<Kind, number> = { m2: 40, m1: 38, k: 30, l: 28, c: 28 };
const RADIUS: Record<Kind, number> = { m2: 13, m1: 12, k: 11, l: 9, c: 9 };
const W = 310;

function look(status: Status) {
  if (status === 'in') return { backgroundColor: c.primary, borderColor: c.primary, borderStyle: 'solid' as const };
  if (status === 'due') return { backgroundColor: c.primarySoft, borderColor: c.primary, borderStyle: 'dashed' as const };
  return { backgroundColor: c.surface, borderColor: '#C2CDCA', borderStyle: 'solid' as const };
}

export default function Teeth() {
  const { t, lang, age, erupted, toggleTooth } = useStore();
  const [sel, setSel] = useState('U-c-R');

  const arch = (jaw: Jaw) => (
    <View style={{ width: W, height: jaw === 'U' ? 132 : 134 }}>
      {ARCH.map(({ kind, side }, i) => {
        const id = toothId(jaw, kind, side);
        const a = (ANGLES[i] * Math.PI) / 180;
        const size = SIZE[kind];
        const cx = W / 2 + 130 * Math.cos(a);
        const cy = jaw === 'U' ? 124 - 108 * Math.sin(a) : 10 + 108 * Math.sin(a);
        const selected = sel === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="button"
            accessibilityLabel={`${toothName(jaw, kind, lang)} (${strings[lang].side[side]})`}
            accessibilityState={{ selected }}
            onPress={() => setSel(id)}
            hitSlop={4}
            style={[
              s.tooth,
              look(statusOf(jaw, kind, side, age, erupted)),
              { left: Math.round(cx - size / 2), top: Math.round(cy - size / 2), width: size, height: size, borderRadius: RADIUS[kind] },
              selected && s.selected,
            ]}
          />
        );
      })}
    </View>
  );

  const [sj, sk, ss] = sel.split('-') as [Jaw, Kind, 'R' | 'L'];
  const status = statusOf(sj, sk, ss, age, erupted);
  const isIn = !!erupted[sel];
  const tag =
    status === 'in'
      ? { bg: c.primary, fg: '#FFFFFF', label: t.legIn }
      : status === 'due'
        ? { bg: c.primarySoft, fg: '#24524E', label: t.legDue }
        : { bg: c.track, fg: '#4A5653', label: t.legNot };

  return (
    <Screen title={t.teethTitle} subtitle={t.teethSub}>
      <Card style={{ alignItems: 'center', gap: 6, paddingHorizontal: 8 }}>
        <Eyebrow color={c.muted}>{t.upper}</Eyebrow>
        {arch('U')}
        <View style={{ width: '70%', height: 1, backgroundColor: c.track, marginVertical: 4 }} />
        {arch('L')}
        <Eyebrow color={c.muted}>{t.lower}</Eyebrow>
        <View style={s.legend}>
          {(['in', 'due', 'not'] as Status[]).map((st) => (
            <View key={st} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={[{ width: 12, height: 12, borderRadius: 4, borderWidth: 1.5 }, look(st)]} />
              <T style={{ fontSize: 12, color: c.muted }}>{st === 'in' ? t.legIn : st === 'due' ? t.legDue : t.legNot}</T>
            </View>
          ))}
        </View>
      </Card>

      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <H2 style={{ fontSize: 17 }}>{toothName(sj, sk, lang)}</H2>
            <T style={{ marginTop: 4, fontSize: 14, color: c.muted }}>
              {t.usually} {range(toothAges[sj][sk], t.unit)}
            </T>
          </View>
          <View style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: 999, backgroundColor: tag.bg }}>
            <T style={{ fontSize: 12, fontFamily: f.semi, color: tag.fg }}>{tag.label}</T>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={() => toggleTooth(sel)}
          style={[s.mark, { backgroundColor: isIn ? c.track : c.primary }]}>
          <T style={{ fontFamily: f.semi, color: isIn ? c.text : '#FFFFFF' }}>{isIn ? t.markOut : t.markIn}</T>
        </Pressable>
      </Card>

      <Card style={{ paddingVertical: 8 }}>
        <H2 style={{ marginTop: 10, marginBottom: 6 }}>{t.orderTitle}</H2>
        {timeline().map((x, i) => (
          <View key={x.jaw + x.kind} style={s.tlRow}>
            <T style={{ width: 24, fontSize: 12, fontFamily: f.bold, color: c.primaryDark }}>{String(i + 1).padStart(2, '0')}</T>
            <T style={{ flex: 1, fontSize: 14 }}>{toothName(x.jaw, x.kind, lang)}</T>
            <T style={{ fontSize: 13, color: c.muted }}>{range(x.r, t.unit)}</T>
          </View>
        ))}
      </Card>

      <View style={s.facts}>
        <Eyebrow>{t.factsTitle}</Eyebrow>
        {facts[lang].map((x) => (
          <Bullet key={x} color={c.text}>{x}</Bullet>
        ))}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  tooth: { position: 'absolute', borderWidth: 1.5 },
  selected: { outlineColor: c.ring, outlineWidth: 3, outlineStyle: 'solid', outlineOffset: 2 },
  legend: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 14, marginTop: 8 },
  mark: { minHeight: 48, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  tlRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 9, borderBottomWidth: 1, borderBottomColor: c.line },
  facts: { backgroundColor: c.primarySoft, borderRadius: 20, padding: 18, gap: 10 },
});
