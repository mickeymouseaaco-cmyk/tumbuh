/**
 * Follow more than one child (your own, a niece, a nephew…). The chips at the top of Utama and Gigi
 * switch between them; tap the chosen one to rename or remove it; "+" adds another child.
 * Teeth, routine and fluoride are kept per child. Learn progress and brushing times are shared.
 */
import { Minus, Pencil, Plus, Trash2, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TumbuhPortrait } from '@/components/tumbuh-baby';
import { Button, Display, PressableScale, T } from '@/components/ui';
import { haptic } from '@/lib/haptics';
import { useStore, type Kid } from '@/lib/store';
import { fonts, radius, typo, useTheme } from '@/theme';

const L = {
  bm: { add: 'Anak', addTitle: 'Tambah anak', editTitle: 'Ubah butiran', name: 'Nama', namePh: 'cth. Aisyah', boy: 'Lelaki', girl: 'Perempuan', age: 'Umur', months: 'bulan', save: 'Simpan', remove: 'Buang anak ini', removeAgain: 'Tekan lagi untuk buang', close: 'Tutup', switchTo: 'Tukar ke', edit: 'Ubah' },
  en: { add: 'Child', addTitle: 'Add a child', editTitle: 'Edit details', name: 'Name', namePh: 'e.g. Aisyah', boy: 'Boy', girl: 'Girl', age: 'Age', months: 'months', save: 'Save', remove: 'Remove this child', removeAgain: 'Tap again to remove', close: 'Close', switchTo: 'Switch to', edit: 'Edit' },
};

function Avatar({ kid, size }: { kid: Kid; size: number }) {
  const { c } = useTheme();
  if (kid.photo || kid.gender) return <TumbuhPortrait gender={kid.gender || 'boy'} uri={kid.photo} size={size} />;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c.brandSoft, alignItems: 'center', justifyContent: 'center' }}>
      <T style={{ fontFamily: fonts.display, fontSize: size * 0.45, color: c.onBrandSoft }}>{(kid.babyName.trim()[0] ?? '?').toUpperCase()}</T>
    </View>
  );
}

/** Add a child, or edit / remove one. */
function KidSheet({ editing, open, onClose }: { editing: Kid | null; open: boolean; onClose: () => void }) {
  const { c } = useTheme();
  const { lang, kids, addKid, editKid, removeKid } = useStore();
  const s = L[lang];
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'boy' | 'girl' | ''>('');
  const [age, setAge] = useState(6);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(editing?.babyName ?? '');
    setGender(editing?.gender ?? '');
    setAge(editing?.age ?? 6);
    setArmed(false);
  }, [open, editing]);

  if (!open) return null;
  const canSave = !!gender;
  const save = () => {
    if (!gender) return;
    if (editing) editKid(editing.id, { babyName: name, gender, age });
    else addKid({ babyName: name, gender, age });
    haptic.success();
    onClose();
  };
  const ageBtn = { width: 46, height: 46, borderRadius: 23, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center' as const, justifyContent: 'center' as const };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: insets.top + 16, paddingBottom: insets.bottom + 40, gap: 20 }} keyboardShouldPersistTaps="handled">
          <View style={{ width: '100%', maxWidth: 560, alignSelf: 'center', gap: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Display style={{ fontSize: 26, lineHeight: 32 }}>{editing ? s.editTitle : s.addTitle}</Display>
              <PressableScale accessibilityRole="button" accessibilityLabel={s.close} onPress={onClose} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
                <X size={22} color={c.text} />
              </PressableScale>
            </View>

            {/* boy / girl */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              {(['boy', 'girl'] as const).map((g) => {
                const on = gender === g;
                return (
                  <PressableScale key={g} accessibilityRole="radio" accessibilityState={{ checked: on }} onPress={() => { haptic.tap(); setGender(g); }}
                    style={{ flex: 1, alignItems: 'center', gap: 10, paddingVertical: 16, borderRadius: radius.card, borderWidth: 2, borderColor: on ? c.brand : c.border, backgroundColor: on ? c.brandSoft : c.surface }}>
                    <TumbuhPortrait gender={g} size={84} />
                    <T style={[typo.label, { color: on ? c.onBrandSoft : c.text }]}>{g === 'boy' ? s.boy : s.girl}</T>
                  </PressableScale>
                );
              })}
            </View>

            {/* name */}
            <View style={{ gap: 6 }}>
              <T style={[typo.caption, { color: c.textMuted }]}>{s.name}</T>
              <TextInput value={name} onChangeText={setName} placeholder={s.namePh} placeholderTextColor={c.textSubtle} maxLength={24} autoCapitalize="words"
                style={{ fontFamily: fonts.body, fontSize: 17, color: c.text, minHeight: 52, paddingHorizontal: 16, borderRadius: radius.tile, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }} />
            </View>

            {/* age */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 8, paddingLeft: 18, borderRadius: radius.pill, backgroundColor: c.surfaceAlt, borderWidth: 1, borderColor: c.border }}>
              <View>
                <T style={[typo.caption, { color: c.textMuted }]}>{s.age}</T>
                <T style={{ fontFamily: fonts.display, fontSize: 18, fontVariant: ['tabular-nums'] }}>{age} {s.months}</T>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <PressableScale accessibilityRole="button" accessibilityLabel="−1" disabled={age <= 0} onPress={() => { haptic.tap(); setAge((a) => Math.max(0, a - 1)); }} style={[ageBtn, { opacity: age <= 0 ? 0.4 : 1 }]}>
                  <Minus size={20} color={c.text} strokeWidth={2.4} />
                </PressableScale>
                <PressableScale accessibilityRole="button" accessibilityLabel="+1" disabled={age >= 36} onPress={() => { haptic.tap(); setAge((a) => Math.min(36, a + 1)); }} style={[ageBtn, { opacity: age >= 36 ? 0.4 : 1 }]}>
                  <Plus size={20} color={c.text} strokeWidth={2.4} />
                </PressableScale>
              </View>
            </View>

            <Button label={s.save} disabled={!canSave} onPress={save} />

            {editing && kids.length > 1 ? (
              <PressableScale accessibilityRole="button"
                onPress={() => {
                  if (!armed) return setArmed(true);
                  haptic.soft();
                  removeKid(editing.id);
                  onClose();
                }}
                style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 48, borderRadius: radius.pill, backgroundColor: armed ? c.onRose : 'transparent', borderWidth: 1, borderColor: armed ? c.onRose : c.border }}>
                <Trash2 size={17} color={armed ? c.ink : c.onRose} />
                <T style={[typo.label, { color: armed ? c.ink : c.onRose }]}>{armed ? s.removeAgain : s.remove}</T>
              </PressableScale>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}

export function KidSwitcher() {
  const { c } = useTheme();
  const { lang, kids, active, switchKid, kidName } = useStore();
  const s = L[lang];
  const [sheet, setSheet] = useState<{ open: boolean; editing: Kid | null }>({ open: false, editing: null });

  return (
    <>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}>
        {kids.map((k) => {
          const on = k.id === active;
          return (
            <PressableScale
              key={k.id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              accessibilityLabel={on ? `${s.edit}: ${kidName(k)}` : `${s.switchTo} ${kidName(k)}`}
              onPress={() => {
                haptic.tap();
                if (on) setSheet({ open: true, editing: k });
                else switchKid(k.id);
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingLeft: 4, paddingRight: 14, borderRadius: radius.pill, backgroundColor: on ? c.brandSoft : c.surface, borderWidth: 1, borderColor: on ? c.brand : c.border }}>
              <Avatar kid={k} size={34} />
              <T style={[typo.label, { color: on ? c.onBrandSoft : c.text }]} numberOfLines={1}>{kidName(k)}</T>
              {on ? <Pencil size={13} color={c.onBrandSoft} strokeWidth={2.4} /> : null}
            </PressableScale>
          );
        })}
        <PressableScale
          accessibilityRole="button"
          accessibilityLabel={s.addTitle}
          onPress={() => { haptic.tap(); setSheet({ open: true, editing: null }); }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 44, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderStyle: 'dashed', borderColor: c.borderStrong }}>
          <Plus size={16} color={c.text} strokeWidth={2.6} />
          <T style={typo.label}>{s.add}</T>
        </PressableScale>
      </ScrollView>
      <KidSheet open={sheet.open} editing={sheet.editing} onClose={() => setSheet({ open: false, editing: null })} />
    </>
  );
}
