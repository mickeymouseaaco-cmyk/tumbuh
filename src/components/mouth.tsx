import { useEffect, useMemo, useState, type ReactNode } from 'react';
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

import { ToothSheet } from '@/components/tooth-sheet';
import { Eyebrow, PressableScale, T } from '@/components/ui';
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
import { WHO_COLOR, fdi, markerTone } from '@/lib/records';
import { useStore } from '@/lib/store';
import { ARCH, range, statusOf, type Status } from '@/lib/teeth';
import { fonts, motion, tone, useTheme } from '@/theme';

const GAP = 22;
export const mouthHeight = (s: number) => (AH * 2 + GAP) * s;

/* ---------- One tooth ---------- */

/** One crown. `mark` tints the whole tooth (lavender = parent saw something, blue = dentist checked it). */
export function Crown({ kind, status, s, mark }: { kind: Kind; status: Status; s: number; mark?: string | null }) {
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
      {mark ? (
        <Path
          d={crownPath(kind)}
          transform={`scale(${status === 'in' ? 1 : status === 'due' ? 0.62 : 0.86})`}
          fill={mark}
          fillOpacity={status === 'in' ? 0.6 : 0.75}
          stroke={mark}
          strokeWidth={1.6}
        />
      ) : null}
    </Svg>
  );
}

function MouthTooth({ jaw, kind, side, index, s, selected, onSelect }: { jaw: Jaw; kind: Kind; side: Side; index: number; s: number; selected: boolean; onSelect: (id: string) => void }) {
  const { c } = useTheme();
  const { lang, age, erupted, records } = useStore();
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
        withTiming(1, { duration: 260, easing: motion.pop, reduceMotion: ReduceMotion.System }),
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
  // a small dot shows this tooth has records: violet = parent's observation, colour = dentist's finding
  const mark = markerTone(records[id]);
  const markColor = mark ? WHO_COLOR[mark.by] : null;
  const haloStyle = useAnimatedStyle(() => ({ opacity: halo.value }));
  const size = box * s;

  return (
    <PressableScale
      scaleTo={0.9}
      accessibilityRole="button"
      accessibilityLabel={`${toothName(jaw, kind, lang)} (${strings[lang].side[side]}), FDI ${fdi(jaw, kind, side)}`}
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
        // gentle glow around the chosen tooth
        <Animated.View
          entering={FadeIn.duration(160)}
          style={{ position: 'absolute', width: size * 1.02, height: size * 1.02, borderRadius: size, borderWidth: 2, borderColor: c.white, boxShadow: `0 0 ${14 * s}px rgba(255,255,255,0.55)` }}
        />
      ) : null}
      <Animated.View style={[{ width: size, height: size }, crownStyle]}>
        <Crown kind={kind} status={status} s={s} mark={markColor} />
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
  const { t, lang, records } = useStore();
  const { width } = useWindowDimensions();
  const [sel, setSel] = useState<string | null>(null);
  const avail = Math.min(maxWidth ?? width, 560) - 40;
  const s = Math.max(0.8, Math.min(1.25, avail / MW));
  const recorded = Object.keys(records).length;
  const legendItem = (key: string, swatch: ReactNode, label: string) => (
    <View key={key} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {swatch}
      <T style={{ fontFamily: fonts.medium, fontSize: 13, color: c.textMuted }}>{label}</T>
    </View>
  );
  const swatch = (color: string) => (
    <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.gum, alignItems: 'center', justifyContent: 'center' }}>
      <Crown kind="c" status="in" s={0.5} mark={color} />
    </View>
  );

  return (
    <View style={{ gap: 16, alignItems: 'center' }}>
      <T style={{ fontFamily: fonts.medium, fontSize: 14, color: c.textMuted, textAlign: 'center' }}>
        {lang === 'bm' ? 'Tekan mana-mana gigi untuk butiran dan rekod.' : 'Tap any tooth for details and records.'}
      </T>
      <Eyebrow color={c.textMuted}>{t.upper}</Eyebrow>
      <MouthView s={s} selected={sel ?? ''} onSelect={setSel} />
      <Eyebrow color={c.textMuted}>{t.lower}</Eyebrow>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', columnGap: 16, rowGap: 10 }}>
        {(['in', 'due', 'not'] as Status[]).map((st) =>
          legendItem(
            st,
            <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c.gum, alignItems: 'center', justifyContent: 'center', borderWidth: st === 'due' ? 2 : 0, borderColor: c.accent }}>
              <Crown kind="c" status={st} s={0.5} />
            </View>,
            st === 'in' ? t.legIn : st === 'due' ? t.legDue : t.legNot,
          ),
        )}
        {recorded ? legendItem('p', swatch(WHO_COLOR.parent), lang === 'bm' ? 'Pemerhatian ibu bapa' : 'Parent observation') : null}
        {recorded ? legendItem('d', swatch(WHO_COLOR.dentist), lang === 'bm' ? 'Disahkan doktor gigi' : 'Dentist confirmed') : null}
      </View>

      <ToothSheet tooth={sel} onClose={() => setSel(null)} />
    </View>
  );
}
