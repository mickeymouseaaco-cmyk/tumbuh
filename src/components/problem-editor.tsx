/** TEMPORARY: form to add or edit a condition (with photo) under a Masalah category. See lib/admin.ts. */
import { Camera, Trash2, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Image, KeyboardAvoidingView, Modal, Platform, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TAG_TINT } from '@/components/smart-stack';
import { Button, Display, Eyebrow, PressableScale, T } from '@/components/ui';
import { problemStacks, type Tag } from '@/lib/content';
import { pickPhoto, useAdmin, type CustomProblem } from '@/lib/admin';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { fonts, radius, tint, useTheme } from '@/theme';

type Draft = { tag: Tag; titleBm: string; titleEn: string; term: string; looksBm: string; looksEn: string; todoBm: string; todoEn: string };
const empty: Draft = { tag: 'check', titleBm: '', titleEn: '', term: '', looksBm: '', looksEn: '', todoBm: '', todoEn: '' };

export function ProblemEditor({ stack, editing, onClose }: { stack: string | null; editing?: CustomProblem | null; onClose: () => void }) {
  const { c } = useTheme();
  const { t, lang } = useStore();
  const insets = useSafeAreaInsets();
  const admin = useAdmin();
  const [d, setD] = useState<Draft>(empty);
  const [photo, setPhoto] = useState<string | null>(null);
  const open = !!stack;
  const bm = lang === 'bm';

  useEffect(() => {
    if (!open) return;
    if (editing) {
      setD({ tag: editing.tag, titleBm: editing.title.bm, titleEn: editing.title.en, term: editing.term, looksBm: editing.looks.bm, looksEn: editing.looks.en, todoBm: editing.todo.bm, todoEn: editing.todo.en });
      setPhoto(admin.photos[editing.id] ?? null);
    } else {
      setD(empty);
      setPhoto(null);
    }
  }, [open, editing]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;
  const cat = problemStacks.find((s) => s.id === stack);
  const set = (k: keyof Draft) => (v: string) => setD((x) => ({ ...x, [k]: v }));
  const canSave = (d.titleBm || d.titleEn).trim().length > 0;

  const save = () => {
    if (!canSave) return;
    const id = editing?.id ?? `custom-${Date.now().toString(36)}`;
    const either = (a: string, b: string) => (a.trim() || b.trim());
    admin.upsert({
      id,
      stack: stack!,
      tag: d.tag,
      term: d.term.trim(),
      title: { bm: either(d.titleBm, d.titleEn), en: either(d.titleEn, d.titleBm) },
      looks: { bm: either(d.looksBm, d.looksEn), en: either(d.looksEn, d.looksBm) },
      todo: { bm: either(d.todoBm, d.todoEn), en: either(d.todoEn, d.todoBm) },
    });
    admin.setPhoto(id, photo);
    haptic.success();
    onClose();
  };

  const field = (label: string, k: keyof Draft, multiline = false) => (
    <View style={{ gap: 6 }}>
      <Eyebrow color={c.textMuted}>{label}</Eyebrow>
      <TextInput
        value={d[k] as string}
        onChangeText={set(k)}
        multiline={multiline}
        placeholderTextColor={c.textMuted}
        style={{
          fontFamily: fonts.body, fontSize: 16, color: c.text, minHeight: multiline ? 84 : 48, textAlignVertical: multiline ? 'top' : 'center',
          paddingHorizontal: 14, paddingVertical: 12, borderRadius: radius.tile, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border,
        }}
      />
    </View>
  );

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40, gap: 18 }} keyboardShouldPersistTaps="handled">
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, gap: 2 }}>
              <Eyebrow>{cat ? cat[lang] : ''}</Eyebrow>
              <Display style={{ fontSize: 26 }}>{editing ? (bm ? 'Ubah keadaan' : 'Edit condition') : bm ? 'Tambah keadaan' : 'Add a condition'}</Display>
            </View>
            <PressableScale accessibilityRole="button" accessibilityLabel={t.close} onPress={onClose} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
              <X size={22} color={c.text} />
            </PressableScale>
          </View>

          {/* photo */}
          <PressableScale
            accessibilityRole="button"
            onPress={async () => {
              const uri = await pickPhoto();
              if (uri) setPhoto(uri);
            }}
            style={{ height: 200, borderRadius: radius.card, overflow: 'hidden', backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderStyle: photo ? 'solid' : 'dashed', alignItems: 'center', justifyContent: 'center' }}>
            {photo ? (
              <Image source={{ uri: photo }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
            ) : (
              <View style={{ alignItems: 'center', gap: 8 }}>
                <Camera size={34} color={c.textMuted} />
                <T style={{ color: c.textMuted }}>{bm ? 'Tekan untuk pilih foto' : 'Tap to choose a photo'}</T>
              </View>
            )}
          </PressableScale>
          {photo ? (
            <PressableScale accessibilityRole="button" onPress={() => setPhoto(null)} style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 36 }}>
              <Trash2 size={16} color={c.onRose} />
              <T style={{ fontSize: 13, color: c.onRose }}>{bm ? 'Buang foto' : 'Remove photo'}</T>
            </PressableScale>
          ) : null}

          {/* how serious */}
          <View style={{ gap: 8 }}>
            <Eyebrow color={c.textMuted}>{bm ? 'Tahap' : 'Level'}</Eyebrow>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {(['ok', 'check', 'urgent'] as Tag[]).map((g) => {
                const on = d.tag === g;
                const tt = tint(c, TAG_TINT[g]);
                return (
                  <PressableScale key={g} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => setD((x) => ({ ...x, tag: g }))}
                    style={{ minHeight: 40, paddingHorizontal: 14, borderRadius: radius.pill, justifyContent: 'center', backgroundColor: on ? tt.fg : c.surface, borderWidth: 1, borderColor: on ? tt.fg : c.border }}>
                    <T style={{ fontSize: 13, fontFamily: fonts.semi, color: on ? '#0B0A1A' : c.text }}>{g === 'ok' ? t.fOk : g === 'check' ? t.fCheck : t.fUrgent}</T>
                  </PressableScale>
                );
              })}
            </View>
          </View>

          {field('Nama (BM)', 'titleBm')}
          {field('Name (English)', 'titleEn')}
          {field(bm ? 'Istilah perubatan' : 'Medical term', 'term')}
          {field('Rupanya (BM)', 'looksBm', true)}
          {field('What it looks like (English)', 'looksEn', true)}
          {field('Apa nak buat (BM)', 'todoBm', true)}
          {field('What to do (English)', 'todoEn', true)}
          <T style={{ fontSize: 12, color: c.textMuted }}>
            {bm ? 'Boleh isi satu bahasa sahaja — Claude akan terjemah nanti.' : 'One language is enough — Claude will translate later.'}
          </T>

          <Button label={bm ? 'Simpan' : 'Save'} onPress={save} style={!canSave ? { opacity: 0.4 } : undefined} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
