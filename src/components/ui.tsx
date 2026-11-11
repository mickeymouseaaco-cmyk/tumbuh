import { ChevronDown } from 'lucide-react-native';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextProps, type TextStyle, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { useStore } from '@/lib/store';

export const c = {
  bg: '#FAFAF7',
  surface: '#FFFFFF',
  border: '#E5EAE8',
  line: '#F0F3F1',
  text: '#1C2624',
  body: '#33403D',
  muted: '#56635F',
  faint: '#5F6B68',
  primary: '#2F6F6A',
  primaryDark: '#2A625E',
  primarySoft: '#E6F0EE',
  primaryTint: '#F1F7F5',
  track: '#EEF1EF',
  outline: '#D5DDDA',
  amber: '#FBEFDC',
  onAmber: '#7A4510',
  rose: '#FBE3E0',
  onRose: '#9B2C20',
  sage: '#E3F1EC',
  onSage: '#1D5B4B',
  ring: '#D98A3D',
};

export const f = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semi: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
};

export const TOOTH_PATH =
  'M8.5 3C6.5 3 5 4.6 5 7c0 2 .8 3.4 1.3 5 .6 2 .7 5 1.7 7.6.4 1 1.6 1 1.9-.1L11.1 14c.3-1 1.5-1 1.8 0l1.2 5.5c.3 1.1 1.5 1.1 1.9.1 1-2.6 1.1-5.6 1.7-7.6.5-1.6 1.3-3 1.3-5 0-2.4-1.5-4-3.5-4-1.6 0-2.2 1-4 1S10.1 3 8.5 3z';

export function ToothIcon({ size = 24, color = c.primary, strokeWidth = 1.8 }: { size?: number; color?: string; strokeWidth?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d={TOOTH_PATH} stroke={color} strokeWidth={strokeWidth} strokeLinejoin="round" />
    </Svg>
  );
}

export function T({ style, children, ...rest }: TextProps & { style?: StyleProp<TextStyle>; children: ReactNode }) {
  return (
    <Text style={[{ fontFamily: f.regular, color: c.text, fontSize: 15 }, style]} {...rest}>
      {children}
    </Text>
  );
}

export function LangSwitch() {
  const { lang, setLang } = useStore();
  return (
    <View accessibilityRole="radiogroup" accessibilityLabel="Language" style={s.switch}>
      {(['bm', 'en'] as const).map((l) => {
        const on = lang === l;
        return (
          <Pressable
            key={l}
            accessibilityRole="radio"
            accessibilityState={{ checked: on }}
            onPress={() => setLang(l)}
            style={[s.switchBtn, on && s.switchOn]}>
            <T style={{ fontFamily: f.semi, fontSize: 13, color: on ? c.text : c.faint }}>{l.toUpperCase()}</T>
          </Pressable>
        );
      })}
    </View>
  );
}

/** A tab page: app header with the BM/EN switch, a title, and scrolling content. */
export function Screen({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={[s.header, { paddingTop: insets.top + 12 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={s.logo}>
            <ToothIcon size={20} />
          </View>
          <T style={{ fontFamily: f.bold, fontSize: 17 }}>Tumbuh</T>
        </View>
        <LangSwitch />
      </View>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.inner}>
          <View style={{ marginBottom: 2 }}>
            <T accessibilityRole="header" style={s.h1}>{title}</T>
            {subtitle ? <T style={{ marginTop: 4, fontSize: 14, color: c.muted }}>{subtitle}</T> : null}
          </View>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function H2({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <T style={[{ fontFamily: f.bold, fontSize: 16 }, style]}>{children}</T>;
}

export function Eyebrow({ children, color = c.primaryDark }: { children: ReactNode; color?: string }) {
  return <T style={{ fontFamily: f.bold, fontSize: 12, letterSpacing: 0.7, textTransform: 'uppercase', color }}>{children}</T>;
}

export function Bullet({ children, dot = c.primary, color = c.body }: { children: ReactNode; dot?: string; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dot, marginTop: 8 }} />
      <T style={{ flex: 1, fontSize: 14, lineHeight: 21, color }}>{children}</T>
    </View>
  );
}

export function Chevron({ open }: { open: boolean }) {
  return (
    <View style={{ transform: [{ rotate: open ? '180deg' : '0deg' }] }}>
      <ChevronDown size={18} color={c.muted} strokeWidth={2} />
    </View>
  );
}

export function Disclaimer() {
  const { t } = useStore();
  return <T style={{ fontSize: 12, lineHeight: 18, color: c.faint, textAlign: 'center', marginTop: 4 }}>{t.disclaimer}</T>;
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 10, backgroundColor: c.bg },
  logo: { width: 34, height: 34, borderRadius: 11, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
  switch: { flexDirection: 'row', padding: 3, borderRadius: 999, backgroundColor: c.track },
  switchBtn: { minWidth: 48, height: 36, paddingHorizontal: 12, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  switchOn: { backgroundColor: c.surface },
  scroll: { paddingHorizontal: 20, paddingTop: 6, paddingBottom: 32 },
  inner: { width: '100%', maxWidth: 560, alignSelf: 'center', gap: 14 },
  h1: { fontFamily: f.bold, fontSize: 26, letterSpacing: -0.5 },
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 20, padding: 18 },
});
