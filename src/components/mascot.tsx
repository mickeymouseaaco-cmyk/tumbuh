import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { TumbuhBaby, TumbuhPortrait, babyArt, portraitMouth, type BabyPose } from '@/components/tumbuh-baby';
import { motion, useTheme } from '@/theme';

export type Gender = '' | 'boy' | 'girl';

/**
 * Where the mascot sits inside a halo of `size` (relative to the halo's top-left), and where its mouth is.
 * Before boy/girl is chosen, both children stand together and the zoom goes into the boy's mouth.
 */
export function haloFigure(size: number, gender: Gender, mood: 'wave' | 'smile' = 'wave') {
  if (!gender) {
    const height = size * 0.72;
    const boy = babyArt('boy', 'master', height);
    const girl = babyArt('girl', 'master', height);
    const total = boy.width + girl.width + 2;
    const x = (size - total) / 2;
    const y = (size - height) / 2;
    return { pose: 'master' as BabyPose, x, y, width: boy.width, height, mouth: boy.mouth };
  }
  void mood;
  // the chosen child's smiling portrait, in a circle inside the bead ring
  const d = size * 0.8;
  const xy = (size - d) / 2;
  return { pose: 'master' as BabyPose, portrait: true, x: xy, y: xy, width: d, height: d, mouth: portraitMouth(gender, d) };
}

function Bead({ on, x, y }: { on: boolean; x: number; y: number }) {
  const { c } = useTheme();
  const s = useSharedValue(1);
  useEffect(() => {
    if (!on) return;
    s.value = withSequence(
      withTiming(1.7, { duration: 140, easing: motion.ease, reduceMotion: ReduceMotion.System }),
      withTiming(1, { duration: 300, easing: motion.pop, reduceMotion: ReduceMotion.System }),
    );
  }, [on, s]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute', left: x - 4.5, top: y - 4.5, width: 9, height: 9, borderRadius: 5,
          backgroundColor: on ? c.accent : c.track,
        },
        a,
      ]}
    />
  );
}

/**
 * The mascot on its stage: a soft violet light, a slowly turning orbit, and 20 beads (one per baby tooth)
 * that light up as teeth are marked. The mascot breathes and floats, and hops once when a new tooth is
 * marked. `mood="smile"` swaps in the happy pose (e.g. today's routine is done). Loops stop with Reduce Motion.
 */
export function TeethHalo({ erupted, gender = '', size = 200, float = true, mood = 'wave' }: { erupted: Record<string, boolean>; age?: number; gender?: Gender; size?: number; float?: boolean; mood?: 'wave' | 'smile' }) {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const count = Object.keys(erupted).length;
  const r = size / 2 - 8;
  const spin = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    spin.value = withRepeat(withTiming(360, { duration: 40000, easing: Easing.linear }), -1);
  }, [reduce, spin]);
  const orbit = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  const fig = haloFigure(size, gender, mood);

  return (
    <View style={{ width: size, height: size }}>
      {/* stage light */}
      <View style={{ position: 'absolute', left: size * 0.12, top: size * 0.12, width: size * 0.76, height: size * 0.76, borderRadius: size, backgroundColor: c.brandSoft, boxShadow: '0 0 48px rgba(124,108,255,0.38)' }} />
      {/* a soft floor shadow so the character stands on something */}
      {gender ? null : <View style={{ position: 'absolute', left: size * 0.3, top: fig.y + fig.height - size * 0.035, width: size * 0.4, height: size * 0.07, borderRadius: size, backgroundColor: 'rgba(0,0,0,0.28)' }} />}
      <Animated.View style={[{ position: 'absolute', width: size, height: size }, orbit]}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r - 10} stroke={c.brand} strokeOpacity={0.4} strokeWidth={1} strokeDasharray="2 7" fill="none" />
        </Svg>
      </Animated.View>
      {Array.from({ length: 20 }, (_, i) => {
        const a = -Math.PI / 2 + (i / 20) * Math.PI * 2;
        return <Bead key={i} on={i < count} x={size / 2 + r * Math.cos(a)} y={size / 2 + r * Math.sin(a)} />;
      })}
      <Animated.View key={gender || 'pair'} entering={FadeIn.duration(motion.base)} style={{ position: 'absolute', left: fig.x, top: fig.y, flexDirection: 'row', alignItems: 'flex-end', gap: 2 }}>
        {gender ? (
          <View style={{ borderRadius: fig.width, borderWidth: 3, borderColor: c.brandSoft, margin: -3 }}>
            <TumbuhPortrait gender={gender} size={fig.width} alive={float} reactKey={count} />
          </View>
        ) : (
          <>
            <TumbuhBaby gender="boy" pose="master" height={fig.height} alive={float} reactKey={count} />
            <TumbuhBaby gender="girl" pose="master" height={fig.height} alive={float} reactKey={count} />
          </>
        )}
      </Animated.View>
    </View>
  );
}
