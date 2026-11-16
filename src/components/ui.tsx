import { ChevronDown } from 'lucide-react-native';
import { useEffect, type ReactNode } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  type PressableProps,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, Path, RadialGradient, Rect, Stop } from 'react-native-svg';

import { LogoMark } from '@/components/logo';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { elevation, fonts, motion, radius, typo, useTheme } from '@/theme';

export const TOOTH_PATH =
  'M8.5 3C6.5 3 5 4.6 5 7c0 2 .8 3.4 1.3 5 .6 2 .7 5 1.7 7.6.4 1 1.6 1 1.9-.1L11.1 14c.3-1 1.5-1 1.8 0l1.2 5.5c.3 1.1 1.5 1.1 1.9.1 1-2.6 1.1-5.6 1.7-7.6.5-1.6 1.3-3 1.3-5 0-2.4-1.5-4-3.5-4-1.6 0-2.2 1-4 1S10.1 3 8.5 3z';

export function ToothIcon({ size = 24, color, fill = 'none', strokeWidth = 1.8 }: { size?: number; color?: string; fill?: string; strokeWidth?: number }) {
  const { c } = useTheme();
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={TOOTH_PATH} fill={fill} stroke={color ?? c.accent} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </Svg>
  );
}

/* ---------- Text ---------- */

export function T({ style, children, ...rest }: TextProps & { style?: StyleProp<TextStyle>; children?: ReactNode }) {
  const { c } = useTheme();
  return (
    <Text selectable={false} style={[{ fontFamily: fonts.body, color: c.text, fontSize: 15 }, style]} {...rest}>
      {children}
    </Text>
  );
}

/** Rounded display face for titles and big numbers. One display size per screen. */
export function Display({ style, children, ...rest }: TextProps & { style?: StyleProp<TextStyle>; children?: ReactNode }) {
  const { c } = useTheme();
  return (
    <Text accessibilityRole="header" style={[typo.display, { color: c.text }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function H2({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <T accessibilityRole="header" style={[typo.heading, style]}>{children}</T>;
}

/** A small field label (what the thing below is). Sentence case; never a shouty kicker over a title. */
export function Eyebrow({ children, color }: { children: ReactNode; color?: string }) {
  const { c } = useTheme();
  return (
    <T style={{ fontFamily: fonts.semi, fontSize: 13, lineHeight: 17, letterSpacing: 0.2, color: color ?? c.accentText }}>
      {children}
    </T>
  );
}

/* ---------- Press feedback ---------- */

const APressable = Animated.createAnimatedComponent(Pressable);

/**
 * Press feedback for every button and card: scales to 0.97 on press-in (110 ms), settles back in 200 ms.
 * With a mouse it lifts very slightly on hover. Disabled controls don't move.
 */
export function PressableScale({
  style,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  onHoverIn,
  onHoverOut,
  disabled,
  children,
  ...rest
}: Omit<PressableProps, 'style' | 'children'> & { style?: StyleProp<ViewStyle>; scaleTo?: number; children?: ReactNode }) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <APressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        s.value = withTiming(scaleTo, { duration: motion.press, easing: motion.ease });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.value = withTiming(1, { duration: motion.release, easing: motion.ease });
        onPressOut?.(e);
      }}
      onHoverIn={(e) => {
        if (!disabled) s.value = withTiming(1.015, { duration: motion.press, easing: motion.ease });
        onHoverIn?.(e);
      }}
      onHoverOut={(e) => {
        s.value = withTiming(1, { duration: motion.release, easing: motion.ease });
        onHoverOut?.(e);
      }}
      style={[style, a]}>
      {children}
    </APressable>
  );
}

export function Button({
  label,
  onPress,
  kind = 'primary',
  disabled = false,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'soft' | 'ghost';
  disabled?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const bg = disabled ? c.disabledBg : kind === 'primary' ? c.accent : kind === 'soft' ? c.accentSoft : 'transparent';
  const fg = disabled ? c.disabledText : kind === 'primary' ? c.onAccent : c.accentText;
  return (
    <PressableScale
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={[
        { minHeight: 54, paddingHorizontal: 24, borderRadius: radius.pill, backgroundColor: bg, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center' },
        kind === 'primary' && !disabled && { boxShadow: elevation.action },
        (kind !== 'primary' || disabled) && { borderWidth: 1, borderColor: kind === 'soft' && !disabled ? c.accentBorder : c.border },
        style,
      ]}>
      {icon}
      <T style={[typo.button, { color: fg }]}>{label}</T>
    </PressableScale>
  );
}

/** A progress line that fills smoothly when the value changes (0–1). */
export function ProgressBar({ value, color, height = 8, delay = 0 }: { value: number; color?: string; height?: number; delay?: number }) {
  const { c } = useTheme();
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(delay, withTiming(Math.max(0, Math.min(1, value)), { duration: motion.progress, easing: motion.ease }));
  }, [value, delay, v]);
  const a = useAnimatedStyle(() => ({ transform: [{ scaleX: v.value }] }));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}
      style={{ height, borderRadius: height / 2, backgroundColor: c.track, overflow: 'hidden' }}>
      <Animated.View style={[{ height, width: '100%', borderRadius: height / 2, backgroundColor: color ?? c.accent, transformOrigin: 'left center' }, a]} />
    </View>
  );
}

/* ---------- Containers ---------- */

/** Stagger entrance used once when a screen first appears. */
export const enter = (i: number) => FadeInDown.duration(motion.enter).delay(i * motion.stagger);

export function Card({ children, style, index }: { children: ReactNode; style?: StyleProp<ViewStyle>; index?: number }) {
  const { c } = useTheme();
  return (
    <Animated.View
      entering={index === undefined ? undefined : enter(index)}
      style={[
        {
          backgroundColor: c.surface,
          borderRadius: radius.card,
          borderCurve: 'continuous',
          padding: 20,
          borderWidth: 1,
          borderColor: c.border,
          boxShadow: elevation.card,
        },
        style,
      ]}>
      {children}
    </Animated.View>
  );
}

export function LangSwitch() {
  const { c } = useTheme();
  const { lang, setLang } = useStore();
  const x = useSharedValue(lang === 'bm' ? 0 : 1);
  useEffect(() => {
    x.value = withTiming(lang === 'bm' ? 0 : 1, { duration: motion.base, easing: motion.ease });
  }, [lang, x]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value * 48 }] }));
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Language" style={{ flexDirection: 'row', padding: 4, borderRadius: radius.pill, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
      <Animated.View
        style={[
          { position: 'absolute', top: 4, left: 4, width: 48, height: 36, borderRadius: radius.pill, backgroundColor: c.brandSoft, borderWidth: 1, borderColor: c.brand },
          knob,
        ]}
      />
      {(['bm', 'en'] as const).map((l) => {
        const on = lang === l;
        return (
          <Pressable
            key={l}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onPress={() => {
              if (!on) haptic.tap();
              setLang(l);
            }}
            style={{ width: 48, height: 36, alignItems: 'center', justifyContent: 'center' }}>
            <T style={{ fontFamily: fonts.bold, fontSize: 13, color: on ? c.onBrandSoft : c.textMuted }}>{l.toUpperCase()}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A tab page: brand row with the BM/EN switch, big title, scrolling content that clears the floating tab bar. */
export function Screen({ title, subtitle, eyebrow, children }: { title: string; subtitle?: string; eyebrow?: string; children: ReactNode }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
    <Aurora />
    <ScrollView
      style={{ flex: 1 }}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: 40, paddingHorizontal: 20 }}>
      <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center', gap: 18 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <LogoMark size={36} />
            <T style={{ fontFamily: fonts.displayBold, fontSize: 21, letterSpacing: 0.2, color: c.text }}>tumbuh<T style={{ fontFamily: fonts.displayBold, fontSize: 21, color: c.accent }}>.</T></T>
          </View>
          <LangSwitch />
        </View>
        <Animated.View entering={enter(0)} style={{ gap: 6, marginTop: 12, marginBottom: 4 }}>
          <Display>{title}</Display>
          {subtitle || eyebrow ? (
            <T style={[typo.body, { color: c.textMuted }]}>{eyebrow ? `${eyebrow}. ` : ''}{subtitle}</T>
          ) : null}
        </Animated.View>
        {children}
      </View>
    </ScrollView>
    </View>
  );
}

/**
 * Soft aurora glows behind every screen. It drifts very slowly (ambient layer, 26 s there and back)
 * so the page feels alive without anything moving near the text. Still with Reduce Motion.
 */
export function Aurora() {
  const { c } = useTheme();
  const reduce = useReducedMotion();
  const d = useSharedValue(0);
  useEffect(() => {
    if (reduce) return;
    d.value = withRepeat(withSequence(withTiming(1, { duration: 13000, easing: motion.breathe }), withTiming(0, { duration: 13000, easing: motion.breathe })), -1);
  }, [reduce, d]);
  const drift = useAnimatedStyle(() => ({ transform: [{ translateX: d.value * 14 }, { translateY: d.value * -18 }, { scale: 1 + d.value * 0.04 }] }));
  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      <Animated.View style={[{ position: 'absolute', top: -30, left: -30, right: -30, bottom: -30 }, drift]}>
        <Svg width="100%" height="100%" preserveAspectRatio="none" viewBox="0 0 100 100">
          <Defs>
            <RadialGradient id="aA" cx="10" cy="4" r="60" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={c.auroraA} stopOpacity="0.40" />
              <Stop offset="1" stopColor={c.auroraA} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="aB" cx="100" cy="30" r="55" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={c.auroraB} stopOpacity="0.16" />
              <Stop offset="1" stopColor={c.auroraB} stopOpacity="0" />
            </RadialGradient>
            <RadialGradient id="aC" cx="30" cy="100" r="60" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={c.auroraC} stopOpacity="0.16" />
              <Stop offset="1" stopColor={c.auroraC} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect x="0" y="0" width="100" height="100" fill="url(#aA)" />
          <Rect x="0" y="0" width="100" height="100" fill="url(#aB)" />
          <Rect x="0" y="0" width="100" height="100" fill="url(#aC)" />
        </Svg>
      </Animated.View>
    </View>
  );
}

export function Bullet({ children, dot, color }: { children: ReactNode; dot?: string; color?: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: dot ?? c.accent, marginTop: 8 }} />
      <T style={{ flex: 1, fontSize: 15, lineHeight: 23, color: color ?? c.text }}>{children}</T>
    </View>
  );
}

export function Chevron({ open, color }: { open: boolean; color?: string }) {
  const { c } = useTheme();
  const r = useSharedValue(open ? 1 : 0);
  useEffect(() => {
    r.value = withTiming(open ? 1 : 0, { duration: motion.base, easing: motion.ease });
  }, [open, r]);
  const a = useAnimatedStyle(() => ({ transform: [{ rotate: `${r.value * 180}deg` }] }));
  return (
    <Animated.View style={a}>
      <ChevronDown size={20} color={color ?? c.textMuted} strokeWidth={2.2} />
    </Animated.View>
  );
}

export function Disclaimer() {
  const { c } = useTheme();
  const { t } = useStore();
  return <T style={{ fontSize: 12, lineHeight: 18, color: c.textMuted, textAlign: 'center', marginTop: 8 }}>{t.disclaimer}</T>;
}
