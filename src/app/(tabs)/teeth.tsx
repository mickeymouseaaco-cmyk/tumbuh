import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { EruptionChart } from '@/components/eruption-chart';
import { MouthExplorer } from '@/components/mouth';
import { Card, H2, ProgressBar, Screen, T, enter } from '@/components/ui';
import { fill } from '@/lib/content';
import { useStore } from '@/lib/store';
import { tone, typo, useTheme } from '@/theme';

/** How many teeth are in, overall and per jaw. */
function TeethSummary() {
  const { c } = useTheme();
  const { t, erupted } = useStore();
  const ids = Object.keys(erupted);
  const count = ids.length;
  const upper = ids.filter((id) => id.startsWith('U-')).length;
  const lower = count - upper;
  const ok = tone(c, 'success');
  const done = count === 20;
  return (
    <Card index={1} style={{ gap: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, gap: 2 }}>
          <T style={[typo.caption, { color: c.textMuted }]}>{t.teethProgress}</T>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
            <Animated.View key={count} entering={FadeInDown.duration(220)}>
              <T style={[typo.number, { fontVariant: ['tabular-nums'], color: done ? ok.fg : c.text }]}>{count}</T>
            </Animated.View>
            <T style={[typo.heading, { color: c.textMuted }]}>/ 20</T>
          </View>
        </View>
        {done ? <T style={[typo.label, { color: ok.fg, flex: 1, textAlign: 'right' }]}>{t.allIn}</T> : null}
      </View>
      <ProgressBar value={count / 20} color={done ? ok.fg : c.accent} />
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {([['U', upper], ['L', lower]] as const).map(([jaw, n]) => (
          <View key={jaw} style={{ flex: 1, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T style={[typo.caption, { color: c.textMuted }]}>{jaw === 'U' ? t.upper : t.lower}</T>
              <T style={[typo.caption, { color: c.text, fontVariant: ['tabular-nums'] }]}>{n}/10</T>
            </View>
            <ProgressBar value={n / 10} height={5} color={c.onBrandSoft} delay={150} />
          </View>
        ))}
      </View>
    </Card>
  );
}

export default function Teeth() {
  const { c } = useTheme();
  const { t, name } = useStore();
  return (
    <Screen title={t.teethTitle} subtitle={t.teethSub}>
      <TeethSummary />
      <Animated.View entering={enter(2)} accessibilityLabel={fill(t.mouthTitle, { name })}>
        <MouthExplorer />
      </Animated.View>
      <Card index={3} style={{ gap: 14 }}>
        <View style={{ gap: 4 }}>
          <H2>{t.orderTitle}</H2>
          <T style={[typo.bodySm, { color: c.textMuted }]}>{t.chartNote}</T>
        </View>
        <EruptionChart />
      </Card>
    </Screen>
  );
}
