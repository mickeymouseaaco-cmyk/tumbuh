import { Stack, router, useLocalSearchParams } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { ScrollView, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TopicIcon } from '@/components/topic-icon';
import { Bullet, Card, Disclaimer, Display, PressableScale, T, enter } from '@/components/ui';
import { learn, topicMeta } from '@/lib/content';
import { useStore } from '@/lib/store';
import { fonts, radius, tint, useTheme } from '@/theme';

/** One Learn topic, pushed above the tabs. Every card open: this is reading, not hunting. */
export default function Topic() {
  const { c } = useTheme();
  const { lang } = useStore();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const i = Math.max(0, topicMeta.findIndex((m) => m.id === id));
  const m = topicMeta[i];
  const sec = learn[lang][i];
  const tt = tint(c, m.tint);

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Stack.Screen options={{ title: sec.title }} />
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: insets.bottom + 40 }} showsVerticalScrollIndicator={false}>
        <View style={{ backgroundColor: tt.bg, paddingTop: insets.top + 8, paddingHorizontal: 20, paddingBottom: 28, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, borderCurve: 'continuous' }}>
          <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center', gap: 18 }}>
            <PressableScale
              accessibilityRole="button"
              accessibilityLabel={lang === 'bm' ? 'Kembali' : 'Back'}
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/learn'))}
              hitSlop={8}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={24} color={tt.fg} strokeWidth={2.4} />
            </PressableScale>
            <Animated.View entering={enter(0)} style={{ gap: 14 }}>
              <View style={{ width: 64, height: 64, borderRadius: 22, borderCurve: 'continuous', backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
                <TopicIcon name={m.icon} color={tt.fg} size={32} />
              </View>
              <Display style={{ color: tt.fg }}>{sec.title}</Display>
              <T style={{ fontSize: 16, color: tt.fg }}>{m.blurb[lang]}</T>
            </Animated.View>
          </View>
        </View>

        <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 20, gap: 14 }}>
          {sec.items.map((it, k) => (
            <Card key={it.title} index={k + 1} style={{ gap: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: tt.bg, alignItems: 'center', justifyContent: 'center' }}>
                  <T style={{ fontFamily: fonts.display, fontSize: 17, color: tt.fg }}>{k + 1}</T>
                </View>
                <T style={{ flex: 1, fontFamily: fonts.display, fontSize: 19 }}>{it.title}</T>
              </View>
              <View style={{ gap: 10 }}>
                {it.points.map((p) => (
                  <Bullet key={p} dot={tt.fg}>{p}</Bullet>
                ))}
              </View>
            </Card>
          ))}
          <View style={{ height: 1, backgroundColor: c.line, marginVertical: 4, borderRadius: radius.mark }} />
          <Disclaimer />
        </View>
      </ScrollView>
    </View>
  );
}
