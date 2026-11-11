import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { Bullet, Chevron, Disclaimer, Eyebrow, Screen, T, c, f } from '@/components/ui';
import { learn } from '@/lib/content';
import { useStore } from '@/lib/store';

export default function Learn() {
  const { t, lang } = useStore();
  const [open, setOpen] = useState<Record<string, boolean>>({ '0-1': true });

  return (
    <Screen title={t.learnTitle} subtitle={t.learnSub}>
      {learn[lang].map((sec, si) => (
        <View key={sec.title} style={{ gap: 8, marginTop: 4 }}>
          <View style={{ marginLeft: 4 }}>
            <Eyebrow>{sec.title}</Eyebrow>
          </View>
          <View style={s.group}>
            {sec.items.map((it, ii) => {
              const key = `${si}-${ii}`;
              const isOpen = !!open[key];
              const last = ii === sec.items.length - 1;
              return (
                <View key={key} style={!last && { borderBottomWidth: 1, borderBottomColor: c.line }}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ expanded: isOpen }}
                    onPress={() => setOpen((o) => ({ ...o, [key]: !isOpen }))}
                    style={s.head}>
                    <T style={{ flex: 1, fontFamily: f.semi }}>{it.title}</T>
                    <Chevron open={isOpen} />
                  </Pressable>
                  {isOpen ? (
                    <View style={s.body}>
                      {it.points.map((p) => (
                        <Bullet key={p}>{p}</Bullet>
                      ))}
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      ))}
      <Disclaimer />
    </Screen>
  );
}

const s = StyleSheet.create({
  group: { backgroundColor: c.surface, borderWidth: 1, borderColor: c.border, borderRadius: 18, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 54, paddingVertical: 12, paddingHorizontal: 16 },
  body: { gap: 10, paddingHorizontal: 16, paddingBottom: 16 },
});
