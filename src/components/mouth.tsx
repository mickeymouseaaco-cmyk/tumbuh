import { useEffect, useMemo, useState } from 'react';
import { View, useWindowDimensions } from 'react-native';
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
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';

import { Button, Eyebrow, PressableScale, T } from '@/components/ui';
import { strings, toothAges, toothId, toothName, type Jaw, type Kind, type Side } from '@/lib/content';
import { haptic } from '@/lib/haptics';
import {
  AH,
  ANGLES,
  CROWN,
  MW,
  archPoint,
  boxFor,
  crownDetail,
  crownPath,
  crownRotation,
  gumPath,
  palatePath,
  rugaePaths,
  tongueGroove,
  tonguePath,
} from '@/lib/mouth-geometry';
import { useStore } from '@/lib/store';
import { ARCH, range, statusOf, type Status } from '@/lib/teeth';
import { fonts, motion, radius, useTheme } from '@/theme';

const GAP = 22;
export const mouthHeight = (s: number) => (AH * 2 + GAP) * s;

/* ---------- One tooth ---------- */

function Crown({ kind, status, s }: { kind: Kind; status: Status; s: number }) {
  const { c } = useTheme();
  const box = boxFor(kind);
  const { w, d } = CROWN[kind];
  const vb = `${-box / 2} ${-box / 2} ${box} ${box}`;
  const id = `e-${kind}`;
  return (
    <Svg width={box * s} height={box * s} viewBox={vb}>
      <Defs>
        <RadialGradient id={id} cx="35%" cy="30%" r="90%">
          <Stop offset="0" stopColor={c.enamel} />
          <Stop offset="1" stopColor={c.enamel2} />
        </RadialGradient>
        <RadialGradient id={`sw-${kind}`} cx="40%" cy="35%" r="80%">
          <Stop offset="0" stopColor="#FFD3DD" />
          <Stop offset="1" stopColor={c.swollen} />
        </RadialGradient>
      </Defs>
      {status === 'in' ? (
        <G>
          <Path d={crownPath(kind)} fill={c.gumDeep} opacity={0.55} transform="translate(0 1.8)" />
          <Path d={crownPath(kind)} fill={`url(#${id})`} stroke={c.enamelEdge} strokeWidth={0.7} />
          {crownDetail(kind).map((p) => (
            <Path key={p} d={p} stroke={c.enamelEdge} strokeWidth={0.9} fill="none" strokeLinecap="round" opacity={0.7} />
          ))}
          <Ellipse cx={-w * 0.18} cy={-d * 0.12} rx={w * 0.16} ry={d * 0.1} fill="#FFFFFF" opacity={0.85} />
        </G>
      ) : status === 'due' ? (
        <G>
          <Ellipse rx={w * 0.58} ry={d * 0.64} fill={`url(#sw-${kind})`} />
          <Ellipse rx={w * 0.58} ry={d * 0.64} fill="none" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={0.8} />
          <Path d={crownPath(kind)} transform="scale(0.46)" fill={c.enamel} opacity={0.95} />
        </G>
      ) : (
        // still under the gum: a darker tooth-shaped shadow, so it never reads as plain gum
        <G>
          <Path d={crownPath(kind)} transform="scale(0.86)" fill={c.palateDeep} opacity={0.55} />
          <Path d={crownPath(kind)} transform="scale(0.86)" fill="none" stroke={c.gumDeep} strokeWidth={1.1} strokeDasharray="2 1.6" opacity={0.9} />
        </G>
      )}
    </Svg>
  );
}

function MouthTooth({ jaw, kind, side, index, s, selected, onSelect }: { jaw: Jaw; kind: Kind; side: Side; index: number; s: number; selected: boolean; onSelect: (id: string) => void }) {
  const { c } = useTheme();
  const { lang, age, erupted } = useStore();
  const reduce = useReducedMotion();
  const id = toothId(jaw, kind, side);
  const status = statusOf(jaw, kind, side, age, erupted);
  const box = boxFor(kind);
  const p = archPoint(jaw, ANGLES[index]);
  const rot = crownRotation(jaw, ANGLES[index]);

  // The crown rises out of the gum when it's marked; the gum glows softly while a tooth is due.
  const grow = useSharedValue(1);
  const halo = useSharedValue(0);
  const last = useSharedValue<Status>(status);
  useEffect(() => {
    if (status === 'in' && last.value !== 'in') {
      grow.value = 0.35;
      grow.value = withSequence(
        withTiming(1.14, { duration: 260, easing: motion.ease, reduceMotion: ReduceMotion.System }),
        withTiming(1, { duration: 220, easing: motion.ease, reduceMotion: ReduceMotion.System }),
      );
    }
    last.value = status;
    if (status === 'due') {
      halo.value = reduce ? 0.6 : withRepeat(withSequence(withTiming(0.85, { duration: 1200 }), withTiming(0.25, { duration: 1200 })), -1);
    } else {
      cancelAnimation(halo);
      halo.value = withTiming(0, { duration: 200 });
    }
  }, [status, reduce, grow, halo, last]);

  const crownStyle = useAnimatedStyle(() => ({ transform: [{ rotate: `${rot}deg` }, { scale: grow.value }] }));
  const haloStyle = useAnimatedStyle(() => ({ opacity: halo.value }));
  const size = box * s;

  return (
    <PressableScale
      scaleTo={0.9}
      accessibilityRole="button"
      accessibilityLabel={`${toothName(jaw, kind, lang)} (${strings[lang].side[side]})`}
      accessibilityState={{ selected }}
      onPress={() => {
        haptic.tap();
        onSelect(id);
      }}
      style={{ position: 'absolute', left: (p.x - box / 2) * s, top: (p.y - box / 2) * s, width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[
          { position: 'absolute', width: size * 0.95, height: size * 0.95, borderRadius: size, backgroundColor: 'rgba(255,122,176,0.35)', boxShadow: `0 0 ${16 * s}px ${c.glow}` },
          haloStyle,
        ]}
      />
      {selected ? (
        <Animated.View
          entering={FadeIn.duration(160)}
          style={{ position: 'absolute', width: size * 0.98, height: size * 0.98, borderRadius: size, borderWidth: 2, borderColor: c.accent, boxShadow: `0 0 ${14 * s}px ${c.glow}` }}
        />
      ) : null}
      <Animated.View style={[{ width: size, height: size }, crownStyle]}>
        <Crown kind={kind} status={status} s={s} />
      </Animated.View>
    </PressableScale>
  );
}

/* ---------- One arch: gum, palate or tongue, and its 10 teeth ---------- */

function Arch({ jaw, s, selected, onSelect }: { jaw: Jaw; s: number; selected: string; onSelect: (id: string) => void }) {
  const { c } = useTheme();
  const gum = useMemo(() => gumPath(jaw), [jaw]);
  return (
    <View style={{ width: MW * s, height: AH * s }}>
      <Svg width={MW * s} height={AH * s} viewBox={`0 0 ${MW} ${AH}`} style={{ position: 'absolute' }}>
        <Defs>
          <LinearGradient id={`g${jaw}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={jaw === 'U' ? c.gumHi : c.gum} />
            <Stop offset="1" stopColor={jaw === 'U' ? c.gum : c.gumHi} />
          </LinearGradient>
          <RadialGradient id="pal" cx="50%" cy="20%" r="90%">
            <Stop offset="0" stopColor={c.palate} />
            <Stop offset="1" stopColor={c.palateDeep} />
          </RadialGradient>
          <RadialGradient id="ton" cx="50%" cy="75%" r="90%">
            <Stop offset="0" stopColor={c.tongue} />
            <Stop offset="1" stopColor={c.tongueDeep} />
          </RadialGradient>
        </Defs>
        {jaw === 'U' ? (
          <G>
            <Path d={palatePath()} fill="url(#pal)" />
            {rugaePaths().map((p) => (
              <Path key={p} d={p} stroke="#E07C93" strokeWidth={2.2} fill="none" strokeLinecap="round" opacity={0.55} />
            ))}
          </G>
        ) : (
          <G>
            <Path d={tonguePath()} fill="url(#ton)" />
            <Path d={tongueGroove()} stroke={c.tongueDeep} strokeWidth={2.5} fill="none" strokeLinecap="round" opacity={0.6} />
          </G>
        )}
        <Path d={gum} stroke={c.gumDeep} strokeWidth={54} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d={gum} stroke={`url(#g${jaw})`} strokeWidth={48} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d={gum} stroke="#FFFFFF" strokeWidth={10} fill="none" strokeLinecap="round" opacity={0.1} transform={`translate(0 ${jaw === 'U' ? -6 : 6})`} />
      </Svg>
      {ARCH.map(({ kind, side }, i) => {
        const id = toothId(jaw, kind, side);
        return <MouthTooth key={id} jaw={jaw} kind={kind} side={side} index={i} s={s} selected={selected === id} onSelect={onSelect} />;
      })}
    </View>
  );
}

/** The whole open mouth, upper arch above lower, on a soft cavity glow. */
export function MouthView({ s, selected, onSelect }: { s: number; selected: string; onSelect: (id: string) => void }) {
  const { c } = useTheme();
  const w = MW * s;
  const h = mouthHeight(s);
  return (
    <View style={{ width: w, height: h, alignItems: 'center' }}>
      <Svg width={w * 1.3} height={h * 1.1} viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', left: -w * 0.15, top: -h * 0.05 }}>
        <Defs>
          <RadialGradient id="cav" cx="50" cy="50" r="50" gradientUnits="userSpaceOnUse">
            <Stop offset="0" stopColor="#6A1730" stopOpacity="0.9" />
            <Stop offset="0.6" stopColor={c.cavity} stopOpacity="0.75" />
            <Stop offset="1" stopColor={c.cavity} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx="50" cy="50" r="50" fill="url(#cav)" />
      </Svg>
      <Arch jaw="U" s={s} selected={selected} onSelect={onSelect} />
      <View style={{ height: GAP * s }} />
      <Arch jaw="L" s={s} selected={selected} onSelect={onSelect} />
    </View>
  );
}

/* ---------- Mouth + legend + tooth detail, used on the Teeth tab and inside the zoom ---------- */

export function MouthExplorer({ maxWidth }: { maxWidth?: number }) {
  const { c } = useTheme();
  const { t, lang, age, erupted, toggleTooth } = useStore();
  const { width } = useWindowDimensions();
  const [sel, setSel] = useState('U-c-R');
  const avail = Math.min(maxWidth ?? width, 560) - 40;
  const s = Math.max(0.8, Math.min(1.25, avail / MW));

  const [sj, sk, ss] = sel.split('-') as [Jaw, Kind, Side];
  const status = statusOf(sj, sk, ss, age, erupted);
  const isIn = !!erupted[sel];
  const tag =
    status === 'in'
      ? { bg: c.mint, fg: c.onMint, label: t.legIn }
      : status === 'due'
        ? { bg: c.accentSoft, fg: c.accentText, label: t.legDue }
        : { bg: c.surfaceAlt, fg: c.textMuted, label: t.legNot };

  return (
    <View style={{ gap: 16, alignItems: 'center' }}>
      <Eyebrow color={c.textMuted}>{t.upper}</Eyebrow>
      <MouthView s={s} selected={sel} onSelect={setSel} />
      <Eyebrow color={c.textMuted}>{t.lower}</Eyebrow>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
        {(['in', 'due', 'not'] as Status[]).map((st) => (
          <View key={st} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.gum, alignItems: 'center', justifyContent: 'center', boxShadow: st === 'due' ? `0 0 10px ${c.glow}` : undefined }}>
              <Crown kind="c" status={st} s={0.5} />
            </View>
            <T style={{ fontSize: 12, color: c.textMuted }}>{st === 'in' ? t.legIn : st === 'due' ? t.legDue : t.legNot}</T>
          </View>
        ))}
      </View>

      <View style={{ alignSelf: 'stretch', gap: 14, padding: 18, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
        <Animated.View key={sel + lang} entering={FadeIn.duration(motion.base)} style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
          <View style={{ width: 58, height: 58, borderRadius: 20, borderCurve: 'continuous', backgroundColor: c.gum, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            <Crown kind={sk} status={status} s={58 / boxFor(sk)} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <T style={{ fontFamily: fonts.display, fontSize: 18 }}>{toothName(sj, sk, lang)}</T>
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
            toggleTooth(sel);
          }}
        />
      </View>
    </View>
  );
}
