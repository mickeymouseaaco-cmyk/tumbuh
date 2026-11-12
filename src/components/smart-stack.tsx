import { Camera, CircleCheck, Siren, Stethoscope } from 'lucide-react-native';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, PanResponder, Platform, Pressable, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideInUp,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { T } from '@/components/ui';
import type { Problem, Tag } from '@/lib/content';
import { haptic } from '@/lib/haptics';
import { problemPhotos } from '@/lib/photos';
import { useStore } from '@/lib/store';
import { fonts, motion, radius, tint, useTheme, type Tint } from '@/theme';

export const TAG_TINT: Record<Tag, Tint> = { ok: 'mint', check: 'butter', urgent: 'rose' };
export const TAG_ICON = { ok: CircleCheck, check: Stethoscope, urgent: Siren };

/** The photo for a problem, or a soft tinted placeholder until one is added. */
export function ProblemPhoto({ p, height, iconSize = 34 }: { p: Problem; height: number | `${number}%`; iconSize?: number }) {
  const { c } = useTheme();
  const photo = problemPhotos[p.id];
  const tt = tint(c, TAG_TINT[p.tag]);
  if (photo) return <Image source={photo.src} resizeMode="cover" style={{ width: '100%', height }} accessibilityIgnoresInvertColors />;
  return (
    <View style={{ width: '100%', height, backgroundColor: tt.bg, alignItems: 'center', justifyContent: 'center' }}>
      <Camera size={iconSize} color={tt.fg} strokeWidth={1.6} opacity={0.5} />
    </View>
  );
}

/**
 * An iPhone-style Smart Stack: one card at a time, more peeking behind.
 * Swipe up/down to flip (with a little rubber-band), tap a card to open it.
 * Flips on its own every few seconds until you touch it (not with Reduce Motion).
 */
export function SmartStack({
  title,
  items,
  onOpen,
  autoDelay = 0,
}: {
  title: string;
  items: Problem[];
  onOpen: (p: Problem, list: Problem[]) => void;
  autoDelay?: number;
}) {
  const { c } = useTheme();
  const { t, lang } = useStore();
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  const touched = useRef(false);
  const drag = useSharedValue(0);
  const n = items.length;

  const go = (d: 1 | -1) => {
    setDir(d);
    setI((x) => (x + d + n) % n);
    haptic.tap();
  };

  // Gentle auto-rotate, like the iPhone's; stops for good once the person swipes.
  useEffect(() => {
    if (reduce || n < 2) return;
    let timer: ReturnType<typeof setInterval> | undefined;
    const start = setTimeout(() => {
      timer = setInterval(() => {
        if (touched.current) return;
        setDir(1);
        setI((x) => (x + 1) % n);
      }, 6000);
    }, autoDelay);
    return () => {
      clearTimeout(start);
      if (timer) clearInterval(timer);
    };
  }, [reduce, n, autoDelay]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 8 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          touched.current = true;
        },
        onPanResponderMove: (_, g) => {
          drag.value = g.dy * 0.35; // rubber-band feel
        },
        onPanResponderRelease: (_, g) => {
          drag.value = withSpring(0, { duration: 400, dampingRatio: 0.8 });
          if (g.dy < -30 || g.vy < -0.5) go(1);
          else if (g.dy > 30 || g.vy > 0.5) go(-1);
        },
        onPanResponderTerminate: () => {
          drag.value = withSpring(0, { duration: 400, dampingRatio: 0.8 });
        },
      }),
    [n], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const dragStyle = useAnimatedStyle(() => ({ transform: [{ translateY: drag.value }] }));

  const p = items[i];
  const tt = tint(c, TAG_TINT[p.tag]);
  const Icon = TAG_ICON[p.tag];
  const tagLabel = p.tag === 'ok' ? t.fOk : p.tag === 'check' ? t.fCheck : t.fUrgent;
  const H = 210;
  const enter = (dir === 1 ? SlideInDown : SlideInUp).duration(motion.enter).easing(motion.ease);

  return (
    <View style={{ flex: 1, gap: 8 }}>
      <T style={{ fontFamily: fonts.display, fontSize: 15, color: c.textMuted, marginLeft: 4 }}>{title}</T>
      <View
        {...pan.panHandlers}
        style={[{ height: H + 14 }, Platform.OS === 'web' ? ({ touchAction: 'none' } as object) : null]}>
        {/* cards waiting behind */}
        {n > 2 ? <View style={{ position: 'absolute', left: 14, right: 14, top: 14, height: H, borderRadius: radius.card, backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.border }} /> : null}
        {n > 1 ? <View style={{ position: 'absolute', left: 7, right: 7, top: 7, height: H, borderRadius: radius.card, backgroundColor: c.surfaceSolid, borderWidth: 1, borderColor: c.border }} /> : null}

        <Animated.View style={[{ position: 'absolute', left: 0, right: 0, top: 0, height: H }, dragStyle]}>
          <Animated.View key={p.id} entering={reduce ? FadeIn : enter} exiting={FadeOut.duration(120)} style={{ flex: 1 }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`${p.title[lang]}. ${tagLabel}`}
              accessibilityHint={t.probSub}
              onPress={() => {
                touched.current = true;
                haptic.soft();
                onOpen(p, items);
              }}
              style={{ flex: 1, borderRadius: radius.card, borderCurve: 'continuous', overflow: 'hidden', backgroundColor: c.surfaceSolid, borderWidth: 1, borderColor: c.border, boxShadow: `0 14px 30px ${c.shadow}` }}>
              <ProblemPhoto p={p} height="100%" />
              {/* legibility fade at the bottom */}
              <Svg width="100%" height={110} style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }} preserveAspectRatio="none" viewBox="0 0 10 10">
                <Defs>
                  <LinearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor="#0B0A1A" stopOpacity="0" />
                    <Stop offset="1" stopColor="#0B0A1A" stopOpacity="0.92" />
                  </LinearGradient>
                </Defs>
                <Rect x="0" y="0" width="10" height="10" fill="url(#fade)" />
              </Svg>
              <View style={{ position: 'absolute', left: 12, right: 22, bottom: 12, gap: 6 }}>
                <View style={{ flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, backgroundColor: tt.fg }}>
                  <Icon size={11} color="#0B0A1A" strokeWidth={2.6} />
                  <T style={{ fontSize: 10, fontFamily: fonts.bold, color: '#0B0A1A' }}>{tagLabel}</T>
                </View>
                <T style={{ fontFamily: fonts.display, fontSize: 15, lineHeight: 19, color: '#FFFFFF' }} numberOfLines={2}>
                  {p.title[lang]}
                </T>
              </View>
              {/* page dots, like the iPhone stack */}
              {n > 1 ? (
                <View style={{ position: 'absolute', right: 8, top: 0, bottom: 0, justifyContent: 'center', gap: 4 }}>
                  {items.map((it, k) => (
                    <View key={it.id} style={{ width: 4, height: k === i ? 12 : 4, borderRadius: 2, backgroundColor: k === i ? '#FFFFFF' : 'rgba(255,255,255,0.45)' }} />
                  ))}
                </View>
              ) : null}
            </Pressable>
          </Animated.View>
        </Animated.View>
      </View>
    </View>
  );
}
