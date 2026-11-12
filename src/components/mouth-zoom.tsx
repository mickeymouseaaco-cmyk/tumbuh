import { X } from 'lucide-react-native';
import { useEffect, useRef } from 'react';
import { Image, Modal, ScrollView, View, useWindowDimensions } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { BABY_ART, BABY_MOUTH } from '@/components/mascot';
import { MouthExplorer } from '@/components/mouth';
import { Display, PressableScale, T } from '@/components/ui';
import { fill } from '@/lib/content';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { motion, useTheme } from '@/theme';

export type HeadRect = { x: number; y: number; size: number };

/**
 * Tap the baby's head → the camera flies into the open mouth.
 * 0 → 0.8: the head scales up around its mouth until the mouth fills the screen, while the room fades out.
 * 0.35 → 0.75: the mouth's warm dark inside washes over everything.
 * 0.7 → 1: the inside-the-mouth view settles in.
 * Closing plays it backwards. With Reduce Motion it's a simple cross-fade.
 */
export function MouthZoom({ origin, onClose }: { origin: HeadRect | null; onClose: () => void }) {
  const { c } = useTheme();
  const { t, name } = useStore();
  const { width: W, height: H } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const reduce = useReducedMotion();
  const p = useSharedValue(0);
  const closing = useRef(false);

  useEffect(() => {
    if (!origin) return;
    closing.current = false;
    p.value = 0;
    p.value = withTiming(1, { duration: reduce ? 300 : motion.zoom, easing: motion.camera });
  }, [origin, p, reduce]);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    haptic.soft();
    const ms = reduce ? 220 : 650;
    p.value = withTiming(0, { duration: ms, easing: motion.camera });
    setTimeout(onClose, ms + 30);
  };

  const o = origin ?? { x: 0, y: 0, size: 1 };
  const hx = o.x + o.size / 2;
  const hy = o.y + o.size / 2;
  const mouthX = o.size * BABY_MOUTH.x;
  const mouthY = o.size * BABY_MOUTH.y;
  // the mouth grows until it is wider than the screen (capped so the artwork stays sharp enough)
  const S1 = Math.min(14, (W * 1.25) / (o.size * BABY_MOUTH.w));
  const tx = W / 2 - hx - mouthX * S1;
  const ty = H * 0.45 - hy - mouthY * S1;

  const headStyle = useAnimatedStyle(() => {
    const z = interpolate(p.value, [0, 0.8], [0, 1], Extrapolation.CLAMP);
    const zz = z * z; // accelerate into the mouth, like leaning in
    const S = 1 + (S1 - 1) * zz;
    return {
      opacity: reduce ? 0 : interpolate(p.value, [0.55, 0.82], [1, 0], Extrapolation.CLAMP),
      // mouth point = head centre + T + offset·S → moves in a straight line from where it was to the target
      transform: [{ translateX: tx * zz }, { translateY: ty * zz }, { scale: S }],
    };
  });
  const roomStyle = useAnimatedStyle(() => ({ opacity: interpolate(p.value, [0, 0.3], [0, 1], Extrapolation.CLAMP) }));
  const cavityStyle = useAnimatedStyle(() => ({ opacity: interpolate(p.value, [0.35, 0.75], [0, 1], Extrapolation.CLAMP) }));
  const contentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(p.value, [0.7, 1], [0, 1], Extrapolation.CLAMP),
    transform: [{ scale: interpolate(p.value, [0.7, 1], [reduce ? 1 : 0.82, 1], Extrapolation.CLAMP) }],
  }));

  return (
    <Modal visible={!!origin} transparent animationType="none" statusBarTranslucent onRequestClose={close}>
      <View style={{ flex: 1 }}>
        <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: c.bg }, roomStyle]} />

        <Animated.View style={[{ position: 'absolute', left: o.x, top: o.y, width: o.size, height: o.size }, headStyle]}>
          <Image source={BABY_ART} style={{ width: o.size, height: o.size }} resizeMode="contain" accessibilityIgnoresInvertColors />
        </Animated.View>

        <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }, cavityStyle]}>
          <Svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
            <Defs>
              <RadialGradient id="cavity" cx="50" cy="45" r="75" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor="#5A1428" />
                <Stop offset="0.55" stopColor={c.cavity} />
                <Stop offset="1" stopColor="#0B0410" />
              </RadialGradient>
            </Defs>
            <Rect x="0" y="0" width="100" height="100" fill="url(#cavity)" />
          </Svg>
        </Animated.View>

        <Animated.View style={[{ flex: 1 }, contentStyle]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingTop: insets.top + 14, paddingBottom: insets.bottom + 32, paddingHorizontal: 20 }}>
            <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center', gap: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                <View style={{ flex: 1, gap: 2 }}>
                  <T style={{ fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase', color: c.accentText, fontFamily: 'PlusJakartaSans_700Bold' }}>{t.tapTooth}</T>
                  <Display style={{ fontSize: 26 }}>{fill(t.mouthTitle, { name })}</Display>
                </View>
                <PressableScale
                  accessibilityRole="button"
                  accessibilityLabel={t.close}
                  onPress={close}
                  hitSlop={8}
                  style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.10)', borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
                  <X size={22} color={c.text} strokeWidth={2.2} />
                </PressableScale>
              </View>
              <MouthExplorer maxWidth={W} />
            </View>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}
