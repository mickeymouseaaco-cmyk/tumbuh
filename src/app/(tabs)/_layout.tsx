import { Tabs } from 'expo-router/js-tabs';
import { BookOpen, House, TriangleAlert } from 'lucide-react-native';
import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ToothIcon } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { fonts, motion, useTheme } from '@/theme';

/**
 * Four tabs: Utama · Gigi · Belajar · Masalah.
 * Uses the navigator's own bottom bar (the same one KiTA uses, proven on iPhone Safari and
 * Home Screen), styled for the night theme. The active tab gets a soft pill that grows in behind its icon.
 */
function Icon({ focused, children }: { focused: boolean; children: ReactNode }) {
  const { c } = useTheme();
  // the pill grows in behind the icon when its tab is chosen (premium voice: no bounce)
  const v = useSharedValue(focused ? 1 : 0);
  useEffect(() => {
    v.value = withTiming(focused ? 1 : 0, { duration: focused ? motion.base : motion.press, easing: motion.ease });
  }, [focused, v]);
  const pill = useAnimatedStyle(() => ({ opacity: v.value, transform: [{ scaleX: 0.55 + 0.45 * v.value }] }));
  return (
    <View style={{ width: 56, height: 30, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderRadius: 15, backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.accentBorder },
          pill,
        ]}
      />
      {children}
    </View>
  );
}

export default function TabsLayout() {
  const { t } = useStore();
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenListeners={{ tabPress: () => haptic.tap() }}
      screenOptions={{
        headerShown: false,
        animation: 'none',
        tabBarVariant: 'uikit',
        tabBarActiveTintColor: c.accentText,
        tabBarInactiveTintColor: c.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.semi, fontSize: 12, lineHeight: 15, marginTop: 2 },
        tabBarStyle: {
          backgroundColor: c.surfaceSolid,
          borderTopColor: c.border,
          borderTopWidth: 1,
          height: 64 + Math.max(insets.bottom, 8),
          paddingTop: 6,
          paddingBottom: Math.max(insets.bottom, 8),
        },
        sceneStyle: { backgroundColor: c.bg },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: t.tabHome, tabBarIcon: ({ color, focused }) => <Icon focused={focused}><House color={color} size={22} strokeWidth={focused ? 2.2 : 1.8} /></Icon> }}
      />
      <Tabs.Screen
        name="teeth"
        options={{ title: t.tabTeeth, tabBarIcon: ({ color, focused }) => <Icon focused={focused}><ToothIcon color={color} size={23} strokeWidth={focused ? 2.1 : 1.8} /></Icon> }}
      />
      <Tabs.Screen
        name="learn"
        options={{ title: t.tabLearn, tabBarIcon: ({ color, focused }) => <Icon focused={focused}><BookOpen color={color} size={22} strokeWidth={focused ? 2.2 : 1.8} /></Icon> }}
      />
      <Tabs.Screen
        name="problems"
        options={{ title: t.tabProblems, tabBarIcon: ({ color, focused }) => <Icon focused={focused}><TriangleAlert color={color} size={22} strokeWidth={focused ? 2.2 : 1.8} /></Icon> }}
      />
    </Tabs>
  );
}
