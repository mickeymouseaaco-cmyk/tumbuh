import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Path, Rect } from 'react-native-svg';

import { motion, useTheme } from '@/theme';

const UPPER = ['U-k-R', 'U-l-R', 'U-c-R', 'U-c-L', 'U-l-L', 'U-k-L'];
const LOWER = ['L-k-R', 'L-l-R', 'L-c-R', 'L-c-L', 'L-l-L', 'L-k-L'];

/**
 * "Si Kecil": a smiling baby whose open mouth shows the front teeth you've marked.
 * Bounces once when a new tooth is added.
 */
export function Mascot({ size = 120, erupted }: { size?: number; erupted: Record<string, boolean> }) {
  const { c } = useTheme();
  const count = Object.keys(erupted).length;
  const s = useSharedValue(1);
  useEffect(() => {
    s.value = withSequence(
      withTiming(1.06, { duration: 140, easing: motion.ease, reduceMotion: ReduceMotion.System }),
      withTiming(1, { duration: 260, easing: motion.ease, reduceMotion: ReduceMotion.System }),
    );
  }, [count, s]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));

  const slot = (i: number) => 45.5 + i * 4.9;
  return (
    <Animated.View style={[{ width: size, height: size }, a]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <Svg width={size} height={size} viewBox="0 0 120 120">
        <Defs>
          <ClipPath id="mouth">
            <Path d="M41 76 Q60 73 79 76 Q77 99 60 99 Q43 99 41 76 Z" />
          </ClipPath>
        </Defs>
        <Circle cx={19} cy={66} r={9} fill={c.skin} />
        <Circle cx={101} cy={66} r={9} fill={c.skin} />
        <Circle cx={60} cy={64} r={42} fill={c.skin} />
        <Path d="M56 25 C52 14 66 9 68 18 C69.5 24 61 26 61 20" stroke={c.hair} strokeWidth={4} strokeLinecap="round" fill="none" />
        <Path d="M37 57 q6.5 -7.5 13 0" stroke="#2B2235" strokeWidth={3.4} strokeLinecap="round" fill="none" />
        <Path d="M70 57 q6.5 -7.5 13 0" stroke="#2B2235" strokeWidth={3.4} strokeLinecap="round" fill="none" />
        <Ellipse cx={32} cy={73} rx={7.5} ry={4.8} fill={c.blush} opacity={0.65} />
        <Ellipse cx={88} cy={73} rx={7.5} ry={4.8} fill={c.blush} opacity={0.65} />
        <Path d="M41 76 Q60 73 79 76 Q77 99 60 99 Q43 99 41 76 Z" fill={c.mouth} />
        <G clipPath="url(#mouth)">
          <Ellipse cx={60} cy={97} rx={12} ry={6} fill="#E36C82" />
          <Rect x={38} y={70} width={44} height={9.5} fill={c.gum} />
          <Rect x={38} y={93.5} width={44} height={8} fill={c.gum} />
          {UPPER.map((id, i) =>
            erupted[id] ? <Rect key={id} x={slot(i)} y={78} width={4.1} height={5.6} rx={1.6} fill={c.enamel} /> : null,
          )}
          {LOWER.map((id, i) =>
            erupted[id] ? <Rect key={id} x={slot(i)} y={88.6} width={4.1} height={5.4} rx={1.6} fill={c.enamel} /> : null,
          )}
        </G>
      </Svg>
    </Animated.View>
  );
}

function Bead({ on, x, y }: { on: boolean; x: number; y: number }) {
  const { c } = useTheme();
  const s = useSharedValue(1);
  useEffect(() => {
    if (!on) return;
    s.value = withSequence(
      withTiming(1.6, { duration: 140, easing: motion.ease, reduceMotion: ReduceMotion.System }),
      withTiming(1, { duration: 280, easing: motion.ease, reduceMotion: ReduceMotion.System }),
    );
  }, [on, s]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <Animated.View
      style={[
        { position: 'absolute', left: x - 5, top: y - 5, width: 10, height: 10, borderRadius: 5, backgroundColor: on ? c.accent : c.track },
        a,
      ]}
    />
  );
}

/** 20 beads around the mascot — one per baby tooth. */
export function TeethHalo({ erupted, size = 176 }: { erupted: Record<string, boolean>; size?: number }) {
  const count = Object.keys(erupted).length;
  const r = size / 2 - 8;
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {Array.from({ length: 20 }, (_, i) => {
        const a = -Math.PI / 2 + (i / 20) * Math.PI * 2;
        return <Bead key={i} on={i < count} x={size / 2 + r * Math.cos(a)} y={size / 2 + r * Math.sin(a)} />;
      })}
      <Mascot size={size - 46} erupted={erupted} />
    </View>
  );
}
