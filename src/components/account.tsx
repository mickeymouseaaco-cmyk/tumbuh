/**
 * Account (Firebase) UI: the cloud button in the header, the sign-in / account sheet, and the
 * "which data should I keep?" choice. Hidden entirely when the site has no Firebase config.
 */
import { Cloud, CloudOff, LogOut, RefreshCw, Smartphone, Trash2, X } from 'lucide-react-native';
import { useEffect, useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, Display, PressableScale, T } from '@/components/ui';
import {
  authMessage,
  chooseLocalOnly,
  cloudState,
  deleteAccount,
  resetPassword,
  resolveConflict,
  signIn,
  signOut,
  signUp,
  subscribe,
  type CloudState,
} from '@/lib/cloud';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { fonts, radius, tone, typo, useTheme } from '@/theme';

export function useCloud() {
  const [s, setS] = useState<CloudState>(cloudState());
  useEffect(() => subscribe(setS), []);
  return s;
}

const L = {
  bm: {
    account: 'Akaun',
    signInTitle: 'Log masuk',
    signUpTitle: 'Daftar akaun',
    why: 'Log masuk supaya data semua anak disimpan dengan selamat dan sama di semua telefon anda.',
    whyUp: 'Data anda peribadi untuk akaun anda sahaja.',
    email: 'Emel',
    pw: 'Kata laluan',
    go: 'Log masuk',
    goUp: 'Daftar',
    switchUp: 'Belum ada akaun? Daftar',
    switchIn: 'Sudah ada akaun? Log masuk',
    forgot: 'Lupa kata laluan',
    resetSent: 'Emel tukar kata laluan sudah dihantar.',
    typeEmail: 'Taip emel anda dahulu.',
    localOnly: 'Guna di telefon ini sahaja',
    synced: 'Data disegerak ke akaun anda',
    syncing: 'Sedang menyimpan…',
    offline: 'Tiada internet. Akan disimpan bila sambungan kembali.',
    signOut: 'Log keluar',
    signOutNote: 'Selepas log keluar, data dipadam dari telefon ini (masih selamat dalam akaun).',
    notSaved: 'Ada perubahan belum sampai ke akaun. Sambung internet dahulu.',
    danger: 'Padam akaun',
    del: 'Padam akaun dan semua data',
    delNote: 'Ini memadam akaun dan semua data anak di semua telefon. Masukkan kata laluan untuk sahkan.',
    delGo: 'Padam selama-lamanya',
    chooseTitle: 'Simpan data yang mana?',
    chooseSub: 'Telefon ini ada data yang belum ada dalam akaun anda.',
    phone: 'Telefon ini',
    cloud: 'Akaun saya',
    kids: (n: number) => `${n} anak`,
    saved: 'disimpan',
    chooseNote: 'Salinan satu lagi akan diganti.',
    close: 'Tutup',
  },
  en: {
    account: 'Account',
    signInTitle: 'Sign in',
    signUpTitle: 'Create account',
    why: 'Sign in to keep every child’s data safe and the same on all your phones.',
    whyUp: 'Your data is private to your account. Only you can see it.',
    email: 'Email',
    pw: 'Password',
    go: 'Sign in',
    goUp: 'Create account',
    switchUp: 'No account yet? Create one',
    switchIn: 'Have an account? Sign in',
    forgot: 'Forgot password',
    resetSent: 'Password reset email sent.',
    typeEmail: 'Type your email first.',
    localOnly: 'Use on this phone only',
    synced: 'Data synced to your account',
    syncing: 'Saving…',
    offline: 'No internet. It will save when you’re back online.',
    signOut: 'Sign out',
    signOutNote: 'Signing out clears this phone (everything stays safe in your account).',
    notSaved: 'Some changes haven’t reached your account yet. Connect to the internet first.',
    danger: 'Delete account',
    del: 'Delete my account and data',
    delNote: 'This removes your account and every child’s data on every phone. Enter your password to confirm.',
    delGo: 'Delete forever',
    chooseTitle: 'Which data should I keep?',
    chooseSub: 'This phone has data that isn’t in your account yet.',
    phone: 'This phone',
    cloud: 'My account',
    kids: (n: number) => `${n} ${n === 1 ? 'child' : 'children'}`,
    saved: 'saved',
    chooseNote: 'The other copy will be replaced.',
    close: 'Close',
  },
};

function Sheet({ title, onClose, children }: { title: string; onClose?: () => void; children: ReactNode }) {
  const { c } = useTheme();
  const { lang } = useStore();
  const insets = useSafeAreaInsets();
  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose ?? (() => {})}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40 }} keyboardShouldPersistTaps="handled">
          <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center', gap: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <Display style={{ flex: 1, fontSize: 26, lineHeight: 32 }}>{title}</Display>
              {onClose ? (
                <PressableScale accessibilityRole="button" accessibilityLabel={L[lang].close} onPress={onClose} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
                  <X size={22} color={c.text} />
                </PressableScale>
              ) : null}
            </View>
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function Field(props: { label: string; value: string; onChangeText: (v: string) => void; secure?: boolean; email?: boolean }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: 6 }}>
      <T style={[typo.caption, { color: c.textMuted }]}>{props.label}</T>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        secureTextEntry={props.secure}
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType={props.email ? 'email-address' : 'default'}
        autoComplete={props.email ? 'email' : 'password'}
        style={{ fontFamily: fonts.body, fontSize: 17, color: c.text, minHeight: 52, paddingHorizontal: 16, borderRadius: radius.tile, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}
      />
    </View>
  );
}

/** Sign in or create an account. */
export function SignInSheet({ onClose, startUp = false }: { onClose: () => void; startUp?: boolean }) {
  const { c } = useTheme();
  const { lang } = useStore();
  const s = L[lang];
  const [up, setUp] = useState(startUp);
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const go = async () => {
    setBusy(true);
    setMsg(null);
    try {
      if (up) await signUp(email, pw);
      else await signIn(email, pw);
      haptic.success();
      onClose();
    } catch (e) {
      setMsg({ ok: false, text: authMessage(e, lang) });
    }
    setBusy(false);
  };
  const forgot = async () => {
    if (!email.trim()) return setMsg({ ok: false, text: s.typeEmail });
    try {
      await resetPassword(email);
      setMsg({ ok: true, text: s.resetSent });
    } catch (e) {
      setMsg({ ok: false, text: authMessage(e, lang) });
    }
  };
  const link = { minHeight: 44, justifyContent: 'center' as const, alignItems: 'center' as const };

  return (
    <Sheet title={up ? s.signUpTitle : s.signInTitle} onClose={onClose}>
      <T style={[typo.body, { color: c.textMuted }]}>{up ? s.whyUp : s.why}</T>
      <Field label={s.email} value={email} onChangeText={setEmail} email />
      <Field label={s.pw} value={pw} onChangeText={setPw} secure />
      {msg ? <T style={[typo.bodySm, { color: msg.ok ? tone(c, 'success').fg : tone(c, 'danger').fg }]}>{msg.text}</T> : null}
      <Button label={up ? s.goUp : s.go} disabled={busy || !email.trim() || pw.length < 6} onPress={go} />
      <PressableScale accessibilityRole="button" onPress={() => { setUp((v) => !v); setMsg(null); }} style={link}>
        <T style={[typo.label, { color: c.accentText }]}>{up ? s.switchIn : s.switchUp}</T>
      </PressableScale>
      {!up ? (
        <PressableScale accessibilityRole="button" onPress={forgot} style={link}>
          <T style={[typo.label, { color: c.textMuted }]}>{s.forgot}</T>
        </PressableScale>
      ) : null}
      <PressableScale accessibilityRole="button" onPress={() => { chooseLocalOnly(); onClose(); }} style={link}>
        <T style={[typo.caption, { color: c.textMuted }]}>{s.localOnly}</T>
      </PressableScale>
    </Sheet>
  );
}

function AccountSheet({ onClose }: { onClose: () => void }) {
  const { c } = useTheme();
  const { lang } = useStore();
  const cloud = useCloud();
  const s = L[lang];
  const [err, setErr] = useState('');
  const [delOpen, setDelOpen] = useState(false);
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const ok = tone(c, 'success');
  const line = cloud.status === 'synced' ? s.synced : cloud.status === 'offline' ? s.offline : s.syncing;

  return (
    <Sheet title={s.account} onClose={onClose}>
      <View style={{ gap: 6, padding: 16, borderRadius: radius.tile, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
        <T style={typo.heading}>{cloud.email}</T>
        <T style={[typo.bodySm, { color: cloud.status === 'synced' ? ok.fg : c.textMuted }]}>{line}</T>
      </View>
      <PressableScale
        accessibilityRole="button"
        disabled={busy}
        onPress={async () => {
          setBusy(true);
          setErr('');
          const done = await signOut();
          setBusy(false);
          if (done) onClose();
          else setErr(s.notSaved);
        }}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 50, borderRadius: radius.pill, backgroundColor: c.surface, borderWidth: 1, borderColor: c.borderStrong }}>
        <LogOut size={18} color={c.text} />
        <T style={typo.button}>{s.signOut}</T>
      </PressableScale>
      <T style={[typo.caption, { color: c.textMuted }]}>{s.signOutNote}</T>
      {err ? <T style={[typo.bodySm, { color: tone(c, 'danger').fg }]}>{err}</T> : null}

      <T style={[typo.label, { color: c.textMuted, marginTop: 16 }]}>{s.danger}</T>
      {!delOpen ? (
        <PressableScale accessibilityRole="button" onPress={() => setDelOpen(true)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: radius.pill, borderWidth: 1, borderColor: c.border }}>
          <Trash2 size={17} color={c.onRose} />
          <T style={[typo.label, { color: c.onRose }]}>{s.del}</T>
        </PressableScale>
      ) : (
        <View style={{ gap: 10 }}>
          <T style={[typo.bodySm, { color: c.textMuted }]}>{s.delNote}</T>
          <Field label={s.pw} value={pw} onChangeText={setPw} secure />
          <PressableScale
            accessibilityRole="button"
            disabled={busy || !pw}
            onPress={async () => {
              setBusy(true);
              setErr('');
              try {
                await deleteAccount(pw);
                onClose();
              } catch (e) {
                setErr(authMessage(e, lang));
              }
              setBusy(false);
            }}
            style={{ alignItems: 'center', justifyContent: 'center', minHeight: 50, borderRadius: radius.pill, backgroundColor: c.onRose, opacity: !pw ? 0.5 : 1 }}>
            <T style={[typo.button, { color: c.ink }]}>{s.delGo}</T>
          </PressableScale>
        </View>
      )}
    </Sheet>
  );
}

/** Asked once, when this phone and the account both have different data. */
export function ConflictSheet() {
  const { c } = useTheme();
  const { lang, kids } = useStore();
  const cloud = useCloud();
  const s = L[lang];
  if (cloud.status !== 'choose' || !cloud.conflict) return null;
  const when = cloud.conflict.cloudUpdated
    ? new Date(cloud.conflict.cloudUpdated).toLocaleString(lang === 'bm' ? 'ms-MY' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : null;
  const choice = (icon: ReactNode, title: string, sub: string, onPress: () => void) => (
    <PressableScale accessibilityRole="button" onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: radius.card, backgroundColor: c.surface, borderWidth: 1, borderColor: c.borderStrong }}>
      <View style={{ width: 44, height: 44, borderRadius: 14, backgroundColor: c.brandSoft, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>
      <View style={{ flex: 1, gap: 2 }}>
        <T style={typo.heading}>{title}</T>
        <T style={[typo.caption, { color: c.textMuted }]}>{sub}</T>
      </View>
    </PressableScale>
  );
  return (
    <Sheet title={s.chooseTitle}>
      <T style={[typo.body, { color: c.textMuted }]}>{s.chooseSub}</T>
      {choice(<Smartphone size={22} color={c.onBrandSoft} />, s.phone, s.kids(kids.length), () => resolveConflict('phone'))}
      {choice(<Cloud size={22} color={c.onBrandSoft} />, s.cloud, when ? `${s.saved} ${when}` : '', () => resolveConflict('account'))}
      <T style={[typo.caption, { color: c.textMuted }]}>{s.chooseNote}</T>
    </Sheet>
  );
}

/** The cloud button in the header: opens sign-in or the account. Hidden when sign-in isn't set up. */
export function AccountButton() {
  const { c } = useTheme();
  const { lang } = useStore();
  const cloud = useCloud();
  const [open, setOpen] = useState(false);
  if (cloud.status === 'off' || cloud.status === 'connecting') return null;
  const signedIn = !!cloud.email;
  const dot = cloud.status === 'synced' ? tone(c, 'success').fg : cloud.status === 'offline' ? tone(c, 'warning').fg : cloud.status === 'syncing' ? c.onBrandSoft : null;
  const Icon = !signedIn ? CloudOff : cloud.status === 'syncing' ? RefreshCw : Cloud;
  return (
    <>
      <PressableScale
        accessibilityRole="button"
        accessibilityLabel={L[lang].account}
        onPress={() => { haptic.tap(); setOpen(true); }}
        style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: signedIn ? c.brandSoft : c.surface, borderWidth: 1, borderColor: signedIn ? c.brand : c.border, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={20} color={signedIn ? c.onBrandSoft : c.textMuted} strokeWidth={2.2} />
        {dot ? <View style={{ position: 'absolute', top: 6, right: 6, width: 9, height: 9, borderRadius: 5, backgroundColor: dot, borderWidth: 1.5, borderColor: c.bg }} /> : null}
      </PressableScale>
      {open ? (signedIn ? <AccountSheet onClose={() => setOpen(false)} /> : <SignInSheet onClose={() => setOpen(false)} />) : null}
    </>
  );
}
