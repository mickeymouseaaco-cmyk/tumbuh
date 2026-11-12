import { router } from 'expo-router';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { ArtImage, BABY_ART, FAMILY_ART } from '@/components/art-image';
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
      {/* the family, brushing together */}
      <Animated.View entering={enter(1)} style={{ borderRadius: radius.card, borderCurve: 'continuous', overflow: 'hidden', backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center', paddingTop: 14 }}>
        <ArtImage source={FAMILY_ART} width={300} height={255} />
        <View style={{ alignSelf: 'stretch', paddingHorizontal: 18, paddingVertical: 14, backgroundColor: 'rgba(11,10,26,0.55)' }}>
          <T style={{ fontFamily: fonts.display, fontSize: 18, color: c.text }}>{t.learnHero}</T>
        </View>
      </Animated.View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {topicMeta.map((m, i) => {
          const n = learnCards[m.id].length;
          const wide = i === topicMeta.length - 1 && topicMeta.length % 2 === 1;
          return (
            <Animated.View key={m.id} entering={enter(i + 2)} style={{ flexBasis: wide ? '100%' : '47%', flexGrow: 1 }}>
              <PressableScale
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/learn/[id]', params: { id: m.id } })}
                style={{
                  minHeight: 172, padding: 16, gap: 14, borderRadius: radius.card, borderCurve: 'continuous',
                  backgroundColor: c.surface, borderWidth: 1, borderColor: c.border,
                  flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'flex-start', justifyContent: 'space-between',
                }}>
                <View style={{ alignSelf: wide ? 'center' : 'stretch', alignItems: 'center', justifyContent: 'center', borderRadius: radius.tile, backgroundColor: 'rgba(255,255,255,0.05)' }}>
                  {m.id === 'clean' ? (
                    <ArtImage source={FAMILY_ART} width={wide ? 120 : 140} height={wide ? 100 : 118} delay={300} />
                  ) : m.id === 'teething' ? (
                    <ArtImage source={BABY_ART} width={wide ? 110 : 128} height={wide ? 100 : 118} delay={600} />
                  ) : (
                    <Cartoon name={`topic-${m.id}`} scale={wide ? 1 : 1.05} />
                  )}
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
