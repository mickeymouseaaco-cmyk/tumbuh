import { CircleAlert } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Bullet, Chevron, Disclaimer, Eyebrow, Screen, T, c, f } from '@/components/ui';
import { problems, urgentList, type Tag } from '@/lib/content';
import { useStore } from '@/lib/store';

type Filter = 'all' | Tag;

export default function Problems() {
  const { t, lang } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<Record<string, boolean>>({ ecc: true });

  const tags: Record<Tag, { bg: string; fg: string; label: string }> = {
    ok: { bg: c.sage, fg: c.onSage, label: t.fOk },
    check: { bg: c.amber, fg: c.onAmber, label: t.fCheck },
    urgent: { bg: c.rose, fg: c.onRose, label: t.fUrgent },
  };
  const filters: [Filter, string][] = [['all', t.fAll], ['ok', t.fOk], ['check', t.fCheck], ['urgent', t.fUrgent]];
  const list = problems.filter((p) => filter === 'all' || p.tag === filter);

  return (
    <Screen title={t.probTitle} subtitle={t.probSub}>
      <View style={s.urgent}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <CircleAlert size={20} color={c.onRose} strokeWidth={2} />
          <T style={{ fontFamily: f.bold, color: c.onRose }}>{t.urgentTitle}</T>
        </View>
        {urgentList[lang].map((u) => (
          <Bullet key={u} dot={c.onRose} color="#3A1E1A">{u}</Bullet>
        ))}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {filters.map(([k, label]) => {
          const on = filter === k;
          return (
            <Pressable
              key={k}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => setFilter(k)}
              style={[s.chip, on && { backgroundColor: c.text, borderColor: c.text }]}>
              <T style={{ fontSize: 13, fontFamily: f.semi, color: on ? '#FFFFFF' : c.text }}>{label}</T>
            </Pressable>
          );
        })}
      </View>

      {list.map((p) => {
        const isOpen = !!open[p.id];
        const tag = tags[p.tag];
        return (
          <View key={p.id} style={s.card}>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ expanded: isOpen }}
              onPress={() => setOpen((o) => ({ ...o, [p.id]: !isOpen }))}
              style={s.head}>
              <View style={{ flex: 1, gap: 6 }}>
                <T style={{ fontFamily: f.bold }}>{p.title[lang]}</T>
                <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                  <View style={{ paddingVertical: 3, paddingHorizontal: 9, borderRadius: 999, backgroundColor: tag.bg }}>
                    <T style={{ fontSize: 11, fontFamily: f.bold, color: tag.fg }}>{tag.label}</T>
                  </View>
                  <T style={{ fontSize: 12, color: c.faint, fontStyle: 'italic' }}>{p.term}</T>
                </View>
              </View>
              <Chevron open={isOpen} />
            </Pressable>
            {isOpen ? (
              <View style={{ gap: 12, paddingHorizontal: 16, paddingBottom: 16 }}>
                <View style={{ gap: 4 }}>
                  <Eyebrow color={c.muted}>{t.looks}</Eyebrow>
                  <T style={{ fontSize: 14, lineHeight: 21, color: c.body }}>{p.looks[lang]}</T>
                </View>
                <View style={s.todo}>
                  <Eyebrow>{t.todo}</Eyebrow>
                  <T style={{ fontSize: 14, lineHeight: 21 }}>{p.todo[lang]}</T>
                </View>
              </View>
            ) : null}
          </View>
        );
      })}
      <Disclaimer />
    </Screen>
  );
}

const s = StyleSheet.create({
  urgent: { backgroundColor: c.rose, borderRadius: 18, padding: 16, gap: 8 },
  chip: { minHeight: 38, paddingHorizontal: 14, borderRadius: 999, borderWidth: 1, borderColor: c.outline, backgroundColor: c.surface, justifyContent: 'center' },
  card: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 18, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16 },
  todo: { gap: 4, backgroundColor: '#F5F7F6', borderRadius: 12, padding: 12 },
});
