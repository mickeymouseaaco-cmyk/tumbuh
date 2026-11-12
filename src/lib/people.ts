/**
 * People for the Learn pictures, drawn in the style of the family artwork:
 * dark-brown outlines, big shiny eyes, rosy cheeks, the baby in a mint onesie with a white collar and a
 * tooth logo, Mum's green striped sleeve, Dad's blue sleeve. SVG markup, natural colours.
 * Hands come in from the right and point/grip to the left.
 */
import type { Part } from './cartoons';

const svg = (w: number, h: number, body: string): Part => ({
  w,
  h,
  xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`,
});

export const INK = '#3B2A26'; // outline colour
const LW = 2; // outline width
const SKIN = '#FBD3B6';
const SKIN_SH = '#F2B48E';
const HAIR = '#8B5A3C';
const HAIR_D = '#6B4129';
const ONESIE = '#8FD9C7';
const ONESIE_SH = '#6CC3AE';
const CHEEK = '#F59A9A';
const ADULT = '#F1C09C';
const ADULT_SH = '#DFA27C';

export type Mouth = 'smile' | 'grin' | 'open' | 'wide' | 'chew' | 'closed';
export type BabyOpts = {
  age?: number;
  mouth?: Mouth;
  eyes?: 'open' | 'closed';
  teeth?: string[]; // front teeth to show: 'U1' / 'U2' (upper centrals / laterals), 'L1' / 'L2'
  flushed?: boolean;
  drool?: boolean;
  onesie?: string;
};

const o = `stroke="${INK}" stroke-width="${LW}" stroke-linejoin="round" stroke-linecap="round"`;

function hair(age: number) {
  // top-of-head hair on a head centred (60, 50), radius ≈ 36
  if (age < 6) return `<path d="M57 16 C55 9 63 6 66 10 C68 13 64 16 61 14" fill="none" stroke="${HAIR}" stroke-width="3.4" stroke-linecap="round"/>`;
  if (age < 12)
    return `<path d="M36 28 C42 16 54 12 64 13 C74 13 82 18 86 26 C80 23 74 23 70 26 C66 21 58 21 54 26 C49 22 41 23 36 28 Z" fill="${HAIR}" ${o}/>
      <path d="M58 14 C55 6 64 2 68 7 C70 10 66 13 63 11" fill="none" ${o}/><path d="M58 14 C55 6 64 2 68 7" fill="none" stroke="${HAIR}" stroke-width="1.4"/>`;
  if (age < 24)
    return `<path d="M27 42 C26 24 40 12 60 12 C80 12 94 24 93 42 C88 34 82 31 76 31 C72 36 64 36 60 30 C56 36 48 36 44 31 C38 31 31 35 27 42 Z" fill="${HAIR}" ${o}/>
      <path d="M44 20 C50 16 58 15 64 16" stroke="${HAIR_D}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
      <path d="M60 13 C57 4 68 1 71 7" fill="none" ${o}/>`;
  return `<path d="M24 52 C20 26 38 10 60 10 C82 10 100 26 96 52 C92 40 86 34 78 32 C75 39 66 40 62 33 C58 40 49 40 46 33 C37 34 28 41 24 52 Z" fill="${HAIR}" ${o}/>
    <path d="M38 20 C46 15 56 13 66 14 M70 16 C78 18 84 22 88 28" stroke="${HAIR_D}" stroke-width="1.6" fill="none" stroke-linecap="round"/>`;
}

/** Baby from the shoulders up. viewBox 120 × 120; mouth centre ≈ (60, 69). */
export function baby(opts: BabyOpts = {}): Part {
  const { age = 8, mouth = 'grin', eyes = 'open', teeth = [], flushed = false, drool = false, onesie = ONESIE } = opts;
  const k = `${age}${mouth}${eyes}${teeth.join('')}${flushed ? 'f' : ''}${drool ? 'd' : ''}${onesie}`.replace(/[^a-zA-Z0-9]/g, '');
  const has = (t: string) => teeth.includes(t);

  const eyeSvg =
    eyes === 'closed'
      ? `<path d="M40 52 Q46 46 52 52" fill="none" ${o} stroke-width="2.6"/><path d="M68 52 Q74 46 80 52" fill="none" ${o} stroke-width="2.6"/>
         <path d="M40 52 l-2.5 1.5 M80 52 l2.5 1.5" ${o} stroke-width="1.6"/>`
      : `<ellipse cx="46" cy="51" rx="6" ry="7" fill="#FFFFFF" ${o} stroke-width="1.6"/><ellipse cx="74" cy="51" rx="6" ry="7" fill="#FFFFFF" ${o} stroke-width="1.6"/>
         <ellipse cx="46.6" cy="52" rx="4.6" ry="5.4" fill="#6B4129"/><ellipse cx="74.6" cy="52" rx="4.6" ry="5.4" fill="#6B4129"/>
         <circle cx="46.8" cy="52.6" r="2.4" fill="#2B1B16"/><circle cx="74.8" cy="52.6" r="2.4" fill="#2B1B16"/>
         <circle cx="48.4" cy="49.6" r="1.7" fill="#FFFFFF"/><circle cx="76.4" cy="49.6" r="1.7" fill="#FFFFFF"/><circle cx="45" cy="54.6" r=".8" fill="#FFFFFF"/><circle cx="73" cy="54.6" r=".8" fill="#FFFFFF"/>`;

  // mouth shapes, all centred near (60, 69)
  const T = (x: number, y: number, w: number, h: number) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w * 0.35}" fill="#FFFFFF" stroke="${INK}" stroke-width=".8"/>`;
  let mouthSvg = '';
  if (mouth === 'closed') {
    mouthSvg = `<path d="M53 67 Q60 73 67 67" fill="none" ${o}/>`;
  } else {
    const W = mouth === 'wide' ? 12 : mouth === 'grin' ? 10.5 : mouth === 'chew' ? 6.5 : mouth === 'smile' ? 9 : 7.5;
    const H = mouth === 'wide' ? 15 : mouth === 'grin' ? 10 : mouth === 'chew' ? 6.5 : mouth === 'smile' ? 7 : 9;
    const top = mouth === 'wide' ? 62 : 64;
    const isGrin = mouth === 'grin' || mouth === 'smile';
    // grin: flat top, round bottom (a laugh). open/wide/chew: an oval
    const d = isGrin
      ? `M${60 - W} ${top} Q60 ${top + 1.5} ${60 + W} ${top} Q${60 + W - 1} ${top + H} 60 ${top + H} Q${60 - W + 1} ${top + H} ${60 - W} ${top} Z`
      : `M${60 - W} ${top + H / 2} C${60 - W} ${top - 1} ${60 + W} ${top - 1} ${60 + W} ${top + H / 2} C${60 + W} ${top + H + 1} ${60 - W} ${top + H + 1} ${60 - W} ${top + H / 2} Z`;
    const cw = Math.max(2.6, W * 0.26);
    const up = [has('U2') ? T(60 - cw * 2.05, top + 0.4, cw, cw * 1.05) : '', has('U1') ? T(60 - cw - 0.3, top + 0.4, cw, cw * 1.2) : '', has('U1') ? T(60 + 0.3, top + 0.4, cw, cw * 1.2) : '', has('U2') ? T(60 + cw * 1.05, top + 0.4, cw, cw * 1.05) : ''].join('');
    const ly = top + H - cw * 1.15 - 0.6;
    const lo = [has('L2') ? T(60 - cw * 2.05, ly + 0.4, cw, cw * 1.0) : '', has('L1') ? T(60 - cw - 0.3, ly, cw, cw * 1.15) : '', has('L1') ? T(60 + 0.3, ly, cw, cw * 1.15) : '', has('L2') ? T(60 + cw * 1.05, ly + 0.4, cw, cw * 1.0) : ''].join('');
    mouthSvg = `<clipPath id="mc${k}"><path d="${d}"/></clipPath>
      <path d="${d}" fill="#8E2C3F"/>
      <g clip-path="url(#mc${k})"><ellipse cx="60" cy="${top + H}" rx="${W * 0.7}" ry="${H * 0.42}" fill="#EF7C8E"/>${up}${lo}</g>
      <path d="${d}" fill="none" ${o} stroke-width="1.8"/>`;
  }

  const body = `
    <path d="M14 120 C14 99 32 89 60 89 C88 89 106 99 106 120 Z" fill="${onesie}" ${o}/>
    <path d="M30 120 C31 107 38 100 46 97" stroke="${ONESIE_SH}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/>
    <path d="M44 88 C40 96 50 101 59 96 C61 101 70 101 76 96 C82 92 78 86 76 86 Z" fill="#FFFFFF" ${o} stroke-width="1.7"/>
    <g transform="translate(74 104)"><path d="M-3.5 -4 C-5 -4 -6 -3 -6 -1.4 C-6 1 -4.6 2.6 -4.2 5 C-4 6 -3 6 -2.8 5.1 L-2 2 C-1.8 1.2 -0.8 1.2 -0.6 2 L0.2 5.1 C0.4 6 1.4 6 1.6 5 C2 2.6 3.4 1 3.4 -1.4 C3.4 -3 2.4 -4 0.9 -4 C-0.2 -4 -0.8 -3.3 -1.3 -3.3 S-2.4 -4 -3.5 -4Z" fill="#FFFFFF" stroke="${INK}" stroke-width=".9"/>
      <path d="M5 -6 l2 -2 M6.6 -1.4 h2.6 M5 3 l2 2" stroke="#F5C451" stroke-width="1.2" stroke-linecap="round"/></g>
    <ellipse cx="23" cy="54" rx="7.5" ry="9" fill="${SKIN}" ${o}/><path d="M23 50 C20.5 52 20.5 57 23 59" stroke="${SKIN_SH}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="97" cy="54" rx="7.5" ry="9" fill="${SKIN}" ${o}/><path d="M97 50 C99.5 52 99.5 57 97 59" stroke="${SKIN_SH}" stroke-width="2" fill="none" stroke-linecap="round"/>
    <ellipse cx="60" cy="52" rx="37" ry="35" fill="${SKIN}" ${o}/>
    <path d="M30 66 C36 80 50 86 60 86 C70 86 84 80 90 66 C84 76 72 82 60 82 C48 82 36 76 30 66Z" fill="${SKIN_SH}" opacity=".45"/>
    ${hair(age)}
    <path d="M40 41 Q46 38 52 40.5 M68 40.5 Q74 38 80 41" stroke="${HAIR}" stroke-width="2" fill="none" stroke-linecap="round"/>
    ${eyeSvg}
    <path d="M58 60 Q60 62 62 60" stroke="${INK}" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    <ellipse cx="36" cy="63" rx="${flushed ? 8 : 6.5}" ry="${flushed ? 5.5 : 4.2}" fill="${flushed ? '#F25C5C' : CHEEK}" opacity="${flushed ? 0.85 : 0.65}"/>
    <ellipse cx="84" cy="63" rx="${flushed ? 8 : 6.5}" ry="${flushed ? 5.5 : 4.2}" fill="${flushed ? '#F25C5C' : CHEEK}" opacity="${flushed ? 0.85 : 0.65}"/>
    ${mouthSvg}
    ${drool ? `<path d="M65 76 C66 80 66 83 64.5 84.5 C63 86 61 85 61.5 83 C62 81 64 79 65 76Z" fill="#BFE7FB" stroke="#7CC4E8" stroke-width=".8"/>` : ''}`;
  return svg(120, 120, body);
}

/* ---------- grown-up hands (come in from the right) ---------- */

/** Sleeve: Mum's green stripes, Dad's blue polo, or the dentist's teal scrubs. */
const sleeve = (who: 'mum' | 'dad' | 'dentist' = 'mum') => {
  if (who === 'mum')
    return `<path d="M44 6 H80 V40 H44 Z" fill="#7CC77A" ${o}/><path d="M50 6 V40 M58 6 V40 M66 6 V40 M74 6 V40" stroke="#B9E5A6" stroke-width="3"/><path d="M44 6 H80 V40 H44 Z" fill="none" ${o}/>`;
  if (who === 'dad') return `<path d="M44 6 H80 V40 H44 Z" fill="#5B8BD6" ${o}/><path d="M44 6 H50 V40 H44Z" fill="#4A78C2" ${o}/>`;
  return `<path d="M44 6 H80 V40 H44 Z" fill="#2BB5A0" ${o}/><path d="M44 6 H50 V40 H44Z" fill="#1F9A88" ${o}/>`;
};

/** Hand wrapped around something that passes left–right through it at y ≈ 22. */
export const handGrip = (who: 'mum' | 'dad' | 'dentist' = 'mum') => {
  const skin = who === 'dentist' ? '#9CCBFA' : ADULT;
  const sh = who === 'dentist' ? '#6EA9E6' : ADULT_SH;
  return svg(82, 46, `${sleeve(who)}
    <path d="M22 9 C16.5 9 13.5 12.5 13.5 17 V30 C13.5 35.5 17.5 39 23 39 H45 V7 H28 Z" fill="${skin}" ${o}/>
    <path d="M15 28 H40 M16 33.5 H40" stroke="${sh}" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M25 9.5 C18 7 11 10 11 15.5 C11 20 16 21 21.5 18.5 L35 15" fill="${skin}" ${o}/>`);
};

/** Index finger pointing left, other fingers curled. Fingertip at (2, 18). */
export const handPoint = (who: 'mum' | 'dad' = 'mum', tip = '') =>
  svg(82, 46, `${sleeve(who)}
    <path d="M24 12 C18.5 12 15.5 15.5 15.5 20 V30 C15.5 35.5 19.5 39 25 39 H45 V9 H30 Z" fill="${ADULT}" ${o}/>
    <path d="M2 18 C2 15 4 13.2 7 13.2 H29 V22.8 H7 C4 22.8 2 21 2 18 Z" fill="${ADULT}" ${o}/>
    <path d="M4.6 15.4 C5.4 14.6 6.6 14.4 8 14.6" stroke="#FFFFFF" stroke-width="1.4" stroke-linecap="round" fill="none" opacity=".7"/>
    <path d="M18 29 H40 M19 34 H40" stroke="${ADULT_SH}" stroke-width="1.6" stroke-linecap="round"/>
    ${tip}`);

/** Finger wrapped in a soft blue cloth (for wiping gums). */
export const handCloth = () =>
  handPoint(
    'mum',
    `<path d="M0 18 C0 12 4 10.5 9 10.5 H23 L27 14 L23 25.5 H9 C4 25.5 0 23.5 0 18 Z" fill="#9AD8F5" ${o}/>
     <path d="M6 14.2 C11 13.2 17 13.2 22 14.6 M6 21.8 C11 22.8 17 22.8 22 21.4" stroke="#E0F4FD" stroke-width="1.5" fill="none" stroke-linecap="round"/>
     <path d="M27 14 L34 9 M27 22 L34 27" stroke="#9AD8F5" stroke-width="3.4" stroke-linecap="round"/>`,
  );

/** Dentist's gloved hand (blue glove, teal scrubs). */
export const gloveGrip = () => handGrip('dentist');

/** A toddler's small arm reaching up from below. */
export const childReach = () =>
  svg(32, 62, `<path d="M6 62 V32 H26 V62 Z" fill="#7DB8F0" ${o}/>
    <path d="M8.5 34 V16 C8.5 12 10.5 10 14 10 H18 C21.5 10 23.5 12 23.5 16 V34 Z" fill="${SKIN}" ${o}/>
    <path d="M10 14 C10 6 11.5 3 13 3 C14.5 3 15 6 15 11 M15 11 C15 5 16.5 2.5 18 2.5 C19.5 2.5 20 5 19.5 11 M19.5 12 C20 7 21.5 6 22.5 6.5 C23.5 7 23.4 10 23 14" stroke="${INK}" stroke-width="5.6" stroke-linecap="round" fill="none"/>
    <path d="M10 14 C10 6 11.5 3 13 3 C14.5 3 15 6 15 11 M15 11 C15 5 16.5 2.5 18 2.5 C19.5 2.5 20 5 19.5 11 M19.5 12 C20 7 21.5 6 22.5 6.5 C23.5 7 23.4 10 23 14" stroke="${SKIN}" stroke-width="3.6" stroke-linecap="round" fill="none"/>`);

/** Dad's face in profile-ish view from the right edge (for "don't share spoons"). */
export const adultFace = () =>
  svg(62, 76, `<path d="M62 6 C36 6 20 24 20 44 C20 60 30 72 48 74 H62 Z" fill="${ADULT}" ${o}/>
    <path d="M62 4 C40 2 26 12 22 26 C30 18 46 16 62 18 Z" fill="#3E2A22" ${o}/>
    <path d="M24 56 C28 66 38 72 50 73 L62 73 V60 C52 62 38 62 24 56Z" fill="#6B4E3D" opacity=".35"/>
    <ellipse cx="38" cy="38" rx="3.6" ry="4.4" fill="#2B1B16"/><circle cx="39.2" cy="36.6" r="1.2" fill="#FFFFFF"/>
    <path d="M32 30 Q37 27 43 29" stroke="#3E2A22" stroke-width="2.4" fill="none" stroke-linecap="round"/>
    <path d="M27 54 Q33 59 40 55" fill="#FFFFFF" ${o} stroke-width="1.8"/>`);
