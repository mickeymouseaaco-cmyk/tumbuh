import { Easing } from 'react-native-reanimated';

/**
 * Tumbuh design tokens — "night nursery". The full system is written up in DESIGN.md.
 *
 * Foundation: deep navy with a violet atmosphere. ONE action colour (rose pink). Meaning colours are
 * fixed: mint = good / done, butter = take care / get checked, rose = urgent, sky = information.
 * Glow is spent only on: the primary action, a tooth that is due now, and the "now" marker.
 * Everything else gets depth from offset shadows and 1px glass borders.
 *
 * Shape: actions are pills, cards 28, inner tiles/chips 18, small marks 10. Spacing: 4-point grid.
 * Text passes 4.5:1 on the darkest surface it sits on (on surfaceSolid: text 16.0, textMuted 7.8, accentText 9.1, textSubtle 5.4).
 */
const night = {
  /* ---- background & surfaces ---- */
  bg: '#0B0A1A',
  bg2: '#141233',
  surface: 'rgba(255,255,255,0.06)', // glass card
  surfaceAlt: 'rgba(255,255,255,0.09)', // tile inside a card, pressed glass
  surfaceSolid: '#17152E', // opaque card (tab bar, stacks)
  surfaceRaised: '#1E1B3A', // sheets and dialogs
  scrim: 'rgba(11,10,26,0.72)', // over photos
  border: 'rgba(255,255,255,0.11)',
  borderStrong: 'rgba(255,255,255,0.22)',
  line: 'rgba(255,255,255,0.08)',
  track: 'rgba(255,255,255,0.10)', // empty progress
  shadow: 'rgba(0,0,0,0.45)',

  /* ---- text ---- */
  text: '#F4F1FF',
  textMuted: '#ADA7CC',
  textSubtle: '#8F89B3', // axis ticks, helper marks (large or non-essential text only)
  ink: '#0B0A1A', // text on a bright fill (chips, badges)
  white: '#FFFFFF',

  /* ---- brand (atmosphere, selection that is not an action) ---- */
  brand: '#7C6CFF',
  brandSoft: 'rgba(124,108,255,0.18)',
  onBrandSoft: '#CFC8FF',

  /* ---- the one action colour ---- */
  accent: '#FF7AB0',
  onAccent: '#2A0717',
  accentText: '#FF9CC4',
  accentSoft: 'rgba(255,122,176,0.16)',
  accentBorder: 'rgba(255,122,176,0.42)',
  glow: 'rgba(255,122,176,0.38)',

  /* ---- disabled ---- */
  disabledBg: 'rgba(255,255,255,0.05)',
  disabledText: '#77719A',

  /* ---- aurora (background only): violet, muted blue, rose ---- */
  auroraA: '#6D5BFF',
  auroraB: '#4F7BFF',
  auroraC: '#FF5FA2',

  /* ---- tints: translucent glass + luminous ink. mint/butter/rose/sky carry meaning (see tone()) ---- */
  peach: 'rgba(253,186,140,0.13)', onPeach: '#FDC9A4',
  mint: 'rgba(94,234,212,0.12)', onMint: '#7FF0DC',
  butter: 'rgba(253,230,138,0.12)', onButter: '#FDE68A',
  lilac: 'rgba(196,181,253,0.13)', onLilac: '#D3C7FF',
  sky: 'rgba(125,211,252,0.12)', onSky: '#A5E1FD',
  rose: 'rgba(253,164,175,0.14)', onRose: '#FFB4BE',

  /* ---- mouth illustration ---- */
  skin: '#FFCFB1', hair: '#4A2E25', blush: '#FF8E8E', mouth: '#5A1428',
  gum: '#E8798F', gumDeep: '#B9495F', gumHi: '#FFB3C1', swollen: '#F7889F',
  palate: '#C2546C', palateDeep: '#8E2E47', tongue: '#E2667E', tongueDeep: '#A83A55',
  enamel: '#FFFDF8', enamel2: '#EFE4D3', enamelEdge: '#C9B49B', ghost: '#FFB3C1',
  cavity: '#2A0712',
};

export type Colors = typeof night;
export const palette = { light: night, dark: night };
export type Tint = 'peach' | 'mint' | 'butter' | 'lilac' | 'sky' | 'rose';

export const tint = (c: Colors, t: Tint) => ({ bg: c[t], fg: c[`on${t[0].toUpperCase()}${t.slice(1)}` as `on${Capitalize<Tint>}`] });

/** Meaning colours. Use these (not a raw tint) whenever colour says something. */
export type Tone = 'success' | 'warning' | 'danger' | 'info';
const TONE: Record<Tone, Tint> = { success: 'mint', warning: 'butter', danger: 'rose', info: 'sky' };
export const tone = (c: Colors, t: Tone) => tint(c, TONE[t]);

/** Tumbuh is always in its night theme: calm in a dark room, and glows read best on it. */
export function useTheme() {
  return { c: night, dark: true };
}

export const fonts = {
  display: 'Outfit_600SemiBold',
  displayBold: 'Outfit_700Bold',
  body: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semi: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
};

/**
 * Type scale. Outfit (round, friendly) for titles and numbers; Plus Jakarta Sans for reading.
 * Nothing a parent has to read is smaller than 12.
 */
export const typo = {
  display: { fontFamily: fonts.display, fontSize: 32, lineHeight: 38, letterSpacing: -0.4 },
  title: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30, letterSpacing: -0.2 },
  heading: { fontFamily: fonts.display, fontSize: 19, lineHeight: 24 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  bodySm: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.semi, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  button: { fontFamily: fonts.semi, fontSize: 16, lineHeight: 20 },
  number: { fontFamily: fonts.display, fontSize: 44, lineHeight: 48, letterSpacing: -0.5 },
} as const;

/** 4-point spacing. Inside a group: 1–3. Between groups: 4–5. Between sections: 6–8. */
export const space = { 1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40 } as const;

export const radius = { pill: 999, card: 28, tile: 18, mark: 10 };

/** Depth: every shadow has an offset and a soft blur. */
export const elevation = {
  card: '0 12px 32px rgba(0,0,0,0.38)',
  raised: '0 18px 44px rgba(0,0,0,0.5)',
  /** the only glow: under the primary action */
  action: '0 8px 24px rgba(255,122,176,0.32)',
};

/**
 * One motion vocabulary. Two voices:
 * PREMIUM (navigation, cards, sheets, progress): `ease`, no overshoot.
 * PLAYFUL (mascot, tooth pop, celebrations): `pop`, a small overshoot.
 * Every loop and every entrance stops with Reduce Motion.
 */
export const motion = {
  ease: Easing.bezier(0.23, 1, 0.32, 1),
  exit: Easing.bezier(0.3, 0, 1, 1),
  camera: Easing.bezier(0.65, 0, 0.35, 1),
  pop: Easing.bezier(0.175, 0.885, 0.32, 1.275),
  breathe: Easing.inOut(Easing.sin),
  press: 110,
  release: 200,
  base: 260,
  enter: 380,
  progress: 700,
  stagger: 45,
  zoom: 950,
};
