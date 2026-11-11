import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { T, ToothIcon, c, f } from '@/components/ui';
import { useStore } from '@/lib/store';

const options = [
  { lang: 'bm' as const, name: 'Bahasa Melayu', sub: 'Bahasa mudah, senang faham' },
  { lang: 'en' as const, name: 'English', sub: 'Plain, everyday words' },
];

export default function Welcome() {
  const { t, lang, setLang, finishWelcome } = useStore();
  const insets = useSafeAreaInsets();

  const start = () => {
    finishWelcome();
    router.replace('/');
  };

  return (
    <ScrollView
      style={{ backgroundColor: c.bg }}
      contentContainerStyle={[s.wrap, { paddingTop: insets.top + 56, paddingBottom: insets.bottom + 32 }]}>
      <View style={s.inner}>
        <View style={{ gap: 20 }}>
          <View style={s.logo}>
            <ToothIcon size={34} strokeWidth={1.6} />
          </View>
          <T style={{ fontFamily: f.semi, fontSize: 15, color: c.primary, letterSpacing: 0.3 }}>Tumbuh</T>
          <T accessibilityRole="header" style={{ fontFamily: f.bold, fontSize: 32, lineHeight: 37, letterSpacing: -0.6 }}>
            {t.welcomeTitle}
          </T>
          <T style={{ fontSize: 16, lineHeight: 25, color: c.muted }}>{t.welcomeSub}</T>
        </View>

        <View style={{ gap: 12 }}>
          <T style={{ fontFamily: f.semi, fontSize: 13, color: c.muted }}>{t.chooseLang}</T>
          {options.map((o) => {
            const on = lang === o.lang;
            return (
              <Pressable
                key={o.lang}
                accessibilityRole="radio"
                accessibilityState={{ checked: on }}
                onPress={() => setLang(o.lang)}
                style={[s.option, on && s.optionOn]}>
                <View style={{ gap: 2 }}>
                  <T style={{ fontFamily: f.semi, fontSize: 16 }}>{o.name}</T>
                  <T style={{ fontSize: 13, color: c.muted }}>{o.sub}</T>
                </View>
                {on ? <Check size={22} color={c.primary} strokeWidth={2.4} /> : null}
              </Pressable>
            );
          })}
          <Pressable accessibilityRole="button" onPress={start} style={s.start}>
            <T style={{ fontFamily: f.semi, fontSize: 16, color: '#FFFFFF' }}>{t.start}</T>
          </Pressable>
          <T style={{ fontSize: 12, lineHeight: 18, color: c.faint, textAlign: 'center', marginTop: 4 }}>{t.disclaimer}</T>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  wrap: { flexGrow: 1, paddingHorizontal: 24 },
  inner: { flex: 1, width: '100%', maxWidth: 480, alignSelf: 'center', justifyContent: 'space-between', gap: 40 },
  logo: { width: 64, height: 64, borderRadius: 20, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    minHeight: 64, paddingVertical: 14, paddingHorizontal: 18, borderRadius: 16,
    borderWidth: 1.5, borderColor: c.outline, backgroundColor: c.surface,
  },
  optionOn: { borderColor: c.primary, backgroundColor: c.primaryTint },
  start: { marginTop: 12, minHeight: 54, borderRadius: 999, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
});
