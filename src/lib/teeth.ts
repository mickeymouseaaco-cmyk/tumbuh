import { toothAges, toothId, toothName, type Jaw, type Kind, type Lang, type Side } from './content';

export type Status = 'in' | 'due' | 'not';

/** Left-to-right order of one jaw as you look at your baby's mouth. */
export const ARCH: { kind: Kind; side: Side }[] = [
  { kind: 'm2', side: 'R' }, { kind: 'm1', side: 'R' }, { kind: 'k', side: 'R' }, { kind: 'l', side: 'R' }, { kind: 'c', side: 'R' },
  { kind: 'c', side: 'L' }, { kind: 'l', side: 'L' }, { kind: 'k', side: 'L' }, { kind: 'm1', side: 'L' }, { kind: 'm2', side: 'L' },
];

export function statusOf(jaw: Jaw, kind: Kind, side: Side, age: number, erupted: Record<string, boolean>): Status {
  if (erupted[toothId(jaw, kind, side)]) return 'in';
  return age >= toothAges[jaw][kind][0] ? 'due' : 'not';
}

export const range = (r: [number, number], unit: string) => `${r[0]}–${r[1]} ${unit}`;

/** All 10 tooth types, in the usual order they come in. */
export function timeline() {
  const all: { jaw: Jaw; kind: Kind; r: [number, number] }[] = [];
  (['U', 'L'] as Jaw[]).forEach((jaw) =>
    (Object.keys(toothAges[jaw]) as Kind[]).forEach((kind) => all.push({ jaw, kind, r: toothAges[jaw][kind] })),
  );
  return all.sort((a, b) => a.r[0] - b.r[0] || a.r[1] - b.r[1]);
}

/** Teeth usually coming in at this age that aren't marked yet, and the next one after that. */
export function dueAndNext(age: number, erupted: Record<string, boolean>, lang: Lang) {
  const all = timeline();
  const due = all.filter(
    (x) => age >= x.r[0] && age <= x.r[1] && !(erupted[toothId(x.jaw, x.kind, 'R')] && erupted[toothId(x.jaw, x.kind, 'L')]),
  );
  const next = all.find((x) => x.r[0] > age);
  return {
    due: due.map((x) => ({ name: toothName(x.jaw, x.kind, lang), r: x.r })),
    next: next ? { name: toothName(next.jaw, next.kind, lang), r: next.r } : null,
  };
}
