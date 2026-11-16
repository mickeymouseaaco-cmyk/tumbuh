import { Camera, ChevronLeft, ChevronRight, Pencil, Phone, Send, Siren, Trash2, X } from 'lucide-react-native';
import { useState } from 'react';
import { Modal, ScrollView, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ProblemEditor } from '@/components/problem-editor';
import { ProblemPhoto, SmartStack, TAG_ICON, TAG_TINT } from '@/components/smart-stack';
import { Bullet, Disclaimer, Display, Eyebrow, PressableScale, Screen, T, enter } from '@/components/ui';
import { problemStacks, problems, urgentList, type Problem } from '@/lib/content';
import { exportAdmin, pickPhoto, useAdmin, type CustomProblem } from '@/lib/admin';
import { haptic } from '@/lib/haptics';
import { problemPhotos } from '@/lib/photos';
import { useStore } from '@/lib/store';
import { fonts, motion, radius, tint, useTheme } from '@/theme';

const byId = Object.fromEntries(problems.map((p) => [p.id, p]));

/** Full view of one problem: big photo, what it looks like, what to do. Flip through its stack. */
function ProblemSheet({ open, onClose, onEdit }: { open: { p: Problem; list: Problem[] } | null; onClose: () => void; onEdit: (p: CustomProblem) => void }) {
  const { c } = useTheme();
  const { t, lang } = useStore();
  const insets = useSafeAreaInsets();
  const admin = useAdmin();
  const [p, setP] = useState<Problem | null>(null);
  const cur = p && open && open.list.includes(p) ? p : open?.p ?? null;
  if (!open || !cur) return null;
  const list = open.list;
  const k = list.indexOf(cur);
  const tt = tint(c, TAG_TINT[cur.tag]);
  const Icon = TAG_ICON[cur.tag];
  const tagLabel = cur.tag === 'ok' ? t.fOk : cur.tag === 'check' ? t.fCheck : t.fUrgent;
  const credit = problemPhotos[cur.id]?.credit;
  const step = (d: number) => {
    haptic.tap();
    setP(list[(k + d + list.length) % list.length]);
  };
  const close = () => {
    setP(null);
    onClose();
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" transparent={false} onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: c.bg }}>
        <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 32 }} showsVerticalScrollIndicator={false}>
          <Animated.View key={cur.id} entering={FadeIn.duration(motion.base)}>
            <View style={{ height: 300, overflow: 'hidden' }}>
              <ProblemPhoto p={cur} height={300} iconSize={56} />
            </View>
            {credit ? <T style={{ fontSize: 11, color: c.textMuted, paddingHorizontal: 20, paddingTop: 6 }}>{credit}</T> : null}
            {admin.enabled ? (
              // TEMPORARY editing tools (lib/admin.ts)
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 20, paddingTop: 12 }}>
                <PressableScale accessibilityRole="button" onPress={async () => { const uri = await pickPhoto(); if (uri) admin.setPhoto(cur.id, uri); }}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: c.accent }}>
                  <Camera size={16} color={c.onAccent} />
                  <T style={{ fontSize: 13, fontFamily: fonts.semi, color: c.onAccent }}>{lang === 'bm' ? 'Tambah / tukar foto' : 'Add / change photo'}</T>
                </PressableScale>
                {admin.photos[cur.id] && !('stack' in cur) ? (
                  <PressableScale accessibilityRole="button" onPress={() => admin.setPhoto(cur.id, null)}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
                    <Trash2 size={16} color={c.onRose} />
                    <T style={{ fontSize: 13, color: c.onRose }}>{lang === 'bm' ? 'Buang foto baru' : 'Remove new photo'}</T>
                  </PressableScale>
                ) : null}
                {'stack' in cur ? (
                  <>
                    <PressableScale accessibilityRole="button" onPress={() => { close(); onEdit(cur as CustomProblem); }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
                      <Pencil size={16} color={c.text} />
                      <T style={{ fontSize: 13 }}>{lang === 'bm' ? 'Ubah' : 'Edit'}</T>
                    </PressableScale>
                    <PressableScale accessibilityRole="button" onPress={() => { admin.remove(cur.id); close(); }}
                      style={{ flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 40, paddingHorizontal: 14, borderRadius: radius.pill, backgroundColor: c.surface, borderWidth: 1, borderColor: c.border }}>
                      <Trash2 size={16} color={c.onRose} />
                      <T style={{ fontSize: 13, color: c.onRose }}>{lang === 'bm' ? 'Padam' : 'Delete'}</T>
                    </PressableScale>
                  </>
                ) : null}
              </View>
            ) : null}
            <View style={{ padding: 20, gap: 16, width: '100%', maxWidth: 560, alignSelf: 'center' }}>
              <View style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: radius.pill, backgroundColor: tt.bg, borderWidth: 1, borderColor: c.border }}>
                  <Icon size={14} color={tt.fg} strokeWidth={2.4} />
                  <T style={{ fontSize: 12, fontFamily: fonts.bold, color: tt.fg }}>{tagLabel}</T>
                </View>
                <Display style={{ fontSize: 28, lineHeight: 33 }}>{cur.title[lang]}</Display>
                <T style={{ fontSize: 13, color: c.textMuted, fontStyle: 'italic' }}>{cur.term}</T>
              </View>
              <View style={{ gap: 6 }}>
                <Eyebrow color={c.textMuted}>{t.looks}</Eyebrow>
                <T style={{ fontSize: 16, lineHeight: 24 }}>{cur.looks[lang]}</T>
              </View>
              <View style={{ gap: 6, padding: 16, borderRadius: radius.tile, backgroundColor: tt.bg, borderWidth: 1, borderColor: c.border }}>
                <Eyebrow color={tt.fg}>{t.todo}</Eyebrow>
                <T style={{ fontSize: 16, lineHeight: 24, color: tt.fg }}>{cur.todo[lang]}</T>
              </View>
              <Disclaimer />
            </View>
          </Animated.View>
        </ScrollView>

        {/* close + flip through this stack */}
        <View style={{ position: 'absolute', top: insets.top + 12, right: 16 }}>
          <PressableScale accessibilityRole="button" accessibilityLabel={t.close} onPress={close} hitSlop={8} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(11,10,26,0.7)', borderWidth: 1, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
            <X size={22} color="#FFFFFF" strokeWidth={2.2} />
          </PressableScale>
        </View>
        {list.length > 1 ? (
          <View style={{ position: 'absolute', top: 254, left: 16, right: 16, flexDirection: 'row', justifyContent: 'space-between' }}>
            <PressableScale accessibilityRole="button" accessibilityLabel={lang === 'bm' ? 'Sebelum' : 'Previous'} onPress={() => step(-1)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(11,10,26,0.7)', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={22} color="#FFFFFF" />
            </PressableScale>
            <PressableScale accessibilityRole="button" accessibilityLabel={lang === 'bm' ? 'Seterusnya' : 'Next'} onPress={() => step(1)} style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(11,10,26,0.7)', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={22} color="#FFFFFF" />
            </PressableScale>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

export default function Problems() {
  const { c } = useTheme();
  const { t, lang } = useStore();
  const [open, setOpen] = useState<{ p: Problem; list: Problem[] } | null>(null);
  const admin = useAdmin();
  const [adding, setAdding] = useState<{ stack: string; editing?: CustomProblem } | null>(null);
  const rose = tint(c, 'rose');
  const sky = tint(c, 'sky');
  const rows = [problemStacks.slice(0, 2), problemStacks.slice(2, 4)];

  return (
    <Screen title={t.probTitle} subtitle={t.probSub}>
      {admin.enabled ? (
        // TEMPORARY editing tools (lib/admin.ts): send everything to Claude as one file
        <View style={{ padding: 16, gap: 10, borderRadius: radius.card, backgroundColor: c.accentSoft, borderWidth: 1, borderColor: 'rgba(255,122,176,0.45)' }}>
          <T style={{ fontFamily: fonts.display, fontSize: 16, color: c.accentText }}>
            {lang === 'bm' ? 'Mod tambah (sementara)' : 'Editing mode (temporary)'} · {admin.count}
          </T>
          <T style={{ fontSize: 13, lineHeight: 19, color: c.text }}>
            {lang === 'bm'
              ? 'Tekan + untuk tambah keadaan, atau buka kad untuk tambah foto. Siap? Hantar fail kepada Claude.'
              : 'Tap + to add a condition, or open a card to add a photo. Done? Send the file to Claude.'}
          </T>
          <PressableScale
            accessibilityRole="button"
            onPress={() => {
              haptic.soft();
              exportAdmin();
            }}
            style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 46, borderRadius: radius.pill, backgroundColor: c.accent, opacity: admin.count ? 1 : 0.4 }}>
            <Send size={17} color={c.onAccent} />
            <T style={{ fontFamily: fonts.semi, color: c.onAccent }}>{lang === 'bm' ? 'Simpan fail untuk Claude' : 'Save file for Claude'}</T>
          </PressableScale>
        </View>
      ) : null}
      <Animated.View entering={enter(1)} style={{ padding: 16, gap: 8, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: rose.bg, borderWidth: 1, borderColor: c.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Siren size={20} color={rose.fg} strokeWidth={2} />
          <T style={{ flex: 1, fontFamily: fonts.display, fontSize: 16, color: rose.fg }}>{t.urgentTitle}</T>
        </View>
        {urgentList[lang].map((u) => (
          <Bullet key={u} dot={rose.fg} color={rose.fg}>{u}</Bullet>
        ))}
      </Animated.View>

      {rows.map((row, r) => (
        <Animated.View key={r} entering={enter(r + 2)} style={{ flexDirection: 'row', gap: 12 }}>
          {row.map((st, k) => (
            <SmartStack
              key={st.id}
              title={st[lang]}
              items={[...st.items.map((id) => byId[id]).filter(Boolean), ...admin.custom.filter((x) => x.stack === st.id)]}
              onAdd={admin.enabled ? () => setAdding({ stack: st.id }) : undefined}
              autoDelay={(r * 2 + k) * 1500}
              onOpen={(p, list) => setOpen({ p, list })}
            />
          ))}
        </Animated.View>
      ))}

      <Animated.View entering={enter(4)} style={{ flexDirection: 'row', gap: 14, padding: 18, borderRadius: radius.card, borderCurve: 'continuous', backgroundColor: sky.bg, borderWidth: 1, borderColor: c.border }}>
        <Phone size={21} color={sky.fg} strokeWidth={2} />
        <View style={{ flex: 1, gap: 4 }}>
          <T style={{ fontFamily: fonts.display, fontSize: 16, color: sky.fg }}>{t.callTitle}</T>
          <T style={{ fontSize: 14, lineHeight: 21, color: sky.fg }}>{t.callBody}</T>
        </View>
      </Animated.View>
      <Disclaimer />

      <ProblemSheet open={open} onClose={() => setOpen(null)} onEdit={(p) => setAdding({ stack: p.stack, editing: p })} />
      <ProblemEditor stack={adding?.stack ?? null} editing={adding?.editing} onClose={() => setAdding(null)} />
    </Screen>
  );
}
