import { useColorScheme } from 'react-native';
import { Easing } from 'react-native-reanimated';

/**
 * Tumbuh design tokens.
 * Warm cream paper, one raspberry accent, soft pastel "topic" tints for illustration.
 * Shape rule: actions are pills, cards 24, inner tiles/chips 16, small marks 8.
 * Spacing: 4-point grid.
 * Text colours pass 4.5:1 on their backgrounds in both themes.
 */

const light = {
  bg: '#FFF8F1',
  surface: '#FFFFFF',
  surfaceAlt: '#FBEFE6',
  text: '#2B2235',
  textMuted: '#6B5F66',
  border: '#F0E3D9',
  line: '#F5ECE4',
  accent: '#C2416B',
  onAccent: '#FFFFFF',
  accentText: '#B03A60',
  accentSoft: '#FBE3EA',
  track: '#F1E6DD',
  // topic tints (surface / ink)
  peach: '#FFE3D1', onPeach: '#7A3E1D',
  mint: '#DDF3EA', onMint: '#1E5E49',
  butter: '#FFF1C9', onButter: '#6B5214',
  lilac: '#ECE6FA', onLilac: '#4B3A86',
  sky: '#E1EEFB', onSky: '#24496E',
  rose: '#FDE2E2', onRose: '#9B2C2C',
  // mouth illustration
  skin: '#FFD8BE', hair: '#5B3A2E', blush: '#FFA99C', mouth: '#8A2E45',
  gum: '#F6B9BE', gumEdge: '#EC9AA2', enamel: '#FFFFFF', enamelEdge: '#D9C7BC', ghost: '#CDB9AE',
  shadow: 'rgba(80, 40, 30, 0.10)',
};

type Palette = typeof light;

const dark: Palette = {
  bg: '#17121B',
  surface: '#221B27',
  surfaceAlt: '#2C2331',
  text: '#F7EEF2',
  textMuted: '#BBAEB6',
  border: '#362C3C',
  line: '#2E2633',
  accent: '#E0628B',
  onAccent: '#2A0F1A',
  accentText: '#F08AAB',
  accentSoft: '#3E2232',
  track: '#33293A',
  peach: '#3A271E', onPeach: '#FFC9A8',
  mint: '#1C3229', onMint: '#9EE3C8',
  butter: '#362E17', onButter: '#F5D98B',
  lilac: '#2A2440', onLilac: '#C9BBF5',
  sky: '#1C2B3B', onSky: '#A9CDF2',
  rose: '#3B1F22', onRose: '#F5A8A8',
  skin: '#F2C7AA', hair: '#3E2820', blush: '#E98B80', mouth: '#5E1C2E',
  gum: '#B9737A', gumEdge: '#A2606A', enamel: '#FFF9F4', enamelEdge: '#8C7A72', ghost: '#6E5E66',
  shadow: 'rgba(0, 0, 0, 0.35)',
};

export const palette = { light, dark };
export type Colors = Palette;
export type Tint = 'peach' | 'mint' | 'butter' | 'lilac' | 'sky' | 'rose';

export const tint = (c: Colors, t: Tint) => ({ bg: c[t], fg: c[`on${t[0].toUpperCase()}${t.slice(1)}` as `on${Capitalize<Tint>}`] });

export function useTheme() {
  const dark = useColorScheme() === 'dark';
  return { c: dark ? palette.dark : palette.light, dark };
}

export const fonts = {
  display: 'Fredoka_600SemiBold',
  displayBold: 'Fredoka_700Bold',
  body: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semi: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
};

export const radius = { pill: 999, card: 24, tile: 16, mark: 8 };

/** One motion vocabulary for the whole app. */
export const motion = {
  ease: Easing.bezier(0.23, 1, 0.32, 1),
  press: 110,
  release: 160,
  base: 260,
  enter: 360,
  stagger: 45,
};
