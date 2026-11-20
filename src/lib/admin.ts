/**
 * TEMPORARY editing tools for Masalah (problems).
 *
 * While ADMIN_EDITING is true, each category shows a "+" to add a condition with a photo, and every
 * card's sheet can add/change its photo. Everything is kept on THIS phone only (AsyncStorage) until it is
 * exported as one file ("tumbuh-masalah.json") and sent to Claude, who builds it into the app for everyone.
 * Remove these tools by setting ADMIN_EDITING to false (or deleting this file and its uses).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

import type { Problem, Tag } from './content';

export const ADMIN_EDITING = true;

export type CustomProblem = Problem & { stack: string; photo?: string };
/** hidden: built-in conditions taken off the list; noPhoto: built-in photos taken off; tags: changed levels */
type AdminData = { custom: CustomProblem[]; photos: Record<string, string>; hidden: string[]; noPhoto: string[]; tags: Record<string, Tag> };

const KEY = 'tumbuh:admin:v1';
let data: AdminData = { custom: [], photos: {}, hidden: [], noPhoto: [], tags: {} };
let loaded = false;
const listeners = new Set<(d: AdminData) => void>();

function save(next: AdminData) {
  data = next;
  listeners.forEach((l) => l(data));
  AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {
    if (Platform.OS === 'web') {
      // eslint-disable-next-line no-alert
      (globalThis as any).alert?.('Storan telefon penuh. Hantar (export) fail sekarang, kemudian teruskan.');
    }
  });
}

if (ADMIN_EDITING) {
  AsyncStorage.getItem(KEY)
    .then((raw) => {
      if (raw) data = { custom: [], photos: {}, hidden: [], noPhoto: [], tags: {}, ...JSON.parse(raw) };
    })
    .catch(() => {})
    .finally(() => {
      loaded = true;
      listeners.forEach((l) => l(data));
    });
}

export function useAdmin() {
  const [d, setD] = useState(data);
  useEffect(() => {
    listeners.add(setD);
    if (loaded) setD(data);
    return () => void listeners.delete(setD);
  }, []);
  return {
    enabled: ADMIN_EDITING,
    custom: d.custom,
    photos: d.photos,
    upsert: (p: CustomProblem) => save({ ...data, custom: [...data.custom.filter((x) => x.id !== p.id), p] }),
    remove: (id: string) => {
      const photos = { ...data.photos };
      delete photos[id];
      save({ ...data, custom: data.custom.filter((x) => x.id !== id), photos });
    },
    setPhoto: (id: string, uri: string | null) => {
      const photos = { ...data.photos };
      if (uri) photos[id] = uri;
      else delete photos[id];
      // a new photo brings back a built-in slot that was emptied
      save({ ...data, photos, noPhoto: uri ? data.noPhoto.filter((x) => x !== id) : data.noPhoto });
    },
    hidden: d.hidden,
    tags: d.tags,
    /** the level shown for a condition: urgent / need check / usually fine */
    tagOf: (p: Problem): Tag => d.tags[p.id] ?? p.tag,
    setTag: (id: string, tag: Tag) => {
      const custom = data.custom.map((x) => (x.id === id ? { ...x, tag } : x));
      save({ ...data, custom, tags: { ...data.tags, [id]: tag } });
    },
    noPhoto: d.noPhoto,
    /** take a built-in condition off its list */
    hide: (id: string) => save({ ...data, hidden: [...data.hidden.filter((x) => x !== id), id] }),
    /** take a built-in photo off (the card shows the empty placeholder) */
    dropBuiltInPhoto: (id: string) => {
      const photos = { ...data.photos };
      delete photos[id];
      save({ ...data, photos, noPhoto: [...data.noPhoto.filter((x) => x !== id), id] });
    },
    /** undo every removal of built-in conditions and photos */
    restoreRemoved: () => save({ ...data, hidden: [], noPhoto: [] }),
    count: d.custom.length + Object.keys(d.photos).length + d.hidden.length + d.noPhoto.length + Object.keys(d.tags).length,
  };
}

/**
 * Pick a photo from the phone (web/Safari): resized to ≤ 900 px JPEG and returned as a data URL.
 * The file input is attached to the page while it's open: iPhone Safari drops the "change" event
 * of an input that isn't in the document, so the chosen photo would never arrive.
 */
export function pickPhoto(max = 900): Promise<string | null> {
  const doc = (globalThis as any).document;
  if (Platform.OS !== 'web' || !doc) return Promise.resolve(null);
  return new Promise((resolve) => {
    const input = doc.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.cssText = 'position:fixed;left:-1000px;top:0;width:1px;height:1px;opacity:0;';
    doc.body.appendChild(input);
    let done = false;
    const finish = (v: string | null) => {
      if (done) return;
      done = true;
      input.remove();
      resolve(v);
    };
    // the picker was closed without choosing (supported in recent Safari)
    input.addEventListener('cancel', () => finish(null));
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) return finish(null);
      // read the file, then shrink it on a canvas; if the photo can't be decoded for resizing, keep it as is
      const reader = new (globalThis as any).FileReader();
      reader.onload = () => {
        const raw = reader.result as string;
        const img = new (globalThis as any).Image();
        img.onload = () => {
          try {
            const k = Math.min(1, max / Math.max(img.naturalWidth || img.width, img.naturalHeight || img.height));
            const canvas = doc.createElement('canvas');
            canvas.width = Math.max(1, Math.round((img.naturalWidth || img.width) * k));
            canvas.height = Math.max(1, Math.round((img.naturalHeight || img.height) * k));
            canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
            finish(canvas.toDataURL('image/jpeg', 0.8));
          } catch {
            finish(raw);
          }
        };
        img.onerror = () => finish(raw);
        img.src = raw;
      };
      reader.onerror = () => finish(null);
      reader.readAsDataURL(file);
    });
    input.click();
  });
}

/** Save everything as one file to send to Claude (share sheet on iPhone, download elsewhere). */
export async function exportAdmin() {
  const doc = (globalThis as any).document;
  const nav = (globalThis as any).navigator;
  const json = JSON.stringify({ app: 'tumbuh', kind: 'masalah-edits', exportedAt: new Date().toISOString(), ...data }, null, 1);
  if (Platform.OS !== 'web' || !doc) return false;
  const name = 'tumbuh-masalah.json';
  const File_ = (globalThis as any).File;
  try {
    const file = new File_([json], name, { type: 'application/json' });
    if (nav?.canShare?.({ files: [file] })) {
      await nav.share({ files: [file], title: name });
      return true;
    }
  } catch {
    // fall through to a plain download
  }
  const blob = new (globalThis as any).Blob([json], { type: 'application/json' });
  const a = doc.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  doc.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(a.href);
    a.remove();
  }, 1000);
  return true;
}
