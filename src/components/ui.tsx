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
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { fonts, motion, radius, useTheme } from '@/theme';

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
    <Text style={[{ fontFamily: fonts.body, color: c.text, fontSize: 15 }, style]} {...rest}>
      {children}
    </Text>
  );
}

/** Rounded display face for titles and big numbers. One display size per screen. */
export function Display({ style, children, ...rest }: TextProps & { style?: StyleProp<TextStyle>; children?: ReactNode }) {
  const { c } = useTheme();
  return (
    <Text accessibilityRole="header" style={[{ fontFamily: fonts.display, color: c.text, fontSize: 30, letterSpacing: -0.3 }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function H2({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <T style={[{ fontFamily: fonts.display, fontSize: 19 }, style]}>{children}</T>;
}

export function Eyebrow({ children, color }: { children: ReactNode; color?: string }) {
  const { c } = useTheme();
  return (
    <T style={{ fontFamily: fonts.bold, fontSize: 12, letterSpacing: 0.8, textTransform: 'uppercase', color: color ?? c.accentText }}>
      {children}
    </T>
  );
}

/* ---------- Press feedback ---------- */

const APressable = Animated.createAnimatedComponent(Pressable);

/** Scales to 0.97 on press-in (110 ms, strong ease-out). Used on every button and card. */
export function PressableScale({
  style,
  scaleTo = 0.97,
  onPressIn,
  onPressOut,
  children,
  ...rest
}: Omit<PressableProps, 'style' | 'children'> & { style?: StyleProp<ViewStyle>; scaleTo?: number; children?: ReactNode }) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <APressable
      {...rest}
      onPressIn={(e) => {
        s.value = withTiming(scaleTo, { duration: motion.press, easing: motion.ease });
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        s.value = withTiming(1, { duration: motion.release, easing: motion.ease });
        onPressOut?.(e);
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
  style,
}: {
  label: string;
  onPress: () => void;
  kind?: 'primary' | 'soft' | 'ghost';
  style?: StyleProp<ViewStyle>;
}) {
  const { c } = useTheme();
  const bg = kind === 'primary' ? c.accent : kind === 'soft' ? c.accentSoft : 'transparent';
  const fg = kind === 'primary' ? c.onAccent : c.accentText;
  return (
    <PressableScale
      accessibilityRole="button"
      onPress={onPress}
      style={[
        { minHeight: 54, paddingHorizontal: 24, borderRadius: radius.pill, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' },
        kind === 'primary' && { boxShadow: `0 8px 20px ${c.accent}40` },
        style,
      ]}>
      <T style={{ fontFamily: fonts.semi, fontSize: 16, color: fg }}>{label}</T>
    </PressableScale>
  );
}

/* ---------- Containers ---------- */

/** Stagger entrance used once when a screen first appears. */
export const enter = (i: number) => FadeInDown.duration(motion.enter).delay(i * motion.stagger);

export function Card({ children, style, index }: { children: ReactNode; style?: StyleProp<ViewStyle>; index?: number }) {
  const { c, dark } = useTheme();
  return (
    <Animated.View
      entering={index === undefined ? undefined : enter(index)}
      style={[
        {
          backgroundColor: c.surface,
          borderRadius: radius.card,
          borderCurve: 'continuous',
          padding: 20,
          borderWidth: dark ? 1 : 0,
          borderColor: c.border,
          boxShadow: dark ? undefined : `0 6px 24px ${c.shadow}`,
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
    <View accessibilityRole="radiogroup" accessibilityLabel="Language" style={{ flexDirection: 'row', padding: 4, borderRadius: radius.pill, backgroundColor: c.track }}>
      <Animated.View
        style={[
          { position: 'absolute', top: 4, left: 4, width: 48, height: 36, borderRadius: radius.pill, backgroundColor: c.surface, boxShadow: `0 2px 6px ${c.shadow}` },
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
            <T style={{ fontFamily: fonts.bold, fontSize: 13, color: on ? c.text : c.textMuted }}>{l.toUpperCase()}</T>
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
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 120, paddingHorizontal: 20 }}>
      <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center', gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 36, height: 36, borderRadius: 12, borderCurve: 'continuous', backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <ToothIcon size={20} fill={c.enamel} />
            </View>
            <T style={{ fontFamily: fonts.displayBold, fontSize: 20, color: c.accentText }}>tumbuh</T>
          </View>
          <LangSwitch />
        </View>
        <Animated.View entering={enter(0)} style={{ gap: 4, marginTop: 8 }}>
          {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
          <Display>{title}</Display>
          {subtitle ? <T style={{ fontSize: 15, lineHeight: 22, color: c.textMuted }}>{subtitle}</T> : null}
        </Animated.View>
        {children}
      </View>
    </ScrollView>
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
