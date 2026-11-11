import { Tabs } from 'expo-router/js-tabs';

import { TabBar } from '@/components/tab-bar';
import { useStore } from '@/lib/store';
import { useTheme } from '@/theme';

/** Four tabs: Home · Teeth · Learn · Problems, on a floating bar. Labels follow the BM/EN switch. */
export default function TabsLayout() {
  const { t } = useStore();
  const { c } = useTheme();
  return (
    <Tabs
      tabBar={(props) => <TabBar {...(props as any)} />}
      screenOptions={{ headerShown: false, animation: 'none', sceneStyle: { backgroundColor: c.bg } }}>
      <Tabs.Screen name="index" options={{ title: t.tabHome }} />
      <Tabs.Screen name="teeth" options={{ title: t.tabTeeth }} />
      <Tabs.Screen name="learn" options={{ title: t.tabLearn }} />
      <Tabs.Screen name="problems" options={{ title: t.tabProblems }} />
    </Tabs>
  );
}
