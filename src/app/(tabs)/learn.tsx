import { router } from 'expo-router';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { Cartoon } from '@/components/cartoon';
import { Disclaimer, PressableScale, Screen, T, enter } from '@/components/ui';
import { learn, learnCards, topicMeta } from '@/lib/content';
import { useStore } from '@/lib/store';
import { fonts, radius, useTheme } from '@/theme';

/** Five big picture tiles. No paragraphs: the icon and a 1–3 word title say it. */
export default function Learn() {
  const { c } = useTheme();
  const { t, lang } = useStore();

  return (
    <Screen title={t.learnTitle} subtitle={t.learnSub}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {topicMeta.map((m, i) => {
          const n = learnCards[m.id].length;
          const wide = i === topicMeta.length - 1 && topicMeta.length % 2 === 1;
          return (
            <Animated.View key={m.id} entering={enter(i + 1)} style={{ flexBasis: wide ? '100%' : '47%', flexGrow: 1 }}>
              <PressableScale
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/learn/[id]', params: { id: m.id } })}
                style={{
                  minHeight: 172, padding: 16, gap: 14, borderRadius: radius.card, borderCurve: 'continuous',
                  backgroundColor: c.surface, borderWidth: 1, borderColor: c.border,
                  flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'flex-start', justifyContent: 'space-between',
                }}>
                <View style={{ alignSelf: wide ? 'center' : 'stretch', alignItems: 'center', justifyContent: 'center', borderRadius: radius.tile, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  <Cartoon name={`topic-${m.id}`} scale={wide ? 1 : 1.05} />
                </View>
                <View style={{ gap: 8, flex: wide ? 1 : undefined }}>
                  <T style={{ fontFamily: fonts.display, fontSize: 19, lineHeight: 23, color: c.text }}>{learn[lang][i].title}</T>
                  <View style={{ flexDirection: 'row', gap: 4 }}>
                    {Array.from({ length: n }, (_, k) => (
                      <View key={k} style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.textMuted, opacity: 0.6 }} />
                    ))}
                  </View>
                </View>
              </PressableScale>
            </Animated.View>
          );
        })}
      </View>
      <Disclaimer />
    </Screen>
  );
}
