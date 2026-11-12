/**
 * Learn cartoons as data: which parts sit where on a 120×96 stage, and how each one moves.
 * The app animates these (components/cartoon.tsx); design checks draw the very same data.
 *
 * Every scene shows a real action by real people: a parent's hand brushing, a cloth-wrapped
 * finger wiping gums, a child spitting into the sink, the dentist's gloved hand with a mirror.
 */
import { parts, type Part } from './cartoons';
import { INK, adultFace, baby, childReach, gloveGrip, handCloth, handGrip, handPoint } from './people';

/** Give an object the same dark outline as the characters (skips highlights, text and already-stroked shapes). */
function outlined(p: Part, w = 1.3): Part {
  const xml = p.xml.replace(/<(path|rect|circle|ellipse)\b([^>]*?)(\/?)>/g, (m, tag: string, attrs: string, close: string) => {
    if (/stroke=/.test(attrs) || /opacity=/.test(attrs) || /fill="none"/.test(attrs) || !/fill=/.test(attrs)) return m;
    return `<${tag}${attrs} stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"${close}>`;
  });
  return { ...p, xml };
}

const outlinedParts = Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, outlined(v)])) as Record<string, Part>;

export const registry: Record<string, Part> = {
  ...outlinedParts,
  handGrip: handGrip('mum'),
  dadGrip: handGrip('dad'),
  handPoint: handPoint('mum'),
  handCloth: handCloth(),
  gloveGrip: gloveGrip(),
  childReach: childReach(),
  adultFace: adultFace(),
  // the same baby everywhere (mint onesie, white collar, tooth logo), in different moments
  babyWide: baby({ age: 10, mouth: 'wide', teeth: ['U1', 'L1', 'L2'] }),
  babyGums: baby({ age: 3, mouth: 'open' }),
  babyOpen7: baby({ age: 7, mouth: 'open', teeth: ['L1'] }),
  babyBig: baby({ age: 30, mouth: 'wide', teeth: ['U1', 'U2', 'L1', 'L2'] }),
  babySpit: baby({ age: 30, mouth: 'open', teeth: ['U1', 'U2', 'L1', 'L2'] }),
  babyChew: baby({ age: 6, mouth: 'chew', drool: true }),
  babyTeether: baby({ age: 7, mouth: 'chew', teeth: ['L1'] }),
  babyFever: baby({ age: 9, mouth: 'closed', flushed: true }),
  babySmile: baby({ age: 10, mouth: 'grin', teeth: ['L1'] }),
  babyCup: baby({ age: 8, mouth: 'closed' }),
  babySleep: baby({ age: 8, mouth: 'closed', eyes: 'closed' }),
  babyLap: baby({ age: 9, mouth: 'open', teeth: ['L1'] }),
  babyOne: baby({ age: 12, mouth: 'grin', teeth: ['U1', 'L1'] }),
  babyCheck: baby({ age: 12, mouth: 'wide', teeth: ['U1', 'L1', 'L2'] }),
  babyKind: baby({ age: 10, mouth: 'grin', teeth: ['L1'], eyes: 'closed' }),
  babySpoon: baby({ age: 8, mouth: 'open' }),
};

export type Anim = {
  /** x / y: move (px) · r: rotate (deg) · s: scale · sy: squash · o: opacity */
  p: 'x' | 'y' | 'r' | 's' | 'sy' | 'o';
  from: number;
  to: number;
  ms: number;
  delay?: number;
  /** swing: there and back (default) · cycle: there, then jump back (falling, rising) */
  mode?: 'swing' | 'cycle';
};

export type Layer = {
  part?: string;
  text?: string;
  size?: number;
  color?: string; // text colour (default white)
  x: number;
  y: number;
  s?: number;
  r?: number; // fixed rotation
  flip?: boolean;
  origin?: string; // transform origin, e.g. 'top center'
  anims?: Anim[];
};

const scrub = (ms = 170, d = 3): Anim[] => [{ p: 'x', from: -d, to: d, ms }];

export const scenes: Record<string, Layer[]> = {
  /* ---- daily cleaning ---- */
  wipe: [
    { part: 'babyGums', x: 2, y: 0, s: 0.78 },
    { part: 'handCloth', x: 46, y: 42, s: 0.62, anims: [{ p: 'x', from: -2, to: 2, ms: 450 }, { p: 'y', from: -1.5, to: 1.5, ms: 450, delay: 225 }] },
  ],
  brush: [
    { part: 'babyWide', x: 2, y: 0, s: 0.78 },
    { part: 'foam', x: 38, y: 50, s: 0.55, anims: [{ p: 'o', from: 0.2, to: 1, ms: 340 }] },
    { part: 'foam', x: 57, y: 47, s: 0.45, anims: [{ p: 'o', from: 1, to: 0.2, ms: 340 }] },
    { part: 'brush', flip: true, x: 42.6, y: 45.8, s: 0.62, anims: scrub() },
    { part: 'handGrip', x: 55.4, y: 41.8, s: 0.62, anims: scrub() },
  ],
  daynight: [
    { part: 'skyDay', x: 14, y: 8 },
    { part: 'skyNight', x: 14, y: 8, anims: [{ p: 'o', from: 0, to: 1, ms: 1400 }] },
    { part: 'windowFrame', x: 10, y: 4 },
    { text: '2×', x: 12, y: 74, size: 18 },
    { part: 'brushCup', x: 96, y: 74, s: 0.45 },
  ],
  lap: [
    { part: 'lap', x: 0, y: 58 },
    { part: 'babyLap', x: 6, y: 12, s: 0.62, r: -90 },
    { part: 'brush', flip: true, x: 42.5, y: 40.5, s: 0.55, anims: scrub(180, 2.5) },
    { part: 'handGrip', x: 58.5, y: 36.9, s: 0.55, anims: scrub(180, 2.5) },
  ],
  newbrush: [
    { part: 'bin', x: 40, y: 56, s: 0.9 },
    { part: 'brushOld', x: 22, y: 20, s: 0.9, anims: [{ p: 'y', from: 0, to: 34, ms: 1800, mode: 'cycle' }, { p: 'r', from: 0, to: 35, ms: 1800, mode: 'cycle' }, { p: 'o', from: 1, to: 0, ms: 1800, mode: 'cycle' }] },
    { part: 'brush', x: 22, y: 20, s: 0.9, anims: [{ p: 'x', from: 30, to: 0, ms: 1800, mode: 'cycle', delay: 900 }, { p: 'o', from: 0, to: 1, ms: 1800, mode: 'cycle', delay: 900 }] },
    { part: 'calendar', x: 92, y: 4, s: 0.5 },
    { text: '3', x: 98.5, y: 12, size: 12, color: '#1E293B' },
  ],
  parent: [
    { part: 'babyBig', x: 2, y: 0, s: 0.78 },
    { part: 'brush', flip: true, x: 42.6, y: 45.8, s: 0.62, anims: scrub() },
    { part: 'handGrip', x: 55.4, y: 41.8, s: 0.62, anims: scrub() },
    { text: '7–8', x: 84, y: 4, size: 18 },
  ],

  /* ---- toothpaste & fluoride ---- */
  paste: [
    { text: '< 3', x: 2, y: 20, size: 15 },
    { part: 'brush', x: 30, y: 26, s: 0.78 },
    { part: 'blob', x: 68.3, y: 23.3, s: 0.42, origin: 'bottom center', anims: [{ p: 's', from: 0.9, to: 1.1, ms: 700 }] },
    { text: '3–6', x: 2, y: 58, size: 15 },
    { part: 'brush', x: 30, y: 64, s: 0.78 },
    { part: 'blob', x: 63.6, y: 54.9, s: 0.95, origin: 'bottom center', anims: [{ p: 's', from: 0.9, to: 1.1, ms: 700, delay: 350 }] },
  ],
  ppm: [
    { part: 'tubeLabel', x: 8, y: 26, s: 1.3 },
    { part: 'magnifier', x: 20, y: 22, s: 0.9, anims: [{ p: 'x', from: 0, to: 36, ms: 1200 }] },
  ],
  spit: [
    { part: 'babySpit', x: 26, y: 0, s: 0.7 },
    { part: 'sink', x: 26, y: 68, s: 1.2 },
    { part: 'drop', x: 64, y: 52, s: 0.7, anims: [{ p: 'y', from: 0, to: 22, ms: 900, mode: 'cycle' }, { p: 'o', from: 1, to: 0.2, ms: 900, mode: 'cycle' }] },
  ],
  varnish: [
    { part: 'babyWide', x: 2, y: 0, s: 0.78 },
    { part: 'shine', x: 50, y: 44, s: 0.5, anims: [{ p: 'o', from: 0, to: 1, ms: 600 }] },
    { part: 'microbrush', x: 42.9, y: 47.7, s: 0.62, anims: scrub(400, 2.5) },
    { part: 'gloveGrip', x: 59.4, y: 38.4, s: 0.62, anims: scrub(400, 2.5) },
  ],
  reach: [
    { part: 'tube', x: 20, y: 2, s: 0.6 },
    { part: 'shelf', x: 6, y: 20, s: 1.1 },
    { part: 'childReach', x: 44, y: 46, anims: [{ p: 'y', from: 8, to: 0, ms: 700 }] },
  ],

  /* ---- food & drink ---- */
  bedbottle: [
    { part: 'mattress', x: 0, y: 66 },
    { part: 'babySleep', x: 10, y: 8, s: 0.62, r: -90 },
    { part: 'bottle', x: 58, y: 29, s: 0.5, r: -90 },
    { part: 'zzz', x: 70, y: 4, s: 0.8, anims: [{ p: 'y', from: 0, to: -8, ms: 1600, mode: 'cycle' }, { p: 'o', from: 1, to: 0, ms: 1600, mode: 'cycle' }] },
  ],
  cup: [
    { part: 'babyCup', x: 0, y: 4, s: 0.78 },
    { part: 'sippy', x: 46, y: 40, s: 0.72, flip: true, origin: 'top left', anims: [{ p: 'r', from: -8, to: -22, ms: 900 }] },
    { text: '6+', x: 92, y: 6, size: 18 },
  ],
  sweet: [
    { part: 'soda', x: 26, y: 16, s: 1.1 },
    { part: 'candy', x: 62, y: 62, s: 0.9, anims: [{ p: 'r', from: -10, to: 10, ms: 500 }] },
  ],
  water: [
    { part: 'glass', x: 20, y: 30, s: 1.1, anims: [{ p: 'y', from: 0, to: -4, ms: 800 }] },
    { part: 'bottle', x: 68, y: 14, s: 0.95, anims: [{ p: 'y', from: -4, to: 0, ms: 800 }] },
  ],
  honey: [
    { part: 'pacifier', x: 22, y: 50 },
    { part: 'dipper', x: 34, y: 10, s: 0.9, r: -18 },
    { part: 'drip', x: 38, y: 32, s: 0.7, anims: [{ p: 'y', from: 0, to: 14, ms: 1000, mode: 'cycle' }, { p: 'o', from: 1, to: 0, ms: 1000, mode: 'cycle' }] },
    { text: '< 1', x: 88, y: 62, size: 18 },
  ],
  spoon: [
    { part: 'babySpoon', x: 0, y: 22, s: 0.62 },
    { part: 'adultFace', x: 66, y: 22, s: 0.9 },
    { part: 'spoon', x: 52, y: 32, s: 0.7, r: 90, anims: [{ p: 'x', from: 14, to: -18, ms: 1100 }] },
    { part: 'germ', x: 44, y: 46, s: 0.7, anims: [{ p: 'x', from: 14, to: -18, ms: 1100 }] },
  ],

  /* ---- teething ---- */
  signs: [
    { part: 'babyChew', x: 12, y: 0, s: 0.78 },
    { part: 'babyFist', x: 36, y: 50, s: 0.9, anims: [{ p: 'y', from: -2, to: 2, ms: 300 }] },
    { part: 'drop', x: 62, y: 70, s: 0.55, anims: [{ p: 'y', from: 0, to: 16, ms: 1000, mode: 'cycle' }, { p: 'o', from: 1, to: 0, ms: 1000, mode: 'cycle' }] },
  ],
  fever: [
    { part: 'babyFever', x: 0, y: 0, s: 0.78 },
    { part: 'thermoDigital', x: 68, y: 64, s: 0.62 },
    { part: 'thermoDigital', x: 68, y: 64, s: 0.62, anims: [{ p: 'o', from: 1, to: 0.35, ms: 600 }] },
  ],
  finger: [
    { part: 'babyOpen7', x: 2, y: 0, s: 0.78 },
    { part: 'handPoint', x: 44.8, y: 41.8, s: 0.62, anims: [{ p: 'x', from: -2.5, to: 2.5, ms: 380 }] },
  ],
  teether: [
    { part: 'babyTeether', x: 2, y: 0, s: 0.78 },
    { part: 'teether', x: 35.6, y: 42.6, s: 0.55, anims: [{ p: 'y', from: -2, to: 1.5, ms: 420 }, { p: 'r', from: -6, to: 6, ms: 840 }] },
    { part: 'snow', x: 92, y: 4, s: 0.6, anims: [{ p: 'y', from: 0, to: 14, ms: 1800, mode: 'cycle' }, { p: 'o', from: 1, to: 0, ms: 1800, mode: 'cycle' }] },
  ],
  gel: [
    { part: 'gel', x: 8, y: 30, s: 1.2, anims: [{ p: 'sy', from: 1, to: 0.9, ms: 700 }] },
  ],
  amber: [
    { part: 'babySmile', x: 16, y: 2, s: 0.78 },
    { part: 'necklace', x: 40.4, y: 62, s: 0.7, origin: 'top center', anims: [{ p: 'r', from: -4, to: 4, ms: 900 }] },
  ],

  /* ---- dentist ---- */
  firstvisit: [
    { part: 'babyOne', x: 0, y: 4, s: 0.78 },
    { part: 'cake', x: 72, y: 50, s: 0.8, origin: 'bottom center', anims: [{ p: 's', from: 1, to: 1.05, ms: 600 }] },
  ],
  sixmonths: [
    { part: 'calendar', x: 32, y: 18, s: 1.2 },
    { text: '6', x: 51, y: 40, size: 28, color: '#1E293B' },
    { part: 'calendar', x: 32, y: 18, s: 1.2, origin: 'top center', anims: [{ p: 'sy', from: 1, to: 0, ms: 1600, mode: 'cycle' }, { p: 'o', from: 1, to: 0, ms: 1600, mode: 'cycle' }] },
  ],
  quick: [
    { part: 'babyCheck', x: 2, y: 0, s: 0.78 },
    { part: 'mirrorH', x: 43.2, y: 47.2, s: 0.62, anims: [{ p: 'x', from: -2, to: 2, ms: 700 }, { p: 'y', from: -1, to: 1, ms: 520 }] },
    { part: 'gloveGrip', x: 61.4, y: 40.7, s: 0.62, anims: [{ p: 'x', from: -2, to: 2, ms: 700 }, { p: 'y', from: -1, to: 1, ms: 520 }] },
  ],
  kind: [
    { part: 'babyKind', x: 0, y: 8, s: 0.78 },
    { part: 'bubble', x: 66, y: 6, s: 0.8 },
    { part: 'heart', x: 82.5, y: 12, s: 0.45, origin: 'center', anims: [{ p: 's', from: 0.85, to: 1.15, ms: 500 }] },
  ],

  /* ---- topic tiles ---- */
  'topic-fluoride': [
    { part: 'brush', x: 30, y: 52 },
    { part: 'blob', x: 76.8, y: 45.6, s: 0.8, origin: 'bottom center', anims: [{ p: 's', from: 0.3, to: 1, ms: 1200, mode: 'cycle' }] },
    { part: 'tube', x: 22, y: 6, s: 0.95, anims: [{ p: 'sy', from: 1, to: 0.88, ms: 600 }] },
  ],
};

scenes['topic-clean'] = scenes.brush;
scenes['topic-food'] = scenes.water;
scenes['topic-teething'] = scenes.teether;
scenes['topic-dentist'] = [
  { part: 'tooth', x: 58, y: 26, s: 1.05 },
  { part: 'mirror', x: 4, y: 12, s: 1.05, origin: 'bottom left', anims: [{ p: 'r', from: -6, to: 6, ms: 900 }] },
];
