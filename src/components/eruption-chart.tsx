import { useEffect, useState } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { FadeIn, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { T } from '@/components/ui';
import { toothId, toothName, type Jaw, type Kind } from '@/lib/content';
import { haptic } from '@/lib/haptics';
import { ANGLES, MW, archPoint } from '@/lib/mouth-geometry';
import { useStore } from '@/lib/store';
import { ARCH, range, timeline } from '@/lib/teeth';
import { fonts, motion, radius, useTheme } from '@/theme';

const MAX = 36;
const TICKS = [0, 6, 12, 18, 24, 30, 36];
const ROW = 34;

/** A tiny jaw map with the two teeth of this row lit up — tells "which teeth" without words. */
function MiniArch({ jaw, kind, lit }: { jaw: Jaw; kind: Kind; lit: string }) {
  const { c } = useTheme();
  const k = 40 / MW;
  return (
    <Svg width={42} height={26} viewBox="2 1 36 22">
      {ARCH.map((a, i) => {
        const p = archPoint(jaw, ANGLES[i]);
        const on = a.kind === kind;
        return <Circle key={i} cx={p.x * k} cy={p.y * k} r={on ? 3.1 : 1.9} fill={on ? lit : 'rgba(255,255,255,0.22)'} />;
      })}
    </Svg>
  );
}

function Bar({ left, width, color, glow, delay }: { left: number; width: number; color: string; glow?: string; delay: number }) {
  const g = useSharedValue(0);
  useEffect(() => {
    g.value = withDelay(delay, withTiming(1, { duration: 520, easing: motion.ease }));
  }, [g, delay]);
  const a = useAnimatedStyle(() => ({ transform: [{ scaleX: g.value }] }));
  return (
    <Animated.View
      style={[
        { position: 'absolute', left, width, top: ROW / 2 - 6, height: 12, borderRadius: 6, backgroundColor: color, transformOrigin: 'left center', boxShadow: glow ? `0 0 12px ${glow}` : undefined },
        a,
      ]}
    />
  );
}

/** When each pair of baby teeth usually comes in, as bars on a 0–36 month line, with "now" marked. */
export function EruptionChart() {
  const { c } = useTheme();
  const { t, lang, age, erupted } = useStore();
  const rows = timeline();
  const [tw, setTw] = useState(0);
  const firstNow = rows.findIndex((r) => age >= r.r[0] && age <= r.r[1]);
  const [sel, setSel] = useState(firstNow >= 0 ? firstNow : Math.max(0, rows.findIndex((r) => r.r[0] > age)));
  const x = (m: number) => (Math.min(m, MAX) / MAX) * tw;

  const nowX = useSharedValue(0);
  useEffect(() => {
    nowX.value = withTiming(x(age), { duration: motion.base, easing: motion.ease });
  }, [age, tw]); // eslint-disable-line react-hooks/exhaustive-deps
  const nowStyle = useAnimatedStyle(() => ({ transform: [{ translateX: nowX.value }] }));

  const pick = rows[sel] ?? rows[0];

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row' }}>
        {/* left: which teeth */}
        <View style={{ width: 50, paddingTop: 22 }}>
          {rows.map((r) => (
            <View key={r.jaw + r.kind} style={{ height: ROW, justifyContent: 'center' }}>
              <MiniArch jaw={r.jaw} kind={r.kind} lit={c.accent} />
            </View>
          ))}
        </View>

        {/* right: when */}
        <View style={{ flex: 1 }} onLayout={(e) => setTw(e.nativeEvent.layout.width)}>
          <View style={{ height: 22 }} />
          {tw > 0 &&
            rows.map((r, i) => {
              const now = age >= r.r[0] && age <= r.r[1];
              const both = erupted[toothId(r.jaw, r.kind, 'R')] && erupted[toothId(r.jaw, r.kind, 'L')];
              const color = both ? c.onMint : now ? c.accent : age > r.r[1] ? 'rgba(127,240,220,0.45)' : 'rgba(255,255,255,0.20)';
              return (
                <Pressable
                  key={r.jaw + r.kind}
                  accessibilityRole="button"
                  accessibilityLabel={`${toothName(r.jaw, r.kind, lang)}, ${range(r.r, t.unit)}`}
                  onPress={() => {
                    haptic.tap();
                    setSel(i);
                  }}
                  style={{ height: ROW, borderRadius: radius.mark, backgroundColor: sel === i ? 'rgba(255,255,255,0.06)' : 'transparent' }}>
                  {TICKS.map((m) => (
                    <View key={m} style={{ position: 'absolute', left: x(m), top: 0, bottom: 0, width: 1, backgroundColor: c.line }} />
                  ))}
                  <Bar left={x(r.r[0])} width={x(r.r[1]) - x(r.r[0])} color={color} glow={now ? c.glow : undefined} delay={i * 50} />
                </Pressable>
              );
            })}
          {/* now line */}
          {tw > 0 ? (
            <Animated.View style={[{ position: 'absolute', top: 0, bottom: 0, left: 0, alignItems: 'center', width: 0, pointerEvents: 'none' }, nowStyle]}>
              <View style={{ position: 'absolute', top: 0, paddingHorizontal: 8, height: 20, borderRadius: 10, backgroundColor: c.accent, justifyContent: 'center', boxShadow: `0 0 12px ${c.glow}` }}>
                <T style={{ fontSize: 11, fontFamily: fonts.bold, color: c.onAccent, fontVariant: ['tabular-nums'] }}>
                  {age} {t.unit}
                </T>
              </View>
              <View style={{ position: 'absolute', top: 20, bottom: 0, width: 2, borderRadius: 1, backgroundColor: c.accent, boxShadow: `0 0 8px ${c.glow}` }} />
            </Animated.View>
          ) : null}
        </View>
      </View>

      {/* axis */}
      <View style={{ flexDirection: 'row' }}>
        <View style={{ width: 50 }} />
        <View style={{ flex: 1, height: 16 }}>
          {tw > 0 &&
            TICKS.map((m) => (
              <T key={m} style={{ position: 'absolute', left: x(m) - 10, width: 20, textAlign: 'center', fontSize: 11, color: c.textMuted, fontVariant: ['tabular-nums'] }}>
                {m}
              </T>
            ))}
        </View>
      </View>
      <T style={{ fontSize: 11, color: c.textMuted, textAlign: 'right' }}>{t.months}</T>

      {/* the row you tapped */}
      <Animated.View key={sel + lang} entering={FadeIn.duration(motion.base)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, borderRadius: radius.tile, backgroundColor: c.surfaceAlt }}>
        <MiniArch jaw={pick.jaw} kind={pick.kind} lit={c.accent} />
        <T style={{ flex: 1, fontFamily: fonts.semi, fontSize: 14 }}>{toothName(pick.jaw, pick.kind, lang)}</T>
        <T style={{ fontFamily: fonts.bold, fontSize: 14, color: c.accentText, fontVariant: ['tabular-nums'] }}>{range(pick.r, t.unit)}</T>
      </Animated.View>
    </View>
  );
}
