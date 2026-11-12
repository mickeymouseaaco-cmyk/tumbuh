/**
 * People for the Learn cartoons, as SVG markup in natural colours:
 * a baby (head + shoulders) with different mouths, and grown-up hands that actually hold things.
 * Hands come in from the right and point/grip to the left.
 */
import { hairFor } from './art';
import type { Part } from './cartoons';

const svg = (w: number, h: number, body: string): Part => ({
  w,
  h,
  xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`,
});

const SKIN = '#FFCFB1';
const SKIN_D = '#F0A985';
const ADULT = '#E3A57E';
const ADULT_D = '#C98660';

export type Mouth = 'smile' | 'open' | 'wide' | 'chew';
export type BabyOpts = {
  age?: number;
  mouth?: Mouth;
  eyes?: 'open' | 'closed';
  teeth?: string[]; // which front teeth show: 'U1','U2','L1','L2' (centrals / laterals)
  flushed?: boolean;
  drool?: boolean;
  onesie?: string;
};

/** Baby from the shoulders up. viewBox 120 × 120; mouth centre ≈ (60, 78). */
export function baby(o: BabyOpts = {}): Part {
  const { age = 8, mouth = 'smile', eyes = 'open', teeth = [], flushed = false, drool = false, onesie = '#FCD34D' } = o;
  // head drawn on the 160 grid, scaled 0.62 and placed so the face is centred
  const hair = hairFor(age)
    .map((h) => (h.fill ? `<path d="${h.d}" fill="#4A2E25"/>` : `<path d="${h.d}" stroke="#4A2E25" stroke-width="${h.width ?? 2}" stroke-linecap="round" fill="none" opacity="${h.opacity ?? 1}"/>`))
    .join('');
  const eyeSvg =
    eyes === 'closed'
      ? `<path d="M49 84 q9 -9 18 0" stroke="#2B2235" stroke-width="3.6" stroke-linecap="round" fill="none"/><path d="M93 84 q9 -9 18 0" stroke="#2B2235" stroke-width="3.6" stroke-linecap="round" fill="none"/>`
      : `<ellipse cx="58" cy="82" rx="6" ry="7" fill="#2B2235"/><ellipse cx="102" cy="82" rx="6" ry="7" fill="#2B2235"/><circle cx="60" cy="79" r="2.2" fill="#FFFFFF"/><circle cx="104" cy="79" r="2.2" fill="#FFFFFF"/>`;
  const has = (k: string) => teeth.includes(k);
  let mouthSvg = '';
  if (mouth === 'smile') {
    mouthSvg = `<path d="M66 110 Q80 122 94 110" stroke="#9F3A55" stroke-width="3.4" fill="none" stroke-linecap="round"/>`;
  } else {
    // open / wide / chew: a real open mouth with gums, tongue and any front teeth
    const W = mouth === 'wide' ? 26 : mouth === 'chew' ? 15 : 19; // half width
    const H = mouth === 'wide' ? 30 : mouth === 'chew' ? 16 : 22; // depth
    const top = 104;
    const d = `M${80 - W} ${top} Q80 ${top - 5} ${80 + W} ${top} Q${80 + W - 3} ${top + H} 80 ${top + H + 2} Q${80 - W + 3} ${top + H} ${80 - W} ${top} Z`;
    const t = (x: number, y: number, w: number, h: number) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * 0.42}" fill="#FFFDF8"/>`;
    const cw = W * 0.24;
    const up = [has('U2') ? t(80 - cw * 2.1, top + 3, cw, cw * 1.1) : '', has('U1') ? t(80 - cw - 0.5, top + 3, cw, cw * 1.25) : '', has('U1') ? t(80 + 0.5, top + 3, cw, cw * 1.25) : '', has('U2') ? t(80 + cw * 1.1, top + 3, cw, cw * 1.1) : ''].join('');
    const lowY = top + H - cw * 1.25 - 3;
    const lo = [has('L2') ? t(80 - cw * 2.1, lowY + 1, cw, cw * 1.05) : '', has('L1') ? t(80 - cw - 0.5, lowY, cw, cw * 1.2) : '', has('L1') ? t(80 + 0.5, lowY, cw, cw * 1.2) : '', has('L2') ? t(80 + cw * 1.1, lowY + 1, cw, cw * 1.05) : ''].join('');
    mouthSvg = `<clipPath id="m${W}${teeth.join('')}${age}"><path d="${d}"/></clipPath><path d="${d}" fill="#6E1A30"/>
      <g clip-path="url(#m${W}${teeth.join('')}${age})"><ellipse cx="80" cy="${top + H}" rx="${W * 0.75}" ry="${H * 0.4}" fill="#E2667E"/>
      <path d="M${80 - W - 4} ${top - 6} H${80 + W + 4} V${top + 4.5} Q80 ${top + 1.5} ${80 - W - 4} ${top + 4.5} Z" fill="#F08AA0"/>
      <path d="M${80 - W - 4} ${top + H + 8} H${80 + W + 4} V${top + H - 2.5} Q80 ${top + H} ${80 - W - 4} ${top + H - 2.5} Z" fill="#F08AA0"/>${up}${lo}</g>
      <path d="M${80 - W} ${top} Q80 ${top - 5} ${80 + W} ${top}" stroke="#C9576E" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
  }
  const cheeks = flushed ? '#FF5A5A' : '#FF8E8E';
  const k = `${age}${mouth}${eyes}${teeth.join('')}${flushed ? 'f' : ''}${drool ? 'd' : ''}`.replace(/[^a-zA-Z0-9]/g, '');
  const body = `
    <path d="M14 120 C14 98 32 88 60 88 C88 88 106 98 106 120 Z" fill="${onesie}"/>
    <path d="M44 90 Q60 100 76 90" stroke="#FFFFFF" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/>
    <g transform="translate(10 -4) scale(0.625)">
      <defs><radialGradient id="sk${k}" cx=".42" cy=".36" r=".72"><stop offset="0" stop-color="#FFE9D9"/><stop offset=".65" stop-color="${SKIN}"/><stop offset="1" stop-color="${SKIN_D}"/></radialGradient>
      <radialGradient id="bl${k}" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${cheeks}" stop-opacity="${flushed ? 0.9 : 0.7}"/><stop offset="1" stop-color="${cheeks}" stop-opacity="0"/></radialGradient></defs>
      <ellipse cx="25" cy="92" rx="12" ry="15" fill="url(#sk${k})"/><ellipse cx="135" cy="92" rx="12" ry="15" fill="url(#sk${k})"/>
      <circle cx="80" cy="86" r="57" fill="url(#sk${k})"/>
      <ellipse cx="62" cy="52" rx="16" ry="9" fill="#FFFFFF" opacity=".25" transform="rotate(-20 62 52)"/>
      ${hair}
      <path d="M50 68 q8 -4 16 0 M94 68 q8 -4 16 0" stroke="#C98A6E" stroke-width="2" stroke-linecap="round" fill="none" opacity=".6"/>
      ${eyeSvg}
      <ellipse cx="80" cy="96" rx="5" ry="3.2" fill="#E9A07F" opacity=".7"/>
      <ellipse cx="42" cy="102" rx="${flushed ? 16 : 13}" ry="${flushed ? 11 : 9}" fill="url(#bl${k})"/><ellipse cx="118" cy="102" rx="${flushed ? 16 : 13}" ry="${flushed ? 11 : 9}" fill="url(#bl${k})"/>
      ${mouthSvg}
      ${drool ? `<path d="M88 ${mouth === 'smile' ? 116 : 128} q2 8 -1 12 a3.4 3.4 0 0 1 -5 -3 q1 -5 6 -9z" fill="#BAE6FD" opacity=".95"/>` : ''}
    </g>`;
  return svg(120, 120, body);
}

/* ---------- grown-up hands (come in from the right) ---------- */

const sleeve = (color = '#5B7FC1', cuff = '#4A6BA8') => `<path d="M46 4 H80 V40 H46 Z" fill="${color}"/><rect x="44" y="4" width="6" height="36" rx="2" fill="${cuff}"/>`;

/** Fist gripping something that passes left-right through it at y≈22. */
export const handGrip = (skin = ADULT, line = ADULT_D, sl = sleeve()) =>
  svg(80, 44, `${sl}
    <path d="M22 9 C17 9 14 12 14 16 V30 C14 35 18 38 23 38 H46 V7 H28 Z" fill="${skin}"/>
    <path d="M20 22 H40 M21 29 H40" stroke="${line}" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>
    <path d="M24 9 C18 7 12 10 12 15 C12 19 16 20 21 18 L34 15" fill="${skin}" stroke="${line}" stroke-width="1.3" stroke-linejoin="round"/>`);

/** Index finger pointing left (other fingers curled). Fingertip at (2, 18). */
export const handPoint = (skin = ADULT, line = ADULT_D, sl = sleeve(), tip = '') =>
  svg(80, 44, `${sl}
    <path d="M24 12 C19 12 16 15 16 19 V30 C16 35 20 38 25 38 H46 V9 H30 Z" fill="${skin}"/>
    <path d="M2 18 C2 15.2 4 13.5 6.5 13.5 H28 V22.5 H6.5 C4 22.5 2 20.8 2 18 Z" fill="${skin}" stroke="${line}" stroke-width="1.2"/>
    <path d="M4 16.4 C4.6 15.2 6 14.8 7.5 15" stroke="#F8D7C2" stroke-width="1.4" stroke-linecap="round" fill="none"/>
    <path d="M22 27 H40 M23 32 H40" stroke="${line}" stroke-width="1.4" stroke-linecap="round" opacity=".7"/>
    ${tip}`);

/** Finger wrapped in a soft blue cloth (for wiping gums). */
export const handCloth = () =>
  handPoint(ADULT, ADULT_D, sleeve(), `<path d="M0 17.5 C0 12 4 10.5 9 10.5 H22 L26 14 L22 25.5 H9 C4 25.5 0 23 0 17.5 Z" fill="#7DD3FC"/><path d="M5 14 C10 13 16 13 21 14.5 M5 21.5 C10 22.5 16 22.5 21 21" stroke="#E0F2FE" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M26 14 L33 9 M26 22 L33 28" stroke="#7DD3FC" stroke-width="3" stroke-linecap="round"/>`);

/** Dentist's gloved hand (blue glove, teal scrubs). */
export const gloveGrip = () => handGrip('#93C5FD', '#3B82F6', sleeve('#14B8A6', '#0F766E'));

/** A child's small arm reaching up from below. */
export const childReach = () =>
  svg(30, 60, `<path d="M6 60 V30 H24 V60 Z" fill="#FCD34D"/><path d="M8 32 V14 C8 10 10 8 13 8 H17 C20 8 22 10 22 14 V32 Z" fill="${SKIN}"/>
    <path d="M9 12 C9 4 11 1 12.5 1 C14 1 14 4 14 9 M14 9 C14 3 15.5 0.5 17 0.5 C18.5 0.5 19 3 18.5 9 M18.5 10 C19 5 20.5 4 21.5 4.5 C22.5 5 22.4 8 22 12" stroke="${SKIN}" stroke-width="4" stroke-linecap="round" fill="none"/>`);

/** Grown-up mouth + spoon side, for "don't share spoons". */
export const adultFace = () =>
  svg(60, 70, `<path d="M60 4 C34 4 20 22 20 40 C20 56 30 68 46 70 H60 Z" fill="${ADULT}"/><path d="M60 4 C40 4 28 12 24 22 C34 16 48 14 60 15 Z" fill="#3F2A23"/>
    <ellipse cx="38" cy="34" rx="3.4" ry="4" fill="#2B2235"/><path d="M26 50 Q32 54 38 50" stroke="#9F3A55" stroke-width="3" fill="none" stroke-linecap="round"/>`);
