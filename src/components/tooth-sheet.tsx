/**
 * The tooth bottom sheet: opens when a tooth is tapped on the chart.
 * Shows the tooth (FDI number, where it is, what it's for, when it comes in and falls out), lets the parent
 * mark it as in, and keeps a history of records — each clearly either a parent's observation or a
 * dentist-confirmed finding, with a note and a photo. A parent's observation is never shown as a diagnosis.
 */
import { Camera, Check, ChevronDown, Eye, Plus, Stethoscope, Trash2, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, TextInput, View, useWindowDimensions } from 'react-native';
import Animated, { FadeIn, FadeOut, LinearTransition, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DatePicker } from '@/components/fluoride-card';
import { Crown } from '@/components/mouth';
import { Button, PressableScale, T } from '@/components/ui';
import { pickPhoto } from '@/lib/admin';
import { boxFor } from '@/lib/mouth-geometry';
import { toothAges, toothName, type Jaw, type Kind, type Side } from '@/lib/content';
import { fmt, toKey } from '@/lib/fluoride';
import { haptic } from '@/lib/haptics';
import { FINDINGS, KIND_INFO, WHO_COLOR, deletePhoto, fdi, findingOf, markerTone, placeName, savePhoto, sorted, usePhoto, type By, type Entry } from '@/lib/records';
import { useStore } from '@/lib/store';
import { statusOf, range } from '@/lib/teeth';
import { elevation, fonts, motion, radius, tone, typo, useTheme } from '@/theme';

const L = {
  bm: {
    fdi: 'Nombor FDI',
    usuallyIn: 'Biasa tumbuh',
    usuallyOut: 'Biasa tanggal',
    years: 'tahun',
    isIn: 'Gigi ini sudah tumbuh',
    markIn: 'Tandakan sudah tumbuh',
    records: 'Rekod gigi ini',
    none: 'Belum ada rekod. Tambah apa yang anda nampak, atau apa yang doktor gigi beritahu.',
    add: 'Tambah rekod',
    who: 'Siapa yang rekod?',
    parent: 'Saya perhatikan',
    dentist: 'Doktor gigi sahkan',
    parentBadge: 'Pemerhatian ibu bapa',
    dentistBadge: 'Disahkan doktor gigi',
    what: 'Apa yang dilihat?',
    whatD: 'Apa kata doktor gigi?',
    date: 'Tarikh',
    changeDate: 'Tukar tarikh',
    note: 'Nota (pilihan)',
    notePh: 'cth. tompok kecil di tepi gigi',
    photo: 'Tambah foto',
    photoChange: 'Tukar foto',
    photoNote: 'Foto disimpan di telefon ini sahaja.',
    save: 'Simpan rekod',
    cancel: 'Batal',
    saved: 'Rekod disimpan',
    notDiag: 'Pemerhatian ibu bapa bukan diagnosis. Hanya doktor gigi boleh mengesahkan gigi reput.',
    del: 'Padam',
    delAgain: 'Tekan lagi',
    photoMissing: 'Foto ada di telefon lain',
    close: 'Tutup',
    usuallyMonths: 'bln',
  },
  en: {
    fdi: 'FDI number',
    usuallyIn: 'Usually comes in',
    usuallyOut: 'Usually falls out',
    years: 'years',
    isIn: 'This tooth is in',
    markIn: 'Mark as in',
    records: 'Records for this tooth',
    none: 'No records yet. Add what you notice, or what the dentist told you.',
    add: 'Add a record',
    who: 'Who is recording?',
    parent: 'I noticed',
    dentist: 'Dentist confirmed',
    parentBadge: 'Parent observation',
    dentistBadge: 'Dentist confirmed',
    what: 'What do you see?',
    whatD: 'What did the dentist say?',
    date: 'Date',
    changeDate: 'Change date',
    note: 'Note (optional)',
    notePh: 'e.g. small spot near the edge',
    photo: 'Add a photo',
    photoChange: 'Change photo',
    photoNote: 'Photos are kept on this phone only.',
    save: 'Save record',
    cancel: 'Cancel',
    saved: 'Record saved',
    notDiag: 'A parent’s observation is not a diagnosis. Only a dentist can confirm tooth decay.',
    del: 'Delete',
    delAgain: 'Tap again',
    photoMissing: 'Photo is on another phone',
    close: 'Close',
    usuallyMonths: 'mo',
  },
};

function EntryPhoto({ id }: { id?: string }) {
  const { c } = useTheme();
  const { lang } = useStore();
  const uri = usePhoto(id);
  if (!id) return null;
  if (uri === undefined) return <View style={{ height: 150, borderRadius: radius.tile, backgroundColor: c.surfaceAlt }} />; // loading skeleton
  if (!uri) return <T style={[typo.caption, { color: c.textSubtle }]}>{L[lang].photoMissing}</T>;
  return <Image source={{ uri }} resizeMode="cover" style={{ width: '100%', height: 170, borderRadius: radius.tile }} accessibilityIgnoresInvertColors />;
}

function Badge({ by }: { by: By }) {
  const { c } = useTheme();
  const { lang } = useStore();
  const s = L[lang];
  const d = by === 'dentist';
  const col = WHO_COLOR[by];
  const t = { bg: `${col}2E`, fg: d ? '#8EDBFB' : '#CBBDFF' };
  const Icon = d ? Stethoscope : Eye;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill, backgroundColor: t.bg }}>
      <Icon size={12} color={t.fg} strokeWidth={2.4} />
      <T style={{ fontFamily: fonts.semi, fontSize: 12, lineHeight: 15, color: t.fg }}>{d ? s.dentistBadge : s.parentBadge}</T>
    </View>
  );
}

function EntryCard({ e, onDelete }: { e: Entry; onDelete: () => void }) {
  const { c } = useTheme();
  const { lang } = useStore();
  const s = L[lang];
  const f = findingOf(e.finding);
  const t = tone(c, f.tone);
  const [armed, setArmed] = useState(false);
  return (
    <Animated.View entering={FadeIn.duration(motion.base)} exiting={FadeOut.duration(150)} layout={LinearTransition.duration(motion.base)}
      style={{ gap: 10, padding: 14, borderRadius: radius.tile, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Badge by={e.by} />
        <T style={[typo.caption, { color: c.textMuted, fontVariant: ['tabular-nums'] }]}>{fmt(e.date, lang)}</T>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: t.fg }} />
        <T style={[typo.heading, { flex: 1, fontSize: 17, lineHeight: 22 }]}>{f[lang]}</T>
      </View>
      {e.note ? <T style={[typo.bodySm, { color: c.text }]}>{e.note}</T> : null}
      <EntryPhoto id={e.photo} />
      {e.by === 'parent' && (lang === 'bm' ? f.adviceBm : f.adviceEn) ? (
        <T style={[typo.caption, { color: t.fg }]}>{lang === 'bm' ? f.adviceBm : f.adviceEn}</T>
      ) : null}
      <PressableScale
        accessibilityRole="button"
        onPress={() => {
          if (!armed) return setArmed(true);
          haptic.soft();
          onDelete();
        }}
        style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-end', minHeight: 36, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: armed ? c.onRose : 'transparent' }}>
        <Trash2 size={14} color={armed ? c.ink : c.textMuted} />
        <T style={[typo.caption, { color: armed ? c.ink : c.textMuted }]}>{armed ? s.delAgain : s.del}</T>
      </PressableScale>
    </Animated.View>
  );
}

/** New record form. */
function NewRecord({ tooth, onDone }: { tooth: string; onDone: (saved: boolean) => void }) {
  const { c } = useTheme();
  const { lang, addEntry } = useStore();
  const s = L[lang];
  const [by, setBy] = useState<By>('parent');
  const [finding, setFinding] = useState('');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(toKey(new Date()));
  const [picking, setPicking] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const f = finding ? findingOf(finding) : null;
  const chip = (on: boolean) => ({ minHeight: 40, paddingHorizontal: 14, borderRadius: radius.pill, justifyContent: 'center' as const, backgroundColor: on ? c.accentSoft : c.surface, borderWidth: 1, borderColor: on ? c.accent : c.border });

  const save = async () => {
    if (!finding) return;
    const photoId = photo ? await savePhoto(photo).catch(() => undefined) : undefined;
    addEntry(tooth, { id: `e${Date.now().toString(36)}`, date, by, finding, note: note.trim().slice(0, 400), ...(photoId ? { photo: photoId } : {}) });
    haptic.success();
    onDone(true);
  };

  return (
    <Animated.View entering={FadeIn.duration(motion.base)} style={{ gap: 14, padding: 16, borderRadius: radius.card, backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.borderStrong }}>
      {/* who */}
      <View style={{ gap: 8 }}>
        <T style={[typo.caption, { color: c.textMuted }]}>{s.who}</T>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['parent', 'dentist'] as By[]).map((b) => {
            const on = by === b;
            const Icon = b === 'dentist' ? Stethoscope : Eye;
            return (
              <PressableScale key={b} accessibilityRole="radio" accessibilityState={{ checked: on }}
                onPress={() => { haptic.tap(); setBy(b); setFinding(''); }}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 46, borderRadius: radius.pill, backgroundColor: on ? c.brandSoft : c.surface, borderWidth: 1, borderColor: on ? c.brand : c.border }}>
                <Icon size={16} color={on ? c.onBrandSoft : c.textMuted} />
                <T style={[typo.label, { color: on ? c.onBrandSoft : c.text }]}>{b === 'dentist' ? s.dentist : s.parent}</T>
              </PressableScale>
            );
          })}
        </View>
      </View>

      {/* what */}
      <View style={{ gap: 8 }}>
        <T style={[typo.caption, { color: c.textMuted }]}>{by === 'dentist' ? s.whatD : s.what}</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {FINDINGS.filter((x) => x.by === by).map((x) => {
            const on = finding === x.key;
            return (
              <PressableScale key={x.key} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => { haptic.tap(); setFinding(x.key); }} style={chip(on)}>
                <T style={[typo.label, { color: on ? c.accentText : c.text }]}>{x[lang]}</T>
              </PressableScale>
            );
          })}
        </View>
        {f && by === 'parent' && (lang === 'bm' ? f.adviceBm : f.adviceEn) ? (
          <Animated.View entering={FadeIn.duration(motion.base)}>
            <T style={[typo.bodySm, { color: tone(c, f.tone).fg }]}>{lang === 'bm' ? f.adviceBm : f.adviceEn}</T>
          </Animated.View>
        ) : null}
      </View>

      {/* date */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <T style={[typo.caption, { color: c.textMuted }]}>{s.date}</T>
            <T style={typo.label}>{fmt(date, lang)}</T>
          </View>
          <PressableScale accessibilityRole="button" onPress={() => setPicking((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 4, minHeight: 40, paddingHorizontal: 12, borderRadius: radius.pill, borderWidth: 1, borderColor: c.border }}>
            <T style={typo.label}>{s.changeDate}</T>
            <ChevronDown size={14} color={c.text} />
          </PressableScale>
        </View>
        {picking ? <DatePicker lang={lang} start={date} onSave={(k) => { setDate(k); setPicking(false); }} /> : null}
      </View>

      {/* note */}
      <View style={{ gap: 6 }}>
        <T style={[typo.caption, { color: c.textMuted }]}>{s.note}</T>
        <TextInput value={note} onChangeText={setNote} placeholder={s.notePh} placeholderTextColor={c.textSubtle} multiline maxLength={400}
          style={{ fontFamily: fonts.body, fontSize: 16, color: c.text, minHeight: 72, padding: 14, textAlignVertical: 'top', borderRadius: radius.tile, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }} />
      </View>

      {/* photo */}
      <View style={{ gap: 8 }}>
        {photo ? <Image source={{ uri: photo }} resizeMode="cover" style={{ width: '100%', height: 170, borderRadius: radius.tile }} /> : null}
        <PressableScale accessibilityRole="button"
          onPress={async () => { const u = await pickPhoto(720); if (u) setPhoto(u); }}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 46, borderRadius: radius.pill, borderWidth: 1, borderStyle: photo ? 'solid' : 'dashed', borderColor: c.borderStrong }}>
          <Camera size={17} color={c.text} />
          <T style={typo.label}>{photo ? s.photoChange : s.photo}</T>
        </PressableScale>
        <T style={[typo.caption, { color: c.textSubtle }]}>{s.photoNote}</T>
      </View>

      <Button label={s.save} disabled={!finding} onPress={save} icon={<Check size={18} color={finding ? c.onAccent : c.disabledText} strokeWidth={2.6} />} />
      <PressableScale accessibilityRole="button" onPress={() => onDone(false)} style={{ minHeight: 40, alignItems: 'center', justifyContent: 'center' }}>
        <T style={[typo.label, { color: c.textMuted }]}>{s.cancel}</T>
      </PressableScale>
    </Animated.View>
  );
}

export function ToothSheet({ tooth, onClose }: { tooth: string | null; onClose: () => void }) {
  const { c } = useTheme();
  const { lang, age, erupted, toggleTooth, records, removeEntry } = useStore();
  const s = L[lang];
  const insets = useSafeAreaInsets();
  const { height: H } = useWindowDimensions();
  const reduce = useReducedMotion();
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState(false);
  const y = useSharedValue(H);
  const fade = useSharedValue(0);

  useEffect(() => {
    if (!tooth) return;
    setAdding(false);
    setToast(false);
    y.value = H;
    y.value = withTiming(0, { duration: reduce ? 0 : 340, easing: motion.ease });
    fade.value = withTiming(1, { duration: reduce ? 0 : 240 });
  }, [tooth]); // eslint-disable-line react-hooks/exhaustive-deps

  const close = () => {
    fade.value = withTiming(0, { duration: reduce ? 0 : 200 });
    y.value = withTiming(H, { duration: reduce ? 0 : 240, easing: motion.exit });
    setTimeout(onClose, reduce ? 0 : 250);
  };
  const sheetStyle = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  const backStyle = useAnimatedStyle(() => ({ opacity: fade.value }));

  if (!tooth) return null;
  const [jaw, kind, side] = tooth.split('-') as [Jaw, Kind, Side];
  const status = statusOf(jaw, kind, side, age, erupted);
  const isIn = !!erupted[tooth];
  const info = KIND_INFO[kind];
  const list = sorted(records[tooth]);
  const hasParentOnly = list.length > 0 && list.every((e) => e.by === 'parent');
  const stat = (label: string, value: string) => (
    <View style={{ flex: 1, gap: 2, padding: 12, borderRadius: radius.tile, backgroundColor: c.surface }}>
      <T style={[typo.caption, { color: c.textMuted }]}>{label}</T>
      <T style={[typo.label, { fontVariant: ['tabular-nums'] }]}>{value}</T>
    </View>
  );

  return (
    <Modal visible transparent animationType="none" statusBarTranslucent onRequestClose={close}>
      <Animated.View style={[{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(5,4,14,0.62)' }, backStyle]}>
        <Pressable accessibilityRole="button" accessibilityLabel={s.close} onPress={close} style={{ flex: 1 }} />
      </Animated.View>
      <Animated.View
        style={[
          { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: H * 0.9, alignItems: 'center' },
          sheetStyle,
        ]}>
        <View style={{ width: '100%', maxWidth: 560, maxHeight: H * 0.9, backgroundColor: c.surfaceRaised, borderTopLeftRadius: 28, borderTopRightRadius: 28, borderWidth: 1, borderColor: c.border, boxShadow: elevation.raised }}>
          {/* grabber + close */}
          <View style={{ alignItems: 'center', paddingTop: 10 }}>
            <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: c.borderStrong }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 12, paddingBottom: insets.bottom + 28, gap: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {/* header */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: c.gum, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 2, borderColor: c.accentBorder }}>
                <Crown kind={kind} status={status} s={64 / boxFor(kind)} mark={markerTone(records[tooth]) ? WHO_COLOR[markerTone(records[tooth])!.by] : null} />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <T style={[typo.heading, { fontSize: 20, lineHeight: 25 }]}>{toothName(jaw, kind, lang)}</T>
                <T style={[typo.caption, { color: c.textMuted }]}>{placeName(jaw, side, lang)}</T>
              </View>
              <View style={{ alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: c.brandSoft }}>
                <T style={{ fontFamily: fonts.medium, fontSize: 11, lineHeight: 13, color: c.onBrandSoft }}>FDI</T>
                <T style={{ fontFamily: fonts.display, fontSize: 20, lineHeight: 24, color: c.onBrandSoft, fontVariant: ['tabular-nums'] }}>{fdi(jaw, kind, side)}</T>
              </View>
              <PressableScale accessibilityRole="button" accessibilityLabel={s.close} onPress={close} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
                <X size={20} color={c.text} />
              </PressableScale>
            </View>

            {/* what it is */}
            <T style={[typo.body, { color: c.text }]}>{info[lang]}</T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {stat(s.usuallyIn, range(toothAges[jaw][kind], s.usuallyMonths))}
              {stat(s.usuallyOut, `${info.out[0]}–${info.out[1]} ${s.years}`)}
            </View>

            {/* in or not */}
            <PressableScale
              accessibilityRole="switch"
              accessibilityState={{ checked: isIn }}
              onPress={() => { isIn ? haptic.soft() : haptic.success(); toggleTooth(tooth); }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 16, borderRadius: radius.tile, backgroundColor: isIn ? tone(c, 'success').bg : c.surface, borderWidth: 1, borderColor: isIn ? tone(c, 'success').fg : c.border }}>
              <View style={{ width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: isIn ? tone(c, 'success').fg : 'transparent', borderWidth: isIn ? 0 : 2, borderColor: c.borderStrong }}>
                {isIn ? <Check size={15} color={c.ink} strokeWidth={3} /> : null}
              </View>
              <T style={[typo.label, { flex: 1, fontSize: 15, color: isIn ? tone(c, 'success').fg : c.text }]}>{isIn ? s.isIn : s.markIn}</T>
            </PressableScale>

            {/* records */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
              <T style={typo.heading}>{s.records}</T>
              {toast ? (
                <Animated.View entering={FadeIn.duration(motion.base)} exiting={FadeOut.duration(200)} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                  <Check size={14} color={tone(c, 'success').fg} strokeWidth={3} />
                  <T style={[typo.caption, { color: tone(c, 'success').fg }]}>{s.saved}</T>
                </Animated.View>
              ) : null}
            </View>
            {adding ? (
              <NewRecord
                tooth={tooth}
                onDone={(saved) => {
                  setAdding(false);
                  if (saved) {
                    setToast(true);
                    setTimeout(() => setToast(false), 2200);
                  }
                }}
              />
            ) : (
              <Button kind="soft" label={s.add} onPress={() => { haptic.tap(); setAdding(true); }} icon={<Plus size={18} color={c.accentText} strokeWidth={2.6} />} />
            )}
            {list.length ? (
              list.map((e) => (
                <EntryCard
                  key={e.id}
                  e={e}
                  onDelete={() => {
                    if (e.photo) deletePhoto(e.photo);
                    removeEntry(tooth, e.id);
                  }}
                />
              ))
            ) : !adding ? (
              <T style={[typo.bodySm, { color: c.textMuted }]}>{s.none}</T>
            ) : null}
            {hasParentOnly || adding ? <T style={[typo.caption, { color: c.textSubtle }]}>{s.notDiag}</T> : null}
          </ScrollView>
        </View>
      </Animated.View>
    </Modal>
  );
}
