import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { MouthExplorer } from '@/components/mouth';
import { Card, H2, Screen, T, enter } from '@/components/ui';
import { facts, fill, toothName } from '@/lib/content';
import { useStore } from '@/lib/store';
import { range, timeline } from '@/lib/teeth';
import { fonts, radius, tint, useTheme } from '@/theme';

export default function Teeth() {
  const { c } = useTheme();
  const { t, lang, name, age } = useStore();
  const sky = tint(c, 'sky');
  const tl = timeline();
  const hereIdx = tl.findIndex((x) => x.r[0] > age); // marker goes before this row

  return (
    <Screen title={t.teethTitle} subtitle={t.teethSub}>
      <Animated.View entering={enter(1)}>
        <MouthExplorer />
      </Animated.View>

      {/* Timeline */}
      <Card index={3} style={{ gap: 4 }}>
        <H2 style={{ marginBottom: 8 }}>{t.orderTitle}</H2>
        {tl.map((x, i) => {
          const now = age >= x.r[0] && age <= x.r[1];
          const past = age > x.r[1];
          return (
            <View key={x.jaw + x.kind}>
              {i === hereIdx ? <HereMarker label={fill(t.youAreHere, { name })} /> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 46 }}>
                <View style={{ width: 22, alignItems: 'center', alignSelf: 'stretch' }}>
                  <View style={{ position: 'absolute', top: i === 0 ? 23 : 0, bottom: i === tl.length - 1 ? 23 : 0, width: 2, backgroundColor: c.track }} />
                  <View style={{ marginTop: 16, width: 14, height: 14, borderRadius: 7, backgroundColor: now ? c.accent : past ? c.enamelEdge : c.bg, borderWidth: 2, borderColor: now ? c.accent : past ? c.enamelEdge : c.track, boxShadow: now ? `0 0 12px ${c.glow}` : undefined }} />
                </View>
                <T style={{ flex: 1, fontSize: 15, fontFamily: now ? fonts.semi : fonts.body, color: past ? c.textMuted : c.text }}>{toothName(x.jaw, x.kind, lang)}</T>
                <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: now ? c.accentSoft : 'transparent' }}>
                  <T style={{ fontSize: 13, fontFamily: fonts.semi, color: now ? c.accentText : c.textMuted, fontVariant: ['tabular-nums'] }}>{range(x.r, t.unit)}</T>
                </View>
              </View>
            </View>
          );
        })}
        {hereIdx === -1 ? <HereMarker label={fill(t.youAreHere, { name })} /> : null}
      </Card>

      {/* Facts */}
      <Animated.View entering={enter(4)} style={{ gap: 10 }}>
        <H2>{t.factsTitle}</H2>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={262} decelerationRate="fast" style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
          {facts[lang].map((f, i) => (
            <View key={f} style={{ width: 250, padding: 18, gap: 10, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: sky.bg }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
                <T style={{ fontFamily: fonts.display, fontSize: 16, color: sky.fg }}>{i + 1}</T>
              </View>
              <T style={{ fontSize: 15, lineHeight: 22, color: sky.fg }}>{f}</T>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </Screen>
  );
}

function HereMarker({ label }: { label: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 }}>
      <View style={{ flex: 1, height: 2, borderRadius: 1, backgroundColor: c.accent }} />
      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: c.accent }}>
        <T style={{ fontSize: 12, fontFamily: fonts.bold, color: c.onAccent }}>{label}</T>
      </View>
      <View style={{ width: 16, height: 2, borderRadius: 1, backgroundColor: c.accent }} />
    </View>
  );
}
