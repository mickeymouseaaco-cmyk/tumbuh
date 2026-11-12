import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LearnVisual, TagBadge } from '@/components/learn-visual';
import { ArtImage, BABY_ART, FAMILY_ART } from '@/components/art-image';
import { Cartoon } from '@/components/cartoon';
import { Aurora, Disclaimer, Display, PressableScale, T, enter } from '@/components/ui';
import { learn, learnCards, topicMeta } from '@/lib/content';
import { useStore } from '@/lib/store';
import { fonts, radius, useTheme } from '@/theme';

/** One Learn topic as picture cards: a visual, a few words, and a ✓ / ✕ / ! badge. */
export default function Topic() {
  const { c } = useTheme();
  const { lang } = useStore();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const i = Math.max(0, topicMeta.findIndex((m) => m.id === id));
  const m = topicMeta[i];
  const cards = learnCards[m.id];

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Stack.Screen options={{ title: learn[lang][i].title }} />
      <Aurora />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center', gap: 18 }}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={lang === 'bm' ? 'Kembali' : 'Back'}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/learn'))}
            hitSlop={8}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={24} color={c.text} strokeWidth={2.4} />
          </PressableScale>

          <Animated.View entering={enter(0)} style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ borderRadius: radius.tile, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
              {m.id === 'clean' ? (
                <ArtImage source={FAMILY_ART} width={110} height={94} />
              ) : m.id === 'teething' ? (
                <ArtImage source={BABY_ART} width={100} height={94} />
              ) : (
                <Cartoon name={`topic-${m.id}`} scale={0.8} />
              )}
            </View>
            <Display style={{ flex: 1, fontSize: 28, lineHeight: 33 }}>{learn[lang][i].title}</Display>
          </Animated.View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {cards.map((card, k) => (
              <Animated.View key={card.v} entering={enter(k + 1)} style={{ flexBasis: '47%', flexGrow: 1 }}>
                <View style={{ borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
                  <View style={{ height: 116, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <View style={{ opacity: card.tag === 'dont' ? 0.75 : 1 }}>
                      <LearnVisual v={card.v} />
                    </View>
                    {card.tag === 'dont' ? (
                      <View style={{ position: 'absolute', width: 96, height: 3, borderRadius: 2, backgroundColor: c.onRose, transform: [{ rotate: '-35deg' }], opacity: 0.9 }} />
                    ) : null}
                    {card.tag ? <TagBadge tag={card.tag} /> : null}
                  </View>
                  <View style={{ padding: 12, minHeight: 58, justifyContent: 'center' }}>
                    <T style={{ fontFamily: fonts.semi, fontSize: 14, lineHeight: 19 }}>{card[lang]}</T>
                  </View>
                </View>
              </Animated.View>
            ))}
          </View>
          <Disclaimer />
        </View>
      </ScrollView>
    </View>
  );
}
