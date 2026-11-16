import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { TumbuhBaby, babyArt, type BabyPose } from '@/components/tumbuh-baby';
import { motion, useTheme } from '@/theme';

export type Gender = '' | 'boy' | 'girl';

/**
 * Where the mascot sits inside a halo of `size` (relative to the halo's top-left), and where its mouth is.
 * Before boy/girl is chosen, both children stand together and the zoom goes into the boy's mouth.
 */
export function haloFigure(size: number, gender: Gender) {
  if (!gender) {
    const height = size * 0.72;
    const boy = babyArt('boy', 'master', height);
    const girl = babyArt('girl', 'master', height);
    const total = boy.width + girl.width + 2;
    const x = (size - total) / 2;
    const y = (size - height) / 2;
    return { pose: 'master' as BabyPose, x, y, width: boy.width, height, mouth: boy.mouth };
  }
  const height = size * 0.84;
  const a = babyArt(gender, 'wave', height);
  return { pose: 'wave' as BabyPose, x: (size - a.width) / 2, y: (size - height) / 2, width: a.width, height, mouth: a.mouth };
}

function Bead({ on, x, y }: { on: boolean; x: number; y: number }) {
  const { c } = useTheme();
  const s = useSharedValue(1);
  useEffect(() => {
    if (!on) return;
    s.value = withSequence(
      withTiming(1.7, { duration: 140, easing: motion.ease, reduceMotion: ReduceMotion.System }),
      withTiming(1, { duration: 300, easing: motion.ease, reduceMotion: ReduceMotion.System }),
    );
  }, [on, s]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View
      style={[
        {
          position: 'absolute', left: x - 4.5, top: y - 4.5, width: 9, height: 9, borderRadius: 5,
          backgroundColor: on ? c.accent : 'rgba(255,255,255,0.14)',
          boxShadow: on ? `0 0 10px ${c.glow}` : undefined,
        },
        a,
      ]}
    />
  );
}

/**
 * The hologram: the Tumbuh mascot standing in a slowly turning orbit with 20 beads (one per baby tooth).
 * `float` bobs the character gently; both loops stop when Reduce Motion is on.
 */
export function TeethHalo({ erupted, gender = '', size = 200, float = true }: { erupted: Record<string, boolean>; age?: number; gender?: Gender; size?: number; float?: boolean }) {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const count = Object.keys(erupted).length;
  const r = size / 2 - 8;
  const spin = useSharedValue(0);
  const bob = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    spin.value = withRepeat(withTiming(360, { duration: 40000, easing: Easing.linear }), -1);
    if (float) bob.value = withRepeat(withSequence(withTiming(-4, { duration: 1800 }), withTiming(0, { duration: 1800 })), -1);
  }, [reduce, float, spin, bob]);
  const orbit = useAnimatedStyle(() => ({ transform: [{ rotate: `${spin.value}deg` }] }));
  const body = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));
  const fig = haloFigure(size, gender);

  return (
    <View style={{ width: size, height: size }}>
      <View style={{ position: 'absolute', left: size * 0.11, top: size * 0.11, width: size * 0.78, height: size * 0.78, borderRadius: size, backgroundColor: 'rgba(109,91,255,0.18)', boxShadow: `0 0 60px rgba(109,91,255,0.45)` }} />
      <Animated.View style={[{ position: 'absolute', width: size, height: size }, orbit]}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r - 10} stroke={c.auroraB} strokeOpacity={0.35} strokeWidth={1} strokeDasharray="2 7" fill="none" />
        </Svg>
      </Animated.View>
      {Array.from({ length: 20 }, (_, i) => {
        const a = -Math.PI / 2 + (i / 20) * Math.PI * 2;
        return <Bead key={i} on={i < count} x={size / 2 + r * Math.cos(a)} y={size / 2 + r * Math.sin(a)} />;
      })}
      <Animated.View style={[{ position: 'absolute', left: fig.x, top: fig.y, flexDirection: 'row', alignItems: 'flex-end', gap: 2 }, body]}>
        {gender ? (
          <TumbuhBaby gender={gender} pose={fig.pose} height={fig.height} />
        ) : (
          <>
            <TumbuhBaby gender="boy" pose="master" height={fig.height} />
            <TumbuhBaby gender="girl" pose="master" height={fig.height} />
          </>
        )}
      </Animated.View>
    </View>
  );
}
