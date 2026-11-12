import { router } from 'expo-router';
import { ArrowRight, CalendarHeart, Check, Lightbulb, Minus, PartyPopper, Plus, ZoomIn } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  LinearTransition,
  ReduceMotion,
  useAnimatedStyle,
  useReducedMotion,
  withRepeat,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { PORTRAIT_INSET, TeethHalo } from '@/components/mascot';
import { MouthZoom, type HeadRect } from '@/components/mouth-zoom';
import { Card, Display, Eyebrow, H2, PressableScale, Screen, T, ToothIcon, enter } from '@/components/ui';
import { checklist, fill, tipFor } from '@/lib/content';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { dueAndNext, range } from '@/lib/teeth';
import { fonts, motion, radius, tint, useTheme } from '@/theme';

function greeting(t: { morning: string; noon: string; evening: string; night: string }) {
  const h = new Date().getHours();
  return h < 12 ? t.morning : h < 15 ? t.noon : h < 19 ? t.evening : t.night;
}

const HALO = 210;

/** A small breathing dot that invites a tap. Still when Reduce Motion is on. */
function PulseDot() {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const o = useSharedValue(1);
  useEffect(() => {
    if (!reduce) o.value = withRepeat(withSequence(withTiming(0.25, { duration: 900 }), withTiming(1, { duration: 900 })), -1);
  }, [reduce, o]);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.accent, boxShadow: `0 0 8px ${c.glow}` }, a]} />;
}

function CheckRow({ label, done, onPress }: { label: string; done: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const s = useSharedValue(1);
  useEffect(() => {
    if (!done) return;
    s.value = withSequence(
      withTiming(1.25, { duration: 120, easing: motion.ease, reduceMotion: ReduceMotion.System }),
      withTiming(1, { duration: 220, easing: motion.ease, reduceMotion: ReduceMotion.System }),
    );
  }, [done, s]);
  const pop = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <PressableScale
      scaleTo={0.98}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 56, paddingHorizontal: 14, borderRadius: radius.tile, borderCurve: 'continuous', backgroundColor: done ? c.accentSoft : c.surfaceAlt }}>
      <Animated.View
        style={[
          { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? c.accent : c.surface, borderWidth: done ? 0 : 2, borderColor: c.border },
          pop,
        ]}>
        {done ? <Check size={16} color={c.onAccent} strokeWidth={3} /> : null}
      </Animated.View>
      <T style={{ flex: 1, fontFamily: fonts.medium, color: done ? c.accentText : c.text, textDecorationLine: done ? 'line-through' : 'none' }}>{label}</T>
    </PressableScale>
  );
}

export default function Home() {
  const { c } = useTheme();
  const { t, lang, name, age, addAge, erupted, todayChecks, toggleCheck, gender, setGender } = useStore();
  const count = Object.keys(erupted).length;
  const { due, next } = dueAndNext(age, erupted, lang);
  const items = checklist(lang, count > 0 || age >= 6);
  const doneN = items.filter((i) => todayChecks[i.key]).length;
  const allDone = doneN === items.length;
  const mint = tint(c, 'mint');
  const butter = tint(c, 'butter');
  const lilac = tint(c, 'lilac');

  const haloRef = useRef<View>(null);
  const [zoom, setZoom] = useState<HeadRect | null>(null);
  const openMouth = () => {
    haptic.soft();
    // The portrait sits PORTRAIT_INSET px inside the halo on every side.
    haloRef.current?.measureInWindow((x, y, w) => setZoom({ x: x + PORTRAIT_INSET, y: y + PORTRAIT_INSET, size: w - PORTRAIT_INSET * 2 }));
  };

  const step = (d: number) => {
    haptic.tap();
    addAge(d);
  };

  return (
    <Screen eyebrow={greeting(t)} title={fill(t.teethOf, { name })} subtitle={t.helloSub}>
      {/* Hero: tap the head to fly into the mouth */}
      <Card index={1} style={{ alignItems: 'center', gap: 6, paddingTop: 22, overflow: 'hidden' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={fill(t.tapHead, { name })}
          onPress={openMouth}
          style={{ alignItems: 'center' }}>
          <View ref={haloRef} collapsable={false}>
            <TeethHalo erupted={erupted} gender={gender} size={HALO} />
          </View>
        </Pressable>
        {!gender ? (
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 4 }}>
            {(['boy', 'girl'] as const).map((g) => (
              <PressableScale
                key={g}
                accessibilityRole="button"
                onPress={() => {
                  haptic.tap();
                  setGender(g);
                }}
                style={{ minHeight: 40, paddingHorizontal: 16, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.border }}>
                <T style={{ fontFamily: fonts.semi, fontSize: 13 }}>{g === 'boy' ? t.boy : t.girl}</T>
              </PressableScale>
            ))}
          </View>
        ) : null}
        <PressableScale
          accessibilityRole="button"
          onPress={openMouth}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: c.accentSoft, borderWidth: 1, borderColor: 'rgba(255,122,176,0.4)' }}>
          <PulseDot />
          <ZoomIn size={15} color={c.accentText} strokeWidth={2.2} />
          <T style={{ fontSize: 13, fontFamily: fonts.semi, color: c.accentText }}>{fill(t.tapHead, { name })}</T>
        </PressableScale>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 10 }}>
          <Animated.View key={count} entering={FadeInDown.duration(220)}>
            <Display style={{ fontSize: 48, lineHeight: 54, color: c.text, fontVariant: ['tabular-nums'], textShadowColor: c.glow, textShadowRadius: 18 }}>{count}</Display>
          </Animated.View>
          <T style={{ fontFamily: fonts.semi, color: c.textMuted }}>{t.ofTwenty}</T>
        </View>
        <View style={{ alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, padding: 8, paddingLeft: 18, borderRadius: radius.pill, backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.border }}>
          <View>
            <T style={{ fontSize: 12, color: c.textMuted }}>{t.ageLabel}</T>
            <T style={{ fontFamily: fonts.bold, fontSize: 17, fontVariant: ['tabular-nums'] }}>
              {age} {t.months}
            </T>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <PressableScale accessibilityRole="button" accessibilityLabel={t.ageDown} onPress={() => step(-1)} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
              <Minus size={20} color={c.text} strokeWidth={2.4} />
            </PressableScale>
            <PressableScale accessibilityRole="button" accessibilityLabel={t.ageUp} onPress={() => step(1)} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: c.accent, boxShadow: `0 0 18px ${c.glow}`, alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={20} color={c.onAccent} strokeWidth={2.6} />
            </PressableScale>
          </View>
        </View>
      </Card>
      <MouthZoom origin={zoom} onClose={() => setZoom(null)} />

      {/* Coming in now */}
      <Animated.View entering={enter(2)} style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <H2>{t.nowTitle}</H2>
          <PressableScale accessibilityRole="button" onPress={() => router.navigate('/teeth')} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 44, paddingLeft: 8 }}>
            <T style={{ fontFamily: fonts.semi, fontSize: 14, color: c.accentText }}>{t.openChart}</T>
            <ArrowRight size={16} color={c.accentText} strokeWidth={2.4} />
          </PressableScale>
        </View>
        {due.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 4 }} style={{ marginHorizontal: -20 }}>
            <View style={{ width: 10 }} />
            {due.map((d) => (
              <View key={d.name} style={{ width: 150, padding: 14, gap: 10, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: mint.bg }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <ToothIcon size={26} color={mint.fg} fill={c.enamel} />
                </View>
                <T style={{ fontFamily: fonts.semi, fontSize: 14, lineHeight: 19, color: mint.fg }} numberOfLines={2}>{d.name}</T>
                <T style={{ fontSize: 13, color: mint.fg }}>{range(d.r, t.unit)}</T>
              </View>
            ))}
            <View style={{ width: 10 }} />
          </ScrollView>
        ) : (
          <View style={{ padding: 16, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: mint.bg }}>
            <T style={{ fontSize: 14, lineHeight: 21, color: mint.fg }}>{t.noDue}</T>
          </View>
        )}
        <T style={{ fontSize: 14, lineHeight: 21, color: c.textMuted }}>
          <T style={{ fontSize: 14, fontFamily: fonts.semi }}>{t.nextTitle}: </T>
          {next ? `${next.name} · ${range(next.r, t.unit)}` : t.allDone}
        </T>
      </Animated.View>

      {/* Routine */}
      <Card index={3} style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
          <H2>{t.todayTitle}</H2>
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: c.surfaceAlt }}>
            <T style={{ fontFamily: fonts.bold, fontSize: 12, color: c.textMuted, fontVariant: ['tabular-nums'] }}>{fill(t.doneCount, { n: doneN })}</T>
          </View>
        </View>
        {items.map((it) => (
          <CheckRow
            key={it.key}
            label={it.label}
            done={!!todayChecks[it.key]}
            onPress={() => {
              const willFinish = !todayChecks[it.key] && doneN === items.length - 1;
              willFinish ? haptic.success() : haptic.tap();
              toggleCheck(it.key);
            }}
          />
        ))}
        {allDone ? (
          <Animated.View
            entering={FadeIn.duration(motion.base)}
            exiting={FadeOut.duration(150)}
            layout={LinearTransition.duration(motion.base)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: radius.tile, backgroundColor: mint.bg }}>
            <PartyPopper size={22} color={mint.fg} strokeWidth={2} />
            <T style={{ flex: 1, fontFamily: fonts.semi, color: mint.fg }}>{t.allDoneToday}</T>
          </Animated.View>
        ) : null}
      </Card>

      {/* Tip */}
      <Animated.View entering={enter(4)} style={{ flexDirection: 'row', gap: 14, padding: 20, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: butter.bg }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Lightbulb size={22} color={butter.fg} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Eyebrow color={butter.fg}>{t.tipTitle}</Eyebrow>
          <T style={{ lineHeight: 23, color: butter.fg }}>{tipFor(age, lang)}</T>
        </View>
      </Animated.View>

      {/* Dentist */}
      <Animated.View entering={enter(5)} style={{ flexDirection: 'row', gap: 14, padding: 20, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: lilac.bg }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
          <CalendarHeart size={22} color={lilac.fg} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <T style={{ fontFamily: fonts.display, fontSize: 17, color: lilac.fg }}>{t.visitTitle}</T>
          <T style={{ fontSize: 14, lineHeight: 21, color: lilac.fg }}>{t.visitBody}</T>
        </View>
      </Animated.View>
    </Screen>
  );
}
