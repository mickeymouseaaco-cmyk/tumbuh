import { Check, X } from 'lucide-react-native';
import { useEffect } from 'react';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withDelay, withSequence, withTiming } from 'react-native-reanimated';

import { Cartoon } from '@/components/cartoon';
import { T } from '@/components/ui';
import type { CardTag } from '@/lib/content';
import { fonts, motion, useTheme } from '@/theme';

/** The animated cartoon for one Learn card (natural colours). */
export function LearnVisual({ v, scale = 1 }: { v: string; ink?: string; scale?: number }) {
  return <Cartoon name={v} scale={scale} />;
}

/** ✓ do · ✕ don't · ! careful — pops in once. */
export function TagBadge({ tag }: { tag: CardTag }) {
  const { c } = useTheme();
  const s = useSharedValue(0.4);
  useEffect(() => {
    s.value = withDelay(250, withSequence(withTiming(1.25, { duration: 160, easing: motion.ease, reduceMotion: ReduceMotion.System }), withTiming(1, { duration: 200, reduceMotion: ReduceMotion.System })));
  }, [s]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const look =
    tag === 'do' ? { bg: c.onMint, icon: <Check size={14} color="#0B2A24" strokeWidth={3.2} /> } :
    tag === 'dont' ? { bg: c.onRose, icon: <X size={14} color="#3A0B12" strokeWidth={3.2} /> } :
    { bg: c.onButter, icon: <T style={{ fontFamily: fonts.bold, fontSize: 14, color: '#3A2A05', lineHeight: 16 }}>!</T> };
  return (
    <Animated.View style={[{ position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: look.bg, alignItems: 'center', justifyContent: 'center' }, a]}>
      {look.icon}
    </Animated.View>
  );
}
