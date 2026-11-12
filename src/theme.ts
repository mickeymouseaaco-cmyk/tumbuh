import { Easing } from 'react-native-reanimated';

/**
 * Tumbuh "night nursery" design tokens.
 * Soft futurism for parents checking in at 3 a.m.: deep midnight base, aurora glows,
 * frosted-glass surfaces, ONE glowing rose accent. Topic tints are luminous inks on glass.
 * Shape rule: actions are pills, cards 28, inner tiles/chips 18, small marks 10.
 * Spacing: 4-point grid. Text passes 4.5:1 on the darkest surface it sits on.
 */
const night = {
  bg: '#0B0A1A',
  bg2: '#141233',
  surface: 'rgba(255,255,255,0.06)',
  surfaceSolid: '#17152E',
  surfaceAlt: 'rgba(255,255,255,0.09)',
  text: '#F4F1FF',
  textMuted: '#ADA7CC',
  border: 'rgba(255,255,255,0.11)',
  line: 'rgba(255,255,255,0.08)',
  accent: '#FF7AB0',
  onAccent: '#2A0717',
  accentText: '#FF9CC4',
  accentSoft: 'rgba(255,122,176,0.16)',
  glow: 'rgba(255,122,176,0.55)',
  track: 'rgba(255,255,255,0.10)',
  // aurora (background only)
  auroraA: '#6D5BFF',
  auroraB: '#22D3EE',
  auroraC: '#FF5FA2',
  // topic tints: translucent glass + luminous ink
  peach: 'rgba(253,186,140,0.13)', onPeach: '#FDC9A4',
  mint: 'rgba(94,234,212,0.12)', onMint: '#7FF0DC',
  butter: 'rgba(253,230,138,0.12)', onButter: '#FDE68A',
  lilac: 'rgba(196,181,253,0.13)', onLilac: '#D3C7FF',
  sky: 'rgba(125,211,252,0.12)', onSky: '#A5E1FD',
  rose: 'rgba(253,164,175,0.14)', onRose: '#FFB4BE',
  // baby + mouth illustration
  skin: '#FFCFB1', hair: '#4A2E25', blush: '#FF8E8E', mouth: '#5A1428',
  gum: '#E8798F', gumDeep: '#B9495F', gumHi: '#FFB3C1', swollen: '#F7889F',
  palate: '#C2546C', palateDeep: '#8E2E47', tongue: '#E2667E', tongueDeep: '#A83A55',
  enamel: '#FFFDF8', enamel2: '#EFE4D3', enamelEdge: '#C9B49B', ghost: '#FFB3C1',
  cavity: '#2A0712',
  shadow: 'rgba(0,0,0,0.45)',
};

export type Colors = typeof night;
export const palette = { light: night, dark: night };
export type Tint = 'peach' | 'mint' | 'butter' | 'lilac' | 'sky' | 'rose';

export const tint = (c: Colors, t: Tint) => ({ bg: c[t], fg: c[`on${t[0].toUpperCase()}${t.slice(1)}` as `on${Capitalize<Tint>}`] });

/** Tumbuh is always in its night theme: calm in a dark room, and glows read best on it. */
export function useTheme() {
  return { c: night, dark: true };
}

export const fonts = {
  display: 'SpaceGrotesk_600SemiBold',
  displayBold: 'SpaceGrotesk_700Bold',
  body: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semi: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
};

export const radius = { pill: 999, card: 28, tile: 18, mark: 10 };

/** One motion vocabulary for the whole app. */
export const motion = {
  ease: Easing.bezier(0.23, 1, 0.32, 1),
  camera: Easing.bezier(0.65, 0, 0.35, 1),
  press: 110,
  release: 160,
  base: 260,
  enter: 380,
  stagger: 45,
  zoom: 950,
};
