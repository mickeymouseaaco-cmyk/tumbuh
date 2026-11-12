import { View } from 'react-native';
import Animated from 'react-native-reanimated';

import { EruptionChart } from '@/components/eruption-chart';
import { MouthExplorer } from '@/components/mouth';
import { Card, H2, Screen, T, enter } from '@/components/ui';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme';

export default function Teeth() {
  const { c } = useTheme();
  const { t } = useStore();
  return (
    <Screen title={t.teethTitle} subtitle={t.teethSub}>
      <Animated.View entering={enter(1)}>
        <MouthExplorer />
      </Animated.View>
      <Card index={2} style={{ gap: 14 }}>
        <View style={{ gap: 2 }}>
          <H2>{t.orderTitle}</H2>
          <T style={{ fontSize: 13, color: c.textMuted }}>{t.chartNote}</T>
        </View>
        <EruptionChart />
      </Card>
    </Screen>
  );
}
