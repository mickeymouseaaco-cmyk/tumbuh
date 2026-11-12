/**
 * Cartoon parts in natural colours, as SVG markup. Rendered in the app with react-native-svg's SvgXml,
 * and animated by moving whole parts (scenes in components/cartoon.tsx).
 */
export type Part = { w: number; h: number; xml: string };

const svg = (w: number, h: number, body: string): Part => ({
  w,
  h,
  xml: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>`,
});

export const parts = {
  // blue toothbrush, bristles up, head on the right
  brush: svg(64, 22, `
    <rect x="1" y="12" width="40" height="7" rx="3.5" fill="#3B82F6"/>
    <rect x="8" y="13.5" width="16" height="4" rx="2" fill="#93C5FD"/>
    <path d="M40 13.5 L46 12 L46 19 L40 18 Z" fill="#2563EB"/>
    <rect x="45" y="11" width="18" height="9" rx="3" fill="#3B82F6"/>
    <rect x="46" y="3" width="16" height="8.5" rx="1.6" fill="#FFFFFF"/>
    <path d="M49 4v7M52 4v7M55 4v7M58 4v7" stroke="#CFE0F2" stroke-width="1"/>`),
  // the same brush with a swirl of toothpaste on top
  brushPaste: svg(64, 30, `
    <g transform="translate(0 8)">
      <rect x="1" y="12" width="40" height="7" rx="3.5" fill="#3B82F6"/>
      <rect x="8" y="13.5" width="16" height="4" rx="2" fill="#93C5FD"/>
      <path d="M40 13.5 L46 12 L46 19 L40 18 Z" fill="#2563EB"/>
      <rect x="45" y="11" width="18" height="9" rx="3" fill="#3B82F6"/>
      <rect x="46" y="3" width="16" height="8.5" rx="1.6" fill="#FFFFFF"/>
      <path d="M49 4v7M52 4v7M55 4v7M58 4v7" stroke="#CFE0F2" stroke-width="1"/>
    </g>
    <path d="M45 11 C45 5 49 3 54 3 C59 3 63 6 62 11 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width=".8"/>
    <path d="M47 9 C50 6 56 5.5 60 8.5" stroke="#38BDF8" stroke-width="1.8" fill="none" stroke-linecap="round"/>`),
  // old, splayed brush (grey)
  brushOld: svg(64, 22, `
    <rect x="1" y="12" width="40" height="7" rx="3.5" fill="#94A3B8"/>
    <path d="M40 13.5 L46 12 L46 19 L40 18 Z" fill="#64748B"/>
    <rect x="45" y="11" width="18" height="9" rx="3" fill="#94A3B8"/>
    <path d="M47 11 L43 2 M50 11 L48 3 M53 11 L53 3 M56 11 L58 3 M59 11 L64 2" stroke="#E2E8F0" stroke-width="2.2" stroke-linecap="round"/>`),
  // friendly baby tooth
  tooth: svg(48, 52, `
    <path d="M14 4C8 4 4 9 4 16c0 6 2.4 10 3.8 15 1.8 6 2 14 5 21 1.2 3 4.6 3 5.4-.3L21 40c.8-3 4.6-3 5.4 0l2.8 11.7c.8 3.3 4.2 3.3 5.4.3 3-7 3.2-15 5-21C41 26 44 22 44 16 44 9 40 4 34 4c-4.6 0-6.4 3-10 3S18.6 4 14 4z" fill="#FFFFFF" stroke="#D9D2C9" stroke-width="1.4"/>
    <ellipse cx="13" cy="12" rx="4" ry="2.4" fill="#FFFFFF" stroke="#EDE7E0" stroke-width=".6" transform="rotate(-25 13 12)"/>
    <circle cx="18" cy="20" r="2.2" fill="#2B2235"/><circle cx="30" cy="20" r="2.2" fill="#2B2235"/>
    <path d="M19 27 Q24 31 29 27" stroke="#2B2235" stroke-width="1.8" fill="none" stroke-linecap="round"/>
    <ellipse cx="13.5" cy="25" rx="3" ry="1.8" fill="#FCA5A5" opacity=".7"/><ellipse cx="34.5" cy="25" rx="3" ry="1.8" fill="#FCA5A5" opacity=".7"/>`),
  // toothpaste tube (white with blue band, red cap), nozzle on the right
  tube: svg(70, 30, `
    <path d="M6 4 H48 L58 10 V20 L48 26 H6 C3.8 26 2 24.2 2 22 V8 C2 5.8 3.8 4 6 4Z" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.2"/>
    <path d="M6 4 V26 M9 4 V26" stroke="#CBD5E1" stroke-width="1"/>
    <rect x="16" y="8" width="26" height="14" rx="3" fill="#2563EB"/>
    <path d="M20 15 h18" stroke="#FFFFFF" stroke-width="2.4" stroke-linecap="round"/>
    <rect x="57" y="10.5" width="8" height="9" rx="2" fill="#EF4444"/>
    <path d="M58 12.5 h6 M58 15 h6 M58 17.5 h6" stroke="#B91C1C" stroke-width=".8"/>`),
  // blob of paste
  blob: svg(18, 12, `<path d="M1 11 C1 4 5 1 9 1 C13 1 17 4 17 11 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width=".8"/><path d="M3.5 8 C6 5 11 4.5 15 7" stroke="#38BDF8" stroke-width="1.6" fill="none" stroke-linecap="round"/>`),
  // baby bottle with milk
  bottle: svg(32, 64, `
    <path d="M12 2 C12 0.8 20 0.8 20 2 L21.5 10 H10.5 Z" fill="#F4C9A0"/>
    <rect x="7" y="9.5" width="18" height="7" rx="2.5" fill="#60A5FA"/>
    <path d="M8 17 H24 L26 21 V58 C26 60.8 23.8 63 21 63 H11 C8.2 63 6 60.8 6 58 V21 Z" fill="#E0F2FE" fill-opacity=".55" stroke="#BAE6FD" stroke-width="1.2"/>
    <path d="M6.6 28 H25.4 V58 C25.4 60.4 23.4 62.4 21 62.4 H11 C8.6 62.4 6.6 60.4 6.6 58 Z" fill="#FFFDF5"/>
    <path d="M9 34 h5 M9 41 h5 M9 48 h5" stroke="#93C5FD" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M21 31 V56" stroke="#FFFFFF" stroke-width="2.2" stroke-linecap="round" opacity=".9"/>`),
  // sippy cup with handles
  sippy: svg(56, 50, `
    <path d="M18 4 C18 1 26 1 26 4 L27 12 H17 Z" fill="#FBBF24"/>
    <rect x="11" y="11" width="22" height="7" rx="3" fill="#FBBF24"/>
    <path d="M13 18 H31 L29 46 C29 48 27.5 49 26 49 H18 C16.5 49 15 48 15 46 Z" fill="#34D399"/>
    <path d="M13 24 C4 24 4 38 14 38" stroke="#10B981" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M31 24 C40 24 40 38 30 38" stroke="#10B981" stroke-width="4" fill="none" stroke-linecap="round"/>
    <path d="M18 24 V42" stroke="#A7F3D0" stroke-width="2.2" stroke-linecap="round"/>`),
  // glass of water
  glass: svg(34, 46, `
    <path d="M3 3 H31 L27.5 43 C27.3 44.6 26 45 24.5 45 H9.5 C8 45 6.7 44.6 6.5 43 Z" fill="#E0F2FE" fill-opacity=".35" stroke="#BAE6FD" stroke-width="1.4"/>
    <path d="M5.2 16 H28.8 L27.5 43 C27.3 44.4 26 44.6 24.5 44.6 H9.5 C8 44.6 6.7 44.4 6.5 43 Z" fill="#7DD3FC"/>
    <path d="M10 22 V38" stroke="#E0F2FE" stroke-width="2.2" stroke-linecap="round"/>`),
  // cup of soft drink with a straw
  soda: svg(36, 54, `
    <path d="M22 1 L25 1 L21 16 H18 Z" fill="#EF4444"/><path d="M22.6 4 L24 4 M21.6 8 L23 8 M20.6 12 L22 12" stroke="#FFFFFF" stroke-width="1.6"/>
    <path d="M3 14 H33 V19 H3 Z" fill="#F97316"/>
    <path d="M5 19 H31 L28 51 C27.8 52.6 26.6 53 25 53 H11 C9.4 53 8.2 52.6 8 51 Z" fill="#FB923C"/>
    <circle cx="18" cy="34" r="7" fill="#FFF7ED"/><path d="M15 34 h6" stroke="#F97316" stroke-width="2"/>`),
  // wrapped sweet
  candy: svg(46, 22, `
    <path d="M2 4 L12 11 L2 18 Z" fill="#FDE047"/><path d="M44 4 L34 11 L44 18 Z" fill="#FDE047"/>
    <ellipse cx="23" cy="11" rx="12" ry="9" fill="#F472B6"/>
    <path d="M15 5 L20 17 M23 2 L28 19 M30 4 L32 12" stroke="#FFFFFF" stroke-width="2.6" stroke-linecap="round"/>`),
  // honey jar
  honey: svg(44, 50, `
    <rect x="9" y="3" width="26" height="8" rx="3" fill="#92400E"/>
    <path d="M7 12 H37 C40 12 42 15 42 18 V42 C42 46 39 48 35 48 H9 C5 48 2 46 2 42 V18 C2 15 4 12 7 12 Z" fill="#F59E0B"/>
    <path d="M7 12 C8 18 12 18 13 13 C14 20 19 20 20 13 C21 19 26 19 27 13 C28 18 32 18 33 13" fill="#FBBF24"/>
    <rect x="11" y="24" width="22" height="13" rx="3" fill="#FEF3C7"/>
    <path d="M15 30.5 h14" stroke="#B45309" stroke-width="2" stroke-linecap="round"/>
    <path d="M7 20 V38" stroke="#FDE68A" stroke-width="2.6" stroke-linecap="round" opacity=".8"/>`),
  drip: svg(10, 14, `<path d="M5 1 C5 1 9 7 9 9.5 A4 4 0 0 1 1 9.5 C1 7 5 1 5 1Z" fill="#F59E0B"/>`),
  // spoon (silver)
  spoon: svg(16, 60, `<ellipse cx="8" cy="11" rx="7" ry="10" fill="#CBD5E1" stroke="#94A3B8" stroke-width="1"/><ellipse cx="6" cy="8" rx="2.2" ry="4" fill="#F1F5F9"/><rect x="6" y="20" width="4" height="38" rx="2" fill="#94A3B8"/>`),
  sun: svg(48, 48, `<g stroke="#FBBF24" stroke-width="3" stroke-linecap="round"><path d="M24 2v6M24 40v6M2 24h6M40 24h6M8.4 8.4l4.2 4.2M35.4 35.4l4.2 4.2M8.4 39.6l4.2-4.2M35.4 12.6l4.2-4.2"/></g><circle cx="24" cy="24" r="11" fill="#FCD34D"/><circle cx="20" cy="20" r="3.4" fill="#FEF3C7" opacity=".9"/>`),
  moon: svg(44, 44, `<path d="M30 4 A18 18 0 1 0 40 30 A14 14 0 1 1 30 4Z" fill="#FDE68A"/><circle cx="16" cy="26" r="2.4" fill="#FBBF24" opacity=".6"/><circle cx="22" cy="34" r="1.6" fill="#FBBF24" opacity=".6"/><path d="M38 8 l1 2.2 2.2 1 -2.2 1 -1 2.2 -1 -2.2 -2.2 -1 2.2 -1z" fill="#FEF9C3"/>`),
  // soft cloth
  cloth: svg(40, 34, `<path d="M4 6 C12 2 28 2 36 6 C38 14 38 22 35 30 C26 33 14 33 5 30 C2 22 2 14 4 6Z" fill="#7DD3FC"/><path d="M10 10 C18 8 26 8 32 11 M9 18 C17 16 25 16 33 19" stroke="#E0F2FE" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="30" cy="25" r="2" fill="#E0F2FE"/>`),
  // grown-up hand with pointing finger
  hand: svg(46, 40, `<path d="M4 22 C4 16 8 13 14 13 H30 C33 13 34 15.5 33 17 H38 C41.5 17 43 19 43 21 C43 23 41.5 24.5 38 24.5 H32 C34.5 25 35 28 32.5 29.5 C34 30.5 33.5 33.5 31 34 H14 C8 34 4 30 4 25 Z" fill="#E8B48F" stroke="#C98E68" stroke-width="1.2"/><path d="M30 24.5 H33 M29 29.5 H31.5" stroke="#C98E68" stroke-width="1.2" stroke-linecap="round"/><ellipse cx="39.5" cy="20.8" rx="2" ry="1.6" fill="#F5D0B5"/>`),
  thermometer: svg(18, 60, `<rect x="5" y="2" width="8" height="44" rx="4" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.2"/><circle cx="9" cy="50" r="7" fill="#EF4444" stroke="#DC2626" stroke-width="1"/><path d="M5 10h3M5 18h3M5 26h3M5 34h3" stroke="#94A3B8" stroke-width="1"/>`),
  mercury: svg(4, 40, `<rect x="0" y="0" width="4" height="40" rx="2" fill="#EF4444"/>`),
  // teething ring
  teether: svg(60, 60, `
    <path d="M24 17 a19 19 0 1 0 0.01 0Z M24 27.5 a8.5 8.5 0 1 1 -0.01 0Z" fill="#34D399" fill-rule="evenodd"/>
    <g fill="#A7F3D0"><circle cx="15" cy="24" r="2.6"/><circle cx="9" cy="34" r="2.6"/><circle cx="11" cy="45" r="2.6"/><circle cx="22" cy="52" r="2.6"/><circle cx="34" cy="49" r="2.6"/></g>
    <rect x="34" y="14" width="10" height="16" rx="5" transform="rotate(45 39 22)" fill="#FBBF24"/>
    <circle cx="48" cy="12" r="9" fill="#FBBF24"/><circle cx="48" cy="12" r="4" fill="#FDE68A"/>`),
  snow: svg(24, 24, `<g stroke="#BAE6FD" stroke-width="2.2" stroke-linecap="round"><path d="M12 2v20M3.3 7l17.4 10M3.3 17L20.7 7"/><path d="M9 4l3 3 3-3M9 20l3-3 3 3"/></g>`),
  // numbing gel tube (small purple)
  gel: svg(56, 24, `<path d="M5 3 H38 L46 8 V16 L38 21 H5 C3.3 21 2 19.7 2 18 V6 C2 4.3 3.3 3 5 3Z" fill="#EDE9FE" stroke="#C4B5FD" stroke-width="1.2"/><rect x="12" y="7" width="20" height="10" rx="2.5" fill="#8B5CF6"/><rect x="45" y="9" width="9" height="6" rx="2" fill="#6D28D9"/>`),
  // amber bead necklace
  necklace: svg(64, 40, `<path d="M4 4 C10 34 54 34 60 4" stroke="#A16207" stroke-width="1.4" fill="none"/>${[[7, 13], [12, 21], [19, 27], [27, 30.5], [37, 30.5], [45, 27], [52, 21], [57, 13]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="4.4" ry="3.6" fill="#F59E0B"/><ellipse cx="${x - 1.2}" cy="${y - 1}" rx="1.4" ry="1" fill="#FDE68A"/>`).join('')}`),
  // dental mirror
  mirror: svg(60, 60, `<rect x="4" y="34" width="34" height="6" rx="3" transform="rotate(-45 21 37)" fill="#94A3B8"/><rect x="10" y="40" width="14" height="4" rx="2" transform="rotate(-45 17 42)" fill="#CBD5E1"/><circle cx="42" cy="18" r="13" fill="#64748B"/><circle cx="42" cy="18" r="10.5" fill="#E2E8F0"/><path d="M36 14 A7 7 0 0 1 42 10" stroke="#FFFFFF" stroke-width="2.6" fill="none" stroke-linecap="round"/>`),
  // birthday cake with one candle
  cake: svg(56, 50, `<rect x="25" y="8" width="5" height="14" rx="2" fill="#60A5FA"/><path d="M27.5 0 C30 4 30 6.5 27.5 7.5 C25 6.5 25 4 27.5 0Z" fill="#FBBF24"/><rect x="6" y="22" width="44" height="26" rx="5" fill="#FCD9A8"/><path d="M6 27 C10 32 14 26 18 31 C22 26 26 32 30 27 C34 32 38 26 42 31 C46 26 48 30 50 27 V24 C50 23 49 22 48 22 H8 C7 22 6 23 6 24 Z" fill="#FFFFFF"/><circle cx="16" cy="39" r="2" fill="#F87171"/><circle cx="28" cy="40" r="2" fill="#34D399"/><circle cx="40" cy="39" r="2" fill="#60A5FA"/>`),
  // calendar page
  calendar: svg(46, 48, `<rect x="2" y="6" width="42" height="40" rx="6" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.2"/><path d="M2 12 C2 8.7 4.7 6 8 6 H38 C41.3 6 44 8.7 44 12 V16 H2 Z" fill="#EF4444"/><rect x="11" y="1" width="4" height="10" rx="2" fill="#94A3B8"/><rect x="31" y="1" width="4" height="10" rx="2" fill="#94A3B8"/>`),
  heart: svg(40, 36, `<path d="M20 34 C8 26 2 19 2 11.5 C2 6 6 2 11 2 C15 2 18 4.4 20 7.6 C22 4.4 25 2 29 2 C34 2 38 6 38 11.5 C38 19 32 26 20 34Z" fill="#EF4444"/><ellipse cx="11" cy="10" rx="3.6" ry="2.4" fill="#FCA5A5" transform="rotate(-30 11 10)"/>`),
  bubble: svg(64, 50, `<path d="M10 2 H54 C58.4 2 62 5.6 62 10 V32 C62 36.4 58.4 40 54 40 H24 L12 48 L14 40 H10 C5.6 40 2 36.4 2 32 V10 C2 5.6 5.6 2 10 2Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.2"/>`),
  // padlock
  lock: svg(34, 40, `<path d="M9 18 V12 A8 8 0 0 1 25 12 V18" stroke="#94A3B8" stroke-width="4" fill="none"/><rect x="3" y="17" width="28" height="21" rx="5" fill="#FBBF24"/><circle cx="17" cy="26" r="3" fill="#92400E"/><rect x="15.6" y="27" width="2.8" height="6" rx="1.4" fill="#92400E"/>`),
  // shelf
  shelf: svg(80, 10, `<rect x="0" y="0" width="80" height="6" rx="2" fill="#B45309"/><rect x="6" y="6" width="5" height="4" fill="#92400E"/><rect x="69" y="6" width="5" height="4" fill="#92400E"/>`),
  // crib / bed corner
  crib: svg(84, 40, `<rect x="2" y="26" width="80" height="8" rx="3" fill="#D6A06B"/><path d="M8 4 V26 M20 4 V26 M32 4 V26 M44 4 V26 M56 4 V26 M68 4 V26 M78 4 V26" stroke="#E7BC8A" stroke-width="3.4" stroke-linecap="round"/><rect x="2" y="2" width="80" height="5" rx="2.5" fill="#D6A06B"/><rect x="6" y="20" width="72" height="7" rx="3" fill="#BFDBFE"/>`),
  pillow: svg(80, 26, `<path d="M6 6 C26 1 54 1 74 6 C79 12 79 18 74 22 C54 26 26 26 6 22 C1 18 1 12 6 6Z" fill="#DBEAFE"/><path d="M12 10 C30 7 50 7 68 10" stroke="#FFFFFF" stroke-width="2" fill="none" stroke-linecap="round"/>`),
  drop: svg(12, 16, `<path d="M6 1 C6 1 11 8 11 10.5 A5 5 0 0 1 1 10.5 C1 8 6 1 6 1Z" fill="#7DD3FC"/><ellipse cx="4.4" cy="10.5" rx="1.2" ry="2" fill="#E0F2FE"/>`),
  foam: svg(10, 10, `<circle cx="5" cy="5" r="4" fill="#FFFFFF" fill-opacity=".85" stroke="#E0F2FE" stroke-width="1"/><circle cx="3.6" cy="3.6" r="1.1" fill="#FFFFFF"/>`),
  sink: svg(70, 24, `<path d="M2 2 H68 C68 14 56 22 35 22 C14 22 2 14 2 2Z" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="1.2"/><ellipse cx="35" cy="8" rx="8" ry="2.4" fill="#94A3B8"/>`),
  shine: svg(16, 16, `<path d="M8 0 L9.6 6.4 L16 8 L9.6 9.6 L8 16 L6.4 9.6 L0 8 L6.4 6.4Z" fill="#FFFFFF"/>`),
} satisfies Record<string, Part>;

export type PartName = keyof typeof parts;
