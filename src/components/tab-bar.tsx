import { BookOpen, House, ShieldAlert } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { T, ToothIcon } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { fonts, motion, radius, useTheme } from '@/theme';

type Props = {
  state: { index: number; routes: { key: string; name: string }[] };
  navigation: { emit: (e: any) => any; navigate: (name: string) => void };
};

/** Floating pill tab bar. A soft bubble slides to the active tab (short, ease-out: tabs are frequent). */
export function TabBar({ state, navigation }: Props) {
  const { c, dark } = useTheme();
  const { t } = useStore();
  const insets = useSafeAreaInsets();
  const [w, setW] = useState(0);
  const item = w / state.routes.length;
  const x = useSharedValue(0);

  useEffect(() => {
    x.value = withTiming(state.index * item, { duration: motion.base, easing: motion.ease });
  }, [state.index, item, x]);
  const bubble = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));

  const labels: Record<string, string> = { index: t.tabHome, teeth: t.tabTeeth, learn: t.tabLearn, problems: t.tabProblems };

  return (
    <View style={{ pointerEvents: 'box-none', position: 'absolute', left: 0, right: 0, bottom: 0, paddingBottom: Math.max(insets.bottom, 12), paddingHorizontal: 16, alignItems: 'center' }}>
      <View
        onLayout={(e) => setW(e.nativeEvent.layout.width - 12)}
        style={{
          width: '100%',
          maxWidth: 520,
          flexDirection: 'row',
          padding: 6,
          borderRadius: radius.pill,
          backgroundColor: c.surface,
          borderWidth: dark ? 1 : 0,
          borderColor: c.border,
          boxShadow: `0 10px 30px ${c.shadow}`,
        }}>
        {w > 0 ? (
          <Animated.View
            style={[{ position: 'absolute', top: 6, left: 6, bottom: 6, width: item, borderRadius: radius.pill, backgroundColor: c.accentSoft }, bubble]}
          />
        ) : null}
        {state.routes.map((route, i) => {
          const focused = state.index === i;
          const color = focused ? c.accentText : c.textMuted;
          const icon =
            route.name === 'index' ? <House size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} /> :
            route.name === 'teeth' ? <ToothIcon size={23} color={color} strokeWidth={focused ? 2.1 : 1.8} /> :
            route.name === 'learn' ? <BookOpen size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} /> :
            <ShieldAlert size={22} color={color} strokeWidth={focused ? 2.2 : 1.8} />;
          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={labels[route.name]}
              onPress={() => {
                const ev = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
                if (!focused && !ev?.defaultPrevented) {
                  haptic.tap();
                  navigation.navigate(route.name);
                }
              }}
              style={{ flex: 1, minHeight: 54, alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              {icon}
              <T style={{ fontFamily: focused ? fonts.bold : fonts.semi, fontSize: 11, color }}>{labels[route.name]}</T>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
