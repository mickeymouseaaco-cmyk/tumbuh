/**
 * Geometry for the intraoral (inside-the-mouth) view.
 * Drawn like a dental occlusal photo: upper arch with the palate, lower arch with the tongue.
 * Pure functions returning SVG path strings, so the shapes stay identical everywhere they're drawn.
 */
import type { Jaw, Kind } from './content';

export const MW = 320; // drawing width
export const AH = 200; // height of one arch

/** Left-to-right angles (degrees) of the 10 teeth on an arch, molars at the ends. */
export const ANGLES = [168, 148, 128, 112, 98, 82, 68, 52, 32, 12];
const RX = 112;
const RY = 150;

/** Occlusal crown size in px: w along the arch, d across it. */
export const CROWN: Record<Kind, { w: number; d: number }> = {
  c: { w: 30, d: 17 },
  l: { w: 25, d: 16 },
  k: { w: 24, d: 22 },
  m1: { w: 31, d: 29 },
  m2: { w: 35, d: 33 },
};

const sx = (t: number) => {
  const c = Math.cos(t);
  return Math.sign(c) * Math.pow(Math.abs(c), 0.78);
};

/** Point on the arch midline at angle `deg`. Upper: incisors at the top. Lower: incisors at the bottom. */
export function archPoint(jaw: Jaw, deg: number) {
  const t = (deg * Math.PI) / 180;
  const x = MW / 2 + RX * sx(t);
  const y = jaw === 'U' ? 186 - RY * Math.sin(t) : 14 + RY * Math.sin(t);
  return { x, y };
}

/** Rotation (deg) that turns a crown drawn with its outer (lip/cheek) side at +y to face outward. */
export function crownRotation(jaw: Jaw, deg: number) {
  // use the true normal of the drawn curve
  const a = archPoint(jaw, deg - 0.5);
  const b = archPoint(jaw, deg + 0.5);
  const tx = b.x - a.x;
  const ty = b.y - a.y;
  // outward normal: away from the arch centre
  let nx = -ty;
  let ny = tx;
  const mid = archPoint(jaw, deg);
  const cy = jaw === 'U' ? 186 : 14;
  if ((mid.x - MW / 2) * nx + (mid.y - cy) * ny < 0) {
    nx = -nx;
    ny = -ny;
  }
  // rotation φ maps (0,1) → (-sinφ, cosφ) = n
  return (Math.atan2(-nx, ny) * 180) / Math.PI;
}

const f = (n: number) => n.toFixed(2);

function polyline(points: { x: number; y: number }[], start = 'M') {
  return points.map((p, i) => `${i === 0 ? start : 'L'}${f(p.x)} ${f(p.y)}`).join(' ');
}

/** Midline of the gum band. */
export function gumPath(jaw: Jaw) {
  const pts = [];
  for (let d = 176; d >= 4; d -= 3) pts.push(archPoint(jaw, d));
  return polyline(pts);
}

/** Inner edge offset of the arch (towards the palate/tongue). */
function innerEdge(jaw: Jaw, inset: number, from = 174, to = 6) {
  const pts = [];
  for (let d = from; d >= to; d -= 3) {
    const p = archPoint(jaw, d);
    const r = (crownRotation(jaw, d) * Math.PI) / 180;
    const n = { x: -Math.sin(r), y: Math.cos(r) }; // outward
    pts.push({ x: p.x - n.x * inset, y: p.y - n.y * inset });
  }
  return pts;
}

/** Roof of the mouth inside the upper arch, closed towards the throat. */
export function palatePath() {
  const pts = innerEdge('U', 22);
  const first = pts[0];
  const last = pts[pts.length - 1];
  return `${polyline(pts)} C ${f(last.x)} ${f(last.y + 30)} ${f(first.x)} ${f(first.y + 30)} ${f(first.x)} ${f(first.y)} Z`;
}

/** Tongue inside the lower arch, tip towards the front teeth. */
export function tonguePath() {
  const pts = innerEdge('L', 20, 168, 12);
  const first = pts[0];
  const last = pts[pts.length - 1];
  return `${polyline(pts)} C ${f(last.x + 6)} ${f(last.y - 34)} ${f(first.x - 6)} ${f(first.y - 34)} ${f(first.x)} ${f(first.y)} Z`;
}

/** Palatal ridges (rugae) behind the upper front teeth + midline raphe. */
export function rugaePaths() {
  const cx = MW / 2;
  const top = archPoint('U', 90).y + 26;
  const lines: string[] = [];
  for (let i = 0; i < 3; i++) {
    const y = top + i * 11;
    const w = 20 + i * 7;
    lines.push(`M${f(cx - 3)} ${f(y)} C ${f(cx - w * 0.4)} ${f(y - 5)} ${f(cx - w * 0.7)} ${f(y + 6)} ${f(cx - w)} ${f(y + 1)}`);
    lines.push(`M${f(cx + 3)} ${f(y)} C ${f(cx + w * 0.4)} ${f(y - 5)} ${f(cx + w * 0.7)} ${f(y + 6)} ${f(cx + w)} ${f(y + 1)}`);
  }
  lines.push(`M${f(cx)} ${f(top - 6)} L${f(cx)} ${f(top + 95)}`);
  return lines;
}

/** Tongue's middle groove. */
export function tongueGroove() {
  const cx = MW / 2;
  const tip = archPoint('L', 90).y - 34;
  return `M${f(cx)} ${f(tip - 70)} C ${f(cx - 2)} ${f(tip - 45)} ${f(cx + 2)} ${f(tip - 20)} ${f(cx)} ${f(tip)}`;
}

/* ---------- Crowns, drawn in a local frame: x along the arch, +y towards the lips/cheeks ---------- */

export function crownPath(kind: Kind) {
  const { w, d } = CROWN[kind];
  const h = w / 2;
  if (kind === 'c' || kind === 'l') {
    // incisor: curved lip side, thin biting edge, small cingulum bump on the tongue side
    return `M${-h} ${f(d * 0.05)} C ${f(-h * 0.98)} ${f(d * 0.62)} ${f(h * 0.98)} ${f(d * 0.62)} ${h} ${f(d * 0.05)} C ${f(h * 0.85)} ${f(-d * 0.32)} ${f(h * 0.3)} ${f(-d * 0.62)} 0 ${f(-d * 0.6)} C ${f(-h * 0.3)} ${f(-d * 0.62)} ${f(-h * 0.85)} ${f(-d * 0.32)} ${-h} ${f(d * 0.05)} Z`;
  }
  if (kind === 'k') {
    // canine: rounded diamond with a central cusp
    return `M0 ${f(d * 0.56)} C ${f(h * 0.75)} ${f(d * 0.5)} ${f(h * 1.02)} ${f(d * 0.1)} ${f(h * 0.92)} ${f(-d * 0.12)} C ${f(h * 0.72)} ${f(-d * 0.45)} ${f(h * 0.3)} ${f(-d * 0.56)} 0 ${f(-d * 0.55)} C ${f(-h * 0.3)} ${f(-d * 0.56)} ${f(-h * 0.72)} ${f(-d * 0.45)} ${f(-h * 0.92)} ${f(-d * 0.12)} C ${f(-h * 1.02)} ${f(d * 0.1)} ${f(-h * 0.75)} ${f(d * 0.5)} 0 ${f(d * 0.56)} Z`;
  }
  // molar: soft, slightly bulging square
  const v = d / 2;
  const b = 0.1;
  return `M${f(-h * 0.55)} ${f(-v)} C ${f(-h * 0.2)} ${f(-v * (1 + b))} ${f(h * 0.2)} ${f(-v * (1 + b))} ${f(h * 0.55)} ${f(-v)} C ${f(h * 0.98)} ${f(-v * 0.95)} ${f(h * 1.0)} ${f(-v * 0.6)} ${f(h)} ${f(-v * 0.1)} C ${f(h * (1 + b))} ${f(v * 0.45)} ${f(h * 0.92)} ${f(v * 0.95)} ${f(h * 0.5)} ${f(v)} C ${f(h * 0.2)} ${f(v * (1 + b))} ${f(-h * 0.2)} ${f(v * (1 + b))} ${f(-h * 0.5)} ${f(v)} C ${f(-h * 0.92)} ${f(v * 0.95)} ${f(-h * (1 + b))} ${f(v * 0.45)} ${f(-h)} ${f(-v * 0.1)} C ${f(-h * 1.0)} ${f(-v * 0.6)} ${f(-h * 0.98)} ${f(-v * 0.95)} ${f(-h * 0.55)} ${f(-v)} Z`;
}

/** Fine surface detail: biting edge, cusp tip, or molar grooves. */
export function crownDetail(kind: Kind) {
  const { w, d } = CROWN[kind];
  const h = w / 2;
  if (kind === 'c' || kind === 'l') return [`M${f(-h * 0.78)} ${f(d * 0.12)} C ${f(-h * 0.3)} ${f(d * 0.26)} ${f(h * 0.3)} ${f(d * 0.26)} ${f(h * 0.78)} ${f(d * 0.12)}`];
  if (kind === 'k') return [`M${f(-h * 0.7)} ${f(-d * 0.05)} L0 ${f(d * 0.08)} L${f(h * 0.7)} ${f(-d * 0.05)}`, `M0 ${f(d * 0.08)} L0 ${f(d * 0.42)}`];
  return [
    `M${f(-h * 0.55)} ${f(-d * 0.04)} C ${f(-h * 0.2)} ${f(d * 0.1)} ${f(h * 0.2)} ${f(-d * 0.12)} ${f(h * 0.55)} ${f(d * 0.02)}`,
    `M${f(-h * 0.05)} ${f(-d * 0.05)} L${f(h * 0.02)} ${f(d * 0.4)}`,
    `M${f(h * 0.04)} ${f(-d * 0.04)} L${f(-h * 0.04)} ${f(-d * 0.4)}`,
  ];
}

/** Box size that fits a rotated crown with room for its glow. */
export const boxFor = (kind: Kind) => Math.ceil(Math.max(CROWN[kind].w, CROWN[kind].d) * 1.5 + 10);
