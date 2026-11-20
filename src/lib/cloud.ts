/**
 * Tumbuh account + cloud sync (Firebase Auth + Firestore), the same set-up as Veyra.
 *
 * - The Firebase web config comes from /api/config (Vercel env FIREBASE_CONFIG). Without it the app simply
 *   stays "this phone only".
 * - The Firebase SDK is loaded at run time from Google's CDN, so there is no extra npm package.
 * - All of a parent's data (every child) is one document: users/{uid} = { json, updated }.
 * - Local changes are saved to the phone first, then to the account 600 ms later. Changes made on another
 *   phone arrive live. If both this phone and the account have different data at sign-in, the parent chooses.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const FB_CDN = 'https://www.gstatic.com/firebasejs/13.2.0/';
const K_CFG = 'tumbuh:cfg';
const K_DIRTY = 'tumbuh:dirty';
const K_LOCALONLY = 'tumbuh:localonly';

export type CloudStatus = 'off' | 'connecting' | 'signedout' | 'syncing' | 'synced' | 'offline' | 'choose';
export type CloudState = {
  status: CloudStatus;
  email: string | null;
  /** at sign-in, this phone and the account had different data */
  conflict: { cloudUpdated: number | null } | null;
  /** the parent chose to keep using the app without an account */
  localOnly: boolean;
};

type Bridge = { getJson: () => string; apply: (json: string) => void; reset: () => void; hasData: () => boolean };

let state: CloudState = { status: 'connecting', email: null, conflict: null, localOnly: false };
const listeners = new Set<(s: CloudState) => void>();
const set = (p: Partial<CloudState>) => {
  state = { ...state, ...p };
  listeners.forEach((l) => l(state));
};
export const cloudState = () => state;
export function subscribe(l: (s: CloudState) => void) {
  listeners.add(l);
  return () => void listeners.delete(l);
}

let FB: any = null;
let user: any = null;
let unsub: (() => void) | null = null;
let bridge: Bridge | null = null;
let saveT: ReturnType<typeof setTimeout> | null = null;
let saving = false;
let again = false;
let lastRemote: string | null = null;
let firstSnap = true;
let pendingCloud: string | null = null;
let dirty = false;

const setDirty = (v: boolean) => {
  dirty = v;
  AsyncStorage.setItem(K_DIRTY, v ? '1' : '').catch(() => {});
};

// a dynamic import that the bundler leaves alone (the URL is only known at run time)
const load = (url: string): Promise<any> => new Function('u', 'return import(u)')(url);

/** Called once by the store, after the saved data has been read. */
export async function startCloud(b: Bridge) {
  bridge = b;
  if (Platform.OS !== 'web') return set({ status: 'off' });
  dirty = (await AsyncStorage.getItem(K_DIRTY).catch(() => null)) === '1';
  set({ localOnly: (await AsyncStorage.getItem(K_LOCALONLY).catch(() => null)) === '1' });
  let cfg: any = null;
  try {
    const c = await AsyncStorage.getItem(K_CFG);
    if (c) cfg = JSON.parse(c);
  } catch {}
  try {
    const r = await fetch('/api/config', { cache: 'no-store' });
    if (r.ok) {
      cfg = await r.json();
      AsyncStorage.setItem(K_CFG, JSON.stringify(cfg)).catch(() => {});
    }
  } catch {}
  if (!cfg?.firebase) return set({ status: 'off' });
  try {
    const [app, auth, fs] = await Promise.all(['firebase-app.js', 'firebase-auth.js', 'firebase-firestore.js'].map((f) => load(FB_CDN + f)));
    const a = app.initializeApp(cfg.firebase);
    FB = { auth: auth.getAuth(a), db: fs.getFirestore(a), fa: auth, fs };
    auth.onAuthStateChanged(FB.auth, onUser);
  } catch (e) {
    console.warn('Firebase did not load', e);
    set({ status: 'offline' });
  }
  (globalThis as any).addEventListener?.('online', () => {
    if (user && dirty) flush();
  });
}

/** The store calls this after every change made on this phone. */
export function localChanged() {
  setDirty(true);
  if (!user || state.status === 'choose') return;
  if (saveT) clearTimeout(saveT);
  saveT = setTimeout(() => {
    saveT = null;
    flush();
  }, 600);
}

async function flush() {
  if (!user || !FB || !bridge) return;
  if (saving) {
    again = true;
    return;
  }
  saving = true;
  const json = bridge.getJson();
  set({ status: (globalThis as any).navigator?.onLine === false ? 'offline' : 'syncing' });
  try {
    await FB.fs.setDoc(FB.fs.doc(FB.db, 'users', user.uid), { json, updated: Date.now() });
    lastRemote = json;
    if (json === bridge.getJson()) setDirty(false);
    set({ status: 'synced' });
  } catch (e) {
    console.warn('Save to account failed', e);
    set({ status: 'offline' });
  }
  saving = false;
  if (again) {
    again = false;
    flush();
  }
}

function applyRemote(json: string) {
  lastRemote = json;
  bridge?.apply(json);
  setDirty(false);
  set({ status: 'synced', conflict: null });
}

function onUser(u: any) {
  if (unsub) {
    unsub();
    unsub = null;
  }
  user = u;
  firstSnap = true;
  lastRemote = null;
  if (!u) return set({ status: 'signedout', email: null, conflict: null });
  AsyncStorage.removeItem(K_LOCALONLY).catch(() => {});
  set({ status: 'syncing', email: u.email ?? null, localOnly: false });
  unsub = FB.fs.onSnapshot(
    FB.fs.doc(FB.db, 'users', u.uid),
    (snap: any) => {
      if (snap.metadata.hasPendingWrites || !bridge) return;
      const first = firstSnap;
      firstSnap = false;
      if (!snap.exists()) {
        if (bridge.hasData()) flush();
        else set({ status: 'synced' });
        return;
      }
      const d = snap.data() || {};
      const json = typeof d.json === 'string' ? d.json : null;
      if (!json) return;
      if (json === lastRemote) {
        if (!dirty) set({ status: 'synced' });
        return;
      }
      if (json === bridge.getJson()) {
        lastRemote = json;
        setDirty(false);
        set({ status: 'synced' });
        return;
      }
      // first time on this phone with its own unsaved data: let the parent choose
      if (first && dirty && bridge.hasData()) {
        pendingCloud = json;
        return set({ status: 'choose', conflict: { cloudUpdated: typeof d.updated === 'number' ? d.updated : null } });
      }
      if (!first && dirty) return; // our own newer change is on its way
      applyRemote(json);
    },
    (err: any) => {
      console.warn('Sync stopped', err);
      set({ status: 'offline' });
    },
  );
}

/** Answer to the "which data should I keep?" question. */
export function resolveConflict(keep: 'phone' | 'account') {
  const json = pendingCloud;
  pendingCloud = null;
  set({ conflict: null });
  if (keep === 'account' && json) applyRemote(json);
  else flush();
}

const ERR: Record<string, { bm: string; en: string }> = {
  'auth/invalid-credential': { bm: 'Emel atau kata laluan salah.', en: 'Wrong email or password.' },
  'auth/wrong-password': { bm: 'Emel atau kata laluan salah.', en: 'Wrong email or password.' },
  'auth/user-not-found': { bm: 'Emel atau kata laluan salah.', en: 'Wrong email or password.' },
  'auth/invalid-login-credentials': { bm: 'Emel atau kata laluan salah.', en: 'Wrong email or password.' },
  'auth/email-already-in-use': { bm: 'Emel ini sudah ada akaun. Log masuk sahaja.', en: 'That email already has an account. Sign in instead.' },
  'auth/weak-password': { bm: 'Guna sekurang-kurangnya 6 aksara.', en: 'Use at least 6 characters.' },
  'auth/invalid-email': { bm: 'Semak alamat emel.', en: 'Check the email address.' },
  'auth/missing-password': { bm: 'Masukkan kata laluan.', en: 'Enter your password.' },
  'auth/too-many-requests': { bm: 'Terlalu banyak cubaan. Tunggu beberapa minit.', en: 'Too many tries. Wait a few minutes.' },
  'auth/network-request-failed': { bm: 'Tiada sambungan internet.', en: 'No internet connection.' },
  'auth/requires-recent-login': { bm: 'Log keluar, log masuk semula, kemudian cuba lagi.', en: 'Sign out, sign in again, then try once more.' },
};
export const authMessage = (e: any, lang: 'bm' | 'en') =>
  ERR[e?.code]?.[lang] ?? (lang === 'bm' ? 'Ada masalah. Sila cuba lagi.' : 'Something went wrong. Please try again.');

const need = () => {
  if (!FB) throw { code: 'auth/network-request-failed' };
  return FB;
};
export async function signIn(email: string, pw: string) {
  const f = need();
  await f.fa.signInWithEmailAndPassword(f.auth, email.trim(), pw);
}
export async function signUp(email: string, pw: string) {
  const f = need();
  await f.fa.createUserWithEmailAndPassword(f.auth, email.trim(), pw);
}
export async function resetPassword(email: string) {
  const f = need();
  await f.fa.sendPasswordResetEmail(f.auth, email.trim());
}
/** Signs out. Unsaved changes are sent first; then this phone is cleared (the account keeps everything). */
export async function signOut(): Promise<boolean> {
  if (!FB) return false;
  if (dirty) {
    await flush();
    if (dirty) return false;
  }
  if (unsub) {
    unsub();
    unsub = null;
  }
  await FB.fa.signOut(FB.auth);
  bridge?.reset();
  setDirty(false);
  return true;
}
/** Deletes the account and its data everywhere (needs the password again). */
export async function deleteAccount(pw: string) {
  const f = need();
  await f.fa.reauthenticateWithCredential(user, f.fa.EmailAuthProvider.credential(user.email, pw));
  if (unsub) {
    unsub();
    unsub = null;
  }
  await f.fs.deleteDoc(f.fs.doc(f.db, 'users', user.uid));
  await f.fa.deleteUser(user);
  bridge?.reset();
  setDirty(false);
}
export function chooseLocalOnly() {
  AsyncStorage.setItem(K_LOCALONLY, '1').catch(() => {});
  set({ localOnly: true });
}
