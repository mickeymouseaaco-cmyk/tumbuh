import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Check, ChevronLeft } from 'lucide-react-native';
import { useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, ReduceMotion, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Cartoon } from '@/components/cartoon';
import { LearnVisual, TagBadge } from '@/components/learn-visual';
import { TumbuhBaby } from '@/components/tumbuh-baby';
import { Aurora, Disclaimer, Display, PressableScale, ProgressBar, T, enter } from '@/components/ui';
import { fill, learn, learnCards, topicMeta, type LearnCard } from '@/lib/content';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { motion, radius, tone, typo, useTheme } from '@/theme';

/** One picture card. Tap it once you have understood it: the tick pops and the card turns mint. */
function LessonCard({ card, got, onToggle }: { card: LearnCard; got: boolean; onToggle: () => void }) {
  const { c } = useTheme();
  const { t, lang } = useStore();
  const ok = tone(c, 'success');
  const pop = useSharedValue(1);
  useEffect(() => {
    if (!got) return;
    pop.value = withSequence(
      withTiming(1.3, { duration: 130, easing: motion.ease, reduceMotion: ReduceMotion.System }),
      withTiming(1, { duration: 260, easing: motion.pop, reduceMotion: ReduceMotion.System }),
    );
  }, [got, pop]);
  const tick = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  return (
    <PressableScale
      accessibilityRole="checkbox"
      accessibilityState={{ checked: got }}
      accessibilityLabel={card[lang]}
      accessibilityHint={t.markGot}
      onPress={onToggle}
      style={{ borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: got ? ok.bg : c.surface, borderWidth: 1, borderColor: got ? ok.fg : c.border, overflow: 'hidden' }}>
      <View style={{ height: 116, alignItems: 'center', justifyContent: 'center', backgroundColor: c.surfaceAlt }}>
        <View style={{ opacity: card.tag === 'dont' ? 0.75 : 1 }}>
          <LearnVisual v={card.v} />
        </View>
        {card.tag === 'dont' ? (
          <View style={{ position: 'absolute', width: 96, height: 3, borderRadius: 2, backgroundColor: c.onRose, transform: [{ rotate: '-35deg' }], opacity: 0.9 }} />
        ) : null}
        {card.tag ? <TagBadge tag={card.tag} /> : null}
      </View>
      <View style={{ padding: 12, gap: 10, minHeight: 96, justifyContent: 'space-between' }}>
        <T style={[typo.label, { lineHeight: 19 }]}>{card[lang]}</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Animated.View style={[{ width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: got ? ok.fg : 'transparent', borderWidth: got ? 0 : 2, borderColor: c.borderStrong }, tick]}>
            {got ? <Check size={13} color={c.ink} strokeWidth={3.2} /> : null}
          </Animated.View>
          <T style={[typo.caption, { color: got ? ok.fg : c.textMuted }]}>{got ? t.gotIt : t.markGot}</T>
        </View>
      </View>
    </PressableScale>
  );
}

/** One Learn topic as picture cards: a visual, a few words, a ✓ / ✕ / ! badge, and a tick for "got it". */
export default function Topic() {
  const { c } = useTheme();
  const { t, lang, gender, learned, toggleLearned } = useStore();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const i = Math.max(0, topicMeta.findIndex((m) => m.id === id));
  const m = topicMeta[i];
  const cards = learnCards[m.id];
  const ok = tone(c, 'success');
  const done = cards.filter((k) => learned[`${m.id}:${k.v}`]).length;
  const complete = done === cards.length;

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Stack.Screen options={{ title: learn[lang][i].title }} />
      <Aurora />
      <ScrollView contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 40, paddingHorizontal: 20 }} showsVerticalScrollIndicator={false}>
        <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center', gap: 18 }}>
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={t.back}
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/learn'))}
            hitSlop={8}
            style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={24} color={c.text} strokeWidth={2.4} />
          </PressableScale>

          <Animated.View entering={enter(0)} style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            <View style={{ borderRadius: radius.tile, overflow: 'hidden', backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
              <Cartoon name={`topic-${m.id}`} scale={0.8} />
            </View>
            <Display style={{ flex: 1, fontSize: 28, lineHeight: 33 }}>{learn[lang][i].title}</Display>
          </Animated.View>

          {/* progress through this topic */}
          <Animated.View entering={enter(1)} style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <T style={[typo.bodySm, { flex: 1, color: c.textMuted }]}>{t.learnHint}</T>
              <T style={[typo.label, { color: complete ? ok.fg : c.text, fontVariant: ['tabular-nums'] }]}>{done}/{cards.length}</T>
            </View>
            <ProgressBar value={done / cards.length} color={ok.fg} height={6} />
          </Animated.View>

          {/* the celebration: the mascot's happy pose pops up when every card is ticked */}
          {complete ? (
            <Animated.View
              entering={FadeIn.duration(motion.base)}
              exiting={FadeOut.duration(150)}
              layout={LinearTransition.duration(motion.base)}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingLeft: 16, paddingRight: 18, height: 96, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: ok.bg, borderWidth: 1, borderColor: ok.fg, overflow: 'hidden' }}>
              <View style={{ width: 70, height: 96, overflow: 'hidden' }}>
                <View style={{ position: 'absolute', top: 6, left: -6 }}>
                  <TumbuhBaby gender={gender} pose="smile" height={170} reactKey={`${m.id}-${complete}`} alive />
                </View>
              </View>
              <T style={[typo.heading, { flex: 1, color: ok.fg }]}>{t.topicDone}</T>
            </Animated.View>
          ) : null}

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {cards.map((card, k) => (
              <Animated.View key={card.v} entering={enter(Math.min(k, 6) + 2)} layout={LinearTransition.duration(motion.base)} style={{ flexBasis: '47%', flexGrow: 1 }}>
                <LessonCard
                  card={card}
                  got={!!learned[`${m.id}:${card.v}`]}
                  onToggle={() => {
                    const key = `${m.id}:${card.v}`;
                    const willFinish = !learned[key] && done === cards.length - 1;
                    willFinish ? haptic.success() : haptic.tap();
                    toggleLearned(key);
                  }}
                />
              </Animated.View>
            ))}
          </View>
          <Disclaimer />
        </View>
      </ScrollView>
    </View>
  );
}
