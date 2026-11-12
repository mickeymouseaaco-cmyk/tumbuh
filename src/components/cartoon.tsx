import { useEffect, type ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { SvgXml } from 'react-native-svg';

import { BabyHead } from '@/components/mascot';
import { T } from '@/components/ui';
import { parts, type PartName } from '@/lib/cartoons';
import { fonts } from '@/theme';

/* ---------- building blocks ---------- */

export function Part({ name, s = 1 }: { name: PartName; s?: number }) {
  const p = parts[name];
  return <SvgXml xml={p.xml} width={p.w * s} height={p.h * s} />;
}

/** A value that swings from → to and back forever (still when Reduce Motion is on). */
function useSwing(from: number, to: number, ms: number, delay = 0, rest = from) {
  const reduce = useReducedMotion();
  const v = useSharedValue(rest);
  useEffect(() => {
    if (reduce) return;
    const ease = Easing.inOut(Easing.quad);
    v.value = withDelay(delay, withRepeat(withSequence(withTiming(to, { duration: ms, easing: ease }), withTiming(from, { duration: ms, easing: ease })), -1));
  }, [reduce, v, from, to, ms, delay]);
  return v;
}

/** A value that runs from → to, then jumps back (falling drops, rising mercury). */
function useCycle(ms: number, delay = 0) {
  const reduce = useReducedMotion();
  const v = useSharedValue(0.5);
  useEffect(() => {
    if (reduce) return;
    v.value = 0;
    v.value = withDelay(delay, withRepeat(withTiming(1, { duration: ms, easing: Easing.in(Easing.quad) }), -1, false));
  }, [reduce, v, ms, delay]);
  return v;
}

function At({ x, y, style, children }: { x: number; y: number; style?: StyleProp<ViewStyle>; children: ReactNode }) {
  return <Animated.View style={[{ position: 'absolute', left: x, top: y }, style]}>{children}</Animated.View>;
}

function Stage({ children }: { children: ReactNode }) {
  return <View style={{ width: 120, height: 96 }}>{children}</View>;
}

function Label({ x, y, children, size = 22 }: { x: number; y: number; children: ReactNode; size?: number }) {
  return (
    <At x={x} y={y}>
      <T style={{ fontFamily: fonts.displayBold, fontSize: size, color: '#FFFFFF', fontVariant: ['tabular-nums'] }}>{children}</T>
    </At>
  );
}

// Style builders for useAnimatedStyle. Marked as worklets so they run on the UI thread on phones.
const ty = (v: SharedValue<number>) => () => {
  'worklet';
  return { transform: [{ translateY: v.value }] };
};
const rot = (v: SharedValue<number>) => () => {
  'worklet';
  return { transform: [{ rotate: `${v.value}deg` }] };
};
const sc = (v: SharedValue<number>) => () => {
  'worklet';
  return { transform: [{ scale: v.value }] };
};

/* ---------- scenes (120 × 96) ---------- */

function Brushing() {
  const x = useSwing(-10, 10, 360);
  const foam = useSwing(0.2, 1, 360);
  const brush = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { rotate: '-14deg' }] }));
  const f = useAnimatedStyle(() => ({ opacity: foam.value }));
  return (
    <Stage>
      <At x={36} y={30}><Part name="tooth" s={1.05} /></At>
      <At x={30} y={18} style={f}>
        <View style={{ flexDirection: 'row', gap: 10 }}><Part name="foam" /><Part name="foam" s={0.7} /><Part name="foam" s={0.9} /></View>
      </At>
      <At x={14} y={24} style={brush}><Part name="brush" s={1.05} /></At>
    </Stage>
  );
}

function Wiping() {
  const x = useSwing(-6, 6, 700);
  const y = useSwing(-3, 3, 700, 350);
  const cloth = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { translateY: y.value }, { rotate: '-12deg' }] }));
  return (
    <Stage>
      <At x={22} y={6}><BabyHead size={78} erupted={{}} age={2} /></At>
      <At x={60} y={54} style={cloth}><Part name="cloth" s={0.85} /></At>
    </Stage>
  );
}

function DayNight() {
  const p = useSwing(0, 1, 1300);
  const sun = useAnimatedStyle(() => ({ opacity: 1 - p.value * 0.7, transform: [{ translateY: p.value * 10 }] }));
  const moon = useAnimatedStyle(() => ({ opacity: 0.3 + p.value * 0.7, transform: [{ translateY: (1 - p.value) * 10 }] }));
  return (
    <Stage>
      <At x={4} y={20} style={sun}><Part name="sun" s={0.95} /></At>
      <Label x={50} y={32}>2×</Label>
      <At x={76} y={22} style={moon}><Part name="moon" s={0.9} /></At>
    </Stage>
  );
}

function OnLap() {
  const b = useSwing(1, 1.04, 1400);
  const breathe = useAnimatedStyle(() => ({ transform: [{ rotate: '-78deg' }, { scale: b.value }] }));
  return (
    <Stage>
      <At x={18} y={60}><Part name="pillow" s={1.05} /></At>
      <At x={26} y={12} style={breathe}><BabyHead size={66} erupted={{ 'L-c-R': true, 'L-c-L': true }} age={8} /></At>
    </Stage>
  );
}

function NewBrush() {
  const p = useSwing(0, 1, 1100);
  const oldB = useAnimatedStyle(() => ({ opacity: 1 - p.value, transform: [{ translateX: -p.value * 12 }] }));
  const newB = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ translateX: (1 - p.value) * 12 }] }));
  return (
    <Stage>
      <At x={10} y={24} style={oldB}><Part name="brushOld" s={1.1} /></At>
      <At x={10} y={24} style={newB}><Part name="brush" s={1.1} /></At>
      <At x={84} y={44}><Part name="calendar" s={0.66} /></At>
      <Label x={93} y={56} size={17}>3</Label>
    </Stage>
  );
}

function ParentBrushes() {
  const x = useSwing(-4, 4, 380);
  const hand = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }, { scaleX: -1 }] }));
  return (
    <Stage>
      <At x={4} y={10}><BabyHead size={70} erupted={{ 'L-c-R': true, 'L-c-L': true, 'U-c-R': true, 'U-c-L': true }} age={20} /></At>
      <At x={54} y={52} style={hand}><Part name="hand" s={1.05} /></At>
      <Label x={78} y={6} size={18}>7–8</Label>
    </Stage>
  );
}

function PasteSize() {
  const p = useSwing(0.9, 1.08, 700);
  const q = useSwing(0.9, 1.08, 700, 350);
  const blob = useAnimatedStyle(() => ({ transform: [{ scale: p.value }] }));
  const blob2 = useAnimatedStyle(() => ({ transform: [{ scale: q.value }] }));
  return (
    <Stage>
      <Label x={2} y={20} size={15}>{'< 3'}</Label>
      <At x={30} y={26}><Part name="brush" s={0.78} /></At>
      <At x={68.3} y={23.3} style={blob}><Part name="blob" s={0.42} /></At>
      <Label x={2} y={58} size={15}>3–6</Label>
      <At x={30} y={64}><Part name="brush" s={0.78} /></At>
      <At x={63.6} y={54.9} style={blob2}><Part name="blob" s={0.95} /></At>
    </Stage>
  );
}

function Squeeze() {
  const p = useSwing(0, 1, 900);
  const tube = useAnimatedStyle(() => ({ transform: [{ scaleY: 1 - p.value * 0.12 }] }));
  const blob = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ scale: 0.4 + p.value * 0.6 }] }));
  return (
    <Stage>
      <At x={0} y={10} style={tube}><Part name="tube" s={0.95} /></At>
      <At x={30} y={56}><Part name="brush" s={1} /></At>
      <At x={77} y={50} style={blob}><Part name="blob" s={0.8} /></At>
    </Stage>
  );
}

function Fluoride1000() {
  const b = useSwing(1, 1.06, 900);
  const s = useAnimatedStyle(sc(b));
  return (
    <Stage>
      <At x={6} y={14} style={s}><Part name="tube" s={1.4} /></At>
      <Label x={14} y={62} size={18}>1000 ppm</Label>
    </Stage>
  );
}

function NoRinse() {
  const t = useSwing(-4, -22, 900);
  const d = useCycle(900);
  const glass = useAnimatedStyle(rot(t));
  const drop = useAnimatedStyle(() => ({ opacity: 1 - d.value, transform: [{ translateY: d.value * 30 }] }));
  return (
    <Stage>
      <At x={70} y={70}><Part name="sink" s={0.65} /></At>
      <At x={36} y={8} style={glass}><Part name="glass" s={1.05} /></At>
      <At x={78} y={36} style={drop}><Part name="drop" s={0.9} /></At>
    </Stage>
  );
}

function Varnish() {
  const p = useCycle(1400);
  const shine = useAnimatedStyle(() => ({ opacity: Math.sin(p.value * Math.PI), transform: [{ translateX: -16 + p.value * 40 }, { translateY: 10 - p.value * 10 }] }));
  return (
    <Stage>
      <At x={36} y={22}><Part name="tooth" s={1.1} /></At>
      <At x={46} y={28} style={shine}><Part name="shine" s={1.1} /></At>
    </Stage>
  );
}

function HighShelf() {
  const b = useSwing(-3, 0, 900);
  const lock = useAnimatedStyle(rot(b));
  return (
    <Stage>
      <At x={8} y={22}><Part name="tube" s={0.8} /></At>
      <At x={4} y={46}><Part name="shelf" s={1.1} /></At>
      <At x={88} y={50} style={lock}><Part name="lock" s={0.8} /></At>
    </Stage>
  );
}

function BottleInBed() {
  const y = useSwing(0, -5, 1200);
  const moon = useAnimatedStyle(ty(y));
  return (
    <Stage>
      <At x={84} y={2} style={moon}><Part name="moon" s={0.66} /></At>
      <At x={42} y={22} style={{ transform: [{ rotate: '-70deg' }] }}><Part name="bottle" s={0.8} /></At>
      <At x={8} y={54}><Part name="crib" s={1.25} /></At>
    </Stage>
  );
}

function Cup() {
  const y = useSwing(0, -6, 700);
  const s = useAnimatedStyle(ty(y));
  return (
    <Stage>
      <At x={18} y={22} style={s}><Part name="sippy" s={1.3} /></At>
      <Label x={84} y={34}>6+</Label>
    </Stage>
  );
}

function Sweets() {
  const r = useSwing(-10, 10, 500);
  const candy = useAnimatedStyle(rot(r));
  return (
    <Stage>
      <At x={16} y={12}><Part name="soda" s={1.35} /></At>
      <At x={62} y={56} style={candy}><Part name="candy" s={1.1} /></At>
    </Stage>
  );
}

function WaterMilk() {
  const a = useSwing(0, -5, 800);
  const b = useSwing(-5, 0, 800);
  const sa = useAnimatedStyle(ty(a));
  const sb = useAnimatedStyle(ty(b));
  return (
    <Stage>
      <At x={18} y={34} style={sa}><Part name="glass" s={1.1} /></At>
      <At x={70} y={18} style={sb}><Part name="bottle" s={1.05} /></At>
    </Stage>
  );
}

function Honey() {
  const d = useCycle(1300);
  const drip = useAnimatedStyle(() => ({ opacity: 1 - d.value * 0.8, transform: [{ translateY: d.value * 22 }, { scaleY: 1 + d.value * 0.3 }] }));
  return (
    <Stage>
      <At x={22} y={18}><Part name="honey" s={1.25} /></At>
      <At x={72} y={64} style={drip}><Part name="drip" s={1.1} /></At>
      <Label x={86} y={14} size={18}>{'< 1'}</Label>
    </Stage>
  );
}

function SharedSpoon() {
  const a = useSwing(-30, -14, 700);
  const b = useSwing(30, 14, 700);
  const sa = useAnimatedStyle(rot(a));
  const sb = useAnimatedStyle(rot(b));
  return (
    <Stage>
      <At x={38} y={14} style={sa}><Part name="spoon" s={1.25} /></At>
      <At x={64} y={14} style={sb}><Part name="spoon" s={1.25} /></At>
    </Stage>
  );
}

function Drooling() {
  const d1 = useCycle(1100);
  const d2 = useCycle(1100, 550);
  const a = useAnimatedStyle(() => ({ opacity: 1 - d1.value, transform: [{ translateY: d1.value * 18 }] }));
  const b = useAnimatedStyle(() => ({ opacity: 1 - d2.value, transform: [{ translateY: d2.value * 18 }] }));
  return (
    <Stage>
      <At x={22} y={0}><BabyHead size={80} erupted={{}} age={6} /></At>
      <At x={56} y={72} style={a}><Part name="drop" s={0.75} /></At>
      <At x={66} y={70} style={b}><Part name="drop" s={0.6} /></At>
    </Stage>
  );
}

function Fever() {
  const p = useSwing(0.35, 1, 900);
  const merc = useAnimatedStyle(() => ({ transform: [{ scaleY: p.value }] }));
  return (
    <Stage>
      <At x={24} y={8}><Part name="thermometer" s={1.3} /></At>
      <At x={33.2} y={14} style={[{ transformOrigin: 'bottom center' } as ViewStyle, merc]}><Part name="mercury" s={1.3} /></At>
      <Label x={60} y={30}>38°</Label>
    </Stage>
  );
}

function FingerRub() {
  const y = useSwing(-3, 3, 420);
  const hand = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }, { scaleX: -1 }] }));
  return (
    <Stage>
      <At x={4} y={8}><BabyHead size={74} erupted={{}} age={7} /></At>
      <At x={50} y={50} style={hand}><Part name="hand" s={1.1} /></At>
    </Stage>
  );
}

function ColdTeether() {
  const r = useSwing(-10, 10, 600);
  const spinV = useSwing(0, 180, 3000);
  const ring = useAnimatedStyle(rot(r));
  const snow = useAnimatedStyle(rot(spinV));
  return (
    <Stage>
      <At x={22} y={22} style={ring}><Part name="teether" s={1.1} /></At>
      <At x={86} y={8} style={snow}><Part name="snow" s={1.2} /></At>
    </Stage>
  );
}

function Gel() {
  const p = useSwing(1, 0.9, 700);
  const g = useAnimatedStyle(() => ({ transform: [{ scaleY: p.value }] }));
  return (
    <Stage>
      <At x={14} y={30} style={g}><Part name="gel" s={1.6} /></At>
    </Stage>
  );
}

function Necklace() {
  const r = useSwing(-7, 7, 900);
  const n = useAnimatedStyle(() => ({ transformOrigin: 'top center', transform: [{ rotate: `${r.value}deg` }] }) as ViewStyle);
  return (
    <Stage>
      <At x={12} y={14} style={n}><Part name="necklace" s={1.5} /></At>
    </Stage>
  );
}

function FirstVisit() {
  const b = useSwing(1, 1.05, 700);
  const cake = useAnimatedStyle(sc(b));
  return (
    <Stage>
      <At x={10} y={30}><Part name="tooth" s={0.95} /></At>
      <At x={60} y={34} style={cake}><Part name="cake" s={1.05} /></At>
    </Stage>
  );
}

function SixMonths() {
  const b = useSwing(1, 0.92, 800);
  const flip = useAnimatedStyle(() => ({ transform: [{ scaleY: b.value }] }));
  return (
    <Stage>
      <At x={30} y={12} style={flip}><Part name="calendar" s={1.35} /></At>
      <Label x={52} y={42} size={30}>6</Label>
    </Stage>
  );
}

function DentistCheck() {
  const r = useSwing(-8, 6, 700);
  const m = useAnimatedStyle(rot(r));
  return (
    <Stage>
      <At x={58} y={30}><Part name="tooth" s={1} /></At>
      <At x={4} y={10} style={m}><Part name="mirror" s={1.15} /></At>
    </Stage>
  );
}

function KindWords() {
  const b = useSwing(0.9, 1.12, 500);
  const h = useAnimatedStyle(sc(b));
  return (
    <Stage>
      <At x={14} y={10}><Part name="bubble" s={1.45} /></At>
      <At x={44} y={20} style={h}><Part name="heart" s={0.8} /></At>
    </Stage>
  );
}

function BottleAndCup() {
  const a = useSwing(0, -6, 800);
  const b = useSwing(-6, 0, 800);
  const sa = useAnimatedStyle(ty(a));
  const sb = useAnimatedStyle(ty(b));
  return (
    <Stage>
      <At x={20} y={18} style={sa}><Part name="bottle" s={1.15} /></At>
      <At x={60} y={34} style={sb}><Part name="sippy" s={1.05} /></At>
    </Stage>
  );
}

function BabyTeether() {
  const r = useSwing(-12, 8, 520);
  const ring = useAnimatedStyle(rot(r));
  return (
    <Stage>
      <At x={4} y={4}><BabyHead size={80} erupted={{ 'L-c-R': true }} age={7} /></At>
      <At x={66} y={40} style={ring}><Part name="teether" s={0.85} /></At>
    </Stage>
  );
}

const SCENES: Record<string, () => ReactNode> = {
  // cards
  wipe: Wiping,
  brush: Brushing,
  daynight: DayNight,
  lap: OnLap,
  newbrush: NewBrush,
  parent: ParentBrushes,
  paste: PasteSize,
  ppm: Fluoride1000,
  spit: NoRinse,
  varnish: Varnish,
  reach: HighShelf,
  bedbottle: BottleInBed,
  cup: Cup,
  sweet: Sweets,
  water: WaterMilk,
  honey: Honey,
  spoon: SharedSpoon,
  signs: Drooling,
  fever: Fever,
  finger: FingerRub,
  teether: ColdTeether,
  gel: Gel,
  amber: Necklace,
  firstvisit: FirstVisit,
  sixmonths: SixMonths,
  quick: DentistCheck,
  kind: KindWords,
  // topic tiles
  'topic-clean': Brushing,
  'topic-fluoride': Squeeze,
  'topic-food': BottleAndCup,
  'topic-teething': BabyTeether,
  'topic-dentist': DentistCheck,
};

/** An animated cartoon scene in natural colours. `scale` enlarges the 120×96 stage. */
export function Cartoon({ name, scale = 1 }: { name: string; scale?: number }) {
  const Scene = SCENES[name] ?? Brushing;
  return (
    <View style={{ width: 120 * scale, height: 96 * scale, alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ transform: [{ scale }] }}>
        <Scene />
      </View>
    </View>
  );
}
