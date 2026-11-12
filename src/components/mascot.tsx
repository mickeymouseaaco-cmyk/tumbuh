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
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { hairFor } from '@/lib/art';
import { motion, useTheme } from '@/theme';

const UPPER = ['U-k-R', 'U-l-R', 'U-c-R', 'U-c-L', 'U-l-L', 'U-k-L'];
const LOWER = ['L-k-R', 'L-l-R', 'L-c-R', 'L-c-L', 'L-l-L', 'L-k-L'];
const MOUTH = 'M58 110 Q80 105 102 110 Q100 134 80 135 Q60 134 58 110 Z';

export type Gender = '' | 'boy' | 'girl';

/** The drawn baby inside a soft glowing circle (used for the boy / girl choice). */
export function BabyPortrait({ gender, size }: { gender: Gender; size: number; still?: boolean }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', borderWidth: 2, borderColor: 'rgba(255,255,255,0.18)', backgroundColor: '#1B1660', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 24px rgba(109,91,255,0.5)' }}>
      <BabyHead size={size * 0.92} erupted={{ 'L-c-R': true, 'L-c-L': true }} age={10} gender={gender} />
    </View>
  );
}

/** Where the mouth sits inside the head drawing, as a fraction of its size from the centre. */
export const MOUTH_OFFSET = { x: 0, y: 40 / 160 };

/** "Si Kecil": a softly shaded baby whose open smile shows the front teeth you've marked. */
export function BabyHead({ size = 140, erupted, age = 9, gender = '' }: { size?: number; erupted: Record<string, boolean>; age?: number; gender?: Gender }) {
  const slot = (i: number) => 64.5 + i * 5.4;
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160">
      <Defs>
        <RadialGradient id="skin" cx="42%" cy="36%" r="72%">
          <Stop offset="0" stopColor="#FFE9D9" />
          <Stop offset="0.65" stopColor="#FFCFB1" />
          <Stop offset="1" stopColor="#F0A985" />
        </RadialGradient>
        <RadialGradient id="ear" cx="50%" cy="50%" r="60%">
          <Stop offset="0" stopColor="#F3B193" />
          <Stop offset="1" stopColor="#FFD3B8" />
        </RadialGradient>
        <RadialGradient id="blush" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#FF8E8E" stopOpacity="0.75" />
          <Stop offset="1" stopColor="#FF8E8E" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient id="mouthG" cx="50%" cy="35%" r="75%">
          <Stop offset="0" stopColor="#7A1F35" />
          <Stop offset="1" stopColor="#3D0816" />
        </RadialGradient>
        <ClipPath id="mc">
          <Path d={MOUTH} />
        </ClipPath>
      </Defs>
      <Ellipse cx={25} cy={92} rx={12} ry={15} fill="url(#skin)" />
      <Ellipse cx={26} cy={93} rx={6} ry={8.5} fill="url(#ear)" />
      <Ellipse cx={135} cy={92} rx={12} ry={15} fill="url(#skin)" />
      <Ellipse cx={134} cy={93} rx={6} ry={8.5} fill="url(#ear)" />
      <Circle cx={80} cy={86} r={57} fill="url(#skin)" />
      <Ellipse cx={62} cy={52} rx={16} ry={9} fill="#FFFFFF" opacity={0.28} transform="rotate(-20 62 52)" />
      {/* hair grows with age */}
      {hairFor(age).map((h) =>
        h.fill ? (
          <Path key={h.d} d={h.d} fill="#4A2E25" />
        ) : (
          <Path key={h.d} d={h.d} stroke="#4A2E25" strokeWidth={h.width ?? 2} strokeLinecap="round" fill="none" opacity={h.opacity ?? 1} />
        ),
      )}
      <Path d="M50 70 q8 -4 16 0" stroke="#C98A6E" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.6} />
      <Path d="M94 70 q8 -4 16 0" stroke="#C98A6E" strokeWidth={2} strokeLinecap="round" fill="none" opacity={0.6} />
      <Path d="M49 84 q9 -9 18 0" stroke="#2B2235" strokeWidth={3.6} strokeLinecap="round" fill="none" />
      <Path d="M93 84 q9 -9 18 0" stroke="#2B2235" strokeWidth={3.6} strokeLinecap="round" fill="none" />
      <Path d="M50 82 l-3 -2 M66 82 l3 -2 M94 82 l-3 -2 M110 82 l3 -2" stroke="#2B2235" strokeWidth={2} strokeLinecap="round" />
      {gender === 'girl' ? (
        <G>
          {/* longer lashes */}
          <Path d="M48 80 l-4 -3.5 M51 77 l-2.5 -4 M109 77 l2.5 -4 M112 80 l4 -3.5" stroke="#2B2235" strokeWidth={2} strokeLinecap="round" />
          {/* flower hair clip */}
          <G transform="translate(108 44)">
            {[0, 72, 144, 216, 288].map((r) => (
              <Ellipse key={r} cx={0} cy={-6.5} rx={4.6} ry={6} fill="#C4B5FD" stroke="#8B7BE0" strokeWidth={1} transform={`rotate(${r})`} />
            ))}
            <Circle cx={0} cy={0} r={3.6} fill="#FDE68A" stroke="#E0B53A" strokeWidth={1} />
          </G>
        </G>
      ) : null}
      <Ellipse cx={80} cy={97} rx={5} ry={3.2} fill="#E9A07F" opacity={0.7} />
      <Ellipse cx={44} cy={102} rx={13} ry={9} fill="url(#blush)" />
      <Ellipse cx={116} cy={102} rx={13} ry={9} fill="url(#blush)" />
      <Path d={MOUTH} fill="url(#mouthG)" />
      <G clipPath="url(#mc)">
        <Ellipse cx={80} cy={134} rx={15} ry={8} fill="#E2667E" />
        <Path d="M54 104 L106 104 L106 115 Q80 112 54 115 Z" fill="#F08AA0" />
        <Path d="M54 140 L106 140 L106 128 Q80 131 54 128 Z" fill="#F08AA0" />
        {UPPER.map((id, i) => (erupted[id] ? <Rect key={id} x={slot(i)} y={112.5} width={4.6} height={5.6} rx={2} fill="#FFFDF8" /> : null))}
        {LOWER.map((id, i) => (erupted[id] ? <Rect key={id} x={slot(i)} y={124.4} width={4.6} height={5.2} rx={2} fill="#FFFDF8" /> : null))}
      </G>
      <Path d="M58 110 Q80 105 102 110" stroke="#C9576E" strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </Svg>
  );
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
 * The hologram: baby head floating in a slowly turning orbit with 20 beads (one per baby tooth).
 * `float` bobs the head gently; both loops stop when Reduce Motion is on.
 */
export function TeethHalo({ erupted, age, gender = '', size = 200, float = true }: { erupted: Record<string, boolean>; age?: number; gender?: Gender; size?: number; float?: boolean }) {
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
  const head = useAnimatedStyle(() => ({ transform: [{ translateY: bob.value }] }));

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ position: 'absolute', width: size * 0.78, height: size * 0.78, borderRadius: size, backgroundColor: 'rgba(109,91,255,0.18)', boxShadow: `0 0 60px rgba(109,91,255,0.45)` }} />
      <Animated.View style={[{ position: 'absolute', width: size, height: size }, orbit]}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r - 10} stroke={c.auroraB} strokeOpacity={0.35} strokeWidth={1} strokeDasharray="2 7" fill="none" />
        </Svg>
      </Animated.View>
      {Array.from({ length: 20 }, (_, i) => {
        const a = -Math.PI / 2 + (i / 20) * Math.PI * 2;
        return <Bead key={i} on={i < count} x={size / 2 + r * Math.cos(a)} y={size / 2 + r * Math.sin(a)} />;
      })}
      <Animated.View style={head}>
        <BabyHead size={size - 56} erupted={erupted} age={age} gender={gender} />
      </Animated.View>
    </View>
  );
}
