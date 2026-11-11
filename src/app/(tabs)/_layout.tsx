import { Tabs } from 'expo-router/js-tabs';
import { BookOpen, House, TriangleAlert } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ToothIcon, c, f } from '@/components/ui';
import { useStore } from '@/lib/store';

/** Four tabs: Home · Teeth · Learn · Problems. Labels follow the BM/EN switch. */
export default function TabsLayout() {
  const { t } = useStore();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.faint,
        tabBarLabelStyle: { fontFamily: f.semi, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
          height: 58 + Math.max(insets.bottom, 8),
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        sceneStyle: { backgroundColor: c.bg },
      }}>
      <Tabs.Screen name="index" options={{ title: t.tabHome, tabBarIcon: ({ color }) => <House color={color} size={23} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="teeth" options={{ title: t.tabTeeth, tabBarIcon: ({ color }) => <ToothIcon color={color} size={24} /> }} />
      <Tabs.Screen name="learn" options={{ title: t.tabLearn, tabBarIcon: ({ color }) => <BookOpen color={color} size={23} strokeWidth={1.8} /> }} />
      <Tabs.Screen name="problems" options={{ title: t.tabProblems, tabBarIcon: ({ color }) => <TriangleAlert color={color} size={23} strokeWidth={1.8} /> }} />
    </Tabs>
  );
}
