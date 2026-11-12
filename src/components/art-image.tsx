import { useEffect } from 'react';
import { Image, type ImageSourcePropType } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withSequence, withTiming, Easing } from 'react-native-reanimated';

export const FAMILY_ART = require('../../assets/images/family.png');
export { BABY_ART } from '@/components/mascot';

/** Illustrated artwork that gently "breathes" (a slow bob), so the page feels alive. Still with Reduce Motion. */
export function ArtImage({ source, width, height, delay = 0 }: { source: ImageSourcePropType; width: number; height: number; delay?: number }) {
  const reduce = useReducedMotion();
  const y = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    const ease = Easing.inOut(Easing.quad);
    y.value = withDelay(delay, withRepeat(withSequence(withTiming(-4, { duration: 1700, easing: ease }), withTiming(0, { duration: 1700, easing: ease })), -1));
  }, [reduce, y, delay]);
  const a = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return (
    <Animated.View style={a}>
      <Image source={source} style={{ width, height }} resizeMode="contain" accessibilityIgnoresInvertColors />
    </Animated.View>
  );
}
