import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Cartoon } from '@/components/cartoon';
import { PictureEditButtons } from '@/components/picture-edit';
import { Card, Disclaimer, PressableScale, ProgressBar, Screen, T, enter } from '@/components/ui';
import { fill, learn, learnCards, topicMeta } from '@/lib/content';
import { useStore } from '@/lib/store';
import { radius, tone, typo, useTheme } from '@/theme';

/** Five picture tiles. Each shows how many of its cards the parent has ticked as understood. */
export default function Learn() {
  const { c } = useTheme();
  const { t, lang, learned } = useStore();
  const ok = tone(c, 'success');
  const total = topicMeta.reduce((n, m) => n + learnCards[m.id].length, 0);
  // count only cards that still exist (a ticked card may have been removed since)
  const got = topicMeta.reduce((n, m) => n + learnCards[m.id].filter((k) => learned[`${m.id}:${k.v}`]).length, 0);

  return (
    <Screen title={t.learnTitle} subtitle={t.learnSub}>
      {/* overall progress */}
      <Card index={1} style={{ gap: 10, paddingVertical: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 }}>
          <T style={[typo.label, { flex: 1 }]}>{fill(t.learnProgress, { n: got, m: total })}</T>
          <T style={[typo.heading, { color: got === total ? ok.fg : c.textMuted, fontVariant: ['tabular-nums'] }]}>{Math.round((got / total) * 100)}%</T>
        </View>
        <ProgressBar value={got / total} color={ok.fg} delay={200} />
      </Card>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {topicMeta.map((m, i) => {
          const cards = learnCards[m.id];
          const n = cards.length;
          const done = cards.filter((k) => learned[`${m.id}:${k.v}`]).length;
          const complete = done === n;
          const wide = i === topicMeta.length - 1 && topicMeta.length % 2 === 1;
          return (
            <Animated.View key={m.id} entering={enter(i + 2)} style={{ flexBasis: wide ? '100%' : '47%', flexGrow: 1 }}>
              <PressableScale
                accessibilityRole="button"
                accessibilityLabel={`${learn[lang][i].title}. ${fill(t.cardsCount, { n: done, m: n })}`}
                onPress={() => router.push({ pathname: '/learn/[id]', params: { id: m.id } })}
                style={{
                  minHeight: 184, padding: 14, gap: 14, borderRadius: radius.card, borderCurve: 'continuous',
                  backgroundColor: c.surface, borderWidth: 1, borderColor: complete ? ok.fg : c.border,
                  flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch', justifyContent: 'space-between',
                }}>
                <View style={{ alignItems: 'center', justifyContent: 'center', borderRadius: radius.tile, overflow: 'hidden', backgroundColor: c.surfaceAlt }}>
                  <Cartoon name={`topic-${m.id}`} scale={wide ? 1 : 1.05} />
                  <PictureEditButtons scene={`topic-${m.id}`} />
                </View>
                <View style={{ gap: 8, flex: wide ? 1 : undefined, paddingHorizontal: 2 }}>
                  <T style={typo.heading}>{learn[lang][i].title}</T>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                    {/* one dot per card; it fills when the card is ticked */}
                    {cards.map((k, j) => (
                      <View key={k.v} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: j < done ? ok.fg : c.track, borderWidth: j < done ? 0 : 1, borderColor: c.borderStrong }} />
                    ))}
                    <T style={[typo.caption, { marginLeft: 4, color: complete ? ok.fg : c.textMuted, fontVariant: ['tabular-nums'] }]}>{done}/{n}</T>
                  </View>
                </View>
                {complete ? (
                  <View style={{ position: 'absolute', top: 10, right: 10, width: 26, height: 26, borderRadius: 13, backgroundColor: ok.fg, alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={15} color={c.ink} strokeWidth={3} />
                  </View>
                ) : null}
              </PressableScale>
            </Animated.View>
          );
        })}
      </View>
      <Disclaimer />
    </Screen>
  );
}
