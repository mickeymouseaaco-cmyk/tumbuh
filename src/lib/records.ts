/**
 * Tooth records: what a parent noticed, or what a dentist confirmed, for one tooth.
 *
 * Rules (clinical safety):
 * - A parent's observation is never turned into a diagnosis. "Brown or black spot" stays exactly that,
 *   with "show it to a dentist" advice; only a dentist entry can say "decay (caries)".
 * - Wording is plain BM / English; the dental term appears only in brackets on dentist findings.
 *
 * Photos are big, so they are kept on this phone only (AsyncStorage, one key each) and are not part of
 * the synced account data; an entry just keeps the photo's id.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';

import type { Jaw, Kind, Lang, Side } from './content';

export type By = 'parent' | 'dentist';
export type Entry = { id: string; date: string; by: By; finding: string; note: string; photo?: string };

type Finding = { key: string; by: By; tone: 'success' | 'warning' | 'danger' | 'info'; bm: string; en: string; adviceBm?: string; adviceEn?: string };

export const FINDINGS: Finding[] = [
  // what a parent can see — descriptions only
  { key: 'p-ok', by: 'parent', tone: 'success', bm: 'Nampak sihat', en: 'Looks healthy' },
  { key: 'p-white', by: 'parent', tone: 'warning', bm: 'Tompok putih kapur', en: 'Chalky white spot', adviceBm: 'Tunjukkan kepada doktor gigi pada lawatan seterusnya. Berus 2 kali sehari dengan ubat gigi berfluorida.', adviceEn: 'Show it to a dentist at the next visit. Brush twice a day with fluoride toothpaste.' },
  { key: 'p-brown', by: 'parent', tone: 'warning', bm: 'Tompok perang atau hitam', en: 'Brown or black spot', adviceBm: 'Ini bukan diagnosis. Buat temu janji dengan doktor gigi untuk diperiksa.', adviceEn: 'This is not a diagnosis. Book a dentist visit to have it checked.' },
  { key: 'p-chip', by: 'parent', tone: 'warning', bm: 'Patah atau sumbing', en: 'Chipped or broken', adviceBm: 'Jumpa doktor gigi. Segera jika ada darah, gigi goyang atau sakit.', adviceEn: 'See a dentist. Go soon if there is bleeding, a loose tooth or pain.' },
  { key: 'p-knock', by: 'parent', tone: 'warning', bm: 'Terhantuk / jatuh', en: 'Knocked / fall', adviceBm: 'Perhatikan warna gigi beberapa minggu. Jumpa doktor gigi jika ia goyang, bertukar warna atau gusi bengkak.', adviceEn: 'Watch the colour over the next weeks. See a dentist if it is loose, changes colour or the gum swells.' },
  { key: 'p-pain', by: 'parent', tone: 'danger', bm: 'Anak sakit di sini', en: 'Child has pain here', adviceBm: 'Jumpa doktor gigi. Segera jika ada bengkak atau demam.', adviceEn: 'See a dentist. Go urgently if there is swelling or fever.' },
  { key: 'p-gum', by: 'parent', tone: 'danger', bm: 'Gusi bengkak atau bernanah', en: 'Swollen gum or pus', adviceBm: 'Jumpa doktor gigi secepat mungkin.', adviceEn: 'See a dentist as soon as possible.' },
  { key: 'p-other', by: 'parent', tone: 'info', bm: 'Lain-lain', en: 'Something else' },
  // what a dentist confirmed
  { key: 'd-ok', by: 'dentist', tone: 'success', bm: 'Sihat', en: 'Healthy' },
  { key: 'd-caries', by: 'dentist', tone: 'danger', bm: 'Gigi reput (karies)', en: 'Tooth decay (caries)' },
  { key: 'd-filled', by: 'dentist', tone: 'success', bm: 'Sudah ditampal', en: 'Filled' },
  { key: 'd-varnish', by: 'dentist', tone: 'success', bm: 'Sapuan fluorida', en: 'Fluoride varnish' },
  { key: 'd-watch', by: 'dentist', tone: 'warning', bm: 'Perlu diperhatikan', en: 'Keep an eye on it' },
  { key: 'd-out', by: 'dentist', tone: 'info', bm: 'Dicabut', en: 'Taken out' },
  { key: 'd-other', by: 'dentist', tone: 'info', bm: 'Lain-lain', en: 'Something else' },
];
export const findingOf = (key: string) => FINDINGS.find((f) => f.key === key) ?? FINDINGS[7];

/**
 * FDI number of a baby tooth (two digits): quadrant 5 upper right, 6 upper left, 7 lower left, 8 lower right
 * — the child's own right and left — then 1 central incisor … 5 second molar.
 */
const POS: Record<Kind, number> = { c: 1, l: 2, k: 3, m1: 4, m2: 5 };
export function fdi(jaw: Jaw, kind: Kind, side: Side) {
  const q = jaw === 'U' ? (side === 'R' ? 5 : 6) : side === 'L' ? 7 : 8;
  return `${q}${POS[kind]}`;
}
export function placeName(jaw: Jaw, side: Side, lang: Lang) {
  if (lang === 'bm') return `${jaw === 'U' ? 'Atas' : 'Bawah'} ${side === 'R' ? 'kanan' : 'kiri'} anak`;
  return `${jaw === 'U' ? 'Upper' : 'Lower'} ${side === 'R' ? 'right' : 'left'} (child's)`;
}

/** The newest entry first. */
export const sorted = (list: Entry[] = []) => [...list].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : b.id.localeCompare(a.id)));

/** Colour of the marker on the chart: the newest entry decides. */
export function markerTone(list?: Entry[]) {
  const e = sorted(list)[0];
  if (!e) return null;
  return { by: e.by, tone: findingOf(e.finding).tone };
}

/* ---------- photos, kept on this phone ---------- */

const PK = (id: string) => `tumbuh:toothphoto:${id}`;
const cache: Record<string, string> = {};
export async function savePhoto(uri: string) {
  const id = `ph${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)}`;
  cache[id] = uri;
  await AsyncStorage.setItem(PK(id), uri);
  return id;
}
export const deletePhoto = (id: string) => {
  delete cache[id];
  return AsyncStorage.removeItem(PK(id)).catch(() => {});
};
/** The photo for an id; undefined while loading, null if it isn't on this phone. */
export function usePhoto(id?: string): string | null | undefined {
  const [uri, setUri] = useState<string | null | undefined>(id ? cache[id] : null);
  useEffect(() => {
    if (!id) return setUri(null);
    if (cache[id]) return setUri(cache[id]);
    let live = true;
    setUri(undefined);
    AsyncStorage.getItem(PK(id))
      .then((v) => {
        if (v) cache[id] = v;
        if (live) setUri(v ?? null);
      })
      .catch(() => live && setUri(null));
    return () => {
      live = false;
    };
  }, [id]);
  return uri;
}

/** What each kind of baby tooth is for, and when it usually falls out (standard paediatric charts). */
export const KIND_INFO: Record<Kind, { bm: string; en: string; out: [number, number] }> = {
  c: { bm: 'Gigi depan di tengah, untuk menggigit makanan.', en: 'Front tooth in the middle, for biting food.', out: [6, 8] },
  l: { bm: 'Gigi depan di sebelah gigi tengah, untuk menggigit.', en: 'Front tooth next to the middle one, for biting.', out: [7, 9] },
  k: { bm: 'Gigi tajam di penjuru, untuk mengoyak makanan.', en: 'Pointed corner tooth, for tearing food.', out: [9, 12] },
  m1: { bm: 'Gigi belakang yang lebar, untuk mengunyah.', en: 'Wide back tooth, for chewing.', out: [9, 12] },
  m2: { bm: 'Gigi paling belakang, untuk mengunyah.', en: 'The last back tooth, for chewing.', out: [10, 13] },
};
