import {
  Baby,
  Cake,
  Candy,
  Check,
  CupSoda,
  Droplet,
  Droplets,
  Frown,
  Gem,
  GlassWater,
  Hand,
  Heart,
  Lock,
  Milk,
  Moon,
  Pill,
  Repeat,
  ShieldCheck,
  Smile,
  Snowflake,
  Sofa,
  Sun,
  Thermometer,
  Utensils,
  X,
} from 'lucide-react-native';
import { useEffect, type ReactNode } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Ellipse, Path, Rect } from 'react-native-svg';

import { ArtIcon } from '@/components/topic-icon';
import { T, ToothIcon } from '@/components/ui';
import type { CardTag } from '@/lib/content';
import { fonts, motion, useTheme } from '@/theme';

/* ---------- little looping helpers (all still when Reduce Motion is on) ---------- */

function useLoop(from: number, to: number, ms: number, delay = 0) {
  const reduce = useReducedMotion();
  const v = useSharedValue(from);
  useEffect(() => {
    if (reduce) return;
    v.value = withDelay(delay, withRepeat(withSequence(withTiming(to, { duration: ms, easing: Easing.inOut(Easing.quad) }), withTiming(from, { duration: ms, easing: Easing.inOut(Easing.quad) })), -1));
  }, [reduce, v, from, to, ms, delay]);
  return v;
}

function Big({ children }: { children: ReactNode }) {
  const { c } = useTheme();
  return <T style={{ fontFamily: fonts.displayBold, fontSize: 26, color: c.text, fontVariant: ['tabular-nums'] }}>{children}</T>;
}

/** Toothbrush scrubbing across a tooth, with foam. */
function BrushScene({ ink }: { ink: string }) {
  const x = useLoop(-9, 9, 380);
  const foam = useLoop(0.25, 1, 380);
  const brush = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { rotate: '-12deg' }] }));
  const bubbles = useAnimatedStyle(() => ({ opacity: foam.value }));
  return (
    <View style={{ width: 92, height: 72, alignItems: 'center', justifyContent: 'flex-end' }}>
      <ToothIcon size={46} color={ink} fill="#FFFDF8" strokeWidth={1.4} />
      <Animated.View style={[{ position: 'absolute', top: 2, flexDirection: 'row', gap: 4 }, bubbles]}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={{ width: 7 - i, height: 7 - i, borderRadius: 4, borderWidth: 1.4, borderColor: '#FFFFFF' }} />
        ))}
      </Animated.View>
      <Animated.View style={[{ position: 'absolute', top: 8 }, brush]}>
        <ArtIcon id="clean" color={ink} size={50} />
      </Animated.View>
    </View>
  );
}

/** Sun and moon taking turns: twice a day. */
function DayNight({ ink }: { ink: string }) {
  const p = useLoop(0, 1, 1300);
  const sun = useAnimatedStyle(() => ({ opacity: 1 - p.value * 0.75, transform: [{ scale: 1 - p.value * 0.15 }] }));
  const moon = useAnimatedStyle(() => ({ opacity: 0.25 + p.value * 0.75, transform: [{ scale: 0.85 + p.value * 0.15 }] }));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Animated.View style={sun}>
        <Sun size={34} color="#FDE68A" strokeWidth={2} />
      </Animated.View>
      <Big>2×</Big>
      <Animated.View style={moon}>
        <Moon size={30} color={ink} strokeWidth={2} />
      </Animated.View>
    </View>
  );
}

/** Rice grain (under 3) vs pea (3–6), drawn on two brush heads. */
function PasteSize({ ink }: { ink: string }) {
  const { c } = useTheme();
  const head = (blob: ReactNode, label: string) => (
    <View style={{ alignItems: 'center', gap: 4 }}>
      <Svg width={42} height={34} viewBox="0 0 42 34">
        <Rect x={4} y={22} width={34} height={7} rx={3} fill="none" stroke={ink} strokeWidth={1.8} />
        <Path d="M8 22v-6M13 22v-6M18 22v-6M23 22v-6M28 22v-6M33 22v-6" stroke={ink} strokeWidth={1.4} strokeLinecap="round" />
        {blob}
      </Svg>
      <T style={{ fontSize: 11, fontFamily: fonts.bold, color: c.textMuted }}>{label}</T>
    </View>
  );
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {head(<Ellipse cx={21} cy={13.5} rx={3.2} ry={1.8} fill="#FFFFFF" />, '< 3')}
      {head(<Ellipse cx={21} cy={11} rx={6.5} ry={5} fill="#FFFFFF" />, '3–6')}
    </View>
  );
}

/** A chilled teether with a slowly turning snowflake. */
function TeetherScene({ ink }: { ink: string }) {
  const reduce = useReducedMotion();
  const r = useSharedValue(0);
  useEffect(() => {
    if (!reduce) r.value = withRepeat(withTiming(360, { duration: 6000, easing: Easing.linear }), -1);
  }, [reduce, r]);
  const spin = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value}deg` }] }));
  return (
    <View style={{ width: 80, height: 66, alignItems: 'center', justifyContent: 'center' }}>
      <ArtIcon id="teething" color={ink} size={54} />
      <Animated.View style={[{ position: 'absolute', right: 2, top: 0 }, spin]}>
        <Snowflake size={22} color="#A5E1FD" strokeWidth={2} />
      </Animated.View>
    </View>
  );
}

function Pair({ a, b, plus }: { a: ReactNode; b: ReactNode; plus?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {a}
      {plus ? <T style={{ fontFamily: fonts.bold, color: c.textMuted }}>+</T> : null}
      {b}
    </View>
  );
}

/** The picture for one Learn card. */
export function LearnVisual({ v, ink }: { v: string; ink: string }) {
  const I = { color: ink, strokeWidth: 1.9 };
  switch (v) {
    case 'wipe': return <Pair a={<Baby size={40} {...I} />} b={<Droplet size={26} {...I} />} />;
    case 'brush': return <BrushScene ink={ink} />;
    case 'daynight': return <DayNight ink={ink} />;
    case 'lap': return <View style={{ alignItems: 'center' }}><View style={{ transform: [{ rotate: '-90deg' }], marginBottom: -14 }}><Baby size={32} {...I} /></View><Sofa size={46} {...I} /></View>;
    case 'newbrush': return <Pair a={<ArtIcon id="clean" color={ink} size={44} />} b={<View style={{ alignItems: 'center' }}><Repeat size={18} {...I} /><Big>3</Big></View>} />;
    case 'parent': return <Pair a={<Hand size={38} {...I} />} b={<Big>7–8</Big>} />;
    case 'paste': return <PasteSize ink={ink} />;
    case 'ppm': return <Pair a={<ArtIcon id="fluoride" color={ink} size={44} />} b={<Big>1000</Big>} />;
    case 'spit': return <Droplets size={46} {...I} />;
    case 'varnish': return <Pair a={<ToothIcon size={40} color={ink} fill="#FFFDF8" />} b={<ShieldCheck size={34} {...I} />} />;
    case 'reach': return <Pair a={<ArtIcon id="fluoride" color={ink} size={40} />} b={<Lock size={30} {...I} />} />;
    case 'bedbottle': return <Pair a={<ArtIcon id="food" color={ink} size={46} />} b={<Moon size={28} {...I} />} />;
    case 'cup': return <Pair a={<GlassWater size={42} {...I} />} b={<Big>6+</Big>} />;
    case 'sweet': return <Pair a={<CupSoda size={40} {...I} />} b={<Candy size={34} {...I} />} />;
    case 'water': return <Pair a={<GlassWater size={40} {...I} />} b={<Milk size={40} {...I} />} plus />;
    case 'honey': return <Pair a={<Droplet size={40} color="#FDBA4C" strokeWidth={1.9} fill="rgba(253,186,76,0.35)" />} b={<Big>{'< 1'}</Big>} />;
    case 'spoon': return <Utensils size={44} {...I} />;
    case 'signs': return <Pair a={<Droplets size={34} {...I} />} b={<Frown size={36} {...I} />} />;
    case 'fever': return <Pair a={<Thermometer size={40} {...I} />} b={<Big>38°</Big>} />;
    case 'finger': return <Hand size={46} {...I} />;
    case 'teether': return <TeetherScene ink={ink} />;
    case 'gel': return <Pill size={44} {...I} />;
    case 'amber': return <Gem size={42} color="#FDBA4C" strokeWidth={1.9} />;
    case 'firstvisit': return <Pair a={<ToothIcon size={38} color={ink} fill="#FFFDF8" />} b={<Cake size={36} {...I} />} />;
    case 'sixmonths': return <Pair a={<Repeat size={30} {...I} />} b={<Big>6</Big>} />;
    case 'quick': return <Pair a={<ArtIcon id="dentist" color={ink} size={42} />} b={<Smile size={34} {...I} />} />;
    case 'kind': return <Heart size={44} {...I} />;
    default: return <ToothIcon size={44} color={ink} />;
  }
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
