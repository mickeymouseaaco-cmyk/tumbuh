import { router } from 'expo-router';
import { ArrowRight, BookOpen, CalendarHeart, Camera, RotateCcw, Check, Lightbulb, Minus, PartyPopper, Plus, ZoomIn } from 'lucide-react-native';
import { useEffect, useRef, useState, type ReactNode } from 'react';
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

import { FluorideCard, fluorideIsDue } from '@/components/fluoride-card';
import { TeethHalo, haloFigure } from '@/components/mascot';
import { MouthZoom, type HeadRect } from '@/components/mouth-zoom';
import { BrushReminder } from '@/components/brush-reminder';
import { AppointmentCard, RecentUpdates, useAllRecords } from '@/components/dental-summary';
import { Cartoon } from '@/components/cartoon';
import { KidSwitcher } from '@/components/kid-switcher';
import { Card, Eyebrow, H2, PressableScale, ProgressBar, Screen, T, ToothIcon, enter } from '@/components/ui';
import { dueBrushing } from '@/lib/reminders';
import { checklist, fill, learn, learnCards, tipFor, topicMeta, topicsForAge } from '@/lib/content';
import { pickPhoto } from '@/lib/admin';
import { fmt } from '@/lib/fluoride';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { dueAndNext, range } from '@/lib/teeth';
import { fonts, motion, radius, tint, tone, typo, useTheme } from '@/theme';

function greeting(t: { morning: string; noon: string; evening: string; night: string }) {
  const h = new Date().getHours();
  return h < 12 ? t.morning : h < 15 ? t.noon : h < 19 ? t.evening : t.night;
}

const HALO = 232;

/** A small breathing dot that invites a tap. Still when Reduce Motion is on. */
function PulseDot() {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const o = useSharedValue(1);
  useEffect(() => {
    if (!reduce) o.value = withRepeat(withSequence(withTiming(0.25, { duration: 900 }), withTiming(1, { duration: 900 })), -1);
  }, [reduce, o]);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ width: 7, height: 7, borderRadius: 4, backgroundColor: c.accent }, a]} />;
}

function CheckRow({ label, done, onPress }: { label: string; done: boolean; onPress: () => void }) {
  const { c } = useTheme();
  const s = useSharedValue(1);
  useEffect(() => {
    if (!done) return;
    s.value = withSequence(
      withTiming(1.25, { duration: 120, easing: motion.ease, reduceMotion: ReduceMotion.System }),
      withTiming(1, { duration: 220, easing: motion.pop, reduceMotion: ReduceMotion.System }),
    );
  }, [done, s]);
  const pop = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <PressableScale
      scaleTo={0.98}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      onPress={onPress}
      style={{ flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 56, paddingHorizontal: 14, borderRadius: radius.tile, borderCurve: 'continuous', backgroundColor: done ? c.mint : c.surfaceAlt }}>
      <Animated.View
        style={[
          { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: done ? c.onMint : c.surface, borderWidth: done ? 0 : 2, borderColor: c.borderStrong },
          pop,
        ]}>
        {done ? <Check size={16} color={c.ink} strokeWidth={3} /> : null}
      </Animated.View>
      <T style={{ flex: 1, fontFamily: fonts.medium, color: done ? c.onMint : c.text }}>{label}</T>
    </PressableScale>
  );
}

/** A compact shortcut tile: icon, name, and one line of progress. */
function QuickTile({ icon, title, sub, value, color, onPress, index }: { icon: ReactNode; title: string; sub: string; value: number; color: string; onPress: () => void; index: number }) {
  const { c } = useTheme();
  return (
    <Animated.View entering={enter(index)} style={{ flex: 1 }}>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={`${title}. ${sub}`}
        onPress={onPress}
        style={{ gap: 12, padding: 16, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: c.brandSoft, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
          <ArrowRight size={18} color={c.textMuted} strokeWidth={2.2} />
        </View>
        <View style={{ gap: 2 }}>
          <T style={typo.heading}>{title}</T>
          <T style={[typo.caption, { color: c.textMuted }]} numberOfLines={1}>{sub}</T>
        </View>
        <ProgressBar value={value} height={6} color={color} delay={300} />
      </PressableScale>
    </Animated.View>
  );
}

export default function Home() {
  const { c } = useTheme();
  const { t, lang, name, age, addAge, erupted, todayChecks, toggleCheck, gender, setGender, fluoride, learned, brush, photo, setPhoto, records } = useStore();
  const latest = useAllRecords()[0];
  const count = Object.keys(erupted).length;
  const { due, next } = dueAndNext(age, erupted, lang);
  const items = checklist(lang, count > 0 || age >= 6);
  const doneN = items.filter((i) => todayChecks[i.key]).length;
  const allDone = doneN === items.length;
  const ok = tone(c, 'success');
  const butter = tint(c, 'butter');
  const lilac = tint(c, 'lilac');
  // when fluoride is due it moves up, right under the baby
  const fluorideTop = fluorideIsDue(fluoride, count > 0);

  // Learn progress, and the lesson that suits this age best (first one not finished yet)
  const totalCards = topicMeta.reduce((n, m) => n + learnCards[m.id].length, 0);
  const learnedN = topicMeta.reduce((n, m) => n + learnCards[m.id].filter((k) => learned[`${m.id}:${k.v}`]).length, 0);
  const topicDone = (id: string) => learnCards[id].every((k) => learned[`${id}:${k.v}`]);
  const order = topicsForAge(age);
  const lessonId = order.find((id) => !topicDone(id)) ?? order[0];
  const lessonIdx = topicMeta.findIndex((m) => m.id === lessonId);
  const lessonCards = learnCards[lessonId];
  const lessonGot = lessonCards.filter((k) => learned[`${lessonId}:${k.v}`]).length;

  // brushing nudge: re-check the clock every minute
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((x) => x + 1), 60000);
    return () => clearInterval(id);
  }, []);
  const brushNow = dueBrushing(brush, todayChecks);

  // the mascot smiles when today's routine is done
  const mood = allDone ? 'smile' : 'wave';
  const haloRef = useRef<View>(null);
  const [zoom, setZoom] = useState<HeadRect | null>(null);
  const openMouth = () => {
    haptic.soft();
    // fly into the mascot's mouth (the boy's, while both children are shown)
    const f = haloFigure(HALO, gender, mood, photo);
    haloRef.current?.measureInWindow((x, y) =>
      setZoom({ x: x + f.x, y: y + f.y, width: f.width, height: f.height, mouth: f.mouth, gender: gender || 'boy', pose: f.pose, portrait: 'portrait' in f, photo }),
    );
  };

  const step = (d: number) => {
    haptic.tap();
    addAge(d);
  };

  return (
    <Screen title={fill(t.teethOf, { name })} eyebrow={greeting(t)} subtitle={t.helloSub} top={<KidSwitcher />}>
      {/* Hero: the mascot is the focal point; tap to fly into the mouth */}
      <Card index={1} style={{ alignItems: 'center', gap: 14, paddingTop: 18, overflow: 'hidden' }}>
        <View style={{ width: HALO, height: HALO }}>
          <Pressable accessibilityRole="button" accessibilityLabel={fill(t.tapHead, { name })} onPress={openMouth} style={{ alignItems: 'center' }}>
            <View ref={haloRef} collapsable={false}>
              <TeethHalo erupted={erupted} age={age} gender={gender} size={HALO} mood={mood} photo={photo} />
            </View>
          </Pressable>
          {/* use the parent's own photo of this child */}
          <PressableScale
            accessibilityRole="button"
            accessibilityLabel={lang === 'bm' ? `Tukar foto ${name}` : `Change ${name}'s photo`}
            hitSlop={6}
            onPress={async () => {
              haptic.tap();
              const uri = await pickPhoto(480);
              if (uri) {
                setPhoto(uri);
                haptic.success();
              }
            }}
            style={{ position: 'absolute', right: HALO * 0.13, bottom: HALO * 0.13, width: 44, height: 44, borderRadius: 22, backgroundColor: c.accent, borderWidth: 3, borderColor: c.surfaceSolid, alignItems: 'center', justifyContent: 'center' }}>
            <Camera size={19} color={c.onAccent} strokeWidth={2.4} />
          </PressableScale>
        </View>
        {photo ? (
          <PressableScale
            accessibilityRole="button"
            onPress={() => {
              haptic.soft();
              setPhoto(null);
            }}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36, paddingHorizontal: 12 }}>
            <RotateCcw size={14} color={c.textMuted} strokeWidth={2.4} />
            <T style={[typo.caption, { color: c.textMuted }]}>{lang === 'bm' ? 'Guna gambar kartun semula' : 'Use the cartoon again'}</T>
          </PressableScale>
        ) : null}
        {!gender ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['boy', 'girl'] as const).map((g) => (
              <PressableScale
                key={g}
                accessibilityRole="button"
                onPress={() => {
                  haptic.tap();
                  setGender(g);
                }}
                style={{ minHeight: 44, paddingHorizontal: 18, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.border }}>
                <T style={typo.label}>{g === 'boy' ? t.boy : t.girl}</T>
              </PressableScale>
            ))}
          </View>
        ) : null}
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={fill(t.tapHead, { name })}
          onPress={openMouth}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 16, borderRadius: radius.pill, backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.accentBorder }}>
          <PulseDot />
          <ZoomIn size={16} color={c.accentText} strokeWidth={2.2} />
          <T style={[typo.label, { color: c.accentText }]}>{t.peek}</T>
        </PressableScale>

        {/* how many teeth are in */}
        <View style={{ alignSelf: 'stretch', gap: 8, marginTop: 2 }}>
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <Animated.View key={count} entering={FadeInDown.duration(220)}>
              <T style={[typo.number, { color: c.text, fontVariant: ['tabular-nums'] }]}>{count}</T>
            </Animated.View>
            <T style={[typo.label, { color: c.textMuted }]}>{count === 20 ? t.allIn : t.ofTwenty}</T>
          </View>
          <ProgressBar value={count / 20} color={count === 20 ? ok.fg : c.accent} delay={250} />
        </View>

        {/* teeth assessed, and the latest update */}
        <View style={{ alignSelf: 'stretch', flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, gap: 2, padding: 12, borderRadius: radius.tile, backgroundColor: c.surfaceAlt }}>
            <T style={[typo.caption, { color: c.textMuted }]}>{lang === 'bm' ? 'Gigi dirakod' : 'Teeth recorded'}</T>
            <T style={[typo.heading, { fontVariant: ['tabular-nums'] }]}>{Object.keys(records).length}<T style={[typo.caption, { color: c.textMuted }]}> / 20</T></T>
          </View>
          <View style={{ flex: 1.4, gap: 2, padding: 12, borderRadius: radius.tile, backgroundColor: c.surfaceAlt }}>
            <T style={[typo.caption, { color: c.textMuted }]}>{lang === 'bm' ? 'Kemas kini terakhir' : 'Last update'}</T>
            <T style={typo.label} numberOfLines={1}>{latest ? fmt(latest.date, lang) : lang === 'bm' ? 'Belum ada' : 'None yet'}</T>
          </View>
        </View>

        {/* age */}
        <View style={{ alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, paddingLeft: 18, borderRadius: radius.pill, backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.border }}>
          <View>
            <T style={[typo.caption, { color: c.textMuted }]}>{t.ageLabel}</T>
            <T style={{ fontFamily: fonts.display, fontSize: 18, lineHeight: 22, fontVariant: ['tabular-nums'] }}>
              {age} {t.months}
            </T>
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <PressableScale accessibilityRole="button" accessibilityLabel={t.ageDown} disabled={age <= 0} onPress={() => step(-1)} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center', opacity: age <= 0 ? 0.4 : 1 }}>
              <Minus size={20} color={c.text} strokeWidth={2.4} />
            </PressableScale>
            <PressableScale accessibilityRole="button" accessibilityLabel={t.ageUp} disabled={age >= 36} onPress={() => step(1)} style={{ width: 46, height: 46, borderRadius: 23, backgroundColor: c.surface, borderWidth: 1, borderColor: c.borderStrong, alignItems: 'center', justifyContent: 'center', opacity: age >= 36 ? 0.4 : 1 }}>
              <Plus size={20} color={c.text} strokeWidth={2.4} />
            </PressableScale>
          </View>
        </View>
      </Card>
      <MouthZoom origin={zoom} onClose={() => setZoom(null)} />
      {fluorideTop ? <FluorideCard index={2} /> : null}

      {/* Shortcuts, each with its own progress */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <QuickTile
          index={2}
          icon={<ToothIcon size={22} color={c.onBrandSoft} strokeWidth={2} />}
          title={t.quickChart}
          sub={fill(t.markedCount, { n: count })}
          value={count / 20}
          color={c.accent}
          onPress={() => router.navigate('/teeth')}
        />
        <QuickTile
          index={3}
          icon={<BookOpen size={20} color={c.onBrandSoft} strokeWidth={2} />}
          title={t.quickLearn}
          sub={fill(t.cardsCount, { n: learnedN, m: totalCards })}
          value={learnedN / totalCards}
          color={ok.fg}
          onPress={() => router.navigate('/learn')}
        />
      </View>

      {/* Coming in now */}
      <Animated.View entering={enter(4)} style={{ gap: 12, marginTop: 6 }}>
        <H2>{t.nowTitle}</H2>
        {due.length ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }} style={{ marginHorizontal: -20 }}>
            {due.map((d) => (
              <View key={d.name} style={{ width: 156, padding: 14, gap: 10, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.accentBorder }}>
                <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
                  <ToothIcon size={26} color={c.accentText} fill={c.enamel} />
                </View>
                <T style={[typo.label, { lineHeight: 19, color: c.text }]} numberOfLines={2}>{d.name}</T>
                <T style={[typo.caption, { color: c.accentText, fontVariant: ['tabular-nums'] }]}>{range(d.r, t.unit)}</T>
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={{ padding: 16, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: ok.bg }}>
            <T style={[typo.bodySm, { color: ok.fg }]}>{t.noDue}</T>
          </View>
        )}
        <T style={[typo.bodySm, { color: c.textMuted }]}>
          <T style={[typo.label, { color: c.text }]}>{t.nextTitle}: </T>
          {next ? `${next.name} · ${range(next.r, t.unit)}` : t.allDone}
        </T>
      </Animated.View>

      {/* Routine */}
      <Card index={5} style={{ gap: 12 }}>
        {brushNow ? (
          <Animated.View entering={FadeIn.duration(motion.base)} layout={LinearTransition.duration(motion.base)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: radius.tile, backgroundColor: c.accentSoft, borderWidth: 1, borderColor: c.accentBorder }}>
            <PulseDot />
            <T style={[typo.label, { flex: 1, color: c.accentText }]}>
              {lang === 'bm'
                ? `Dah masa berus gigi ${brushNow === 'morning' ? 'pagi' : 'sebelum tidur'} ${name}! Tandakan bila siap.`
                : `Time for ${name}'s ${brushNow === 'morning' ? 'morning' : 'bedtime'} brush! Tick it when done.`}
            </T>
          </Animated.View>
        ) : null}
        <View style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <H2>{t.todayTitle}</H2>
            <T style={[typo.label, { color: allDone ? ok.fg : c.textMuted, fontVariant: ['tabular-nums'] }]}>{fill(t.doneCount, { n: doneN })}</T>
          </View>
          <ProgressBar value={doneN / items.length} color={ok.fg} height={6} />
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
            style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: radius.tile, backgroundColor: ok.bg }}>
            <PartyPopper size={22} color={ok.fg} strokeWidth={2} />
            <T style={[typo.label, { flex: 1, color: ok.fg }]}>{t.allDoneToday}</T>
          </Animated.View>
        ) : null}
      </Card>

      <RecentUpdates index={6} />

      <BrushReminder index={6} />

      {!fluorideTop ? <FluorideCard index={6} /> : null}

      {/* For this age: one tip, and the lesson that fits */}
      <Animated.View entering={enter(7)} style={{ borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: butter.bg, borderWidth: 1, borderColor: c.border, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', gap: 14, padding: 18 }}>
          <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Lightbulb size={22} color={butter.fg} strokeWidth={2} />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <Eyebrow color={butter.fg}>{t.tipTitle}</Eyebrow>
            <T style={[typo.body, { color: c.text }]}>{tipFor(age, lang)}</T>
          </View>
        </View>
        <PressableScale
          scaleTo={0.985}
          accessibilityRole="button"
          accessibilityLabel={`${t.openLesson}: ${learn[lang][lessonIdx].title}`}
          onPress={() => router.push({ pathname: '/learn/[id]', params: { id: lessonId } })}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, paddingRight: 18, backgroundColor: c.surface, borderTopWidth: 1, borderTopColor: c.border }}>
          <View style={{ borderRadius: radius.tile, overflow: 'hidden', backgroundColor: c.surfaceAlt }}>
            <Cartoon name={`topic-${lessonId}`} scale={0.62} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <T style={[typo.caption, { color: c.textMuted }]}>{t.forAge}</T>
            <T style={typo.heading} numberOfLines={2}>{learn[lang][lessonIdx].title}</T>
            <T style={[typo.caption, { color: c.textMuted, fontVariant: ['tabular-nums'] }]}>{fill(t.cardsCount, { n: lessonGot, m: lessonCards.length })}</T>
          </View>
          <ArrowRight size={20} color={c.accentText} strokeWidth={2.2} />
        </PressableScale>
      </Animated.View>

      <AppointmentCard index={8} />
    </Screen>
  );
}
