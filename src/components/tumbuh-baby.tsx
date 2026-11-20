/**
 * The official Tumbuh mascot (Kenji the boy, Yuki the girl), drawn from the approved character sheet
 * (design/tumbuh-baby-sheet.jpg → public/characters/tumbuh-baby/<gender>/<pose>.webp, transparent WebP).
 *
 * Always show the artwork as it is: never redraw, recolour or stretch it. Pick a pose and a height;
 * the width follows the art's own proportions.
 */
import { useEffect, useRef } from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

import { motion } from '@/theme';

export type BabyGender = 'boy' | 'girl';
export type BabyPose = 'master' | 'front' | 'side' | 'back' | 'smile' | 'brush' | 'surprised' | 'wave';

type Art = { src: number; w: number; h: number; /** mouth centre and width, as fractions of the art */ mouth?: { x: number; y: number; w: number } };

const ART: Record<BabyGender, Record<BabyPose, Art>> = {
  boy: {
    master: { src: require('../../public/characters/tumbuh-baby/boy/master.webp'), w: 109, h: 302, mouth: { x: 0.624, y: 0.308, w: 0.22 } },
    front: { src: require('../../public/characters/tumbuh-baby/boy/front.webp'), w: 123, h: 301 },
    side: { src: require('../../public/characters/tumbuh-baby/boy/side.webp'), w: 107, h: 300 },
    back: { src: require('../../public/characters/tumbuh-baby/boy/back.webp'), w: 120, h: 297 },
    smile: { src: require('../../public/characters/tumbuh-baby/boy/smile.webp'), w: 175, h: 293, mouth: { x: 0.394, y: 0.287, w: 0.18 } },
    brush: { src: require('../../public/characters/tumbuh-baby/boy/brush.webp'), w: 129, h: 292, mouth: { x: 0.512, y: 0.298, w: 0.23 } },
    surprised: { src: require('../../public/characters/tumbuh-baby/boy/surprised.webp'), w: 104, h: 292, mouth: { x: 0.5, y: 0.312, w: 0.1 } },
    wave: { src: require('../../public/characters/tumbuh-baby/boy/wave.webp'), w: 154, h: 293, mouth: { x: 0.474, y: 0.287, w: 0.195 } },
  },
  girl: {
    master: { src: require('../../public/characters/tumbuh-baby/girl/master.webp'), w: 120, h: 296, mouth: { x: 0.633, y: 0.284, w: 0.183 } },
    front: { src: require('../../public/characters/tumbuh-baby/girl/front.webp'), w: 141, h: 295 },
    side: { src: require('../../public/characters/tumbuh-baby/girl/side.webp'), w: 107, h: 294 },
    back: { src: require('../../public/characters/tumbuh-baby/girl/back.webp'), w: 127, h: 296 },
    smile: { src: require('../../public/characters/tumbuh-baby/girl/smile.webp'), w: 139, h: 284, mouth: { x: 0.604, y: 0.289, w: 0.2 } },
    brush: { src: require('../../public/characters/tumbuh-baby/girl/brush.webp'), w: 152, h: 284, mouth: { x: 0.493, y: 0.292, w: 0.2 } },
    surprised: { src: require('../../public/characters/tumbuh-baby/girl/surprised.webp'), w: 154, h: 285, mouth: { x: 0.513, y: 0.288, w: 0.08 } },
    wave: { src: require('../../public/characters/tumbuh-baby/girl/wave.webp'), w: 171, h: 284, mouth: { x: 0.439, y: 0.289, w: 0.152 } },
  },
};

/** Size and mouth position of a pose drawn at `height` (for layout and the tap-to-look-inside zoom). */
export function babyArt(gender: BabyGender, pose: BabyPose, height: number) {
  const a = ART[gender][pose];
  const width = (height * a.w) / a.h;
  const m = a.mouth ?? { x: 0.5, y: 0.3, w: 0.18 };
  return { width, height, mouth: { x: m.x * width, y: m.y * height, w: m.w * width } };
}

/**
 * The mascot in one pose.
 * `alive`: it breathes (a 1.2% rise from the feet, 3.6 s) and floats a few pixels — never still, never busy.
 * `reactKey`: when this value changes, the mascot does one happy hop (e.g. a tooth was just marked).
 * All of it is off with Reduce Motion. An unset gender ('') shows the boy.
 */
export function TumbuhBaby({
  pose = 'master',
  gender = 'boy',
  height,
  alive = false,
  float = false,
  reactKey,
  style,
  accessibilityLabel,
}: {
  pose?: BabyPose;
  gender?: BabyGender | '';
  height: number;
  alive?: boolean;
  /** older name for `alive` */
  float?: boolean;
  reactKey?: string | number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const g: BabyGender = gender === 'girl' ? 'girl' : 'boy';
  const a = ART[g][pose];
  const { width } = babyArt(g, pose, height);
  const reduce = useReducedMotion();
  const live = alive || float;
  const bob = useSharedValue(0);
  const breath = useSharedValue(0);
  const hop = useSharedValue(0);
  useEffect(() => {
    if (!live || reduce) return;
    bob.value = withRepeat(withSequence(withTiming(-4, { duration: 2400, easing: motion.breathe }), withTiming(0, { duration: 2400, easing: motion.breathe })), -1);
    breath.value = withRepeat(withSequence(withTiming(1, { duration: 1800, easing: motion.breathe }), withTiming(0, { duration: 1800, easing: motion.breathe })), -1);
  }, [live, reduce, bob, breath]);

  // one hop when something good happens; skipped on first render
  const seen = useRef(reactKey);
  useEffect(() => {
    if (seen.current === reactKey) return;
    seen.current = reactKey;
    if (reduce) return;
    hop.value = withSequence(
      withTiming(1, { duration: 170, easing: motion.ease }),
      withTiming(0, { duration: 360, easing: motion.pop }),
    );
  }, [reactKey, reduce, hop]);

  const bodyStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: bob.value - hop.value * 14 },
      // squash on take-off, breathe at rest; both grow from the feet
      { scaleY: 1 + breath.value * 0.012 + hop.value * 0.03 },
      { scaleX: 1 - hop.value * 0.02 },
    ],
  }));

  return (
    <Animated.View
      style={[{ width, height, transformOrigin: 'bottom center' }, bodyStyle, style]}
      accessible={!!accessibilityLabel}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}>
      <Image source={a.src} style={{ width, height }} resizeMode="contain" accessibilityIgnoresInvertColors />
    </Animated.View>
  );
}

/** Boy and girl together (before the parent has chosen). */
export function TumbuhPair({ height, pose = 'master', alive = false }: { height: number; pose?: BabyPose; alive?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
      <TumbuhBaby gender="boy" pose={pose} height={height} alive={alive} />
      <TumbuhBaby gender="girl" pose={pose} height={height} alive={alive} />
    </View>
  );
}

/* ---------- Home portrait ---------- */

const PORTRAIT: Record<BabyGender, { src: number; /** mouth centre and width, as fractions of the square picture */ mouth: { x: number; y: number; w: number } }> = {
  boy: { src: require('../../public/characters/tumbuh-baby/boy/portrait.webp'), mouth: { x: 0.518, y: 0.488, w: 0.156 } },
  girl: { src: require('../../public/characters/tumbuh-baby/girl/portrait.webp'), mouth: { x: 0.513, y: 0.43, w: 0.127 } },
};

/** Where the portrait's mouth is when it's drawn `size` wide (for the tap-to-look-inside zoom). */
export function portraitMouth(gender: BabyGender, size: number) {
  const m = PORTRAIT[gender].mouth;
  return { x: m.x * size, y: m.y * size, w: m.w * size };
}

/**
 * The chosen child's smiling portrait in a circle (Utama). It breathes very gently, and does one small
 * happy bounce when `reactKey` changes (e.g. a tooth was just marked). Still with Reduce Motion.
 * `round={false}` draws the full square (used by the zoom, which flies into the mouth).
 */
export function TumbuhPortrait({ gender, size, alive = false, reactKey, round = true }: { gender: BabyGender; size: number; alive?: boolean; reactKey?: string | number; round?: boolean }) {
  const reduce = useReducedMotion();
  const breath = useSharedValue(0);
  const hop = useSharedValue(0);
  useEffect(() => {
    if (!alive || reduce) return;
    breath.value = withRepeat(withSequence(withTiming(1, { duration: 1800, easing: motion.breathe }), withTiming(0, { duration: 1800, easing: motion.breathe })), -1);
  }, [alive, reduce, breath]);
  const seen = useRef(reactKey);
  useEffect(() => {
    if (seen.current === reactKey) return;
    seen.current = reactKey;
    if (reduce) return;
    hop.value = withSequence(withTiming(1, { duration: 160, easing: motion.ease }), withTiming(0, { duration: 340, easing: motion.pop }));
  }, [reactKey, reduce, hop]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: 1 + breath.value * 0.012 + hop.value * 0.05 }] }));
  return (
    <Animated.View style={[{ width: size, height: size, borderRadius: round ? size / 2 : 0, overflow: 'hidden' }, a]}>
      <Image source={PORTRAIT[gender].src} style={{ width: size, height: size }} resizeMode="cover" accessibilityIgnoresInvertColors />
    </Animated.View>
  );
}
