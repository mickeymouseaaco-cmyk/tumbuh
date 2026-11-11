import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, {
  FadeIn,
  ReduceMotion,
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { Button, Card, Eyebrow, H2, PressableScale, Screen, T, TOOTH_PATH, ToothIcon, enter } from '@/components/ui';
import { facts, fill, strings, toothAges, toothId, toothName, type Jaw, type Kind, type Side } from '@/lib/content';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { ARCH, range, statusOf, timeline, type Status } from '@/lib/teeth';
import { fonts, motion, radius, tint, useTheme, type Colors } from '@/theme';

const ANGLES = [170, 148, 128, 112, 97, 83, 68, 52, 32, 10];
const SIZE: Record<Kind, number> = { m2: 40, m1: 38, k: 32, l: 30, c: 31 };
const W = 310;
const H = 140;
const RX = 128;
const RY = 106;

const center = (jaw: Jaw, deg: number) => {
  const a = (deg * Math.PI) / 180;
  return { x: W / 2 + RX * Math.cos(a), y: jaw === 'U' ? 128 - RY * Math.sin(a) : 12 + RY * Math.sin(a) };
};

function gumPath(jaw: Jaw) {
  const pts: string[] = [];
  for (let d = 174; d >= 6; d -= 4) {
    const p = center(jaw, d);
    pts.push(`${pts.length ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
  }
  return pts.join(' ');
}
const GUM = { U: gumPath('U'), L: gumPath('L') };

function toothLook(c: Colors, status: Status, selected: boolean) {
  const ring = selected ? c.accent : undefined;
  if (status === 'in') return { fill: c.enamel, fillOpacity: 1, stroke: ring ?? c.enamelEdge, dash: undefined, opacity: 1, width: selected ? 2.4 : 1.4 };
  if (status === 'due') return { fill: c.enamel, fillOpacity: 1, stroke: ring ?? c.accent, dash: '2.2 1.8', opacity: 0.9, width: selected ? 2.4 : 1.6 };
  // still under the gum: a faint silhouette
  return { fill: c.enamel, fillOpacity: 0.35, stroke: ring ?? c.gumEdge, dash: undefined, opacity: 1, width: selected ? 2.4 : 1.4 };
}

function ChartTooth({ jaw, kind, side, index }: { jaw: Jaw; kind: Kind; side: Side; index: number }) {
  const { c } = useTheme();
  const { lang, age, erupted } = useStore();
  const sel = useSelected();
  const reduce = useReducedMotion();
  const id = toothId(jaw, kind, side);
  const status = statusOf(jaw, kind, side, age, erupted);
  const selected = sel.id === id;
  const size = SIZE[kind];
  const { x, y } = center(jaw, ANGLES[index]);
  const deg = jaw === 'U' ? -ANGLES[index] - 90 : ANGLES[index] - 90;
  const look = toothLook(c, status, selected);

  // Pop when a tooth comes in; gentle breathing while it's "due".
  const scale = useSharedValue(1);
  const glow = useSharedValue(1);
  const prev = useSharedValue(status);
  useEffect(() => {
    if (status === 'in' && prev.value !== 'in') {
      scale.value = withSequence(
        withTiming(1.3, { duration: 140, easing: motion.ease, reduceMotion: ReduceMotion.System }),
        withTiming(1, { duration: 260, easing: motion.ease, reduceMotion: ReduceMotion.System }),
      );
    }
    prev.value = status;
    if (status === 'due' && !reduce) {
      glow.value = withRepeat(withSequence(withTiming(0.55, { duration: 1100 }), withTiming(1, { duration: 1100 })), -1);
    } else {
      cancelAnimation(glow);
      glow.value = 1;
    }
  }, [status, reduce, scale, glow, prev]);
  const a = useAnimatedStyle(() => ({ opacity: glow.value, transform: [{ rotate: `${deg}deg` }, { scale: scale.value * (selected ? 1.12 : 1) }] }));

  return (
    <PressableScale
      scaleTo={0.9}
      accessibilityRole="button"
      accessibilityLabel={`${toothName(jaw, kind, lang)} (${strings[lang].side[side]})`}
      accessibilityState={{ selected }}
      hitSlop={4}
      onPress={() => {
        haptic.tap();
        sel.set(id);
      }}
      style={{ position: 'absolute', left: x - size / 2, top: y - size / 2, width: size, height: size }}>
      <Animated.View style={[{ width: size, height: size }, a]}>
        <Svg width={size} height={size} viewBox="2 1 20 22">
          <Path d={TOOTH_PATH} fill={look.fill} fillOpacity={look.fillOpacity} stroke={look.stroke} strokeWidth={look.width} strokeDasharray={look.dash} strokeLinejoin="round" opacity={look.opacity} />
        </Svg>
      </Animated.View>
    </PressableScale>
  );
}

/* tiny shared selection store for this screen */
let selectedId = 'U-c-R';
const listeners = new Set<(id: string) => void>();
function useSelected() {
  const [id, setId] = useState(selectedId);
  useEffect(() => {
    listeners.add(setId);
    return () => void listeners.delete(setId);
  }, []);
  return {
    id,
    set: (next: string) => {
      selectedId = next;
      listeners.forEach((l) => l(next));
    },
  };
}

function Arch({ jaw }: { jaw: Jaw }) {
  const { c } = useTheme();
  return (
    <View style={{ width: W, height: H }}>
      <Svg width={W} height={H} style={{ position: 'absolute' }}>
        <Path d={GUM[jaw]} stroke={c.gumEdge} strokeWidth={50} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <Path d={GUM[jaw]} stroke={c.gum} strokeWidth={44} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </Svg>
      {ARCH.map(({ kind, side }, i) => (
        <ChartTooth key={`${kind}-${side}`} jaw={jaw} kind={kind} side={side} index={i} />
      ))}
    </View>
  );
}

export default function Teeth() {
  const { c } = useTheme();
  const { t, lang, name, age, erupted, toggleTooth } = useStore();
  const sel = useSelected();
  const [sj, sk, ss] = sel.id.split('-') as [Jaw, Kind, Side];
  const status = statusOf(sj, sk, ss, age, erupted);
  const isIn = !!erupted[sel.id];
  const mint = tint(c, 'mint');
  const sky = tint(c, 'sky');
  const tag =
    status === 'in' ? { bg: mint.bg, fg: mint.fg, label: t.legIn } : status === 'due' ? { bg: c.accentSoft, fg: c.accentText, label: t.legDue } : { bg: c.surfaceAlt, fg: c.textMuted, label: t.legNot };

  const tl = timeline();
  const hereIdx = tl.findIndex((x) => x.r[0] > age); // marker goes before this row

  return (
    <Screen title={t.teethTitle} subtitle={t.teethSub}>
      <Card index={1} style={{ alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 18 }}>
        <Eyebrow color={c.textMuted}>{t.upper}</Eyebrow>
        <Arch jaw="U" />
        <View style={{ height: 14 }} />
        <Arch jaw="L" />
        <Eyebrow color={c.textMuted}>{t.lower}</Eyebrow>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16, marginTop: 10 }}>
          {(['in', 'due', 'not'] as Status[]).map((st) => {
            const l = toothLook(c, st, false);
            return (
              <View key={st} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Svg width={16} height={16} viewBox="2 1 20 22">
                  <Path d={TOOTH_PATH} fill={st === 'not' ? c.gum : l.fill} stroke={l.stroke} strokeWidth={2} strokeDasharray={l.dash} />
                </Svg>
                <T style={{ fontSize: 12, color: c.textMuted }}>{st === 'in' ? t.legIn : st === 'due' ? t.legDue : t.legNot}</T>
              </View>
            );
          })}
        </View>
      </Card>

      {/* Selected tooth */}
      <Card index={2} style={{ gap: 16 }}>
        <Animated.View key={sel.id + lang} entering={FadeIn.duration(motion.base)} style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <View style={{ width: 60, height: 60, borderRadius: 20, borderCurve: 'continuous', backgroundColor: c.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
            <ToothIcon size={36} color={isIn ? c.enamelEdge : c.accent} fill={c.enamel} strokeWidth={1.4} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <T style={{ fontFamily: fonts.display, fontSize: 19 }}>{toothName(sj, sk, lang)}</T>
            <T style={{ fontSize: 14, color: c.textMuted }}>
              {t.usually} {range(toothAges[sj][sk], t.unit)}
            </T>
          </View>
          <View style={{ paddingVertical: 6, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: tag.bg }}>
            <T style={{ fontSize: 12, fontFamily: fonts.bold, color: tag.fg }}>{tag.label}</T>
          </View>
        </Animated.View>
        <Button
          kind={isIn ? 'soft' : 'primary'}
          label={isIn ? t.markOut : t.markIn}
          onPress={() => {
            isIn ? haptic.soft() : haptic.success();
            toggleTooth(sel.id);
          }}
        />
      </Card>

      {/* Timeline */}
      <Card index={3} style={{ gap: 4 }}>
        <H2 style={{ marginBottom: 8 }}>{t.orderTitle}</H2>
        {tl.map((x, i) => {
          const now = age >= x.r[0] && age <= x.r[1];
          const past = age > x.r[1];
          return (
            <View key={x.jaw + x.kind}>
              {i === hereIdx ? <HereMarker label={fill(t.youAreHere, { name })} /> : null}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 46 }}>
                <View style={{ width: 22, alignItems: 'center', alignSelf: 'stretch' }}>
                  <View style={{ position: 'absolute', top: i === 0 ? 23 : 0, bottom: i === tl.length - 1 ? 23 : 0, width: 2, backgroundColor: c.track }} />
                  <View style={{ marginTop: 16, width: 14, height: 14, borderRadius: 7, backgroundColor: now ? c.accent : past ? c.enamelEdge : c.surface, borderWidth: 2, borderColor: now ? c.accent : past ? c.enamelEdge : c.track }} />
                </View>
                <T style={{ flex: 1, fontSize: 15, fontFamily: now ? fonts.semi : fonts.body, color: past ? c.textMuted : c.text }}>{toothName(x.jaw, x.kind, lang)}</T>
                <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: now ? c.accentSoft : 'transparent' }}>
                  <T style={{ fontSize: 13, fontFamily: fonts.semi, color: now ? c.accentText : c.textMuted, fontVariant: ['tabular-nums'] }}>{range(x.r, t.unit)}</T>
                </View>
              </View>
            </View>
          );
        })}
        {hereIdx === -1 ? <HereMarker label={fill(t.youAreHere, { name })} /> : null}
      </Card>

      {/* Facts */}
      <Animated.View entering={enter(4)} style={{ gap: 10 }}>
        <H2>{t.factsTitle}</H2>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} snapToInterval={262} decelerationRate="fast" style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
          {facts[lang].map((f, i) => (
            <View key={f} style={{ width: 250, padding: 18, gap: 10, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: sky.bg }}>
              <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
                <T style={{ fontFamily: fonts.display, fontSize: 16, color: sky.fg }}>{i + 1}</T>
              </View>
              <T style={{ fontSize: 15, lineHeight: 22, color: sky.fg }}>{f}</T>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </Screen>
  );
}

function HereMarker({ label }: { label: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginVertical: 6 }}>
      <View style={{ flex: 1, height: 2, borderRadius: 1, backgroundColor: c.accent }} />
      <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: c.accent }}>
        <T style={{ fontSize: 12, fontFamily: fonts.bold, color: c.onAccent }}>{label}</T>
      </View>
      <View style={{ width: 16, height: 2, borderRadius: 1, backgroundColor: c.accent }} />
    </View>
  );
}
