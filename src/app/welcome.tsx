import { Check, ChevronLeft, Minus, Plus } from 'lucide-react-native';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInLeft, FadeInRight, FadeOut, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { TeethHalo } from '@/components/mascot';
import { Button, Display, PressableScale, T } from '@/components/ui';
import { fill } from '@/lib/content';
import { haptic } from '@/lib/haptics';
import { useStore } from '@/lib/store';
import { fonts, motion, radius, useTheme } from '@/theme';

const DEMO = { 'L-c-R': true, 'L-c-L': true, 'U-c-R': true, 'U-c-L': true };
const QUICK_AGES = [0, 3, 6, 9, 12, 18, 24, 36];

const langs = [
  { lang: 'bm' as const, name: 'Bahasa Melayu', sub: 'Bahasa mudah, senang faham' },
  { lang: 'en' as const, name: 'English', sub: 'Plain, everyday words' },
];

export default function Welcome() {
  const { c } = useTheme();
  const { t, lang, setLang, babyName, setName, name, age, setAge, addAge, finishWelcome } = useStore();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(n);
    haptic.soft();
  };
  const finish = () => {
    haptic.success();
    // The root Gate moves to Home once `onboarded` is saved, so the two never race.
    finishWelcome();
  };
  const entering = (dir === 1 ? FadeInRight : FadeInLeft).duration(motion.enter).easing(motion.ease);

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: c.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20, paddingHorizontal: 24 }}>
        <View style={{ width: '100%', maxWidth: 480, alignSelf: 'center', flex: 1 }}>
          {/* top row: back + progress */}
          <View style={{ height: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            {step > 0 ? (
              <Pressable accessibilityRole="button" accessibilityLabel={t.back} onPress={() => go(step - 1)} hitSlop={8} style={{ width: 44, height: 44, justifyContent: 'center' }}>
                <ChevronLeft size={26} color={c.text} />
              </Pressable>
            ) : (
              <View style={{ width: 44 }} />
            )}
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {[0, 1, 2].map((i) => (
                <Animated.View
                  key={i}
                  layout={LinearTransition.duration(motion.base).easing(motion.ease)}
                  style={{ width: i === step ? 24 : 8, height: 8, borderRadius: 4, backgroundColor: i <= step ? c.accent : c.track }}
                />
              ))}
            </View>
            {step === 1 ? (
              <Pressable accessibilityRole="button" onPress={() => go(2)} hitSlop={8} style={{ minWidth: 44, height: 44, alignItems: 'flex-end', justifyContent: 'center' }}>
                <T style={{ fontFamily: fonts.semi, color: c.textMuted }}>{t.skip}</T>
              </Pressable>
            ) : (
              <View style={{ width: 44 }} />
            )}
          </View>

          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingVertical: 16 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {step === 0 ? (
              <Animated.View key="s0" entering={entering} exiting={FadeOut.duration(140)} style={{ gap: 24 }}>
                <Animated.View entering={FadeIn.duration(600)} style={{ alignSelf: 'center' }}>
                  <TeethHalo erupted={DEMO} age={age} size={200} />
                </Animated.View>
                <View style={{ gap: 10 }}>
                  <Display style={{ fontSize: 34, lineHeight: 40, textAlign: 'center' }}>{t.welcomeTitle}</Display>
                  <T style={{ fontSize: 16, lineHeight: 24, color: c.textMuted, textAlign: 'center' }}>{t.welcomeSub}</T>
                </View>
                <View style={{ gap: 10 }}>
                  <T style={{ fontFamily: fonts.semi, fontSize: 13, color: c.textMuted, textAlign: 'center' }}>{t.chooseLang}</T>
                  {langs.map((o) => {
                    const on = lang === o.lang;
                    return (
                      <PressableScale
                        key={o.lang}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: on }}
                        onPress={() => {
                          if (!on) haptic.tap();
                          setLang(o.lang);
                        }}
                        style={{
                          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                          minHeight: 66, paddingVertical: 14, paddingHorizontal: 18,
                          borderRadius: radius.tile, borderCurve: 'continuous', borderWidth: 2,
                          borderColor: on ? c.accent : c.border, backgroundColor: on ? c.accentSoft : c.surface,
                        }}>
                        <View style={{ gap: 2 }}>
                          <T style={{ fontFamily: fonts.semi, fontSize: 16 }}>{o.name}</T>
                          <T style={{ fontSize: 13, color: c.textMuted }}>{o.sub}</T>
                        </View>
                        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: on ? c.accent : 'transparent', borderWidth: on ? 0 : 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' }}>
                          {on ? <Check size={16} color={c.onAccent} strokeWidth={3} /> : null}
                        </View>
                      </PressableScale>
                    );
                  })}
                </View>
              </Animated.View>
            ) : null}

            {step === 1 ? (
              <Animated.View key="s1" entering={entering} exiting={FadeOut.duration(140)} style={{ gap: 20 }}>
                <Display style={{ fontSize: 32, lineHeight: 38 }}>{t.nameQ}</Display>
                <T style={{ fontSize: 16, lineHeight: 24, color: c.textMuted }}>{t.nameHint}</T>
                <TextInput
                  defaultValue={babyName}
                  onChangeText={setName}
                  placeholder={t.namePlaceholder}
                  placeholderTextColor={c.textMuted}
                  autoFocus={Platform.OS !== 'web'}
                  autoCapitalize="words"
                  returnKeyType="next"
                  onSubmitEditing={() => go(2)}
                  maxLength={24}
                  accessibilityLabel={t.namePlaceholder}
                  style={{
                    fontFamily: fonts.display, fontSize: 28, color: c.text,
                    minHeight: 68, paddingHorizontal: 20, borderRadius: radius.tile, borderCurve: 'continuous',
                    backgroundColor: c.surface, borderWidth: 2, borderColor: c.border,
                  }}
                />
              </Animated.View>
            ) : null}

            {step === 2 ? (
              <Animated.View key="s2" entering={entering} exiting={FadeOut.duration(140)} style={{ gap: 20 }}>
                <Display style={{ fontSize: 32, lineHeight: 38 }}>{fill(t.ageQ, { name })}</Display>
                <T style={{ fontSize: 16, lineHeight: 24, color: c.textMuted }}>{t.ageHint}</T>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.surface, borderRadius: radius.card, borderCurve: 'continuous', padding: 16 }}>
                  <PressableScale accessibilityRole="button" accessibilityLabel={t.ageDown} onPress={() => { haptic.tap(); addAge(-1); }} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Minus size={24} color={c.accentText} strokeWidth={2.4} />
                  </PressableScale>
                  <View style={{ alignItems: 'center' }}>
                    <Animated.View key={age} entering={FadeIn.duration(180)}>
                      <Display style={{ fontSize: 64, lineHeight: 70, fontVariant: ['tabular-nums'], color: c.accentText }}>{age}</Display>
                    </Animated.View>
                    <T style={{ fontFamily: fonts.semi, color: c.textMuted }}>{t.months}</T>
                  </View>
                  <PressableScale accessibilityRole="button" accessibilityLabel={t.ageUp} onPress={() => { haptic.tap(); addAge(1); }} style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                    <Plus size={24} color={c.accentText} strokeWidth={2.4} />
                  </PressableScale>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
                  {QUICK_AGES.map((a) => {
                    const on = a === age;
                    return (
                      <PressableScale
                        key={a}
                        accessibilityRole="button"
                        accessibilityState={{ selected: on }}
                        onPress={() => { haptic.tap(); setAge(a); }}
                        style={{ minWidth: 56, minHeight: 44, paddingHorizontal: 14, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? c.accent : c.surface, borderWidth: on ? 0 : 1, borderColor: c.border }}>
                        <T style={{ fontFamily: fonts.semi, color: on ? c.onAccent : c.text }}>{a}</T>
                      </PressableScale>
                    );
                  })}
                </View>
              </Animated.View>
            ) : null}
          </ScrollView>

          <View style={{ gap: 10 }}>
            {step < 2 ? <Button label={t.next} onPress={() => go(step + 1)} /> : <Button label={t.start} onPress={finish} />}
            {step === 0 ? <T style={{ fontSize: 12, lineHeight: 18, color: c.textMuted, textAlign: 'center' }}>{t.disclaimer}</T> : null}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
