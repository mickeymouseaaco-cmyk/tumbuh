import { CircleCheck, Siren, Stethoscope, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, View } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

import { Bullet, Chevron, Disclaimer, Eyebrow, PressableScale, Screen, T, enter } from '@/components/ui';
import { problems, urgentList, type Tag } from '@/lib/content';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { fonts, motion, radius, tint, useTheme } from '@/theme';

type Filter = 'all' | Tag;
const layout = LinearTransition.duration(motion.base).easing(motion.ease);

export default function Problems() {
  const { c } = useTheme();
  const { t, lang } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<Record<string, boolean>>({ ecc: true });

  const rose = tint(c, 'rose');
  const sky = tint(c, 'sky');
  const tags: Record<Tag, { tint: ReturnType<typeof tint>; label: string; Icon: typeof Siren }> = {
    ok: { tint: tint(c, 'mint'), label: t.fOk, Icon: CircleCheck },
    check: { tint: tint(c, 'butter'), label: t.fCheck, Icon: Stethoscope },
    urgent: { tint: rose, label: t.fUrgent, Icon: Siren },
  };
  const filters: [Filter, string][] = [['all', t.fAll], ['ok', t.fOk], ['check', t.fCheck], ['urgent', t.fUrgent]];
  const list = problems.filter((p) => filter === 'all' || p.tag === filter);

  return (
    <Screen title={t.probTitle} subtitle={t.probSub}>
      <Animated.View entering={enter(1)} style={{ padding: 18, gap: 10, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: rose.bg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 40, height: 40, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
            <Siren size={21} color={rose.fg} strokeWidth={2} />
          </View>
          <T style={{ flex: 1, fontFamily: fonts.display, fontSize: 18, color: rose.fg }}>{t.urgentTitle}</T>
        </View>
        {urgentList[lang].map((u) => (
          <Bullet key={u} dot={rose.fg} color={rose.fg}>{u}</Bullet>
        ))}
      </Animated.View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}>
        {filters.map(([k, label]) => {
          const on = filter === k;
          return (
            <PressableScale
              key={k}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => {
                if (!on) haptic.tap();
                setFilter(k);
              }}
              style={{ minHeight: 44, paddingHorizontal: 16, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: on ? c.text : c.surface, borderWidth: on ? 0 : 1, borderColor: c.border }}>
              <T style={{ fontSize: 14, fontFamily: fonts.semi, color: on ? c.bg : c.text }}>{label}</T>
            </PressableScale>
          );
        })}
      </ScrollView>

      {list.map((p) => {
        const isOpen = !!open[p.id];
        const tag = tags[p.tag];
        return (
          <Animated.View
            key={p.id}
            layout={layout}
            entering={FadeIn.duration(motion.base)}
            exiting={FadeOut.duration(140)}
            style={{ backgroundColor: c.surface, borderRadius: radius.card, borderCurve: 'continuous', overflow: 'hidden', boxShadow: `0 4px 18px ${c.shadow}` }}>
            <PressableScale
              scaleTo={0.985}
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              onPress={() => {
                haptic.tap();
                setOpen((o) => ({ ...o, [p.id]: !isOpen }));
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 }}>
              <View style={{ width: 46, height: 46, borderRadius: 16, borderCurve: 'continuous', backgroundColor: tag.tint.bg, alignItems: 'center', justifyContent: 'center' }}>
                <tag.Icon size={22} color={tag.tint.fg} strokeWidth={2} />
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <T style={{ fontFamily: fonts.display, fontSize: 17 }}>{p.title[lang]}</T>
                <T style={{ fontSize: 12, color: c.textMuted }}>
                  <T style={{ fontSize: 12, fontFamily: fonts.bold, color: tag.tint.fg }}>{tag.label}</T>
                  {'  ·  '}
                  <T style={{ fontSize: 12, fontStyle: 'italic', color: c.textMuted }}>{p.term}</T>
                </T>
              </View>
              <Chevron open={isOpen} />
            </PressableScale>
            {isOpen ? (
              <Animated.View entering={FadeIn.duration(motion.base).delay(60)} style={{ gap: 12, paddingHorizontal: 16, paddingBottom: 16 }}>
                <View style={{ gap: 4 }}>
                  <Eyebrow color={c.textMuted}>{t.looks}</Eyebrow>
                  <T style={{ lineHeight: 23 }}>{p.looks[lang]}</T>
                </View>
                <View style={{ gap: 4, padding: 14, borderRadius: radius.tile, borderCurve: 'continuous', backgroundColor: tag.tint.bg }}>
                  <Eyebrow color={tag.tint.fg}>{t.todo}</Eyebrow>
                  <T style={{ lineHeight: 23, color: tag.tint.fg }}>{p.todo[lang]}</T>
                </View>
              </Animated.View>
            ) : null}
          </Animated.View>
        );
      })}

      <Animated.View layout={layout} style={{ flexDirection: 'row', gap: 14, padding: 18, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: sky.bg }}>
        <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.surface, alignItems: 'center', justifyContent: 'center' }}>
          <Phone size={21} color={sky.fg} strokeWidth={2} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <T style={{ fontFamily: fonts.display, fontSize: 17, color: sky.fg }}>{t.callTitle}</T>
          <T style={{ fontSize: 14, lineHeight: 21, color: sky.fg }}>{t.callBody}</T>
        </View>
      </Animated.View>
      <Disclaimer />
    </Screen>
  );
}
