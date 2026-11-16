/**
 * The official Tumbuh mascot (Kenji the boy, Yuki the girl), drawn from the approved character sheet
 * (design/tumbuh-baby-sheet.jpg → public/characters/tumbuh-baby/<gender>/<pose>.png, transparent PNGs).
 *
 * Always show the artwork as it is: never redraw, recolour or stretch it. Pick a pose and a height;
 * the width follows the art's own proportions.
 */
import { useEffect } from 'react';
import { Image, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useReducedMotion, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

export type BabyGender = 'boy' | 'girl';
export type BabyPose = 'master' | 'front' | 'side' | 'back' | 'smile' | 'brush' | 'surprised' | 'wave';

type Art = { src: number; w: number; h: number; /** mouth centre and width, as fractions of the art */ mouth?: { x: number; y: number; w: number } };

const ART: Record<BabyGender, Record<BabyPose, Art>> = {
  boy: {
    master: { src: require('../../public/characters/tumbuh-baby/boy/master.png'), w: 109, h: 302, mouth: { x: 0.624, y: 0.308, w: 0.22 } },
    front: { src: require('../../public/characters/tumbuh-baby/boy/front.png'), w: 123, h: 301 },
    side: { src: require('../../public/characters/tumbuh-baby/boy/side.png'), w: 107, h: 300 },
    back: { src: require('../../public/characters/tumbuh-baby/boy/back.png'), w: 120, h: 297 },
    smile: { src: require('../../public/characters/tumbuh-baby/boy/smile.png'), w: 175, h: 293 },
    brush: { src: require('../../public/characters/tumbuh-baby/boy/brush.png'), w: 129, h: 292 },
    surprised: { src: require('../../public/characters/tumbuh-baby/boy/surprised.png'), w: 104, h: 292 },
    wave: { src: require('../../public/characters/tumbuh-baby/boy/wave.png'), w: 154, h: 293, mouth: { x: 0.474, y: 0.287, w: 0.195 } },
  },
  girl: {
    master: { src: require('../../public/characters/tumbuh-baby/girl/master.png'), w: 120, h: 296, mouth: { x: 0.633, y: 0.284, w: 0.183 } },
    front: { src: require('../../public/characters/tumbuh-baby/girl/front.png'), w: 141, h: 295 },
    side: { src: require('../../public/characters/tumbuh-baby/girl/side.png'), w: 107, h: 294 },
    back: { src: require('../../public/characters/tumbuh-baby/girl/back.png'), w: 127, h: 296 },
    smile: { src: require('../../public/characters/tumbuh-baby/girl/smile.png'), w: 139, h: 284 },
    brush: { src: require('../../public/characters/tumbuh-baby/girl/brush.png'), w: 152, h: 284 },
    surprised: { src: require('../../public/characters/tumbuh-baby/girl/surprised.png'), w: 154, h: 285 },
    wave: { src: require('../../public/characters/tumbuh-baby/girl/wave.png'), w: 171, h: 284, mouth: { x: 0.439, y: 0.289, w: 0.152 } },
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
 * The mascot in one pose. `float` gives a gentle idle bob (off with Reduce Motion).
 * An unset gender ('') shows the boy; screens that haven't asked yet can show both side by side.
 */
export function TumbuhBaby({
  pose = 'master',
  gender = 'boy',
  height,
  float = false,
  style,
  accessibilityLabel,
}: {
  pose?: BabyPose;
  gender?: BabyGender | '';
  height: number;
  float?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}) {
  const g: BabyGender = gender === 'girl' ? 'girl' : 'boy';
  const a = ART[g][pose];
  const { width } = babyArt(g, pose, height);
  const reduce = useReducedMotion();
  const bob = useSharedValue(0);
  useEffect(() => {
    if (!float || reduce) return;
    bob.value = withRepeat(withSequence(withTiming(-4, { duration: 1800 }), withTiming(0, { duration: 1800 })), -1);
  }, [float, reduce, bob]);
  const bobStyle = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));

  return (
    <Animated.View style={[{ width, height }, bobStyle, style]} accessible={!!accessibilityLabel} accessibilityLabel={accessibilityLabel} accessibilityRole={accessibilityLabel ? 'image' : undefined}>
      <Image source={a.src} style={{ width, height }} resizeMode="contain" accessibilityIgnoresInvertColors />
    </Animated.View>
  );
}

/** Boy and girl together (before the parent has chosen). */
export function TumbuhPair({ height, pose = 'master', float = false }: { height: number; pose?: BabyPose; float?: boolean }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
      <TumbuhBaby gender="boy" pose={pose} height={height} float={float} />
      <TumbuhBaby gender="girl" pose={pose} height={height} float={float} />
    </View>
  );
}
