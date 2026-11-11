import { router } from 'expo-router';
import { ArrowUpRight, Lightbulb } from 'lucide-react-native';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { TopicIcon } from '@/components/topic-icon';
import { Disclaimer, Eyebrow, H2, PressableScale, Screen, T, enter } from '@/components/ui';
import { facts, fill, learn, topicMeta } from '@/lib/content';
import { useStore } from '@/lib/store';
import { fonts, radius, tint, useTheme } from '@/theme';

export default function Learn() {
  const { c } = useTheme();
  const { t, lang } = useStore();
  const day = Math.floor(Date.now() / 86400000);
  const fact = facts[lang][day % facts[lang].length];

  return (
    <Screen title={t.learnTitle} subtitle={t.learnSub}>
      <Animated.View entering={enter(1)} style={{ flexDirection: 'row', gap: 14, padding: 18, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: c.accentSoft }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Lightbulb size={22} color={c.accentText} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Eyebrow>{t.didYouKnow}</Eyebrow>
          <T style={{ lineHeight: 22 }}>{fact}</T>
        </View>
      </Animated.View>

      <H2 style={{ marginTop: 4 }}>{t.topics}</H2>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {topicMeta.map((m, i) => {
          const tt = tint(c, m.tint);
          const sec = learn[lang][i];
          const wide = i === topicMeta.length - 1 && topicMeta.length % 2 === 1;
          const n = sec.items.reduce((a, it) => a + it.points.length, 0);
          return (
            <Animated.View key={m.id} entering={enter(i + 2)} style={{ flexBasis: wide ? '100%' : '47%', flexGrow: 1 }}>
              <PressableScale
                accessibilityRole="button"
                accessibilityHint={m.blurb[lang]}
                onPress={() => router.push({ pathname: '/learn/[id]', params: { id: m.id } })}
                style={{ minHeight: 168, padding: 16, gap: 10, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: tt.bg, justifyContent: 'space-between' }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
                    <TopicIcon name={m.icon} color={tt.fg} />
                  </View>
                  <ArrowUpRight size={20} color={tt.fg} strokeWidth={2.2} />
                </View>
                <View style={{ gap: 4 }}>
                  <T style={{ fontFamily: fonts.display, fontSize: 19, lineHeight: 23, color: tt.fg }}>{sec.title}</T>
                  <T style={{ fontSize: 13, lineHeight: 18, color: tt.fg }}>{m.blurb[lang]}</T>
                  <T style={{ fontSize: 12, fontFamily: fonts.bold, color: tt.fg, opacity: 0.85, marginTop: 2 }}>{fill(t.stepsCount, { n })}</T>
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
